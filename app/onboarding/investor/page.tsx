"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { getSignedInDestination } from '@/lib/role-routing';
import { AvatarUpload } from '@/components/AvatarUpload';
import { Stepper } from '@/components/Stepper';
import { AlertCircle, ArrowUpRight, ArrowLeft } from 'lucide-react';

const INVESTOR_STEPS = [
  { id: 1, label: "You" },
  { id: 2, label: "Discover" },
];

export default function InvestorOnboarding() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    displayName: '',
    company: '', // Firm / Syndicate
    headline: '',
    country: '',
    city: '',
    bio: '', // Investment focus
    avatarUrl: '',
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

      // If onboarding complete, redirect away
      if (profile?.onboarding_complete) {
        if (mounted) router.replace(getSignedInDestination(profile));
        return;
      }

      // If user is not an investor, redirect to proper place
      if (profile?.role && profile.role !== 'investor') {
        if (mounted) router.replace(getSignedInDestination(profile));
        return;
      }

      if (profile) {
        setForm({
          displayName: profile.display_name || session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || '',
          company: profile.company || '',
          headline: profile.headline || '',
          country: profile.country || '',
          city: profile.city || '',
          bio: profile.bio || '',
          avatarUrl: profile.avatar_url || '',
        });
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

    const trimmedName = form.displayName.trim();
    const trimmedCountry = form.country.trim();

    if (!trimmedName) {
      setError('Display name is required.');
      return;
    }

    if (!trimmedCountry) {
      setError('Country is required.');
      return;
    }

    setSubmitting(true);

    try {
      // Saving basic info sets onboarding_complete = true
      const { error: profileErr } = await supabase.from('profiles').update({
        display_name: trimmedName,
        company: form.company.trim() || null,
        headline: form.headline.trim() || null,
        country: trimmedCountry,
        city: form.city.trim() || null,
        bio: form.bio.trim() || null,
        avatar_url: form.avatarUrl.trim() || null,
        onboarding_complete: true,
      }).eq('id', userId);

      if (profileErr) throw profileErr;

      // Proceed to Next-Step screen at /welcome/investor?celebrate=1
      router.refresh();
      router.replace('/welcome/investor?celebrate=1');
    } catch (err: any) {
      console.error('Investor onboarding error:', err);
      setError(err.message || 'Something went wrong saving your profile.');
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
          [ STEP 1 OF 2 ]
        </span>
      </header>

      {/* STEPPER */}
      <div className="pt-6 pb-2">
        <Stepper currentStep={1} steps={INVESTOR_STEPS} />
      </div>

      {/* FORM CARD */}
      <main className="page-padding py-8 md:py-12 flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
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
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
              {'//'} STEP 1 OF 2 — INVESTOR PROFILE
            </span>
            <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--paper)] uppercase mb-2">
              Investor profile
            </h1>
            <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed">
              Help founders understand your focus and mandate when they pitch.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--red)]/10 border border-[var(--red)]/20 text-xs font-mono text-[var(--paper)] flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-[var(--red)] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {userId && (
              <div className="pt-2 pb-4 border-b border-[var(--line)]">
                <AvatarUpload
                  userId={userId}
                  currentUrl={form.avatarUrl}
                  onUploaded={(url: string) => setForm(f => ({ ...f, avatarUrl: url }))}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="displayName" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-2">
                  Display name <span className="text-[var(--red)]">*</span>
                </label>
                <input
                  id="displayName"
                  type="text"
                  required
                  autoFocus
                  autoComplete="name"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="e.g. Elena Rostova"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-2">
                  Fund / Angel syndicate
                </label>
                <input
                  id="company"
                  type="text"
                  autoComplete="organization"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Apex Ventures or Angel"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="headline" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-2">
                Headline / Focus summary
              </label>
              <input
                id="headline"
                type="text"
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="e.g. Seed check writer in AI, FinTech & HardTech"
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-2">
                  Country <span className="text-[var(--red)]">*</span>
                </label>
                <input
                  id="country"
                  type="text"
                  required
                  autoComplete="country-name"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g. United Kingdom"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-2">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. London"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-2">
                Investment criteria & thesis
              </label>
              <textarea
                id="bio"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Check sizes, stage preferences, geography focus, or value add..."
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all resize-none"
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
                  <span>Saving profile...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
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
          You can update your investment mandate anytime in Settings.
        </p>
      </footer>
    </div>
  );
}
