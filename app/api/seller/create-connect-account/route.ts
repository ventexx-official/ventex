import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }

    // Check if user already has a Connect account
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('stripe_connect_id')
      .eq('id', userId)
      .single();

    let accountId = userRecord?.stripe_connect_id;

    if (!accountId) {
      // Create a new Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: { ventex_user_id: userId },
      });
      accountId = account.id;

      // Persist the account ID immediately
      await supabaseAdmin
        .from('users')
        .update({ stripe_connect_id: accountId })
        .eq('id', userId);
    }

    // Create onboarding link
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/founder/become-seller?step=stripe&refresh=true`,
      return_url: `${origin}/api/seller/connect-return?account=${accountId}&userId=${userId}`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error('[create-connect-account]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
