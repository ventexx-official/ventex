"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Check } from 'lucide-react';

type PriceMode = 'both' | 'inr' | 'usd';

const groups = [
  {
    heading: 'For Founders',
    tiers: [
      { name: 'Free', inr: '₹0/month', usd: '$0/month', features: ['1 active pitch', '1 marketplace listing', 'Basic profile'] },
      { name: 'Builder', inr: '₹299/month', usd: '$4/month', features: ['3 pitches', '5 listings', 'Pitch score', 'AI summary', 'Analytics'] },
      { name: 'Pro', inr: '₹799/month', usd: '$10/month', features: ['Unlimited pitches + listings', 'Premium data room', 'Featured placement', 'Ventex Live priority application'] },
    ],
  },
  {
    heading: 'For Investors',
    tiers: [
      { name: 'Free', inr: '₹0/month', usd: '$0/month', features: ['View 5 pitches/month', 'Basic search'] },
      { name: 'Basic', inr: '₹499/month', usd: '$6/month', features: ['Unlimited pitch views', 'Save pitches', 'Contact founders'] },
      { name: 'Pro', inr: '₹1499/month', usd: '$18/month', features: ['All Basic features', 'Data rooms', 'Investor badge', 'Priority matching', 'Portfolio tracking', 'Analytics'] },
    ],
  },
  {
    heading: 'Marketplace Buyers (Premium)',
    tiers: [
      { name: 'Premium', inr: '₹199/month', usd: '$3/month', features: ['Buy software products', 'Post job applications', 'Request custom builds from founders'] },
    ],
  },
];

const faqs = [
  ['What is Ventex Premium?', 'Premium gives you access to the Ventex Marketplace — buy software, hire developers, and request custom builds. It does not include investor features.'],
  ['What is an Investor Account?', 'Investor accounts are for discovering startups, viewing pitches, and connecting with founders for funding. Separate from Premium.'],
  ['Can I be both a founder and an investor?', 'Yes. You can hold multiple roles under one account.'],
  ['Is there a free trial?', 'All paid tiers include a 7-day free trial. No card required.'],
  ['What currency do you charge in?', 'You can pay in INR or USD. Prices shown in both.'],
];

function displayPrice(tier: { inr: string; usd: string }, mode: PriceMode) {
  if (mode === 'inr') return tier.inr;
  if (mode === 'usd') return tier.usd;
  return `${tier.inr} · ${tier.usd}`;
}

export default function PricingPage() {
  const [mode, setMode] = useState<PriceMode>('both');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-[#F2F2F0] px-4 py-16 text-[#222222] dark:bg-[#111111] dark:text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mono mb-3 text-xs font-bold uppercase tracking-[.16em] text-[#666666] dark:text-gray-400">Pricing</p>
            <h1 className="max-w-3xl text-4xl font-black uppercase tracking-tight md:text-6xl">Plans for founders, investors, and marketplace buyers.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#666666] dark:text-gray-300">Ventex Premium is marketplace access only. Investor Accounts are separate and built for pitch discovery, deal flow, and founder contact.</p>
          </div>
          <div className="inline-flex rounded-full border border-black/10 bg-white p-1 dark:border-white/10 dark:bg-[#1a1a1a]">
            {[
              ['both', '₹ INR / $ USD'],
              ['inr', '₹ INR'],
              ['usd', '$ USD'],
            ].map(([value, label]) => (
              <button key={value} onClick={() => setMode(value as PriceMode)} className={`rounded-full px-4 py-2 text-xs font-black ${mode === value ? 'bg-[#222222] text-white dark:bg-white dark:text-[#222222]' : 'text-[#666666] dark:text-gray-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {groups.map((group) => (
            <section key={group.heading} className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#1a1a1a]">
              <h2 className="mb-5 text-xl font-black">{group.heading}</h2>
              <div className="space-y-4">
                {group.tiers.map((tier) => (
                  <article key={tier.name} className="rounded-lg border border-black/10 p-5 dark:border-white/10">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black">{tier.name}</h3>
                        <p className="mt-1 text-2xl font-black tracking-tight">{displayPrice(tier, mode)}</p>
                      </div>
                      {tier.name === 'Premium' ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">Marketplace only</span> : null}
                    </div>
                    <ul className="mt-5 space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex gap-3 text-sm text-[#555555] dark:text-gray-300">
                          <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-600" /> {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/signup?plan=${encodeURIComponent(tier.name.toLowerCase())}`} className="mt-5 inline-flex w-full justify-center rounded-xl bg-[#222222] px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-[#222222]">
                      Start 7-day trial
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#1a1a1a]">
          <h2 className="mb-4 text-2xl font-black">FAQ</h2>
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {faqs.map(([question, answer], index) => (
              <div key={question}>
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-4 py-4 text-left font-black">
                  {question}
                  <ChevronDown className={`h-5 w-5 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index ? <p className="pb-4 text-sm leading-6 text-[#666666] dark:text-gray-300">{answer}</p> : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
