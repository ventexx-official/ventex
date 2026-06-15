import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/', '/discover', '/marketplace', '/events', '/about', '/catalyst', '/contact',
  '/investors', '/pricing', '/terms', '/privacy', '/seller-agreement', '/refund-policy', '/delivery-policy'
];

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

  // NOTE: Authentication is handled purely on the client side via localStorage
  // Route protection is managed by the FounderGuard, InvestorGuard, and BuyerGuard components.

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon-32x32.png|apple-touch-icon.png|robots.txt|sitemap.xml|site.webmanifest|og-image.png|icons/|api/).*)'],
};
