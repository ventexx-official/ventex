"use client";

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, X, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { emailFor } from '@/lib/site';

const SECTORS = ['Fintech', 'SaaS', 'AI/ML', 'Healthtech', 'Edtech', 'AgriTech', 'Consumer', 'Logistics', 'Other'];


export default function CatalystPage() {
 const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || emailFor('support');
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
 const [isModalOpen, setIsModalOpen] = useState(false);

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
 recipientEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || supportEmail,
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
 <div className="mx-auto max-w-7xl">
 <header className="flex flex-col items-center text-center gap-6 py-12 md:py-20">
 <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400 border-[0.5px] border-emerald-200 dark:border-emerald-800">
 <CheckCircle2 className="h-4 w-4" /> Founding applications open
 </div>
 <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[var(--text)] max-w-4xl">
 Guide founders from idea to traction.
 </h1>
 <p className="max-w-2xl text-base md:text-lg font-medium leading-relaxed text-[var(--text2)]">
 Ventex Catalysts are mentors and investors who help founders sharpen products, close early customers, and prepare for funding. Join the network to give back and spot breakout startups early.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 mt-4">
 <button 
 onClick={() => setIsModalOpen(true)}
 className="bg-[var(--text)] text-[var(--bg)] px-8 py-3.5 rounded-full text-sm font-bold transition-all hover:scale-105"
 >
 Apply to Catalyst
 </button>
 <Link 
 href="/investors" 
 className="bg-[var(--card-bg)] text-[var(--text)] border-[0.5px] border-[var(--border)] px-8 py-3.5 rounded-full text-sm font-bold transition-colors hover:bg-[var(--bg2)]"
 >
 View investor network
 </Link>
 </div>
 </header>

 <section className="py-12">
 <div className="flex items-center justify-between mb-8">
 <h2 className="text-2xl font-black tracking-tight text-[var(--text)]">Join the Catalyst Network</h2>
 </div>
 <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[24px] p-10 flex flex-col items-center text-center">
 <h3 className="text-xl font-bold text-[var(--text)] mb-4">Are you an experienced operator, founder, or investor?</h3>
 <p className="text-[var(--text3)] mb-6 max-w-xl">We are currently onboarding the first cohort of Ventex Catalysts. Apply now to get early access and start mentoring the next generation of startups.</p>
 <button 
 onClick={() => setIsModalOpen(true)}
 className="bg-[var(--text)] text-[var(--bg)] px-8 py-3 rounded-full text-sm font-bold transition-all hover:scale-105"
 >
 Submit Application
 </button>
 </div>
 </section>

 {/* Modal */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
 <div className="p-5 border-b-[0.5px] border-[var(--border)] flex justify-between items-center bg-[var(--bg2)]">
 <h2 className="text-xl font-black tracking-tight text-[var(--text)]">Apply to Ventex Catalyst</h2>
 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--bg3)] rounded-full transition-colors">
 <X className="w-5 h-5 text-[var(--text3)]" />
 </button>
 </div>
 
 <div className="p-6 overflow-y-auto">
 <form onSubmit={submit} className="space-y-5">
 {error ? <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border-[0.5px] border-red-200 dark:border-red-800 p-4 text-sm font-bold text-red-700 dark:text-red-400">{error}</div> : null}
 {message ? <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border-[0.5px] border-emerald-200 dark:border-emerald-800 p-4 text-sm font-bold text-emerald-700 dark:text-emerald-400">{message}</div> : null}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="text-xs font-black uppercase text-[var(--text3)] mb-2 block">Full Name</label>
 <input required value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="John Doe" className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--text)] transition-colors" />
 </div>
 <div>
 <label className="text-xs font-black uppercase text-[var(--text3)] mb-2 block">Email</label>
 <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="john@example.com" className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--text)] transition-colors" />
 </div>
 </div>

 <div>
 <label className="text-xs font-black uppercase text-[var(--text3)] mb-2 block">Role</label>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {['Mentor', 'Investor', 'Mentor + Investor'].map((role) => (
 <label key={role} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-[1.5px] p-3 text-xs font-black transition-colors ${form.role === role ? 'border-[var(--text)] bg-[var(--bg2)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--text3)] hover:border-[var(--text2)]'}`}>
 <input type="radio" className="hidden" checked={form.role === role} onChange={() => setForm((p) => ({ ...p, role }))} />
 {role}
 </label>
 ))}
 </div>
 </div>

 <div>
 <label className="text-xs font-black uppercase text-[var(--text3)] mb-2 block">Sector Expertise</label>
 <div className="flex flex-wrap gap-2">
 {SECTORS.map((sector) => (
 <button type="button" key={sector} onClick={() => toggleSector(sector)} className={`rounded-full border-[1.5px] px-3 py-1.5 text-xs font-black transition-colors ${form.sectorExpertise.includes(sector) ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--border)] bg-transparent text-[var(--text3)] hover:border-[var(--text2)]'}`}>
 {sector}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="text-xs font-black uppercase text-[var(--text3)] mb-2 block">LinkedIn URL</label>
 <input required value={form.linkedIn} onChange={(e) => setForm((p) => ({ ...p, linkedIn: e.target.value }))} placeholder="https://linkedin.com/in/username" className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--text)] transition-colors" />
 </div>
 <div>
 <label className="text-xs font-black uppercase text-[var(--text3)] mb-2 block">Brief Bio</label>
 <textarea required maxLength={300} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Summarize your background (300 chars max)" rows={3} className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--text)] transition-colors" />
 </div>
 <div>
 <label className="text-xs font-black uppercase text-[var(--text3)] mb-2 block">What You Offer</label>
 <textarea required maxLength={500} value={form.offer} onChange={(e) => setForm((p) => ({ ...p, offer: e.target.value }))} placeholder="How can you help founders? (500 chars max)" rows={3} className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm font-bold text-[var(--text)] outline-none focus:border-[var(--text)] transition-colors" />
 </div>
 
 <div className="pt-4 border-t-[0.5px] border-[var(--border)] flex justify-end gap-3">
 <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-full text-sm font-bold text-[var(--text3)] hover:bg-[var(--bg3)] transition-colors">
 Cancel
 </button>
 <button disabled={submitting} className="rounded-full bg-[var(--text)] px-8 py-3 text-sm font-black text-[var(--bg)] disabled:opacity-50 hover:scale-105 transition-all flex items-center gap-2">
 {submitting ? 'Submitting...' : <>Submit Application <ArrowRight className="w-4 h-4" /></>}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
