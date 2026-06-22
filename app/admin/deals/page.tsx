"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getDealEnforcementState } from "@/lib/deal-enforcement";
import { Loader2, ShieldOff, Handshake } from "lucide-react";

function money(value: number) {
  return `₹${Math.round(value || 0).toLocaleString("en-IN")}`;
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [{ data: dealData, error: dealError }, { data: blacklistData, error: blError }] = await Promise.all([
        supabase
          .from("deals")
          .select("*, pitch:pitch_id(id,title), founder:founder_id(id,full_name), investor:investor_id(id,full_name)")
          .order("created_at", { ascending: false }),
        supabase.from("blacklist").select("*").order("banned_at", { ascending: false }),
      ]);

      if (dealError) throw dealError;
      if (blError) throw blError;

      setDeals(dealData || []);
      setBlacklist(blacklistData || []);
    } catch (err: any) {
      console.error("AdminDeals load error:", err);
      setError(err?.message || "Failed to load deals. Check RLS policies or database connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const overdue = useMemo(() => deals.filter((deal) => deal.due_date && !deal.paid_at && new Date(deal.due_date) < new Date()), [deals]);
  const sevenDayOverdue = useMemo(() => deals.filter((deal) => getDealEnforcementState(deal).isSevenDayOverdue), [deals]);
  const fourteenDayOverdue = useMemo(() => deals.filter((deal) => getDealEnforcementState(deal).isFourteenDayOverdue), [deals]);

  const unban = async (row: any) => {
    await supabase.from("blacklist").delete().eq("id", row.id);
    await load();
  };

  const markPartialPayment = async (deal: any) => {
    await supabase
      .from("deals")
      .update({
        status: "partial_50_paid",
        partial_unlock_until: new Date(Date.now() + 3 * 86400000).toISOString(),
      })
      .eq("id", deal.id);
    await load();
  };

  const applySevenDayLock = async (deal: any) => {
    await supabase.from("deals").update({ status: "locked" }).eq("id", deal.id);
    if (deal.pitch_id) {
      await supabase.from("pitches").update({ status: "fee_locked" }).eq("id", deal.pitch_id);
    }
    await load();
  };

  const applyFounderBan = async (deal: any) => {
    await supabase.from("blacklist").insert({
      user_id: deal.founder_id,
      reason: "Platform fee overdue 14 days post early access",
      banned_at: new Date().toISOString(),
    });
    await supabase.from("deals").update({ status: "banned" }).eq("id", deal.id);
    if (deal.pitch_id) {
      await supabase.from("pitches").update({ status: "delisted" }).eq("id", deal.pitch_id);
    }
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text3)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-8 text-center">
        <ShieldOff className="mx-auto mb-3 w-10 h-10 text-red-400" />
        <p className="font-bold text-red-400">Failed to load deals</p>
        <p className="mt-1 text-sm text-[var(--text3)]">{error}</p>
        <button onClick={load} className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-2 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--text3)]">Deal Flow</p>
        <h2 className="mt-2 text-3xl font-black text-[var(--text)]">Deals</h2>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["All deals", deals.length],
          ["Overdue deals", overdue.length],
          ["Banned accounts", blacklist.length],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-[24px] border border-[0.5px] border-[var(--border)] bg-[var(--bg)] p-5">
            <p className="text-xs uppercase tracking-[.14em] text-[var(--text3)]">{label}</p>
            <p className="mt-3 text-3xl font-black text-[var(--text)]">{value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-x-auto rounded-[24px] border border-[0.5px] border-[var(--border)] bg-[var(--bg)]">
        <div className="border-b border-[0.5px] border-[var(--border)] p-4">
          <h3 className="font-black text-[var(--text)]">All deals</h3>
        </div>
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
            <Handshake className="w-10 h-10 mb-3 opacity-40" />
            <p className="font-semibold">No deals yet</p>
            <p className="text-sm mt-1 opacity-70">Deals will appear here when investors commit to a pitch.</p>
          </div>
        ) : (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs uppercase text-[var(--text3)]">
              <tr>{["Pitch", "Founder", "Investor", "Amount", "Status", "Due", "Actions"].map((head) => <th key={head} className="p-4">{head}</th>)}</tr>
            </thead>
            <tbody>
              {deals.map((deal) => {
                const enforcement = getDealEnforcementState(deal);
                return (
                  <tr key={deal.id} className="border-t border-[0.5px] border-[var(--border)]">
                    <td className="p-4 font-bold text-[var(--text)]">{deal.pitch?.title || "-"}</td>
                    <td className="p-4 text-[var(--text2)]">{deal.founder?.full_name || "-"}</td>
                    <td className="p-4 text-[var(--text2)]">{deal.investor?.full_name || "-"}</td>
                    <td className="p-4 text-[var(--text2)]">{money(Number(deal.amount || 0))}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-[var(--bg2)] px-3 py-1 text-xs font-black text-[var(--text)]">{deal.status}</span>
                      {enforcement.overdueDays > 0 ? <p className="mt-2 text-[10px] font-bold text-red-300">{enforcement.overdueDays} days overdue</p> : null}
                    </td>
                    <td className="p-4 text-[var(--text2)]">{deal.due_date ? new Date(deal.due_date).toLocaleDateString() : "-"}</td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-2">
                        {deal.pitch_id ? <Link href={`/pitch/${deal.pitch_id}`} className="text-violet-400 underline text-xs">View pitch</Link> : "-"}
                        {enforcement.isSevenDayOverdue && deal.status !== "locked" && (
                          <button onClick={() => applySevenDayLock(deal)} className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 hover:bg-amber-500/20">
                            Apply 7-day lock
                          </button>
                        )}
                        {enforcement.isFourteenDayOverdue && deal.status !== "banned" && (
                          <button onClick={() => applyFounderBan(deal)} className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-500/20">
                            Ban founder
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="overflow-x-auto rounded-[24px] border border-[0.5px] border-[var(--border)] bg-[var(--bg)]">
        <div className="border-b border-[0.5px] border-[var(--border)] p-4">
          <h3 className="font-black text-[var(--text)]">Banned accounts</h3>
        </div>
        {blacklist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--text3)]">
            <ShieldOff className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm font-semibold">No banned accounts</p>
          </div>
        ) : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="text-xs uppercase text-[var(--text3)]">
              <tr>{["User ID", "Reason", "Banned", "Actions"].map((head) => <th key={head} className="p-4">{head}</th>)}</tr>
            </thead>
            <tbody>
              {blacklist.map((row) => (
                <tr key={row.id} className="border-t border-[0.5px] border-[var(--border)]">
                  <td className="p-4 text-[var(--text2)] font-mono text-xs">{row.user_id || "-"}</td>
                  <td className="p-4 text-[var(--text2)]">{row.reason || "-"}</td>
                  <td className="p-4 text-[var(--text2)]">{row.banned_at ? new Date(row.banned_at).toLocaleDateString() : "-"}</td>
                  <td className="p-4">
                    <button onClick={() => unban(row)} className="rounded-lg bg-violet-500/10 border border-violet-500/20 px-3 py-2 text-xs font-bold text-violet-400 hover:bg-violet-500/20 transition-colors">
                      Unban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}