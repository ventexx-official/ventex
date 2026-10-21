"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, ArrowDownRight, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SITE_NAME } from "@/lib/brand";

const STAGES = [
  { value: "All", label: "All Stages" },
  { value: "idea", label: "Idea" },
  { value: "prototype", label: "Prototype" },
  { value: "mvp", label: "MVP" },
  { value: "early_revenue", label: "Early Revenue" },
  { value: "growth", label: "Growth" },
];

const INDUSTRIES = [
  "All",
  "Fintech",
  "AI/ML",
  "SaaS",
  "Healthtech",
  "E-commerce",
  "Cleantech",
  "Logistics",
  "Cybersecurity",
];

function formatCurrency(amount?: number | null) {
  if (!amount) return "Undisclosed";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function DiscoverPage() {
  const brandName = SITE_NAME.toUpperCase();
  const [pitches, setPitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [raisingOnly, setRaisingOnly] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      // Clean query using valid schema columns:
      // In Supabase schema v3: 'stage' (not 'company_stage'), no 'round_closes_at', no 'short_description'
      const { data, error: fetchError } = await supabase
        .from("pitches")
        .select(`
          id,
          title,
          tagline,
          industry,
          stage,
          problem,
          solution,
          is_raising,
          amount_seeking,
          currency,
          city,
          country,
          current_version,
          published_at,
          created_at,
          founder:founder_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq("status", "live")
        .order("published_at", { ascending: false });

      if (fetchError) {
        console.error("[Discover] pitch fetch failed:", fetchError);
        setError("Unable to load the startup index right now. Please try again.");
      } else {
        setPitches(data || []);
      }

      setLoading(false);
    };

    load();
  }, [sortBy]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pitches.filter((pitch) => {
      const queryMatch =
        !q ||
        [pitch.title, pitch.tagline, pitch.problem, pitch.solution, pitch.industry, pitch.city, pitch.country]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const industryMatch = selectedIndustry === "All" || pitch.industry === selectedIndustry;
      const stageMatch = selectedStage === "All" || pitch.stage === selectedStage;
      const raisingMatch = !raisingOnly || pitch.is_raising;

      return queryMatch && industryMatch && stageMatch && raisingMatch;
    });
  }, [pitches, query, selectedIndustry, selectedStage, raisingOnly]);

  return (
    <div className="inner-page min-h-screen">
      {/* INNER HERO SECTION (FAITHFUL TO REFERENCE DESIGN) */}
      <section className="inner-hero page-padding">
        <div className="inner-hero__meta">
          <span className="status-dot" /> THE DISCOVERY INDEX{" "}
          <span>/ {brandName} / 2026</span>
        </div>
        <h1>
          Find the
          <br />
          <em>signal.</em>
        </h1>
        <p>
          A live index of published pitches, where each version stays visible so founders can show how the idea and the ask have developed.
        </p>
        <div className="inner-hero__line" aria-hidden="true">
          <span>SCROLL TO EXPLORE</span>
          <span />
        </div>
      </section>

      {/* DISCOVER NETWORK SECTION */}
      <section className="inner-section page-padding">
        <div className="inner-section__head">
          <span>01 / THE NETWORK</span>
          <p>
            Discover shows published, versioned pitches so you can compare how a company has developed instead of reading a single frozen profile.
          </p>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="mt-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* SEARCH */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--smoke)]" />
              <input
                type="text"
                placeholder="Search pitches, problem, sector..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[var(--card)] border border-[var(--line)] rounded-full text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:border-[var(--red)] transition-all"
              />
            </div>

            {/* QUICK STATS & SORT */}
            <div className="flex items-center justify-between md:justify-end gap-4">
              <span className="text-xs font-mono text-[var(--paper-dim)]">
                {filtered.length} {filtered.length === 1 ? "pitch" : "pitches"} found
              </span>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--paper-dim)]">
                <span className="text-[10px] uppercase tracking-widest text-[var(--smoke)]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[var(--card)] border border-[var(--line)] rounded-full px-3 py-1 text-xs font-mono text-[var(--paper)] focus:outline-none cursor-pointer"
                >
                  <option value="recent">Recent</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>
          </div>

          {/* FILTER PILLS */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--line)]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--smoke)] mr-2">Sector:</span>
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  selectedIndustry === ind
                    ? "bg-[var(--paper)] text-[var(--ink)] font-bold shadow-sm"
                    : "text-[var(--paper-dim)] hover:text-[var(--paper)] border border-[var(--line)] hover:border-[var(--border2)]"
                }`}
              >
                {ind}
              </button>
            ))}

            <div className="h-4 w-px bg-[var(--line)] mx-1 hidden md:block" />

            <button
              onClick={() => setRaisingOnly(!raisingOnly)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                raisingOnly
                  ? "bg-[var(--red)] text-[var(--paper)] font-bold"
                  : "text-[var(--paper-dim)] hover:text-[var(--paper)] border border-[var(--line)] hover:border-[var(--border2)]"
              }`}
            >
              <Tag className="w-3 h-3" />
              Raising only
            </button>
          </div>
        </div>

        {/* LIST / CARDS */}
        <div className="mt-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-[var(--paper-dim)]">
              <div className="w-8 h-8 border-2 border-[var(--line)] border-t-[var(--red)] rounded-full animate-spin" />
              <span className="text-xs font-mono uppercase tracking-widest">Loading verified pitches...</span>
            </div>
          ) : error ? (
            <div className="border border-[var(--line)] rounded-3xl p-12 text-center bg-[var(--card)] mt-8">
              <div className="text-xs font-mono uppercase tracking-widest text-[var(--red)] mb-2">{'//'} INDEX TEMPORARILY UNAVAILABLE</div>
              <p className="text-sm font-mono text-[var(--paper-dim)] max-w-md mx-auto mb-6">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--paper)] text-[var(--ink)] font-bold text-xs uppercase tracking-wider hover:bg-[#fffaf0] transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-[var(--line)] rounded-3xl p-12 md:p-16 text-center bg-[var(--card)] mt-8">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--smoke)] mb-2 block">{'//'} INDEX PREVIEW</span>
              <h3 className="font-display text-2xl md:text-3xl uppercase tracking-tight text-[var(--paper)] mb-2 font-medium">
                {pitches.length === 0 ? "First cohort pitches opening soon" : "No matching startups found"}
              </h3>
              <p className="text-xs md:text-sm font-mono text-[var(--paper-dim)] max-w-md mx-auto mb-8">
                {pitches.length === 0
                  ? "Verified founder pitches will appear here as the inaugural publishing cohort goes live. Claim your presence early."
                  : "Try clearing your filters or searching for another term."}
              </p>
              <Link
                href="/founder/create-pitch"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--red)] text-[var(--paper)] font-bold text-xs uppercase tracking-wider hover:bg-[#ed594d] transition-all cursor-pointer"
              >
                Submit your pitch <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="discover-list">
              {filtered.map((pitch, index) => (
                <Link
                  href={`/pitch/${pitch.id}`}
                  className="discover-row block group text-inherit cursor-pointer"
                  key={pitch.id}
                >
                  <span>0{index + 1}</span>
                  <h2>{pitch.title}</h2>
                  <div className="max-w-md">
                    <p className="text-xs font-mono text-[var(--paper-dim)] line-clamp-2">
                      {pitch.tagline || pitch.problem || "No description provided."}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-[var(--smoke)] uppercase">
                      {pitch.industry && <span>{pitch.industry}</span>}
                      {pitch.stage && <span>• {pitch.stage}</span>}
                      {pitch.is_raising && (
                        <span className="text-[var(--red)] font-bold">
                          • Seeking {formatCurrency(pitch.amount_seeking)}
                        </span>
                      )}
                      <span>• v{pitch.current_version || 1}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--red)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* INNER FEATURE SECTION MATCHING REFERENCE */}
      <section className="inner-feature page-padding">
        <div>
          <span className="inner-kicker">THE PITCH INDEX / LIVE</span>
          <h2>
            Browse what
            <br />
            <em>is published.</em>
          </h2>
        </div>
        <div className="feature-note">
          <p>
            Filter published, versioned pitches by the context you need, then open a pitch to review its history.
          </p>
          <Link href="/founder/create-pitch" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--red)] font-bold mt-4">
            Publish your pitch <ArrowDownRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
