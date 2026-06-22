"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';

export default function Signup() {
 const router = useRouter();
 const [fullName, setFullName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);
 const [loading, setLoading] = useState(false);

 // Listen for the auth session being established in ANY tab (including the email confirmation tab).
 // When the user clicks the email link, the new tab confirms the email and sets the session in
 // localStorage. Supabase syncs this automatically across tabs, firing SIGNED_IN here in the
 // original tab — so the user gets redirected without needing to do anything.
 useEffect(() => {
   if (!success) return;

   const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        // Session confirmed — redirect through the auth pathway
        router.push('/dashboard');
      }
   });

   return () => subscription.unsubscribe();
 }, [success, router]);

 const handleSignup = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);

 if (!fullName || !email || !password || !confirmPassword) {
 setError('All fields are required.');
 return;
 }

 if (password !== confirmPassword) {
 setError('Passwords do not match.');
 return;
 }

 setLoading(true);
 const { error: signUpError } = await supabase.auth.signUp({
 email,
 password,
 options: {
 data: {
 full_name: fullName,
 },
 emailRedirectTo: `${window.location.origin}/api/auth/callback`,
 },
 });

 if (signUpError) {
 setError(signUpError.message);
 } else {
 setSuccess(true);
 }
 setLoading(false);
 };

 const handleGoogleAuth = async () => {
 const { error } = await supabase.auth.signInWithOAuth({
 provider: 'google',
 options: {
 redirectTo: `${window.location.origin}/api/auth/callback`,
 },
 });
 if (error) setError(error.message);
 };

 return (
 <div className="relative min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
 <div className="absolute right-4 top-4">
 <ThemeToggle />
 </div>
 <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[16px] p-8 w-full max-w-[400px] shadow-sm">
 <div className="text-center mb-8">
 <Link href="/" className="text-2xl font-black italic tracking-tighter text-[var(--text)] uppercase">
 Ventex
 </Link>
 <h1 className="text-xl font-bold mt-4 text-[var(--text)] ">Create an account</h1>
 <p className="text-sm text-[var(--text2)] mt-2">Join Ventex to discover, fund, or sell startups.</p>
 <div className="mt-4 rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg)] p-3 text-left text-xs leading-5 text-[var(--text2)] dark:bg-[var(--bg3)] ">
 <strong className="text-[var(--text)] ">Investor verification:</strong> Ventex conducts identity verification for all investor accounts. You will be asked to complete KYC before accessing founder contact details or data rooms.
 </div>
 </div>

 {success ? (
 <div className="bg-[var(--bg)] p-6 rounded-xl text-center space-y-3">
   <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
     <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
     </svg>
   </div>
   <h3 className="font-bold text-[var(--text)]">Check your email</h3>
   <p className="text-sm text-[var(--text2)]">
     We&apos;ve sent a verification link to <strong className="text-[var(--text)]">{email}</strong>.
     Click it to confirm your account — this page will automatically open your account once confirmed.
   </p>
   <div className="flex items-center justify-center gap-2 text-xs text-[var(--text2)] pt-2">
     <div className="w-3 h-3 border-2 border-t-transparent border-[var(--text2)] rounded-full animate-spin"></div>
     Waiting for confirmation...
   </div>
 </div>
 ) : (
 <form onSubmit={handleSignup} className="space-y-4">
 {error && (
 <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm border-[0.5px] border-red-200 dark:border-red-800">
 {error}
 </div>
 )}
 
 <div>
 <label htmlFor="signup-full-name" className="block text-sm font-bold text-[var(--text)] mb-1.5">Full Name</label>
 <input
 id="signup-full-name"
 type="text"
 className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white"
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 />
 </div>
 
 <div>
 <label htmlFor="signup-email" className="block text-sm font-bold text-[var(--text)] mb-1.5">Email address</label>
 <input
 id="signup-email"
 type="email"
 className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 />
 </div>

 <div>
 <label htmlFor="signup-password" className="block text-sm font-bold text-[var(--text)] mb-1.5">Password</label>
 <input
 id="signup-password"
 type="password"
 className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 />
 </div>

 <div>
 <label htmlFor="signup-confirm-password" className="block text-sm font-bold text-[var(--text)] mb-1.5">Confirm Password</label>
 <input
 id="signup-confirm-password"
 type="password"
 className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 />
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-[var(--text)] text-[var(--bg)] py-2.5 rounded-md text-sm font-bold hover:opacity-80 transition-colors disabled:opacity-50 mt-2"
 >
 {loading ? 'Creating account...' : 'Create account'}
 </button>
 </form>
 )}

 {!success && (
 <>
 <div className="flex items-center my-6">
 <div className="flex-grow border-t-[0.5px] border-[var(--border)] "></div>
 <span className="px-3 text-xs text-[var(--text2)] uppercase tracking-wider font-medium">or</span>
 <div className="flex-grow border-t-[0.5px] border-[var(--border)] "></div>
 </div>

 <button
 onClick={handleGoogleAuth}
 className="w-full flex items-center justify-center gap-2 border-[0.5px] border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] py-2.5 rounded-md text-sm font-bold hover:bg-[var(--bg)] dark:hover:bg-[#333333] transition-colors"
 >
 <svg className="w-4 h-4" viewBox="0 0 24 24">
 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
 </svg>
 Continue with Google
 </button>
 </>
 )}

 <div className="text-center mt-6">
 <Link href="/login" className="text-sm text-[var(--text2)] hover:text-[var(--text)] dark:hover:text-[var(--text)] transition-colors">
 Already have an account? <span className="font-bold underline decoration-[0.5px] underline-offset-4">Login &rarr;</span>
 </Link>
 </div>
 </div>
 </div>
 );
}
