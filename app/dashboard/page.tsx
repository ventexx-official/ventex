"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSignedInDestination, sanitizeNextUrl } from '@/lib/role-routing';

function DashboardRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get('next');
  const safeNext = sanitizeNextUrl(rawNext);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (mounted) router.replace('/login');
        return;
      }

      if (safeNext && mounted) {
        router.replace(safeNext);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_complete')
        .eq('id', session.user.id)
        .single();

      if (mounted) {
        const dest = getSignedInDestination(profile);
        router.replace(dest);
      }
    };
    run();
    return () => { mounted = false; };
  }, [router, safeNext]);

  return (
    <div className="min-h-screen bg-[var(--ink)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--line)] border-t-[var(--red)] rounded-full animate-spin" />
    </div>
  );
}

export default function DashboardRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--ink)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--line)] border-t-[var(--red)] rounded-full animate-spin" />
      </div>
    }>
      <DashboardRedirectInner />
    </Suspense>
  );
}
