import Link from "next/link";

const roadmap = [
 "The Arena - monthly live pitch events with founder applications and investor judges.",
 "Deeper marketplace workflows for freelance services, jobs, and custom builds.",
 "Founder growth tools including referrals, badges, weekly digests, and public proof assets.",
];

export default function AboutPage() {
 return (
 <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
 <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
 <div className="space-y-12">
 <div className="space-y-5">
 <h1 className="text-4xl font-black tracking-[-.04em] sm:text-5xl">
 About Ventex
 </h1>
 <p className="max-w-3xl text-base leading-7 text-[var(--text2)] sm:text-lg">
 Ventex is a global platform where startups can pitch investors, sell software products,
 offer freelance services, and create job opportunities in one focused workspace.
 </p>
 </div>

 <section className="border-t pt-8" style={{ borderColor: "var(--border)" }}>
 <h2 className="text-2xl font-black tracking-[-.03em]">Our Mission</h2>
 <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text2)]">
 To build the most trusted startup infrastructure globally - where any founder, from any city, can pitch with confidence, raise with transparency, and sell with credibility.
 </p>
 </section>

 <section className="border-t pt-8" style={{ borderColor: "var(--border)" }}>
 <h2 className="text-2xl font-black tracking-[-.03em]">Why we built Ventex</h2>
 <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--text2)]">
 <p>
 Early-stage founders are expected to pitch, sell, hire, build proof, and find the right
 supporters before they have a team large enough to manage all of it. Ventex exists to make
 that first layer of credibility easier to build.
 </p>
 <p>
 We wanted one place where a founder can present a serious pitch, attach traction signals,
 list useful products or services, and be discovered by people who can actually help.
 </p>
 <p>
 The result is a platform built for the world&apos;s builders: part pitch network, part marketplace,
 part operating layer for early momentum.
 </p>
 </div>
 </section>

 <section className="border-t pt-8" style={{ borderColor: "var(--border)" }}>
 <h2 className="text-2xl font-black tracking-[-.03em]">Our Team</h2>
 <div className="mt-5 grid gap-4 sm:grid-cols-2">
 <article className="flex gap-4 border bg-[var(--bg2)] p-5" style={{ borderColor: "var(--border)" }}>
 <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[var(--text)] text-sm font-black text-[var(--bg)]">V</div>
 <div>
 <h3 className="font-black">Founder & CEO, Ventex</h3>
 <p className="mt-2 text-sm text-[var(--text2)]">Building the global startup graph from day one.</p>
 <p className="mt-4 text-xs font-bold uppercase tracking-[.12em] text-[var(--text3)]">More team members coming soon as we grow.</p>
 </div>
 </article>
 </div>
 </section>

 <section className="border-t pt-8" style={{ borderColor: "var(--border)" }}>
 <h2 className="text-2xl font-black tracking-[-.03em]">What&apos;s coming</h2>
 <ul className="mt-5 grid gap-3 text-sm leading-6 text-[var(--text2)]">
 {roadmap.map((item) => (
 <li key={item} className="flex gap-3">
 <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[var(--text)]" />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </section>

 <Link href="/signup" className="btn-primary inline-flex">
 Join the platform →
 </Link>
 </div>
 </section>

  {/* Support section */}
  <section className="py-16 border-t border-[var(--border)] text-center">
    <p className="text-[var(--text2)] text-sm mb-2">Support the mission</p>
    <p className="text-[var(--text)] font-semibold mb-1">Ventex is free and always will be during early access.</p>
    <p className="text-[var(--text2)] text-sm mb-6">If you believe in what we&apos;re building, a coffee goes a long way.</p>
    <a
      href="https://ko-fi.com/ventexx"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-[#FF5E5B] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity"
    >
      ☕ Buy us a coffee →
    </a>
  </section>
  </main>
 );
}