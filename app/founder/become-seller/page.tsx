"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Suspense } from "react";
import {
  Phone,
  Shield,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Store,
  Lock,
  Loader2,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Inner component (needs useSearchParams)
───────────────────────────────────────────── */
function BecomeSellerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Step 1 — Phone
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 2 — Stripe
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState("");

  /* ── Auth check ── */
  useEffect(() => {
    const init = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) { router.push("/login"); return; }
      setSession(s);

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", s.user.id)
        .single();

      const userProf = profile || { id: s.user.id, full_name: s.user.email, role: 'founder', is_seller: false, phone_verified: false };
      setUserProfile(userProf);

      // If already a seller, go to step 3
      if (userProf.is_seller) {
        setStep(3);
        setLoading(false);
        return;
      }

      // If phone already verified, skip to step 2
      if (userProf.phone_verified) {
        setStep(2);
      }

      setLoading(false);
    };
    init();
  }, [router]);

  /* ── Handle Stripe return URL params ── */
  useEffect(() => {
    const stepParam = searchParams.get("step");
    const error = searchParams.get("error");

    if (stepParam === "complete") {
      setStep(3);
      // Refresh profile
      if (session) {
        supabase.from("users").select("*").eq("id", session.user.id).single()
          .then(({ data }) => { if (data) setUserProfile(data); });
      }
    } else if (stepParam === "stripe") {
      setStep(2);
      if (error === "incomplete") {
        setStripeError("Your Stripe onboarding wasn't completed. Please try again.");
      } else if (error) {
        setStripeError(`Stripe error: ${decodeURIComponent(error)}`);
      }
    }
  }, [searchParams, session]);

  /* ── Countdown timer for OTP resend ── */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* ── Send OTP (placeholder) ── */
  const handleSendOtp = async () => {
    setPhoneError("");
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setPhoneError("Enter a valid phone number.");
      return;
    }
    setPhoneLoading(true);
    // TODO: Integrate Twilio — call POST /api/seller/send-otp
    await new Promise(r => setTimeout(r, 1200)); // Simulate network
    setOtpSent(true);
    setCountdown(60);
    setPhoneLoading(false);
  };

  /* ── Verify OTP (placeholder) ── */
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setPhoneError("Enter the full 6-digit code.");
      return;
    }
    setVerifyLoading(true);
    setPhoneError("");
    // TODO: Verify with Twilio — for now accept any 6-digit code
    await new Promise(r => setTimeout(r, 1000));

    const { error } = await supabase
      .from("users")
      .update({ phone_verified: true, phone })
      .eq("id", session.user.id);

    if (error) {
      setPhoneError("Failed to save. Please try again.");
      setVerifyLoading(false);
      return;
    }

    setUserProfile((p: any) => ({ ...p, phone_verified: true, phone }));
    setVerifyLoading(false);
    setStep(2);
  };

  /* ── OTP input handlers ── */
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    digits.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  /* ── Connect Stripe ── */
  const handleConnectStripe = async () => {
    setStripeLoading(true);
    setStripeError("");
    try {
      const res = await fetch("/api/seller/create-connect-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, email: session.user.email }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to create account");
      window.location.href = data.url;
    } catch (err: any) {
      setStripeError(err.message);
      setStripeLoading(false);
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin" />
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Verify Phone", icon: Phone },
    { num: 2, label: "Connect Stripe", icon: CreditCard },
    { num: 3, label: "Start Selling", icon: Store },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F0]">
      {/* ── Top nav ── */}
      <header className="bg-white border-b-[0.5px] border-[#e5e5e5] px-6 py-4 flex items-center justify-between">
        <Link href="/founder/dashboard" className="flex items-center gap-2 text-[#888888] hover:text-[#222222] transition-colors text-sm font-bold">
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <span className="text-xl font-black italic tracking-tighter text-[#222222] uppercase">Ventex</span>
        <div className="w-32" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">

        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#222222] text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Seller Onboarding
          </div>
          <h1 className="text-4xl font-black text-[#222222] tracking-tighter mb-3">
            Start selling on Ventex
          </h1>
          <p className="text-[#888888] font-medium text-base leading-relaxed">
            Complete two quick steps to list products and get paid directly.
          </p>
        </div>

        {/* ── Step progress bar ── */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((s, idx) => {
            const done = step > s.num;
            const active = step === s.num;
            return (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-black text-sm
                    ${done ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
                      active ? "bg-[#222222] text-white shadow-lg shadow-black/20 scale-110" :
                      "bg-white border-[0.5px] border-[#e5e5e5] text-[#cccccc]"}
                  `}>
                    {done ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider whitespace-nowrap
                    ${active ? "text-[#222222]" : done ? "text-emerald-500" : "text-[#cccccc]"}`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-20 h-[1.5px] mx-2 mb-5 transition-all duration-500
                    ${step > s.num ? "bg-emerald-400" : "bg-[#e5e5e5]"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ════════════════════════════════
            STEP 1 — Phone Verification
        ════════════════════════════════ */}
        {step === 1 && (
          <div className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-br from-[#222222] to-[#444444] p-8 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Step 1 of 2</p>
                  <h2 className="text-xl font-black">Verify your phone</h2>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                We use your phone number to protect buyers and sellers on Ventex. Standard SMS rates may apply.
              </p>
            </div>

            <div className="p-8">
              {!otpSent ? (
                /* Phone input */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-[#888888] uppercase tracking-widest mb-2">
                      Phone Number
                    </label>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-2 px-4 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl text-sm font-bold text-[#222222] flex-shrink-0">
                        <span className="text-base">🌍</span>
                        <span>+1</span>
                      </div>
                      <input
                        id="phone-input"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                        placeholder="(555) 000-0000"
                        className="flex-1 px-4 py-3.5 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl text-sm font-bold text-[#222222] placeholder:text-[#cccccc] focus:outline-none focus:border-[#222222] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {phoneError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 px-4 py-3 rounded-2xl">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {phoneError}
                    </div>
                  )}

                  <div className="bg-amber-50 border-[0.5px] border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                      <strong>Twilio OTP integration coming soon.</strong> For now, any 6-digit code will be accepted during testing.
                    </p>
                  </div>

                  <button
                    id="send-otp-btn"
                    onClick={handleSendOtp}
                    disabled={phoneLoading || !phone}
                    className="w-full py-4 bg-[#222222] text-white rounded-2xl font-black text-sm hover:bg-black active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                  >
                    {phoneLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    ) : (
                      <><Phone className="w-4 h-4" /> Send OTP Code</>
                    )}
                  </button>
                </div>
              ) : (
                /* OTP input */
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-[#222222] mb-1">
                      Code sent to <span className="text-[#888888]">{phone}</span>
                    </p>
                    <p className="text-xs text-[#888888] font-medium">
                      Enter the 6-digit code below.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#888888] uppercase tracking-widest mb-3">
                      Verification Code
                    </label>
                    <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          ref={el => { otpRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                          className={`
                            w-12 h-14 text-center text-xl font-black rounded-2xl border-[0.5px] transition-all
                            focus:outline-none focus:border-[#222222] focus:bg-white focus:scale-105 focus:shadow-lg
                            ${digit ? "border-[#222222] bg-[#222222] text-white scale-105" : "border-[#e5e5e5] bg-[#F2F2F0] text-[#222222]"}
                          `}
                        />
                      ))}
                    </div>
                  </div>

                  {phoneError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 px-4 py-3 rounded-2xl">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {phoneError}
                    </div>
                  )}

                  <button
                    id="verify-otp-btn"
                    onClick={handleVerifyOtp}
                    disabled={verifyLoading || otp.join("").length < 6}
                    className="w-full py-4 bg-[#222222] text-white rounded-2xl font-black text-sm hover:bg-black active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                  >
                    {verifyLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                    ) : (
                      <><Shield className="w-4 h-4" /> Verify Code</>
                    )}
                  </button>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-xs text-[#888888] font-medium">
                        Resend in <span className="font-black text-[#222222]">{countdown}s</span>
                      </p>
                    ) : (
                      <button
                        onClick={() => { setOtp(["","","","","",""]); handleSendOtp(); }}
                        className="text-xs font-bold text-[#222222] underline decoration-[0.5px] underline-offset-4 hover:no-underline flex items-center gap-1 mx-auto"
                      >
                        <RefreshCw className="w-3 h-3" /> Resend code
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => { setOtpSent(false); setOtp(["","","","","",""]); setPhoneError(""); }}
                    className="w-full text-xs font-bold text-[#888888] hover:text-[#222222] transition-colors"
                  >
                    ← Change phone number
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            STEP 2 — Stripe Connect
        ════════════════════════════════ */}
        {step === 2 && (
          <div className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] p-8 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Step 2 of 2</p>
                  <h2 className="text-xl font-black">Connect with Stripe</h2>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Stripe handles payouts securely. Ventex never stores your bank details.
              </p>
            </div>

            <div className="p-8 space-y-6">
              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Lock, label: "Bank-level encryption" },
                  { icon: Shield, label: "PCI DSS compliant" },
                  { icon: CheckCircle, label: "Trusted by millions" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 bg-[#F2F2F0] rounded-2xl p-4 text-center">
                    <item.icon className="w-5 h-5 text-[#635BFF]" />
                    <span className="text-[10px] font-black text-[#888888] uppercase tracking-wide leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* How it works */}
              <div className="space-y-3">
                <p className="text-xs font-black text-[#888888] uppercase tracking-widest">How payouts work</p>
                {[
                  { step: "01", text: "Buyer pays through Ventex checkout" },
                  { step: "02", text: "Ventex deducts 5% platform fee" },
                  { step: "03", text: "95% transferred to your Stripe account" },
                ].map(item => (
                  <div key={item.step} className="flex items-center gap-4 p-4 bg-[#F2F2F0] rounded-2xl">
                    <span className="text-xs font-black text-[#cccccc] w-6 flex-shrink-0">{item.step}</span>
                    <p className="text-sm font-bold text-[#222222]">{item.text}</p>
                  </div>
                ))}
              </div>

              {stripeError && (
                <div className="flex items-start gap-2 text-red-500 text-sm font-medium bg-red-50 px-4 py-3 rounded-2xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Connection issue</p>
                    <p className="text-red-400 text-xs mt-0.5">{stripeError}</p>
                  </div>
                </div>
              )}

              <button
                id="connect-stripe-btn"
                onClick={handleConnectStripe}
                disabled={stripeLoading}
                className="w-full py-4 bg-[#635BFF] hover:bg-[#5249e5] text-white rounded-2xl font-black text-sm active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-[#635BFF]/20"
              >
                {stripeLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Stripe…</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Connect with Stripe <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-center text-[11px] text-[#cccccc] font-medium leading-relaxed">
                You'll be redirected to Stripe's secure onboarding flow.<br />
                Your banking details are never shared with Ventex.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            STEP 3 — Complete!
        ════════════════════════════════ */}
        {step === 3 && (
          <div className="bg-white rounded-3xl border-[0.5px] border-[#e5e5e5] shadow-sm overflow-hidden text-center">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-10 text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black mb-2">You're ready to sell!</h2>
              <p className="text-white/70 text-sm font-medium">
                Your seller account is active. Start listing products now.
              </p>
            </div>

            <div className="p-8 space-y-6">
              {/* Checklist */}
              <div className="space-y-3 text-left">
                {[
                  "Phone number verified ✓",
                  "Stripe Connect account linked ✓",
                  "Seller status activated ✓",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-bold text-emerald-700">{item}</span>
                  </div>
                ))}
              </div>

              {/* What's next */}
              <div className="bg-[#F2F2F0] rounded-2xl p-5 text-left space-y-2">
                <p className="text-xs font-black text-[#888888] uppercase tracking-widest mb-3">What's next</p>
                <p className="text-sm font-medium text-[#888888] leading-relaxed">
                  List products (digital or physical), set your price, and buyers can purchase instantly. Payouts hit your Stripe account after each sale.
                </p>
              </div>

              <Link
                id="list-product-btn"
                href="/marketplace/sell/create"
                className="block w-full py-4 bg-[#222222] text-white rounded-2xl font-black text-sm hover:bg-black active:scale-95 transition-all text-center shadow-lg shadow-black/10"
              >
                List your first product →
              </Link>

              <Link
                href="/founder/dashboard"
                className="block w-full py-3 text-sm font-bold text-[#888888] hover:text-[#222222] transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* ── Footer note ── */}
        {step < 3 && (
          <p className="text-center text-xs text-[#cccccc] font-medium mt-8">
            Need help?{" "}
            <a href="mailto:support@ventex.io" className="underline decoration-[0.5px] underline-offset-4 hover:text-[#888888] transition-colors">
              Contact support
            </a>
          </p>
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page export wrapped in Suspense
───────────────────────────────────────────── */
export default function BecomeSellerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F2F2F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin" />
      </div>
    }>
      <BecomeSellerInner />
    </Suspense>
  );
}
