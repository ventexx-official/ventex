"use client";

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { SITE_NAME, ENABLE_GOOGLE_LOGIN } from '@/lib/brand';
import { mapAuthError } from '@/lib/auth-errors';
import { useRouter, useSearchParams } from 'next/navigation';
import { sanitizeNextUrl, getSignedInDestination } from '@/lib/role-routing';
import { Eye, EyeOff, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

function SignupForm() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get('next');
  const safeNext = sanitizeNextUrl(rawNext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already signed in, redirect to destination
  useEffect(() => {
    let mounted = true;
    async function checkExistingSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        if (safeNext) {
          router.replace(safeNext);
          return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, onboarding_complete')
          .eq('id', session.user.id)
          .single();
        router.replace(getSignedInDestination(profile));
      }
    }
    checkExistingSession();
    return () => { mounted = false; };
  }, [router, safeNext]);

  // Listener for token refreshed / signed in while success banner is shown
  useEffect(() => {
    if (!success) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        document.cookie = `sb-ventex-auth-token=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax; Secure`;
        router.refresh();

        if (safeNext) {
          router.replace(safeNext);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, onboarding_complete')
          .eq('id', session.user.id)
          .single();

        router.replace(getSignedInDestination(profile));
      }
    });

    return () => subscription.unsubscribe();
  }, [success, router, safeNext]);

  const validate = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!emailPattern.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    return isValid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const callbackNext = safeNext ? `?next=${encodeURIComponent(safeNext)}` : '';
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback${callbackNext}`,
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        setError(mapAuthError(signUpError));
        setLoading(false);
        return;
      }

      if (data?.session) {
        document.cookie = `sb-ventex-auth-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; Secure`;
        router.refresh();

        if (safeNext) {
          router.replace(safeNext);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, onboarding_complete')
          .eq('id', data.session.user.id)
          .single();

        router.replace(getSignedInDestination(profile));
        return;
      }

      if (data?.user?.identities && data.user.identities.length === 0) {
        setError("An account with this email already exists. Try logging in.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      console.error('Unexpected signup exception:', err);
      setError(mapAuthError(err));
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const callbackNext = safeNext ? `?next=${encodeURIComponent(safeNext)}` : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback${callbackNext}`,
        },
      });
      if (error) {
        console.error('Google auth error:', error);
        setError(mapAuthError(error));
      }
    } catch (err: any) {
      console.error('Google auth unexpected error:', err);
      setError(mapAuthError(err));
    }
  };

  return (
    <div className="inner-page min-h-screen flex flex-col justify-between">
      {/* HEADER / BRAND BAR */}
      <header className="page-padding py-8 flex items-center justify-between border-b border-[var(--line)]">
        <Link href="/" className="brand-lockup" aria-label={`${brandName} home`}>
          <span className="brand-mark">
            <span>{brandName.charAt(0)}</span>
          </span>
          <span>{brandName}</span>
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--smoke)]">
          REGISTRATION / 2026
        </span>
      </header>

      {/* MAIN SIGNUP CARD */}
      <main className="flex-1 flex items-center justify-center p-6 my-10">
        <div className="w-full max-w-[440px] bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl relative">
          <div className="mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
              {'//'} GET STARTED
            </span>
            <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--paper)] uppercase">
              Create account
            </h1>
            <p className="text-xs font-mono text-[var(--paper-dim)] mt-2">
              Join {brandName} to build, fund, or discover what’s next.
            </p>
          </div>

          {success ? (
            <div className="bg-[var(--ink)] border border-[var(--line)] p-8 rounded-2xl text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[var(--red)] mx-auto" />
              <h3 className="font-display text-xl uppercase tracking-tight text-[var(--paper)]">
                Check your inbox
              </h3>
              <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed">
                We sent a confirmation link to <span className="text-[var(--paper)] font-bold">{email}</span>. Click the link in your email to confirm your account and step into your dashboard.
              </p>
              <div className="pt-4 border-t border-[var(--line)]">
                <Link
                  href="/login"
                  className="text-xs font-mono text-[var(--red)] font-bold uppercase tracking-wider hover:underline"
                >
                  Return to sign in &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4" noValidate>
              {error && (
                <div className="bg-red-950/40 border border-red-500/50 text-red-300 p-3.5 rounded-xl text-xs font-mono flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="signup-email" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Email address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  disabled={loading}
                  placeholder="alex@startup.io"
                  className={`w-full bg-[var(--ink)] border rounded-xl px-4 py-2.5 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none transition-colors ${
                    emailError
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-[var(--line)] focus:border-[var(--red)]'
                  }`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                    if (error) setError(null);
                  }}
                  required
                />
                {emailError && (
                  <p className="text-[11px] font-mono text-red-400 mt-1">{emailError}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={loading}
                    placeholder="At least 8 characters"
                    className={`w-full bg-[var(--ink)] border rounded-xl pl-4 pr-11 py-2.5 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none transition-colors ${
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--smoke)] hover:text-[var(--paper)] focus:outline-none rounded cursor-pointer transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] font-mono text-red-400 mt-1">{passwordError}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup-confirm-password" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={loading}
                    placeholder="Re-enter your password"
                    className={`w-full bg-[var(--ink)] border rounded-xl pl-4 pr-11 py-2.5 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none transition-colors ${
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--smoke)] hover:text-[var(--paper)] focus:outline-none rounded cursor-pointer transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-[11px] font-mono text-red-400 mt-1">{confirmPasswordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
              >
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowUpRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {ENABLE_GOOGLE_LOGIN && !success && (
            <>
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-[var(--line)]"></div>
                <span className="px-3 text-[10px] font-mono text-[var(--smoke)] uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-[var(--line)]"></div>
              </div>

              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 border border-[var(--line)] bg-[var(--ink)] text-[var(--paper)] py-3 rounded-full text-xs font-mono uppercase tracking-wider hover:border-[var(--border2)] transition-colors disabled:opacity-50 cursor-pointer min-h-[44px]"
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

          {!success && (
            <div className="text-center mt-6 pt-6 border-t border-[var(--line)]">
              <Link
                href={safeNext ? `/login?next=${encodeURIComponent(safeNext)}` : "/login"}
                className="text-xs font-mono text-[var(--paper-dim)] hover:text-[var(--paper)] transition-colors"
              >
                Already have an account? <span className="text-[var(--red)] font-bold">Sign in &rarr;</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* SIMPLE FOOTER */}
      <footer className="page-padding py-6 flex items-center justify-between text-xs font-mono text-[var(--smoke)] border-t border-[var(--line)]">
        <span>© 2026 {brandName}</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-[var(--paper)]">Privacy</Link>
          <Link href="/terms" className="hover:text-[var(--paper)]">Terms</Link>
        </div>
      </footer>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={<div className="inner-page min-h-screen" />}>
      <SignupForm />
    </Suspense>
  );
}
