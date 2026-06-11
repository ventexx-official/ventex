"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111] flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[16px] p-8 w-full max-w-[400px] shadow-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black italic tracking-tighter text-[#222222] dark:text-white uppercase">
            Ventex
          </Link>
          <h1 className="text-xl font-bold mt-4 text-[#222222] dark:text-white">Reset password</h1>
          <p className="text-sm text-[#888888] mt-2">Enter your email and we'll send you a reset link.</p>
        </div>

        {success ? (
          <div className="bg-[#F2F2F0] dark:bg-[#333333] p-4 rounded-xl text-center">
            <h3 className="font-bold text-[#222222] dark:text-white mb-2">Check your email</h3>
            <p className="text-sm text-[#888888]">We've sent a password reset link to {email}.</p>
            <Link href="/login" className="mt-4 inline-block text-sm font-bold text-[#222222] dark:text-white underline decoration-[0.5px] underline-offset-4">Return to login</Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm border-[0.5px] border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-[#222222] dark:text-white mb-1.5">Email address</label>
              <input
                type="email"
                className="w-full border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-md px-3 py-2 text-sm bg-[var(--card-bg)] dark:bg-[#111111] text-[#222222] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#222222] dark:bg-[var(--card-bg)] text-white dark:text-[#222222] py-2.5 rounded-md text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
            
            <div className="text-center mt-6">
              <Link href="/login" className="text-sm text-[#888888] hover:text-[#222222] dark:hover:text-white transition-colors">
                Remember your password? <span className="font-bold underline decoration-[0.5px] underline-offset-4">Login &rarr;</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}