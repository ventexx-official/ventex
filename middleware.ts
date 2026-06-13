import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/my-pitches',
  '/my-store',
  '/messages',
  '/settings',
  '/founder',
  '/investor',
  '/buyer',
  '/booster-packs',
];

// Known AI bots and crawlers — block from private paths
const BOTS = ['GPTBot', 'ClaudeBot', 'anthropic', 'Googlebot', 'Bingbot', 'PerplexityBot'];

// Paths bots must not access
const BOT_BLOCKED_PATHS = [
  '/admin',
  '/dashboard',
  '/settings',
  '/my-pitches',
  '/my-store',
  '/messages',
  '/api',
  '/booster-packs',
  '/founder',
  '/investor',
  '/buyer',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block bots from private paths
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOTS.some((bot) => userAgent.toLowerCase().includes(bot.toLowerCase()));
  if (isBot) {
    const isBotBlocked = BOT_BLOCKED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );
    if (isBotBlocked) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // Auth protection — check for Supabase session cookie
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    // Check for Supabase auth cookie (sb-*-auth-token)
    const hasCookie = Array.from(request.cookies.getAll()).some(
      (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    );
    if (!hasCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users away from login/signup to dashboard
  if (pathname === '/login' || pathname === '/signup') {
    const hasCookie = Array.from(request.cookies.getAll()).some(
      (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    );
    if (hasCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon-32x32.png|apple-touch-icon.png|robots.txt|sitemap.xml|site.webmanifest|og-image.png|icons/).*)',
  ],
};
