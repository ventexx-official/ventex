"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { getSignedInDestination } from '@/lib/role-routing';
import { AuthShell } from '@/components/AuthShell';
import { AlertCircle, ArrowUpRight, CheckCircle2, Mail } from 'lucide-react';

export default function ForgotPassword() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect away
  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, onboarding_complete')
          .eq('id', session.user.id)
          .single();
        router.replace(getSignedInDestination(profile));
      }
    }
    checkSession();
    return () => { mounted = false; };
  }, [router]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return setError('Email is required.');
    if (!emailPattern.test(email.trim())) return setError('Please enter a valid email address.');

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (resetError) {
        console.error('Password reset error:', resetError);
        setError(resetError.message || 'Something went wrong. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Password reset exception:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell stepKicker="ACCOUNT RECOVERY">
      <div className="w-full bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl">
        {success ? (
          <div className="text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[var(--red)]/15 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-[var(--red)]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
                {'// '} CHECK YOUR INBOX
              </span>
              <h1 className="font-display text-2xl font-medium tracking-tight text-[var(--paper)] uppercase">
                Reset link sent
              </h1>
            </div>
            <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed">
              We sent a password reset link to{' '}
              <span className="text-[var(--paper)] font-bold">{email}</span>.
              Click the link in your email to choose a new password.
            </p>
            <p className="text-[11px] font-mono text-[var(--smoke)]">
              Didn't receive it? Check your spam folder, or{' '}
              <button
                onClick={() => setSuccess(false)}
                className="underline hover:text-[var(--paper-dim)] cursor-pointer"
              >
                try again
              </button>.
            </p>
            <div className="pt-4 border-t border-[var(--line)]">
              <Link
                href="/login"
                className="text-xs font-mono text-[var(--red)] font-bold uppercase tracking-wider hover:underline"
              >
                Return to sign in →
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="w-10 h-10 rounded-xl bg-[var(--red)]/15 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-[var(--red)]" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
                {'// '} ACCOUNT RECOVERY
              </span>
              <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--paper)] uppercase">
                Reset password
              </h1>
              <p className="text-xs font-mono text-[var(--paper-dim)] mt-2">
                Enter your email and we'll send you a secure link to reset your password.
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-5" noValidate>
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="bg-red-950/40 border border-red-500/50 text-red-300 p-3.5 rounded-xl text-xs font-mono flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-2">
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  autoFocus
                  autoComplete="email"
                  required
                  disabled={loading}
                  placeholder="founder@example.com"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors min-h-[44px] text-[16px]"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] focus:outline-none focus:ring-2 focus:ring-[var(--red)] focus:ring-offset-2 focus:ring-offset-[var(--card)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
              >
                {loading ? 'Sending link...' : 'Send reset link'}
                {!loading && <ArrowUpRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-[var(--line)]">
              <Link href="/login" className="text-xs font-mono text-[var(--paper-dim)] hover:text-[var(--paper)] transition-colors">
                Remember your password?{' '}
                <span className="text-[var(--red)] font-bold">Sign in →</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthShell>
  );
}
