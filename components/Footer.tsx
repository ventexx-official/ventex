import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE_NAME } from "@/lib/brand";
import MagneticButton from "./MagneticButton";
import { MaskText, ParagraphReveal } from "./ScrollReveal";

const columns = [
  {
    title: "Product",
    links: [
      ["Home", "/"],
      ["Discover", "/discover"],
      ["For Founders", "/founder/create-pitch"],
      ["Marketplace", "/marketplace"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Knowledge Base", "/learn"],
      ["FAQs", "/faq"],
      ["Investors", "/investors"],
      ["Contact", "/contact"],
      ["Resources", "/resources/schemes"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Terms", "/terms"],
      ["Privacy", "/privacy"],
      ["Seller Agreement", "/seller-agreement"],
      ["Refunds", "/refund-policy"],
      ["Delivery", "/delivery-policy"],
    ],
  },
  {
    title: "Social",
    links: [
      ["Instagram", "https://www.instagram.com/ventexhq/"],
      ["X (Twitter)", "https://x.com/ventex_hq"],
      ["LinkedIn", "https://www.linkedin.com/in/ventex"],
      ["YouTube", "https://youtube.com/@ventexhq?si=9BZ8Rg7W5tpkWkBv"],
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer page-padding" id="footer">
      <div className="footer-top">
        <span className="footer-kicker">THE NEXT CHAPTER IS OPEN</span>
        <span className="footer-coordinate">{SITE_NAME} / REMOTE-FIRST NETWORK</span>
      </div>

      <h2 className="footer-title">
        <MaskText>
          Build something<br />
          <em>worth discovering.</em>
        </MaskText>
      </h2>

      <div className="footer-cta">
        <ParagraphReveal>
          Bring the rough idea. Leave with a clearer next move.
        </ParagraphReveal>
        <MagneticButton href="/founder/create-pitch" variant="crimson">
          Start your pitch <ArrowUpRight size={17} />
        </MagneticButton>
      </div>

      <div className="footer-bottom">
        <div className="flex flex-col gap-3">
          <Link href="/" className="brand-lockup">
            <span className="brand-mark">
              <span>{SITE_NAME.charAt(0)}</span>
            </span>
            <span>{SITE_NAME}</span>
          </Link>
          <p className="text-xs text-[#79756e] max-w-xs leading-relaxed">
            Where startups pitch, fund and sell.
          </p>
        </div>

        <div className="footer-links">
          {columns.slice(0, 3).map((column) => (
            <div key={column.title}>
              <span>{column.title}</span>
              {column.links.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="footer-legal">
        <span>
          © {currentYear} {SITE_NAME}. For people building what’s next.
        </span>
        <span>
          <Link href="/privacy" className="hover:text-red">Privacy</Link>
          <i>·</i>
          <Link href="/terms" className="hover:text-red">Terms</Link>
          <i>·</i>
          Made with intent
        </span>
      </div>
    </footer>
  );
}
