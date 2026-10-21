import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE_NAME } from "@/lib/brand";
import MagneticButton from "./MagneticButton";
import { MaskText, ParagraphReveal } from "./ScrollReveal";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const brandName = SITE_NAME.toUpperCase();

  return (
    <footer className="site-footer page-padding" id="footer">
      <div className="footer-top">
        <span className="footer-kicker">THE NEXT CHAPTER IS OPEN</span>
        <span className="footer-coordinate">{brandName} / REMOTE-FIRST NETWORK</span>
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
        <MagneticButton href="/signup" variant="crimson">
          Start your pitch <ArrowUpRight size={17} />
        </MagneticButton>
      </div>

      <div className="footer-bottom">
        <div className="flex flex-col gap-3">
          <Link href="/" className="brand-lockup" aria-label={`${brandName} home`}>
            <span>{brandName}</span>
          </Link>
          <p className="text-xs text-[#79756e] max-w-xs leading-relaxed">
            Where startups pitch, fund and sell.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <span>Explore</span>
            <Link href="/discover">Discover</Link>
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/signup">Create Pitch</Link>
          </div>
          <div>
            <span>Company</span>
            <Link href="/about">About</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div>
            <span>Legal</span>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/seller-agreement">Seller Agreement</Link>
          </div>
        </div>
      </div>

      <div className="footer-legal">
        <span>© {currentYear} {brandName}. For people building what’s next.</span>
        <span>
          <Link href="/privacy">Privacy</Link>
          <i>·</i>
          <Link href="/terms">Terms</Link>
          <i>·</i>
          Made with intent
        </span>
      </div>
    </footer>
  );
}
