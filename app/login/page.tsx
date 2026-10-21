"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { ENABLE_GOOGLE_LOGIN } from '@/lib/brand';
import { mapAuthError } from '@/lib/auth-errors';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
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
        // Successful login: update router and trigger refresh to ensure cookies are read
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
    <div className="relative min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[16px] p-8 w-full max-w-[400px] shadow-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black italic tracking-tighter text-[var(--text)] uppercase">
            Ventex
          </Link>
          <h1 className="text-xl font-bold mt-4 text-[var(--text)]">Welcome back</h1>
          <p className="text-sm text-[var(--text2)] mt-2">Log in to your Ventex account.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm border border-red-200 dark:border-red-800/50 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-sm font-bold text-[var(--text)] mb-1.5">
              Email address
            </label>
            <input
              id="login-email"
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
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="login-password" className="block text-sm font-bold text-[var(--text)]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--text2)] hover:text-[var(--text)] dark:hover:text-[var(--text)] transition-colors"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--text)] text-[var(--bg)] py-2.5 rounded-md text-sm font-bold hover:opacity-80 transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {ENABLE_GOOGLE_LOGIN && (
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
          <Link href="/signup" className="text-sm text-[var(--text2)] hover:text-[var(--text)] dark:hover:text-[var(--text)] transition-colors">
            Don't have an account? <span className="font-bold underline decoration-[0.5px] underline-offset-4">Sign up &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
