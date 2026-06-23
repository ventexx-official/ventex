import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ventex vs AngelList - Startup Platform Comparison',
  description: 'See how Ventex compares to AngelList for startup fundraising, investor discovery, and pitch management.',
};

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-bold tracking-widest text-[var(--text3)] uppercase">Platform Comparison</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-[var(--text)] tracking-tight">
            Ventex vs AngelList
          </h1>
          <p className="mt-4 text-lg text-[var(--text2)]">
            Why founders and investors are choosing Ventex over traditional investment syndicates platforms.
          </p>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] overflow-hidden mb-16 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--bg2)] border-b border-[var(--border)]">
                <th className="p-6 font-bold text-[var(--text)]">Feature</th>
                <th className="p-6 font-bold text-blue-600 bg-blue-50/10">Ventex</th>
                <th className="p-6 font-bold text-[var(--text2)]">AngelList</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
              <tr>
                <td className="p-6 font-medium">Core Focus</td>
                <td className="p-6 bg-blue-50/10">Startup pitching & direct investor networking</td>
                <td className="p-6 text-[var(--text2)]">Investment Syndicates</td>
              </tr>
              <tr>
                <td className="p-6 font-medium">Secure Deal Rooms</td>
                <td className="p-6 bg-blue-50/10">Integrated out-of-the-box</td>
                <td className="p-6 text-[var(--text2)]">Limited / Third-party</td>
              </tr>
              <tr>
                <td className="p-6 font-medium">Direct Messaging</td>
                <td className="p-6 bg-blue-50/10">Yes, direct to verified investors</td>
                <td className="p-6 text-[var(--text2)]">Restricted / Syndicated</td>
              </tr>
              <tr>
                <td className="p-6 font-medium">AI Pitch Summaries</td>
                <td className="p-6 bg-blue-50/10">Automated AI parsing</td>
                <td className="p-6 text-[var(--text2)]">Manual entry only</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-[var(--bg2)] p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-[var(--text)] mb-4">For Founders</h3>
            <p className="text-[var(--text2)] leading-relaxed">
              Unlike AngelList, Ventex gives founders a unified pitch profile complete with video, documents, and integrated data rooms. You control exactly who sees your sensitive traction metrics, allowing you to pitch globally without compromising confidentiality.
            </p>
          </div>
          <div className="bg-[var(--bg2)] p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-[var(--text)] mb-4">For Investors</h3>
            <p className="text-[var(--text2)] leading-relaxed">
              While AngelList focuses on investment syndicates, Ventex focuses on high-signal discovery. Use granular filtering to find startups matching your exact thesis, review AI-generated summaries, and request data room access in one click.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Ready to see the difference?</h2>
          <div className="flex justify-center gap-4">
            <Link href="/founder/create-pitch" className="btn-primary">I'm a Founder</Link>
            <Link href="/discover" className="btn-secondary">I'm an Investor</Link>
          </div>
        </div>
      </div>
    </main>
  );
}