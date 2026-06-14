import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/', '/discover', '/marketplace', '/events', '/about', '/catalyst', '/contact',
  '/investors', '/pricing', '/terms', '/privacy', '/seller-agreement', '/refund-policy', '/delivery-policy'
];

// Any logged in user
const AUTH_ROUTES = ['/messages', '/settings', '/onboarding'];

// Role restricted base paths
const FOUNDER_PATHS = ['/dashboard/founder', '/my-pitches', '/my-store'];
const INVESTOR_PATHS = ['/dashboard/investor', '/watchlist', '/deal-flow'];
const BUYER_PATHS = ['/dashboard/buyer', '/saved-products', '/purchases'];
const ADMIN_PATHS = ['/admin'];

const BOTS = ['GPTBot', 'ClaudeBot', 'anthropic', 'Googlebot', 'Bingbot', 'PerplexityBot'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block bots from protected paths
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
  if (isBot) {
    const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(`${r}/`));
    if (!isPublic) return new NextResponse('Forbidden', { status: 403 });
  }

  // Basic auth check via cookie (set by client layout or SSR)
  const hasAuthCookie = Array.from(request.cookies.getAll()).some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));
  const isFounderRoute = FOUNDER_PATHS.some(r => pathname.startsWith(r));
  const isInvestorRoute = INVESTOR_PATHS.some(r => pathname.startsWith(r));
  const isBuyerRoute = BUYER_PATHS.some(r => pathname.startsWith(r));
  const isAdminRoute = ADMIN_PATHS.some(r => pathname.startsWith(r));

  const requiresAuth = isAuthRoute || isFounderRoute || isInvestorRoute || isBuyerRoute || isAdminRoute;

  if (requiresAuth && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === '/login' || pathname === '/signup') && hasAuthCookie) {
    // We don't know the role here natively without DB lookup, so redirect to auth/callback or dashboard root to route them
    return NextResponse.redirect(new URL('/auth/callback', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon-32x32.png|apple-touch-icon.png|robots.txt|sitemap.xml|site.webmanifest|og-image.png|icons/|api/).*)'],
};
