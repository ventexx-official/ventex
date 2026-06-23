import React from 'react';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Investor Due Diligence Guide: How to Evaluate Startups',
  description: 'A comprehensive framework for startup investors to conduct thorough due diligence, assess founding teams, and analyze traction.',
};

export default function DueDiligenceArticle() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Investor Due Diligence Guide: How to Evaluate Startups",
    "description": "A comprehensive framework for startup investors to conduct thorough due diligence, assess founding teams, and analyze traction.",
    "author": {
      "@type": "Organization",
      "name": "Ventex"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Ventex",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.ventexx.com/logo.png"
      }
    }
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <main className="min-h-screen bg-[var(--bg)] py-20 px-4">
        <article className="max-w-3xl mx-auto prose prose-lg prose-slate dark:prose-invert">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold tracking-widest text-[var(--text3)] uppercase">Investor Guide</span>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-[var(--text)] tracking-tight leading-tight">
              The Complete Investor Due Diligence Guide
            </h1>
            <p className="mt-6 text-xl text-[var(--text2)]">
              Discover the frameworks top angels and VCs use to mitigate risk and identify breakout startup opportunities.
            </p>
          </div>

          <div className="text-[var(--text)] leading-relaxed space-y-8">
            <h2 className="text-2xl font-bold mt-12 mb-4">1. The Philosophy of Due Diligence</h2>
            <p>
              In early-stage investing, traditional financial due diligence is often impossible because there are no historical financials to analyze. Instead, early-stage due diligence is an exercise in evaluating human potential, market dynamics, and early traction signals. The goal is to identify asymmetric upside while understanding the existential risks.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">2. Assessing the Founding Team</h2>
            <p>
              The team is the most critical variable in an early-stage startup. Products pivot and markets shift, but a resilient, adaptable team can navigate these changes. Key areas to evaluate include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 text-[var(--text2)]">
              <li><strong>Founder-Market Fit:</strong> Does the team possess a unique, earned secret about this specific market?</li>
              <li><strong>Execution Velocity:</strong> How fast has the team moved since inception? Speed is a proxy for future success.</li>
              <li><strong>Complementary Skills:</strong> Does the founding team have both a visionary builder (product/tech) and a relentless seller (sales/marketing)?</li>
              <li><strong>Grit and Resilience:</strong> How have the founders handled failure or massive setbacks in the past?</li>
            </ul>

            <h2 className="text-2xl font-bold mt-12 mb-4">3. Evaluating the Market & Product</h2>
            <p>
              Even the best team will fail in a structurally terrible market. You must evaluate the market's size, growth rate, and competitive dynamics. 
            </p>
            <p className="mt-4">
              <strong>The "Why Now?" Question:</strong> Why hasn't this been built before? Has there been a recent regulatory shift, a technological breakthrough (like LLMs), or a change in consumer behavior that makes this product possible today?
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4">4. Analyzing Traction and Financials</h2>
            <p>
              Traction isn't always revenue. In pre-seed companies, traction might look like highly engaged beta users, a fast-growing waitlist, or letters of intent (LOIs) from enterprise clients. 
            </p>
            <p className="mt-4">
              When analyzing a data room on a platform like Ventex, look closely at:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 text-[var(--text2)]">
              <li><strong>Unit Economics:</strong> Are they acquiring customers profitably, or buying growth unsustainably?</li>
              <li><strong>Burn Rate:</strong> How much cash are they spending monthly, and how long will the current funding round last (runway)?</li>
              <li><strong>Cap Table:</strong> Is the cap table clean? Do the founders still retain enough equity to remain highly incentivized?</li>
            </ul>

            <h2 className="text-2xl font-bold mt-12 mb-4">5. Utilizing Digital Deal Rooms</h2>
            <p>
              Historically, due diligence required endless email chains and scattered PDFs. Today, modern investors use integrated platforms to access secure data rooms instantly. When reviewing a startup on Ventex, you can securely view cap tables, historical metrics, and legal documents in one unified interface, dramatically accelerating your decision-making process.
            </p>

            <hr className="my-12 border-[var(--border)]" />
            
            <div className="bg-[var(--card-bg)] p-8 rounded-2xl border border-[var(--border)]">
              <h4 className="text-xl font-bold text-[var(--text)] mb-2">Ready to discover your next investment?</h4>
              <p className="text-[var(--text2)] mb-6">Join Ventex to access verified startup pitches and secure data rooms.</p>
              <a href="/discover" className="btn-primary">Explore Live Startups</a>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
