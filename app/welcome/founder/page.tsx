"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { Stepper } from '@/components/Stepper';
import { WelcomeCelebration } from '@/components/WelcomeCelebration';
import { Sprout, AlertCircle, ArrowUpRight } from 'lucide-react';

const FOUNDER_STEPS = [
  { id: 1, label: "You" },
  { id: 2, label: "Your idea" },
];

export default function WelcomeFounderPage() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Draft pitch form
  const [seed, setSeed] = useState({
    title: '',
    tagline: '',
  });

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

      if (profile) {
        if (profile.role && profile.role !== 'founder' && profile.role !== 'admin') {
          if (mounted) router.replace('/discover');
          return;
        }

        const name = profile.display_name || session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || '';
        const first = name.trim().split(/\s+/)[0] || '';
        setFirstName(first);

        if (profile.company) {
          setSeed(s => ({ ...s, title: profile.company }));
        }
      }

      if (mounted) setChecking(false);
    }

    loadUser();
    return () => { mounted = false; };
  }, [router]);

  const handlePlantSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const draftTitle = seed.title.trim() || 'Untitled idea';
      const draftTagline = seed.tagline.trim() || null;

      const { data: newPitch, error: pitchErr } = await supabase
        .from('pitches')
        .insert({
          founder_id: userId,
          title: draftTitle,
          tagline: draftTagline,
          status: 'draft',
        })
        .select('id')
        .single();

      if (pitchErr) throw pitchErr;

      // Note: /founder/pitches/{id} is not built yet in this slice, redirect to /founder/dashboard
      router.replace('/founder/dashboard');
    } catch (err: any) {
      console.error('Plant seed error:', err);
      setError(err.message || 'Failed to plant your seed pitch.');
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.replace('/founder/dashboard');
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
      {/* CELEBRATION MODAL (Triggered when ?celebrate=1 is present) */}
      <WelcomeCelebration
        role="founder"
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
        <Stepper currentStep={2} steps={FOUNDER_STEPS} />
      </div>

      {/* MAIN CARD */}
      <main className="page-padding py-8 md:py-12 flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
        <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[var(--red)]/10 border border-[var(--red)]/20 flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6 text-[var(--red)]" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-1">
              {'//'} STEP 2 OF 2 — SEED PITCH
            </span>
            <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--paper)] uppercase mb-2">
              Plant your first seed.
            </h1>
            <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed">
              Every big venture started as a quiet draft. Jot down your initial concept — you can refine, deck, and publish it whenever you're ready.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--red)]/10 border border-[var(--red)]/20 text-xs font-mono text-[var(--paper)] flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-[var(--red)] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePlantSeed} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="seedTitle" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)]">
                  Name your idea (Optional)
                </label>
                <span className="text-[10px] font-mono text-[var(--smoke)]">
                  {seed.title.length}/150
                </span>
              </div>
              <input
                id="seedTitle"
                type="text"
                maxLength={150}
                autoFocus
                value={seed.title}
                onChange={(e) => setSeed({ ...seed, title: e.target.value })}
                placeholder="e.g. HyperScale Autonomous Logistics"
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="seedTagline" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)]">
                  Describe it in one line (Optional)
                </label>
                <span className="text-[10px] font-mono text-[var(--smoke)]">
                  {seed.tagline.length}/200
                </span>
              </div>
              <input
                id="seedTagline"
                type="text"
                maxLength={200}
                value={seed.tagline}
                onChange={(e) => setSeed({ ...seed, tagline: e.target.value })}
                placeholder="e.g. Next-generation route optimization for freight drones."
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:flex-1 bg-[var(--red)] text-[var(--paper)] py-3 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 min-h-[44px]"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Planting seed...</span>
                  </>
                ) : (
                  <>
                    <span>Plant it</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-mono text-[var(--paper-dim)] hover:text-[var(--paper)] hover:bg-[var(--card)]/80 transition-colors border border-[var(--line)] min-h-[44px]"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="page-padding py-6 border-t border-[var(--line)] text-center">
        <p className="text-[11px] font-mono text-[var(--smoke)]">
          Draft pitches stay strictly private to you until you choose to submit them for review.
        </p>
      </footer>
    </div>
  );
}
