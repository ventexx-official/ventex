import React from 'react';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Learn how Ventex connects founders and investors, how startup approval works, and how to successfully fundraise or discover startups on our marketplace.',
};

const faqs = [
  {
    question: "What is Ventex?",
    answer: "Ventex is a premier startup marketplace and discovery platform. We connect ambitious startup founders with verified investors, facilitating startup funding, product sales, and network growth in a single, transparent ecosystem."
  },
  {
    question: "How does Ventex work?",
    answer: "Founders create comprehensive pitch profiles featuring their traction, team, and a secure data room. Investors can browse the marketplace using advanced filters (industry, stage, thesis) to discover startups. When a match is found, investors can request access to the data room or reach out directly to the founders."
  },
  {
    question: "How do founders submit startups?",
    answer: "Founders must register and navigate to the 'Create Pitch' flow. They are required to complete 100% of their profile—including uploading a pitch deck, entering traction metrics, and defining their funding goals—before submitting the startup for review."
  },
  {
    question: "How do investors discover startups?",
    answer: "Investors use the Ventex discovery engine to scan live, verified startups. They can filter by sector, funding stage, revenue, and location. Our algorithm also highlights 'featured' startups and uses AI summaries to make pitch scanning highly efficient."
  },
  {
    question: "How does startup approval work?",
    answer: "To maintain a high-quality marketplace, every submitted pitch undergoes a manual review process by the Ventex team. We check for completeness, accuracy, and adherence to our community standards before a pitch goes 'live'."
  },
  {
    question: "How long does review take?",
    answer: "The typical review process takes between 1 to 3 business days. Founders will receive an email notification once their pitch is approved and visible on the marketplace."
  },
  {
    question: "Can startups be edited?",
    answer: "Yes, founders can edit their pitch profile at any time from their dashboard. However, significant changes to a live pitch may trigger a brief re-review to ensure continued compliance with our marketplace standards."
  },
  {
    question: "How does fundraising work?",
    answer: "Ventex acts as the discovery and connection layer. Founders list their 'amount seeking' and 'equity offered'. Interested investors connect through the platform, review the secure data room, and then negotiate terms and execute the actual funding transaction externally."
  }
];

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      
      <main className="min-h-screen bg-[var(--bg)] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text)] tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-[var(--text2)] max-w-2xl mx-auto">
              Everything you need to know about navigating the Ventex startup marketplace, from pitching to funding.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <details 
                key={index} 
                className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm transition-all hover:shadow-md cursor-pointer"
              >
                <summary className="flex items-center justify-between text-lg font-bold text-[var(--text)] outline-none list-none">
                  {faq.question}
                  <span className="ml-4 flex-shrink-0 transition-transform duration-300 group-open:rotate-180">
                    <svg className="w-5 h-5 text-[var(--text2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="mt-4 text-[var(--text2)] leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4">Still have questions?</h2>
            <Link href="/contact" className="btn-primary inline-flex">
              Contact our team
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
