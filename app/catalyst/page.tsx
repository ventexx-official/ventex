"use client";

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SECTORS = ['Fintech', 'SaaS', 'AI/ML', 'Healthtech', 'Edtech', 'AgriTech', 'Consumer', 'Logistics', 'Other'];

export default function CatalystPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: 'Mentor',
    sectorExpertise: [] as string[],
    linkedIn: '',
    bio: '',
    offer: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggleSector = (sector: string) => {
    setForm((prev) => ({
      ...prev,
      sectorExpertise: prev.sectorExpertise.includes(sector)
        ? prev.sectorExpertise.filter((item) => item !== sector)
        : [...prev.sectorExpertise, sector],
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    if (!/^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(form.linkedIn)) {
      setError('Please enter a valid LinkedIn profile URL.');
      setSubmitting(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('catalyst_applications').insert({
        full_name: form.fullName,
        email: form.email,
        role: form.role,
        sector_expertise: form.sectorExpertise,
        linkedin_url: form.linkedIn,
        bio: form.bio,
        offer: form.offer,
      });
      if (insertError) throw insertError;

      await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'catalyst_application',
          recipientEmail: form.email,
          data: { ...form, fullName: form.fullName },
        }),
      });

      await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'catalyst_application',
          recipientEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'support@ventex.app',
          data: { ...form, fullName: form.fullName },
        }),
      });

      setMessage('Application submitted. The Ventex team will review it and contact you.');
      setForm({ fullName: '', email: '', role: 'Mentor', sectorExpertise: [], linkedIn: '', bio: '', offer: '' });
    } catch (err: any) {
      setError(err.message || 'Could not submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F2F0] px-4 py-10 text-[#222222]">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Ventex Catalyst</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#666666]">
              Catalyst network launching soon. Apply now to be a founding mentor or investor.
            </p>
          </div>
          <Link href="/investors" className="text-sm font-black underline underline-offset-4">View investor network</Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="rounded-3xl border border-[#e5e5e5] bg-white p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Founding applications open
            </div>
            <h2 className="text-3xl font-black tracking-tighter">Guide founders from idea to traction.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#666666]">
              Ventex Catalysts are mentors and investors who help founders sharpen products, close early customers, and prepare for funding. Placeholder catalyst profiles have been removed until verified members are approved.
            </p>
          </div>

          <form onSubmit={submit} className="rounded-3xl border border-[#e5e5e5] bg-white p-5 space-y-4">
            <h2 className="text-xl font-black tracking-tighter">Submit application</h2>
            {error ? <div className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div> : null}
            {message ? <div className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</div> : null}

            <input required value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Full name" className="w-full rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] px-4 py-3 text-sm font-bold outline-none focus:border-[#222222]" />
            <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] px-4 py-3 text-sm font-bold outline-none focus:border-[#222222]" />

            <div>
              <div className="mb-2 text-xs font-black uppercase text-[#888888]">Role</div>
              <div className="grid grid-cols-3 gap-2">
                {['Mentor', 'Investor', 'Mentor + Investor'].map((role) => (
                  <label key={role} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#e5e5e5] p-3 text-xs font-black">
                    <input type="radio" checked={form.role === role} onChange={() => setForm((p) => ({ ...p, role }))} />
                    {role}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-black uppercase text-[#888888]">Sector expertise</div>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((sector) => (
                  <button type="button" key={sector} onClick={() => toggleSector(sector)} className={`rounded-full border px-3 py-1.5 text-xs font-black ${form.sectorExpertise.includes(sector) ? 'border-[#222222] bg-[#222222] text-white' : 'border-[#e5e5e5] bg-[#F2F2F0]'}`}>
                    {sector}
                  </button>
                ))}
              </div>
            </div>

            <input required value={form.linkedIn} onChange={(e) => setForm((p) => ({ ...p, linkedIn: e.target.value }))} placeholder="LinkedIn profile URL" className="w-full rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] px-4 py-3 text-sm font-bold outline-none focus:border-[#222222]" />
            <textarea required maxLength={300} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Brief bio (300 characters max)" rows={3} className="w-full resize-none rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] px-4 py-3 text-sm font-bold outline-none focus:border-[#222222]" />
            <textarea required maxLength={500} value={form.offer} onChange={(e) => setForm((p) => ({ ...p, offer: e.target.value }))} placeholder="What you offer founders (500 characters max)" rows={4} className="w-full resize-none rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] px-4 py-3 text-sm font-bold outline-none focus:border-[#222222]" />
            <button disabled={submitting} className="w-full rounded-2xl bg-[#222222] py-3 text-sm font-black text-white disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit application'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
