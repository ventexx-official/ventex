"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

  const unban = async (row: any) => {
    await supabase.from("blacklist").delete().eq("id", row.id);
    await load();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-neutral-500">Deal Flow</p>
        <h2 className="mt-2 text-3xl font-black text-white">Deals</h2>
        <p className="mt-3 text-sm text-neutral-400">Fee collection activates post early access.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["All deals", deals.length],
          ["Overdue deals", overdue.length],
          ["Banned accounts", blacklist.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-xs uppercase tracking-[.14em] text-neutral-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="border-b border-neutral-800 p-4">
          <h3 className="font-black text-white">All deals</h3>
        </div>
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs uppercase text-neutral-500">
            <tr>{["Pitch", "Founder", "Investor", "Amount", "Fee", "Status", "Due", "Actions"].map((head) => <th key={head} className="p-4">{head}</th>)}</tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id} className="border-t border-neutral-900">
                <td className="p-4 font-bold text-white">{deal.pitch?.title || "-"}</td>
                <td className="p-4 text-neutral-300">{deal.founder?.full_name || deal.founder?.email || "-"}</td>
                <td className="p-4 text-neutral-300">{deal.investor?.full_name || deal.investor?.email || "-"}</td>
                <td className="p-4 text-neutral-300">{money(Number(deal.agreed_amount || 0))}</td>
                <td className="p-4 text-amber-300">{money(Number(deal.fee_amount || 0))}</td>
                <td className="p-4"><span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-black text-neutral-200">{deal.status}</span></td>
                <td className="p-4 text-neutral-300">{deal.due_date ? new Date(deal.due_date).toLocaleDateString() : "-"}</td>
                <td className="p-4">{deal.pitch_id ? <Link href={`/pitch/${deal.pitch_id}`} className="text-violet-300 underline">View pitch</Link> : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="border-b border-neutral-800 p-4">
          <h3 className="font-black text-white">Banned accounts</h3>
        </div>
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="text-xs uppercase text-neutral-500">
            <tr>{["Email", "PAN", "Reason", "Banned", "Actions"].map((head) => <th key={head} className="p-4">{head}</th>)}</tr>
          </thead>
          <tbody>
            {blacklist.map((row) => (
              <tr key={row.id} className="border-t border-neutral-900">
                <td className="p-4 text-neutral-300">{row.email || "-"}</td>
                <td className="p-4 text-neutral-300">{row.pan_number || "-"}</td>
                <td className="p-4 text-neutral-300">{row.reason || "-"}</td>
                <td className="p-4 text-neutral-300">{row.banned_at ? new Date(row.banned_at).toLocaleDateString() : "-"}</td>
                <td className="p-4"><button onClick={() => unban(row)} className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-black text-white">Manual unban</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
