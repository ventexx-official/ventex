import type { Metadata } from "next";
import Link from "next/link";
import ArenaEvents from "@/components/ArenaEvents";
import ArenaWaitlistForm from "@/components/ArenaWaitlistForm";
import ArenaNotifyModal from "@/components/ArenaNotifyModal";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
 title: "The Arena - Live Startup Pitch Battle",
 description: "Monthly live pitch event where India's boldest founders pitch to real investors. Apply to pitch or watch live.",
 alternates: { canonical: "https://ventex.com/arena" },
 openGraph: {
 title: "The Arena - Live Startup Pitch Battle",
 description: "Where founders face the fire.",
 url: "https://ventex.com/arena",
 type: "website",
 images: [OG_IMAGE_URL],
 },
 twitter: {
 card: "summary_large_image",
 title: "The Arena - Live Startup Pitch Battle",
 description: "Monthly live pitch event where India's boldest founders pitch to real investors.",
 images: [OG_IMAGE_URL],
 },
};

export default function ArenaPage() {
 return (
 <main data-theme="dark" className="min-h-screen bg-[#090504] text-[var(--text)]">
 <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(245,158,11,.35),transparent_38%),linear-gradient(180deg,rgba(120,30,0,.35),transparent_55%)]" />
 <div className="relative mx-auto max-w-6xl">
 <p className="mono text-xs font-black uppercase tracking-[.2em] text-amber-200">THE ARENA</p>
 <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-.05em] sm:text-7xl">THE ARENA</h1>
 <p className="mt-4 text-2xl font-black text-amber-100">Where founders face the fire.</p>
 <p className="mt-6 max-w-2xl text-base leading-8 text-orange-50/80">
 A monthly live pitch event. India&apos;s boldest founders. Real investors. Live and on record.
 </p>
 <div className="mt-9 flex flex-wrap gap-3">
 <Link href="/arena/apply" className="rounded-full bg-amber-300 px-6 py-3 text-sm font-black text-[#160b04]">Apply to Pitch →</Link>
 <ArenaNotifyModal />
 </div>
 </div>
 </section>

 <section className="border-y border-amber-300/20 bg-black/25 px-4 py-16 sm:px-6 lg:px-8">
 <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[.9fr_1.1fr]">
 <div>
 <p className="mono text-xs font-black uppercase tracking-[.16em] text-amber-200/70">What is The Arena</p>
 <h2 className="mt-3 text-3xl font-black tracking-[-.03em]">Every month, 5 selected founders take the stage.</h2>
 </div>
 <div className="space-y-5 text-sm leading-7 text-orange-50/75">
 <p>A panel of verified investors. Live audience. Real decisions.</p>
 <p className="text-2xl font-black text-[var(--text)]">Pitch. Defend. Win.</p>
 <p>The best pitches get funded, featured, and amplified across Ventex&apos;s network.</p>
 </div>
 </div>
 </section>

 <section className="px-4 py-16 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-6xl">
 <h2 className="text-3xl font-black tracking-[-.03em]">How it works</h2>
 <div className="mt-8 grid gap-4 md:grid-cols-4">
 {[
 ["01", "Apply to pitch", "Submit your startup through Ventex"],
 ["02", "Get selected", "top 5 founders monthly"],
 ["03", "Go live", "streamed live"],
 ["04", "Get amplified", "Best moments become Reels and Shorts"],
 ].map(([number, title, desc]) => (
 <article key={number} className="rounded-lg border border-amber-300/20 bg-[var(--card-bg)]/[.04] p-5">
 <div className="mono text-3xl font-black text-amber-200/50">{number}</div>
 <h3 className="mt-5 font-black">{title}</h3>
 <p className="mt-3 text-sm leading-6 text-orange-50/65">{desc}</p>
 </article>
 ))}
 </div>
 </div>
 </section>

 <section className="px-4 pb-16 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-6xl">
 <h2 className="mb-8 text-3xl font-black tracking-[-.03em]">Upcoming Events</h2>
 <ArenaEvents />
 </div>
 </section>

 <section id="notify" className="border-t border-amber-300/20 px-4 py-16 sm:px-6 lg:px-8">
 <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center">
 <div>
 <h2 className="text-3xl font-black tracking-[-.03em]">Think you&apos;re ready for The Arena?</h2>
 <p className="mt-4 text-sm leading-7 text-orange-50/75">Applications open for Season 1. Free to apply. Limited spots.</p>
 <Link href="/arena/apply" className="mt-7 inline-flex rounded-full bg-amber-300 px-6 py-3 text-sm font-black text-[#160b04]">Apply Now →</Link>
 </div>
 <ArenaWaitlistForm />
 </div>
 </section>
 </main>
 );
}