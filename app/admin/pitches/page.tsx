"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  Search,
  ArrowRight,
  Loader2,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

interface Pitch {
  id: string;
  title: string;
  tagline: string;
  logo_url: string;
  company_stage: string;
  industry: string;
  status: string;
  created_at: string;
  users: {
    full_name: string;
    email: string;
  } | null;
}

export default function PitchesQueue() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "live" | "rejected" | "draft">("pending");

  const fetchPitches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pitches")
        .select(`
          id,
          title,
          tagline,
          logo_url,
          company_stage,
          industry,
          status,
          created_at,
          users:founder_id (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading pitches:", error);
      } else {
        setPitches((data as any) || []);
      }
    } catch (err) {
      console.error("Error in fetchPitches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPitches();
  }, []);

  const filteredPitches = pitches
    .filter((p) => p.status === activeTab)
    .filter(
      (p) =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tagline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock size={12} /> Pending Review
          </span>
        );
      case "live":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle size={12} /> Live
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-500/10 text-[var(--text2)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333]">
            <FileText size={12} /> Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">Pitch deck review queue</h2>
          <p className="text-sm text-[var(--text2)] mt-1">
            Moderate new startup pitches before publishing them to the public discover feed.
          </p>
        </div>
        <button
          onClick={fetchPitches}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--bg2)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] text-xs font-semibold text-[var(--text)] rounded-lg hover:bg-[var(--bg2)] transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Tabs and search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-[var(--card-bg)] p-1 border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] w-full md:w-auto">
          {(["pending", "live", "rejected", "draft"] as const).map((tab) => {
            const count = pitches.filter((p) => p.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize flex items-center gap-2 ${
                  activeTab === tab
                    ? "bg-violet-600 text-[var(--text)] shadow-lg shadow-violet-600/10"
                    : "text-[var(--text2)] hover:text-[var(--text)]"
                }`}
              >
                {tab}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    activeTab === tab
                      ? "bg-violet-500 text-violet-100"
                      : "bg-[var(--bg2)] text-[var(--text2)]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text3)] h-4 w-4" />
          <input
            type="text"
            placeholder="Search by company, founder, industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--card-bg)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] text-sm text-[var(--text)] placeholder-[#888888] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
        </div>
      </div>

      {/* Main content grid/table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
      ) : filteredPitches.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-[var(--bg2)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] flex items-center justify-center text-[var(--text3)] mx-auto mb-4">
            <FileText size={20} />
          </div>
          <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">No pitches found</h3>
          <p className="text-xs text-[var(--text2)] mt-1 max-w-sm mx-auto">
            There are no pitches matching the filter criteria or search query in this tab.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[0.5px] border-[#e5e5e5] dark:border-[#333333] bg-[var(--bg2)]/10 text-[var(--text2)] font-mono text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-4 px-6">Company / Startup</th>
                  <th className="py-4 px-6">Founder</th>
                  <th className="py-4 px-6">Stage & Industry</th>
                  <th className="py-4 px-6">Date Submitted</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-y divide-[#e5e5e5] dark:divide-[#333333]">
                {filteredPitches.map((pitch) => (
                  <tr key={pitch.id} className="hover:hover:bg-[var(--bg2)] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-[24px] bg-[var(--bg2)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] flex items-center justify-center text-[var(--text2)] font-bold overflow-hidden">
                          {pitch.logo_url ? (
                            <img src={pitch.logo_url} alt={pitch.title} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 size={18} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-[var(--text)] group-hover:text-violet-400 transition-colors text-sm">
                            {pitch.title || "Untitled Startup"}
                          </h4>
                          <p className="text-xs text-[var(--text2)] truncate max-w-xs mt-0.5">
                            {pitch.tagline || "No tagline provided."}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {pitch.users ? (
                        <div>
                          <p className="text-sm font-semibold text-[var(--text)]">
                            {pitch.users.full_name || "Unknown Founder"}
                          </p>
                          <p className="text-xs text-[var(--text3)] font-mono">
                            {pitch.users.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text3)] italic">No founder associated</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="inline-block text-[11px] font-bold text-[var(--text2)] bg-[var(--bg2)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] px-2 py-0.5 rounded capitalize">
                          {pitch.company_stage || "N/A"}
                        </span>
                        <p className="text-xs text-[var(--text2)] mt-1">
                          {pitch.industry || "General"}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-[var(--text2)] font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[var(--text3)]" />
                        {new Date(pitch.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(pitch.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/pitches/${pitch.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--bg2)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] text-xs font-semibold text-[var(--text)] rounded-lg hover:bg-[var(--bg2)] transition-colors group/btn"
                      >
                        Review
                        <ArrowRight size={12} className="text-[var(--text2)] group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}