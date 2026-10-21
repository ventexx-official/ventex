"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { ENABLE_GOOGLE_LOGIN } from '@/lib/brand';
import { mapAuthError } from '@/lib/auth-errors';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

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
        router.refresh();
        router.replace('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [success, router]);

  const validate = () => {
    let isValid = true;
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    if (!fullName.trim()) {
      setNameError('Full name is required.');
      isValid = false;
    }

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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            display_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        setError(mapAuthError(signUpError));
        setLoading(false);
        return;
      }

      // Check if session was returned directly (e.g. autoconfirm enabled)
      if (data?.session) {
        router.refresh();
        router.replace('/dashboard');
        return;
      }

      // If identities is empty array, email is already registered in Supabase
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
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
    <div className="relative min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[16px] p-8 w-full max-w-[400px] shadow-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black italic tracking-tighter text-[var(--text)] uppercase">
            Ventex
          </Link>
          <h1 className="text-xl font-bold mt-4 text-[var(--text)]">Create an account</h1>
          <p className="text-sm text-[var(--text2)] mt-2">Join Ventex to discover, fund, or sell startups.</p>
          <div className="mt-4 rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--bg)] p-3 text-left text-xs leading-5 text-[var(--text2)] dark:bg-[var(--bg3)]">
            <strong className="text-[var(--text)]">Investor verification:</strong> Ventex conducts identity verification for all investor accounts. You will be asked to complete KYC before accessing founder contact details or data rooms.
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
          <form onSubmit={handleSignup} className="space-y-4" noValidate>
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm border border-red-200 dark:border-red-800/50 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="signup-full-name" className="block text-sm font-bold text-[var(--text)] mb-1.5">
                Full Name
              </label>
              <input
                id="signup-full-name"
                type="text"
                autoComplete="name"
                disabled={loading}
                className={`w-full border-[0.5px] rounded-md px-3 py-2 text-sm bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:ring-1 transition-colors ${
                  nameError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[var(--border)] focus:ring-[#222222] dark:focus:ring-white'
                }`}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (nameError) setNameError(null);
                  if (error) setError(null);
                }}
                required
              />
              {nameError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{nameError}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-sm font-bold text-[var(--text)] mb-1.5">
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                disabled={loading}
                className={`w-full border-[0.5px] rounded-md px-3 py-2 text-sm bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:ring-1 transition-colors ${
                  emailError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-[var(--border)] focus:ring-[#222222] dark:focus:ring-white'
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
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{emailError}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-bold text-[var(--text)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={loading}
                  className={`w-full border-[0.5px] rounded-md pl-3 pr-10 py-2 text-sm bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:ring-1 transition-colors ${
                    passwordError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[var(--border)] focus:ring-[#222222] dark:focus:ring-white'
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text2)] hover:text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--text2)] rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{passwordError}</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-confirm-password" className="block text-sm font-bold text-[var(--text)] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  disabled={loading}
                  className={`w-full border-[0.5px] rounded-md pl-3 pr-10 py-2 text-sm bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:ring-1 transition-colors ${
                    confirmPasswordError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[var(--border)] focus:ring-[#222222] dark:focus:ring-white'
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text2)] hover:text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--text2)] rounded"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{confirmPasswordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--text)] text-[var(--bg)] py-2.5 rounded-md text-sm font-bold hover:opacity-80 transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}

        {!success && ENABLE_GOOGLE_LOGIN && (
          <>
            <div className="flex items-center my-6">
              <div className="flex-grow border-t-[0.5px] border-[var(--border)]"></div>
              <span className="px-3 text-xs text-[var(--text2)] uppercase tracking-wider font-medium">or</span>
              <div className="flex-grow border-t-[0.5px] border-[var(--border)]"></div>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border-[0.5px] border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] py-2.5 rounded-md text-sm font-bold hover:bg-[var(--bg)] dark:hover:bg-[#333333] transition-colors disabled:opacity-50"
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
