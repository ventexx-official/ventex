import type { Metadata } from "next";
import { Handshake, Landmark, Ban, ShieldAlert, BadgeCent } from "lucide-react";
import { BASE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Seller Agreement Ã¢â‚¬â€ Startup Platform",
  description: "Seller Terms and conditions regulating digital product listings, fee structures, escrow processing, and strict anti-bypass rules on the Ventex marketplace.",
  alternates: {
    canonical: "/seller-agreement",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Seller Agreement Ã¢â‚¬â€ Startup Platform",
    description: "Seller Terms and conditions regulating digital product listings, fee structures, escrow processing, and strict anti-bypass rules on the Ventex marketplace.",
    url: `${BASE_URL}/seller-agreement`,
    type: "website",
    siteName: "Ventex",
  },
};

export default function SellerAgreementPage() {
  const currentYear = new Date().getFullYear();
  const clauses = [
    {
      icon: Handshake,
      title: "1. Seller Eligibility",
      desc: "To list products, code databases, SaaS boilerplates, or digital tools on the Ventex Marketplace, you must represent a valid developer or business owner. You must link an active, verified Stripe Connect account to receive payouts. Ventex reserves the right to request proof of authorship or product licenses prior to listing approvals."
    },
    {
      icon: BadgeCent,
      title: "2. Flat 5% Platform Commission",
      desc: "By listing digital assets on Ventex, you authorize the platform to deduct a flat 5% commission from the gross transaction amount. The remaining 95% is routed directly to your connected Stripe account balance. There are no hidden subscription charges or listing fees."
    },
    {
      icon: Landmark,
      title: "3. 7-Day Anti-Fraud Payout Hold",
      desc: "To guarantee buyer protection and prevent fraudulent listings, all purchase funds are securely held in escrow for a duration of 7 days starting from successful delivery. Buyers have this window to review the product. Payout balances are released automatically to your connect balance on the 8th day, unless an active dispute is flagged."
    },
    {
      icon: Ban,
      title: "4. Prohibited Marketplace Listings",
      desc: "Sellers are prohibited from listing malicious software, stolen code templates, adult items, scam material, speculative investment tokens, or files containing licenses they do not legally possess. All listings undergo strict admin audits and financial disclosures scans."
    },
    {
      icon: ShieldAlert,
      title: "5. Zero Tolerance Off-Platform Rule",
      desc: "Any attempt to redirect Ventex marketplace buyers to complete transactions off-platform (including sharing bank details, custom PayPal links, or third-party checkouts in descriptions, images, or buyer messages) will trigger an automated security alert. **Violation of this clause results in an immediate, permanent, and irreversible account ban** along with forfeiture of any active escrow balances."
    },
    {
      icon: ShieldAlert,
      title: "6. Escalation & Dispute Resolution",
      desc: "By utilizing the Ventex marketplace, sellers agree to participate in the admin dispute arbitration process in good faith. If a buyer files a dispute for defective or missing code, you will have 48 hours to submit a rebuttal response. The decision of the Ventex Admin (to either release funds to you or process a full refund to the buyer) is final and binding on both parties."
    }
  ];

  return (
    <div className="bg-[#0A0A0C] text-neutral-300 min-h-screen py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-neutral-900 pb-10">
          <div className="text-xs font-mono tracking-widest text-violet-400 uppercase">
            Marketplace Charter
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
            Seller Agreement
          </h1>
          <p className="text-neutral-500 text-sm font-mono">
            Last Updated: May 2026 Ã‚Â· Flat 5% Commission Escrow Standard
          </p>
        </div>

        {/* Warning Banner */}
        <div className="p-6 rounded-xl bg-red-950/20 border border-red-900/40 text-sm leading-relaxed text-red-300 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-xs">CRITICAL WARNING FOR SELLERS</h4>
            <p className="text-red-400/90 text-xs">
              To protect the marketplace, direct-payment solicitation, bank sharing, or redirecting buyers outside our secure Stripe Connect gateway is strictly prohibited. Violators will face **permanent bans** and **immediate escrow forfeiture**.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="p-6 rounded-xl bg-[#0F0F12] border border-neutral-900 text-sm leading-relaxed text-neutral-400">
          This Seller Agreement governs your participation as a merchant on the Ventex digital marketplace. By listing any product, template, or code package, you agree to comply with our commissions policy, file verification processes, and anti-fraud holds.
        </div>

        {/* Clause List */}
        <div className="grid grid-cols-1 gap-6">
          {clauses.map((clause, index) => {
            const Icon = clause.icon;
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
                    {clause.title}
                  </h2>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {clause.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Escrow Banner */}
        <div className="p-8 rounded-xl bg-[#0F0F12]/60 border border-neutral-900 text-center space-y-4">
          <Landmark className="w-8 h-8 text-violet-500 mx-auto" />
          <h3 className="text-base font-bold text-white tracking-wider uppercase font-mono">
            Secure Escrow Integration
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Ventex uses Stripe Connect to automatically handle splits, platform deductions, and regional payouts. Ensure your connect onboarding is 100% finished to avoid hold delays.
          </p>
        </div>

        {/* Compliance Footer */}
        <div className="text-center pt-6 border-t border-neutral-900 text-xs text-neutral-500 font-mono">
          <p>&copy; {currentYear} Ventex. Built for India&apos;s builders.</p>
        </div>
      </div>
    </div>
  );
}