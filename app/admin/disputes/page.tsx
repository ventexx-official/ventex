"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  Loader2,
  RefreshCw,
  Search,
  DollarSign,
  RotateCcw,
  Send,
  Clock,
  CheckCircle,
  Package,
  MessageSquare,
  User
} from "lucide-react";

interface Dispute {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  reason: string;
  description: string;
  seller_response: string;
  status: string;
  created_at: string;
  buyer: { full_name: string } | null;
  seller: { full_name: string } | null;
  order: {
    id: string;
    amount_paid: number;
    status: string;
    product: { name: string } | null;
  } | null;
}

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("disputes")
        .select(`
          id, order_id, buyer_id, seller_id, reason, description,
          seller_response, status, created_at,
          buyer:buyer_id ( full_name ),
          seller:seller_id ( full_name ),
          order:order_id (
            id, amount_paid, status,
            product:product_id ( name )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) console.error("Error loading disputes:", error);
      else setDisputes((data as any) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDisputes(); }, []);

  const resolveDispute = async (
    dispute: Dispute,
    resolution: "resolved_refunded" | "resolved_released"
  ) => {
    try {
      setActionLoadingId(dispute.id);

      const orderStatus = resolution === "resolved_refunded" ? "refunded" : "paid";
      const disputeStatus = resolution;

      const [{ error: orderErr }, { error: disputeErr }] = await Promise.all([
        supabase.from("orders").update({ status: orderStatus }).eq("id", dispute.order_id),
        supabase.from("disputes").update({ status: disputeStatus }).eq("id", dispute.id),
      ]);

      if (orderErr) throw orderErr;
      if (disputeErr) throw disputeErr;

      setDisputes((prev) =>
        prev.map((d) =>
          d.id === dispute.id ? { ...d, status: disputeStatus } : d
        )
      );
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = disputes.filter((d) => {
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    const matchesSearch =
      d.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.buyer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.seller?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.order?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
      open: { cls: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: <Clock size={10} />, label: "Open" },
      resolved_refunded: { cls: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <RotateCcw size={10} />, label: "Refunded" },
      resolved_released: { cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: <CheckCircle size={10} />, label: "Released to Seller" },
    };
    const s = styles[status] || styles.open;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.cls}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  const counts = {
    all: disputes.length,
    open: disputes.filter((d) => d.status === "open").length,
    resolved_refunded: disputes.filter((d) => d.status === "resolved_refunded").length,
    resolved_released: disputes.filter((d) => d.status === "resolved_released").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">Disputes Resolution Center</h2>
          <p className="text-sm text-[var(--text2)] mt-1">
            Review buyer–seller disputes and issue rulings: refund the buyer or release payment to the seller.
          </p>
        </div>
        <button
          onClick={fetchDisputes}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--bg2)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] text-xs font-semibold text-[var(--text)] rounded-lg hover:bg-[var(--bg2)] transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Disputes", val: counts.all, color: "text-[var(--text)]" },
          { label: "Open", val: counts.open, color: "text-amber-400" },
          { label: "Refunded", val: counts.resolved_refunded, color: "text-blue-400" },
          { label: "Released", val: counts.resolved_released, color: "text-emerald-400" },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-[var(--card-bg)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] p-4 text-center">
            <p className={`text-2xl font-black font-mono ${color}`}>{val}</p>
            <p className="text-[11px] text-[var(--text3)] mt-1 uppercase tracking-wider font-bold">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text3)] h-4 w-4" />
          <input
            type="text"
            placeholder="Search by reason, buyer, seller, product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--card-bg)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] text-sm text-[var(--text)] placeholder-[#888888] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
        </div>
        <div className="flex bg-[var(--card-bg)] p-1 border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px]">
          {["all", "open", "resolved_refunded", "resolved_released"].map((s) => {
            const labels: Record<string, string> = {
              all: "All",
              open: "Open",
              resolved_refunded: "Refunded",
              resolved_released: "Released",
            };
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === s ? "bg-violet-600 text-[var(--text)]" : "text-[var(--text2)] hover:text-[var(--text)]"
                }`}
              >
                {labels[s]}
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
        <div className="bg-[var(--card-bg)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] p-12 text-center">
          <AlertTriangle className="h-10 w-10 text-[var(--text3)] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[var(--text)]">No disputes found</h3>
          <p className="text-xs text-[var(--text3)] mt-1">No open disputes match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((dispute) => {
            const isOpen = dispute.status === "open";
            const isLoading = actionLoadingId === dispute.id;
            const isExpanded = expandedId === dispute.id;

            return (
              <div
                key={dispute.id}
                className={`bg-[var(--card-bg)] border rounded-[24px] overflow-hidden transition-all ${
                  isOpen ? "border-amber-900/30" : "border-[0.5px] border-[#e5e5e5] dark:border-[#333333]"
                }`}
              >
                {/* Summary Row */}
                <div
                  className="p-5 cursor-pointer hover:bg-[var(--bg2)]/10 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : dispute.id)}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {statusBadge(dispute.status)}
                        {dispute.order?.product?.name && (
                          <span className="inline-flex items-center gap-1 text-xs text-[var(--text2)] font-semibold">
                            <Package size={12} className="text-[var(--text3)]" />
                            {dispute.order.product.name}
                          </span>
                        )}
                        {dispute.order?.amount_paid && (
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 font-bold">
                            <DollarSign size={12} />
                            {(dispute.order.amount_paid / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[var(--text)] leading-snug">
                        {dispute.reason || "No reason specified"}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text3)]">
                        <span className="flex items-center gap-1">
                          <User size={11} /> Buyer: <span className="text-[var(--text2)] font-semibold ml-1">{dispute.buyer?.full_name || "Unknown"}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={11} /> Seller: <span className="text-[var(--text2)] font-semibold ml-1">{dispute.seller?.full_name || "Unknown"}</span>
                        </span>
                        <span>{new Date(dispute.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions (only for open disputes) */}
                    {isOpen && (
                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => resolveDispute(dispute, "resolved_refunded")}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-950/20 border border-blue-900/40 text-xs font-bold text-blue-400 rounded-[24px] hover:bg-blue-950/40 transition-all disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                          Refund Buyer
                        </button>
                        <button
                          onClick={() => resolveDispute(dispute, "resolved_released")}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-[var(--text)] rounded-[24px] transition-all disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                          Release to Seller
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[0.5px] border-[#e5e5e5] dark:border-[#333333] px-5 pb-5 pt-4 space-y-4 bg-[var(--bg2)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-wider font-mono mb-1.5 flex items-center gap-1.5">
                          <MessageSquare size={11} /> Buyer's Claim
                        </p>
                        <div className="p-3 bg-[var(--bg)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] text-xs text-[var(--text2)] leading-relaxed">
                          {dispute.description || "No detailed description provided."}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-wider font-mono mb-1.5 flex items-center gap-1.5">
                          <MessageSquare size={11} /> Seller's Response
                        </p>
                        <div className="p-3 bg-[var(--bg)] border border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] text-xs text-[var(--text2)] leading-relaxed">
                          {dispute.seller_response || <span className="italic text-[var(--text3)]">No response from seller yet.</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 text-[10px] text-[var(--text3)] font-mono">
                      <span>Dispute ID: {dispute.id}</span>
                      <span>·</span>
                      <span>Order ID: {dispute.order_id}</span>
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