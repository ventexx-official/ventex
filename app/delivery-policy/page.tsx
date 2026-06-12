import type { Metadata } from "next";
import { emailFor } from "@/lib/site";

export const metadata: Metadata = {
 title: "Delivery Policy",
 description: "Ventex delivery policy for digital products, downloads, custom work, and marketplace orders.",
 alternates: {
 canonical: "/delivery-policy",
 },
};

export default function DeliveryPolicyPage() {
 const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || emailFor("support");
 return (
 <main className="min-h-screen bg-[var(--bg)] px-6 py-16 text-[var(--text)]">
 <article className="mx-auto max-w-4xl space-y-8">
 <header className="border-b border-[var(--border)] pb-8">
 <p className="mb-3 font-mono text-xs uppercase tracking-[.16em] text-violet-400">Marketplace</p>
 <h1 className="text-4xl font-black uppercase tracking-tight text-[var(--text)] md:text-5xl">Delivery Policy</h1>
 <p className="mt-4 text-sm text-[var(--text3)]">Last updated: May 2026</p>
 </header>

 <section className="space-y-3">
 <h2 className="text-xl font-black text-[var(--text)]">Digital Delivery</h2>
 <p>Software, templates, courses, and other digital products are delivered through Ventex order pages, download links, or seller-provided access instructions after successful Stripe payment confirmation.</p>
 </section>

 <section className="space-y-3">
 <h2 className="text-xl font-black text-[var(--text)]">Custom Services</h2>
 <p>For custom work, the seller is responsible for confirming scope, timeline, deliverables, and acceptance criteria with the buyer before work begins.</p>
 </section>

 <section className="space-y-3">
 <h2 className="text-xl font-black text-[var(--text)]">Hardware or Physical Goods</h2>
 <p>If physical products are enabled, sellers must provide shipping timelines, carrier details, tax invoices where applicable, and any geographic restrictions before checkout.</p>
 </section>

 <section className="space-y-3">
 <h2 className="text-xl font-black text-[var(--text)]">Failed Delivery</h2>
 <p>Buyers should contact {supportEmail} if access is not delivered after payment. Ventex may request seller evidence, resend access, or open a dispute review.</p>
 </section>
 </article>
 </main>
 );
}