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
        .select('role, onboarding_complete, display_name, country')
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
          router.replace('/onboarding/explorer');
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
        <span className="text-[10px] font-mono tracking-widest text-[var(--smoke)] uppercase">
          [ STEP 1 OF SETUP ]
        </span>
      </header>

      {/* MAIN CONTENT */}
      <main className="page-padding py-12 md:py-16 flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
        <div className="mb-8 md:mb-10 text-center max-w-xl mx-auto">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-3">
            {'//'} ACCOUNT PERSONALIZATION
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-[var(--paper)] uppercase mb-3">
            Choose your path
          </h1>
          <p className="text-sm font-mono text-[var(--paper-dim)]">
            Select the role that fits you best. Your choice sets up your workspace and can be refined later in settings.
          </p>
        </div>

        {error && (
          <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl bg-[var(--red)]/10 border border-[var(--red)]/20 text-xs font-mono text-[var(--paper)] flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-[var(--red)] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 PLAIN CARDS + MENTOR COMING SOON */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between min-h-[160px] ${
                  isSelected
                    ? 'bg-[var(--card)] border-[var(--red)] shadow-[0_0_20px_rgba(214,69,59,0.25)] ring-1 ring-[var(--red)]'
                    : 'bg-[var(--card)]/60 border-[var(--line)] hover:border-[var(--line-strong)] hover:bg-[var(--card)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)]">
                      {role.tag}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-[var(--red)] bg-[var(--red)] text-white'
                          : 'border-[var(--line)] bg-[var(--ink)]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-medium text-[var(--paper)] uppercase mb-1 flex items-center gap-2">
                    <Icon className="w-5 h-5 text-[var(--paper-dim)]" />
                    {role.title}
                  </h3>
                  <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </button>
            );
          })}

          {/* 5TH CARD: MENTOR - DISABLED */}
          <div
            className="p-6 rounded-2xl border border-[var(--line)]/40 bg-[var(--card)]/20 text-left relative flex flex-col justify-between min-h-[160px] opacity-40 cursor-not-allowed md:col-span-2"
            aria-disabled="true"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--smoke)]">
                  ADVISORY & GUIDANCE
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-[var(--line)] text-[var(--smoke)] uppercase">
                  Coming Soon
                </span>
              </div>
              <h3 className="font-display text-xl font-medium text-[var(--smoke)] uppercase mb-1 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[var(--smoke)]" />
                Mentor
              </h3>
              <p className="text-xs font-mono text-[var(--smoke)] leading-relaxed">
                Offer strategic advice, office hours, and review early pitches.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION */}
        <div className="mt-8 text-center max-w-sm mx-auto w-full">
          <button
            type="button"
            disabled={!selectedRole || loading}
            onClick={handleContinue}
            className={`w-full py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              selectedRole && !loading
                ? 'bg-[var(--red)] text-[var(--paper)] hover:bg-[#ed594d] cursor-pointer shadow-lg'
                : 'bg-[var(--line)] text-[var(--smoke)] cursor-not-allowed opacity-50'
            }`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving selection...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowUpRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="page-padding py-6 border-t border-[var(--line)] text-center">
        <p className="text-[11px] font-mono text-[var(--smoke)]">
          Need assistance choosing? Contact support at hello@ventexx.com
        </p>
      </footer>
    </div>
  );
}
