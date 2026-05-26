import type { Metadata } from "next";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Ventex support for account, billing, marketplace, privacy, and grievance requests.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F2F2F0] px-4 py-16 text-[#222222] dark:bg-[#111111] dark:text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 border-b border-black/10 pb-8 dark:border-white/10">
          <p className="mono mb-3 text-xs font-bold uppercase tracking-[.16em] text-[#666666] dark:text-gray-400">Support</p>
          <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">Contact Ventex</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#666666] dark:text-gray-300">
            Use these channels for billing, marketplace, seller payout, privacy, and grievance requests. Replace the placeholders below with your registered business details before live payments.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1a1a1a]">
            <Mail className="mb-4 h-6 w-6" />
            <h2 className="mb-2 text-lg font-black">Support Email</h2>
            <a className="text-sm font-bold underline underline-offset-4" href="mailto:support@ventex.app">support@ventex.app</a>
            <p className="mt-3 text-xs leading-5 text-[#666666] dark:text-gray-400">Target response time: 2 business days.</p>
          </section>

          <section className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1a1a1a]">
            <ShieldCheck className="mb-4 h-6 w-6" />
            <h2 className="mb-2 text-lg font-black">Grievance Officer</h2>
            <p className="text-sm font-bold">To be updated</p>
            <p className="mt-3 text-xs leading-5 text-[#666666] dark:text-gray-400">Add the legal officer name, email, and escalation timeline before accepting production payments.</p>
          </section>

          <section className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1a1a1a]">
            <MapPin className="mb-4 h-6 w-6" />
            <h2 className="mb-2 text-lg font-black">Business Address</h2>
            <p className="text-sm font-bold">To be updated</p>
            <p className="mt-3 text-xs leading-5 text-[#666666] dark:text-gray-400">Add registered entity name, GST details if applicable, and mailing address.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
