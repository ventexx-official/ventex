import Link from 'next/link';
import { Zap } from 'lucide-react';

export const metadata = {
  title: 'Booster Packs · Ventexx',
  description: 'Pitch visibility boosts coming April 2027.',
};

export default function BoosterPacksPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center mx-auto mb-8">
          <Zap className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-4">Booster Packs</h1>
        <p className="text-[var(--text2)] mb-2 text-lg">
          Pitch visibility boosts are coming.
        </p>
        <p className="text-[var(--text2)] text-sm mb-10">
          Launching April 2027 alongside our monetization rollout.
          Early access founders will get priority and discounted access.
        </p>
        <Link
          href="/founder/dashboard"
          className="inline-flex items-center gap-2 bg-[var(--text)] text-[var(--bg)] px-6 py-3 rounded-2xl font-bold text-sm hover:opacity-80 transition-opacity"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
