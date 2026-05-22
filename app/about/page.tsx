import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Compass, Lightbulb, Users, Cpu, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Ventex — Startup Platform",
  description: "Learn about the mission, values, and founders of Ventex, the premium marketplace and pitching hub for modern startups.",
  alternates: {
    canonical: "/about",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "About | Ventex — Startup Platform",
    description: "Learn about the mission, values, and founders of Ventex, the premium marketplace and pitching hub for modern startups.",
    url: "https://ventex.com/about",
    type: "website",
    siteName: "Ventex",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-[#0A0A0C] text-neutral-200 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 border-b border-neutral-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.08),rgba(255,255,255,0))]">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs font-mono tracking-widest uppercase mb-4">
            <Compass className="w-3.5 h-3.5" /> Our Origin Story
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold italic uppercase tracking-tight text-white">
            ABOUT <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">VENTEX</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            A specialized ecosystem designed from the ground up to empower developers, founders, and investors to build the future together.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-[#0F0F12] border-b border-neutral-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative p-8 md:p-12 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 shadow-xl overflow-hidden group">
            {/* Absolute decorative glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/20 transition-all duration-500"></div>
            
            <div className="relative space-y-6">
              <span className="text-4xl text-violet-500 font-serif leading-none block">“</span>
              <blockquote className="text-2xl md:text-3.5xl font-medium tracking-tight text-white italic leading-snug font-serif">
                Ideas are more worthy than money — because ideas can make money, but money cannot make ideas.
              </blockquote>
              <div className="flex items-center gap-3 mt-6">
                <div className="h-[2px] w-8 bg-violet-500"></div>
                <cite className="text-sm font-semibold tracking-wider text-violet-400 uppercase not-italic font-mono">
                  The Ventex Core Doctrine
                </cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Pillars */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">
            The Three Pillars
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm">
            Our platform operates at the intersection of capital, execution, and utility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="p-8 rounded-xl bg-[#0F0F12] border border-neutral-900 hover:border-neutral-800 transition-all duration-300 space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-600/20 transition-all duration-300">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide uppercase font-mono">01. Pitch</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Build premium, comprehensive data rooms that highlight your product metrics, market fit, financials, and milestones to get noticed by real backers.
              </p>
            </div>
            <div className="pt-4 text-xs font-semibold text-violet-400 uppercase tracking-widest">
              Investor-Grade Profiles
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 rounded-xl bg-[#0F0F12] border border-neutral-900 hover:border-neutral-800 transition-all duration-300 space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-600/20 transition-all duration-300">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide uppercase font-mono">02. Fund</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Connect directly with accredited, verified angel investors and venture firms using our seamless interest submission pipeline and direct deal flows.
              </p>
            </div>
            <div className="pt-4 text-xs font-semibold text-violet-400 uppercase tracking-widest">
              Verified Capital Deals
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 rounded-xl bg-[#0F0F12] border border-neutral-900 hover:border-neutral-800 transition-all duration-300 space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-600/20 transition-all duration-300">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide uppercase font-mono">03. Sell</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                List and trade digital assets, developer boilerplates, UI libraries, or fully functional SaaS platforms through our secure buyer escrow pipeline.
              </p>
            </div>
            <div className="pt-4 text-xs font-semibold text-violet-400 uppercase tracking-widest">
              Creator Marketplace
            </div>
          </div>
        </div>
      </section>

      {/* Founder Spotlight */}
      <section className="py-24 bg-[#0F0F12] border-t border-b border-neutral-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            {/* Left: Picture slot */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative group w-64 h-64 md:w-full md:h-80 aspect-square">
                {/* Neon background border */}
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl blur opacity-35 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative w-full h-full rounded-2xl bg-neutral-900 overflow-hidden border border-neutral-800 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-32 h-32 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4 text-violet-400">
                    <span className="text-5xl font-black font-mono">J</span>
                  </div>
                  <h4 className="text-lg font-bold text-white tracking-wide uppercase font-mono">Jazin Ashraf</h4>
                  <p className="text-xs text-violet-400 font-mono tracking-widest uppercase mt-1">Student Founder</p>
                  <p className="text-xs text-neutral-500 mt-2 font-medium">Kozhikode, Kerala, India</p>
                </div>
              </div>
            </div>

            {/* Right: Vision */}
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[10px] tracking-wider uppercase font-mono text-neutral-400">
                <Award className="w-3.5 h-3.5 text-violet-400" /> Executive Spotlight
              </div>
              <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">
                Empowering the Underdog
              </h2>
              <div className="space-y-4 text-neutral-400 text-sm leading-relaxed">
                <p>
                  Ventex was conceived by **Jazin**, a student founder based in the tech-forward city of **Kozhikode, Kerala, India**. Recognizing that traditional incubators and venture houses are heavily gatekept, Jazin set out to design an open, friction-free alternative.
                </p>
                <p>
                  "We believe that credentials are nice, but execution is what defines a startup. Whether you are building from a dorm room or an office, you deserve a platform to display your products and seek investment without paying hefty brokers or middle-men."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">
            Our Core Values
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm">
            These four operational values direct every product feature, policy update, and design decision we implement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-xl bg-[#0F0F12] border border-neutral-900 hover:border-neutral-800 transition-all duration-300 space-y-4 text-center">
            <h3 className="text-base font-bold text-white tracking-wider uppercase font-mono">Openness</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              No elite filters. Anyone with a working product or verifiable business model can list, trade, and request venture links.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl bg-[#0F0F12] border border-neutral-900 hover:border-neutral-800 transition-all duration-300 space-y-4 text-center">
            <h3 className="text-base font-bold text-white tracking-wider uppercase font-mono">Affordability</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Industry-lowest platform fees. We charge a flat **5% fee** on marketplace sales, returning maximum value back to founders.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-xl bg-[#0F0F12] border border-neutral-900 hover:border-neutral-800 transition-all duration-300 space-y-4 text-center">
            <h3 className="text-base font-bold text-white tracking-wider uppercase font-mono">Founder-First</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Every detail is optimized to save building time—offering instant automated AI briefs, simple integrations, and clear RLS policies.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-xl bg-[#0F0F12] border border-neutral-900 hover:border-neutral-800 transition-all duration-300 space-y-4 text-center">
            <h3 className="text-base font-bold text-white tracking-wider uppercase font-mono">Transparency</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              No hidden fees, clean double-escrow resolutions, clear-cut verification checklists, and complete seller agreement rules.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-neutral-900 bg-gradient-to-b from-[#0A0A0C] to-[#0D0D10]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight uppercase">
            Ready to change the game?
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm leading-relaxed">
            Submit your pitch to verified investors or start listing your SaaS products directly on our developer marketplace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-bold shadow-lg shadow-violet-900/30 transition-all duration-300 text-sm tracking-wide text-center"
            >
              Join Ventex today
            </Link>
            <Link
              href="/discover"
              className="w-full sm:w-auto px-8 py-3.5 border border-neutral-800 hover:border-neutral-700 text-white rounded-full font-bold transition-all duration-300 text-sm tracking-wide text-center bg-[#0F0F12]"
            >
              Browse Startups
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
