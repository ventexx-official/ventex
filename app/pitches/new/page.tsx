"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, ArrowRight, ArrowLeft, X } from 'lucide-react';

export default function PitchWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pitchId = searchParams.get('id');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [pitch, setPitch] = useState({
    id: pitchId, company_name: '', short_description: '', website: '', location: '', sectors: [], business_type: '', product_type: '', stage: '',
    actively_raising: false, round_type: '', amount: '', committed: '', equity: '', security_type: '', use_of_funds: '', close_date: '',
    revenue: '', mrr: '', employees: '', founding_year: '', highlights: '',
    video_url: '', deck_url: '',
    qa_problem: '', qa_solution: '', qa_roadmap: '', qa_gtm: '', qa_moat: '', qa_whynow: ''
  });

  useEffect(() => {
    if (pitchId) {
      supabase.from('pitches').select('*').eq('id', pitchId).single().then(({ data }) => {
        if (data) setPitch(p => ({ ...p, ...data, id: data.id }));
      });
    }
  }, [pitchId]);

  const handleSaveDraft = async () => {
    if (!pitch.id) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from('pitches').insert({ user_id: session.user.id, ...pitch, status: 'draft' }).select('id').single();
      if (data) setPitch(p => ({...p, id: data.id}));
    } else {
      await supabase.from('pitches').update({ ...pitch, status: 'draft' }).eq('id', pitch.id);
    }
  };

  const handleNext = async () => {
    await handleSaveDraft();
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = async () => {
    await handleSaveDraft();
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await supabase.from('pitches').update({ ...pitch, status: 'pending_review' }).eq('id', pitch.id);
    setLoading(false);
    router.push('/dashboard/founder');
  };

  const handleQuit = async () => {
    await handleSaveDraft();
    router.push('/dashboard/founder');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] p-4 flex justify-between items-center bg-[var(--card-bg)]">
        <div className="font-bold text-[var(--text)]">Create Pitch</div>
        <div className="flex gap-2">
          <button onClick={() => setShowQuitModal(true)} className="p-2 hover:bg-red-50 text-red-600 rounded-md"><X className="w-5 h-5"/></button>
        </div>
      </header>

      {showQuitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] p-6 rounded-[16px] max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2 text-[var(--text)]">Save as draft?</h3>
            <p className="text-sm text-[var(--text2)] mb-6">You can resume your pitch setup later from your dashboard.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowQuitModal(false)} className="px-4 py-2 font-bold text-[var(--text2)]">Keep going</button>
              <button onClick={handleQuit} className="px-4 py-2 font-bold bg-[var(--text)] text-[var(--bg)] rounded-md">Yes, quit</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="flex gap-2 mb-8">
          {[1,2,3,4,5].map(s => <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-[var(--text)]' : 'bg-[var(--border)]'}`} />)}
        </div>

        <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[16px] p-6 md:p-10 mb-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6 text-[var(--text)]">Step 1: Company Profile</h2>
              <input placeholder="Company Name" value={pitch.company_name} onChange={e=>setPitch({...pitch, company_name:e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" />
              <textarea placeholder="Short Description" value={pitch.short_description} onChange={e=>setPitch({...pitch, short_description:e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" />
              <input placeholder="Website" value={pitch.website} onChange={e=>setPitch({...pitch, website:e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6 text-[var(--text)]">Step 2: Funding Ask</h2>
              <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={pitch.actively_raising} onChange={e=>setPitch({...pitch, actively_raising:e.target.checked})} /> Actively Raising</label>
              <input placeholder="Round Type (e.g. Seed, Series A)" value={pitch.round_type} onChange={e=>setPitch({...pitch, round_type:e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" />
              <input placeholder="Target Amount" value={pitch.amount} onChange={e=>setPitch({...pitch, amount:e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" />
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6 text-[var(--text)]">Step 3: Traction & Metrics</h2>
              <input placeholder="Annual Revenue" value={pitch.revenue} onChange={e=>setPitch({...pitch, revenue:e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" />
              <input placeholder="Number of Employees" value={pitch.employees} onChange={e=>setPitch({...pitch, employees:e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" />
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6 text-[var(--text)]">Step 4: Materials</h2>
              <input placeholder="Pitch Video URL (YouTube/Vimeo)" value={pitch.video_url} onChange={e=>setPitch({...pitch, video_url:e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" />
              <input placeholder="Pitch Deck PDF URL" value={pitch.deck_url} onChange={e=>setPitch({...pitch, deck_url:e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" />
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6 text-[var(--text)]">Step 5: Q&A</h2>
              <textarea placeholder="The Problem" value={pitch.qa_problem} onChange={e=>setPitch({...pitch, qa_problem:e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" />
              <textarea placeholder="The Solution" value={pitch.qa_solution} onChange={e=>setPitch({...pitch, qa_solution:e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-[var(--bg)]" />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button disabled={step === 1} onClick={handlePrev} className="px-6 py-2.5 rounded-md font-bold text-[var(--text2)] disabled:opacity-50 flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Back</button>
          {step < 5 ? (
            <button onClick={handleNext} className="bg-[var(--text)] text-[var(--bg)] px-6 py-2.5 rounded-md font-bold flex items-center gap-2">Save & Continue <ArrowRight className="w-4 h-4"/></button>
          ) : (
            <button disabled={loading} onClick={handleSubmit} className="bg-[var(--text)] text-[var(--bg)] px-6 py-2.5 rounded-md font-bold">{loading ? 'Submitting...' : 'Submit Pitch for Review'}</button>
          )}
        </div>
      </main>
    </div>
  );
}
