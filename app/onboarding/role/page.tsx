"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { getSignedInDestination } from '@/lib/role-routing';
import { Rocket, LineChart, ShoppingBag, Compass, GraduationCap, ArrowUpRight, AlertCircle, Check } from 'lucide-react';

interface RoleOption {
  id: 'founder' | 'investor' | 'buyer' | 'visitor';
  tag: string;
  title: string;
  description: string;
  icon: any;
  disabled?: boolean;
}

const ROLES: RoleOption[] = [
  {
    id: 'founder',
    tag: 'BUILD & RAISE',
    title: 'Founder',
    description: 'I have an idea or startup to build and pitch',
    icon: Rocket,
  },
  {
    id: 'investor',
    tag: 'CAPITAL & SYNDICATE',
    title: 'Investor',
    description: 'I want to discover and fund early ideas',
    icon: LineChart,
  },
  {
    id: 'buyer',
    tag: 'PRODUCTS & ASSETS',
    title: 'Buyer',
    description: 'I want to buy products from founders',
    icon: ShoppingBag,
  },
  {
    id: 'visitor',
    tag: 'LOOKING AROUND',
    title: 'Explorer',
    description: 'Just looking around',
    icon: Compass,
  },
];

export default function RoleSelectionPage() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'founder' | 'investor' | 'buyer' | 'visitor' | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_complete')
        .eq('id', session.user.id)
        .single();

      // If user has already completed onboarding, never let them see role picker again
      if (profile?.onboarding_complete) {
        if (mounted) router.replace(getSignedInDestination(profile));
        return;
      }

      // If user already transitioned away from visitor, do not let them pick again
      if (profile?.role && profile.role !== 'visitor') {
        if (mounted) router.replace(getSignedInDestination(profile));
        return;
      }

      if (mounted) setChecking(false);
    };

    checkUser();
    return () => { mounted = false; };
  }, [router]);

  const handleContinue = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      // If Explorer was selected, role stays "visitor"
      const targetRole = selectedRole === 'visitor' ? 'visitor' : selectedRole;

      // Update role in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: targetRole })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('Failed to update role:', updateError);
        setError('Failed to save your selection. Please try again.');
        setLoading(false);
        return;
      }

      // Route to that role's first onboarding pathway
      router.refresh();
      switch (selectedRole) {
        case 'founder':
          router.replace('/onboarding/founder');
          break;
        case 'investor':
          router.replace('/onboarding/investor');
          break;
        case 'buyer':
          router.replace('/onboarding/buyer');
          break;
        case 'visitor':
          router.replace('/onboarding/visitor');
          break;
      }
    } catch (err: any) {
      console.error('Role update exception:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="inner-page min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--line)] border-t-[var(--red)] rounded-full animate-spin" />
      </div>
    );
  }

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
          ONBOARDING / STEP 1 OF 2
        </span>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-4xl mx-auto w-full page-padding py-12 flex flex-col justify-center">
        <div className="mb-10 text-center max-w-xl mx-auto">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
            {'//'} CHOOSE YOUR PATHWAY
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-medium tracking-tight text-[var(--paper)] uppercase">
            How will you participate?
          </h1>
          <p className="text-xs font-mono text-[var(--paper-dim)] mt-3 leading-relaxed">
            Select the primary focus for your account. This customizes your journey and what you see.
          </p>
        </div>

        {error && (
          <div className="max-w-xl mx-auto w-full bg-red-950/40 border border-red-500/50 text-red-300 p-3.5 rounded-xl text-xs font-mono flex items-start gap-2.5 mb-6">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* 5 CARDS GRID: 4 Selectable, 1 Disabled Coming Soon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`text-left p-6 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between min-h-[190px] ${
                  isSelected
                    ? 'bg-[var(--card)] border-[var(--red)] ring-2 ring-[var(--red)]/40 shadow-xl'
                    : 'bg-[var(--card)]/60 border-[var(--line)] hover:border-[var(--smoke)] hover:bg-[var(--card)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-[var(--ink)] border border-[var(--line)] text-[var(--paper-dim)]">
                      {role.tag}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[var(--red)] text-[var(--paper)]' : 'bg-[var(--ink)] text-[var(--smoke)]'
                    }`}>
                      {isSelected ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-medium uppercase tracking-tight text-[var(--paper)] mb-1">
                    {role.title}
                  </h3>
                  <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Fifth Card: Mentor, Coming Soon */}
          <div
            className="text-left p-6 rounded-3xl border border-[var(--line)]/50 bg-[var(--card)]/20 opacity-60 cursor-not-allowed flex flex-col justify-between min-h-[190px] select-none"
            aria-disabled="true"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-[var(--ink)]/50 border border-[var(--line)]/50 text-[var(--smoke)]">
                  COMING SOON
                </span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--ink)]/50 text-[var(--smoke)]">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-display text-xl font-medium uppercase tracking-tight text-[var(--smoke)] mb-1">
                Mentor
              </h3>
              <p className="text-xs font-mono text-[var(--smoke)] leading-relaxed">
                Advisory, feedback and portfolio guidance. Launching soon.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--smoke)]">
              Not currently selectable
            </span>
          </div>
        </div>

        {/* Note requirement 7 */}
        <p className="text-center text-[11px] font-mono text-[var(--smoke)] max-w-md mx-auto mb-8">
          Your choice sets up your account. You can contact support to change it later.
        </p>

        {/* ACTION BAR (sticky bottom on small screens) */}
        <div className="sticky bottom-0 bg-[var(--ink)]/95 backdrop-blur-md py-4 border-t border-[var(--line)] md:border-none md:static md:bg-transparent flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className="w-full sm:w-auto min-w-[240px] bg-[var(--red)] text-[var(--paper)] py-3.5 px-8 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg min-h-[44px]"
          >
            {loading ? 'Setting up...' : 'Continue to setup'}
            {!loading && <ArrowUpRight className="w-4 h-4" />}
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="page-padding py-6 flex items-center justify-between text-xs font-mono text-[var(--smoke)] border-t border-[var(--line)]">
        <span>© 2026 {brandName}</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-[var(--paper)]">Privacy</Link>
          <Link href="/terms" className="hover:text-[var(--paper)]">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
