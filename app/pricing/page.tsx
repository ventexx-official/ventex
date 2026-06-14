import { Check, Coffee } from 'lucide-react';
import PricingCTA from './PricingCTA';

export const metadata = {
  title: 'Pricing · Ventex',
  description: 'Ventex is completely free. Every feature, every founder. No card required.',
};

const columns = [
  {
    role: 'Founders',
    emoji: '🚀',
    features: ['Unlimited pitches', 'Marketplace store', 'AI pitch scoring', 'Investor connections', 'Analytics dashboard', 'Deal room access'],
  },
  {
    role: 'Investors',
    emoji: '💼',
    features: ['Unlimited pitch discovery', 'Direct founder messaging', 'Portfolio tracking', 'Investor leaderboard', 'Deal flow management', 'Data room access'],
  },
  {
    role: 'Buyers',
    emoji: '🛒',
    features: ['Full marketplace access', 'Direct seller contact', 'WhatsApp P2P transactions', 'Order tracking', 'Product reviews', 'Dispute resolution'],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <p className="mono text-xs font-bold uppercase tracking-[.2em] text-[var(--text2)] mb-6">Pricing</p>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
          Ventex is completely free.
        </h1>
        <p className="text-xl text-[var(--text2)] max-w-2xl mx-auto mb-10">
          Every feature. Every founder. No card required.
        </p>
        <PricingCTA />
      </section>

      {/* 3 Columns */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div key={col.role} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8">
              <div className="text-4xl mb-4">{col.emoji}</div>
              <h2 className="text-xl font-black mb-1">{col.role}</h2>
              <p className="text-sm text-[var(--text2)] mb-6 font-medium">All features unlocked · Free during early access</p>
              <ul className="space-y-3">
                {col.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[var(--text2)]">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom section */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-12">
          <p className="text-lg font-bold text-[var(--text2)] mb-2">
            We're building in public. Free during early access.
          </p>
          <p className="text-[var(--text2)] text-sm mb-8">
            Monetization begins April 2027.
          </p>
          <a
            href="https://ko-fi.com/ventex"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FF5E5B] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Coffee className="w-4 h-4" />
            Support the platform on Ko-fi
          </a>
        </div>
      </section>
    </main>
  );
}
