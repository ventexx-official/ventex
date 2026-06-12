import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSupabaseAdmin } from '@/lib/supabase-admin';
import { getRequestOrigin } from '@/lib/api-security';

const supabaseAdmin = createSupabaseAdmin();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('account');

  const origin = getRequestOrigin(req);

  if (!accountId) {
    return NextResponse.redirect(`${origin}/founder/become-seller?step=stripe&error=missing_params`);
  }

  try {
    // Retrieve the account to check onboarding status
    const account = await stripe.accounts.retrieve(accountId);
    const userId = typeof account.metadata?.ventex_user_id === 'string' ? account.metadata.ventex_user_id : null;

    if (!userId) {
      return NextResponse.redirect(`${origin}/founder/become-seller?step=stripe&error=account_mismatch`);
    }

    if (account.charges_enabled) {
      // Fully onboarded  -  mark as seller
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
      // Onboarding incomplete  -  send back to step 2 with a message
      return NextResponse.redirect(`${origin}/founder/become-seller?step=stripe&error=incomplete`);
    }
  } catch (err: any) {
    console.error('[connect-return]', err);
    return NextResponse.redirect(`${origin}/founder/become-seller?step=stripe&error=${encodeURIComponent(err.message)}`);
  }
}
