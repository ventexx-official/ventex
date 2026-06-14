"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function VisitorOnboarding() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
  }, [router]);

  const complete = async () => {
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('users').update({ onboarding_completed: true }).eq('id', session.user.id);
    }
    router.push('/discover');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 text-center">
      <div className="w-full max-w-[400px]">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-4">Welcome to Ventex!</h1>
        <p className="text-[var(--text2)] mb-8">Explore freely. You can upgrade your role anytime from settings.</p>
        <button disabled={submitting} onClick={complete} className="w-full bg-[var(--text)] text-[var(--bg)] py-3 rounded-md font-bold hover:opacity-80">
          Start Exploring
        </button>
      </div>
    </div>
  );
}
