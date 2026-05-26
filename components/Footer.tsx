import Link from 'next/link';

const columns = [
  {
    title: 'Product',
    links: [
      ['Discover', '/discover'],
      ['Marketplace', '/marketplace'],
      ['Catalyst', '/catalyst'],
      ['Pitch battle', '/battle'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '/about'],
      ['Investors', '/investors'],
      ['Resources', '/resources/schemes'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Terms', '/terms'],
      ['Privacy', '/privacy'],
      ['Seller Agreement', '/seller-agreement'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t bg-[var(--bg2)] text-[var(--text)]" style={{ borderColor: 'var(--border)' }}>
      <div className="h-16 bg-gradient-to-b from-[var(--bg)] to-[var(--bg2)]" />
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-[1.4fr_2fr] md:text-left">
          <div>
            <Link href="/" className="text-xl font-bold tracking-[-.5px] text-[var(--text)]">
              Ventex
            </Link>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--text3)] md:mx-0">
              Where startups pitch, fund and sell.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="mono mb-4 text-[10px] font-bold uppercase tracking-[.12em] text-[var(--text3)]">{column.title}</h3>
                <div className="flex flex-col items-center space-y-3 md:items-start">
                  {column.links.map(([label, href]) => (
                    <Link key={href} href={href} className="link-underline block w-fit text-sm text-[var(--text2)] hover:text-[var(--text)]">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mono mt-10 border-t pt-6 text-xs text-[var(--text3)]" style={{ borderColor: 'var(--border)' }}>
          © 2025 Ventex. Built for India&apos;s builders.
        </div>
      </div>
    </footer>
  );
}
