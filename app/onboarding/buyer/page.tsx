"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { getSignedInDestination } from '@/lib/role-routing';
import { AvatarUpload } from '@/components/AvatarUpload';
import { Stepper } from '@/components/Stepper';
import { AlertCircle, ArrowUpRight, ArrowLeft, ShoppingBag, MapPin, Store } from 'lucide-react';

const BUYER_STEPS = [
  { id: 1, label: "You" },
  { id: 2, label: "Delivery" },
  { id: 3, label: "Shop" },
];

export default function BuyerOnboarding() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Basic Info
  const [form, setForm] = useState({
    displayName: '',
    country: '',
    city: '',
    avatarUrl: '',
  });

  // Step 2: Delivery Address (Optional)
  const [address, setAddress] = useState({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) router.replace('/login');
        return;
      }

      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile?.onboarding_complete) {
        if (mounted) router.replace(getSignedInDestination(profile));
        return;
      }

      if (profile?.role && profile.role !== 'buyer') {
        if (mounted) router.replace(getSignedInDestination(profile));
        return;
      }

      if (profile) {
        setForm({
          displayName: profile.display_name || session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || '',
          country: profile.country || '',
          city: profile.city || '',
          avatarUrl: profile.avatar_url || '',
        });
        setAddress(a => ({
          ...a,
          fullName: profile.display_name || session.user.user_metadata?.display_name || '',
          country: profile.country || '',
          city: profile.city || '',
        }));
      }

      if (mounted) setChecking(false);
    }

    loadUser();
    return () => { mounted = false; };
  }, [router]);

  // Step 1 Submit: saves profile, sets onboarding_complete = true, moves to Step 2
  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError(null);

    if (!form.displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    setSubmitting(true);

    try {
      const { error: profileErr } = await supabase.from('profiles').update({
        display_name: form.displayName.trim(),
        country: form.country.trim() || null,
        city: form.city.trim() || null,
        avatar_url: form.avatarUrl.trim() || null,
        onboarding_complete: true,
      }).eq('id', userId);

      if (profileErr) throw profileErr;

      setStep(2);
    } catch (err: any) {
      console.error('Buyer onboarding error:', err);
      setError(err.message || 'Something went wrong saving your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2 Submit: saves optional delivery address
  const handleSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError(null);

    if (address.fullName.trim() && address.line1.trim() && address.city.trim() && address.country.trim()) {
      setSubmitting(true);
      try {
        const { error: addressErr } = await supabase.from('buyer_addresses').insert({
          user_id: userId,
          full_name: address.fullName.trim(),
          line1: address.line1.trim(),
          line2: address.line2.trim() || null,
          city: address.city.trim(),
          state: address.state.trim() || null,
          postal_code: address.postalCode.trim() || null,
          country: address.country.trim(),
          phone: address.phone.trim() || null,
          is_default: true,
        });

        if (addressErr) throw addressErr;
        setStep(3);
      } catch (err: any) {
        console.error('Buyer address error:', err);
        setError(err.message || 'Failed to save address.');
      } finally {
        setSubmitting(false);
      }
    } else {
      setError('Please fill in Full Name, Address Line 1, City, and Country, or click "Add later".');
    }
  };

  const handleSkipStep2 = () => {
    setStep(3);
  };

  const setFormKey = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (error) setError(null);
  };

  const setAddressKey = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(a => ({ ...a, [key]: e.target.value }));
    if (error) setError(null);
  };

  if (checking) {
    return (
      <div className="inner-page min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--line)] border-t-[var(--red)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="inner-page min-h-screen flex flex-col justify-between">
      {/* HEADER */}
      <header className="page-padding py-6 flex items-center justify-between border-b border-[var(--line)]">
        <Link href="/" className="brand-lockup" aria-label={`${brandName} home`}>
          <span className="brand-mark"><span>{brandName.charAt(0)}</span></span>
          <span>{brandName}</span>
        </Link>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[var(--card)] border border-[var(--line)] text-[var(--paper)]">
          BUYER PATHWAY
        </span>
      </header>

      {/* STEPPER BAR */}
      <div className="pt-6 pb-2 px-6">
        <Stepper currentStep={step} steps={BUYER_STEPS} />
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-6 my-6">
        {step === 1 && (
          /* STEP 1: Basic Info */
          <div className="w-full max-w-[540px] bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="mb-8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--red)]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShoppingBag className="w-5 h-5 text-[var(--red)]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-1">
                  {'//'} BUYER PROFILE
                </span>
                <h1 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-[var(--paper)] uppercase leading-tight">
                  Basic Info
                </h1>
                <p className="text-xs font-mono text-[var(--paper-dim)] mt-1.5 leading-relaxed">
                  Set up your buyer profile for purchasing startup products and digital assets.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="bg-red-950/40 border border-red-500/50 text-red-300 p-3.5 rounded-xl text-xs font-mono flex items-start gap-2.5 mb-5"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitStep1} className="space-y-4" noValidate>
              {userId && (
                <AvatarUpload
                  userId={userId}
                  currentUrl={form.avatarUrl}
                  onUploaded={(url) => setForm(f => ({ ...f, avatarUrl: url }))}
                  className="mb-4"
                />
              )}

              <div>
                <label htmlFor="by-name" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Display Name *
                </label>
                <input
                  id="by-name"
                  type="text"
                  autoFocus
                  autoComplete="name"
                  placeholder="Jordan Vance"
                  required
                  disabled={submitting}
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                  value={form.displayName}
                  onChange={setFormKey('displayName')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="by-country" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                    Country
                  </label>
                  <input
                    id="by-country"
                    type="text"
                    placeholder="Canada"
                    disabled={submitting}
                    className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                    value={form.country}
                    onChange={setFormKey('country')}
                  />
                </div>
                <div>
                  <label htmlFor="by-city" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                    City
                  </label>
                  <input
                    id="by-city"
                    type="text"
                    placeholder="Toronto"
                    disabled={submitting}
                    className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                    value={form.city}
                    onChange={setFormKey('city')}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/onboarding/role"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[var(--line)] text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] hover:border-[var(--smoke)] transition-colors min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 bg-[var(--red)] text-[var(--paper)] py-3 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] focus:outline-none focus:ring-2 focus:ring-[var(--red)] focus:ring-offset-2 focus:ring-offset-[var(--card)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
                >
                  {submitting ? 'Saving...' : 'Save & Continue'}
                  {!submitting && <ArrowUpRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          /* STEP 2: Delivery Address (Optional) */
          <div className="w-full max-w-[540px] bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="mb-8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--red)]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-[var(--red)]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-1">
                  {'//'} DELIVERY ADDRESS · OPTIONAL
                </span>
                <h1 className="font-display text-2xl md:text-3xl font-medium tracking-tight text-[var(--paper)] uppercase leading-tight">
                  Shipping Info
                </h1>
                <p className="text-xs font-mono text-[var(--paper-dim)] mt-1.5 leading-relaxed">
                  Used when purchasing physical merchandise or hardware. You can add or change this at checkout.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="bg-red-950/40 border border-red-500/50 text-red-300 p-3.5 rounded-xl text-xs font-mono flex items-start gap-2.5 mb-5"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitStep2} className="space-y-4" noValidate>
              <div>
                <label htmlFor="ad-name" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Recipient Full Name
                </label>
                <input
                  id="ad-name"
                  type="text"
                  autoFocus
                  placeholder="Jordan Vance"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                  value={address.fullName}
                  onChange={setAddressKey('fullName')}
                />
              </div>

              <div>
                <label htmlFor="ad-line1" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Address Line 1
                </label>
                <input
                  id="ad-line1"
                  type="text"
                  placeholder="123 King Street West"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                  value={address.line1}
                  onChange={setAddressKey('line1')}
                />
              </div>

              <div>
                <label htmlFor="ad-line2" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Address Line 2 (Optional)
                </label>
                <input
                  id="ad-line2"
                  type="text"
                  placeholder="Suite 400"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                  value={address.line2}
                  onChange={setAddressKey('line2')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ad-city" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                    City
                  </label>
                  <input
                    id="ad-city"
                    type="text"
                    placeholder="Toronto"
                    className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                    value={address.city}
                    onChange={setAddressKey('city')}
                  />
                </div>
                <div>
                  <label htmlFor="ad-state" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                    State / Province
                  </label>
                  <input
                    id="ad-state"
                    type="text"
                    placeholder="Ontario"
                    className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                    value={address.state}
                    onChange={setAddressKey('state')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ad-postal" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                    Postal Code
                  </label>
                  <input
                    id="ad-postal"
                    type="text"
                    placeholder="M5V 1J5"
                    className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                    value={address.postalCode}
                    onChange={setAddressKey('postalCode')}
                  />
                </div>
                <div>
                  <label htmlFor="ad-country" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                    Country
                  </label>
                  <input
                    id="ad-country"
                    type="text"
                    placeholder="Canada"
                    className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                    value={address.country}
                    onChange={setAddressKey('country')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ad-phone" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Phone (for courier delivery updates)
                </label>
                <input
                  id="ad-phone"
                  type="tel"
                  placeholder="+1 (416) 555-0199"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-3 text-xs font-mono text-[var(--paper)] placeholder-[var(--smoke)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors text-[16px] min-h-[44px]"
                  value={address.phone}
                  onChange={setAddressKey('phone')}
                />
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[var(--line)] text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] hover:border-[var(--smoke)] transition-colors min-h-[44px] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <button
                  type="button"
                  onClick={handleSkipStep2}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[var(--line)] text-xs font-mono text-[var(--paper-dim)] hover:text-[var(--paper)] hover:bg-[var(--ink)] transition-colors min-h-[44px] cursor-pointer"
                >
                  Add later &rarr;
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 bg-[var(--red)] text-[var(--paper)] py-3 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] focus:outline-none focus:ring-2 focus:ring-[var(--red)] focus:ring-offset-2 focus:ring-offset-[var(--card)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
                >
                  {submitting ? 'Saving...' : 'Save Address'}
                  {!submitting && <ArrowUpRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          /* STEP 3: Welcome Screen */
          <div className="w-full max-w-[480px] bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--red)]/15 flex items-center justify-center mx-auto mb-6">
              <Store className="w-7 h-7 text-[var(--red)]" />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-2">
              {'//'} STEP 3 OF 3 · WELCOME
            </span>

            <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--paper)] uppercase mb-3">
              You're all set
            </h1>

            <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed mb-8 max-w-sm mx-auto">
              Your buyer profile is configured. Explore software, licenses, digital assets and tools, or view your buyer dashboard.
            </p>

            <div className="space-y-3">
              <Link
                href="/marketplace"
                className="w-full bg-[var(--red)] text-[var(--paper)] py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] focus:outline-none focus:ring-2 focus:ring-[var(--red)] focus:ring-offset-2 focus:ring-offset-[var(--card)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg min-h-[44px]"
              >
                Browse the marketplace <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                href="/buyer/dashboard?welcome=1"
                className="w-full bg-transparent border border-[var(--line)] text-[var(--paper)] py-3.5 px-6 rounded-full text-xs font-mono uppercase tracking-wider hover:border-[var(--smoke)] hover:bg-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--red)] transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                Go to my dashboard &rarr;
              </Link>
            </div>

            <div className="mt-8 pt-4 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to delivery address
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
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
