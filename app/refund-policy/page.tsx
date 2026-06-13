import type { Metadata } from "next";
import { emailFor } from "@/lib/site";

export const metadata: Metadata = {
 title: "Refund and Cancellation Policy",
 description: "Ventexx refund, cancellation, digital product, subscription, and marketplace dispute policy.",
 alternates: {
 canonical: "/refund-policy",
 },
};

export default function RefundPolicyPage() {
 const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || emailFor("support");
 return (
 <main className="min-h-screen bg-[var(--bg)] px-6 py-16 text-[var(--text)]">
 <article className="mx-auto max-w-4xl space-y-8">
 <header className="border-b border-[var(--border)] pb-8">
 <p className="mb-3 font-mono text-xs uppercase tracking-[.16em] text-violet-400">Payments</p>
 <h1 className="text-4xl font-black uppercase tracking-tight text-[var(--text)] md:text-5xl">Refund and Cancellation Policy</h1>
 <p className="mt-4 text-sm text-[var(--text3)]">Last updated: May 2026</p>
 </header>

 <section className="space-y-3">
 <h2 className="text-xl font-black text-[var(--text)]">Subscriptions</h2>
 <p>Paid Ventexx subscriptions can be cancelled before the next billing cycle. Access remains active until the end of the paid period unless fraud, chargeback abuse, or platform misuse is detected.</p>
 </section>

 <section className="space-y-3">
 <h2 className="text-xl font-black text-[var(--text)]">Digital Marketplace Purchases</h2>
 <p>Digital products are generally non-refundable once files, downloads, or private product access have been delivered. Refunds may be reviewed for duplicate payments, failed delivery, materially misleading listings, or seller non-performance.</p>
 </section>

 <section className="space-y-3">
 <h2 className="text-xl font-black text-[var(--text)]">Custom Work and Services</h2>
 <p>Custom work refunds depend on the seller agreement, milestone status, and evidence submitted by both buyer and seller. Ventexx may pause payouts while a dispute is under review.</p>
 </section>

 <section className="space-y-3">
 <h2 className="text-xl font-black text-[var(--text)]">How to Request Help</h2>
 <p>Email {supportEmail} with your order ID, payment email, product name, and reason for the request.</p>
 </section>
 </article>
 </main>
 );
}