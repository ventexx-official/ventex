"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getRunwayDays, shouldShowRunway } from '@/lib/runway';
import InvestorResponseBadge from '@/components/InvestorResponseBadge';

const INDUSTRIES = ['Fintech', 'Edtech', 'Healthtech', 'SaaS', 'E-commerce', 'AI/ML', 'Cleantech', 'Logistics', 'AgriTech', 'Cybersecurity'];
const STAGES = ['Idea', 'Pre-seed', 'Seed', 'Early Growth', 'Growth'];
const FALLBACK_INVESTORS = [
  {
    id: 'demo-investor-1',
    full_name: 'Fintech Angel',
    avatar_url: null,
    investment_thesis: 'Looks for early payment, lending, and workflow startups with India-first distribution.',
    preferred_sectors: ['Fintech', 'SaaS'],
    response_rate: 92,
  },
  {
    id: 'demo-investor-2',
    full_name: 'SaaS Operator',
    avatar_url: null,
    investment_thesis: 'Supports B2B SaaS founders with GTM, pricing, and enterprise sales feedback.',
    preferred_sectors: ['SaaS', 'AI/ML'],
    response_rate: 84,
  },
  {
    id: 'demo-investor-3',
    full_name: 'Consumer Builder',
    avatar_url: null,
    investment_thesis: 'Interested in consumer, commerce, and marketplace founders building from India.',
    preferred_sectors: ['E-commerce', 'Logistics'],
    response_rate: 78,
  },
];

function formatCurrency(amount: number) {
  if (!amount) return 'N/A';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function Discover() {
  const [pitches, setPitches] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [raisingOnly, setRaisingOnly] = useState(false);
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let request = supabase.from('pitches').select('*').eq('status', 'live');
      if (sortBy === 'latest') request = request.order('created_at', { ascending: false });
      if (sortBy === 'most_viewed') request = request.order('views', { ascending: false });
      if (sortBy === 'funding_high') request = request.order('amount_seeking', { ascending: false });
      const { data } = await request;
      setPitches(data || []);
      setLoading(false);
    };
    load();
  }, [sortBy]);

  useEffect(() => {
    const loadInvestors = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, investment_thesis, preferred_sectors, response_rate')
        .eq('role', 'investor')
        .order('response_rate', { ascending: false })
        .limit(3);
      setInvestors(data || []);
    };
    loadInvestors();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return pitches.filter((pitch) => {
      const queryMatch = [pitch.title, pitch.tagline, pitch.industry, pitch.company_stage, pitch.state, pitch.country]
        .join(' ')
        .toLowerCase()
        .includes(q);
      const industryMatch = industries.length === 0 || industries.includes(pitch.industry);
      const stageMatch = stages.length === 0 || stages.includes(pitch.company_stage);
      const raisingMatch = !raisingOnly || pitch.is_raising;
      return queryMatch && industryMatch && stageMatch && raisingMatch;
    });
  }, [pitches, query, industries, stages, raisingOnly]);

  const toggle = (value: string, list: string[], setList: (items: string[]) => void) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const filters = (
    <div className="space-y-8">
      <FilterGroup title="Industry" values={INDUSTRIES} selected={industries} onToggle={(v) => toggle(v, industries, setIndustries)} />
      <FilterGroup title="Stage" values={STAGES} selected={stages} onToggle={(v) => toggle(v, stages, setStages)} />
      <div>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--text)]">
          <input type="checkbox" checked={raisingOnly} onChange={(e) => setRaisingOnly(e.target.checked)} />
          Actively raising only
        </label>
      </div>
      <button
        type="button"
        onClick={() => {
          setIndustries([]);
          setStages([]);
          setRaisingOnly(false);
          setQuery('');
        }}
        className="btn-secondary w-full"
      >
        Reset filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="grid-bg border-b bg-[var(--bg2)]/70 px-4 py-16" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="mono text-[10px] font-bold uppercase tracking-[.12em] text-[var(--text3)]">{'//'} discover startups</div>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="max-w-2xl text-4xl font-extrabold tracking-[-.04em] text-[var(--text)] md:text-6xl">Browse investor-ready startups.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--text2)]">Filter by sector, stage, traction signals, and fundraising status across the Ventex startup graph.</p>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text3)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search startups, sectors, states..."
                className="w-full border bg-[var(--bg)] py-3 pl-11 pr-4 text-sm font-medium text-[var(--text)] outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:flex-row">
        <aside className="hidden w-[200px] shrink-0 border-r pr-6 md:block lg:w-[260px]" style={{ borderColor: 'var(--border)' }}>
          {filters}
        </aside>

        <div className="md:hidden">
          <div className="-mx-4 overflow-x-auto px-4 pb-2">
            <div className="flex w-max gap-2">
              <button
                type="button"
                onClick={() => setRaisingOnly(!raisingOnly)}
                className={`tag min-h-11 border px-4 ${raisingOnly ? 'border-[var(--text)] text-[var(--text)]' : 'border-transparent'}`}
              >
                Raising only
              </button>
              {[...INDUSTRIES, ...STAGES].map((value) => {
                const selected = industries.includes(value) || stages.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      if (INDUSTRIES.includes(value)) toggle(value, industries, setIndustries);
                      else toggle(value, stages, setStages);
                    }}
                    className={`tag min-h-11 border px-4 ${selected ? 'border-[var(--text)] text-[var(--text)]' : 'border-transparent'}`}
                  >
                    {value}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setIndustries([]);
                  setStages([]);
                  setRaisingOnly(false);
                  setQuery('');
                }}
                className="tag min-h-11 border border-[var(--border)] px-4"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <main className="min-w-0 flex-1">
          {(investors.length > 0 ? investors : FALLBACK_INVESTORS).length > 0 && (
            <section className="mb-6">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-sm font-bold text-[var(--text)]">Responsive investors</h2>
                <Link href="/investors" className="link-underline text-xs font-semibold text-[var(--text2)]">View all</Link>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {(investors.length > 0 ? investors : FALLBACK_INVESTORS).map((investor) => (
                  <Link
                    key={investor.id}
                    href={investor.id.startsWith('demo-') ? '/investors' : `/profile/${investor.id}`}
                    className="border bg-[var(--bg2)] p-4 transition-colors hover:bg-[var(--bg3)]"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--text)] text-sm font-black text-[var(--bg)]">
                        {investor.avatar_url ? <img src={investor.avatar_url} alt="" className="h-full w-full object-cover" /> : (investor.full_name || 'I')[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-[var(--text)]">{investor.full_name || 'Investor'}</div>
                        <div className="mt-2">
                          <InvestorResponseBadge response_rate={investor.response_rate} />
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-[var(--text2)]">
                      {investor.investment_thesis || (investor.preferred_sectors || []).join(', ') || 'Thesis not added yet.'}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="mono text-xs text-[var(--text3)]">{filtered.length} startups</p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none" style={{ borderColor: 'var(--border)' }}>
              <option value="latest">Latest</option>
              <option value="most_viewed">Most viewed</option>
              <option value="funding_high">Funding: High to low</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[300px] animate-pulse bg-[var(--bg3)]" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid-bg flex min-h-[360px] items-center justify-center border text-center" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="mono text-xs uppercase tracking-[.12em] text-[var(--text3)]">{'//'} no results</div>
                <p className="mt-3 text-sm text-[var(--text2)]">Try loosening the filters or search query.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((pitch, index) => <PitchCard key={pitch.id} pitch={pitch} delay={index * 50} />)}
            </div>
          )}
        </main>
      </div>

    </div>
  );
}

