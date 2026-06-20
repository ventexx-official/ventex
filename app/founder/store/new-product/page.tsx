"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import FounderGuard from '@/components/FounderGuard';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', product_type: 'digital', delivery_type: 'digital', download_url: ''
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('products').insert({
      user_id: session.user.id,
      name: form.name,
      description: form.description,
      product_type: form.product_type,
      category: form.product_type,
      stripe_price_id: form.download_url, // repurposing field for download URL since DB schema hasn't changed
      status: 'pending'
    });

    setLoading(false);
    if (!error) router.push('/founder/store');
    else alert('Error: ' + error.message);
  };

  return (
    <FounderGuard>
      <div className="min-h-screen bg-[var(--bg)] p-6 md:p-10">
        <div className="max-w-2xl mx-auto bg-[var(--card-bg)] p-8 border border-[var(--border)] rounded-[16px]">
          <h1 className="text-2xl font-bold mb-6 text-[var(--text)]">Add New Product</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-bold">Name</label><input required className="w-full border p-2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
            <div><label className="block text-sm font-bold">Description</label><textarea required className="w-full border p-2" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
            <div>
              <label className="block text-sm font-bold">Product Type</label>
              <select className="w-full border p-2" value={form.product_type} onChange={e=>setForm({...form,product_type:e.target.value})}>
                <option value="digital">Digital Product</option>
                <option value="physical">Physical Product</option>
                <option value="service">Service/Consulting</option>
                <option value="job">Job Listing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold">Delivery Type</label>
              <select className="w-full border p-2" value={form.delivery_type} onChange={e=>setForm({...form,delivery_type:e.target.value})}>
                <option value="digital">Digital</option>
                <option value="physical">Physical</option>
                <option value="service">Service</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold">Download / Resource Link</label>
              <input type="url" placeholder="https://drive.google.com/..." className="w-full border p-2" value={form.download_url} onChange={e=>setForm({...form,download_url:e.target.value})}/>
              <p className="text-xs text-[var(--text2)] mt-1">Users will be redirected to this link to access the resource.</p>
            </div>
            <button disabled={loading} className="w-full bg-[var(--text)] text-[var(--bg)] font-bold py-2 rounded mt-6">Create Product</button>
          </form>
        </div>
      </div>
    </FounderGuard>
  );
}
