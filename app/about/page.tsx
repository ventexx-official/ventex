import React from 'react';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'About Ventex | The Ultimate Startup Pitch Platform',
  description: 'Learn about the mission, founder story, and vision behind Ventex. We are building the most transparent and efficient startup marketplace in the world.',
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Ventex",
      "description": "Ventex is a startup marketplace dedicated to democratizing access to capital and deal flow by connecting founders directly with verified investors."
    }
  };

  return (
    <>
      <JsonLd data={aboutSchema} />
      <main className="min-h-screen bg-[var(--bg)] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--text)] tracking-tight mb-6">
              Democratizing Startup Discovery
            </h1>
            <p className="text-xl text-[var(--text2)] max-w-2xl mx-auto leading-relaxed">
              Ventex was built on a simple premise: great ideas shouldn't die because of geographic barriers or closed-door networks.
            </p>
          </div>

          <div className="space-y-20">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-[var(--text)] mb-6">Our Mission</h2>
                <p className="text-[var(--text2)] text-lg leading-relaxed mb-4">
                  We exist to eliminate the friction in early-stage fundraising and startup discovery. By building a transparent, highly-efficient marketplace, we give founders the platform they need to tell their story, and investors the tools they need to discover the next generation of category-defining companies.
                </p>
                <p className="text-[var(--text2)] text-lg leading-relaxed">
                  We believe that capital should flow to the best execution, not just the warmest introductions.
                </p>
              </div>
              <div className="bg-[var(--card-bg)] p-8 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="text-4xl font-bold text-blue-600 mb-2">0%</div>
                <div className="text-[var(--text)] font-medium mb-6">Syndicate or carry fees charged by Ventex on direct investments.</div>
                <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-[var(--text)] font-medium">Founder control over their pitch narrative and data room access.</div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-[var(--text)] mb-8 text-center">The Platform Purpose</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[var(--bg2)] p-8 rounded-2xl border border-[var(--border2)]">
                  <h3 className="text-xl font-bold text-[var(--text)] mb-3">For Founders</h3>
                  <p className="text-[var(--text2)]">A unified digital pitch room. Host your deck, track your traction, secure your data room, and pitch to hundreds of investors simultaneously without sending a single cold email.</p>
                </div>
                <div className="bg-[var(--bg2)] p-8 rounded-2xl border border-[var(--border2)]">
                  <h3 className="text-xl font-bold text-[var(--text)] mb-3">For Investors</h3>
                  <p className="text-[var(--text2)]">High-signal deal flow. Use our AI-powered summaries and granular filters to find startups that match your exact investment thesis in seconds, not hours.</p>
                </div>
                <div className="bg-[var(--bg2)] p-8 rounded-2xl border border-[var(--border2)]">
                  <h3 className="text-xl font-bold text-[var(--text)] mb-3">For the Ecosystem</h3>
                  <p className="text-[var(--text2)]">A rising tide lifts all boats. By fostering direct connections, we accelerate the velocity of innovation and capital deployment globally.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
