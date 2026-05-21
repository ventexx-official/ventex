import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to fire email via internal API
async function sendEmail(type: string, recipientEmail: string, data: Record<string, any>) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, recipientEmail, data }),
    });
    if (!res.ok) {
      console.error('[sendEmail error] API returned non-200:', await res.text());
    }
  } catch (e) {
    console.error('[sendEmail error]', e);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const buyerId = session.metadata?.buyerId;
      const sellerId = session.metadata?.sellerId;
      const promoCodeId = session.metadata?.promoCodeId;
      const cartItemIds = session.metadata?.cartItemIds ? JSON.parse(session.metadata.cartItemIds) : [];
      const productDetails = session.metadata?.productDetails ? JSON.parse(session.metadata.productDetails) : [];

      if (!buyerId || !sellerId || productDetails.length === 0) {
        console.warn('[Webhook] Missing essential metadata in session:', session.id);
        return new NextResponse('Missing metadata', { status: 200 }); // Return 200 to Stripe to avoid retries
      }

      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent as any)?.id || '';

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      // 1. Process each purchased item
      for (const detail of productDetails) {
        const orderId = crypto.randomUUID();
        
        // Fetch product info to check if digital
        const { data: prod } = await supabaseAdmin
          .from('products')
          .select('name, category, sales_count')
          .eq('id', detail.productId)
          .single();

        const isDigital = prod?.category === 'Software' || prod?.category === 'Templates';
        const downloadUrl = isDigital 
          ? `${siteUrl}/api/marketplace/download/${orderId}`
          : null;

        // Create the order row in Supabase
        const { error: orderError } = await supabaseAdmin
          .from('orders')
          .insert({
            id: orderId,
            buyer_id: buyerId,
            seller_id: sellerId,
            product_id: detail.productId,
            amount_paid: detail.amountPaid, // INR base
            ventex_fee: detail.ventexFee,   // 5% in INR
            seller_payout: detail.sellerPayout, // 95% in INR
            stripe_payment_id: paymentIntentId,
            stripe_session_id: session.id,
            status: 'paid',
            download_url: downloadUrl,
            download_count: 0
          });

        if (orderError) {
          console.error('[Webhook] Error creating order row:', orderError);
          throw orderError;
        }

        // Update product sales count
        await supabaseAdmin
          .from('products')
          .update({ sales_count: (prod?.sales_count || 0) + detail.quantity })
          .eq('id', detail.productId);

        // Send buyer notification
        await supabaseAdmin.from('notifications').insert({
          user_id: buyerId,
          type: 'order_success',
          message: `Your purchase of ${prod?.name || 'product'} was successful!`,
          link: `/orders`
        });

        // Send seller notification
        await supabaseAdmin.from('notifications').insert({
          user_id: sellerId,
          type: 'product_sold',
          message: `You sold a copy of ${prod?.name || 'product'}!`,
          link: `/founder/dashboard`
        });
      }

      // 2. Clear purchased items from the buyer's cart
      if (cartItemIds.length > 0) {
        const { error: deleteCartError } = await supabaseAdmin
          .from('cart_items')
          .delete()
          .in('id', cartItemIds);

        if (deleteCartError) {
          console.error('[Webhook] Error deleting purchased cart items:', deleteCartError);
        }
      }

      // 3. Increment promo code usage
      if (promoCodeId) {
        try {
          const { data: promo } = await supabaseAdmin
            .from('promo_codes')
            .select('used_count')
            .eq('id', promoCodeId)
            .single();
          
          if (promo) {
            const { error: promoUpdateError } = await supabaseAdmin
              .from('promo_codes')
              .update({ used_count: (promo.used_count || 0) + 1 })
              .eq('id', promoCodeId);
            
            if (promoUpdateError) {
              console.error('[Webhook] Error updating promo code usage count:', promoUpdateError);
            }
          }
        } catch (promoErr) {
          console.error('[Webhook] Error incrementing promo usage count:', promoErr);
        }
      }

      // 3. Fetch buyer and seller emails for notifications
      let buyerEmail = session.customer_details?.email || '';
      if (!buyerEmail) {
        try {
          const { data: authBuyer } = await supabaseAdmin.auth.admin.getUserById(buyerId);
          if (authBuyer?.user?.email) buyerEmail = authBuyer.user.email;
        } catch (e) {
          console.warn('[Webhook] Could not fetch buyer email from auth admin:', e);
        }
      }

      let sellerEmail = '';
      try {
        const { data: authSeller } = await supabaseAdmin.auth.admin.getUserById(sellerId);
        if (authSeller?.user?.email) sellerEmail = authSeller.user.email;
      } catch (e) {
        console.warn('[Webhook] Could not fetch seller email from auth admin:', e);
      }

      // 4. Send email notifications (non-blocking)
      for (const detail of productDetails) {
        const { data: prod } = await supabaseAdmin
          .from('products')
          .select('name')
          .eq('id', detail.productId)
          .single();

        const productName = prod?.name || 'Ventex Product';

        if (buyerEmail) {
          await sendEmail('order_confirmation', buyerEmail, {
            productName,
            amount: detail.amountPaid * 100, // Email expects cents/paise
            orderId: session.id,
          });
        }

        if (sellerEmail) {
          await sendEmail('product_sold', sellerEmail, {
            productName,
            amount: detail.amountPaid * 100, // Email expects cents/paise
            payout: detail.sellerPayout * 100, // Email expects cents/paise
          });
        }
      }
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error: any) {
    console.error('Error processing marketplace webhook:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
