"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
 const router = useRouter();
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 // With @supabase/supabase-js, hash fragments like access_token are automatically parsed 
 // and the session is set. We just need to check the session and redirect.
 const checkSessionAndRedirect = async () => {
 try {
 // Handle PKCE code exchange for OAuth providers
 const searchParams = new URLSearchParams(window.location.search);
 const code = searchParams.get('code');
 
 if (code) {
 const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
 if (exchangeError) throw exchangeError;
 }

 const { data: { session }, error: sessionError } = await supabase.auth.getSession();
 
 if (sessionError) throw sessionError;
 
 if (session?.user) {
 // Check role to determine routing
 const { data: profile } = await supabase
 .from('users')
 .select('role')
 .eq('id', session.user.id)
 .single();
 
 if (!profile || profile.role === 'visitor') {
 router.push('/onboarding');
 } else if (profile.role === 'founder') {
 router.push('/founder/dashboard');
 } else {
 router.push('/discover');
 }
 } else {
 // If no session after a short wait, something failed (e.g. invalid link)
 // Wait briefly for auth state to settle before failing
 setTimeout(async () => {
 const { data: delayedData } = await supabase.auth.getSession();
 if (!delayedData.session) {
 setError("Authentication failed or link expired. Please try logging in again.");
 }
 }, 2000);
 }
 } catch (err: any) {
 setError(err.message || 'An error occurred during authentication.');
 }
 };

 checkSessionAndRedirect();
 }, [router]);

 return (
 <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4">
 {error ? (
 <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[16px] p-8 w-full max-w-[400px] text-center shadow-sm">
 <h1 className="text-xl font-bold text-red-600 mb-2">Auth Error</h1>
 <p className="text-sm text-[var(--text2)] mb-6">{error}</p>
 <button 
 onClick={() => router.push('/login')}
 className="bg-[var(--text)] text-[var(--bg)] px-6 py-2 rounded-full font-medium"
 >
 Return to login
 </button>
 </div>
 ) : (
 <div className="flex flex-col items-center">
 <div className="w-12 h-12 border-4 border-[var(--border)] border-t-[#222222] dark:border-t-white rounded-full animate-spin mb-4"></div>
 <p className="text-[var(--text2)] text-sm font-medium">Authenticating...</p>
 </div>
 )}
 </div>
 );
}
