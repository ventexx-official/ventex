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
    await fetch(`${baseUrl}/api/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, recipientEmail, data }),
    });
  } catch (e) {
    console.error('[sendEmail error]', e);
  }
}

// We need an array of our specific price IDs to determine which tier the user bought.
// In a real app, these would come from env vars.
const VENTEX_ACCESS_PRICE_ID = 'price_ventex_access_placeholder';
const INVESTOR_PREMIUM_PRICE_ID = 'price_investor_premium_placeholder';

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

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = session.metadata?.userId;
        const priceId = session.metadata?.priceId;

        if (userId && priceId) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30);

          const updateData: any = {
            subscription_end_date: endDate.toISOString(),
          };

          if (priceId === VENTEX_ACCESS_PRICE_ID) {
            updateData.ventex_access = true;
          } else if (priceId === INVESTOR_PREMIUM_PRICE_ID) {
            updateData.investor_premium = true;
          }

          await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', userId);

          // Send welcome email on first payment
          const { data: userRow } = await supabaseAdmin
            .from('users')
            .select('full_name')
            .eq('id', userId)
            .single();

          const customerEmail = session.customer_details?.email;
          if (customerEmail) {
            await sendEmail('welcome', customerEmail, {
              name: userRow?.full_name || customerEmail.split('@')[0],
            });
          }
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by stripe_customer_id
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30);
          
          await supabaseAdmin
            .from('users')
            .update({
              subscription_end_date: endDate.toISOString()
            })
            .eq('id', user.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabaseAdmin
          .from('users')
          .update({
            ventex_access: false,
            investor_premium: false,
            // Optionally clear the end date or leave it for history
          })
          .eq('stripe_customer_id', customerId);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
