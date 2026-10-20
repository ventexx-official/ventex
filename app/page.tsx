"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  GitBranch,
  Shield,
  Bot,
  Star,
  Users,
  MessageSquare,
  Newspaper,
  Plus,
  Minus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SITE_NAME } from "@/lib/brand";
import {
  MaskText,
  ParagraphReveal,
  InteractiveLetters,
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

interface PitchCardData {
  id: string;
  title: string;
  tagline?: string | null;
  short_description?: string | null;
  industry?: string | null;
  company_stage?: string | null;
  ai_score?: number | null;
  stars_count?: number | null;
}

const SECTION_TRACKER_ITEMS = [
  { id: "hero", label: "Start", index: "01" },
  { id: "how-it-works", label: "Workflow", index: "02" },
  { id: "workspace", label: "Workspace", index: "03" },
  { id: "discover", label: "Discover", index: "04" },
  { id: "marketplace", label: "Marketplace", index: "05" },
  { id: "coming-soon", label: "Roadmap", index: "06" },
];

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");

  // Pitch Mentor interactive preview state
  const [activeSuggestion, setActiveSuggestion] = useState("Find my wedge");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(
    "Name the narrow customer problem your pitch solves, then prove why your approach is 10x better than the current workaround."
  );

  // Top real pitches state
  const [topPitches, setTopPitches] = useState<PitchCardData[]>([]);
  const [pitchesLoading, setPitchesLoading] = useState(true);

  useEffect(() => {
    async function fetchTopPitches() {
      try {
        setPitchesLoading(true);
        const { data, error } = await supabase
          .from("pitches")
          .select(
            "id, title, tagline, short_description, industry, company_stage, ai_score, stars_count"
          )
          .eq("status", "live")
          .order("ai_score", { ascending: false, nullsFirst: false })
          .limit(3);

        if (!error && data && data.length > 0) {
          setTopPitches(data);
        } else {
          setTopPitches([]);
        }
      } catch (err) {
        console.error("Failed to fetch top pitches:", err);
        setTopPitches([]);
      } finally {
        setPitchesLoading(false);
      }
    }

    fetchTopPitches();
  }, []);

  useEffect(() => {
    const elements = SECTION_TRACKER_ITEMS.map((item) =>
      document.getElementById(item.id)
    ).filter(Boolean) as HTMLElement[];

    if (!elements.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (intersecting) {
          setActiveSection(intersecting.target.id);
        }
      },
      { rootMargin: "-20% 0px -40% 0px", threshold: [0.1, 0.3, 0.6] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const runAssistant = (promptText = aiPrompt || activeSuggestion) => {
    const responses: Record<string, string> = {
      "Find my wedge":
        "Name the narrow customer problem your pitch solves, then prove why your approach is 10x better than the current workaround.",
      "Name my audience":
        "Start with the exact people who feel this problem every single week. A precise buyer persona makes customer interviews much sharper.",
      "Sharpen my ask":
        "Clarify what you are raising, exactly what key milestone that capital buys, and what proof you will bring back to the table.",
    };

    setAiResponse(
      responses[promptText] ||
        `For "${promptText}": separate vanity metrics from hard retention. What is the one truth only you and your users know?`
    );
    setAiPrompt("");
  };

  const steps = [
    {
      number: "01",
      title: "Seed an idea",
      copy: "Start in private. Brainstorm your problem, solution, and wedge without the noise of public social feeds.",
      tag: "Private incubation",
    },
    {
      number: "02",
      title: "Build & refine with AI mentor",
      copy: "Test your logic against our AI mentor. Clarify market sizing, refine your story, and eliminate hand-waving.",
      tag: "On-demand critique",
    },
    {
      number: "03",
      title: "Every save is a version",
      copy: "Git-style commit history for your startup. Track milestones, customer feedback, and how your narrative evolved.",
      tag: "Immutable change log",
    },
    {
      number: "04",
      title: "Go public when ready for funding",
      copy: "Flip the switch from private draft to published pitch. Get ranked, verified, and discovered by real investors.",
      tag: "Verified launch",
    },
  ];

  return (
    <>
      {/* 1. HERO SECTION */}
      <section className="hero-section" id="hero">
        <div className="hero-scanline" aria-hidden="true" />
        <div className="hero-assembly" aria-hidden="true">
          <span>{SITE_NAME} / V3</span>
          <i />
          <span>GITHUB FOR FOUNDERS</span>
        </div>
        <div className="hero-glow hero-glow--one" />
        <div className="hero-glow hero-glow--two" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-content page-padding">
          <div className="hero-eyebrow">
            <span className="status-dot" />
            <span>BUILD PRIVATELY. LAUNCH WITH CONVICTION.</span>
            <span className="hero-eyebrow__year">/ 2026</span>
            <span className="hero-clock">
              / <LiveClock />
            </span>
          </div>

          <h1 className="hero-title">
            <span className="hero-title__line">
              <MaskText delay={100}>
                <InteractiveLetters text="Build in private." />
              </MaskText>
            </span>
            <span className="hero-title__line hero-title__line--indent">
              <MaskText delay={180}>
                <InteractiveLetters text="Ship with versions." />
              </MaskText>
              <span className="hero-outline" aria-hidden="true">
                Pitch.
              </span>
            </span>
            <span className="hero-title__line">
              <MaskText delay={260}>
                <InteractiveLetters text="Fund in public." />
              </MaskText>
            </span>
          </h1>

          <div className="hero-bottom">
            <ParagraphReveal>
              {SITE_NAME} is the version-controlled workspace for ambitious
              builders. Incubate your idea quietly, refine it with an AI mentor,
              and open it to investors when you are ready.
            </ParagraphReveal>
            <div className="hero-actions">
              <MagneticButton href="/signup" variant="light">
                Start Building <ArrowDownRight size={17} />
              </MagneticButton>
              <Link href="/discover" className="play-link">
                <span className="play-icon">
                  <ArrowUpRight size={14} />
                </span>
                Explore pitches
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-side-note">
          <span>SCROLL TO EXPLORE</span>
          <span className="hero-side-note__line" />
        </div>
        <div className="hero-coordinate">{SITE_NAME} / FOUNDER OPERATING SYSTEM</div>
        <div className="hero-orbit" aria-hidden="true">
          <span>{SITE_NAME.charAt(0)}</span>
        </div>
      </section>

      {/* TICKER MARQUEE */}
      <section
        className="ticker-section"
        aria-label={`${SITE_NAME} core primitives`}
      >
        <MarqueeTicker
          items={[
            "GITHUB FOR FOUNDERS",
            "VERSION-CONTROLLED PITCHES",
            "AI PITCH MENTOR",
            "DIRECT INVESTOR INQUIRIES",
            "FOUNDER MARKETPLACE",
            "PRIVATE INCUBATION",
          ]}
        />
      </section>

      {/* 2. HOW IT WORKS (4 STEPS) */}
      <section className="ecosystem-section page-padding" id="how-it-works">
        <div className="section-heading-row">
          <SectionLabel index="01">The Workflow</SectionLabel>
          <span className="section-caption">
            From raw notebook sketch
            <br />
            to closed round.
          </span>
        </div>

        <div className="ecosystem-list">
          {steps.map((step, index) => {
            const active = activeStep === index;
            return (
              <button
                key={step.number}
                className={`ecosystem-row ${active ? "is-active" : ""}`}
                onClick={() => setActiveStep(active ? -1 : index)}
                aria-expanded={active}
              >
                <span className="ecosystem-row__number">{step.number}</span>
                <span className="ecosystem-row__title">{step.title}</span>
                <span className="ecosystem-row__copy">{step.copy}</span>
                <span className="ecosystem-row__tag">{step.tag}</span>
                <span className="ecosystem-row__icon">
                  {active ? <Minus size={19} /> : <Plus size={19} />}
                </span>
                <span className="ecosystem-row__mobile-copy">{step.copy}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. FOUNDER WORKSPACE */}
      <section className="assistant-section page-padding" id="workspace">
        <div className="assistant-beam" aria-hidden="true" />
        <div className="assistant-header">
          <SectionLabel index="02">Founder Workspace</SectionLabel>
          <span className="assistant-status">
            <span className="status-dot status-dot--dark" /> {SITE_NAME} AI /
            ONLINE
          </span>
        </div>

        <div className="assistant-layout">
          <div className="assistant-intro">
            <h2 className="display-heading display-heading--large">
              <MaskText>
                Private by default.
                <br />
                <em>Built to iterate.</em>
              </MaskText>
            </h2>
            <ParagraphReveal>
              Everything you build starts completely confidential. No spam, no
              premature exposure. Treat each pitch like an evolving codebase with
              real commit logs and an on-demand AI thinking partner.
            </ParagraphReveal>

            {/* Workspace Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
              <div className="p-4 bg-[var(--paper)]/80 rounded-2xl border border-[var(--ink)]/10 text-[var(--ink)]">
                <Shield className="w-5 h-5 text-[var(--red)] mb-2" />
                <h4 className="font-bold text-xs uppercase tracking-wider mb-1">
                  Private Incubation
                </h4>
                <p className="text-[11px] text-[var(--ink)]/70 leading-normal">
                  Nobody sees your draft until you explicitly hit Publish.
                </p>
              </div>

              <div className="p-4 bg-[var(--paper)]/80 rounded-2xl border border-[var(--ink)]/10 text-[var(--ink)]">
                <GitBranch className="w-5 h-5 text-[var(--red)] mb-2" />
                <h4 className="font-bold text-xs uppercase tracking-wider mb-1">
                  Version History
                </h4>
                <p className="text-[11px] text-[var(--ink)]/70 leading-normal">
                  Every edit creates a commit. Compare previous iterations with 1 click.
                </p>
              </div>

              <div className="p-4 bg-[var(--paper)]/80 rounded-2xl border border-[var(--ink)]/10 text-[var(--ink)]">
                <Bot className="w-5 h-5 text-[var(--red)] mb-2" />
                <h4 className="font-bold text-xs uppercase tracking-wider mb-1">
                  AI Pitch Mentor
                </h4>
                <p className="text-[11px] text-[var(--ink)]/70 leading-normal">
                  Instant honest pushback on pricing, TAM, and defensibility.
                </p>
              </div>
            </div>

            <div className="assistant-chips">
              {["Find my wedge", "Name my audience", "Sharpen my ask"].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    className={activeSuggestion === suggestion ? "is-selected" : ""}
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

          {/* Interactive AI Mentor Mockup */}
          <div className="assistant-panel">
            <div className="assistant-panel__top">
              <div>
                <span className="tiny-label">WORKSPACE / 01</span>
                <span className="assistant-context">
                  Pitch Review / Commit v0.4
                </span>
              </div>
              <Sparkles size={18} />
            </div>

            <div className="assistant-panel__conversation">
              <div className="assistant-message assistant-message--user">
                How should I structure the traction slide if we are pre-revenue but have 800 waitlist signups?
              </div>
              <div className="assistant-message assistant-message--ai">
                <span className="ai-avatar">{SITE_NAME.charAt(0)}</span>
                <div>
                  <span className="tiny-label">{SITE_NAME} AI / MENTOR</span>
                  <p>{aiResponse}</p>
                </div>
              </div>
            </div>

            <form
              className="assistant-input"
              onSubmit={(e) => {
                e.preventDefault();
                runAssistant();
              }}
            >
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask your mentor a question..."
                aria-label={`Ask ${SITE_NAME} AI`}
              />
              <button type="submit" aria-label="Send query">
                <ArrowUpRight size={18} />
              </button>
            </form>

            <div className="assistant-panel__footer">
              <span>
                <span className="pulse-dot" /> Live founder workspace
              </span>
              <span>Confidential & encrypted</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DISCOVER (PITCHES RANKED BY AI SCORE + COMMUNITY STARS) */}
      <section className="startups-section page-padding" id="discover">
        <div className="section-heading-row startups-heading">
          <div>
            <SectionLabel index="03">Discover</SectionLabel>
            <h2 className="display-heading">
              <MaskText>
                Pitches ranked by <em>signal.</em>
              </MaskText>
            </h2>
          </div>
          <Link
            href="/discover"
            className="circle-link"
            aria-label="View all pitches"
          >
            <ArrowUpRight size={22} />
          </Link>
        </div>

        {/* Real Pitches or Clean Empty State */}
        {pitchesLoading ? (
          <div className="startup-grid">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="startup-card min-h-[380px] bg-card animate-pulse rounded-2xl border border-line"
              />
            ))}
          </div>
        ) : topPitches.length > 0 ? (
          <div className="startup-grid">
            {topPitches.map((pitch, idx) => (
              <Link
                key={pitch.id}
                href={`/pitch/${pitch.id}`}
                className="startup-card startup-card--blue block transition-transform hover:-translate-y-2"
              >
                <div className="startup-card__visual">
                  <span className="startup-card__mark">
                    {pitch.title.charAt(0).toUpperCase()}
                  </span>
                  <span className="startup-card__year">N° 0{idx + 1}</span>
                  <span className="startup-card__orbit" />
                </div>
                <div className="startup-card__info">
                  <div>
                    <span className="startup-card__category">
                      {pitch.industry || "STARTUP"}
                    </span>
                    <h3>{pitch.title}</h3>
                  </div>
                  <ArrowUpRight size={20} className="startup-card__arrow" />
                </div>
                <div className="startup-card__details">
                  <p className="line-clamp-2">
                    {pitch.tagline || pitch.short_description || "Verified pitch."}
                  </p>
                  <span>
                    Score: {pitch.ai_score ? `${pitch.ai_score}/100` : "Ranked"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-16 p-12 text-center rounded-3xl border border-line bg-card/60 backdrop-blur-sm max-w-xl mx-auto">
            <span className="brand-mark mx-auto mb-4">
              <span>{SITE_NAME.charAt(0)}</span>
            </span>
            <h3 className="text-xl font-bold font-display uppercase tracking-tight text-paper mb-2">
              First pitches arrive soon
            </h3>
            <p className="text-sm text-paper-dim leading-relaxed mb-6">
              Founders are currently incubating pitches in private drafts. As
              cohort launches are verified, the highest-signal pitches will rank
              here.
            </p>
            <MagneticButton href="/founder/create-pitch" variant="crimson">
              Submit your pitch <ArrowUpRight size={15} />
            </MagneticButton>
          </div>
        )}

        <div className="startups-footer">
          <span>RANKED BY AI SCORE + COMMUNITY STARS</span>
          <Link href="/discover" className="text-link">
            Explore discover feed <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      {/* 5. MARKETPLACE (FOUNDERS SELL PRODUCTS, BUYERS INQUIRE) */}
      <section className="marketplace-section" id="marketplace">
        <div className="page-padding marketplace-inner">
          <div className="marketplace-heading">
            <SectionLabel index="04">Marketplace</SectionLabel>
            <h2 className="display-heading display-heading--large">
              <MaskText>
                Sell what you build.
                <br />
                <em>Validate day one.</em>
              </MaskText>
            </h2>
            <ParagraphReveal>
              Founders sell software tools, boilerplates, hardware prototypes,
              and design kits. Interested buyers send a direct inquiry without
              bloated escrow barriers.
            </ParagraphReveal>
            <Link href="/marketplace" className="text-link text-link--light">
              Browse marketplace products <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="marketplace-list">
            {[
              {
                type: "SOFTWARE",
                title: "Production SaaS Starter & Auth",
                note: "Send inquiry",
              },
              {
                type: "HARDWARE",
                title: "IoT Sensor Prototype CAD & Code",
                note: "Send inquiry",
              },
              {
                type: "BOILERPLATE",
                title: "Next.js + AI Agent Engine",
                note: "Send inquiry",
              },
            ].map((item, index) => (
              <Link
                href="/marketplace"
                className="market-item"
                key={item.title}
              >
                <span className="market-item__index">0{index + 1}</span>
                <span className="market-item__type">{item.type}</span>
                <strong>{item.title}</strong>
                <span className="market-item__price font-mono text-xs">
                  I&apos;m interested →
                </span>
                <ArrowUpRight size={19} />
              </Link>
            ))}
          </div>
        </div>
        <MarqueeTicker
          items={[
            "VALIDATE BEFORE FUNDING",
            "DIRECT BUYER INQUIRIES",
            "SOFTWARE & HARDWARE",
            "FOUNDER FIRST ECONOMY",
          ]}
          reverse
        />
      </section>

      {/* 6. COMING SOON ROW */}
      <section className="process-section page-padding" id="coming-soon">
        <div className="section-heading-row">
          <SectionLabel index="05">Roadmap</SectionLabel>
          <span className="section-caption">
            What we are assembling
            <br />
            next for builders.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-8 rounded-3xl border border-line bg-card/60 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-red bg-red/10 px-2.5 py-1 rounded-full">
                  COMING SOON
                </span>
                <Users className="w-5 h-5 text-paper-dim" />
              </div>
              <h3 className="text-2xl font-bold font-display uppercase tracking-tight text-paper mb-3">
                Operator Mentors
              </h3>
              <p className="text-sm text-paper-dim leading-relaxed">
                Connect directly with founders who scaled past \$1M ARR for
                unvarnished slide-by-slide feedback on your draft.
              </p>
            </div>
            <div className="pt-6 border-t border-line/60 mt-6 text-xs text-smoke font-mono">
              Q3 2026 ROLLOUT
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-line bg-card/60 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-red bg-red/10 px-2.5 py-1 rounded-full">
                  COMING SOON
                </span>
                <MessageSquare className="w-5 h-5 text-paper-dim" />
              </div>
              <h3 className="text-2xl font-bold font-display uppercase tracking-tight text-paper mb-3">
                Investor-Founder Chat
              </h3>
              <p className="text-sm text-paper-dim leading-relaxed">
                Direct, async messaging between verified investors and founders
                with end-to-end audit trails and mutual NDAs.
              </p>
            </div>
            <div className="pt-6 border-t border-line/60 mt-6 text-xs text-smoke font-mono">
              PRIVATE BETA
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-line bg-card/60 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-red bg-red/10 px-2.5 py-1 rounded-full">
                  COMING SOON
                </span>
                <Newspaper className="w-5 h-5 text-paper-dim" />
              </div>
              <h3 className="text-2xl font-bold font-display uppercase tracking-tight text-paper mb-3">
                News & Showcase
              </h3>
              <p className="text-sm text-paper-dim leading-relaxed">
                Editorial deep dives, weekly demo-days, and product spotlights
                amplified across our global builder network.
              </p>
            </div>
            <div className="pt-6 border-t border-line/60 mt-6 text-xs text-smoke font-mono">
              CURATED FEED
            </div>
          </div>
        </div>
      </section>

      {/* 7. FLOATING SECTION TRACKER */}
      <div className="section-tracker" aria-label="Page section tracker">
        <span className="section-tracker__caption">CURRENTLY</span>
        <div className="section-tracker__items">
          {SECTION_TRACKER_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? "is-active" : ""}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              <span className="section-tracker__dot" />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
        <span className="section-tracker__counter">
          {SECTION_TRACKER_ITEMS.findIndex((item) => item.id === activeSection) +
            1}{" "}
          / {String(SECTION_TRACKER_ITEMS.length).padStart(2, "0")}
        </span>
      </div>
    </>
  );
}
