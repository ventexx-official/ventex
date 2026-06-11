import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Known AI bots and crawlers
const BOTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic',
  'Googlebot',
  'Bingbot',
  'PerplexityBot',
];

// Paths that should be protected from bots
const PROTECTED_PATHS = [
  '/admin',
  '/dashboard',
  '/settings',
  '/my-pitches',
  '/my-store',
  '/messages',
  '/api',
  '/booster-packs',
];

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOTS.some((bot) => userAgent.toLowerCase().includes(bot.toLowerCase()));

  if (isBot) {
    const isProtectedPath = PROTECTED_PATHS.some(
      (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`)
    );

    if (isProtectedPath) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
