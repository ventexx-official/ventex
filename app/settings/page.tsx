"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SettingsRedirectPage() {
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
 ? '/investor/settings'
 : profile?.role === 'buyer'
 ? '/buyer/settings'
 : '/founder/settings';
 router.replace(next);
 };
 run();
 }, [router]);

 return (
 <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
 <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[#222222] rounded-full animate-spin" />
 </div>
 );
}
