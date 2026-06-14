"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function BuyerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    fullName: '', phone: '', whatsapp: '',
    address1: '', address2: '', city: '', state: '', postal: '', country: '',
    interests: [] as string[], budget: ''
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return router.push('/login');
      setUserId(session.user.id);
    });
  }, [router]);

  const handleComplete = async () => {
    if (!userId) return;
    try {
      await supabase.from('users').update({ 
        onboarding_completed: true,
        phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
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
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-[16px] p-8 w-full max-w-[500px]">
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-[var(--text)]">Step 1: Contact</h1>
            <div className="space-y-4">
              <div><label className="text-sm font-bold text-[var(--text)]">Full Name</label><input required className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} /></div>
              <div><label className="text-sm font-bold text-[var(--text)]">Phone</label><input required type="tel" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} /></div>
              <button onClick={()=>setStep(2)} disabled={!form.fullName || !form.phone} className="w-full bg-[var(--text)] text-[var(--bg)] py-2 rounded-md font-bold mt-4">Next &rarr;</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold mb-4 text-[var(--text)]">Step 2: Default Address</h1>
            <div className="space-y-4">
              <input placeholder="Address Line 1" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" value={form.address1} onChange={e=>setForm({...form, address1:e.target.value})} />
              <input placeholder="City" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" value={form.city} onChange={e=>setForm({...form, city:e.target.value})} />
              <div className="flex gap-2">
                <input placeholder="State" className="w-1/2 border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" value={form.state} onChange={e=>setForm({...form, state:e.target.value})} />
                <input placeholder="Postal Code" className="w-1/2 border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" value={form.postal} onChange={e=>setForm({...form, postal:e.target.value})} />
              </div>
              <input placeholder="Country" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)]" value={form.country} onChange={e=>setForm({...form, country:e.target.value})} />
              <div className="flex gap-2 mt-4">
                <button onClick={()=>setStep(1)} className="w-1/3 bg-transparent border border-[var(--border)] text-[var(--text)] py-2 rounded-md font-bold">&larr; Back</button>
                <button onClick={()=>setStep(3)} disabled={!form.address1 || !form.city || !form.country} className="w-2/3 bg-[var(--text)] text-[var(--bg)] py-2 rounded-md font-bold">Next &rarr;</button>
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
                <button onClick={handleComplete} className="w-2/3 bg-[var(--text)] text-[var(--bg)] py-2 rounded-md font-bold">Complete &rarr;</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
