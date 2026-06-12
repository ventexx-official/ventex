import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { getRequestOrigin, requireUser } from '@/lib/api-security';

const supabaseAdmin = createSupabaseAdmin();

export async function POST(req: Request) {
  try {
    const auth = await requireUser(req);
    if (auth.error || !auth.user) return auth.error;

    const userId = auth.user.id;
    const email = auth.user.email;
    if (!email) return NextResponse.json({ error: 'Account email is required' }, { status: 400 });

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
    const origin = getRequestOrigin(req);
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/founder/become-seller?step=stripe&refresh=true`,
      return_url: `${origin}/api/seller/connect-return?account=${accountId}`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error('[create-connect-account]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
