"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import BuyerGuard from '@/components/BuyerGuard';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function BuyerSettings() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postal: '',
    country: ''
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        fetchSettings(session.user.id);
      }
    });
  }, []);

  const fetchSettings = async (uid: string) => {
    const { data: user } = await supabase.from('users').select('*').eq('id', uid).single();
    if (user) {
      setForm(prev => ({ ...prev, fullName: user.full_name || '', phone: user.phone || '', whatsapp: user.whatsapp || '' }));
    }

    const { data: address } = await supabase.from('buyer_addresses').select('*').eq('user_id', uid).single();
    if (address) {
      setForm(prev => ({ 
        ...prev, 
        address1: address.address_line1 || '', 
        address2: address.address_line2 || '',
        city: address.city || '',
        state: address.state || '',
        postal: address.postal_code || '',
        country: address.country || ''
      }));
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setSuccess(false);
    try {
      await supabase.from('users').update({
        full_name: form.fullName,
        phone: form.phone,
        whatsapp: form.whatsapp
      }).eq('id', userId);

      const { data: existingAddr } = await supabase.from('buyer_addresses').select('id').eq('user_id', userId).single();
      if (existingAddr) {
        await supabase.from('buyer_addresses').update({
          address_line1: form.address1,
          address_line2: form.address2,
          city: form.city,
          state: form.state,
          postal_code: form.postal,
          country: form.country
        }).eq('user_id', userId);
      } else {
        await supabase.from('buyer_addresses').insert({
          user_id: userId,
          address_line1: form.address1,
          address_line2: form.address2,
          city: form.city,
          state: form.state,
          postal_code: form.postal,
          country: form.country
        });
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <BuyerGuard>
      <div className="min-h-screen bg-[var(--bg)]">
        <Navbar />
        <main className="max-w-[800px] mx-auto p-6 md:p-8 mt-16">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/buyer/dashboard" className="text-sm font-bold text-[var(--text2)] hover:text-[var(--text)]">&larr; Back to Dashboard</Link>
          </div>
          
          <h1 className="text-3xl font-bold text-[var(--text)] mb-8">Settings</h1>

          <div className="bg-[var(--card-bg)] border-[0.5px] border-[var(--border)] rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 text-[var(--text)]">Profile & Contact</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-bold text-[var(--text)]">Full Name</label>
                <input className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] mt-1" value={form.fullName} onChange={e=>setForm({...form, fullName: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-bold text-[var(--text)]">Phone</label>
                <input className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)] mt-1" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} />
              </div>
            </div>

            <h2 className="text-xl font-bold mt-12 mb-6 text-[var(--text)]">Default Address</h2>
            <div className="space-y-4 max-w-md">
              <input placeholder="Address Line 1" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)]" value={form.address1} onChange={e=>setForm({...form, address1: e.target.value})} />
              <input placeholder="City" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)]" value={form.city} onChange={e=>setForm({...form, city: e.target.value})} />
              <div className="flex gap-2">
                <input placeholder="State" className="w-1/2 border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)]" value={form.state} onChange={e=>setForm({...form, state: e.target.value})} />
                <input placeholder="Postal Code" className="w-1/2 border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)]" value={form.postal} onChange={e=>setForm({...form, postal: e.target.value})} />
              </div>
              <input placeholder="Country" className="w-full border-[0.5px] border-[var(--border)] rounded-md px-3 py-2 text-sm bg-[var(--bg)]" value={form.country} onChange={e=>setForm({...form, country: e.target.value})} />
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button disabled={saving} onClick={handleSave} className="bg-[var(--text)] text-[var(--bg)] px-6 py-2 rounded-md font-bold disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {success && <span className="text-sm text-green-500 font-bold">Saved!</span>}
            </div>
          </div>
        </main>
      </div>
    </BuyerGuard>
  );
}
