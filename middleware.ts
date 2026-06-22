import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/', '/discover', '/marketplace', '/events', '/about', '/catalyst', '/contact',
  '/investors', '/terms', '/privacy', '/seller-agreement', '/refund-policy', '/delivery-policy',
  '/login', '/signup', '/auth/callback'
];

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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
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

  const { pathname } = request.nextUrl;
  
  // Block bots from protected paths
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
  if (isBot) {
    const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(`${r}/`));
    if (!isPublic) return new NextResponse('Forbidden', { status: 403 });
  }

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();

  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(`${r}/`));
  const isProtected = !isPublic && !pathname.startsWith('/api') && !pathname.startsWith('/onboarding') && !pathname.startsWith('/auth') && !pathname.startsWith('/intelligence');

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Role routing enforcement in Middleware
  if (user && isProtected) {
     const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
     if (profile?.role) {
       const role = profile.role;
       if (pathname.startsWith('/founder') && role !== 'founder' && role !== 'admin') {
         return NextResponse.redirect(new URL('/discover', request.url));
       }
       if (pathname.startsWith('/investor') && role !== 'investor' && role !== 'admin') {
         return NextResponse.redirect(new URL('/discover', request.url));
       }
       if (pathname.startsWith('/admin') && role !== 'admin') {
         return NextResponse.redirect(new URL('/discover', request.url));
       }
     }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon-32x32.png|apple-touch-icon.png|robots.txt|sitemap.xml|site.webmanifest|og-image.png|icons/|api/).*)'],
};
