"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const sectors = ["Fintech", "SaaS", "AI/ML", "Healthtech", "Edtech", "AgriTech", "Consumer", "Logistics"];

export default function LivePage() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [founderForm, setFounderForm] = useState({ startup: "", sector: "SaaS", stage: "Seed", askInr: "", askUsd: "", pitch: "", why: "", profileUrl: "" });
  const [judgeForm, setJudgeForm] = useState({ fullName: "", linkedIn: "", sectors: [] as string[], ticket: "Flexible", investedBefore: "Yes", why: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("feature_flags").select("key, enabled").in("key", ["ventex_live_enabled", "live_founder_applications", "live_investor_applications"]);
      setFlags(Object.fromEntries((data || []).map((row: any) => [row.key, !!row.enabled])));
    };
    load();
  }, []);

  const submitFounder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flags.live_founder_applications) return;
    const { error } = await supabase.from("live_founder_applications").insert(founderForm);
    setStatus(error ? error.message : "Founder application submitted.");
  };

  const submitJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flags.live_investor_applications) return;
    const { error } = await supabase.from("live_investor_applications").insert(judgeForm);
    setStatus(error ? error.message : "Investor judge application submitted.");
  };

  if (!flags.ventex_live_enabled) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0A0A0C] px-4 text-center text-white">
        <div>
          <p className="mono mb-3 text-xs uppercase tracking-[.16em] text-violet-300">Ventex Live</p>
          <h1 className="text-5xl font-black tracking-tight">Coming Soon</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-400">Monthly pitch nights are built but disabled until the owner enables Ventex Live from Admin → Feature Flags.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F2F0] px-4 py-16 text-[#222222]">
      <div className="mx-auto max-w-6xl space-y-10">
        <header>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">Ventex Live  -  Monthly Pitch Night. Watch founders pitch to real investors.</h1>
          <p className="mt-4 text-sm font-bold text-[#666666]">Next event countdown appears here once the admin sets the event date.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={submitFounder} className="rounded-2xl bg-[var(--card-bg)] p-6 space-y-3">
            <h2 className="text-xl font-black">Apply to pitch</h2>
            <input required placeholder="Startup name" value={founderForm.startup} onChange={(e) => setFounderForm((p) => ({ ...p, startup: e.target.value }))} className="w-full rounded-xl border p-3" />
            <select value={founderForm.sector} onChange={(e) => setFounderForm((p) => ({ ...p, sector: e.target.value }))} className="w-full rounded-xl border p-3">{sectors.map((s) => <option key={s}>{s}</option>)}</select>
            <select value={founderForm.stage} onChange={(e) => setFounderForm((p) => ({ ...p, stage: e.target.value }))} className="w-full rounded-xl border p-3">{["Idea", "Pre-seed", "Seed", "Growth"].map((s) => <option key={s}>{s}</option>)}</select>
            <input placeholder="Funding ask ₹" value={founderForm.askInr} onChange={(e) => setFounderForm((p) => ({ ...p, askInr: e.target.value }))} className="w-full rounded-xl border p-3" />
            <input placeholder="Funding ask $" value={founderForm.askUsd} onChange={(e) => setFounderForm((p) => ({ ...p, askUsd: e.target.value }))} className="w-full rounded-xl border p-3" />
            <input maxLength={150} placeholder="One-line pitch" value={founderForm.pitch} onChange={(e) => setFounderForm((p) => ({ ...p, pitch: e.target.value }))} className="w-full rounded-xl border p-3" />
            <textarea placeholder="Why should we pick you? (200 words max)" value={founderForm.why} onChange={(e) => setFounderForm((p) => ({ ...p, why: e.target.value }))} className="w-full rounded-xl border p-3" />
            <input placeholder="Ventex profile URL" value={founderForm.profileUrl} onChange={(e) => setFounderForm((p) => ({ ...p, profileUrl: e.target.value }))} className="w-full rounded-xl border p-3" />
            <button disabled={!flags.live_founder_applications} className="w-full rounded-xl bg-[#222222] p-3 font-black text-white disabled:opacity-50">Submit founder application</button>
          </form>

          <form onSubmit={submitJudge} className="rounded-2xl bg-[var(--card-bg)] p-6 space-y-3">
            <h2 className="text-xl font-black">Join as investor judge</h2>
            <input required placeholder="Full name" value={judgeForm.fullName} onChange={(e) => setJudgeForm((p) => ({ ...p, fullName: e.target.value }))} className="w-full rounded-xl border p-3" />
            <input required placeholder="LinkedIn URL" value={judgeForm.linkedIn} onChange={(e) => setJudgeForm((p) => ({ ...p, linkedIn: e.target.value }))} className="w-full rounded-xl border p-3" />
            <select value={judgeForm.ticket} onChange={(e) => setJudgeForm((p) => ({ ...p, ticket: e.target.value }))} className="w-full rounded-xl border p-3">{["<₹10L", "₹10-50L", "₹50L-1Cr", ">₹1Cr", "Flexible"].map((s) => <option key={s}>{s}</option>)}</select>
            <select value={judgeForm.investedBefore} onChange={(e) => setJudgeForm((p) => ({ ...p, investedBefore: e.target.value }))} className="w-full rounded-xl border p-3"><option>Yes</option><option>No</option></select>
            <textarea placeholder="Why join as a judge?" value={judgeForm.why} onChange={(e) => setJudgeForm((p) => ({ ...p, why: e.target.value }))} className="w-full rounded-xl border p-3" />
            <button disabled={!flags.live_investor_applications} className="w-full rounded-xl bg-[#222222] p-3 font-black text-white disabled:opacity-50">Submit judge application</button>
          </form>
        </div>

        {status ? <p className="rounded-xl bg-[var(--card-bg)] p-4 text-sm font-bold">{status}</p> : null}

        <section className="rounded-2xl bg-[var(--card-bg)] p-6">
          <h2 className="text-xl font-black">Past episodes and clips</h2>
          <p className="mt-2 text-sm text-[#666666]">Admin-managed YouTube embeds will appear here after episodes are added.</p>
        </section>
      </div>
    </main>
  );
}