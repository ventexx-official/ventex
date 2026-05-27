import { Globe, Handshake, Megaphone, Shield, ShoppingBag, TrendingUp, Users, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import SectionIndicator from '@/components/SectionIndicator';
import ArenaEvents from '@/components/ArenaEvents';

function formatCurrency(amount: number) {
  if (!amount) return 'N/A';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

const features = [
  {
    icon: Megaphone,
    title: 'Investor-grade pitch profiles',
    desc: 'Turn a rough startup idea into a structured profile with traction, documents, video, Q&A, and AI summaries.',
  },
  {
    icon: TrendingUp,
    title: 'Funding-ready signals',
    desc: 'Runway countdowns, response badges, XP, pitch scores, and investor matching help strong founders stand out.',
  },
  {
    icon: Shield,
    title: 'Premium data rooms',
    desc: 'Protect traction and confidential documents while giving verified investors enough context to move fast.',
  },
  {
    icon: Users,
    title: 'Investor and catalyst network',
    desc: 'Find investors, mentors, and operators by sector, stage, thesis, and response behavior.',
  },
  {
    icon: Zap,
    title: 'Momentum loops',
    desc: 'Weekly battles, heat maps, founding member nudges, and XP make progress visible every week.',
  },
  {
    icon: Globe,
    title: 'Built for founders worldwide',
    desc: 'Global resources, founder workflows, and marketplace tooling built around startup realities.',
  },
];

const featureLinks = ['/pricing#founders', '/pricing#investors', '/pricing#data-rooms', '/catalyst', '/arena', '/marketplace'];

const steps = [
  ['01', 'Submit your pitch', 'Create a sharp public profile with video, traction, fundraising details, and documents.'],
  ['02', 'Get matched', 'Investors discover you through search, thesis matching, saved pitches, and weekly ecosystem surfaces.'],
  ['03', 'Sell and scale', 'List products, unlock deal rooms, build proof, and convert attention into revenue or funding.'],
];

export default async function Home() {
  const { data: statsRows } = await supabase.rpc('get_homepage_stats');
  const livePitches = Number(statsRows?.[0]?.live_pitches ?? 0);
  const investors = Number(statsRows?.[0]?.investors ?? 0);

  const [{ data: pitches }, { count: productsCount }] = await Promise.all([
    supabase.from('pitches').select('*').eq('status', 'live').limit(3),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'live'),
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

  return (
    <>
      <SectionIndicator />

      <section id="hero" className="grid-bg relative min-h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg)]">
        <div className="absolute inset-0 bg-[var(--bg)]/60" />
        <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center">
          <div className="reveal mono inline-flex items-center gap-2 border px-3 py-1.5 text-[11px] font-medium text-[var(--text2)]" style={{ borderColor: 'var(--border2)' }}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            v1.0 · Early Access Now Open
          </div>

          <h1 className="mt-8 max-w-5xl text-balance text-[clamp(32px,8vw,72px)] font-extrabold leading-none tracking-[-.04em] text-[var(--text)]">
            Where startups pitch, fund and sell.
          </h1>

          <p className="reveal mt-6 max-w-[440px] text-[15px] leading-7 text-[var(--text2)]" data-delay="200">
            The platform for founders, investors, and startup builders — worldwide.
          </p>

          <div className="reveal mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center" data-delay="300">
            <Link href="/founder/create-pitch" className="btn-primary inline-flex">Submit your pitch</Link>
            <Link href="/discover" className="btn-secondary">Browse startups →</Link>
          </div>

          <div className="reveal mono mt-10 hidden text-[11px] text-[var(--text3)] sm:block" data-delay="300">
            {'//'} {livePitches > 20 && investors > 10 && (productsCount ?? 0) > 10
              ? `${livePitches} startups · ${investors} investors · ${productsCount ?? 0} products`
              : 'A growing global network of founders, investors, and builders.'}
          </div>

          <div className="absolute bottom-8 left-1/2 h-12 w-px -translate-x-1/2 overflow-hidden bg-[var(--border)]">
            <span className="block h-6 w-px bg-[var(--text)]" style={{ animation: 'line-drop 1.6s ease-in-out infinite' }} />
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
            <Link href="/discover" className="link-underline hidden text-sm font-semibold text-[var(--text2)] hover:text-[var(--text)] sm:block">View all →</Link>
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
                    <span className="text-[var(--text2)]">View pitch →</span>
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
                  <Link href={featureLinks[index]} className="mono mt-6 inline-flex text-[11px] font-bold text-[var(--text2)] hover:text-[var(--text)]">Learn more →</Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y bg-[#090504] py-16 text-white" style={{ borderColor: 'rgba(245,158,11,.25)' }}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="mono text-[10px] font-bold uppercase tracking-[.16em] text-amber-200/70">{'//'} the arena</div>
          <div className="mt-5 grid gap-8 lg:grid-cols-[.9fr_1.4fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-[-.03em] md:text-5xl">THE ARENA IS COMING.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-orange-50/75">
                India&apos;s first monthly live startup pitch event. 5 founders. Real investors. Live and on record.
              </p>
              <Link href="/arena" className="mt-7 inline-flex rounded-full bg-amber-300 px-5 py-3 text-sm font-black text-[#160b04]">
                See upcoming events
              </Link>
            </div>
            <ArenaEvents compact />
          </div>
        </div>
      </section>

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
          <div className="mono mt-5 flex whitespace-nowrap text-[11px] uppercase tracking-[.12em] text-[var(--text3)]" style={{ animation: 'marquee 18s linear infinite' }}>
            <span className="pr-8">Early access · Founding member · Worldwide · Pitch · Fund · Sell ·</span>
            <span className="pr-8">Early access · Founding member · Worldwide · Pitch · Fund · Sell ·</span>
            <span className="pr-8">Early access · Founding member · Worldwide · Pitch · Fund · Sell ·</span>
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
