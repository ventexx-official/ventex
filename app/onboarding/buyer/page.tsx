"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { AlertCircle, ArrowUpRight, ShoppingBag } from 'lucide-react';

export default function BuyerOnboarding() {
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
    bio: '',
  });

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
        bio: form.bio.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        onboarding_complete: true,
      }).eq('id', userId);

      if (profileErr) throw profileErr;

      router.push('/buyer/dashboard');
    } catch (err: any) {
      console.error('Buyer onboarding error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const set = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
              <ShoppingBag className="w-5 h-5 text-[var(--red)]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-1">
                {'// '} BUYER PROFILE
              </span>
              <h1 className="font-display text-2xl font-medium tracking-tight text-[var(--paper)] uppercase leading-tight">
                Set up your profile
              </h1>
              <p className="text-xs font-mono text-[var(--paper-dim)] mt-1.5">
                Browse and acquire startup assets, tools, and resources.
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

            <div>
              <label htmlFor="buyer-name" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Your Name *
              </label>
              <input
                id="buyer-name"
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

            <div>
              <label htmlFor="buyer-company" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Company (optional)
              </label>
              <input
                id="buyer-company"
                type="text"
                placeholder="Your organisation"
                disabled={submitting}
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                value={form.company}
                onChange={set('company')}
              />
            </div>

            <div>
              <label htmlFor="buyer-headline" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Headline
              </label>
              <input
                id="buyer-headline"
                type="text"
                maxLength={100}
                placeholder="Head of Procurement · Acme Corp"
                disabled={submitting}
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                value={form.headline}
                onChange={set('headline')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="buyer-city" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  City
                </label>
                <input
                  id="buyer-city"
                  type="text"
                  placeholder="London"
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                  value={form.city}
                  onChange={set('city')}
                />
              </div>
              <div>
                <label htmlFor="buyer-country" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Country
                </label>
                <input
                  id="buyer-country"
                  type="text"
                  placeholder="UK"
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors text-[16px]"
                  value={form.country}
                  onChange={set('country')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="buyer-bio" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Short bio (optional)
              </label>
              <textarea
                id="buyer-bio"
                rows={3}
                maxLength={300}
                placeholder="Tell sellers a little about what you're looking for…"
                disabled={submitting}
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-colors resize-none text-[16px]"
                value={form.bio}
                onChange={set('bio')}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {submitting ? 'Saving…' : 'Go to marketplace'}
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
