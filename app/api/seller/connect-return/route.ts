import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('account');
  const userId = searchParams.get('userId');

  const origin = req.headers.get('origin') ||
    (req.url.startsWith('http') ? new URL(req.url).origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

  if (!accountId || !userId) {
    return NextResponse.redirect(`${origin}/founder/become-seller?step=stripe&error=missing_params`);
  }

  try {
    // Retrieve the account to check onboarding status
    const account = await stripe.accounts.retrieve(accountId);

    if (account.charges_enabled) {
      // Fully onboarded — mark as seller
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          is_seller: true,
          stripe_connect_id: accountId,
        })
        .eq('id', userId);

      if (error) {
        console.error('[connect-return] DB update error:', error);
        return NextResponse.redirect(`${origin}/founder/become-seller?step=stripe&error=db_error`);
      }

      return NextResponse.redirect(`${origin}/founder/become-seller?step=complete`);
    } else {
      // Onboarding incomplete — send back to step 2 with a message
      return NextResponse.redirect(`${origin}/founder/become-seller?step=stripe&error=incomplete`);
    }
  } catch (err: any) {
    console.error('[connect-return]', err);
    return NextResponse.redirect(`${origin}/founder/become-seller?step=stripe&error=${encodeURIComponent(err.message)}`);
  }
}
