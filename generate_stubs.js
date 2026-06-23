const fs = require('fs');
const path = require('path');

const stubs = [
  'how-to-find-investors',
  'how-startup-fundraising-works',
  'how-to-validate-startup-idea',
  'startup-marketplace-guide',
  'startup-founder-handbook',
  'startup-valuation-basics'
];

const template = (slug) => `import React from 'react';
import Link from 'next/link';

export default function ArticleStub() {
  return (
    <main className="min-h-screen bg-[var(--bg)] py-20 px-4 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-4">
          ${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </h1>
        <p className="text-[var(--text2)] mb-8">This comprehensive guide is currently being written. Check back soon!</p>
        <Link href="/learn" className="btn-primary">Back to Knowledge Base</Link>
      </div>
    </main>
  );
}`;

stubs.forEach(slug => {
  const dir = path.join('C:\\Users\\HP\\Ventex\\app\\learn', slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), template(slug));
});
console.log('Stubs created successfully');
