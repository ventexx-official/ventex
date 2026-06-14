"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Rocket, LineChart, ShoppingBag, Eye } from 'lucide-react';

type Role = 'founder' | 'investor' | 'buyer' | 'visitor' | null;

export default function RoleSelection() {
  const router = useRouter();
  const [role, setRole] = useState<Role>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);
      
      const { data: profile } = await supabase
        .from('users')
        .select('role, onboarding_completed')
        .eq('id', session.user.id)
        .single();
      
      if (profile?.onboarding_completed && profile?.role !== 'visitor') {
        router.push('/');
        return;
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  const handleComplete = async () => {
    if (!userId || !role) return;
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('users')
        .upsert({ id: userId, role: role });

      if (error) throw error;

      switch (role) {
        case 'founder': return router.push('/onboarding/founder');
        case 'investor': return router.push('/onboarding/investor');
        case 'buyer': return router.push('/onboarding/buyer');
        case 'visitor': return router.push('/onboarding/visitor');
      }
    } catch (err: any) {
      console.error('Error setting role:', err);
      alert('An error occurred: ' + (err.message || 'Unknown error'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[#222222] dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[640px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-[var(--text)] mb-8">
          What brings you to Ventexx?
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button onClick={() => setRole('founder')} className={`p-6 bg-[var(--card-bg)] rounded-[16px] text-left transition-all ${role === 'founder' ? 'border-2 border-[#222222] dark:border-white shadow-sm ring-1 ring-black dark:ring-white ring-opacity-5' : 'border-[0.5px] border-[var(--border)] hover:border-gray-400 dark:hover:border-gray-500'}`}>
            <Rocket className={`w-8 h-8 mb-4 ${role === 'founder' ? 'text-[var(--text)] ' : 'text-[var(--text2)]'}`} />
            <h3 className="font-bold text-lg text-[var(--text)] mb-1">I'm a founder</h3>
            <p className="text-sm text-[var(--text2)]">pitch investors</p>
          </button>

          <button onClick={() => setRole('investor')} className={`p-6 bg-[var(--card-bg)] rounded-[16px] text-left transition-all ${role === 'investor' ? 'border-2 border-[#222222] dark:border-white shadow-sm ring-1 ring-black dark:ring-white ring-opacity-5' : 'border-[0.5px] border-[var(--border)] hover:border-gray-400 dark:hover:border-gray-500'}`}>
            <LineChart className={`w-8 h-8 mb-4 ${role === 'investor' ? 'text-[var(--text)] ' : 'text-[var(--text2)]'}`} />
            <h3 className="font-bold text-lg text-[var(--text)] mb-1">I'm an investor</h3>
            <p className="text-sm text-[var(--text2)]">fund startups</p>
          </button>

          <button onClick={() => setRole('buyer')} className={`p-6 bg-[var(--card-bg)] rounded-[16px] text-left transition-all ${role === 'buyer' ? 'border-2 border-[#222222] dark:border-white shadow-sm ring-1 ring-black dark:ring-white ring-opacity-5' : 'border-[0.5px] border-[var(--border)] hover:border-gray-400 dark:hover:border-gray-500'}`}>
            <ShoppingBag className={`w-8 h-8 mb-4 ${role === 'buyer' ? 'text-[var(--text)] ' : 'text-[var(--text2)]'}`} />
            <h3 className="font-bold text-lg text-[var(--text)] mb-1">I'm a buyer</h3>
            <p className="text-sm text-[var(--text2)]">buy products</p>
          </button>

          <button onClick={() => setRole('visitor')} className={`p-6 bg-[var(--card-bg)] rounded-[16px] text-left transition-all ${role === 'visitor' ? 'border-2 border-[#222222] dark:border-white shadow-sm ring-1 ring-black dark:ring-white ring-opacity-5' : 'border-[0.5px] border-[var(--border)] hover:border-gray-400 dark:hover:border-gray-500'}`}>
            <Eye className={`w-8 h-8 mb-4 ${role === 'visitor' ? 'text-[var(--text)] ' : 'text-[var(--text2)]'}`} />
            <h3 className="font-bold text-lg text-[var(--text)] mb-1">Just exploring</h3>
            <p className="text-sm text-[var(--text2)]">just exploring</p>
          </button>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleComplete}
            disabled={!role || submitting}
            className="bg-[var(--text)] text-[var(--bg)] px-8 py-3 rounded-md font-bold hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
