import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_PRICE_IDS = {
  ventex_access: process.env.STRIPE_PRICE_VENTEX_ACCESS,
  investor_premium: process.env.STRIPE_PRICE_INVESTOR_PREMIUM,
} as const;

async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function POST(req: Request) {
  const { success, remaining } = rateLimit(req, 8, 60_000);
  if (!success) {
    return new NextResponse('Too many requests. Please try again later.', {
      status: 429,
      headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': String(remaining) },
    });
  }

  try {
    const { plan } = await req.json();

    if (!plan || !(plan in PLAN_PRICE_IDS)) {
      return new NextResponse('Invalid plan', { status: 400 });
    }

    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const priceId = PLAN_PRICE_IDS[plan as keyof typeof PLAN_PRICE_IDS];
    if (!priceId) {
      return new NextResponse('Stripe price is not configured', { status: 500 });
    }

    const userId = authUser.id;

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
        plan,
        priceId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}