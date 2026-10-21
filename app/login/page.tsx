"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { ENABLE_GOOGLE_LOGIN } from '@/lib/brand';
import { mapAuthError } from '@/lib/auth-errors';
import { Eye, EyeOff, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function Login() {
  const brandName = SITE_NAME.toUpperCase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validate = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

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

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        console.error('Login error:', signInError);
        setError(mapAuthError(signInError));
        setLoading(false);
        return;
      }

      if (data?.session) {
        // Sync token cookie for middleware before navigating
        document.cookie = `sb-ventex-auth-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax; Secure`;
        router.refresh();
        router.replace('/dashboard');
      } else {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Unexpected login exception:', err);
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
          SECURE ACCESS / 2026
        </span>
      </header>

      {/* MAIN LOGIN CARD */}
      <main className="flex-1 flex items-center justify-center p-6 my-10">
        <div className="w-full max-w-[420px] bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl relative">
          <div className="mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
              {'//'} AUTHENTICATION
            </span>
            <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--paper)] uppercase">
              Welcome back
            </h1>
            <p className="text-xs font-mono text-[var(--paper-dim)] mt-2">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {error && (
              <div className="bg-red-950/40 border border-red-500/50 text-red-300 p-3.5 rounded-xl text-xs font-mono flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-2">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                disabled={loading}
                placeholder="founder@example.com"
                className={`w-full bg-[var(--ink)] border rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none transition-colors ${
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
                <p className="text-[11px] font-mono text-red-400 mt-1.5">{emailError}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="login-password" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-mono text-[var(--smoke)] hover:text-[var(--paper)] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={loading}
                  placeholder="••••••••"
                  className={`w-full bg-[var(--ink)] border rounded-xl pl-4 pr-11 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none transition-colors ${
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
                <p className="text-[11px] font-mono text-red-400 mt-1.5">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowUpRight className="w-4 h-4" />}
            </button>
          </form>

          {ENABLE_GOOGLE_LOGIN && (
            <>
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-[var(--line)]"></div>
                <span className="px-3 text-[10px] font-mono text-[var(--smoke)] uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-[var(--line)]"></div>
              </div>

              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 border border-[var(--line)] bg-[var(--ink)] text-[var(--paper)] py-3 rounded-full text-xs font-mono uppercase tracking-wider hover:border-[var(--border2)] transition-colors disabled:opacity-50 cursor-pointer"
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

          <div className="text-center mt-6 pt-6 border-t border-[var(--line)]">
            <Link href="/signup" className="text-xs font-mono text-[var(--paper-dim)] hover:text-[var(--paper)] transition-colors">
              Don't have an account? <span className="text-[var(--red)] font-bold">Sign up &rarr;</span>
            </Link>
          </div>
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
