"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getDealEnforcementState } from "@/lib/deal-enforcement";

function money(value: number) {
  return `Rs ${Math.round(value || 0).toLocaleString("en-IN")}`;
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<any[]>([]);

  const load = async () => {
    const [{ data: dealData }, { data: blacklistData }] = await Promise.all([
      supabase
        .from("deals")
        .select("*, pitch:pitch_id(id,title), founder:founder_id(id,full_name,email), investor:investor_id(id,full_name,email)")
        .order("created_at", { ascending: false }),
      supabase.from("blacklist").select("*").order("banned_at", { ascending: false }),
    ]);
    setDeals(dealData || []);
    setBlacklist(blacklistData || []);
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
    await supabase
      .from("deals")
      .update({ status: "locked" })
      .eq("id", deal.id);
    if (deal.pitch_id) {
      await supabase
        .from("pitches")
        .update({ status: "fee_locked" })
        .eq("id", deal.pitch_id);
    }
    await load();
  };

  const applyFounderBan = async (deal: any) => {
    await supabase.from("blacklist").insert({
      user_id: deal.founder_id,
      email: deal.founder?.email,
      reason: "Platform fee overdue 14 days post early access",
    });
    await supabase
      .from("deals")
      .update({
        status: "banned",
        investor_credit_until: new Date(Date.now() + 30 * 86400000).toISOString(),
      })
      .eq("id", deal.id);
    if (deal.pitch_id) {
      await supabase
        .from("pitches")
        .update({ status: "delisted" })
        .eq("id", deal.pitch_id);
    }
    await load();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--text3)]">Deal Flow</p>
        <h2 className="mt-2 text-3xl font-black text-[var(--text)]">Deals</h2>
        <p className="mt-3 text-sm text-[var(--text2)]">Fee collection activates post early access.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["All deals", deals.length],
          ["Overdue deals", overdue.length],
          ["Banned accounts", blacklist.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[24px] border border-[0.5px] border-[var(--border)]  bg-[var(--bg)] p-5">
            <p className="text-xs uppercase tracking-[.14em] text-[var(--text3)]">{label}</p>
            <p className="mt-3 text-3xl font-black text-[var(--text)]">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[24px] border border-amber-900/40 bg-amber-950/20 p-5">
        <h3 className="font-black text-amber-200">Post early access enforcement</h3>
        <div className="mt-3 grid gap-3 text-sm text-amber-100/80 md:grid-cols-3">
          <p>7 day overdue: conversation locked, pitch hidden from Discover, data room access revoked, and founder cannot create new pitches.</p>
          <p>14 day overdue: full account ban, pitch permanently delisted, founder added to blacklist, and investor gets 1 month credit.</p>
          <p>Partial 50% payment: conversation unlocks 3 more days.</p>
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-[.14em] text-amber-300/80">
          {sevenDayOverdue.length} at 7+ days · {fourteenDayOverdue.length} at 14+ days
        </p>
      </section>

      <section className="overflow-x-auto rounded-[24px] border border-[0.5px] border-[var(--border)]  bg-[var(--bg)]">
        <div className="border-b border-[0.5px] border-[var(--border)]  p-4">
          <h3 className="font-black text-[var(--text)]">All deals</h3>
        </div>
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs uppercase text-[var(--text3)]">
            <tr>{["Pitch", "Founder", "Investor", "Amount", "Fee", "Status", "Due", "Actions"].map((head) => <th key={head} className="p-4">{head}</th>)}</tr>
          </thead>
          <tbody>
            {deals.map((deal) => {
              const enforcement = getDealEnforcementState(deal);
              return (
                <tr key={deal.id} className="border-t border-[0.5px] border-[var(--border)] ">
                  <td className="p-4 font-bold text-[var(--text)]">{deal.pitch?.title || "-"}</td>
                  <td className="p-4 text-[var(--text2)]">{deal.founder?.full_name || deal.founder?.email || "-"}</td>
                  <td className="p-4 text-[var(--text2)]">{deal.investor?.full_name || deal.investor?.email || "-"}</td>
                  <td className="p-4 text-[var(--text2)]">{money(Number(deal.agreed_amount || 0))}</td>
                  <td className="p-4 text-amber-300">{money(Number(deal.fee_amount || 0))}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-[var(--bg2)] px-3 py-1 text-xs font-black text-[var(--text)]">{deal.status}</span>
                    {enforcement.overdueDays > 0 ? <p className="mt-2 text-[10px] font-bold text-red-300">{enforcement.overdueDays} days overdue</p> : null}
                  </td>
                  <td className="p-4 text-[var(--text2)]">{deal.due_date ? new Date(deal.due_date).toLocaleDateString() : "-"}</td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-2">
                      {deal.pitch_id ? <Link href={`/pitch/${deal.pitch_id}`} className="text-violet-300 underline">View pitch</Link> : "-"}
                      <button onClick={() => applySevenDayLock(deal)} className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-[var(--text)]">Apply 7-day lock</button>
                      <button onClick={() => markPartialPayment(deal)} className="rounded-lg bg-[var(--bg2)] px-3 py-2 text-xs font-black text-[var(--text)]">50% partial unlock</button>
                      <button onClick={() => applyFounderBan(deal)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-black text-[var(--text)]">Ban + investor credit</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-[24px] border border-[0.5px] border-[var(--border)]  bg-[var(--bg)]">
        <div className="border-b border-[0.5px] border-[var(--border)]  p-4">
          <h3 className="font-black text-[var(--text)]">Banned accounts</h3>
        </div>
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="text-xs uppercase text-[var(--text3)]">
            <tr>{["Email", "PAN", "Reason", "Banned", "Actions"].map((head) => <th key={head} className="p-4">{head}</th>)}</tr>
          </thead>
          <tbody>
            {blacklist.map((row) => (
              <tr key={row.id} className="border-t border-[0.5px] border-[var(--border)] ">
                <td className="p-4 text-[var(--text2)]">{row.email || "-"}</td>
                <td className="p-4 text-[var(--text2)]">{row.pan_number || "-"}</td>
                <td className="p-4 text-[var(--text2)]">{row.reason || "-"}</td>
                <td className="p-4 text-[var(--text2)]">{row.banned_at ? new Date(row.banned_at).toLocaleDateString() : "-"}</td>
                <td className="p-4"><button onClick={() => unban(row)} className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-black text-[var(--text)]">Manual unban</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}