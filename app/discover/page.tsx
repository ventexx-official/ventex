"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Filter, Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getRunwayDays, shouldShowRunway } from '@/lib/runway';

const INDUSTRIES = ['Fintech', 'Edtech', 'Healthtech', 'SaaS', 'E-commerce', 'AI/ML', 'Cleantech', 'Logistics', 'AgriTech', 'Cybersecurity'];
const STAGES = ['Idea', 'Pre-seed', 'Seed', 'Early Growth', 'Growth'];

function formatCurrency(amount: number) {
  if (!amount) return 'Members only';
  if (amount >= 10000000) return `Rs ${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(1)}L`;
  return `Rs ${amount.toLocaleString('en-IN')}`;
}

export default function Discover() {
  const [pitches, setPitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [raisingOnly, setRaisingOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      let request = supabase
        .from('pitches')
        .select('id, title, is_raising, industry, company_stage, round_closes_at, tagline, ai_summary, short_description, amount_seeking, state, country, created_at, views, likes')
        .eq('status', 'live');

      if (sortBy === 'trending') {
        request = request.order('likes', { ascending: false }).order('created_at', { ascending: false });
      } else {
        request = request.order('created_at', { ascending: false });
      }

      const { data, error: fetchError } = await request;
      if (fetchError) {
        console.error('[Discover] pitch fetch failed:', fetchError);
        setError('Failed to load startups. Please try again later.');
      }
      setPitches(data || []);
      setLoading(false);
    };
    load();
  }, [sortBy]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pitches.filter((pitch) => {
      const queryMatch = !q || [pitch.title, pitch.tagline, pitch.short_description, pitch.industry, pitch.company_stage, pitch.state, pitch.country]
        .join(' ')
        .toLowerCase()
        .includes(q);
      const industryMatch = industries.length === 0 || industries.includes(pitch.industry);
      const stageMatch = stages.length === 0 || stages.includes(pitch.company_stage);
      const countryMatch = countries.length === 0 || countries.includes(pitch.country);
      const raisingMatch = !raisingOnly || pitch.is_raising;
      return queryMatch && industryMatch && stageMatch && countryMatch && raisingMatch;
    });
  }, [pitches, query, industries, stages, countries, raisingOnly]);

  const toggle = (value: string, list: string[], setList: (items: string[]) => void) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const resetFilters = () => {
    setIndustries([]);
    setStages([]);
    setCountries([]);
    setRaisingOnly(false);
    setQuery('');
  };

  const filters = (
    <div className="space-y-8">
      <FilterGroup title="Industry" values={INDUSTRIES} selected={industries} onToggle={(v) => toggle(v, industries, setIndustries)} />
      <FilterGroup title="Stage" values={STAGES} selected={stages} onToggle={(v) => toggle(v, stages, setStages)} />
      <FilterGroup title="Country" values={['United States', 'United Kingdom', 'Germany', 'India']} selected={countries} onToggle={(v) => toggle(v, countries, setCountries)} />
      <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--text)]">
        <input type="checkbox" checked={raisingOnly} onChange={(e) => setRaisingOnly(e.target.checked)} />
        Actively raising only
      </label>
      <button type="button" onClick={resetFilters} className="btn-secondary w-full">Reset filters</button>
    </div>
  );

  const showFilters = loading || pitches.length > 0;

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
                placeholder="Search startups, sectors, countries..."
                className="w-full border bg-[var(--bg)] py-3 pl-11 pr-4 text-sm font-medium text-[var(--text)] outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:flex-row">
        {showFilters ? (
          <aside className="hidden w-[200px] shrink-0 border-r pr-6 md:block lg:w-[260px]" style={{ borderColor: 'var(--border)' }}>
            {filters}
          </aside>
        ) : null}

        {showFilters ? (
          <div className="md:hidden">
            <button type="button" onClick={() => setDrawerOpen(true)} className="btn-secondary inline-flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </button>
            {drawerOpen ? (
              <div className="fixed inset-0 z-50 bg-black/40">
                <div className="ml-auto h-full w-[86vw] max-w-sm overflow-y-auto bg-[var(--bg)] p-5 shadow-2xl">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-black text-[var(--text)]">Filters</h2>
                    <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close filters">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  {filters}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <main className="min-w-0 flex-1">
          {showFilters ? (
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="mono text-xs text-[var(--text3)]">{filtered.length} startups</p>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none" style={{ borderColor: 'var(--border)' }}>
                <option value="recent">Recent</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[300px] animate-pulse bg-[var(--bg3)] border rounded-[16px]" style={{ borderColor: 'var(--border)' }} />
              ))}
            </div>
          ) : error ? (
            <div className="grid-bg flex min-h-[360px] items-center justify-center border text-center" style={{ borderColor: 'var(--border)' }}>
              <div className="max-w-md px-6">
                <div className="mono text-xs uppercase tracking-[.12em] text-red-500">{'//'} error</div>
                <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{error}</p>
                <button type="button" onClick={() => window.location.reload()} className="btn-secondary mt-6 inline-flex">Retry</button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid-bg flex min-h-[360px] items-center justify-center border text-center" style={{ borderColor: 'var(--border)' }}>
              <div className="max-w-md px-6">
                <div className="mono text-xs uppercase tracking-[.12em] text-[var(--text3)]">{'//'} early access</div>
                <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
                  {pitches.length === 0 ? 'No startups yet. Be the first to pitch.' : 'No startups match your filters yet. Try loosening the filters or search query.'}
                </p>
                <Link href="/founder/create-pitch" className="btn-primary mt-6 inline-flex">Submit your pitch →</Link>
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
      <div className="flex flex-col gap-2">
        {values.map((value) => (
          <button key={value} onClick={() => onToggle(value)} className={`tag w-fit border transition-transform hover:translate-x-0.5 ${selected.includes(value) ? 'border-[var(--text)] text-[var(--text)]' : 'border-transparent'}`}>
            {value}
          </button>
        ))}
      </div>
    </section>
  );
}

function PitchCard({ pitch, delay }: { pitch: any; delay: number }) {
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
        {showRunway && runwayDays !== null ? <span className="tag border border-red-200 bg-red-50 text-red-600">Closes in {runwayDays} days</span> : null}
      </div>
      <p className="mt-4 line-clamp-3 flex-1 text-[13px] leading-6 text-[var(--text2)]">{pitch.tagline || pitch.ai_summary || pitch.short_description || 'No summary yet.'}</p>
      <div className="my-5 h-px bg-[var(--border)]" />
      <div className="grid grid-cols-3 gap-3">
        <Metric label="Ask" value={formatCurrency(pitch.amount_seeking)} />
        <Metric label="Equity" value="Members only" />
        <Metric label="Valuation" value="Members only" />
      </div>
      <p className="mt-4 text-[11px] font-semibold text-[var(--text3)]">Financial details visible to registered members only.</p>
      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="tag">{[pitch.state, pitch.country].filter(Boolean).join(', ') || 'Global'}</span>
        <span className="text-[var(--text2)]">View pitch</span>
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
