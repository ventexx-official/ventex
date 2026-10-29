"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  Plus,
  Minus,
  Play,
} from "lucide-react";
import { SITE_NAME } from "@/lib/brand";
import {
  MaskText,
  ParagraphReveal,
  InteractiveLetters,
  CountUp,
} from "@/components/ScrollReveal";
import MagneticButton from "@/components/MagneticButton";

function MarqueeTicker({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  const content = [...items, ...items];
  return (
    <div
      className={`marquee ${reverse ? "marquee--reverse" : ""}`}
      aria-label={items.join(", ")}
    >
      <div className="marquee__track">
        {content.map((item, index) => (
          <span className="marquee__item" key={`${item}-${index}`}>
            {item}
            <i aria-hidden="true">✳</i>
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-label">
      <span className="section-label__index">{index}</span>
      <span>{children}</span>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (!time) return <span>00:00:00 IST</span>;

  return (
    <span>
      {time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })}{" "}
      IST
    </span>
  );
}

const ecosystemRows = [
  {
    number: "01",
    title: "Discover",
    copy: "Browse published pitches from founders and teams, review versions, and explore real ideas gaining early momentum.",
    tag: "Browse published pitches",
  },
  {
    number: "02",
    title: "Pitch",
    copy: "Draft your pitch, revise it through version snapshots, and refine your core message before opening it to the network.",
    tag: "Draft, revise, publish",
  },
  {
    number: "03",
    title: "Connect",
    copy: "Express interest and open direct communication between founders and verified investors as rounds come together.",
    tag: "Direct founder interest",
  },
  {
    number: "04",
    title: "Market",
    copy: "List software products, license digital tools, or reach qualified buyers directly through the startup marketplace.",
    tag: "Sell directly on platform",
  },
];

const previewStartups = [
  {
    name: "Founder pitches opening soon",
    category: "FOUNDER ACCESS",
    description: "Verified founder pitches will appear here as the inaugural publishing cohort goes live.",
    className: "startup-card--blue",
    mark: "P",
    founder: "First cohort forming",
  },
  {
    name: "Founder profiles opening soon",
    category: "PEOPLE / NETWORK",
    description: "Founders can share their team context, journey milestones, and current pitch version here.",
    className: "startup-card--sand",
    mark: "F",
    founder: "Open for registration",
  },
  {
    name: "Be one of the first",
    category: "PLATFORM PREVIEW",
    description: "The ecosystem is live for registration. Join early to build your pitch and claim your presence.",
    className: "startup-card--plum",
    mark: "→",
    founder: "Sign up today",
  },
];

const marketplaceListings = [
  {
    type: "SOFTWARE",
    title: "Software listings opening soon",
    price: "Browse soon",
    color: "market-item--lime",
  },
  {
    type: "DIGITAL TOOLS",
    title: "Developer toolkits opening soon",
    price: "Early access",
    color: "market-item--red",
  },
  {
    type: "CUSTOM WORK",
    title: "List your product or offering",
    price: "Apply early",
    color: "market-item--cream",
  },
];

const sectionItems = [
  { id: "top", label: "Hero", index: "00" },
  { id: "story", label: "Manifesto", index: "01" },
  { id: "pitch", label: "How it moves", index: "02" },
  { id: "startups", label: "Startups", index: "03" },
  { id: "intelligence", label: "Mentor preview", index: "04" },
  { id: "marketplace", label: "Marketplace", index: "05" },
];

export default function Home() {
  const [activePage, setActivePage] = useState("top");
  const [activeRow, setActiveRow] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(
    "Lead with the customer problem, then make the ask specific: what are you raising, why now, and what milestone will that capital unlock?"
  );
  const [activeSuggestion, setActiveSuggestion] = useState("Find my wedge");

  const brandName = SITE_NAME.toUpperCase();

  useEffect(() => {
    const sections = sectionItems
      .map((page) => document.getElementById(page.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActivePage(visible.target.id);
      },
      { rootMargin: "-28% 0px -48% 0px", threshold: [0.12, 0.3, 0.6] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const runAssistant = (prompt = aiPrompt || activeSuggestion) => {
    const responses: Record<string, string> = {
      "Find my wedge":
        "Name the narrow customer problem your pitch solves, then show why your approach is meaningfully different from the alternatives.",
      "Name my audience":
        "Start with the people who feel this problem most urgently. A specific buyer profile will make the pitch easier to test and improve.",
      "Sharpen my pitch":
        "Clarify the ask, the milestone it funds, and the evidence you will bring back. Investors should know exactly what happens next.",
    };
    setAiResponse(
      responses[prompt] ||
        `Here’s a sharper starting point for “${prompt}”: make the insight tangible in one small, undeniable proof.`
    );
    setAiPrompt("");
  };

  return (
    <div className="relative">
      <main id="top">
        {/* HERO SECTION */}
        <section className="hero-section min-h-[100dvh]">
          <div className="hero-scanline" aria-hidden="true" />
          <div className="hero-assembly" aria-hidden="true">
            <span>{brandName} / 01</span>
            <i />
            <span>BUILDING IN PUBLIC</span>
          </div>
          <div className="hero-glow hero-glow--one" />
          <div className="hero-glow hero-glow--two" />
          <div className="hero-grid" aria-hidden="true" />

          <div className="hero-content page-padding">
            <div className="hero-eyebrow">
              <span className="status-dot" /> THE STARTUP ECOSYSTEM, IN MOTION{" "}
              <span className="hero-eyebrow__year">/ 2026</span>
              <span className="hero-clock">
                / <LiveClock />
              </span>
            </div>

            <h1 className="hero-title">
              <span className="hero-title__line">
                <MaskText delay={100}>
                  <InteractiveLetters text="Build." />
                </MaskText>
              </span>
              <span className="hero-title__line hero-title__line--indent">
                <MaskText delay={180}>
                  <InteractiveLetters text="Pitch." />
                </MaskText>
                <span className="hero-outline" aria-hidden="true">
                  Shape.
                </span>
              </span>
              <span className="hero-title__line">
                <MaskText delay={260}>
                  <InteractiveLetters text="Get discovered." />
                </MaskText>
              </span>
            </h1>

            <div className="hero-bottom">
              <ParagraphReveal>
                {brandName} is the living layer between a good idea and the people who can make it matter.
              </ParagraphReveal>
              <div className="hero-actions">
                <MagneticButton href="/discover" variant="light">
                  Explore the ecosystem <ArrowDownRight size={17} />
                </MagneticButton>
                <a href="#story" className="play-link">
                  <span className="play-icon">
                    <Play size={12} fill="currentColor" />
                  </span>{" "}
                  See how it works
                </a>
              </div>
            </div>
          </div>

          <div className="hero-side-note">
            <span>SCROLL TO EXPLORE</span>
            <span className="hero-side-note__line" />
          </div>
          <div className="hero-coordinate">{brandName} / REMOTE-FIRST NETWORK</div>
          <div className="hero-orbit" aria-hidden="true">
            <span>{brandName.charAt(0)}</span>
          </div>
        </section>

        {/* TICKER */}
        <section
          className="ticker-section"
          aria-label={`${brandName} ecosystem categories`}
        >
          <MarqueeTicker
            items={[
              brandName,
              "FOUNDERS",
              "STARTUPS",
              "INVESTORS",
              "MARKETPLACE",
              "DISCOVERY",
            ]}
          />
        </section>

        {/* MANIFESTO */}
        <section className="manifesto-section page-padding" id="story">
          <div className="manifesto-meta">
            <SectionLabel index="01">A different kind of platform</SectionLabel>
            <span className="meta-aside">
              NOT ANOTHER FEED
              <br />
              A BETTER SIGNAL
            </span>
          </div>

          <div className="manifesto-grid">
            <h2 className="display-heading display-heading--xl">
              <MaskText>Where ambition</MaskText>
              <MaskText delay={80}>finds its people.</MaskText>
            </h2>
            <div className="manifesto-copy">
              <ParagraphReveal>
                Startups do not grow in isolation. They grow through the right collision — a founder with a sharper question, an investor with a longer view, a product with a first believer.
              </ParagraphReveal>
              <ParagraphReveal>
                {brandName} makes those collisions easier to find, easier to trust, and much harder to forget.
              </ParagraphReveal>
              <Link href="/discover" className="text-link">
                Meet the ecosystem <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          <div className="manifesto-stamp" aria-hidden="true">
            <span>{brandName}</span>
            <span>EST. 2026</span>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="stats-section page-padding" id="stats">
          <div className="stats-intro">
            <SectionLabel index="02">A platform with pull</SectionLabel>
            <span>
              Small signals.
              <br />
              Real momentum.
            </span>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <CountUp value={0} suffix="" />
              <span>
                published pitches
                <br />
                so far
              </span>
            </div>
            <div className="stat-item">
              <CountUp value={0} suffix="" />
              <span>
                marketplace listings
                <br />
                so far
              </span>
            </div>
            <div className="stat-item">
              <CountUp value={0} />
              <span>
                cities connected
                <br />
                so far
              </span>
            </div>
            <div className="stat-item stat-item--accent">
              <span className="stat-arrow">↗</span>
              <span>
                Built for
                <br />
                the in-between
              </span>
            </div>
          </div>
        </section>

        {/* ECOSYSTEM / HOW IT MOVES */}
        <section className="ecosystem-section page-padding" id="pitch">
          <div className="section-heading-row">
            <SectionLabel index="03">How it moves</SectionLabel>
            <span className="section-caption">
              From first thought
              <br />
              to full flight.
            </span>
          </div>

          <div className="ecosystem-list">
            {ecosystemRows.map((row, index) => {
              const active = activeRow === index;
              return (
                <button
                  key={row.number}
                  className={`ecosystem-row ${active ? "is-active" : ""}`}
                  onClick={() => setActiveRow(active ? -1 : index)}
                  aria-expanded={active}
                >
                  <span className="ecosystem-row__number">{row.number}</span>
                  <span className="ecosystem-row__title">{row.title}</span>
                  <span className="ecosystem-row__copy">{row.copy}</span>
                  <span className="ecosystem-row__tag">{row.tag}</span>
                  <span className="ecosystem-row__icon">
                    {active ? <Minus size={19} /> : <Plus size={19} />}
                  </span>
                  <span className="ecosystem-row__mobile-copy">{row.copy}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* STARTUPS SECTION */}
        <section className="startups-section page-padding" id="startups">
          <div className="section-heading-row startups-heading">
            <div>
              <SectionLabel index="04">A closer look</SectionLabel>
              <h2 className="display-heading">
                <MaskText>
                  Startups with
                  <br />
                  <em>something to say.</em>
                </MaskText>
              </h2>
            </div>
            <Link
              href="/discover"
              className="circle-link"
              aria-label="Explore all startups"
            >
              <ArrowUpRight size={22} />
            </Link>
          </div>

          <div className="startup-grid">
            {previewStartups.map((startup, index) => (
              <article
                className={`startup-card ${startup.className}`}
                key={startup.name}
              >
                <div className="startup-card__visual">
                  <span className="startup-card__mark">{startup.mark}</span>
                  <span className="startup-card__year">N° 0{index + 1}</span>
                  <span className="startup-card__orbit" />
                </div>
                <div className="startup-card__info">
                  <div>
                    <span className="startup-card__category">
                      {startup.category}
                    </span>
                    <h3>{startup.name}</h3>
                  </div>
                  <ArrowUpRight size={20} className="startup-card__arrow" />
                </div>
                <div className="startup-card__details">
                  <p>{startup.description}</p>
                  <span>Cohort / {startup.founder}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="startups-footer">
            <span>THE PEOPLE BEHIND THE PROGRESS</span>
            <Link href="/discover" className="text-link">
              View all pitches <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>

        {/* AI MENTOR PREVIEW */}
        <section className="assistant-section page-padding" id="intelligence">
          <div className="assistant-beam" aria-hidden="true" />
          <div className="assistant-header">
            <SectionLabel index="05">Coming soon: Pitch Guidance</SectionLabel>
            <span className="assistant-status">
              <span className="status-dot status-dot--dark" /> {brandName} AI / PREVIEW
            </span>
          </div>

          <div className="assistant-layout">
            <div className="assistant-intro">
              <h2 className="display-heading display-heading--large">
                <MaskText>
                  Make the
                  <br />
                  <span className="text-[var(--red)]">next move.</span>
                </MaskText>
              </h2>
              <ParagraphReveal>
                A planned thinking partner for the messy middle — designed to review pitch drafts, sharpen questions, and clarify market wedges before opening to investors.
              </ParagraphReveal>
              <div className="assistant-chips">
                {["Find my wedge", "Name my audience", "Sharpen my pitch"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      className={
                        activeSuggestion === suggestion ? "is-selected" : ""
                      }
                      onClick={() => {
                        setActiveSuggestion(suggestion);
                        runAssistant(suggestion);
                      }}
                    >
                      {suggestion}
                      <ArrowUpRight size={14} />
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="assistant-panel">
              <div className="assistant-panel__top">
                <div>
                  <span className="tiny-label">WORKSPACE / PREVIEW</span>
                  <span className="assistant-context">
                    Interactive sample / version review
                  </span>
                </div>
                <Sparkles size={18} />
              </div>

              <div className="assistant-panel__conversation">
                <div className="assistant-message assistant-message--user">
                  Can you help me clarify the ask in my seed pitch and show what this round unlocks?
                </div>
                <div className="assistant-message assistant-message--ai">
                  <span className="ai-avatar">{brandName.charAt(0)}</span>
                  <div>
                    <span className="tiny-label">{brandName} AI / PITCH MENTOR</span>
                    <p>{aiResponse}</p>
                  </div>
                </div>
              </div>

              <form
                className="assistant-input"
                onSubmit={(event) => {
                  event.preventDefault();
                  runAssistant();
                }}
              >
                <input
                  value={aiPrompt}
                  onChange={(event) => setAiPrompt(event.target.value)}
                  placeholder="Ask a sharper question..."
                  aria-label={`Ask ${brandName} AI`}
                />
                <button type="submit" aria-label="Send question">
                  <ArrowUpRight size={18} />
                </button>
              </form>

              <div className="assistant-panel__footer">
                <span>
                  <span className="pulse-dot" /> Preview mode (Full AI assistant coming soon)
                </span>
                <span>Private workspace</span>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS SECTION */}
        <section className="process-section page-padding" id="process">
          <div className="section-heading-row">
            <SectionLabel index="06">The {brandName} loop</SectionLabel>
            <span className="section-caption">
              Good things compound
              <br />
              when the path is clear.
            </span>
          </div>

          <div className="process-grid">
            {["Create", "Pitch", "Connect", "Grow"].map((step, index) => (
              <div
                className={`process-item ${index === 0 ? "process-item--active" : ""}`}
                key={step}
              >
                <span className="process-item__number">0{index + 1}</span>
                <div className="process-item__line">
                  <span />
                </div>
                <h3>{step}</h3>
                <p>
                  {[
                    "Make the idea tangible.",
                    "Give it a point of view.",
                    "Find the right people.",
                    "Keep the momentum alive.",
                  ][index]}
                </p>
                <ArrowUpRight size={17} />
              </div>
            ))}
          </div>
        </section>

        {/* MARKETPLACE SECTION */}
        <section className="marketplace-section" id="marketplace">
          <div className="page-padding marketplace-inner">
            <div className="marketplace-heading">
              <SectionLabel index="07">The useful side of ambition</SectionLabel>
              <h2 className="display-heading display-heading--large">
                <MaskText>
                  Things worth
                  <br />
                  <em>putting to work.</em>
                </MaskText>
              </h2>
              <ParagraphReveal>
                Founder-built software, licenses, digital assets, and tools with a practical purpose.
              </ParagraphReveal>
              <Link
                href="/marketplace"
                className="text-link text-link--light"
              >
                Enter the marketplace <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="marketplace-list">
              {marketplaceListings.map((item, index) => (
                <Link
                  href="/marketplace"
                  className={`market-item ${item.color}`}
                  key={item.title}
                >
                  <span className="market-item__index">0{index + 1}</span>
                  <span className="market-item__type">{item.type}</span>
                  <strong>{item.title}</strong>
                  <span className="market-item__price">{item.price}</span>
                  <ArrowUpRight size={19} />
                </Link>
              ))}
            </div>
          </div>

          <MarqueeTicker
            items={["MAKE USEFUL THINGS", "SHARE THE WORK", "KEEP MOVING"]}
            reverse
          />
        </section>

        {/* SECTION TRACKER (DESKTOP / MOBILE COMPATIBLE) */}
        <div className="section-tracker" aria-label="Page section tracker">
          <span className="section-tracker__caption">CURRENTLY</span>
          <div className="section-tracker__items">
            {sectionItems.map((page) => (
              <a
                key={page.id}
                href={`#${page.id}`}
                className={activePage === page.id ? "is-active" : ""}
                aria-current={activePage === page.id ? "page" : undefined}
              >
                <span className="section-tracker__dot" />
                <span>{page.label}</span>
              </a>
            ))}
          </div>
          <span className="section-tracker__counter">
            {sectionItems.findIndex((page) => page.id === activePage) + 1} /{" "}
            {String(sectionItems.length).padStart(2, "0")}
          </span>
        </div>
      </main>
    </div>
  );
}
