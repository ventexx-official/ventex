"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { ArrowUpRight, Compass } from 'lucide-react';

export default function VisitorOnboarding() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
  }, [router]);

  const complete = async () => {
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', session.user.id);
    }
    router.push('/discover');
  };

  return (
    <div className="inner-page min-h-screen flex flex-col justify-between">
      <header className="page-padding py-8 flex items-center justify-between border-b border-[var(--line)]">
        <Link href="/" className="brand-lockup" aria-label={`${brandName} home`}>
          <span className="brand-mark"><span>{brandName.charAt(0)}</span></span>
          <span>{brandName}</span>
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--smoke)]">
          ONBOARDING / STEP 2 OF 2
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[460px] bg-[var(--card)] border border-[var(--line)] rounded-3xl p-10 shadow-2xl text-center">

          <div className="w-14 h-14 rounded-2xl bg-[var(--red)]/15 flex items-center justify-center mx-auto mb-6">
            <Compass className="w-7 h-7 text-[var(--red)]" />
          </div>

          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-3">
            {'// '} WELCOME
          </span>

          <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--paper)] uppercase mb-3">
            You're all set
          </h1>

          <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed mb-8 max-w-[320px] mx-auto">
            Explore pitches, discover what's being built, and browse the marketplace.
            You can upgrade your role to Founder or Investor at any time from your settings.
          </p>

          <button
            disabled={submitting}
            onClick={complete}
            className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {submitting ? 'Loading…' : 'Start exploring'}
            {!submitting && <ArrowUpRight className="w-4 h-4" />}
          </button>

          <p className="text-[10px] font-mono text-[var(--smoke)] mt-5">
            You can always change your role in{' '}
            <Link href="/settings" className="underline hover:text-[var(--paper-dim)]">Settings</Link>.
          </p>
        </div>
      </main>

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
