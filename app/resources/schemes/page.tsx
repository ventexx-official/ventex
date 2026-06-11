"use client";

import { useState } from 'react';

export default function SchemesHelperPage() {
  const [form, setForm] = useState({ sector: '', stage: '', state: '', teamSize: '', revenue: '' });
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/schemes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSchemes(data.schemes || []);
    setLoading(false);
  };

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-[#F2F2F0] px-4 py-10">
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="h-fit rounded-3xl border border-[#e5e5e5] bg-[var(--card-bg)] p-6">
          <h1 className="text-3xl font-black tracking-tighter text-[#222222]">DPIIT Scheme Helper</h1>
          <p className="mt-2 text-sm font-medium text-[#666666]">Answer five questions to shortlist Indian startup schemes.</p>
          <Field label="Industry sector" value={form.sector} onChange={(v) => update('sector', v)} />
          <Field label="Stage" value={form.stage} onChange={(v) => update('stage', v)} />
          <Field label="State" value={form.state} onChange={(v) => update('state', v)} />
          <Field label="Team size" value={form.teamSize} onChange={(v) => update('teamSize', v)} />
          <Field label="Annual revenue" value={form.revenue} onChange={(v) => update('revenue', v)} />
          <button disabled={loading} className="mt-6 w-full rounded-2xl bg-[#222222] py-3 text-sm font-black text-white disabled:opacity-50">
            {loading ? 'Finding schemes...' : 'Find schemes'}
          </button>
        </form>

        <section className="space-y-4">
          {schemes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d4d4d4] bg-[var(--card-bg)] p-10 text-center text-sm font-bold text-[#888888]">
              Your matched schemes will appear here.
            </div>
          ) : schemes.map((scheme) => (
            <article key={scheme.name} className="rounded-3xl border border-[#e5e5e5] bg-[var(--card-bg)] p-6">
              <h2 className="text-xl font-black text-[#222222]">{scheme.name}</h2>
              <p className="mt-2 text-sm font-medium text-[#444444]">{scheme.benefit}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#888888]">Eligibility</p>
              <p className="mt-1 text-sm font-medium text-[#666666]">{scheme.eligibility}</p>
              {scheme.apply_url ? (
                <a href={scheme.apply_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-2xl bg-[#222222] px-4 py-2 text-sm font-black text-white">
                  Apply
                </a>
              ) : null}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mt-5 block">
      <span className="text-xs font-black uppercase tracking-widest text-[#888888]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] px-4 py-3 text-sm font-bold outline-none focus:border-[#222222]"
      />
    </label>
  );
}