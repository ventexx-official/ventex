import React from 'react';
import Link from 'next/link';

export default function ArticleStub() {
  return (
    <main className="min-h-screen bg-[var(--bg)] py-20 px-4 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-4">
          Startup Founder Handbook
        </h1>
        <p className="text-[var(--text2)] mb-8">This comprehensive guide is currently being written. Check back soon!</p>
        <Link href="/learn" className="btn-primary">Back to Knowledge Base</Link>
      </div>
    </main>
  );
}