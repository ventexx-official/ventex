"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import InvestorResponseBadge from '@/components/InvestorResponseBadge';

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('response_rate');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, bio, response_rate, investment_thesis, preferred_sectors, preferred_stages')
        .eq('role', 'investor');
      setInvestors(data || []);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return investors
      .filter((investor) => {
        const haystack = [
          investor.full_name,
          investor.bio,
          investor.investment_thesis,
          ...(investor.preferred_sectors || []),
          ...(investor.preferred_stages || []),
        ].join(' ').toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'response_rate') return (b.response_rate ?? 100) - (a.response_rate ?? 100);
        return (a.full_name || '').localeCompare(b.full_name || '');
      });
  }, [investors, query, sortBy]);

  return (
    <div className="min-h-screen bg-[#F2F2F0] px-4 py-10">
      <main className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-[#222222]">Investor network</h1>
            <p className="mt-2 text-sm font-medium text-[#666666]">Find investors by thesis, stage, sector, and founder response rate.</p>
          </div>
          <Link href="/discover" className="text-sm font-black text-[#222222] underline underline-offset-4">Browse pitches</Link>
        </header>

        <div className="flex flex-col gap-3 rounded-3xl border border-[#e5e5e5] bg-white p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sector, stage, thesis..."
              className="w-full rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-[#222222]"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] px-4 py-3 text-sm font-bold text-[#222222] outline-none"
          >
            <option value="response_rate">Sort by response rate</option>
            <option value="name">Sort by name</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {filtered.map((investor) => (
            <Link key={investor.id} href={`/profile/${investor.id}`} className="rounded-3xl border border-[#e5e5e5] bg-white p-6 transition hover:shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#222222] text-sm font-black text-white">
                  {investor.avatar_url ? <img src={investor.avatar_url} alt="" className="h-full w-full object-cover" /> : (investor.full_name || 'I')[0]}
                </div>
                <div>
                  <div className="font-black text-[#222222]">{investor.full_name || 'Investor'}</div>
                  <InvestorResponseBadge response_rate={investor.response_rate} />
                </div>
              </div>
              <p className="line-clamp-3 text-sm font-medium leading-relaxed text-[#666666]">
                {investor.investment_thesis || investor.bio || 'Thesis not added yet.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(investor.preferred_sectors || []).slice(0, 3).map((sector: string) => (
                  <span key={sector} className="rounded-full bg-[#F2F2F0] px-2 py-1 text-[11px] font-bold text-[#222222]">{sector}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
