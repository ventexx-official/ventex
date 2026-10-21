"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { AlertCircle, ArrowUpRight, LineChart } from 'lucide-react';

const FOCUS_AREAS = [
  'SaaS', 'Fintech', 'Healthtech', 'Edtech', 'E-commerce',
  'AI / ML', 'Deeptech', 'Climate', 'Consumer', 'Any sector',
];

const TICKET_SIZES = [
  { value: 'under_25k', label: 'Under \$25k' },
  { value: '25k_100k', label: '\$25k – \$100k' },
  { value: '100k_500k', label: '\$100k – \$500k' },
  { value: '500k_2m', label: '\$500k – \$2M' },
  { value: 'over_2m', label: 'Over \$2M' },
];

const STAGES = [
  { value: 'idea', label: 'Idea' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'mvp', label: 'MVP' },
  { value: 'early_revenue', label: 'Early Revenue' },
  { value: 'growth', label: 'Growth' },
];

export default function InvestorOnboarding() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    displayName: '',
    company: '',
    headline: '',
    city: '',
    country: '',
    ticketSize: '',
    preferredStage: '',
  });
  const [focusAreas, setFocusAreas] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return router.push('/login');
      setUserId(session.user.id);
      const meta = session.user.user_metadata;
      if (meta?.display_name || meta?.full_name) {
        setForm(f => ({ ...f, displayName: meta.display_name || meta.full_name || '' }));
      }
    });
  }, [router]);

  const toggleFocus = (area: string) => {
    setFocusAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError(null);

    if (!form.displayName.trim()) return setError('Your name is required.');

    setSubmitting(true);

    try {
      const { error: profileErr } = await supabase.from('profiles').update({
        display_name: form.displayName.trim(),
        company: form.company.trim() || null,
        headline: form.headline.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        onboarding_complete: true,
      }).eq('id', userId);

      if (profileErr) throw profileErr;

      router.push('/investor/portal');
    } catch (err: any) {
      console.error('Investor onboarding error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (error) setError(null);
  };

  return (
    <div className="inner-page min-h-screen flex flex-col justify-between">
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

          <div className="mb-8 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--red)]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <LineChart className="w-5 h-5 text-[var(--red)]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-1">
                {'// '} INVESTOR PROFILE
              </span>
              <h1 className="font-display text-2xl font-medium tracking-tight text-[var(--paper)] uppercase leading-tight">
                Set your investment focus
              </h1>
              <p className="text-xs font-mono text-[var(--paper-dim)] mt-1.5">
                This helps founders find you. You can update this in settings anytime.
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
              <label htmlFor="inv-name" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Your Name *
              </label>
              <input
                id="inv-name"
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

            {/* Firm / Company */}
            <div>
              <label htmlFor="inv-company" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Firm / Company
              </label>
              <input
                id="inv-company"
                type="text"
                placeholder="Horizon Ventures"
                disabled={submitting}
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                value={form.company}
                onChange={set('company')}
              />
            </div>

            {/* Headline */}
            <div>
              <label htmlFor="inv-headline" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Your headline
              </label>
              <input
                id="inv-headline"
                type="text"
                maxLength={100}
                placeholder="Seed investor · Fintech, SaaS"
                disabled={submitting}
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                value={form.headline}
                onChange={set('headline')}
              />
            </div>

            {/* Ticket + Stage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="inv-ticket" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Ticket size
                </label>
                <select
                  id="inv-ticket"
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px] appearance-none cursor-pointer"
                  value={form.ticketSize}
                  onChange={set('ticketSize')}
                >
                  <option value="">Any size</option>
                  {TICKET_SIZES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="inv-stage" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Preferred stage
                </label>
                <select
                  id="inv-stage"
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px] appearance-none cursor-pointer"
                  value={form.preferredStage}
                  onChange={set('preferredStage')}
                >
                  <option value="">Any stage</option>
                  {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="inv-city" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  City
                </label>
                <input
                  id="inv-city"
                  type="text"
                  placeholder="New York"
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                  value={form.city}
                  onChange={set('city')}
                />
              </div>
              <div>
                <label htmlFor="inv-country" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Country
                </label>
                <input
                  id="inv-country"
                  type="text"
                  placeholder="USA"
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                  value={form.country}
                  onChange={set('country')}
                />
              </div>
            </div>

            {/* Focus areas */}
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-2">
                Sectors of interest (optional)
              </p>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map(area => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleFocus(area)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                      focusAreas.includes(area)
                        ? 'bg-[var(--red)] border-[var(--red)] text-[var(--paper)]'
                        : 'bg-transparent border-[var(--line)] text-[var(--smoke)] hover:border-[var(--paper-dim)] hover:text-[var(--paper)]'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {submitting ? 'Saving…' : 'Enter the platform'}
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
