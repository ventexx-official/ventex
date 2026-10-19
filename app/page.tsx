"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Play,
  Plus,
  Minus,
  Menu,
  X,
  Send,
  Sparkles,
  Search,
  ChevronRight,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

/* --- MICRO-ANIMATION & UI UTILITY COMPONENTS --- */

interface UseIntersectionOptions {
  once?: boolean;
  threshold?: number;
}

function useIntersection(options: UseIntersectionOptions = {}) {
  const ref = useRef<HTMLSpanElement | HTMLParagraphElement | HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        if (options.once !== false) observer.disconnect();
      } else if (options.once === false) {
        setVisible(false);
      }
    }, { threshold: 0.16, ...options });

    observer.observe(el);
    return () => observer.disconnect();
  }, [options, options.once, options.threshold]);

  return { ref, visible };
}

function MaskText({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useIntersection();
  return (
    <span ref={ref as any} className={`mask-text ${className}`}>
      <span className={`mask-text__inner ${visible ? "is-visible" : ""}`} style={{ ["--delay" as any]: `${delay}ms` }}>
        {children}
      </span>
    </span>
  );
}

function InteractiveLetters({ text }: { text: string }) {
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;

    const letters = Array.from(el.querySelectorAll(".interactive-letter")) as HTMLElement[];
    const pointer = { x: 0, y: 0 };
    let rafId = 0;
    let pending = false;

    const update = () => {
      pending = false;
      letters.forEach(letter => {
        const rect = letter.getBoundingClientRect();
        const dist = Math.hypot(pointer.x - (rect.left + rect.width / 2), pointer.y - (rect.top + rect.height / 2));
        const progress = Math.max(0, Math.min(1, 1 - dist / 145));
        letter.style.setProperty("--letter-progress", progress.toFixed(3));
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!pending) {
        pending = true;
        rafId = requestAnimationFrame(update);
      }
    };

    const handlePointerLeave = () => {
      letters.forEach(letter => letter.style.setProperty("--letter-progress", "0"));
    };

    el.addEventListener("pointermove", handlePointerMove, { passive: true });
    el.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <span ref={containerRef} className="interactive-letters" aria-label={text}>
      {Array.from(text).map((char, i) => (
        <span key={`${char}-${i}`} className="interactive-letter" aria-hidden="true">
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

function ParagraphReveal({ children }: { children: React.ReactNode }) {
  const { ref, visible } = useIntersection();
  return (
    <p ref={ref as any} className={`paragraph-reveal ${visible ? "is-visible" : ""}`}>
      {children}
    </p>
  );
}

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const { ref, visible } = useIntersection();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const startTime = performance.now();
    const duration = 1500;
    let rafId = 0;

    const animate = (now: number) => {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - elapsed, 3);
      setCount(Math.round(value * ease));
      if (elapsed < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value, visible]);

  return (
    <span ref={ref as any} className="count-up">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function MagneticButton({ children, variant = "light", className = "", onClick, href }: { children: React.ReactNode; variant?: "light" | "crimson" | "dark"; className?: string; onClick?: () => void; href?: string }) {
  const btnRef = useRef<any>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    const el = btnRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.08;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.08;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const handlePointerLeave = () => {
    if (btnRef.current) {
      btnRef.current.style.transform = "translate3d(0, 0, 0)";
    }
  };

  const props = {
    ref: btnRef,
    className: `magnetic-button magnetic-button--${variant} ${className}`,
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
    onClick
  };

  if (href) {
    return <a {...props} href={href}>{children}</a>;
  }
  return <button {...props}>{children}</button>;
}

function CursorAtmosphere() {
  const ref = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 0.5, y: 0.25 });
  const current = useRef({ x: 0.5, y: 0.25 });

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;

    let rafId = 0;
    const handlePointerMove = (e: PointerEvent) => {
      target.current.x = e.clientX / window.innerWidth;
      target.current.y = e.clientY / window.innerHeight;
    };

    const update = () => {
      current.current.x += (target.current.x - current.current.x) * 0.035;
      current.current.y += (target.current.y - current.current.y) * 0.035;
      el.style.setProperty("--pointer-x", `${current.current.x * 100}%`);
      el.style.setProperty("--pointer-y", `${current.current.y * 100}%`);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return <div ref={ref} className="cursor-atmosphere" aria-hidden="true" />;
}

function CursorFollower() {
  const ref = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: -80, y: -80 });
  const current = useRef({ x: -80, y: -80 });
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;

    let rafId = 0;
    let initialized = false;

    const handlePointerMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!initialized) {
        current.current.x = e.clientX;
        current.current.y = e.clientY;
        initialized = true;
        el.classList.add("is-visible");
      }
      const hoverable = (e.target as HTMLElement).closest("a, button, input");
      el.classList.toggle("is-hovering", !!hoverable);
      if (labelRef.current) {
        labelRef.current.textContent = hoverable ? "OPEN" : "EXPLORE";
      }
    };

    const handleMouseLeave = () => {
      initialized = false;
      el.classList.remove("is-visible");
    };

    const update = () => {
      current.current.x += (target.current.x - current.current.x) * 0.12;
      current.current.y += (target.current.y - current.current.y) * 0.12;
      el.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={ref} className="cursor-follower" aria-hidden="true">
      <span className="cursor-follower__ring" />
      <span className="cursor-follower__dot" />
      <span ref={labelRef} className="cursor-follower__label">EXPLORE</span>
    </div>
  );
}

function ScrollProgress() {
  useEffect(() => {
    let rafId = 0;
    let scheduled = false;

    const update = () => {
      const scrollHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(window.scrollY / scrollHeight, 1);
      document.documentElement.style.setProperty("--scroll-progress", `${progress}`);

      const hero = document.querySelector(".hero-section") as HTMLElement;
      if (hero) {
        const heroProgress = Math.min(window.scrollY / Math.max(hero.offsetHeight, 1), 1);
        hero.style.setProperty("--hero-scroll", `${heroProgress}`);
      }
      scheduled = false;
    };

    const onScroll = () => {
      if (!scheduled) {
        scheduled = true;
        rafId = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span />
    </div>
  );
}

function MarqueeTicker({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className={`marquee ${reverse ? "marquee--reverse" : ""}`} aria-label={items.join(", ")}>
      <div className="marquee__track">
        {doubled.map((item, idx) => (
          <span key={`${item}-${idx}`} className="marquee__item">
            {item} <i aria-hidden="true">✳</i>
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
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
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <span>00:00:00 IST</span>;

  return (
    <span>
      {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })} IST
    </span>
  );
}

/* --- MAIN LANDING DATA --- */

const ECOSYSTEM_STEPS = [
  {
    number: "01",
    title: "Discover",
    copy: "Browse published, versioned pitches from founders and teams, then open the ones worth understanding in more depth.",
    tag: "Browse published pitches"
  },
  {
    number: "02",
    title: "Pitch",
    copy: "Draft a pitch, revise it through versions, and optionally ask an AI mentor to review the story before you publish it.",
    tag: "Draft, revise, review"
  },
  {
    number: "03",
    title: "Connect",
    copy: "Investors can message founders directly in-platform to discuss the opportunity, terms, and whether there is a fit.",
    tag: "Direct founder messages"
  },
  {
    number: "04",
    title: "Market",
    copy: "Sell software, equity opportunities, custom work, or physical products directly to buyers through the platform.",
    tag: "Sell directly on Folenzo"
  }
];

const STARTUP_CARDS = [
  {
    name: "Pitch listings opening soon",
    category: "FOUNDER EARLY ACCESS",
    description: "Real founder pitches will appear here as the first publishing cohort comes online.",
    className: "startup-card--blue",
    mark: "P",
    founder: "Join the first cohort"
  },
  {
    name: "Founder profiles opening soon",
    category: "PEOPLE / EARLY ACCESS",
    description: "Founders will be able to share their context, progress, and latest pitch version here.",
    className: "startup-card--sand",
    mark: "F",
    founder: "Early access available"
  },
  {
    name: "Be one of the first",
    category: "PLATFORM PREVIEW",
    description: "The network is still forming. Apply early to help shape what gets published and discovered.",
    className: "startup-card--plum",
    mark: "→",
    founder: "Apply for early access"
  }
];

const MARKETPLACE_ITEMS = [
  { type: "SOFTWARE", title: "Marketplace opening soon", price: "join waitlist", color: "market-item--lime" },
  { type: "EQUITY", title: "Opportunities opening soon", price: "join waitlist", color: "market-item--red" },
  { type: "CUSTOM WORK", title: "List your offering", price: "apply early", color: "market-item--cream" }
];

const NAV_PAGES = [
  { id: "top", label: "Home", index: "00", href: "/" },
  { id: "discover", label: "Discover", index: "01", href: "/discover" },
  { id: "marketplace", label: "Marketplace", index: "02", href: "/marketplace" }
];

const SECTION_TRACKER_ITEMS = [
  { id: "top", label: "Hero", index: "00" },
  { id: "story", label: "Manifesto", index: "01" },
  { id: "pitch", label: "How it moves", index: "02" },
  { id: "startups", label: "Startups", index: "03" },
  { id: "intelligence", label: "Unfair advantage", index: "04" },
  { id: "marketplace", label: "Useful side", index: "05" }
];

/* --- MAIN FOLENZO PAGE COMPONENT --- */

export default function FolenzoHome() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const [expandedEcosystem, setExpandedEcosystem] = useState(0);

  // Pitch Mentor AI State
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedChip, setSelectedChip] = useState("Find my wedge");
  const [aiResponse, setAiResponse] = useState(
    "Lead with the customer problem, then make the ask specific: what are you raising, why now, and what milestone will that capital unlock?"
  );

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 28);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const elements = SECTION_TRACKER_ITEMS.map(item => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    if (!elements.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      const intersecting = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (intersecting) {
        setActiveSection(intersecting.target.id);
      }
    }, { rootMargin: "-28% 0px -48% 0px", threshold: [0.12, 0.3, 0.6] });

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleChipSelect = (chip: string) => {
    setSelectedChip(chip);
    const answers: Record<string, string> = {
      "Find my wedge": "Name the narrow customer problem your pitch solves, then show why your approach is meaningfully different from the alternatives.",
      "Name my audience": "Start with the people who feel this problem most urgently. A specific buyer profile will make the pitch easier to test and improve.",
      "Sharpen my pitch": "Clarify the ask, the milestone it funds, and the evidence you will bring back. Investors should know exactly what happens next."
    };
    setAiResponse(answers[chip] || `Here's a sharper starting point for "${chip}": make the insight tangible in one small, undeniable proof.`);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;
    setAiResponse(`Regarding "${userPrompt}": separate activity from evidence. Show the customer behavior, the change over time, and the milestone this next pitch version is built to prove.`);
    setUserPrompt("");
  };

  return (
    <div className="site-shell">
      <CursorAtmosphere />
      <CursorFollower />
      <ScrollProgress />

      <div className="grain" aria-hidden="true" />

      {/* SITE NAVIGATION HEADER */}
      <header className={`site-nav ${navScrolled ? "site-nav--scrolled" : ""}`}>
        <a href="#top" className="brand-lockup" aria-label="Folenzo home">
          <span className="brand-mark">
            <span>F</span>
          </span>
          <span>Folenzo</span>
        </a>

        <nav className={`desktop-nav ${mobileNavOpen ? "desktop-nav--open" : ""}`} aria-label="Primary pages">
          {NAV_PAGES.map(page => (
            <Link
              key={page.id}
              href={page.href}
              className={activeSection === page.id ? "nav-page--active" : ""}
              aria-current={activeSection === page.id ? "page" : undefined}
              onClick={() => setMobileNavOpen(false)}
            >
              <span className="nav-page__index">{page.index}</span>
              <span className="nav-page__label">{page.label}</span>
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link href="/login" className="nav-login">Sign in</Link>
          <MagneticButton href="/founder/create-pitch" variant="crimson" className="nav-cta">
            Create pitch <ArrowUpRight size={15} strokeWidth={1.8} />
          </MagneticButton>
          <button
            className="mobile-menu md:hidden text-[#f1efe8] p-2"
            aria-label="Toggle menu"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            {mobileNavOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main id="top">
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-scanline" aria-hidden="true" />
          <div className="hero-assembly" aria-hidden="true">
            <span>FOLENZO / 01</span>
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
                <span className="hero-outline" aria-hidden="true">Shape.</span>
              </span>
              <span className="hero-title__line">
                <MaskText delay={260}>
                  <InteractiveLetters text="Get discovered." />
                </MaskText>
              </span>
            </h1>

            <div className="hero-bottom">
              <ParagraphReveal>
                Folenzo is the living layer between a good idea and the people who can make it matter.
              </ParagraphReveal>
              <div className="hero-actions">
                <MagneticButton href="#discover" variant="light">
                  Explore the ecosystem <ArrowUpRight size={16} />
                </MagneticButton>
                <a href="#story" className="play-link">
                  <span className="play-icon">
                    <Play size={12} fill="currentColor" />
                  </span>
                  See how it works
                </a>
              </div>
            </div>

            <div className="hero-side-note">
              <span>SCROLL TO EXPLORE</span>
              <span className="hero-side-note__line" />
            </div>

            <div className="hero-coordinate">FOLENZO / REMOTE-FIRST NETWORK</div>

            <div className="hero-orbit" aria-hidden="true">
              <span>F</span>
            </div>
          </div>
        </section>

        {/* TICKER MARQUEE */}
        <section className="ticker-section" aria-label="Folenzo ecosystem categories">
          <MarqueeTicker items={["FOLENZO", "FOUNDERS", "STARTUPS", "INVESTORS", "MENTORS", "MARKETPLACE"]} />
        </section>

        {/* MANIFESTO SECTION */}
        <section className="manifesto-section page-padding" id="story">
          <div className="manifesto-meta">
            <SectionLabel index="01">A different kind of platform</SectionLabel>
            <span className="meta-aside">NOT ANOTHER FEED</span>
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
                Folenzo makes those collisions easier to find, easier to trust, and much harder to forget.
              </ParagraphReveal>
              <a href="#discover" className="text-link">
                Meet the ecosystem <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="manifesto-stamp" aria-hidden="true">
              <span>FOLENZO</span>
              <span>EST. 2026</span>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="stats-section page-padding" id="discover">
          <div className="stats-intro">
            <SectionLabel index="02">A platform with pull</SectionLabel>
            <span>Small signals, real momentum.</span>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <CountUp value={120} suffix="+" />
              <span>published pitches</span>
            </div>
            <div className="stat-item">
              <CountUp value={45} suffix="+" />
              <span>marketplace listings</span>
            </div>
            <div className="stat-item">
              <CountUp value={28} />
              <span>cities connected</span>
            </div>
            <div className="stat-item stat-item--accent">
              <span className="stat-arrow">↗</span>
              <span>Built for momentum</span>
            </div>
          </div>
        </section>

        {/* ECOSYSTEM / HOW IT MOVES SECTION */}
        <section className="ecosystem-section page-padding" id="pitch">
          <div className="section-heading-row">
            <SectionLabel index="03">How it moves</SectionLabel>
            <span className="section-caption">From first thought to momentum.</span>
          </div>

          <div className="ecosystem-list">
            {ECOSYSTEM_STEPS.map((step, idx) => {
              const isExpanded = expandedEcosystem === idx;
              return (
                <button
                  key={step.number}
                  className={`ecosystem-row ${isExpanded ? "is-active" : ""}`}
                  onClick={() => setExpandedEcosystem(isExpanded ? -1 : idx)}
                  aria-expanded={isExpanded}
                >
                  <span className="ecosystem-row__number">{step.number}</span>
                  <span className="ecosystem-row__title">{step.title}</span>
                  <span className="ecosystem-row__copy">{step.copy}</span>
                  <span className="ecosystem-row__tag">{step.tag}</span>
                  <span className="ecosystem-row__icon">
                    {isExpanded ? <Minus size={19} /> : <Plus size={19} />}
                  </span>
                  <span className="ecosystem-row__mobile-copy">{step.copy}</span>
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
                  Startups with <em>something to say.</em>
                </MaskText>
              </h2>
            </div>
            <Link href="/discover" className="circle-link" aria-label="Explore all startups">
              <ArrowUpRight size={22} />
            </Link>
          </div>

          <div className="startup-grid">
            {STARTUP_CARDS.map((card, idx) => (
              <article
                key={card.name}
                className={`startup-card ${card.className}`}
                style={{ ["--card-delay" as any]: `${idx * 100}ms` }}
              >
                <div className="startup-card__visual">
                  <span className="startup-card__mark">{card.mark}</span>
                  <span className="startup-card__year">N° 0{idx + 1}</span>
                  <span className="startup-card__orbit" />
                </div>
                <div className="startup-card__info">
                  <div>
                    <span className="startup-card__category">{card.category}</span>
                    <h3>{card.name}</h3>
                  </div>
                  <ArrowUpRight size={20} className="startup-card__arrow" />
                </div>
                <div className="startup-card__details">
                  <p>{card.description}</p>
                  <span>Founder / {card.founder}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="startups-footer">
            <span>THE PEOPLE BEHIND THE PROGRESS</span>
            <Link href="/discover" className="text-link">
              View all profiles <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        {/* FOLENZO AI / PITCH MENTOR SECTION */}
        <section className="assistant-section page-padding" id="intelligence">
          <div className="assistant-beam" aria-hidden="true" />
          <div className="assistant-header">
            <SectionLabel index="05">Your unfair advantage</SectionLabel>
            <span className="assistant-status">
              <span className="status-dot status-dot--dark" /> FOLENZO AI / ONLINE
            </span>
          </div>

          <div className="assistant-layout">
            <div className="assistant-intro">
              <h2 className="display-heading display-heading--large">
                <MaskText>
                  Make the <span className="red-text">next move.</span>
                </MaskText>
              </h2>
              <ParagraphReveal>
                A thinking partner for the messy middle — when your idea is real, but the words, wedge, and way forward are not clear yet.
              </ParagraphReveal>

              <div className="assistant-chips">
                {["Find my wedge", "Name my audience", "Sharpen my pitch"].map(chip => (
                  <button
                    key={chip}
                    className={selectedChip === chip ? "is-selected" : ""}
                    onClick={() => handleChipSelect(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="assistant-panel">
              <div className="assistant-panel__top">
                <div>
                  <span className="tiny-label">WORKSPACE / 01</span>
                  <span className="assistant-context">Pitch review / version 03</span>
                </div>
              </div>

              <div className="assistant-panel__conversation">
                <div className="assistant-message assistant-message--user">
                  Can you help me clarify the ask in my seed pitch and show what this round unlocks?
                </div>
                <div className="assistant-message assistant-message--ai">
                  <span className="ai-avatar">F</span>
                  <div>
                    <span className="tiny-label">FOLENZO AI / PITCH MENTOR</span>
                    <p>{aiResponse}</p>
                  </div>
                </div>
              </div>

              <form className="assistant-input" onSubmit={handlePromptSubmit}>
                <input
                  value={userPrompt}
                  onChange={e => setUserPrompt(e.target.value)}
                  placeholder="Ask a sharper question..."
                  aria-label="Ask Folenzo AI"
                />
                <button type="submit" aria-label="Send question">
                  <ArrowUpRight size={18} />
                </button>
              </form>

              <div className="assistant-panel__footer">
                <span>
                  <span className="pulse-dot" /> Reviewing your pitch
                </span>
                <span>Private workspace</span>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS LOOP SECTION */}
        <section className="process-section page-padding" id="process">
          <div className="section-heading-row">
            <SectionLabel index="06">The Folenzo loop</SectionLabel>
            <span className="section-caption">Good things compound.</span>
          </div>

          <div className="process-grid">
            {["Create", "Pitch", "Connect", "Grow"].map((stepTitle, idx) => (
              <div key={stepTitle} className={`process-item ${idx === 0 ? "process-item--active" : ""}`}>
                <span className="process-item__number">0{idx + 1}</span>
                <div className="process-item__line">
                  <span />
                </div>
                <h3>{stepTitle}</h3>
                <p>
                  {[
                    "Make the idea tangible.",
                    "Give it a point of view.",
                    "Find the right people.",
                    "Keep the momentum alive."
                  ][idx]}
                </p>
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
                  Things worth <em>putting to work.</em>
                </MaskText>
              </h2>
              <ParagraphReveal>
                Founder-built tools, considered software, and small digital products with a big point of view.
              </ParagraphReveal>
              <Link href="/marketplace" className="text-link text-link--light">
                Enter the marketplace <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="marketplace-list">
              {MARKETPLACE_ITEMS.map((item, idx) => (
                <Link key={item.title} href="/marketplace" className={`market-item ${item.color}`}>
                  <span className="market-item__index">0{idx + 1}</span>
                  <span className="market-item__type">{item.type}</span>
                  <strong>{item.title}</strong>
                  <span className="market-item__price">{item.price}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* SITE FOOTER */}
      <footer className="site-footer page-padding" id="footer">
        <div className="footer-top">
          <span className="footer-kicker">THE NEXT CHAPTER IS OPEN</span>
          <span className="footer-coordinate">FOLENZO / REMOTE-FIRST NETWORK</span>
        </div>

        <h2 className="footer-title">
          <MaskText>
            Build something <em>worth discovering.</em>
          </MaskText>
        </h2>

        <div className="footer-cta">
          <ParagraphReveal>
            Bring the rough idea. Leave with a clearer next move.
          </ParagraphReveal>
          <MagneticButton href="/founder/create-pitch" variant="crimson">
            Start your pitch <ArrowUpRight size={16} />
          </MagneticButton>
        </div>

        <div className="footer-bottom">
          <a href="#top" className="brand-lockup">
            <span className="brand-mark">
              <span>F</span>
            </span>
            <span>Folenzo</span>
          </a>

          <div className="footer-links">
            <div>
              <span>Explore</span>
              <Link href="/discover">Discover</Link>
              <Link href="/marketplace">Marketplace</Link>
            </div>
            <div>
              <span>Company</span>
              <a href="#story">About</a>
              <a href="#process">Process</a>
              <a href="#top">Contact</a>
            </div>
            <div>
              <span>Follow</span>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer">X / Twitter</a>
            </div>
          </div>
        </div>

        <div className="footer-legal">
          <span>© 2026 Folenzo. For people building what’s next.</span>
          <span>
            Privacy <i>·</i> Terms <i>·</i> Made with intent
          </span>
        </div>
      </footer>

      {/* FLOATING SECTION TRACKER */}
      <div className="section-tracker" aria-label="Page section tracker">
        <span className="section-tracker__caption">CURRENTLY</span>
        <div className="section-tracker__items">
          {SECTION_TRACKER_ITEMS.map(item => (
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
          {SECTION_TRACKER_ITEMS.findIndex(item => item.id === activeSection) + 1} /{" "}
          {String(SECTION_TRACKER_ITEMS.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}