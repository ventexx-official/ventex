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
 const [whatsappNumber, setWhatsappNumber] = useState("");
 const [saving, setSaving] = useState(false);
 const [enrolling2fa, setEnrolling2fa] = useState(false);
 const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

 useEffect(() => {
 const load = async () => {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) return router.push('/login');
 const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
 if (data?.role === 'admin') return router.replace('/admin/users');
 if (data?.role !== 'investor') return router.replace('/founder/settings');
 setProfile(data);
 setThesis(data?.investment_thesis || '');
 setSectors(data?.preferred_sectors || []);
 setStages(data?.preferred_stages || []);
 setWhatsappNumber(data?.whatsapp_number || '');
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
 whatsapp_number: whatsappNumber || null,
 }).eq('id', profile.id);
 setSaving(false);
 };

 const enableTwoFactor = async () => {
 setEnrolling2fa(true);
 const { error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
 if (!error) setTwoFactorEnabled(true);
 if (error) alert(error.message);
 setEnrolling2fa(false);
 };

 return (
 <div className="min-h-screen bg-[var(--bg)] px-4 py-10">
 <main className="mx-auto max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-6 md:p-8">
 <h1 className="text-3xl font-black tracking-tighter text-[var(--text)]">Investor thesis</h1>
 <p className="mt-2 text-sm font-medium text-[var(--text2)]">This powers founder-side investor matching.</p>

 <label className="mt-8 block text-xs font-black uppercase tracking-widest text-[var(--text2)]">Investment thesis</label>
 <textarea
 value={thesis}
 onChange={(e) => setThesis(e.target.value)}
 rows={6}
 className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[#F8F8F8] p-4 text-sm font-medium outline-none focus:border-[#222222] text-[var(--text)]"
 />

 <label className="mt-8 block text-xs font-black uppercase tracking-widest text-[var(--text2)]">WhatsApp Number (For Direct P2P)</label>
 <input
 type="tel"
 value={whatsappNumber}
 onChange={(e) => setWhatsappNumber(e.target.value)}
 placeholder="+1234567890"
 className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[#F8F8F8] p-4 text-sm font-medium outline-none focus:border-[#222222] text-[var(--text)]"
 />

 <Section title="Preferred sectors" values={SECTORS} selected={sectors} onToggle={(v) => toggle(v, sectors, setSectors)} />
 <Section title="Preferred stages" values={STAGES} selected={stages} onToggle={(v) => toggle(v, stages, setStages)} />

 <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[#F8F8F8] p-5">
 <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text)]">Two-Factor Authentication</h2>
 <p className="mt-2 text-sm font-medium text-[var(--text2)]">Protect your account with an authenticator app.</p>
 <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <span className="text-xs font-black uppercase tracking-widest text-[var(--text2)]">Status: {twoFactorEnabled ? 'Enabled' : 'Not enabled'}</span>
 <button type="button" onClick={enableTwoFactor} disabled={enrolling2fa} className="rounded-2xl bg-[var(--text)] px-5 py-2.5 text-sm font-black text-[var(--bg)] disabled:opacity-50">
 {enrolling2fa ? 'Starting...' : 'Enable 2FA'}
 </button>
 </div>
 </section>

 <button onClick={save} disabled={saving} className="mt-8 rounded-2xl bg-[var(--text)] px-6 py-3 text-sm font-black text-[var(--bg)] disabled:opacity-50">
 {saving ? 'Saving...' : 'Save thesis'}
 </button>
 </main>
 </div>
 );
}

function Section({ title, values, selected, onToggle }: { title: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
 return (
 <section className="mt-6">
 <div className="mb-3 text-xs font-black uppercase tracking-widest text-[var(--text2)]">{title}</div>
 <div className="flex flex-wrap gap-2">
 {values.map((value) => (
 <button
 key={value}
 type="button"
 onClick={() => onToggle(value)}
 className={`rounded-full border px-3 py-1.5 text-xs font-black ${selected.includes(value) ? 'border-[#222222] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text)]'}`}
 >
 {value}
 </button>
 ))}
 </div>
 </section>
 );
}
