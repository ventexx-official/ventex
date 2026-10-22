import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isPublicRoute, isBypassedRoute } from '@/lib/routes';
import { getSignedInDestination } from '@/lib/role-routing';

const BOTS = ['GPTBot', 'ClaudeBot', 'anthropic', 'Googlebot', 'Bingbot', 'PerplexityBot'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname, search } = request.nextUrl;
  
  // Block bots from non-public paths
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
  if (isBot) {
    if (!isPublicRoute(pathname)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();

  // If a signed-in user opens /login, /signup, or /forgot-password, redirect to their destination
  const isAuthEntryPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
  if (user && isAuthEntryPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_complete, display_name, country')
      .eq('id', user.id)
      .single();

    const dest = getSignedInDestination(profile);
    return NextResponse.redirect(new URL(dest, request.url));
  }

  const isPublic = isPublicRoute(pathname);
  const isBypassed = isBypassedRoute(pathname);
  const isOnboarding = pathname.startsWith('/onboarding');
  const isWelcome = pathname.startsWith('/welcome');
  const isProtected = (!isPublic && !isBypassed) || isOnboarding || isWelcome;

  // Unauthenticated users trying to access protected paths go to /login?next=<path>
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const fullOriginalPath = pathname + search;
    url.search = `?next=${encodeURIComponent(fullOriginalPath)}`;
    return NextResponse.redirect(url);
  }

  // Role routing & onboarding guard enforcement for authenticated users
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_complete, display_name, country')
      .eq('id', user.id)
      .single();

    // 1. If onboarding is complete, /onboarding/* pages must redirect to the user's dashboard
    if (isOnboarding && profile?.onboarding_complete) {
      const dest = getSignedInDestination(profile);
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // 2. /welcome/* requires login and the matching role
    if (isWelcome) {
      const role = profile?.role;
      if (pathname.startsWith('/welcome/founder') && role !== 'founder' && role !== 'admin') {
        const dest = getSignedInDestination(profile);
        return NextResponse.redirect(new URL(dest, request.url));
      }
      if (pathname.startsWith('/welcome/investor') && role !== 'investor' && role !== 'admin') {
        const dest = getSignedInDestination(profile);
        return NextResponse.redirect(new URL(dest, request.url));
      }
      if (pathname.startsWith('/welcome/buyer') && role !== 'buyer' && role !== 'admin') {
        const dest = getSignedInDestination(profile);
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }

    // 3. Protected dashboard sections role checking
    if (profile?.role) {
      const role = profile.role;
      if (pathname.startsWith('/founder') && role !== 'founder' && role !== 'admin') {
        return NextResponse.redirect(new URL('/discover', request.url));
      }
      if (pathname.startsWith('/investor') && role !== 'investor' && role !== 'admin') {
        return NextResponse.redirect(new URL('/discover', request.url));
      }
      if (pathname.startsWith('/buyer') && role !== 'buyer' && role !== 'admin') {
        return NextResponse.redirect(new URL('/discover', request.url));
      }
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/discover', request.url));
      }
      if (pathname.startsWith('/explorer') && role !== 'visitor' && role !== 'admin') {
        const dest = getSignedInDestination(profile);
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon-32x32.png|apple-touch-icon.png|robots.txt|sitemap.xml|site.webmanifest|og-image.png|icons/|api/).*)'],
};
