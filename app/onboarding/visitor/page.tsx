"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { getSignedInDestination } from '@/lib/role-routing';
import { Compass, ArrowUpRight, AlertCircle, ArrowLeft } from 'lucide-react';

export default function VisitorOnboarding() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) router.replace('/login');
        return;
      }

      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile?.onboarding_complete) {
        if (mounted) router.replace(getSignedInDestination(profile));
        return;
      }

      if (profile?.role && profile.role !== 'visitor') {
        if (mounted) router.replace(getSignedInDestination(profile));
        return;
      }

      if (profile) {
        setDisplayName(
          profile.display_name ||
          session.user.user_metadata?.display_name ||
          session.user.user_metadata?.full_name ||
          ''
        );
      }

      if (mounted) setChecking(false);
    }

    loadUser();
    return () => { mounted = false; };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError(null);

    setSubmitting(true);

    try {
      const trimmedName = displayName.trim();
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          display_name: trimmedName || null,
          role: 'visitor',
          onboarding_complete: true,
        })
        .eq('id', userId);

      if (profileErr) throw profileErr;

      router.refresh();
      router.replace('/discover?welcome=1');
    } catch (err: any) {
      console.error('Visitor onboarding error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="inner-page min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--line)] border-t-[var(--red)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="inner-page min-h-screen flex flex-col justify-between">
      {/* HEADER */}
      <header className="page-padding py-6 flex items-center justify-between border-b border-[var(--line)]">
        <Link href="/" className="brand-lockup" aria-label={`${brandName} home`}>
          <span className="brand-mark"><span>{brandName.charAt(0)}</span></span>
          <span>{brandName}</span>
        </Link>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[var(--card)] border border-[var(--line)] text-[var(--paper)]">
          EXPLORER SETUP
        </span>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-6 my-10">
        <div className="w-full max-w-[460px] bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--red)]/15 flex items-center justify-center mx-auto mb-6">
            <Compass className="w-7 h-7 text-[var(--red)]" />
          </div>

          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
            {'//'} EXPLORER SETUP
          </span>

          <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--paper)] uppercase mb-3">
            Welcome to {brandName}
          </h1>

          <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed mb-8 max-w-sm mx-auto">
            Explore published pitches, browse the marketplace, and discover innovative teams.
          </p>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="bg-red-950/40 border border-red-500/50 text-red-300 p-3.5 rounded-xl text-xs font-mono flex items-start gap-2.5 mb-5 text-left"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
            <div>
              <label htmlFor="vis-name" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Your Name / Nickname (Optional)
              </label>
              <input
                id="vis-name"
                type="text"
                autoFocus
                placeholder="How should we address you?"
                disabled={submitting}
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/onboarding/role"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[var(--line)] text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] hover:border-[var(--smoke)] transition-colors min-h-[44px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:flex-1 bg-[var(--red)] text-[var(--paper)] py-3 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] focus:outline-none focus:ring-2 focus:ring-[var(--red)] focus:ring-offset-2 focus:ring-offset-[var(--card)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
              >
                {submitting ? 'Setting up...' : 'Start Exploring'}
                {!submitting && <ArrowUpRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="page-padding py-6 flex items-center justify-between text-xs font-mono text-[var(--smoke)] border-t border-[var(--line)]">
        <span>© 2026 {brandName}</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-[var(--paper)]">Privacy</Link>
          <Link href="/terms" className="hover:text-[var(--paper)]">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
