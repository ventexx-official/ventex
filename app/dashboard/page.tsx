"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const next =
        profile?.role === 'admin'
          ? '/admin/users'
          : profile?.role === 'investor'
            ? '/investor/portal'
            : '/founder/dashboard';

      router.replace(next);
    };
    run();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F2F2F0] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin" />
    </div>
  );
}

