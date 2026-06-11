import type { Metadata } from "next";
import { Eye, ShieldCheck, Lock, Landmark, Mail } from "lucide-react";
import { BASE_URL, emailFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy  -  Startup Platform",
  description: "Privacy Policy outlining data collection, third-party processing via Supabase & Stripe, and compliance with the India DPDP Act 2023.",
  alternates: {
    canonical: "/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Privacy Policy  -  Startup Platform",
    description: "Privacy Policy outlining data collection, third-party processing via Supabase & Stripe, and compliance with the India DPDP Act 2023.",
    url: `${BASE_URL}/privacy`,
    type: "website",
    siteName: "Ventex",
  },
};

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();
  const privacyEmail = process.env.NEXT_PUBLIC_PRIVACY_EMAIL || emailFor("privacy");
  const points = [
    {
      icon: Eye,
      title: "Data We Collect",
      desc: "We collect direct information when you register, pitch a startup, or purchase listing templates. This includes your Full Name, Email Address, profile picture, phone number, pitch financials, product files, and Stripe Connect identification details. We also capture automatic technical parameters like IP addresses, browser agents, and security log logs."
    },
    {
      icon: ShieldCheck,
      title: "How We Use Your Data",
      desc: "Your data is used to secure your workspace profile, process buyer payments, release seller escrow balances, send AI pitch briefings, notify you of user transactions via Resend emails, and prevent off-platform billing scams. We never sell your personal information to third-party data brokers."
    },
    {
      icon: Lock,
      title: "Data Processors & Infrastructure",
      desc: "We route our databases and payment processes through secure global processors under standard processing guidelines: Supabase acts as our core infrastructure partner (database hosting, storage, and authentication session storage); Stripe handles all payment processing and banking holds."
    },
    {
      icon: Landmark,
      title: "Your Rights Under the India DPDP Act 2023",
      desc: "In compliance with the Digital Personal Data Protection (DPDP) Act 2023 of India, you retain absolute authority as a Data Principal: the right to access a summary of your personal data collected; the right to correct, complete, or update your profile; the right to request erasure of your data when it is no longer necessary for the platform; and the right to withdraw your processing consent at any time."
    }
  ];

  return (
    <div className="bg-[#0A0A0C] text-neutral-300 min-h-screen py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-neutral-900 pb-10">
          <div className="text-xs font-mono tracking-widest text-violet-400 uppercase">
            Data Governance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
            Privacy Policy
          </h1>
          <p className="text-neutral-500 text-sm font-mono">
            Last Updated: May 2026 Ã‚Â· India DPDP Act 2023 Compliant
          </p>
        </div>

        {/* Introduction */}
        <div className="p-6 rounded-xl bg-[#0F0F12] border border-neutral-900 text-sm leading-relaxed text-neutral-400">
          At Ventex, we are committed to safeguarding your personal information, financial data, and intellectual property. This Privacy Policy details what information we collect, how it is processed by our secure infrastructure, and the complete privacy rights you possess under modern Indian data protection frameworks.
        </div>

        {/* Policy Grid */}
        <div className="space-y-8">
          {points.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-xl bg-[#0F0F12] border border-neutral-900 hover:border-neutral-800 transition-all duration-300 flex flex-col md:flex-row gap-6 items-start group"
              >
                <div className="w-12 h-12 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 group-hover:bg-violet-600/20 transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white tracking-wide uppercase font-mono">
                    {point.title}
                  </h2>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grievance Officer Section */}
        <div className="p-8 rounded-xl bg-[#0F0F12]/60 border border-neutral-900 space-y-6">
          <div className="flex items-center gap-3">
            <Landmark className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white tracking-wide uppercase font-mono">
              Grievance Redressal
            </h2>
          </div>
          <div className="text-neutral-400 text-sm leading-relaxed space-y-3">
            <p>
              In accordance with the India DPDP Act 2023, Ventex has designated a Grievance Officer to address any questions, feedback, or complaints regarding our data practices or to coordinate data principal requests.
            </p>
            <div className="pt-3 border-t border-neutral-900/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-neutral-500">
              <div>
                <p className="font-bold text-neutral-400">Designation:</p>
                <p>Data Protection & Grievance Officer</p>
              </div>
              <div>
                <p className="font-bold text-neutral-400">Location:</p>
                <p>Kozhikode, Kerala, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Block */}
        <div className="p-6 rounded-xl border border-neutral-900 bg-gradient-to-r from-violet-950/10 to-neutral-900/20 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wide">
              Have Questions?
            </h3>
            <p className="text-xs text-neutral-500">
              Request account closure, data extracts, or consent withdrawal.
            </p>
          </div>
          <a
            href={`mailto:${privacyEmail}`}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" /> Contact {privacyEmail}
          </a>
        </div>

        {/* Compliance Footer */}
        <div className="text-center pt-6 border-t border-neutral-900 text-xs text-neutral-500 font-mono">
          <p>&copy; {currentYear} Ventex. Built for India&apos;s builders.</p>
        </div>
      </div>
    </div>
  );
}