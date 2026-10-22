"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { mapAuthError } from '@/lib/auth-errors';
import { getSignedInDestination } from '@/lib/role-routing';
import { AuthShell } from '@/components/AuthShell';
import { Eye, EyeOff, AlertCircle, ArrowUpRight, CheckCircle2, KeyRound } from 'lucide-react';

export default function ResetPassword() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  // Ensure there is an active recovery session
  useEffect(() => {
    let mounted = true;
    async function checkRecoverySession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && mounted) {
        // Listening for password recovery auth event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || session) {
            setReady(true);
          }
        });
        return () => subscription.unsubscribe();
      } else {
        if (mounted) setReady(true);
      }
    }
    checkRecoverySession();
    return () => { mounted = false; };
  }, []);

  const validate = () => {
    let isValid = true;
    setPasswordError(null);
    setConfirmPasswordError(null);

    if (!password) {
      setPasswordError('New password is required.');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your new password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    return isValid;
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        setError(mapAuthError(updateError));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Auto redirect after 2.5 seconds
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, onboarding_complete')
            .eq('id', session.user.id)
            .single();
          router.replace(getSignedInDestination(profile));
        } else {
          router.replace('/login');
        }
      }, 2500);
    } catch (err: any) {
      console.error('Password update exception:', err);
      setError(mapAuthError(err));
      setLoading(false);
    }
  };

  return (
    <AuthShell stepKicker="ACCOUNT SECURITY">
      <div className="w-full bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl">
        {success ? (
          <div className="text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[var(--red)]/15 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-[var(--red)]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
                {'// '} PASSWORD UPDATED
              </span>
              <h1 className="font-display text-2xl font-medium tracking-tight text-[var(--paper)] uppercase">
                You're all set
              </h1>
            </div>
            <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed">
              Your password has been changed successfully. Redirecting you to your account...
            </p>
            <div className="pt-4 border-t border-[var(--line)]">
              <Link
                href="/login"
                className="text-xs font-mono text-[var(--red)] font-bold uppercase tracking-wider hover:underline"
              >
                Continue to dashboard &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="w-10 h-10 rounded-xl bg-[var(--red)]/15 flex items-center justify-center mb-4">
                <KeyRound className="w-5 h-5 text-[var(--red)]" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
                {'// '} SET NEW PASSWORD
              </span>
              <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--paper)] uppercase">
                New password
              </h1>
              <p className="text-xs font-mono text-[var(--paper-dim)] mt-2">
                Choose a secure password of at least 8 characters.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4" noValidate>
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
                <label htmlFor="new-password" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoFocus
                    autoComplete="new-password"
                    disabled={loading}
                    placeholder="At least 8 characters"
                    className={`w-full bg-[var(--ink)] border rounded-xl pl-4 pr-11 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors min-h-[44px] text-[16px] ${
                      passwordError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-[var(--line)] focus:border-[var(--red)]'
                    }`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                      if (error) setError(null);
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[var(--smoke)] hover:text-[var(--paper)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] rounded-full cursor-pointer transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p role="alert" aria-live="polite" className="text-[11px] font-mono text-red-400 mt-1">{passwordError}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={loading}
                    placeholder="Re-enter your new password"
                    className={`w-full bg-[var(--ink)] border rounded-xl pl-4 pr-11 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors min-h-[44px] text-[16px] ${
                      confirmPasswordError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-[var(--line)] focus:border-[var(--red)]'
                    }`}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError(null);
                      if (error) setError(null);
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[var(--smoke)] hover:text-[var(--paper)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] rounded-full cursor-pointer transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p role="alert" aria-live="polite" className="text-[11px] font-mono text-red-400 mt-1">{confirmPasswordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] focus:outline-none focus:ring-2 focus:ring-[var(--red)] focus:ring-offset-2 focus:ring-offset-[var(--card)] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
              >
                {loading ? 'Updating password...' : 'Update Password'}
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
