import Link from 'next/link';
import { ShoppingBag, ArrowRight, Package, Star, Zap } from 'lucide-react';

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111]">
      {/* Hero */}
      <section className="bg-[#222222] dark:bg-[#0a0a0a] py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <Zap className="w-3.5 h-3.5" /> Coming Soon
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase text-white tracking-tighter mb-6">
            Startup-Made<br />Marketplace
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-10">
            Buy and sell software, templates, SaaS tools, and digital products — all built by verified startups.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-white text-[#222222] px-8 py-4 rounded-full font-bold hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Join the waitlist <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/discover"
              className="w-full sm:w-auto border border-white/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-colors text-center"
            >
              Browse pitches instead
            </Link>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-[#222222] dark:text-white uppercase tracking-tight text-center mb-14">
            What's coming
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Package,
                title: 'Digital Products',
                desc: 'SaaS tools, UI kits, templates, checklists, and financial models made by real founders.'
              },
              {
                icon: Star,
                title: 'Verified Sellers',
                desc: 'Every seller is a registered startup on Ventex. Buyers can trust the source and track record.'
              },
              {
                icon: ShoppingBag,
                title: 'Instant Access',
                desc: 'Buy, download, and use immediately. Stripe-powered checkout with refund protection.'
              },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-3xl p-8">
                <div className="bg-[#F2F2F0] dark:bg-[#222222] w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-[#222222] dark:text-white" />
                </div>
                <h3 className="font-black text-[#222222] dark:text-white text-lg mb-3">{item.title}</h3>
                <p className="text-[#888888] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-[#888888] text-sm mb-4">In the meantime, explore startups on Ventex</p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-8 py-4 rounded-full font-bold hover:bg-black dark:hover:bg-gray-100 active:scale-95 transition-all"
          >
            Browse startups <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
