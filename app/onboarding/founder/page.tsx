"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { getSignedInDestination } from '@/lib/role-routing';
import { AvatarUpload } from '@/components/AvatarUpload';
import { Stepper } from '@/components/Stepper';
import { AlertCircle, ArrowUpRight, ArrowLeft, Rocket, Sprout } from 'lucide-react';

const FOUNDER_STEPS = [
  { id: 1, label: "You" },
  { id: 2, label: "Your idea" },
  { id: 3, label: "Launch" },
];

export default function FounderOnboarding() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Basic Info
  const [form, setForm] = useState({
    displayName: '',
    headline: '',
    company: '',
    country: '',
    city: '',
    bio: '',
    avatarUrl: '',
  });

  // Step 2: "Plant your first seed"
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

      // If onboarding already complete, never show again
      if (profile?.onboarding_complete) {
        if (mounted) router.replace(getSignedInDestination(profile));
        return;
      }

      // If user is not a founder, redirect to their proper place
      if (profile?.role && profile.role !== 'founder') {
        if (mounted) router.replace(getSignedInDestination(profile));
        return;
      }

      // Pre-fill existing data
      if (profile) {
        setForm({
          displayName: profile.display_name || session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || '',
          headline: profile.headline || '',
          company: profile.company || '',
          country: profile.country || '',
          city: profile.city || '',
          bio: profile.bio || '',
          avatarUrl: profile.avatar_url || '',
        });
        if (profile.company) {
          setSeed(s => ({ ...s, title: profile.company }));
        }
      }

      if (mounted) setChecking(false);
    }

    loadUser();
    return () => { mounted = false; };
  }, [router]);

  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError(null);

    if (!form.displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    setSubmitting(true);

    try {
      // Saving Step 1 sets onboarding_complete = true
      const { error: profileErr } = await supabase.from('profiles').update({
        display_name: form.displayName.trim(),
        headline: form.headline.trim() || null,
        company: form.company.trim() || null,
        country: form.country.trim() || null,
        city: form.city.trim() || null,
        bio: form.bio.trim() || null,
        avatar_url: form.avatarUrl.trim() || null,
        onboarding_complete: true,
      }).eq('id', userId);

      if (profileErr) throw profileErr;

      // Proceed to Step 2: "Plant your first seed"
      setStep(2);
    } catch (err: any) {
      console.error('Founder onboarding error:', err);
      setError(err.message || 'Something went wrong saving your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: "Plant a seed" insert into pitches (status draft, title, tagline, founder_id)
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

      // As /founder/pitches/[id] does not exist yet in this slice, redirect safely to dashboard
      // Note: we route to /founder/dashboard?welcome=1 to trigger the celebration modal
      router.refresh();
      router.replace('/founder/dashboard?welcome=1');
    } catch (err: any) {
      console.error('Plant seed error:', err);
      setError(err.message || 'Could not plant idea. Please try again.');
      setSubmitting(false);
    }
  };

  const handleSkipToDashboard = () => {
    router.refresh();
    router.replace('/founder/dashboard?welcome=1');
  };

  const set = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (error) setError(null);
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
          FOUNDER PATHWAY
        </span>
      </header>

      {/* STEPPER BAR */}
      <div className="pt-6 pb-2 px-6">
        <Stepper currentStep={step} steps={FOUNDER_STEPS} />
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-6 my-6">
        {step === 1 ? (
          /* STEP 1: Basic Info */
          <div className="w-full max-w-[540px] bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="mb-8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--red)]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Rocket className="w-5 h-5 text-[var(--red)]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-1">
                  {'//'} FOUNDER PROFILE
                </span>
                <h1 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-[var(--paper)] uppercase leading-tight">
                  Basic Info
                </h1>
                <p className="text-xs font-mono text-[var(--paper-dim)] mt-1.5 leading-relaxed">
                  Tell people who you are and what you're building.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="bg-red-950/40 border border-red-500/50 text-red-300 p-3.5 rounded-xl text-xs font-mono flex items-start gap-2.5 mb-5"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitStep1} className="space-y-4" noValidate>
              {userId && (
                <AvatarUpload
                  userId={userId}
                  currentUrl={form.avatarUrl}
                  onUploaded={(url) => setForm(f => ({ ...f, avatarUrl: url }))}
                  className="mb-4"
                />
              )}

              <div>
                <label htmlFor="fd-name" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Display Name *
                </label>
                <input
                  id="fd-name"
                  type="text"
                  autoFocus
                  autoComplete="name"
                  placeholder="Alex Rivera"
                  required
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                  value={form.displayName}
                  onChange={set('displayName')}
                />
              </div>

              <div>
                <label htmlFor="fd-headline" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Headline
                </label>
                <input
                  id="fd-headline"
                  type="text"
                  maxLength={200}
                  placeholder="Building decentralized infrastructure for commerce"
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                  value={form.headline}
                  onChange={set('headline')}
                />
              </div>

              <div>
                <label htmlFor="fd-company" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Company / Project Name
                </label>
                <input
                  id="fd-company"
                  type="text"
                  maxLength={150}
                  placeholder="Acme Studio"
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                  value={form.company}
                  onChange={set('company')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fd-country" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                    Country
                  </label>
                  <input
                    id="fd-country"
                    type="text"
                    placeholder="United States"
                    disabled={submitting}
                    className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                    value={form.country}
                    onChange={set('country')}
                  />
                </div>
                <div>
                  <label htmlFor="fd-city" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                    City
                  </label>
                  <input
                    id="fd-city"
                    type="text"
                    placeholder="San Francisco"
                    disabled={submitting}
                    className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                    value={form.city}
                    onChange={set('city')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fd-bio" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Short Bio
                </label>
                <textarea
                  id="fd-bio"
                  rows={3}
                  maxLength={2000}
                  placeholder="Briefly tell your background and experience..."
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors resize-none text-[16px]"
                  value={form.bio}
                  onChange={set('bio')}
                />
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row items-center gap-3">
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
                  {submitting ? 'Saving...' : 'Save & Continue'}
                  {!submitting && <ArrowUpRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: "Plant your first seed" Step */
          <div className="w-full max-w-[500px] bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--red)]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sprout className="w-5 h-5 text-[var(--red)]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-1">
                  {'//'} STEP 2 OF 2 · YOUR IDEA
                </span>
                <h1 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-[var(--paper)] uppercase leading-tight">
                  Plant your first seed.
                </h1>
                <p className="text-xs font-mono text-[var(--paper-dim)] mt-1.5 leading-relaxed">
                  Capture your idea in its rawest form. You can develop it into a full pitch deck whenever you're ready.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="bg-red-950/40 border border-red-500/50 text-red-300 p-3.5 rounded-xl text-xs font-mono flex items-start gap-2.5 mb-5"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePlantSeed} className="space-y-4" noValidate>
              <div>
                <label htmlFor="seed-title" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Name your idea (Optional)
                </label>
                <input
                  id="seed-title"
                  type="text"
                  autoFocus
                  maxLength={150}
                  placeholder="e.g. Next-gen payments, Hyperlocal solar..."
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                  value={seed.title}
                  onChange={(e) => setSeed(s => ({ ...s, title: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="seed-tagline" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Describe it in one line (Optional)
                </label>
                <textarea
                  id="seed-tagline"
                  rows={2}
                  maxLength={200}
                  placeholder="A one-sentence explanation of what it is and who it's for."
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors resize-none text-[16px]"
                  value={seed.tagline}
                  onChange={(e) => setSeed(s => ({ ...s, tagline: e.target.value }))}
                />
              </div>

              <div className="pt-4 border-t border-[var(--line)] space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] focus:outline-none focus:ring-2 focus:ring-[var(--red)] focus:ring-offset-2 focus:ring-offset-[var(--card)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg min-h-[44px]"
                >
                  {submitting ? 'Planting...' : 'Plant it'}
                  {!submitting && <ArrowUpRight className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSkipToDashboard}
                  className="w-full bg-transparent border border-[var(--line)] text-[var(--paper-dim)] py-3 px-6 rounded-full text-xs font-mono uppercase tracking-wider hover:text-[var(--paper)] hover:border-[var(--smoke)] hover:bg-[var(--ink)] transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  Skip for now &rarr;
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to edit profile
                </button>
              </div>
            </form>
          </div>
        )}
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
