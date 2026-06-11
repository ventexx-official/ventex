"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const SECTORS = ['Fintech', 'Edtech', 'Healthtech', 'SaaS', 'E-commerce', 'AI/ML', 'Cleantech', 'Logistics', 'AgriTech', 'Cybersecurity'];
const STAGES = ['Idea', 'Pre-seed', 'Seed', 'Early Growth', 'Growth'];

export default function ArenaApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    founder_name: "",
    startup_name: "",
    one_liner: "",
    sector: SECTORS[0],
    stage: STAGES[0],
    why_ready: "",
    email: "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("arena_applications").insert(form);
    setSaving(false);
    if (!error) setSubmitted(true);
    if (error) alert(error.message);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#090504] px-4 py-20 text-white">
        <div className="mx-auto max-w-2xl rounded-lg border border-amber-300/25 bg-[var(--card-bg)]/[.04] p-8 text-center">
          <h1 className="text-3xl font-black">Application received. You&apos;ll hear from us if selected.</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090504] px-4 py-16 text-white">
      <form onSubmit={submit} className="mx-auto max-w-3xl rounded-lg border border-amber-300/25 bg-[var(--card-bg)]/[.04] p-6 shadow-[0_0_60px_rgba(245,158,11,.1)] sm:p-8">
        <p className="mono text-xs font-black uppercase tracking-[.16em] text-amber-200/70">The Arena application</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-.04em]">Apply to Pitch</h1>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Field label="Founder name" value={form.founder_name} onChange={(v) => update("founder_name", v)} required />
          <Field label="Startup name" value={form.startup_name} onChange={(v) => update("startup_name", v)} required />
          <Field label="One-line pitch" value={form.one_liner} onChange={(v) => update("one_liner", v.slice(0, 100))} required maxLength={100} />
          <Field label="Email for updates" type="email" value={form.email} onChange={(v) => update("email", v)} required />
          <Select label="Sector" value={form.sector} values={SECTORS} onChange={(v) => update("sector", v)} />
          <Select label="Stage" value={form.stage} values={STAGES} onChange={(v) => update("stage", v)} />
          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-amber-100/70">Why are you Arena-ready?</label>
            <textarea required rows={5} maxLength={300} value={form.why_ready} onChange={(e) => update("why_ready", e.target.value.slice(0, 300))} className="w-full rounded-lg border border-amber-300/25 bg-black/25 p-4 text-sm outline-none" />
            <p className="mt-1 text-xs text-orange-50/50">{form.why_ready.length}/300 chars</p>
          </div>
        </div>
        <button disabled={saving} className="mt-8 rounded-full bg-amber-300 px-6 py-3 text-sm font-black text-[#160b04] disabled:opacity-60">
          {saving ? "Submitting..." : "Submit application"}
        </button>
      </form>
    </main>
  );
}

function Field({ label, value, onChange, required, type = "text", maxLength }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; maxLength?: number }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-amber-100/70">{label}</span>
      <input type={type} required={required} maxLength={maxLength} value={value} onChange={(e) => onChange(e.target.value)} className="min-h-11 w-full rounded-lg border border-amber-300/25 bg-black/25 px-4 text-sm outline-none" />
    </label>
  );
}

function Select({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-amber-100/70">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="min-h-11 w-full rounded-lg border border-amber-300/25 bg-black/25 px-4 text-sm outline-none">
        {values.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  );
}