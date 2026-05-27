"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const SECTORS = ['Fintech', 'Edtech', 'Healthtech', 'SaaS', 'AI/ML', 'Cleantech', 'Logistics', 'AgriTech', 'Cybersecurity'];
const STAGES = ['Idea', 'Pre-seed', 'Seed', 'Early Growth', 'Growth'];

export default function InvestorSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [thesis, setThesis] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      setProfile(data);
      setThesis(data?.investment_thesis || '');
      setSectors(data?.preferred_sectors || []);
      setStages(data?.preferred_stages || []);
    };
    load();
  }, [router]);

  const toggle = (value: string, items: string[], setItems: (items: string[]) => void) => {
    setItems(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
  };

  const save = async () => {
    if (!profile?.id) return;
    setSaving(true);
    await supabase.from('users').update({
      investment_thesis: thesis,
      preferred_sectors: sectors,
      preferred_stages: stages,
    }).eq('id', profile.id);
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F0] px-4 py-10">
      <main className="mx-auto max-w-3xl rounded-3xl border border-[#e5e5e5] bg-white p-6 md:p-8">
        <h1 className="text-3xl font-black tracking-tighter text-[#222222]">Investor thesis</h1>
        <p className="mt-2 text-sm font-medium text-[#666666]">This powers founder-side investor matching.</p>

        <label className="mt-8 block text-xs font-black uppercase tracking-widest text-[#888888]">Investment thesis</label>
        <textarea
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          rows={6}
          className="mt-2 w-full rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] p-4 text-sm font-medium outline-none focus:border-[#222222]"
        />

        <Section title="Preferred sectors" values={SECTORS} selected={sectors} onToggle={(v) => toggle(v, sectors, setSectors)} />
        <Section title="Preferred stages" values={STAGES} selected={stages} onToggle={(v) => toggle(v, stages, setStages)} />

        <section className="mt-8 rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] p-5">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#222222]">Two-Factor Authentication</h2>
          <p className="mt-2 text-sm font-medium text-[#666666]">Protect your account with an authenticator app.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-[#888888]">Status: Not enabled</span>
            <button type="button" className="rounded-2xl bg-[#222222] px-5 py-2.5 text-sm font-black text-white">
              Enable 2FA
            </button>
          </div>
        </section>

        <button onClick={save} disabled={saving} className="mt-8 rounded-2xl bg-[#222222] px-6 py-3 text-sm font-black text-white disabled:opacity-50">
          {saving ? 'Saving...' : 'Save thesis'}
        </button>
      </main>
    </div>
  );
}

function Section({ title, values, selected, onToggle }: { title: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <section className="mt-6">
      <div className="mb-3 text-xs font-black uppercase tracking-widest text-[#888888]">{title}</div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-black ${selected.includes(value) ? 'border-[#222222] bg-[#222222] text-white' : 'border-[#e5e5e5] bg-[#F2F2F0] text-[#222222]'}`}
          >
            {value}
          </button>
        ))}
      </div>
    </section>
  );
}
