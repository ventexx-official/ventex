"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { Rocket, LineChart, ShoppingBag, Compass, ArrowUpRight } from 'lucide-react';

type Role = 'founder' | 'investor' | 'buyer' | 'visitor' | null;

export default function RoleSelection() {
  const brandName = SITE_NAME.toUpperCase();
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
        .from('profiles')
        .select('role, onboarding_complete')
        .eq('id', session.user.id)
        .single();
      
      if (profile?.onboarding_complete && profile?.role && profile.role !== 'visitor') {
        router.push('/dashboard');
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
        .from('profiles')
        .update({ role: role })
        .eq('id', userId);

      if (error) throw error;

      router.refresh();
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
      <div className="inner-page min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--line)] border-t-[var(--red)] rounded-full animate-spin"></div>
      </div>
    );
  }

  const roleOptions = [
    {
      id: 'founder' as Role,
      icon: Rocket,
      title: "I'm a founder",
      subtitle: "Pitch to verified investors and list products",
      tag: "BUILD & RAISE",
    },
    {
      id: 'investor' as Role,
      icon: LineChart,
      title: "I'm an investor",
      subtitle: "Discover high-signal startups and connect directly",
      tag: "ALLOCATE & BACK",
    },
    {
      id: 'buyer' as Role,
      icon: ShoppingBag,
      title: "I'm a buyer",
      subtitle: "Acquire software, tools, and digital assets",
      tag: "SOURCE & BUY",
    },
    {
      id: 'visitor' as Role,
      icon: Compass,
      title: "I'm exploring",
      subtitle: "Browse published pitches and platform updates",
      tag: "OBSERVE & LEARN",
    },
  ];

  return (
    <div className="inner-page min-h-screen flex flex-col justify-between">
      {/* HEADER */}
      <header className="page-padding py-8 flex items-center justify-between border-b border-[var(--line)]">
        <Link href="/" className="brand-lockup" aria-label={`${brandName} home`}>
          <span className="brand-mark">
            <span>{brandName.charAt(0)}</span>
          </span>
          <span>{brandName}</span>
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--smoke)]">
          ONBOARDING / 2026
        </span>
      </header>

      {/* ROLE PICKER BODY */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 my-10 flex flex-col justify-center">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
            {'//'} ROLE SELECTION
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-[var(--paper)] uppercase">
            Choose your path
          </h1>
          <p className="text-xs md:text-sm font-mono text-[var(--paper-dim)] mt-3">
            Select how you plan to participate in the {brandName} network.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = role === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setRole(opt.id)}
                type="button"
                className={`p-6 md:p-8 rounded-3xl text-left transition-all cursor-pointer border relative group ${
                  isSelected
                    ? "bg-[var(--card)] border-[var(--red)] shadow-2xl ring-1 ring-[var(--red)]"
                    : "bg-[rgba(16,16,15,0.4)] border-[var(--line)] hover:border-[var(--border2)] hover:bg-[var(--card)]"
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    isSelected ? "bg-[var(--red)] text-[var(--paper)]" : "bg-[var(--ink)] text-[var(--smoke)] group-hover:text-[var(--paper)]"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[9px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full border ${
                    isSelected
                      ? "border-[var(--red)] text-[var(--red)] bg-[rgba(214,69,59,0.1)]"
                      : "border-[var(--line)] text-[var(--smoke)]"
                  }`}>
                    {opt.tag}
                  </span>
                </div>
                <h3 className="font-display text-xl uppercase tracking-tight text-[var(--paper)] mb-1">
                  {opt.title}
                </h3>
                <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed">
                  {opt.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleComplete}
            disabled={!role || submitting}
            className="w-full max-w-sm bg-[var(--red)] text-[var(--paper)] py-4 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            {submitting ? 'Setting up profile...' : 'Continue to next step'}
            {!submitting && <ArrowUpRight className="w-4 h-4" />}
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="page-padding py-6 flex items-center justify-between text-xs font-mono text-[var(--smoke)] border-t border-[var(--line)]">
        <span>© 2026 {brandName}</span>
        <span>STEP 1 OF ONBOARDING</span>
      </footer>
    </div>
  );
}
