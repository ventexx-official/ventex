"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getSignedInDestination } from '@/lib/role-routing';

export default function InvestorGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) router.replace('/login?next=/investor/portal');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_complete')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'admin' || profile?.role === 'investor') {
        if (mounted) setAuthorized(true);
      } else {
        if (mounted) router.replace(getSignedInDestination(profile));
      }
    };
    checkRole();
    return () => { mounted = false; };
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[var(--ink)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--line)] border-t-[var(--red)] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
