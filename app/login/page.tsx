"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Check role/profile
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (!profile || profile.role === 'visitor') {
        router.push('/onboarding');
      } else if (profile.role === 'founder') {
        router.push('/founder/dashboard');
      } else {
        router.push('/discover');
      }
    }
  };

  const handleGoogleAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]  flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] bg-[var(--card-bg)] border-[0.5px] border-[var(--border)]  rounded-[16px] p-8 w-full max-w-[400px] shadow-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black italic tracking-tighter text-[var(--text)]  uppercase">
            Ventex
          </Link>
          <h1 className="text-xl font-bold mt-4 text-[var(--text)] ">Welcome back</h1>
          <p className="text-sm text-[var(--text2)] mt-2">Log in to your Ventex account.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm border-[0.5px] border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-[var(--text)]  mb-1.5">Email address</label>
            <input
              type="email"
              className="w-full border-[0.5px] border-[var(--border)]  rounded-md px-3 py-2 text-sm bg-[var(--card-bg)]  text-[var(--text)]  focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-bold text-[var(--text)] ">Password</label>
              <Link href="/forgot-password" className="text-xs text-[var(--text2)] hover:text-[var(--text)] dark:hover:text-[var(--text)] transition-colors">Forgot password?</Link>
            </div>
            <input
              type="password"
              className="w-full border-[0.5px] border-[var(--border)]  rounded-md px-3 py-2 text-sm bg-[var(--card-bg)]  text-[var(--text)]  focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--text)] dark:bg-[var(--card-bg)] text-[var(--text)] dark:text-[var(--text)] py-2.5 rounded-md text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t-[0.5px] border-[var(--border)] "></div>
          <span className="px-3 text-xs text-[var(--text2)] uppercase tracking-wider font-medium">or</span>
          <div className="flex-grow border-t-[0.5px] border-[var(--border)] "></div>
        </div>

        <button
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-2 border-[0.5px] border-[var(--border)]  bg-[var(--card-bg)]  text-[var(--text)]  py-2.5 rounded-md text-sm font-bold hover:bg-[var(--bg)] dark:hover:bg-[#333333] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="text-center mt-6">
          <Link href="/signup" className="text-sm text-[var(--text2)] hover:text-[var(--text)] dark:hover:text-[var(--text)] transition-colors">
            Don't have an account? <span className="font-bold underline decoration-[0.5px] underline-offset-4">Sign up &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}