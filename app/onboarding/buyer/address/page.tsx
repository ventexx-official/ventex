"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/brand';
import { getSignedInDestination } from '@/lib/role-routing';
import { Stepper } from '@/components/Stepper';
import { AlertCircle, ArrowUpRight, ArrowLeft, MapPin } from 'lucide-react';

const BUYER_STEPS = [
  { id: 1, label: "You" },
  { id: 2, label: "Delivery" },
  { id: 3, label: "Shop" },
];

export default function BuyerAddressOnboarding() {
  const brandName = SITE_NAME.toUpperCase();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // If user hasn't filled step 1 yet, send them to step 1
      if (!profile?.display_name || !profile?.country) {
        if (mounted) router.replace('/onboarding/buyer');
        return;
      }

      if (profile) {
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

  // Finish setup and mark onboarding_complete = true
  const finishOnboarding = async () => {
    if (!userId) return;
    const { error: completeErr } = await supabase
      .from('profiles')
      .update({ onboarding_complete: true })
      .eq('id', userId);

    if (completeErr) throw completeErr;

    router.refresh();
    router.replace('/welcome/buyer?celebrate=1');
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || submitting) return;
    setError(null);

    // If user filled in required address fields, save to buyer_addresses
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
        await finishOnboarding();
      } catch (err: any) {
        console.error('Buyer address error:', err);
        setError(err.message || 'Failed to save address.');
        setSubmitting(false);
      }
    } else {
      // If fields are incomplete, explain or prompt them
      setError('Please provide full name, street address, city, and country, or click "Add later".');
    }
  };

  const handleSkipAddress = async () => {
    if (!userId || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await finishOnboarding();
    } catch (err: any) {
      console.error('Buyer complete error:', err);
      setError(err.message || 'Failed to complete onboarding.');
      setSubmitting(false);
    }
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
      <header className="page-padding py-8 flex items-center justify-between border-b border-[var(--line)]">
        <Link href="/" className="brand-lockup" aria-label={`${brandName} home`}>
          <span className="brand-mark">
            <span>{brandName.charAt(0)}</span>
          </span>
          <span>{brandName}</span>
        </Link>
        <span className="text-[10px] font-mono tracking-widest text-[var(--smoke)] uppercase">
          [ STEP 2 OF 3 ]
        </span>
      </header>

      {/* STEPPER */}
      <div className="pt-6 pb-2">
        <Stepper currentStep={2} steps={BUYER_STEPS} />
      </div>

      {/* FORM CARD */}
      <main className="page-padding py-8 md:py-12 flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/onboarding/buyer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--paper-dim)] hover:text-[var(--paper)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to basic info
          </Link>
        </div>

        <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-[var(--red)]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)]">
                {'//'} STEP 2 OF 3 — DELIVERY ADDRESS (OPTIONAL)
              </span>
            </div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--paper)] uppercase mb-2">
              Shipping destination
            </h1>
            <p className="text-xs font-mono text-[var(--paper-dim)] leading-relaxed">
              Where should founders ship your orders? You can save an address now or add it later at checkout.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--red)]/10 border border-[var(--red)]/20 text-xs font-mono text-[var(--paper)] flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-[var(--red)] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Recipient full name
              </label>
              <input
                id="fullName"
                type="text"
                autoFocus
                autoComplete="name"
                value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                placeholder="e.g. Jordan Lee"
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
              />
            </div>

            <div>
              <label htmlFor="line1" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Address line 1
              </label>
              <input
                id="line1"
                type="text"
                autoComplete="street-address"
                value={address.line1}
                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                placeholder="Street address, P.O. Box"
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
              />
            </div>

            <div>
              <label htmlFor="line2" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Address line 2 (Optional)
              </label>
              <input
                id="line2"
                type="text"
                autoComplete="address-line2"
                value={address.line2}
                onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                placeholder="Apartment, suite, unit, building, floor"
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  autoComplete="address-level2"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  State / Province
                </label>
                <input
                  id="state"
                  type="text"
                  autoComplete="address-level1"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="State / Region"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="postalCode" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Postal code
                </label>
                <input
                  id="postalCode"
                  type="text"
                  autoComplete="postal-code"
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  placeholder="Postal code"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  autoComplete="country-name"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  placeholder="Country"
                  className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)] mb-1.5">
                Phone (for delivery courier)
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                placeholder="+1 555-0199"
                className="w-full bg-[var(--ink)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--paper)] focus:outline-none focus:border-[var(--red)] focus:ring-1 focus:ring-[var(--red)] transition-all"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:flex-1 bg-[var(--red)] text-[var(--paper)] py-3 px-6 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 min-h-[44px]"
              >
                {submitting ? 'Saving address...' : 'Save & Continue'}
              </button>

              <button
                type="button"
                onClick={handleSkipAddress}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-mono text-[var(--paper-dim)] hover:text-[var(--paper)] hover:bg-[var(--card)]/80 transition-colors border border-[var(--line)] min-h-[44px]"
              >
                Add later
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="page-padding py-6 border-t border-[var(--line)] text-center">
        <p className="text-[11px] font-mono text-[var(--smoke)]">
          You can add, edit, or remove shipping addresses at any time in Settings.
        </p>
      </footer>
    </div>
  );
}
