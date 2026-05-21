import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { cartItems, buyerId, discountPct = 0, promoCodeId = null } = await req.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || !buyerId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // 1. Fetch products and sellers from Supabase using service role (admin)
    const productIds = cartItems.map((item: any) => item.product_id || item.product?.id);
    
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

    const discountRate = 1 - discountPct / 100;

    const lineItems = targetSellerItems.map((item: any) => {
      const basePrice = getActivePrice(item.product);
      const discountedPrice = Math.round(basePrice * discountRate);
      
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
      const discountedPrice = Math.round(basePrice * discountRate);
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
        promoCodeId: promoCodeId || '',
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Error creating marketplace checkout session:', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
