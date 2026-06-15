import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

async function getValidatedDiscount(promoCodeId: string | null, productIds: string[]) {
  if (!promoCodeId) {
    return { discountPct: 0, promoCodeId: '' };
  }

  const { data: promo, error } = await supabaseAdmin
    .from('promo_codes')
    .select('*')
    .eq('id', promoCodeId)
    .single();

  if (error || !promo) {
    throw new Error('Invalid promo code.');
  }

  if (!promo.is_active) {
    throw new Error('This promo code is inactive.');
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    throw new Error('This promo code has expired.');
  }

  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    throw new Error('This promo code has reached its usage limit.');
  }

  if (promo.product_id && !productIds.includes(promo.product_id)) {
    throw new Error('This promo code is not applicable to the items in your cart.');
  }

  const discountPct = Number(promo.discount_pct);
  if (!Number.isFinite(discountPct) || discountPct < 0 || discountPct > 90) {
    throw new Error('Invalid promo discount.');
  }

  return { discountPct, promoCodeId: promo.id };
}

export async function POST(req: Request) {
  const { success, remaining } = rateLimit(req, 5, 60_000);
  if (!success) {
    return new NextResponse('Too many requests. Please try again later.', {
      status: 429,
      headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': String(remaining) },
    });
  }

  const origin = req.headers.get('origin');
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  if (origin && origin !== allowedOrigin) {
    return new NextResponse('Forbidden: Invalid Origin', { status: 403 });
  }

  try {
    const { cartItems, promoCodeId = null } = await req.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const buyerId = authUser.id;

    // 1. Fetch products and sellers from Supabase using service role (admin)
    const productIds = Array.from(new Set(cartItems.map((item: any) => item.product_id || item.product?.id).filter(Boolean)));
    if (productIds.length === 0) {
      return new NextResponse('Invalid cart items', { status: 400 });
    }

    const cartItemIds = cartItems.map((item: any) => item.id).filter(Boolean);
    if (cartItemIds.length > 0) {
      const { count, error: cartOwnershipError } = await supabaseAdmin
        .from('cart_items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', buyerId)
        .in('id', cartItemIds);

      if (cartOwnershipError || count !== cartItemIds.length) {
        return new NextResponse('Invalid cart ownership', { status: 403 });
      }
    }
    
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        price,
        discount_price,
        deal_end_date,
        images_urls,
        seller_id,
        seller:seller_id (
          stripe_connect_id,
          full_name
        )
      `)
      .in('id', productIds);

    if (productsError || !productsData || productsData.length === 0) {
      console.error('[Create Checkout] Error fetching products:', productsError);
      return new NextResponse('Products not found', { status: 404 });
    }

    // 2. Merge database products with quantity input
    const mergedItems = cartItems.map((inputItem: any) => {
      const pId = inputItem.product_id || inputItem.product?.id;
      const product = productsData.find((p: any) => p.id === pId);
      const dbCartItem = inputItem.id; // Preserve cart_items record ID if present
      return {
        id: dbCartItem,
        quantity: inputItem.quantity || 1,
        product,
      };
    }).filter((item: any) => item.product);

    if (mergedItems.length === 0) {
      return new NextResponse('Invalid cart items', { status: 400 });
    }

    // 3. Group by seller to enforce separate sessions per seller
    const groupedBySeller: Record<string, any[]> = {};
    mergedItems.forEach((item: any) => {
      const sellerId = item.product.seller_id;
      if (!groupedBySeller[sellerId]) {
        groupedBySeller[sellerId] = [];
      }
      groupedBySeller[sellerId].push(item);
    });

    const sellerIds = Object.keys(groupedBySeller);
    if (sellerIds.length === 0) {
      return new NextResponse('No sellers found for checkout', { status: 400 });
    }

    // Select the first seller's items to check out in this session
    const targetSellerId = sellerIds[0];
    if (targetSellerId === buyerId) {
      return new NextResponse('You cannot purchase your own products.', { status: 400 });
    }
    const targetSellerItems = groupedBySeller[targetSellerId];
    
    // Get the seller's Stripe Connect ID
    const sellerStripeConnectId = targetSellerItems[0].product.seller?.stripe_connect_id;
    if (!sellerStripeConnectId) {
      return new NextResponse(
        `Checkout unavailable: The seller ${targetSellerItems[0].product.seller?.full_name || 'for this product'} has not set up their Stripe payouts yet.`,
        { status: 400 }
      );
    }

    // 4. Calculate prices & construct line items in INR (paise)
    const getActivePrice = (product: any) => {
      const now = new Date();
      if (product.discount_price && product.deal_end_date && new Date(product.deal_end_date) > now) {
        return product.discount_price;
      }
      return product.price;
    };

    const validatedPromo = await getValidatedDiscount(promoCodeId, productIds);
    const discountRate = 1 - validatedPromo.discountPct / 100;

    const lineItems = targetSellerItems.map((item: any) => {
      const basePrice = getActivePrice(item.product);
      const discountedPrice = Math.max(1, Math.round(basePrice * discountRate));
      
      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.product.name,
            images: item.product.images_urls && item.product.images_urls.length > 0 
              ? [item.product.images_urls[0]] 
              : [],
          },
          unit_amount: discountedPrice * 100, // Stripe expects amount in paise for INR
        },
        quantity: item.quantity,
      };
    });

    // 5. Calculate 5% Commission Split and Payouts
    let totalApplicationFee = 0;
    const purchaseDetails = targetSellerItems.map((item: any) => {
      const basePrice = getActivePrice(item.product);
      const discountedPrice = Math.max(1, Math.round(basePrice * discountRate));
      const amountPaid = discountedPrice * item.quantity;
      const ventexFee = Math.round(amountPaid * 0.05); // 5% fee
      const sellerPayout = amountPaid - ventexFee; // 95% payout

      totalApplicationFee += ventexFee;

      return {
        productId: item.product.id,
        quantity: item.quantity,
        amountPaid, // Original amount in INR
        ventexFee,  // 5% fee in INR
        sellerPayout, // 95% payout in INR
      };
    });

    const totalApplicationFeePaise = Math.round(totalApplicationFee * 100);

    // 6. Retrieve buyer email for Stripe pre-filling
    let customerEmail: string | undefined = undefined;
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(buyerId);
      if (authUser?.user) {
        customerEmail = authUser.user.email;
      }
    } catch (e) {
      console.warn('[Create Checkout] Could not fetch buyer email from auth admin:', e);
    }

    // 7. Create Stripe Checkout Session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail,
      payment_intent_data: {
        application_fee_amount: totalApplicationFeePaise > 0 ? totalApplicationFeePaise : undefined,
        transfer_data: {
          destination: sellerStripeConnectId,
        },
      },
      success_url: `${siteUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
      metadata: {
        buyerId,
        sellerId: targetSellerId,
        cartItemIds: JSON.stringify(targetSellerItems.map((item: any) => item.id).filter(Boolean)),
        productDetails: JSON.stringify(purchaseDetails),
        promoCodeId: validatedPromo.promoCodeId,
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Error creating marketplace checkout session:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}