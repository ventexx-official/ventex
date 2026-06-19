"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('role, onboarding_completed, is_admin')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.is_admin) {
            return router.push('/admin');
          }

          if (!profile || !profile.role || profile.role === 'visitor') {
            if (!profile?.onboarding_completed) {
              return router.push('/onboarding/role');
            }
          }

          if (!profile?.onboarding_completed) {
             return router.push(`/onboarding/${profile.role}`);
          }
          
          switch (profile.role) {
            case 'founder': return router.push('/founder/dashboard');
            case 'investor': return router.push('/discover');
            case 'buyer': return router.push('/marketplace');
            case 'visitor': return router.push('/discover');
            case 'explorer': return router.push('/discover');
            default: return router.push('/onboarding/role');
          }
        } else {
          setTimeout(async () => {
            const { data: delayedData } = await supabase.auth.getSession();
            if (!delayedData.session) {
              setError("Authentication failed. Please try logging in again.");
            }
          }, 2000);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
      }
    };

    checkSessionAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
      {error ? (
        <div className="bg-[var(--card-bg)] border-[0.5px] rounded-[16px] p-8 max-w-[400px] text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.push('/login')} className="bg-[var(--text)] text-[var(--bg)] px-6 py-2 rounded-full">Return to login</button>
        </div>
      ) : (
        <div className="w-8 h-8 border-2 border-t-[#222] rounded-full animate-spin"></div>
      )}
    </div>
  );
}
