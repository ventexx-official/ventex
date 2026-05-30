"use client";

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, X, Star, Shield, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { emailFor } from '@/lib/site';

const SECTORS = ['Fintech', 'SaaS', 'AI/ML', 'Healthtech', 'Edtech', 'AgriTech', 'Consumer', 'Logistics', 'Other'];

const PLACEHOLDER_PROFILES = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Mentor + Investor',
    sectors: ['SaaS', 'AI/ML'],
    bio: 'Former VP of Eng at Stripe. Angel investor in 14 startups. Can help with architecture and hiring early engineers.',
    offer: 'Review technical architecture and provide intros to seed funds.',
    avatar: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    id: '2',
    name: 'David Kumar',
    role: 'Advisor',
    sectors: ['Healthtech', 'Consumer'],
    bio: '3x Founder (2 exits). Specialized in Go-to-Market strategy and B2B sales motion.',
    offer: '1-on-1 sparring on pricing strategy and sales playbook.',
    avatar: 'https://i.pravatar.cc/150?u=david'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    role: 'Investor',
    sectors: ['Fintech', 'Logistics'],
    bio: 'Partner at early-stage syndicate. Looking for hard tech and fintech infrastructure.',
    offer: 'Can lead pre-seed rounds up to $250k.',
    avatar: 'https://i.pravatar.cc/150?u=elena'
  }
];

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
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[#222222] dark:text-white max-w-4xl">
            Guide founders from idea to traction.
          </h1>
          <p className="max-w-2xl text-base md:text-lg font-medium leading-relaxed text-[#666666] dark:text-[#a0a0a0]">
            Ventex Catalysts are mentors and investors who help founders sharpen products, close early customers, and prepare for funding. Join the network to give back and spot breakout startups early.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-8 py-3.5 rounded-full text-sm font-bold transition-all hover:scale-105"
            >
              Apply to Catalyst
            </button>
            <Link 
              href="/investors" 
              className="bg-white dark:bg-[#1a1a1a] text-[#222222] dark:text-white border-[0.5px] border-[#e5e5e5] dark:border-[#333333] px-8 py-3.5 rounded-full text-sm font-bold transition-colors hover:bg-gray-50 dark:hover:bg-[#222222]"
            >
              View investor network
            </Link>
          </div>
        </header>

        <section className="py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight text-[#222222] dark:text-white">Featured Catalysts</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PLACEHOLDER_PROFILES.map((profile) => (
              <div key={profile.id} className="bg-white dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] p-6 flex flex-col hover:shadow-xl transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <img src={profile.avatar} alt={profile.name} className="w-16 h-16 rounded-full border-[0.5px] border-[#e5e5e5] dark:border-[#333333]" />
                  <div>
                    <h3 className="font-bold text-[#222222] dark:text-white text-lg flex items-center gap-1">
                      {profile.name} <Shield className="w-4 h-4 text-emerald-500" />
                    </h3>
                    <p className="text-[#888888] text-sm font-bold">{profile.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.sectors.map(sector => (
                    <span key={sector} className="bg-[#F2F2F0] dark:bg-[#333333] text-[#222222] dark:text-white px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                      {sector}
                    </span>
                  ))}
                </div>
                <p className="text-[#666666] dark:text-[#a0a0a0] text-sm leading-relaxed mb-4 flex-grow">
                  {profile.bio}
                </p>
                <div className="border-t-[0.5px] border-[#e5e5e5] dark:border-[#333333] pt-4 mt-auto">
                  <p className="text-[#222222] dark:text-white text-xs font-bold mb-1 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Offers:
                  </p>
                  <p className="text-[#888888] text-xs leading-relaxed">{profile.offer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#111111] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-5 border-b-[0.5px] border-[#e5e5e5] dark:border-[#333333] flex justify-between items-center bg-[#F8F8F8] dark:bg-[#1a1a1a]">
                <h2 className="text-xl font-black tracking-tight text-[#222222] dark:text-white">Apply to Ventex Catalyst</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#e5e5e5] dark:hover:bg-[#333333] rounded-full transition-colors">
                  <X className="w-5 h-5 text-[#888888]" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form onSubmit={submit} className="space-y-5">
                  {error ? <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border-[0.5px] border-red-200 dark:border-red-800 p-4 text-sm font-bold text-red-700 dark:text-red-400">{error}</div> : null}
                  {message ? <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border-[0.5px] border-emerald-200 dark:border-emerald-800 p-4 text-sm font-bold text-emerald-700 dark:text-emerald-400">{message}</div> : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-black uppercase text-[#888888] mb-2 block">Full Name</label>
                      <input required value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="John Doe" className="w-full rounded-xl border border-[#e5e5e5] dark:border-[#333333] bg-white dark:bg-[#1a1a1a] px-4 py-3 text-sm font-bold text-[#222222] dark:text-white outline-none focus:border-[#222222] dark:focus:border-white transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase text-[#888888] mb-2 block">Email</label>
                      <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="john@example.com" className="w-full rounded-xl border border-[#e5e5e5] dark:border-[#333333] bg-white dark:bg-[#1a1a1a] px-4 py-3 text-sm font-bold text-[#222222] dark:text-white outline-none focus:border-[#222222] dark:focus:border-white transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-[#888888] mb-2 block">Role</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['Mentor', 'Investor', 'Mentor + Investor'].map((role) => (
                        <label key={role} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-[1.5px] p-3 text-xs font-black transition-colors ${form.role === role ? 'border-[#222222] dark:border-white bg-[#F8F8F8] dark:bg-[#222222] text-[#222222] dark:text-white' : 'border-[#e5e5e5] dark:border-[#333333] text-[#888888] hover:border-[#cccccc] dark:hover:border-[#555555]'}`}>
                          <input type="radio" className="hidden" checked={form.role === role} onChange={() => setForm((p) => ({ ...p, role }))} />
                          {role}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-[#888888] mb-2 block">Sector Expertise</label>
                    <div className="flex flex-wrap gap-2">
                      {SECTORS.map((sector) => (
                        <button type="button" key={sector} onClick={() => toggleSector(sector)} className={`rounded-full border-[1.5px] px-3 py-1.5 text-xs font-black transition-colors ${form.sectorExpertise.includes(sector) ? 'border-[#222222] dark:border-white bg-[#222222] dark:bg-white text-white dark:text-[#222222]' : 'border-[#e5e5e5] dark:border-[#333333] bg-transparent text-[#888888] hover:border-[#cccccc] dark:hover:border-[#555555]'}`}>
                          {sector}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-[#888888] mb-2 block">LinkedIn URL</label>
                    <input required value={form.linkedIn} onChange={(e) => setForm((p) => ({ ...p, linkedIn: e.target.value }))} placeholder="https://linkedin.com/in/username" className="w-full rounded-xl border border-[#e5e5e5] dark:border-[#333333] bg-white dark:bg-[#1a1a1a] px-4 py-3 text-sm font-bold text-[#222222] dark:text-white outline-none focus:border-[#222222] dark:focus:border-white transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-[#888888] mb-2 block">Brief Bio</label>
                    <textarea required maxLength={300} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Summarize your background (300 chars max)" rows={3} className="w-full resize-none rounded-xl border border-[#e5e5e5] dark:border-[#333333] bg-white dark:bg-[#1a1a1a] px-4 py-3 text-sm font-bold text-[#222222] dark:text-white outline-none focus:border-[#222222] dark:focus:border-white transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-[#888888] mb-2 block">What You Offer</label>
                    <textarea required maxLength={500} value={form.offer} onChange={(e) => setForm((p) => ({ ...p, offer: e.target.value }))} placeholder="How can you help founders? (500 chars max)" rows={3} className="w-full resize-none rounded-xl border border-[#e5e5e5] dark:border-[#333333] bg-white dark:bg-[#1a1a1a] px-4 py-3 text-sm font-bold text-[#222222] dark:text-white outline-none focus:border-[#222222] dark:focus:border-white transition-colors" />
                  </div>
                  
                  <div className="pt-4 border-t-[0.5px] border-[#e5e5e5] dark:border-[#333333] flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-full text-sm font-bold text-[#888888] hover:bg-[#F2F2F0] dark:hover:bg-[#333333] transition-colors">
                      Cancel
                    </button>
                    <button disabled={submitting} className="rounded-full bg-[#222222] dark:bg-white px-8 py-3 text-sm font-black text-white dark:text-[#222222] disabled:opacity-50 hover:bg-black dark:hover:bg-gray-200 transition-colors flex items-center gap-2">
                      {submitting ? 'Submitting...' : <>Submit Application <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
