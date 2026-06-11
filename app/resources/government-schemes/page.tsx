import Link from 'next/link';

const schemes = [
  {
    name: 'Startup India',
    description:
      'National initiative for startup recognition, funding access, tax benefits, and founder support across India.',
    href: 'https://www.startupindia.gov.in/',
  },
  {
    name: 'DPIIT Recognition',
    description:
      'Department for Promotion of Industry and Internal Trade startup recognition for compliance benefits and scheme eligibility.',
    href: 'https://www.startupindia.gov.in/content/sih/en/startupgov/startup-recognition-page.html',
  },
  {
    name: 'SISFS (Startup India Seed Fund Scheme)',
    description:
      'Seed capital for early-stage startups through empanelled incubators for product development and market entry.',
    href: 'https://seedfund.startupindia.gov.in/',
  },
];

export default function GovernmentSchemesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link
        href="/"
        className="text-sm text-[var(--text2)] hover:text-[var(--text)] dark:hover:text-[var(--text)] mb-8 inline-block"
      >
        &larr; Back to home
      </Link>
      <h1 className="text-3xl font-bold text-[var(--text)]  mb-12">
        Government Schemes for Indian Startups
      </h1>
      <div className="space-y-6">
        {schemes.map((scheme) => (
          <article
            key={scheme.name}
            className="bg-[var(--card-bg)] dark:bg-[var(--text)] p-6 rounded-[12px] border-[0.5px] border-[var(--border)] dark:border-[#444444]"
          >
            <h2 className="font-bold text-[var(--text)]  mb-2">{scheme.name}</h2>
            <p className="text-[var(--text2)] text-sm leading-relaxed mb-4 line-clamp-2">
              {scheme.description}
            </p>
            <a
              href={scheme.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[var(--text)]  hover:underline underline-offset-4"
            >
              Official website &rarr;
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}