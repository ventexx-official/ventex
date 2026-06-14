"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const SECTORS = ['SaaS', 'Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'AI/ML', 'Deeptech', 'Other'];

export default function FounderOnboarding() {
  const router = useRouter();
  const [form, setForm] = useState({ startupName: '', description: '', sector: '', whatsapp: '' });
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
      // Create an empty pitch draft to store the startup name and description
      const { data: pitch, error: pitchErr } = await supabase.from('pitches').insert({
        user_id: userId,
        company_name: form.startupName,
        short_description: form.description,
        status: 'draft'
      }).select('id').single();

      if (pitchErr) throw pitchErr;

      // Update user profile
      const { error: userErr } = await supabase.from('users').update({
        onboarding_completed: true,
        whatsapp: form.whatsapp
      }).eq('id', userId);

      if (userErr) throw userErr;

      // Ensure they go to /pitches/new first time
      router.push('/pitches/new?id=' + pitch.id);
    } catch (err: any) {
      alert('Error: ' + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[16px] p-8 w-full max-w-[500px]">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Founder Profile</h1>
        <p className="text-sm text-[var(--text2)] mb-8">Tell us about your startup to get started.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[var(--text)] mb-1">Startup Name</label>
            <input required type="text" value={form.startupName} onChange={e => setForm({...form, startupName: e.target.value})} className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--text)] mb-1">Short Description</label>
            <textarea required maxLength={200} rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" placeholder="Max 200 characters" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--text)] mb-1">Sector</label>
            <select required value={form.sector} onChange={e => setForm({...form, sector: e.target.value})} className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]">
              <option value="">Select sector...</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--text)] mb-1">WhatsApp Number</label>
            <input required type="tel" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" placeholder="+1234567890" />
            <p className="text-xs text-[var(--text3)] mt-1">Required for investors to contact you.</p>
          </div>

          <button disabled={submitting} type="submit" className="w-full bg-[var(--text)] text-[var(--bg)] py-2.5 rounded-md font-bold hover:opacity-80 transition-colors mt-6">
            {submitting ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
