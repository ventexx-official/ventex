import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ventex Learn | Startup & Investor Guides',
  description: 'Comprehensive guides and resources for startup founders and investors. Learn how to pitch, raise funds, and conduct due diligence.',
};

const guides = [
  {
    title: 'How to pitch a startup',
    slug: 'how-to-pitch-a-startup',
    description: 'A complete guide to crafting a compelling startup pitch that captures investor attention and secures meetings.'
  },
  {
    title: 'Investor due diligence guide',
    slug: 'investor-due-diligence-guide',
    description: 'Learn how to evaluate early-stage startups, assess team capabilities, and analyze traction metrics.'
  },
  {
    title: 'How to find investors',
    slug: 'how-to-find-investors',
    description: 'Actionable strategies for discovering, reaching out to, and building relationships with the right investors.'
  },
  {
    title: 'How startup fundraising works',
    slug: 'how-startup-fundraising-works',
    description: 'Understand the mechanics of startup funding rounds, from Pre-Seed to Series A and beyond.'
  },
  {
    title: 'How to validate a startup idea',
    slug: 'how-to-validate-startup-idea',
    description: 'A step-by-step framework to test your hypothesis before building your product.'
  },
  {
    title: 'Startup marketplace guide',
    slug: 'startup-marketplace-guide',
    description: 'How to leverage startup marketplaces like Ventex to accelerate your fundraising and discovery.'
  },
  {
    title: 'Startup founder handbook',
    slug: 'startup-founder-handbook',
    description: 'Essential knowledge for first-time founders navigating the complexities of company building.'
  },
  {
    title: 'Startup valuation basics',
    slug: 'startup-valuation-basics',
    description: 'A primer on how early-stage startups are valued and how to negotiate your equity pool.'
  }
];

export default function LearnHub() {
  return (
    <main className="min-h-screen bg-[var(--bg)] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="mono inline-flex items-center gap-2 border px-3 py-1.5 text-[11px] font-medium text-[var(--text2)] mb-8 rounded-full bg-[var(--bg2)]" style={{ borderColor: 'var(--border2)' }}>
            Knowledge Base
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--text)] tracking-tight mb-6">
            Ventex Guides & Resources
          </h1>
          <p className="text-lg text-[var(--text2)] max-w-2xl mx-auto">
            Deep-dive articles, strategic playbooks, and tactical advice designed to help founders raise capital and investors discover breakout companies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide, idx) => (
            <Link 
              href={`/learn/${guide.slug}`} 
              key={idx}
              className="group block card p-8 transition-all hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold text-[var(--text)] mb-3 group-hover:text-blue-600 transition-colors">
                {guide.title}
              </h2>
              <p className="text-sm text-[var(--text2)] leading-relaxed mb-6">
                {guide.description}
              </p>
              <div className="text-[12px] font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
                Read guide <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
