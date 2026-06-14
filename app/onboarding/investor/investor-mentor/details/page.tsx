"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function InvestorMentorDetails() {
  const router = useRouter();
  const [form, setForm] = useState({ fundName: '', thesis: '', mentorshipTerms: '' });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return router.push('/login');
      setUserId(session.user.id);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await supabase.from('users').update({
        onboarding_completed: true,
        investment_thesis: form.thesis,
        mentorship_terms: form.mentorshipTerms,
      }).eq('id', userId);
      router.push('/investor/portal');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[16px] p-8 w-full max-w-[500px]">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Investor + Mentor Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-bold">Fund Name</label><input className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" /></div>
          <div><label className="block text-sm font-bold">Investment Thesis</label><textarea value={form.thesis} onChange={e=>setForm({...form, thesis: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" /></div>
          <div><label className="block text-sm font-bold">Mentorship Terms</label><textarea value={form.mentorshipTerms} onChange={e=>setForm({...form, mentorshipTerms: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" /></div>
          <button className="w-full bg-[var(--text)] text-[var(--bg)] py-2.5 rounded-md font-bold mt-6">Complete Profile</button>
        </form>
      </div>
    </div>
  );
}
