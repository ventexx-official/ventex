"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function BuyerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    fullName: '', phoneCountryCode: '', phone: '', whatsapp: '',
    address1: '', address2: '', city: '', state: '', postal: '', country: '',
    interests: [] as string[], budget: ''
  });

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return router.push('/login');
      setUserId(session.user.id);
    });

    supabase.from('countries').select('*').eq('is_active', true).order('name').then(({data}) => {
      if(data) setCountries(data);
    });
  }, [router]);

  useEffect(() => {
    if (form.country) {
       const selectedCountry = countries.find(c => c.name === form.country);
       if (selectedCountry) {
          supabase.from('states').select('*').eq('country_id', selectedCountry.id).eq('is_active', true).order('name').then(({data}) => {
            if (data) setStates(data);
          });
       } else {
          setStates([]);
       }
    }
  }, [form.country, countries]);

  const handleSendOTP = () => {
    if (!form.phoneCountryCode || !form.phone) return alert("Select country code and enter phone");
    setOtpSent(true);
    alert("Mock OTP Sent to " + form.phoneCountryCode + " " + form.phone + " (Enter any 6 digits to verify)");
  };

  const handleVerifyOTP = () => {
    if (otpCode.length < 4) return alert("Invalid OTP. Enter at least 4 digits.");
    setStep(2);
  };

  const handleComplete = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const fullPhone = `${form.phoneCountryCode}${form.phone}`;
      await supabase.from('users').update({ 
        onboarding_completed: true,
        phone: fullPhone,
        country: form.country,
        state: form.state,
        whatsapp: form.whatsapp || fullPhone,
        buyer_interests: form.interests,
        budget_range: form.budget
      }).eq('id', userId);

      await supabase.from('buyer_addresses').insert({
        user_id: userId,
        address_line1: form.address1,
        address_line2: form.address2,
        city: form.city,
        state: form.state,
        postal_code: form.postal,
        country: form.country
      });

      router.push('/buyer/dashboard');
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[16px] p-8 w-full max-w-[500px]">
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-[var(--text)]">Step 1: Verification</h1>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[var(--text)]">Full Name</label>
                <input required className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)] mt-1" value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} disabled={otpSent} />
              </div>
              
              <div>
                <label className="text-sm font-bold text-[var(--text)]">Phone Number</label>
                <div className="flex gap-2 mt-1">
                  <select 
                    className="w-1/3 border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" 
                    value={form.phoneCountryCode} 
                    onChange={e=>setForm({...form, phoneCountryCode:e.target.value})}
                    disabled={otpSent}
                  >
                    <option value="">Country</option>
                    {countries.map(c => <option key={c.id} value={c.code}>{c.code}</option>)}
                  </select>
                  <input required type="tel" className="w-2/3 border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" placeholder="Phone Number" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} disabled={otpSent} />
                </div>
              </div>

              {!otpSent ? (
                <button onClick={handleSendOTP} disabled={!form.fullName || !form.phone || !form.phoneCountryCode} className="w-full bg-[var(--text)] text-[var(--bg)] py-2 rounded-md font-bold mt-4 disabled:opacity-50">Send OTP</button>
              ) : (
                <div className="mt-4 p-4 border border-[var(--border)] rounded-md bg-[var(--bg2)]">
                  <label className="text-sm font-bold text-[var(--text)] block mb-2">Enter OTP</label>
                  <input type="text" placeholder="123456" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)] tracking-widest text-center" value={otpCode} onChange={e=>setOtpCode(e.target.value)} />
                  <button onClick={handleVerifyOTP} className="w-full bg-green-600 text-white py-2 rounded-md font-bold mt-4">Verify & Continue</button>
                  <button onClick={() => setOtpSent(false)} className="w-full mt-2 text-sm text-[var(--text2)] underline">Resend / Change Number</button>
                </div>
              )}
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-[var(--text)]">Step 2: Shipping Address</h1>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[var(--text)]">Country</label>
                <select className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)] mt-1" value={form.country} onChange={e=>setForm({...form, country:e.target.value})}>
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {form.country && (
                <div>
                  <label className="text-sm font-bold text-[var(--text)]">State / Province</label>
                  <select className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)] mt-1" value={form.state} onChange={e=>setForm({...form, state:e.target.value})}>
                    <option value="">Select State</option>
                    {states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              )}

              <input placeholder="Address Line 1" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" value={form.address1} onChange={e=>setForm({...form, address1:e.target.value})} />
              <input placeholder="City" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} />
              <input placeholder="Postal Code" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" value={form.postal} onChange={e=>setForm({...form, postal:e.target.value})} />
              
              <div className="flex gap-2 mt-4">
                <button onClick={()=>setStep(1)} className="w-1/3 bg-transparent border border-[var(--border)] text-[var(--text)] py-2 rounded-md font-bold">&larr; Back</button>
                <button onClick={()=>setStep(3)} disabled={!form.address1 || !form.city || !form.country || !form.state} className="w-2/3 bg-[var(--text)] text-[var(--bg)] py-2 rounded-md font-bold disabled:opacity-50">Next &rarr;</button>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-[var(--text)]">Step 3: Interests</h1>
            <div className="space-y-4">
              <input placeholder="Budget Range (e.g. $1k - $5k)" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" value={form.budget} onChange={e=>setForm({...form, budget:e.target.value})} />
              <div className="flex gap-2 mt-4">
                <button onClick={()=>setStep(2)} className="w-1/3 bg-transparent border border-[var(--border)] text-[var(--text)] py-2 rounded-md font-bold">&larr; Back</button>
                <button onClick={handleComplete} disabled={loading} className="w-2/3 bg-[var(--text)] text-[var(--bg)] py-2 rounded-md font-bold disabled:opacity-50">{loading ? 'Saving...' : 'Complete \u2192'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
