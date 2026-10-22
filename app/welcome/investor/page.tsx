"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { Stepper } from '@/components/Stepper';
import { WelcomeCelebration } from '@/components/WelcomeCelebration';
import { LineChart, Compass, ArrowUpRight } from 'lucide-react';

const INVESTOR_STEPS = [
  { id: 1, label: "You" },
  { id: 2, label: "Discover" },
];

export default function WelcomeInvestorPage() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        if (profile.role && profile.role !== 'investor' && profile.role !== 'admin') {
          if (mounted) router.replace('/discover');
          return;
        }

        const name = profile.display_name || session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || '';
        const first = name.trim().split(/\s+/)[0] || '';
        setFirstName(first);
      }

      if (mounted) setChecking(false);
    }

    loadUser();
    return () => { mounted = false; };
  }, [router]);

  if (checking) {
    return (
      <div className="inner-page min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--line)] border-t-[var(--red)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="inner-page min-h-screen flex flex-col justify-between">
      {/* CELEBRATION MODAL (Triggered when ?celebrate=1 is present) */}
      <WelcomeCelebration
        role="investor"
        firstName={firstName}
        destination=""
      />

      {/* HEADER */}
      <header className="page-padding py-8 flex items-center justify-between border-b border-[var(--line)]">
        <Link href="/" className="brand-lockup" aria-label={`${brandName} home`}>
          <span className="brand-mark">
            <span>{brandName.charAt(0)}</span>
          </span>
          <span>{brandName}</span>
        </Link>
        <span className="text-[10px] font-mono tracking-widest text-[var(--smoke)] uppercase">
          [ STEP 2 OF 2 ]
        </span>
      </header>

      {/* STEPPER */}
      <div className="pt-6 pb-2">
        <Stepper currentStep={2} steps={INVESTOR_STEPS} />
      </div>

      {/* MAIN CARD */}
      <main className="page-padding py-8 md:py-12 flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
        <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--red)]/10 border border-[var(--red)]/20 flex items-center justify-center mx-auto mb-6">
            <Compass className="w-7 h-7 text-[var(--red)]" />
          </div>

          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
            {'//'} SETUP COMPLETE — START DISCOVERING
          </span>

          <h1 className="font-display text-3xl md:text-4xl font-medium tracking-tight text-[var(--paper)] uppercase mb-3">
            Where would you like to start?
          </h1>

          <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed max-w-sm mx-auto mb-8">
            Your investor profile is ready. You can browse active startup pitches immediately or visit your investor portal.
          </p>

          <div className="space-y-3">
            <Link
              href="/discover"
              className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg min-h-[44px]"
            >
              <span>Browse pitches</span>
              <Compass className="w-4 h-4" />
            </Link>

            <Link
              href="/investor/portal"
              className="w-full bg-transparent text-[var(--paper)] py-3.5 px-6 rounded-full text-xs font-mono uppercase tracking-wider hover:bg-[var(--card)]/80 transition-all flex items-center justify-center gap-2 border border-[var(--line)] min-h-[44px]"
            >
              <span>Go to my dashboard</span>
              <ArrowUpRight className="w-4 h-4 text-[var(--paper-dim)]" />
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="page-padding py-6 border-t border-[var(--line)] text-center">
        <p className="text-[11px] font-mono text-[var(--smoke)]">
          You can adjust your deal flow notifications in Settings anytime.
        </p>
      </footer>
    </div>
  );
}
