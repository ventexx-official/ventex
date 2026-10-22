import { redirect } from 'next/navigation';

export default function VisitorOnboardingRedirect() {
  redirect('/onboarding/explorer');
}
