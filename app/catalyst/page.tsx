"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SECTORS = ['All', 'Fintech', 'SaaS', 'AI/ML', 'Healthtech', 'Edtech', 'AgriTech'];
const FALLBACK_CATALYSTS = [
  {
    id: 'demo-catalyst-1',
    name: 'Seed GTM Catalyst',
    bio: 'Helps early B2B founders sharpen positioning, pricing, and first enterprise sales motions.',
    expertise: ['GTM', 'Pricing', 'B2B SaaS'],
    sectors: ['SaaS', 'AI/ML'],
    offers_investment: false,
    offers_mentorship: true,
    verified: true,
    photo_url: null,
  },
  {
    id: 'demo-catalyst-2',
    name: 'Fintech Angel Catalyst',
    bio: 'Works with fintech founders on compliance-aware fundraising, partner strategy, and investor readiness.',
    expertise: ['Fundraising', 'Fintech', 'Compliance'],
    sectors: ['Fintech'],
    offers_investment: true,
    offers_mentorship: true,
    verified: true,
    photo_url: null,
  },
  {
    id: 'demo-catalyst-3',
    name: 'Healthtech Mentor',
    bio: 'Supports healthtech teams with pilot design, hospital partnerships, and product validation.',
    expertise: ['Pilots', 'Partnerships', 'Healthtech'],
    sectors: ['Healthtech'],
    offers_investment: false,
    offers_mentorship: true,
    verified: false,
    photo_url: null,
  },
];

export default function CatalystPage() {
  const [catalysts, setCatalysts] = useState<any[]>([]);
  const [sector, setSector] = useState('All');
  const [investment, setInvestment] = useState(false);
  const [mentorship, setMentorship] = useState(false);
  const [query, setQuery] = useState('');
  const [application, setApplication] = useState({
    name: '',
    email: '',
    sectors: '',
    expertise: '',
    support: 'Mentorship',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('catalysts').select('*').order('created_at', { ascending: false });
      setCatalysts(data || []);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const source = catalysts.length > 0 ? catalysts : FALLBACK_CATALYSTS;
    return source.filter((catalyst) => {
      const sectorMatch = sector === 'All' || (catalyst.sectors || []).includes(sector);
      const investmentMatch = !investment || catalyst.offers_investment;
      const mentorshipMatch = !mentorship || catalyst.offers_mentorship;
      const text = [catalyst.name, catalyst.bio, ...(catalyst.expertise || []), ...(catalyst.sectors || [])].join(' ').toLowerCase();
      return sectorMatch && investmentMatch && mentorshipMatch && text.includes(query.toLowerCase());
    });
  }, [catalysts, sector, investment, mentorship, query]);

  return (
    <div className="min-h-screen bg-[#F2F2F0] px-4 py-10">
      <main className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-[#222222]">Ventex Catalyst</h1>
            <p className="mt-2 text-sm font-medium text-[#666666]">Investors who guide, not just fund.</p>
          </div>
          <Link href="/investors" className="text-sm font-black text-[#222222] underline underline-offset-4">View investor network</Link>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-[#e5e5e5] bg-white p-6">
            <h2 className="text-2xl font-black tracking-tighter text-[#222222]">Become a Catalyst</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-[#666666]">
              Apply to support founders with sector expertise, warm intros, mentorship, or capital.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="rounded-3xl border border-[#e5e5e5] bg-white p-5"
          >
            <div className="grid grid-cols-1 gap-3">
              <input
                required
                value={application.name}
                onChange={(e) => setApplication((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Name"
                className="rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] px-4 py-3 text-sm font-bold outline-none focus:border-[#222222]"
              />
              <input
                required
                type="email"
                value={application.email}
                onChange={(e) => setApplication((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] px-4 py-3 text-sm font-bold outline-none focus:border-[#222222]"
              />
              <input
                required
                value={application.sectors}
                onChange={(e) => setApplication((prev) => ({ ...prev, sectors: e.target.value }))}
                placeholder="Sectors you support"
                className="rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] px-4 py-3 text-sm font-bold outline-none focus:border-[#222222]"
              />
              <textarea
                required
                value={application.expertise}
                onChange={(e) => setApplication((prev) => ({ ...prev, expertise: e.target.value }))}
                placeholder="How can you help founders?"
                rows={3}
                className="resize-none rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] px-4 py-3 text-sm font-bold outline-none focus:border-[#222222]"
              />
              <select
                value={application.support}
                onChange={(e) => setApplication((prev) => ({ ...prev, support: e.target.value }))}
                className="rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] px-4 py-3 text-sm font-bold outline-none focus:border-[#222222]"
              >
                <option>Mentorship</option>
                <option>Investment</option>
                <option>Mentorship + Investment</option>
              </select>
              <button className="rounded-2xl bg-[#222222] py-3 text-sm font-black text-white">
                Submit application
              </button>
              {submitted ? (
                <p className="text-sm font-bold text-emerald-700">Application saved. The Ventex team will review it.</p>
              ) : null}
            </div>
          </form>
        </section>

        <div className="rounded-3xl border border-[#e5e5e5] bg-white p-4">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search expertise, sector, name..."
              className="w-full rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-[#222222]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((item) => (
              <button
                key={item}
                onClick={() => setSector(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-black ${sector === item ? 'border-[#222222] bg-[#222222] text-white' : 'border-[#e5e5e5] bg-[#F2F2F0] text-[#222222]'}`}
              >
                {item}
              </button>
            ))}
            <Toggle label="Offers Investment" enabled={investment} onClick={() => setInvestment((v) => !v)} />
            <Toggle label="Offers Mentorship" enabled={mentorship} onClick={() => setMentorship((v) => !v)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d4d4d4] bg-white p-10 text-center text-sm font-bold text-[#888888]">
            No catalysts match these filters yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {filtered.map((catalyst) => (
              <article key={catalyst.id} className="rounded-3xl border border-[#e5e5e5] bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#222222] text-lg font-black text-white">
                    {catalyst.photo_url ? <img src={catalyst.photo_url} alt="" className="h-full w-full object-cover" /> : (catalyst.name || 'C')[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-black text-[#222222]">
                      {catalyst.name || 'Catalyst'} {catalyst.verified ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                    </div>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-black ${catalyst.offers_investment ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                      {catalyst.offers_investment ? 'Invests + Mentors' : 'Mentor only'}
                    </span>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm font-medium leading-relaxed text-[#666666]">{catalyst.bio || 'No bio added yet.'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(catalyst.expertise || []).slice(0, 4).map((item: string) => (
                    <span key={item} className="rounded-full bg-[#F2F2F0] px-2 py-1 text-[11px] font-bold text-[#222222]">{item}</span>
                  ))}
                </div>
                <button className="mt-5 w-full rounded-2xl bg-[#222222] py-3 text-sm font-black text-white">Request intro</button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Toggle({ label, enabled, onClick }: { label: string; enabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-black ${enabled ? 'border-[#222222] bg-[#222222] text-white' : 'border-[#e5e5e5] bg-white text-[#222222]'}`}
    >
      {label}
    </button>
  );
}
