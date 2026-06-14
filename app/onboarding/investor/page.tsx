"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Briefcase, GraduationCap, Users } from 'lucide-react';

export default function InvestorTypeSelection() {
  const router = useRouter();
  const [type, setType] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return router.push('/login');
      setUserId(session.user.id);
    });
  }, [router]);

  const handleNext = async () => {
    if (!type || !userId) return;
    await supabase.from('users').update({ investor_type: type }).eq('id', userId);
    
    if (type === 'investor') router.push('/onboarding/investor/details');
    else if (type === 'mentor') router.push('/onboarding/investor/mentor/details');
    else router.push('/onboarding/investor/investor-mentor/details');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-[700px]">
        <h1 className="text-3xl font-bold text-center text-[var(--text)] mb-8">How will you participate?</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button onClick={() => setType('investor')} className={`p-6 bg-[var(--card-bg)] rounded-[16px] text-left transition-all ${type === 'investor' ? 'border-2 border-[#222222] dark:border-white' : 'border-[0.5px] border-[var(--border)]'}`}>
            <Briefcase className="w-8 h-8 mb-4 text-[var(--text)]" />
            <h3 className="font-bold text-lg text-[var(--text)] mb-1">Investor Only</h3>
            <p className="text-sm text-[var(--text2)]">Fund startups</p>
          </button>
          <button onClick={() => setType('investor_mentor')} className={`p-6 bg-[var(--card-bg)] rounded-[16px] text-left transition-all ${type === 'investor_mentor' ? 'border-2 border-[#222222] dark:border-white' : 'border-[0.5px] border-[var(--border)]'}`}>
            <Users className="w-8 h-8 mb-4 text-[var(--text)]" />
            <h3 className="font-bold text-lg text-[var(--text)] mb-1">Investor + Mentor</h3>
            <p className="text-sm text-[var(--text2)]">Fund and guide</p>
          </button>
          <button onClick={() => setType('mentor')} className={`p-6 bg-[var(--card-bg)] rounded-[16px] text-left transition-all ${type === 'mentor' ? 'border-2 border-[#222222] dark:border-white' : 'border-[0.5px] border-[var(--border)]'}`}>
            <GraduationCap className="w-8 h-8 mb-4 text-[var(--text)]" />
            <h3 className="font-bold text-lg text-[var(--text)] mb-1">Mentor Only</h3>
            <p className="text-sm text-[var(--text2)]">Share expertise</p>
          </button>
        </div>
        <div className="flex justify-end">
          <button disabled={!type} onClick={handleNext} className="bg-[var(--text)] text-[var(--bg)] px-8 py-3 rounded-md font-bold disabled:opacity-50">Continue &rarr;</button>
        </div>
      </div>
    </div>
  );
}
