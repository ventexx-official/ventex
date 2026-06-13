import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BadgeCheck, Quote } from 'lucide-react';

interface Story {
  id: string;
  founder_name: string;
  founder_role: string;
  founder_avatar_initials: string;
  founder_avatar_url: string | null;
  quote: string;
  result_label: string;
  verified: boolean;
}

export default async function Testimonials() {
  const { data: stories } = await supabase
    .from('founder_stories')
    .select('id, founder_name, founder_role, founder_avatar_initials, founder_avatar_url, quote, result_label, verified')
    .eq('verified', true)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(6);

  const hasStories = stories && stories.length > 0;

  return (
    <section id="testimonials" className="bg-[var(--bg)] py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--text3)]">{'// '} founder stories</div>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-[-.03em] text-[var(--text)] md:text-5xl">
            Founders trust Ventexx.
          </h2>
          {hasStories && (
            <p className="text-sm text-[var(--text3)] flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              Verified founders only
            </p>
          )}
        </div>

        {hasStories ? (
          <>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--text2)]">
              From first pitch to closed round — real results from the Ventexx ecosystem.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              {(stories as Story[]).map((t) => (
                <div key={t.id} className="card reveal flex flex-col gap-5 p-6">
                  {/* Verified badge */}
                  <div className="flex items-center gap-1.5">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="mono text-[10px] font-bold uppercase tracking-wider text-emerald-500">Verified Founder</span>
                  </div>

                  {/* Quote */}
                  <p className="flex-1 text-sm leading-7 text-[var(--text2)]">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="h-px bg-[var(--border)]" />

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className="mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold text-[var(--text)] overflow-hidden"
                      style={{ borderColor: 'var(--border2)', background: 'var(--bg3)' }}
                      aria-hidden="true"
                    >
                      {t.founder_avatar_url ? (
                        <img src={t.founder_avatar_url} alt={t.founder_name} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        t.founder_avatar_initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-[var(--text)]">{t.founder_name}</div>
                      <div className="truncate text-xs text-[var(--text3)]">{t.founder_role}</div>
                    </div>
                    {t.result_label && (
                      <span className="ml-auto shrink-0 rounded-sm border px-2 py-0.5 text-[10px] font-semibold text-emerald-500" style={{ borderColor: 'var(--border2)' }}>
                        {t.result_label}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Clean empty state — no fake data */
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center" style={{ borderColor: 'var(--border2)' }}>
            <Quote className="mb-4 h-10 w-10 text-[var(--text3)] opacity-40" />
            <p className="text-lg font-bold text-[var(--text)]">Founder stories coming soon.</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text2)]">
              We&apos;re collecting verified success stories from founders in the Ventexx ecosystem. Be one of the first.
            </p>
            <Link
              href="/founder/create-pitch"
              className="btn-primary mt-6 inline-flex"
            >
              Create your pitch →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
