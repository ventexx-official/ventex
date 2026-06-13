"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function FounderGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'admin' || profile?.role === 'founder') {
        if (mounted) setAuthorized(true);
      } else if (profile?.role === 'investor') {
        if (mounted) router.replace('/investor/portal');
      } else {
        if (mounted) router.replace('/dashboard');
      }
    };
    checkRole();
    return () => { mounted = false; };
  }, [router]);

  if (!authorized) return <div className="min-h-screen bg-[var(--bg)]" />; // Loading state

  return <>{children}</>;
}
