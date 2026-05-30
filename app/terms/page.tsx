import type { Metadata } from "next";
import { FileText, ShieldAlert, Gavel, Scale, AlertTriangle } from "lucide-react";
import { BASE_URL, emailFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service — Startup Platform",
  description: "Terms of Service and platform regulations governing listings, marketplace transactions, commissions, and dispute arbitration on Ventex.",
  alternates: {
    canonical: "/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Terms of Service — Startup Platform",
    description: "Terms of Service and platform regulations governing listings, marketplace transactions, commissions, and dispute arbitration on Ventex.",
    url: `${BASE_URL}/terms`,
    type: "website",
    siteName: "Ventex",
  },
};

export default function TermsPage() {
  const currentYear = new Date().getFullYear();
  const legalEmail = process.env.NEXT_PUBLIC_LEGAL_EMAIL || emailFor("legal");
  const sections = [
    {
      id: "acceptance",
      icon: Scale,
      title: "1. Acceptance of Terms",
      content: "By creating an account, accessing, or using the Ventex platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you are prohibited from utilizing any of our platform services or listings."
    },
    {
      id: "roles",
      icon: FileText,
      title: "2. User Roles & Conduct",
      content: "Ventex hosts distinct user profiles. 'Visitors' browse basic public records. 'Founders' represent individuals submitting pitch profiles and listing startup products. 'Investors' represent accredited individuals/groups looking for startup metrics. You agree to provide accurate, up-to-date documentation and maintain secure credentials."
    },
    {
      id: "pitch-rules",
      icon: AlertTriangle,
      title: "3. Pitching Guidelines",
      content: "Founders submitting pitches must represent real, verifiable startup ideas. You may not list misleading financial figures, false team members, or unauthorized intellectual property. Ventex retains the right to remove, suspend, or request verification credentials for any pitch profile in our sole discretion."
    },
    {
      id: "seller-rules",
      icon: ShieldAlert,
      title: "4. Seller & Marketplace Rules",
      content: "When listing digital products, SaaS boilerplates, templates, or code bases on the Ventex Marketplace, sellers agree to a flat 5% platform commission deducted automatically from every transaction. To safeguard this system, any attempt to solicit or receive off-platform payments (circumventing Ventex fees) will lead to an immediate and permanent account ban."
    },
    {
      id: "prohibited",
      icon: ShieldAlert,
      title: "5. Prohibited Content & Activity",
      content: "You may not list financial scams, copyright-infringing materials, malware, adult content, or spam. You may not engage in automated scraping, DDOS attempts, or harassment of other platform users."
    },
    {
      id: "escrow",
      icon: Gavel,
      title: "6. Payment & Escrow Terms",
      content: "All marketplace sales are routed through secure Stripe Connect double-escrow setups. Payouts are held for an anti-fraud period of 7 days to allow buyers to inspect files and report any major defects or missing code."
    },
    {
      id: "disputes",
      icon: Gavel,
      title: "7. Dispute Arbitration",
      content: "If a buyer reports a product defect or failure of delivery, Ventex Admins act as final arbitrators. After reviewing seller responses and buyer claims, the Admin has full authority to either release funds to the seller or issue a refund back to the buyer's payment method."
    },
    {
      id: "ip",
      icon: Scale,
      title: "8. Intellectual Property",
      content: "You retain ownership of the pitch content and code you upload. By listing items, you grant Ventex a limited, non-exclusive license to showcase your brand, descriptions, and media to investors and potential buyers. All Ventex logo assets, CSS styles, layouts, and algorithms remain the exclusive property of Ventex."
    },
    {
      id: "liability",
      icon: AlertTriangle,
      title: "9. Limits of Liability & Disclaimer",
      content: "Ventex is not a licensed financial broker or investment advisor. Startup investing carries extreme risk, including complete loss of capital. Ventex does not guarantee the success, profitability, or legal validity of any pitch. All software and listings are provided 'AS IS' without warranty of any kind."
    },
    {
      id: "law",
      icon: Gavel,
      title: "10. Governing Law",
      content: "These terms and all disputes arising out of your usage of the Ventex platform are governed by and construed in accordance with the laws of India, without giving effect to conflicts of law principles. Any legal actions must be filed in courts located in India."
    }
  ];

  return (
    <div className="bg-[#0A0A0C] text-neutral-300 min-h-screen py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-neutral-900 pb-10">
          <div className="text-xs font-mono tracking-widest text-violet-400 uppercase">
            Legal Agreement
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
            Terms of Service
          </h1>
          <p className="text-neutral-500 text-sm font-mono">
            Last Updated: May 2026 · Version 1.2
          </p>
        </div>

        {/* Introduction */}
        <div className="p-6 rounded-xl bg-[#0F0F12] border border-neutral-900 text-sm leading-relaxed text-neutral-400">
          Welcome to Ventex. Please read these Terms of Service carefully before utilizing our marketplace or pitching services. These terms establish a legally binding contract between you and Ventex regarding platform access, commissions, security standards, and dispute handling.
        </div>

        {/* Table of Contents Quicklinks */}
        <div className="p-6 rounded-xl bg-[#0A0A0C] border border-neutral-900">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {sections.map((section, idx) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-neutral-500 hover:text-violet-400 transition-colors font-medium flex items-center gap-1.5"
              >
                <span className="text-violet-500/60 font-mono">[{idx + 1}]</span> {section.title.split(". ")[1]}
              </a>
            ))}
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-10">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <article
                key={sec.id}
                id={sec.id}
                className="p-8 rounded-xl bg-[#0F0F12] border border-neutral-900 hover:border-neutral-800/80 transition-all duration-300 space-y-4 scroll-mt-20 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-600/20 transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white font-mono tracking-wide">
                    {sec.title}
                  </h2>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed font-sans">
                  {sec.content}
                </p>
              </article>
            );
          })}
        </div>

        {/* Compliance Footer */}
        <div className="text-center pt-10 border-t border-neutral-900 text-xs text-neutral-500 font-mono space-y-2">
          <p>&copy; {currentYear} Ventex. Built for India&apos;s builders.</p>
          <p>For legal inquiries, contact {legalEmail}</p>
        </div>
      </div>
    </div>
  );
}
