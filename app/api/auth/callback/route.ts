import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sanitizeNextUrl } from '@/lib/role-routing';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next');
  const safeNext = sanitizeNextUrl(rawNext);

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // Ignore in Server Component
            }
          },
        },
      }
    );
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session) {
      // Sync access token cookie
      cookieStore.set('sb-ventex-auth-token', data.session.access_token, {
        path: '/',
        maxAge: data.session.expires_in,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      // If user had a specific protected page they were trying to reach
      if (safeNext) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }

      // Check user's onboarding state from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_complete')
        .eq('id', data.session.user.id)
        .single();

      if (!profile || !profile.role || profile.role === 'visitor') {
        if (!profile?.onboarding_complete) {
          return NextResponse.redirect(`${origin}/onboarding/role`);
        }
      }

      if (profile && !profile.onboarding_complete) {
        switch (profile.role) {
          case 'founder':
            return NextResponse.redirect(`${origin}/onboarding/founder`);
          case 'investor':
            return NextResponse.redirect(`${origin}/onboarding/investor`);
          case 'buyer':
            return NextResponse.redirect(`${origin}/onboarding/buyer`);
          default:
            return NextResponse.redirect(`${origin}/onboarding/role`);
        }
      }

      // Returning user with onboarding complete
      switch (profile?.role) {
        case 'admin':
          return NextResponse.redirect(`${origin}/admin`);
        case 'founder':
          return NextResponse.redirect(`${origin}/founder/dashboard`);
        case 'investor':
          return NextResponse.redirect(`${origin}/investor/portal`);
        case 'buyer':
          return NextResponse.redirect(`${origin}/buyer/dashboard`);
        default:
          return NextResponse.redirect(`${origin}/discover`);
      }
    }
  }

  // Auth callback failed or code missing
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
