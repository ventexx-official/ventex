/**
 * Central routing configuration and role rules for Ventex v3
 */

export const PUBLIC_ROUTES = [
  '/',
  '/discover',
  '/marketplace',
  '/about',
  '/faq',
  '/contact',
  '/terms',
  '/privacy',
  '/seller-agreement',
  '/refund-policy',
  '/delivery-policy',
  '/login',
  '/signup',
];

export const PUBLIC_PREFIXES = [
  '/pitch/',
  '/marketplace/',
  '/learn/',
  '/resources/',
  '/auth/',
];

export const BYPASS_PREFIXES = [
  '/api',
  '/onboarding',
  '/auth',
];

export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export function isBypassedRoute(pathname: string): boolean {
  return BYPASS_PREFIXES.some(prefix => pathname.startsWith(prefix));
}
