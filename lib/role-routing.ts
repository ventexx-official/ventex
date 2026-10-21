/**
 * Central routing and navigation rules for Ventex v3
 */

export interface ProfileRoutingData {
  role?: string | null;
  onboarding_complete?: boolean | null;
}

/**
 * Validates a "next" redirect parameter to ensure:
 * - It starts with a single "/"
 * - Never starts with "//" (protocol-relative URL)
 * - Is not an absolute external URL
 * Returns null if invalid or unsafe.
 */
export function sanitizeNextUrl(next: string | null | undefined): string | null {
  if (!next) return null;
  const trimmed = next.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null;
  }
  // Prevent any carriage return, control character, or backslash trickery
  if (/[\r\n\t\\]/.test(trimmed)) {
    return null;
  }
  // Check that the URL is strictly relative
  try {
    const dummy = new URL(trimmed, 'http://localhost');
    if (dummy.origin !== 'http://localhost') return null;
    return dummy.pathname + dummy.search + dummy.hash;
  } catch {
    return null;
  }
}

/**
 * Central function to decide where a signed-in user goes:
 * 1. If no profile, or role === 'visitor' with onboarding_complete = false:
 *    -> '/onboarding/role'
 * 2. If role is set (founder, investor, buyer) but onboarding_complete = false:
 *    -> that role's first setup step:
 *       - founder -> '/onboarding/founder'
 *       - investor -> '/onboarding/investor'
 *       - buyer -> '/onboarding/buyer'
 *       - visitor -> '/onboarding/visitor' (or '/onboarding/role' if role picker not done)
 * 3. If onboarding_complete = true:
 *    -> their dashboard:
 *       - admin -> '/admin'
 *       - founder -> '/founder/dashboard'
 *       - investor -> '/investor/portal'
 *       - buyer -> '/buyer/dashboard'
 *       - visitor (explorer) -> '/discover'
 */
export function getSignedInDestination(profile: ProfileRoutingData | null | undefined): string {
  if (!profile) {
    return '/onboarding/role';
  }

  const { role, onboarding_complete } = profile;

  // Returning users with onboarding complete go directly to their dashboard
  if (onboarding_complete) {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'founder':
        return '/founder/dashboard';
      case 'investor':
        return '/investor/portal';
      case 'buyer':
        return '/buyer/dashboard';
      case 'visitor':
      default:
        return '/discover';
    }
  }

  // Not complete yet
  if (!role || role === 'visitor') {
    return '/onboarding/role';
  }

  switch (role) {
    case 'founder':
      return '/onboarding/founder';
    case 'investor':
      return '/onboarding/investor';
    case 'buyer':
      return '/onboarding/buyer';
    default:
      return '/onboarding/role';
  }
}

/**
 * Legacy compatibility helper for dashboard paths
 */
export function getDashboardRoute(role: string | null | undefined): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'founder':
      return '/founder/dashboard';
    case 'investor':
      return '/investor/portal';
    case 'buyer':
      return '/buyer/dashboard';
    default:
      return '/discover';
  }
}

export function getOnboardingRoute(role: string | null | undefined): string {
  if (!role || role === 'visitor') return '/onboarding/role';
  if (role === 'founder') return '/onboarding/founder';
  if (role === 'investor') return '/onboarding/investor';
  if (role === 'buyer') return '/onboarding/buyer';
  return '/onboarding/role';
}
