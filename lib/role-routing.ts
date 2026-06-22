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

export function getOnboardingRoute(role: string | null | undefined, hasStartup: boolean = false): string | null {
  if (!role) return '/onboarding/role';
  
  if (role === 'founder') {
    if (!hasStartup) return '/onboarding/founder';
  } else if (role === 'investor') {
    // Investor onboarding might be multiple steps, but standard is /onboarding/investor
    return '/onboarding/investor';
  } else if (role === 'buyer') {
    return '/onboarding/buyer';
  }
  
  return null;
}
