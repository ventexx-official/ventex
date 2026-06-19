import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { createSupabaseAdmin } from '@/lib/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const productId = session.metadata?.productId;
      const buyerId = session.metadata?.buyerId;
      const sellerId = session.metadata?.sellerId;
      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
      
      // Calculate a basic 10% Ventex fee
      const ventexFee = Math.round(amountPaid * 0.10);
      const sellerPayout = amountPaid - ventexFee;

      try {
        const adminClient = createSupabaseAdmin();
        const { error } = await adminClient.from('orders').insert({
          buyer_id: buyerId,
          seller_id: sellerId,
          product_id: productId,
          amount_paid: amountPaid,
          ventex_fee: ventexFee,
          seller_payout: sellerPayout,
          stripe_payment_id: session.payment_intent as string,
          stripe_session_id: session.id,
          status: 'paid',
        });

        if (error) {
          console.error('Error inserting order:', error);
          // Don't return 500 here, acknowledge the webhook to Stripe, we can retry DB insertion separately if needed
        }
      } catch (adminError) {
        console.error('Admin client failed. Cannot insert order:', adminError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
