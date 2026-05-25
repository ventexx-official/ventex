import { Megaphone, Handshake, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function formatCurrency(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString()}`;
}

export default async function Home() {
  const { data: statsRows } = await supabase.rpc('get_homepage_stats');
  const livePitches = Number(statsRows?.[0]?.live_pitches ?? 0);
  const investors = Number(statsRows?.[0]?.investors ?? 0);
  const showFoundingBanner = livePitches < 10 || investors < 10;

  const { data: pitches } = await supabase
    .from('pitches')
    .select('*')
    .eq('status', 'live')
    .limit(3);

  const marketplaceData = [
    { id: 1, name: 'SaaS Dashboard UI Kit', seller: 'DesignPro', price: '₹2,499', rating: 4, discount: '20% OFF' },
    { id: 2, name: 'Financial Model Template', seller: 'FinanceGuy', price: '₹999', rating: 5 },
    { id: 3, name: 'SEO Audit Checklist', seller: 'GrowthHacks', price: '₹499', rating: 4 },
    { id: 4, name: 'Investor Update Email Pack', seller: 'FounderTools', price: '₹799', rating: 5, discount: '10% OFF' }
  ];

  return (
    <>
      {/* SECTION 1 — Hero */}
      <section className="bg-[#222222] dark:bg-[#111111] min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold italic uppercase text-white tracking-wide">
            WHERE STARTUPS PITCH, FUND AND SELL.
          </h1>
          <p className="text-white text-lg md:text-xl font-light max-w-2xl mx-auto">
            The global platform connecting founders, investors and buyers — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup" className="bg-white text-[#222222] px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
              Submit your pitch
            </Link>
            <Link href="/discover" className="border-[0.5px] border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-colors">
              Browse startups
            </Link>
          </div>
          <div className="pt-8 text-sm text-[#888888] font-medium flex flex-wrap items-center justify-center gap-2">
            {showFoundingBanner ? (
              <span>🚀 Early Access — Be a Founding Member · Limited spots</span>
            ) : (
              <>
                <span>{livePitches} Startups</span>
                <span>&middot;</span>
                <span>{investors} Investors</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2 — How it works */}
      <section className="bg-white dark:bg-[#111111] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#222222] dark:text-white mb-16">
            Everything a startup needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="border-[0.5px] border-[#e5e5e5] dark:border-[#444444] rounded-[10px] p-6 bg-white dark:bg-[#222222] flex flex-col items-start transition-colors">
              <div className="bg-[#222222] dark:bg-[#111111] p-2.5 rounded-md mb-6">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] dark:text-white mb-3">Pitch your startup</h3>
              <p className="text-[#888888] leading-relaxed">
                Create a full investor-grade pitch profile. Get discovered by investors, mentors and the startup community.
              </p>
            </div>
            {/* Card 2 */}
            <div className="border-[0.5px] border-[#e5e5e5] dark:border-[#444444] rounded-[10px] p-6 bg-white dark:bg-[#222222] flex flex-col items-start transition-colors">
              <div className="bg-[#222222] dark:bg-[#111111] p-2.5 rounded-md mb-6">
                <Handshake className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] dark:text-white mb-3">Connect with investors</h3>
              <p className="text-[#888888] leading-relaxed">
                Verified investors browse, save and express interest in startups. Premium access unlocks full financials and deal flow tools.
              </p>
            </div>
            {/* Card 3 */}
            <div className="border-[0.5px] border-[#e5e5e5] dark:border-[#444444] rounded-[10px] p-6 bg-white dark:bg-[#222222] flex flex-col items-start transition-colors">
              <div className="bg-[#222222] dark:bg-[#111111] p-2.5 rounded-md mb-6">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#222222] dark:text-white mb-3">Sell your products</h3>
              <p className="text-[#888888] leading-relaxed">
                List your startup's software, services, templates and hardware. Real buyers, real sales, real revenue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Stats bar */}
      <section className="bg-[#222222] dark:bg-[#111111] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {showFoundingBanner ? (
            <p className="text-center text-white text-xl md:text-2xl font-bold">
              🚀 Early Access — Be a Founding Member · Limited spots
            </p>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-[#444444]">
              <div className="flex flex-col items-center flex-1 px-4 text-center pb-6 md:pb-0">
                <span className="text-white text-3xl font-bold">{livePitches}</span>
                <span className="text-[#888888] text-sm mt-1">Startups Listed</span>
              </div>
              <div className="flex flex-col items-center flex-1 px-4 text-center pt-6 md:pt-0">
                <span className="text-white text-3xl font-bold">{investors}</span>
                <span className="text-[#888888] text-sm mt-1">Active Investors</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4 — Featured pitches */}
      <section className="bg-white dark:bg-[#111111] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-bold text-[#222222] dark:text-white">Featured startups</h2>
            <Link href="/discover" className="text-[#888888] hover:text-[#222222] dark:hover:text-white transition-colors text-sm font-medium">View all &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pitches?.map((pitch) => {
              const valuation = pitch.amount_seeking && pitch.equity_pct 
                ? pitch.amount_seeking / (pitch.equity_pct / 100)
                : 0;

              return (
                <div key={pitch.id} className="border-[0.5px] border-[#e5e5e5] dark:border-[#444444] rounded-[12px] p-6 bg-white dark:bg-[#222222] flex flex-col transition-colors">
                  {/* Top row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-[#222222] dark:bg-[#111111] rounded-md"></div>
                    {pitch.is_raising ? (
                      <span className="bg-[#222222] dark:bg-[#111111] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Raising</span>
                    ) : (
                      <span className="bg-[#e5e5e5] dark:bg-[#444444] text-[#222222] dark:text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Verified</span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-[#222222] dark:text-white text-[14px] mb-3">{pitch.title}</h3>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Sparkles className="w-3 h-3 text-[#888888]" />
                    <span className="text-[#888888] text-[11px] font-medium uppercase tracking-wider">AI Briefing</span>
                  </div>
                  
                  <p className="text-[#888888] text-[13px] leading-[1.6] line-clamp-3 mb-4 flex-grow">
                    {pitch.ai_summary}
                  </p>
                  
                  <div className="flex gap-2 mb-6 flex-wrap">
                    <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#222222] dark:text-white text-[10px] px-2 py-1 rounded-md">{pitch.industry}</span>
                    <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#222222] dark:text-white text-[10px] px-2 py-1 rounded-md">{pitch.company_stage}</span>
                    <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#222222] dark:text-white text-[10px] px-2 py-1 rounded-md">{pitch.country}</span>
                  </div>
                  
                  <hr className="border-[#e5e5e5] dark:border-[#444444] mb-4" />
                  
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-[#F2F2F0] dark:bg-[#333333] p-2 rounded-md text-center">
                      <div className="text-[10px] text-[#888888] mb-1">Seeking</div>
                      <div className="text-[11px] font-bold text-[#222222] dark:text-white">{pitch.amount_seeking ? formatCurrency(pitch.amount_seeking) : 'N/A'}</div>
                    </div>
                    <div className="bg-[#F2F2F0] dark:bg-[#333333] p-2 rounded-md text-center">
                      <div className="text-[10px] text-[#888888] mb-1">Equity</div>
                      <div className="text-[11px] font-bold text-[#222222] dark:text-white">{pitch.equity_pct ? `${pitch.equity_pct}%` : 'N/A'}</div>
                    </div>
                    <div className="bg-[#F2F2F0] dark:bg-[#333333] p-2 rounded-md text-center">
                      <div className="text-[10px] text-[#888888] mb-1">Valuation</div>
                      <div className="text-[11px] font-bold text-[#222222] dark:text-white">{valuation ? formatCurrency(valuation) : 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <Link href={`/pitch/${pitch.id}`} className="text-[#888888] text-sm hover:text-[#222222] dark:hover:text-white underline decoration-[0.5px] underline-offset-4">Read full pitch &rarr;</Link>
                    <button className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-4 py-2 rounded-md text-sm font-medium hover:bg-black dark:hover:bg-gray-200 transition-colors">View</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5 — Knowledge & government schemes */}
      <section className="bg-[#F2F2F0] dark:bg-[#1a1a1a] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[#222222] dark:text-white mb-12">Resources for founders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
            {/* Left Column */}
            <div>
              <h3 className="text-sm font-bold text-[#888888] uppercase tracking-wider mb-6">Government schemes</h3>
              <div className="space-y-4">
                <div className="bg-white dark:bg-[#222222] p-6 rounded-[12px] border-[0.5px] border-[#e5e5e5] dark:border-[#444444] transition-colors">
                  <h4 className="font-bold text-[#222222] dark:text-white mb-2">Startup India Seed Fund Scheme</h4>
                  <p className="text-[#888888] text-sm mb-4">Financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization.</p>
                  <Link href="/resources/government-schemes" className="text-sm font-medium text-[#222222] dark:text-white hover:underline underline-offset-4">Learn more &rarr;</Link>
                </div>
                <div className="bg-white dark:bg-[#222222] p-6 rounded-[12px] border-[0.5px] border-[#e5e5e5] dark:border-[#444444] transition-colors">
                  <h4 className="font-bold text-[#222222] dark:text-white mb-2">DPIIT Recognition</h4>
                  <p className="text-[#888888] text-sm mb-4">Unlock tax exemptions, easier compliance, fast-tracking of patent applications, and access to the Fund of Funds.</p>
                  <Link href="/resources/government-schemes" className="text-sm font-medium text-[#222222] dark:text-white hover:underline underline-offset-4">Learn more &rarr;</Link>
                </div>
                <div className="bg-white dark:bg-[#222222] p-6 rounded-[12px] border-[0.5px] border-[#e5e5e5] dark:border-[#444444] transition-colors">
                  <h4 className="font-bold text-[#222222] dark:text-white mb-2">MeitY TIDE 2.0 Grants</h4>
                  <p className="text-[#888888] text-sm mb-4">Promoting tech entrepreneurship through financial and technical support to incubators engaged in supporting ICT startups.</p>
                  <Link href="/resources/government-schemes" className="text-sm font-medium text-[#222222] dark:text-white hover:underline underline-offset-4">Learn more &rarr;</Link>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div>
              <h3 className="text-sm font-bold text-[#888888] uppercase tracking-wider mb-6">Latest news</h3>
              <ul className="space-y-6">
                <li className="border-b-[0.5px] border-[#e5e5e5] dark:border-[#444444] pb-6">
                  <h4 className="font-bold text-[#222222] dark:text-white mb-2 hover:underline cursor-pointer">How to prepare your data room for Series A investors in 2024</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[#888888]">Ventex Insights</span>
                    <span className="text-[#222222] dark:text-white font-medium">Read &rarr;</span>
                  </div>
                </li>
                <li className="border-b-[0.5px] border-[#e5e5e5] dark:border-[#444444] pb-6">
                  <h4 className="font-bold text-[#222222] dark:text-white mb-2 hover:underline cursor-pointer">The shift towards profitability: What seed stage VCs are looking for</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[#888888]">Founder&apos;s Weekly</span>
                    <span className="text-[#222222] dark:text-white font-medium">Read &rarr;</span>
                  </div>
                </li>
                <li>
                  <h4 className="font-bold text-[#222222] dark:text-white mb-2 hover:underline cursor-pointer">Valuation benchmarks for SaaS startups in the Indian market</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[#888888]">Market Report</span>
                    <span className="text-[#222222] dark:text-white font-medium">Read &rarr;</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — Marketplace preview */}
      <section className="bg-white dark:bg-[#111111] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-bold text-[#222222] dark:text-white">Startup-made products</h2>
            <Link href="/marketplace" className="text-[#888888] hover:text-[#222222] dark:hover:text-white transition-colors text-sm font-medium">Browse marketplace &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {marketplaceData.map((product) => (
              <div key={product.id} className="border-[0.5px] border-[#e5e5e5] dark:border-[#444444] rounded-[12px] overflow-hidden bg-white dark:bg-[#222222] flex flex-col transition-colors">
                <div className="bg-[#F2F2F0] dark:bg-[#333333] w-full aspect-video relative flex items-center justify-center">
                  <span className="text-[#888888] text-sm">Image</span>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-[#222222] dark:text-white text-[13px] mb-1">{product.name}</h3>
                  <p className="text-[#888888] text-[11px] mb-3">by {product.seller}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-[#222222] dark:text-white">{product.price}</span>
                    {product.discount && (
                      <span className="bg-[#222222] dark:bg-[#111111] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{product.discount}</span>
                    )}
                  </div>
                  
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < product.rating ? 'text-[#222222] dark:text-white fill-[#222222] dark:fill-white' : 'text-[#e5e5e5] dark:text-[#444444]'}`} />
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-2">
                    <button className="w-full bg-[#222222] dark:bg-white text-white dark:text-[#222222] py-2 rounded-md text-xs font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors">Buy now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — Final CTA banner */}
      <section className="bg-[#222222] dark:bg-[#111111] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to pitch your startup to the world?
          </h2>
          <p className="text-[#888888] text-lg mb-10">
            Join thousands of founders already on Ventex.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="bg-white text-[#222222] px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
              Create your pitch
            </Link>
            <Link href="/discover" className="border-[0.5px] border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white/10 transition-colors">
              Learn how it works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