function FilterGroup({ title, values, selected, onToggle }: { title: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <section>
      <h3 className="mono mb-4 text-[10px] font-bold uppercase tracking-[.12em] text-[var(--text3)]">{title}</h3>
      <div className="flex flex-wrap gap-2 md:flex-col">
        {values.map((value) => (
          <button
            key={value}
            onClick={() => onToggle(value)}
            className={`tag w-fit border transition-transform hover:translate-x-0.5 ${selected.includes(value) ? 'border-[var(--text)] text-[var(--text)]' : 'border-transparent'}`}
          >
            {value}
          </button>
        ))}
      </div>
    </section>
  );
}

function PitchCard({ pitch, delay }: { pitch: any; delay: number }) {
  const valuation = pitch.amount_seeking && pitch.equity_pct ? pitch.amount_seeking / (pitch.equity_pct / 100) : 0;
  const runwayDays = getRunwayDays(pitch.round_closes_at);
  const showRunway = shouldShowRunway(pitch.is_raising, pitch.round_closes_at);

  return (
    <Link href={`/pitch/${pitch.id}`} className="card reveal flex min-h-[320px] flex-col p-5" data-delay={String(Math.min(delay, 300))}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="min-w-0 truncate text-lg font-bold text-[var(--text)]">{pitch.title || 'Untitled startup'}</h2>
        <span className="tag">{pitch.is_raising ? 'Raising' : 'Verified'}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {pitch.industry ? <span className="tag">{pitch.industry}</span> : null}
        {pitch.company_stage ? <span className="tag">{pitch.company_stage}</span> : null}
        {showRunway && runwayDays !== null ? <span className="tag border border-red-200 bg-red-50 text-red-600">⏰ Closes in {runwayDays} days</span> : null}
      </div>
      <p className="mt-4 line-clamp-3 flex-1 text-[13px] leading-6 text-[var(--text2)]">{pitch.tagline || pitch.ai_summary || pitch.short_description || 'No summary yet.'}</p>
      <div className="my-5 h-px bg-[var(--border)]" />
      <div className="grid grid-cols-3 gap-3">
        <Metric label="Ask" value={formatCurrency(pitch.amount_seeking)} />
        <Metric label="Equity" value={pitch.equity_pct ? `${pitch.equity_pct}%` : 'N/A'} />
        <Metric label="Valuation" value={valuation ? formatCurrency(valuation) : 'N/A'} />
      </div>
      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="tag">{[pitch.state, pitch.country].filter(Boolean).join(', ') || 'India'}</span>
        <span className="text-[var(--text2)]">View pitch →</span>
      </div>
    </Link>
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
