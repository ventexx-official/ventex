"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Flag,
  Loader2,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  User,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface FlaggedAttempt {
  id: string;
  user_id: string;
  content_type: string;
  raw_content: string;
  detected_patterns: string[];
  status: string;
  created_at: string;
  users: { full_name: string } | null;
}

type StatusFilter = "all" | "pending" | "dismissed" | "escalated";

export default function AdminFlagged() {
  const [items, setItems] = useState<FlaggedAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("flagged_attempts")
        .select(`
          id, user_id, content_type, raw_content,
          detected_patterns, status, created_at,
          users:user_id ( full_name )
        `)
        .order("created_at", { ascending: false });

      if (error) console.error("Error loading flagged attempts:", error);
      else setItems((data as any) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setActionLoadingId(id);
      const { error } = await supabase
        .from("flagged_attempts")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = items.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch =
      item.raw_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.detected_patterns?.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    escalated: items.filter((i) => i.status === "escalated").length,
    dismissed: items.filter((i) => i.status === "dismissed").length,
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, { cls: string; icon: React.ReactNode }> = {
      pending: {
        cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: <Clock size={10} />,
      },
      escalated: {
        cls: "bg-red-500/10 text-red-400 border-red-500/20",
        icon: <TrendingUp size={10} />,
      },
      dismissed: {
        cls: "bg-neutral-500/10 text-neutral-500 border-neutral-700",
        icon: <CheckCircle size={10} />,
      },
    };
    const s = styles[status] || styles.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${s.cls}`}>
        {s.icon} {status}
      </span>
    );
  };

  const contentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      qa_question: "Q&A Response",
      project_requirements: "Project Requirements",
      deal_room_message: "Deal Room Message",
      comment: "Pitch Comment",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Flagged Activity Log</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Monitor auto-detected off-platform solicitation attempts and high-risk content patterns.
          </p>
        </div>
        <button
          onClick={fetchItems}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 border border-neutral-800 text-xs font-semibold text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Flags", val: counts.all, color: "text-white" },
          { label: "Pending Review", val: counts.pending, color: "text-amber-400" },
          { label: "Escalated", val: counts.escalated, color: "text-red-400" },
          { label: "Dismissed", val: counts.dismissed, color: "text-neutral-400" },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-[#0F0F13] border border-neutral-900 rounded-xl p-4 text-center">
            <p className={`text-2xl font-black font-mono ${color}`}>{val}</p>
            <p className="text-[11px] text-neutral-500 mt-1 uppercase tracking-wider font-bold">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by content, user, pattern..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0F0F13] border border-neutral-900 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
        </div>
        <div className="flex bg-[#0F0F13] p-1 border border-neutral-900 rounded-xl">
          {(["all", "pending", "escalated", "dismissed"] as StatusFilter[]).map((s) => {
            const labels: Record<string, string> = {
              all: "All",
              pending: "Pending",
              escalated: "Escalated",
              dismissed: "Dismissed",
            };
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === s ? "bg-violet-600 text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                {labels[s]}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] ${statusFilter === s ? "bg-violet-500 text-violet-100" : "bg-neutral-800 text-neutral-500"}`}>
                  {counts[s]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0F0F13] border border-neutral-900 rounded-2xl p-12 text-center">
          <Flag className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No flagged items</h3>
          <p className="text-xs text-neutral-500 mt-1">No activity logs match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isLoading = actionLoadingId === item.id;
            const isExpanded = expandedId === item.id;
            const isPending = item.status === "pending";
            const isEscalated = item.status === "escalated";

            return (
              <div
                key={item.id}
                className={`bg-[#0F0F13] border rounded-2xl overflow-hidden transition-all ${
                  isEscalated
                    ? "border-red-900/40"
                    : isPending
                    ? "border-amber-900/30"
                    : "border-neutral-900"
                }`}
              >
                {/* Summary Row */}
                <div
                  className="p-5 cursor-pointer hover:bg-neutral-900/10 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {statusBadge(item.status)}
                        <span className="text-[10px] font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded uppercase tracking-wider">
                          {contentTypeLabel(item.content_type)}
                        </span>
                      </div>

                      {/* Content preview */}
                      <p className="text-sm text-neutral-200 leading-snug line-clamp-2">
                        {item.raw_content || "No content captured."}
                      </p>

                      {/* Detected patterns */}
                      {item.detected_patterns && item.detected_patterns.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.detected_patterns.map((pattern, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/20 text-red-400 border border-red-900/30"
                            >
                              <AlertTriangle size={9} />
                              {pattern}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-500">
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {item.users?.full_name || "Unknown User"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions Ã¢â‚¬â€ only for pending/escalated */}
                    {(isPending || isEscalated) && (
                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {isPending && (
                          <button
                            onClick={() => updateStatus(item.id, "escalated")}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-950/20 border border-red-900/40 text-xs font-bold text-red-400 rounded-xl hover:bg-red-950/40 transition-all disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <TrendingUp size={12} />}
                            Escalate
                          </button>
                        )}
                        <button
                          onClick={() => updateStatus(item.id, "dismissed")}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-400 rounded-xl hover:bg-neutral-800 hover:text-white transition-all disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                          Dismiss
                        </button>
                      </div>
                    )}

                    {/* Expand toggle icon */}
                    <div className="text-neutral-600 shrink-0">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded full content */}
                {isExpanded && (
                  <div className="border-t border-neutral-900 px-5 pb-5 pt-4 bg-neutral-950/20 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono mb-2">
                        Full Captured Content
                      </p>
                      <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                        {item.raw_content || "No content captured."}
                      </div>
                    </div>
                    <div className="flex gap-4 text-[10px] text-neutral-600 font-mono flex-wrap">
                      <span>Flag ID: {item.id}</span>
                      <span>Ã‚Â·</span>
                      <span>User ID: {item.user_id}</span>
                      <span>Ã‚Â·</span>
                      <span>Type: {item.content_type}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}