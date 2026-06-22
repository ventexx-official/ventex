"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getDashboardRoute, getOnboardingRoute } from '@/lib/role-routing';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          // Check if this tab was opened by an email link click (not a direct navigation).
          // Email clients open links in new tabs. In that case we should try to close this tab
          // so the original signup tab (listening via onAuthStateChange) takes over automatically.
          const openedByEmailLink = code !== null && document.referrer === '';

          if (openedByEmailLink) {
            setClosing(true);
            // Small delay to ensure localStorage sync propagates to the original tab
            setTimeout(() => {
              window.close();
              // Fallback if window.close() is blocked by the browser — just redirect normally
            }, 800);
            return;
          }

          // Normal direct navigation (e.g. Google OAuth, or if window.close() was blocked)
          const { data: profile } = await supabase
            .from('users')
            .select('role, onboarding_completed, is_admin')
            .eq('id', session.user.id)
            .single();

          if (profile?.is_admin) return router.push('/admin');

          const onboardingRoute = getOnboardingRoute(profile?.role, false);
          if (onboardingRoute && (!profile || !profile.role || profile.role === 'visitor' || !profile?.onboarding_completed)) {
            return router.push(onboardingRoute);
          }

          return router.push(getDashboardRoute(profile?.role));
        } else {
          setTimeout(async () => {
            const { data: delayedData } = await supabase.auth.getSession();
            if (!delayedData.session) {
              setError('Authentication failed. Please try logging in again.');
            }
          }, 2000);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
      }
    };

    checkSessionAndRedirect();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
        <div className="bg-[var(--card-bg)] border-[0.5px] rounded-[16px] p-8 max-w-[400px] text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-[var(--text)] text-[var(--bg)] px-6 py-2 rounded-full text-sm font-bold"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  if (closing) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
        <div className="bg-[var(--card-bg)] border-[0.5px] rounded-[16px] p-8 max-w-[400px] text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-[var(--text)]">Email confirmed! ✓</h3>
          <p className="text-sm text-[var(--text2)]">
            Your account is now active. You can close this tab — your original tab will open your account automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4 gap-4">
      <div className="w-8 h-8 border-2 border-t-[var(--text)] border-[var(--border)] rounded-full animate-spin" />
      <p className="text-sm text-[var(--text2)]">Setting up your account...</p>
    </div>
  );
}
