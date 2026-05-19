import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { priceId, userId } = await req.json();

    if (!priceId || !userId) {
      return new NextResponse('Missing priceId or userId', { status: 400 });
    }

    // Get user from Supabase
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id, full_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return new NextResponse('User not found', { status: 404 });
    }

    let customerId = user.stripe_customer_id;

    if (!customerId) {
      // Create a Stripe customer
      const customer = await stripe.customers.create({
        metadata: {
          supabaseUUID: userId,
        },
        name: user.full_name || undefined,
      });
      
      customerId = customer.id;

      // Save customer ID in Supabase
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing`,
      metadata: {
        userId,
        priceId, // Useful for the webhook to determine which tier was bought
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
