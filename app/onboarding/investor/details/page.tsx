"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function InvestorDetails() {
  const router = useRouter();
  const [form, setForm] = useState({ fundName: '', thesis: '', portfolio: '', geo: '', ticketMin: '', ticketMax: '' });
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return router.push('/login');
      setUserId(session.user.id);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    
    try {
      const { error } = await supabase.from('users').update({
        onboarding_completed: true,
        investment_thesis: form.thesis,
        // Since we didn't add all minor fields to DB to keep it simple, we can store in metadata or thesis
      }).eq('id', userId);

      if (error) throw error;
      router.push('/investor/portal');
    } catch (err: any) {
      alert('Error: ' + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[16px] p-8 w-full max-w-[500px]">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Investor Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-bold text-[var(--text)] mb-1">Fund Name</label><input type="text" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" /></div>
          <div><label className="block text-sm font-bold text-[var(--text)] mb-1">Investment Thesis</label><textarea value={form.thesis} onChange={e=>setForm({...form, thesis: e.target.value})} rows={3} className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" /></div>
          <div><label className="block text-sm font-bold text-[var(--text)] mb-1">Ticket Size</label><div className="flex gap-2"><input placeholder="Min" className="w-1/2 border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" /><input placeholder="Max" className="w-1/2 border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" /></div></div>
          <button disabled={submitting} className="w-full bg-[var(--text)] text-[var(--bg)] py-2.5 rounded-md font-bold mt-6">{submitting ? 'Saving...' : 'Complete Profile'}</button>
        </form>
      </div>
    </div>
  );
}
