"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getDashboardRoute, getOnboardingRoute } from '@/lib/role-routing';

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
 .select('role, onboarding_completed')
 .eq('id', session.user.id)
 .single();

 const onboardingRoute = getOnboardingRoute(profile?.role, false);
 if (onboardingRoute && (!profile || !profile.role || profile.role === 'visitor' || !profile?.onboarding_completed)) {
   router.replace(onboardingRoute);
   return;
 }

 const next = getDashboardRoute(profile?.role);
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