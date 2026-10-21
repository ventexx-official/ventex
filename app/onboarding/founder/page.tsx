"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { AlertCircle, ArrowUpRight, Rocket } from 'lucide-react';

const SECTORS = [
  'SaaS', 'Fintech', 'Healthtech', 'Edtech', 'E-commerce',
  'AI / ML', 'Deeptech', 'Climate', 'Consumer', 'Other',
];

const STAGES = [
  { value: 'idea', label: 'Idea' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'mvp', label: 'MVP' },
  { value: 'early_revenue', label: 'Early Revenue' },
  { value: 'growth', label: 'Growth' },
];

export default function FounderOnboarding() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    displayName: '',
    company: '',
    tagline: '',
    industry: '',
    stage: '',
    city: '',
    country: '',
    headline: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return router.push('/login');
      setUserId(session.user.id);
      // Pre-fill display name from auth metadata
      const meta = session.user.user_metadata;
      if (meta?.display_name || meta?.full_name) {
        setForm(f => ({ ...f, displayName: meta.display_name || meta.full_name || '' }));
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError(null);

    if (!form.displayName.trim()) return setError('Your name is required.');
    if (!form.industry) return setError('Please select a sector.');
    if (!form.stage) return setError('Please select a stage.');

    setSubmitting(true);

    try {
      // Update profile
      const { error: profileErr } = await supabase.from('profiles').update({
        display_name: form.displayName.trim(),
        company: form.company.trim() || null,
        headline: form.headline.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        onboarding_complete: true,
      }).eq('id', userId);

      if (profileErr) throw profileErr;

      // Create a draft pitch
      const { data: pitch, error: pitchErr } = await supabase
        .from('pitches')
        .insert({
          founder_id: userId,
          title: form.company.trim() || form.displayName.trim(),
          tagline: form.tagline.trim() || null,
          industry: form.industry,
          stage: form.stage,
          status: 'draft',
        })
        .select('id')
        .single();

      if (pitchErr) throw pitchErr;

      router.push('/pitches/new?id=' + pitch.id);
    } catch (err: any) {
      console.error('Founder onboarding error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (error) setError(null);
  };

  return (
    <div className="inner-page min-h-screen flex flex-col justify-between">
      {/* HEADER */}
      <header className="page-padding py-8 flex items-center justify-between border-b border-[var(--line)]">
        <Link href="/" className="brand-lockup" aria-label={`${brandName} home`}>
          <span className="brand-mark"><span>{brandName.charAt(0)}</span></span>
          <span>{brandName}</span>
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--smoke)]">
          ONBOARDING / STEP 2 OF 3
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 my-10">
        <div className="w-full max-w-[520px] bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl">

          {/* Heading */}
          <div className="mb-8 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--red)]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Rocket className="w-5 h-5 text-[var(--red)]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-1">
                {'// '} FOUNDER PROFILE
              </span>
              <h1 className="font-display text-2xl font-medium tracking-tight text-[var(--paper)] uppercase leading-tight">
                Tell us about your startup
              </h1>
              <p className="text-xs font-mono text-[var(--paper-dim)] mt-1.5">
                This creates your first pitch draft. You can edit everything later.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-500/50 text-red-300 p-3.5 rounded-xl text-xs font-mono flex items-start gap-2.5 mb-5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Display Name */}
            <div>
              <label htmlFor="ob-name" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Your Name *
              </label>
              <input
                id="ob-name"
                type="text"
                autoComplete="name"
                placeholder="Alex Rivera"
                required
                disabled={submitting}
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                value={form.displayName}
                onChange={set('displayName')}
              />
            </div>

            {/* Startup / Company Name */}
            <div>
              <label htmlFor="ob-company" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Startup / Company Name
              </label>
              <input
                id="ob-company"
                type="text"
                placeholder="Acme Inc."
                disabled={submitting}
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                value={form.company}
                onChange={set('company')}
              />
            </div>

            {/* Tagline */}
            <div>
              <label htmlFor="ob-tagline" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                One-line tagline
              </label>
              <input
                id="ob-tagline"
                type="text"
                maxLength={120}
                placeholder="We help X do Y without Z."
                disabled={submitting}
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                value={form.tagline}
                onChange={set('tagline')}
              />
            </div>

            {/* Sector + Stage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ob-sector" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Sector *
                </label>
                <select
                  id="ob-sector"
                  required
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px] appearance-none cursor-pointer"
                  value={form.industry}
                  onChange={set('industry')}
                >
                  <option value="">Sector…</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="ob-stage" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Stage *
                </label>
                <select
                  id="ob-stage"
                  required
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px] appearance-none cursor-pointer"
                  value={form.stage}
                  onChange={set('stage')}
                >
                  <option value="">Stage…</option>
                  {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {/* City + Country */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ob-city" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  City
                </label>
                <input
                  id="ob-city"
                  type="text"
                  placeholder="San Francisco"
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                  value={form.city}
                  onChange={set('city')}
                />
              </div>
              <div>
                <label htmlFor="ob-country" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Country
                </label>
                <input
                  id="ob-country"
                  type="text"
                  placeholder="USA"
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                  value={form.country}
                  onChange={set('country')}
                />
              </div>
            </div>

            {/* Headline */}
            <div>
              <label htmlFor="ob-headline" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Your headline (public profile)
              </label>
              <input
                id="ob-headline"
                type="text"
                maxLength={100}
                placeholder="CEO & Co-founder at Acme Inc."
                disabled={submitting}
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                value={form.headline}
                onChange={set('headline')}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {submitting ? 'Creating pitch draft…' : 'Continue to pitch editor'}
              {!submitting && <ArrowUpRight className="w-4 h-4" />}
            </button>
          </form>
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
