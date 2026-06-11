"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/lib/supabase";

type Entry = {
  id: string;
  pitch_id: string | null;
  startup_name: string | null;
  invested_amount: number | null;
  investment_date: string | null;
  current_valuation: number | null;
  equity_percentage: number | null;
  stage_at_investment: string | null;
  notes: string | null;
  pitch?: { id: string; title: string; industry?: string | null; company_stage?: string | null } | null;
};

type Update = {
  id: string;
  portfolio_entry_id: string;
  updated_valuation: number | null;
  update_note: string | null;
  update_date: string | null;
};

const colors = ["#111827", "#2563eb", "#059669", "#dc2626", "#7c3aed", "#ea580c", "#0891b2"];

function money(value: number) {
  return `Rs ${Math.round(value || 0).toLocaleString("en-IN")}`;
}

export default function InvestorPortfolioPage() {
  const [userId, setUserId] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [savedPitches, setSavedPitches] = useState<any[]>([]);
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({});
  const [chartMounted, setChartMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [updatingEntry, setUpdatingEntry] = useState<Entry | null>(null);
  const [form, setForm] = useState({
    pitch_id: "",
    startup_name: "",
    invested_amount: "",
    investment_date: "",
    current_valuation: "",
    equity_percentage: "",
    stage_at_investment: "",
    notes: "",
  });
  const [updateForm, setUpdateForm] = useState({ updated_valuation: "", update_note: "" });

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    setUserId(session.user.id);

    const [{ data: entryData }, { data: savedData }] = await Promise.all([
      supabase
        .from("portfolio_entries")
        .select("*, pitch:pitch_id(id,title,industry,company_stage)")
        .eq("investor_id", session.user.id)
        .order("investment_date", { ascending: true }),
      supabase
        .from("saved_pitches")
        .select("pitch:pitch_id(id,title,industry,company_stage)")
        .eq("user_id", session.user.id),
    ]);

    const ids = (entryData || []).map((entry: Entry) => entry.id);
    const { data: updateData } = ids.length
      ? await supabase.from("portfolio_updates").select("*").in("portfolio_entry_id", ids).order("update_date", { ascending: true })
      : { data: [] };

    setEntries(entryData || []);
    setUpdates(updateData || []);
    setSavedPitches((savedData || []).map((item: any) => item.pitch).filter(Boolean));
    setVisibleLines(Object.fromEntries((entryData || []).map((entry: Entry) => [entry.id, true])));
  };

  useEffect(() => {
    setChartMounted(true);
    load();
  }, []);

  const stats = useMemo(() => {
    const invested = entries.reduce((sum, entry) => sum + Number(entry.invested_amount || 0), 0);
    const currentValue = entries.reduce((sum, entry) => sum + Number(entry.current_valuation || 0) * (Number(entry.equity_percentage || 0) / 100), 0);
    const returnPct = invested ? ((currentValue - invested) / invested) * 100 : 0;
    return { invested, currentValue, returnPct, count: entries.length };
  }, [entries]);

  const chartData = useMemo(() => {
    const dates = Array.from(new Set([
      ...entries.map((entry) => entry.investment_date).filter(Boolean),
      ...updates.map((update) => update.update_date).filter(Boolean),
    ])).sort() as string[];

    return dates.map((date) => {
      const row: Record<string, string | number> = { date };
      let total = 0;
      entries.forEach((entry) => {
        const latestUpdate = updates
          .filter((update) => update.portfolio_entry_id === entry.id && (update.update_date || "") <= date)
          .at(-1);
        const valuation = Number(latestUpdate?.updated_valuation || entry.current_valuation || 0);
        const ownedValue = valuation * (Number(entry.equity_percentage || 0) / 100);
        row[entry.id] = ownedValue;
        total += ownedValue;
      });
      row.total = total;
      return row;
    });
  }, [entries, updates]);

  const saveInvestment = async () => {
    if (!userId) return;
    const selectedPitch = savedPitches.find((pitch) => pitch.id === form.pitch_id);
    await supabase.from("portfolio_entries").insert({
      investor_id: userId,
      pitch_id: form.pitch_id || null,
      startup_name: selectedPitch?.title || form.startup_name,
      invested_amount: Number(form.invested_amount || 0),
      investment_date: form.investment_date || new Date().toISOString().slice(0, 10),
      current_valuation: Number(form.current_valuation || 0),
      equity_percentage: Number(form.equity_percentage || 0),
      stage_at_investment: form.stage_at_investment,
      notes: form.notes,
    });
    setShowAdd(false);
    setForm({ pitch_id: "", startup_name: "", invested_amount: "", investment_date: "", current_valuation: "", equity_percentage: "", stage_at_investment: "", notes: "" });
    await load();
  };

  const saveUpdate = async () => {
    if (!updatingEntry) return;
    const valuation = Number(updateForm.updated_valuation || 0);
    await supabase.from("portfolio_updates").insert({
      portfolio_entry_id: updatingEntry.id,
      updated_valuation: valuation,
      update_note: updateForm.update_note,
    });
    await supabase.from("portfolio_entries").update({ current_valuation: valuation }).eq("id", updatingEntry.id);
    setUpdatingEntry(null);
    setUpdateForm({ updated_valuation: "", update_note: "" });
    await load();
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-10 text-[var(--text)]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mono text-xs uppercase tracking-[.14em] text-[var(--text3)]">Investor Dashboard</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-.04em]">Portfolio</h1>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add Investment</button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Total invested", money(stats.invested)],
            ["Current portfolio value", money(stats.currentValue)],
            ["Total return %", `${stats.returnPct.toFixed(1)}%`],
            ["Startups backed", stats.count.toString()],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-[var(--bg2)] p-5" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--text3)]">{label}</p>
              <p className="mt-3 text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-lg border bg-[var(--bg2)] p-5" style={{ borderColor: "var(--border)" }}>
          <div className="mb-4 flex flex-wrap gap-2">
            {entries.map((entry) => (
              <button key={entry.id} onClick={() => setVisibleLines((prev) => ({ ...prev, [entry.id]: !prev[entry.id] }))} className={`rounded-full border px-3 py-1 text-xs font-bold ${visibleLines[entry.id] ? "bg-[var(--text)] text-[var(--bg)]" : ""}`} style={{ borderColor: "var(--border)" }}>
                {entry.startup_name || entry.pitch?.title}
              </button>
            ))}
          </div>
          <div className="h-80">
            {chartMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => money(Number(value))} />
                  <Tooltip formatter={(value: any, name: any) => [money(Number(value)), name === "total" ? "Total portfolio" : entries.find((entry) => entry.id === name)?.startup_name || name]} />
                  {entries.map((entry, index) => visibleLines[entry.id] ? <Line key={entry.id} type="monotone" dataKey={entry.id} stroke={colors[index % colors.length]} dot={false} /> : null)}
                  <Line type="monotone" dataKey="total" stroke="#000000" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </section>

        <section className="mt-8 overflow-x-auto rounded-lg border bg-[var(--bg2)]" style={{ borderColor: "var(--border)" }}>
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="text-xs uppercase text-[var(--text3)]">
              <tr>{["Startup", "Sector", "Stage", "Invested", "Current Value", "Return %", "Equity %", "Date", "Actions"].map((head) => <th key={head} className="p-4">{head}</th>)}</tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const current = Number(entry.current_valuation || 0) * (Number(entry.equity_percentage || 0) / 100);
                const invested = Number(entry.invested_amount || 0);
                const returnPct = invested ? ((current - invested) / invested) * 100 : 0;
                return (
                  <tr key={entry.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="p-4 font-black">{entry.startup_name || entry.pitch?.title}</td>
                    <td className="p-4">{entry.pitch?.industry || "-"}</td>
                    <td className="p-4">{entry.stage_at_investment || entry.pitch?.company_stage || "-"}</td>
                    <td className="p-4">{money(invested)}</td>
                    <td className="p-4">{money(current)}</td>
                    <td className={`p-4 font-black ${returnPct >= 0 ? "text-emerald-600" : "text-red-600"}`}>{returnPct.toFixed(1)}%</td>
                    <td className="p-4">{entry.equity_percentage || 0}%</td>
                    <td className="p-4">{entry.investment_date || "-"}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {entry.pitch_id ? <Link href={`/pitch/${entry.pitch_id}`} className="btn-secondary text-xs">View pitch</Link> : null}
                        <button onClick={() => setUpdatingEntry(entry)} className="btn-secondary text-xs">Add update</button>
                        <button onClick={() => alert(entry.notes || "No notes yet.")} className="btn-secondary text-xs">Notes</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>

      {showAdd ? (
        <Modal title="Add Investment" onClose={() => setShowAdd(false)}>
          <div className="grid gap-3">
            <select value={form.pitch_id} onChange={(event) => setForm({ ...form, pitch_id: event.target.value })} className="input">
              <option value="">Select saved pitch or enter manually</option>
              {savedPitches.map((pitch) => <option key={pitch.id} value={pitch.id}>{pitch.title}</option>)}
            </select>
            <input value={form.startup_name} onChange={(event) => setForm({ ...form, startup_name: event.target.value })} className="input" placeholder="Startup name" />
            <input value={form.invested_amount} onChange={(event) => setForm({ ...form, invested_amount: event.target.value })} className="input" placeholder="Amount invested" type="number" />
            <input value={form.investment_date} onChange={(event) => setForm({ ...form, investment_date: event.target.value })} className="input" type="date" />
            <input value={form.current_valuation} onChange={(event) => setForm({ ...form, current_valuation: event.target.value })} className="input" placeholder="Current valuation" type="number" />
            <input value={form.equity_percentage} onChange={(event) => setForm({ ...form, equity_percentage: event.target.value })} className="input" placeholder="Equity %" type="number" />
            <input value={form.stage_at_investment} onChange={(event) => setForm({ ...form, stage_at_investment: event.target.value })} className="input" placeholder="Stage" />
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="input min-h-24" placeholder="Notes" />
            <button onClick={saveInvestment} className="btn-primary">Save investment</button>
          </div>
        </Modal>
      ) : null}

      {updatingEntry ? (
        <Modal title={`Add update: ${updatingEntry.startup_name || updatingEntry.pitch?.title}`} onClose={() => setUpdatingEntry(null)}>
          <div className="grid gap-3">
            <input value={updateForm.updated_valuation} onChange={(event) => setUpdateForm({ ...updateForm, updated_valuation: event.target.value })} className="input" placeholder="Updated valuation" type="number" />
            <textarea value={updateForm.update_note} onChange={(event) => setUpdateForm({ ...updateForm, update_note: event.target.value })} className="input min-h-24" placeholder="Update note" />
            <button onClick={saveUpdate} className="btn-primary">Save update</button>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-lg bg-[var(--bg)] p-5 text-[var(--text)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">{title}</h2>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}