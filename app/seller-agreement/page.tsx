import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seller Agreement · Ventex',
  description: 'Seller Agreement for Ventex marketplace — free platform, direct P2P transactions.',
  alternates: {
    canonical: '/seller-agreement',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Seller Agreement · Ventex',
    description: 'Seller Agreement for Ventex marketplace — free platform, direct P2P transactions.',
    type: 'website',
    siteName: 'Ventex',
  },
};

const sections = [
  {
    id: 'overview',
    title: '1. Overview',
    content:
      'This Seller Agreement governs your use of the Ventex Marketplace as a seller. By listing products on Ventex, you agree to these terms. Ventex is currently in early access and is completely free to use.',
  },
  {
    id: 'free-platform',
    title: '2. Free Platform & Direct Transactions',
    content:
      'During early access, Ventex is a free connection platform. All transactions occur directly between buyers and sellers. Ventex does not process, hold, or take any percentage of payments. Buyers and sellers arrange payment privately via UPI, bank transfer, PayPal, or any agreed method.',
  },
  {
    id: 'whatsapp',
    title: '3. WhatsApp P2P Contact System',
    content:
      'When a buyer initiates a purchase, Ventex generates a deal code and opens a WhatsApp conversation with you directly. You are responsible for confirming availability, agreeing on delivery timelines, collecting payment, and delivering the product. Ventex provides the connection — the rest is between you and the buyer.',
  },
  {
    id: 'seller-obligations',
    title: '4. Seller Obligations',
    content:
      'You agree to: (a) respond to buyer inquiries within a reasonable time; (b) only list products you have the legal right to sell; (c) accurately represent your products in listings; (d) deliver what was agreed with the buyer; (e) handle disputes professionally.',
  },
  {
    id: 'prohibited',
    title: '5. Prohibited Content',
    content:
      'You may not sell: illegal content or software; content that infringes intellectual property rights; counterfeit goods; adult or explicit content; malware or harmful code; misleading or fraudulent products.',
  },
  {
    id: 'future-monetization',
    title: '6. Future Monetization (April 2027)',
    content:
      'Ventex plans to introduce optional paid features beginning April 2027. These will be opt-in and will not affect existing free functionality. Sellers will be notified in advance with full details before any changes take effect.',
  },
];

export default function SellerAgreementPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[var(--text2)] mb-4">Legal</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3">Seller Agreement</h1>
        <p className="text-[var(--text2)] mb-12">
          Last updated: June 2026 · Applies to all Ventex marketplace sellers
        </p>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-12">
          <p className="text-emerald-800 font-bold text-sm">
            🎉 Ventex is 100% free during early access. No commissions. No platform fees. You keep everything.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-xl font-black mb-3 text-[var(--text)]">{section.title}</h2>
              <p className="text-[var(--text2)] leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-[var(--border)] pt-8">
          <p className="text-sm text-[var(--text2)]">
            Questions? Contact us at{' '}
            <a href="mailto:support@ventex.com" className="text-[var(--text)] underline">
              support@ventex.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}