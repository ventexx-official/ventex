"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { getSignedInDestination } from '@/lib/role-routing';
import { Compass, ArrowUpRight, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ExplorerOnboarding() {
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

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError('Display name is required.');
      return;
    }

    setSubmitting(true);

    try {
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          display_name: trimmedName,
          role: 'visitor',
          onboarding_complete: true,
        })
        .eq('id', userId);

      if (profileErr) throw profileErr;

      router.refresh();
      router.replace('/discover');
    } catch (err: any) {
      console.error('Explorer onboarding error:', err);
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
      <header className="page-padding py-8 flex items-center justify-between border-b border-[var(--line)]">
        <Link href="/" className="brand-lockup" aria-label={`${brandName} home`}>
          <span className="brand-mark">
            <span>{brandName.charAt(0)}</span>
          </span>
          <span>{brandName}</span>
        </Link>
        <span className="text-[10px] font-mono tracking-widest text-[var(--smoke)] uppercase">
          [ EXPLORER SETUP ]
        </span>
      </header>

      {/* FORM CARD */}
      <main className="page-padding py-12 flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/onboarding/role"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--paper-dim)] hover:text-[var(--paper)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to role selection
          </Link>
        </div>

        <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-[var(--red)]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)]">
                {'//'} EXPLORER ACCESS
              </span>
            </div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--paper)] uppercase mb-2">
              Welcome to {brandName}
            </h1>
            <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed">
              Look around pitches, check out the marketplace, and discover what founders are creating. What should we call you?
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--red)]/10 border border-[var(--red)]/20 text-xs font-mono text-[var(--paper)] flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-[var(--red)] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-2">
                Display name <span className="text-[var(--red)]">*</span>
              </label>
              <input
                id="displayName"
                type="text"
                required
                autoFocus
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name or alias"
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 min-h-[44px]"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Entering...</span>
                </>
              ) : (
                <>
                  <span>Start Exploring</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="page-padding py-6 border-t border-[var(--line)] text-center">
        <p className="text-[11px] font-mono text-[var(--smoke)]">
          You can upgrade to Founder, Investor, or Buyer anytime in Settings.
        </p>
      </footer>
    </div>
  );
}
