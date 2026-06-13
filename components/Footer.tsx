import Link from 'next/link';

const columns = [
  {
    title: 'Product',
    links: [
      ['Discover', '/discover'],
      ['Marketplace', '/marketplace'],
      ['Catalyst', '/catalyst'],
      ['Pricing', '/pricing'],
    ],
  },
  {
    title: 'Events',
    links: [
      ['The Arena', '/arena'],
      ['Pitch Battle', '/battle'],
      ['Events', '/events'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '/about'],
      ['Investors', '/investors'],
      ['Contact', '/contact'],
      ['Resources', '/resources/schemes'],
      ['Support Ventex', 'https://buymeacoffee.com/ventexx'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Terms', '/terms'],
      ['Privacy', '/privacy'],
      ['Seller Agreement', '/seller-agreement'],
      ['Refunds', '/refund-policy'],
      ['Delivery', '/delivery-policy'],
    ],
  },
];

const socials = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/ventexhq/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/ventex_hq',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/ventexx',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@ventexhq?si=9BZ8Rg7W5tpkWkBv',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-[var(--bg2)] text-[var(--text)]" style={{ borderColor: 'var(--border)' }}>
      <div className="h-16 bg-gradient-to-b from-[var(--bg)] to-[var(--bg2)]" />
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-[1.1fr_2.4fr] md:text-left">
          <div>
            <Link href="/" className="text-xl font-bold tracking-[-.5px] text-[var(--text)]">
              Ventexx
            </Link>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--text3)] md:mx-0">
              Where startups pitch, fund and sell.
            </p>
            {/* Social Icons */}
            <div className="mt-5 flex items-center justify-center gap-3 md:justify-start">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border text-[var(--text3)] transition-colors hover:border-[var(--text2)] hover:text-[var(--text)]"
                  style={{ borderColor: 'var(--border2)' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
          &copy; {currentYear} Ventexx. Built for the world&apos;s builders.
        </div>
      </div>
    </footer>
  );
}
