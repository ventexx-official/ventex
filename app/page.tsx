import { Globe, Megaphone, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Testimonials from '@/components/Testimonials';
import JsonLd from '@/components/JsonLd';

function formatCurrency(amount: number) {
  if (!amount) return 'N/A';
  if (amount >= 10000000) return `Rs ${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(1)}L`;
  return `Rs ${amount.toLocaleString('en-IN')}`;
}

const features = [
  {
    icon: Megaphone,
    title: 'Integrated pitch profilers',
    desc: 'Turn your startup idea into a structured pitch profile with traction, documents, video, Q&A, and AI summaries Ã¢â‚¬â€ ready for investors.',
  },
  {
    icon: TrendingUp,
    title: 'Funding-ready signals',
    desc: 'Funding-ready indicators, response badges, XP, pitch scores, and investor matching help strong founders stand out from the crowd.',
  },
  {
    icon: Shield,
    title: 'Premium data rooms',
    desc: 'Protect traction and confidential documents while giving verified investors enough context to move fast.',
  },
  {
    icon: Users,
    title: 'Investor and catalyst network',
    desc: 'Pitch to investors, founders and operators. Find them by sector, stage, thesis, and response behavior.',
  },
  {
    icon: Zap,
    title: 'Momentum loops',
    desc: 'Weekly battles, heat maps, founding member nudges, and XP make progress visible, and your startup moving Ã¢â‚¬â€ every week.',
  },
  {
    icon: Globe,
    title: 'Built for founders worldwide',
    desc: 'Mobile investing, global resources, and marketplace tooling built around startup realities Ã¢â‚¬â€ sell from anywhere, raise from anyone.',
  },
];

const steps = [
  ['01', 'Submit your pitch', 'Create a sharp public profile with video, traction, fundraising details, and documents. Go live in minutes.'],
  ['02', 'Get matched', 'Investors discover you through search, thesis matching, saved pitches, and weekly ecosystem surfaces Ã¢â‚¬â€ and reach out.'],
  ['03', 'Sell and scale', 'List products, unlock deal rooms, build social proof, and convert attention into revenue or real funding.'],
];

export default async function Home() {
  const [
    { data: pitches },
    { count: startupsCount },
    { count: investorsCount },
    { count: productsCount },
  ] = await Promise.all([
    supabase.from('pitches').select('id, title, industry, company_stage, is_raising, tagline, ai_summary, short_description, amount_seeking, equity_pct, state, country').eq('status', 'live').limit(3),
    supabase.from('pitches').select('*', { count: 'exact', head: true }).eq('status', 'live'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'investor'),
    supabase.from('products').select('*', { count: 'exact', head: true }).in('status', ['live', 'published']),
  ]);

  const { data: featuredFlag } = await supabase
    .from('feature_flags')
    .select('enabled')
    .eq('key', 'homepage_featured_this_week')
    .maybeSingle();
  const { data: featuredPitches } = featuredFlag?.enabled
    ? await supabase
        .from('pitches')
        .select('*')
        .in('status', ['live', 'published'])
        .order('pitch_score', { ascending: false })
        .limit(3)
    : { data: [] as any[] };

  const stats = [
    { label: 'Startups listed', value: startupsCount ?? 0 },
    { label: 'Registered investors', value: investorsCount ?? 0 },
    { label: 'Marketplace products', value: productsCount ?? 0 },
  ].filter(s => s.value > 0);

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Ventex",
        "url": "https://ventexx.com",
        "description": "Where startups pitch, fund and sell.",
        "logo": "https://ventexx.com/logo.png",
        "sameAs": [
          "https://twitter.com/ventexx",
          "https://linkedin.com/company/ventexx",
          "https://instagram.com/ventexx",
          "https://youtube.com/@ventexx"
        ]
      }} />

      <section id="hero" className="grid-bg relative min-h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg)]">
        <div className="absolute inset-0 bg-[var(--bg)]/60" />
        
        <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[64px] items-center w-full">
            <div className="text-left stagger-2">
              <div className="mono inline-flex items-center gap-2 border px-3 py-1.5 text-[11px] font-medium text-[var(--text2)] mb-8" style={{ borderColor: 'var(--border2)' }}>
                <span className="h-1.5 w-1.5 animate-[pulseDot_2s_infinite] rounded-full bg-emerald-500" />
                v1.0 Ã‚Â· Early Access Now Open
              </div>

              <h1 className="max-w-2xl text-balance text-[clamp(32px,6vw,64px)] font-extrabold leading-none tracking-[-.04em] text-[var(--text)] mb-6 transition-colors duration-400">
                Where startups<br />pitch, fund and sell.
              </h1>

              <p className="max-w-[520px] text-[19px] leading-[1.55] text-[var(--text2)] mb-10 transition-colors duration-400">
                The platform for founders, investors and startup-builders Ã¢â‚¬â€ Anywhere.
              </p>

              <div className="flex flex-wrap items-center gap-5">
                <Link href="/founder/create-pitch" className="btn-primary inline-flex items-center gap-2 transition-transform shadow-sm hover:shadow-lg">Create your pitch <span aria-hidden="true">Ã¢â€ â€™</span></Link>
                <Link href="/discover" className="btn-secondary transition-colors">Explore pitches</Link>
              </div>

              <div className="mono mt-10 text-[11px] text-[var(--text3)] hidden sm:block">
                {'//'} Trusted by founders, investors and startup-builders Ã¢â‚¬â€ worldwide.
              </div>
            </div>

            <div className="glass-ledger-card stagger-3 mt-10 md:mt-0 w-full">
              <span className="mono text-[11px] font-bold text-[#e0a96d] tracking-[0.1em] uppercase mb-2 block">Ventex Matrix</span>
              <h3 className="text-[20px] font-bold tracking-[-0.02em] text-[var(--text)] mb-6 transition-colors duration-400">Live startups raising now.</h3>
              <div className="ledger-inner-stack">
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border)] transition-colors duration-400">
                      <span className="text-[13.5px] text-[var(--text2)] transition-colors duration-400">Target Allocation</span>
                      <span className="font-['Space_Grotesk',sans-serif] font-semibold text-[16px] text-[#e0a96d]">Rs. 50.0L</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border)] transition-colors duration-400">
                      <span className="text-[13.5px] text-[var(--text2)] transition-colors duration-400">Equity Pool Offered</span>
                      <span className="font-['Space_Grotesk',sans-serif] font-semibold text-[16px] text-[var(--text)] transition-colors duration-400">10%</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                      <span className="text-[13.5px] text-[var(--text2)] transition-colors duration-400">Calculated Base Evaluation</span>
                      <span className="font-['Space_Grotesk',sans-serif] font-semibold text-[16px] text-[var(--text)] transition-colors duration-400">Rs. 5.0Cr</span>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {featuredFlag?.enabled && (featuredPitches || []).length > 0 ? (
        <section className="border-y bg-[var(--bg2)] py-16" style={{ borderColor: 'var(--border)' }}>
          <div className="mx-auto max-w-6xl px-4">
            <div className="mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--text3)]">{'//'} featured this week</div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {(featuredPitches || []).map((pitch) => (
                <Link key={pitch.id} href={`/pitch/${pitch.id}`} className="card p-5">
                  <h2 className="text-lg font-black text-[var(--text)]">{pitch.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--text2)]">{pitch.tagline || pitch.short_description || pitch.ai_summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="discover" className="border-y bg-[var(--bg2)] py-16" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <div className="mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--text3)]">{'//'} discover</div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] text-[var(--text)] md:text-5xl">Live startups raising now.</h2>
            </div>
            <Link href="/discover" className="link-underline hidden text-sm font-semibold text-[var(--text2)] hover:text-[var(--text)] sm:block">View all</Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(pitches || []).map((pitch, index) => {
              const valuation = pitch.amount_seeking && pitch.equity_pct ? pitch.amount_seeking / (pitch.equity_pct / 100) : 0;
              return (
                <Link key={pitch.id} href={`/pitch/${pitch.id}`} className="card reveal flex min-h-[300px] flex-col p-5" data-delay={String(index * 100)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-[var(--text)]">{pitch.title || 'Untitled startup'}</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pitch.industry ? <span className="tag">{pitch.industry}</span> : null}
                        {pitch.company_stage ? <span className="tag">{pitch.company_stage}</span> : null}
                      </div>
                    </div>
                    <span className="tag">{pitch.is_raising ? 'Raising' : 'Verified'}</span>
                  </div>

                  <p className="mt-5 line-clamp-3 flex-1 text-sm leading-6 text-[var(--text2)]">
                    {pitch.tagline || pitch.ai_summary || pitch.short_description || 'No summary yet.'}
                  </p>

                  <div className="my-5 h-px bg-[var(--border)]" />
                  <div className="grid grid-cols-3 gap-3">
                    <Metric label="Seeking" value={formatCurrency(pitch.amount_seeking)} />
                    <Metric label="Equity" value={pitch.equity_pct ? `${pitch.equity_pct}%` : 'N/A'} />
                    <Metric label="Valuation" value={valuation ? formatCurrency(valuation) : 'N/A'} />
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm">
                    <span className="tag">{[pitch.state, pitch.country].filter(Boolean).join(', ') || 'Global'}</span>
                    <span className="text-[var(--text2)]">View pitch</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="bg-[var(--bg)] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--text3)]">{'//'} features</div>
          <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-.03em] text-[var(--text)] md:text-5xl">
            Everything you need to pitch, fund and sell.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="card reveal p-6" data-delay={String((index % 3) * 100)}>
                  <div className="mb-6 flex h-10 w-10 items-center justify-center border bg-[var(--bg3)]" style={{ borderColor: 'var(--border)' }}>
                    <Icon className="h-5 w-5 text-[var(--text)]" />
                  </div>
                  <h3 className="font-bold text-[var(--text)]">{feature.title}</h3>
                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-[var(--text2)]">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Testimonials />

      {stats.length > 0 && (
        <section className="border-y bg-[var(--bg2)] py-12" style={{ borderColor: 'var(--border)' }}>
          <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-[var(--border)] px-4 md:grid-cols-3 md:divide-x md:divide-y-0">
            {stats.map(({ label, value }) => (
              <div key={label} className="reveal py-8 text-center">
                <div className="mono text-4xl font-bold text-[var(--text)]">{value.toLocaleString()}</div>
                <div className="mono mt-2 text-[10px] uppercase tracking-[.12em] text-[var(--text3)]">{label}</div>
                <div className="mt-2 text-xs font-semibold text-[var(--text2)]">and growing</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="how-it-works" className="bg-[var(--bg)] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--text3)]">{'//'} how it works</div>
          <div className="relative mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="absolute bottom-0 left-6 top-0 border-l border-dashed md:left-0 md:right-0 md:top-10 md:border-l-0 md:border-t" style={{ borderColor: 'var(--border2)' }} />
            {steps.map(([number, title, desc], index) => (
              <div key={number} className="reveal relative bg-[var(--bg)] pl-14 pr-6 md:pl-0" data-delay={String(index * 150)}>
                <div className="mono text-5xl font-bold text-[var(--text3)]">{number}</div>
                <h3 className="mt-5 text-2xl font-bold tracking-[-.02em] text-[var(--text)]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="join" className="overflow-hidden border-y bg-[var(--bg2)] py-14 text-center" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-xl font-semibold text-[var(--text)]">Early Access. Be a Founding Member. Limited spots.</h2>
          <div className="mt-5 h-5 overflow-hidden">
            <div className="mono flex w-max whitespace-nowrap text-[11px] uppercase tracking-[.12em] text-[var(--text3)]" style={{ animation: 'marquee 18s linear infinite' }}>
              <span className="pr-8">Early access Ã‚Â· Founding member Ã‚Â· Worldwide Ã‚Â· Pitch Ã‚Â· Fund Ã‚Â· Sell Ã‚Â·</span>
              <span className="pr-8">Early access Ã‚Â· Founding member Ã‚Â· Worldwide Ã‚Â· Pitch Ã‚Â· Fund Ã‚Â· Sell Ã‚Â·</span>
              <span className="pr-8">Early access Ã‚Â· Founding member Ã‚Â· Worldwide Ã‚Â· Pitch Ã‚Â· Fund Ã‚Â· Sell Ã‚Â·</span>
            </div>
          </div>
          <Link href="/signup" className="btn-primary mt-8 inline-flex">Join now</Link>
        </div>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono text-[10px] uppercase text-[var(--text3)]">{label}</div>
      <div className="mono mt-1 truncate text-base font-bold text-[var(--text)]">{value}</div>
    </div>
  );
}