"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import FounderGuard from '@/components/FounderGuard';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', product_type: 'digital', delivery_type: 'digital', stripe_price_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('products').insert({
      user_id: session.user.id,
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      product_type: form.product_type,
      category: form.product_type,
      stripe_price_id: form.stripe_price_id,
      status: 'published'
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
            <div><label className="block text-sm font-bold">Price ($)</label><input required type="number" className="w-full border p-2" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></div>
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
              <label className="block text-sm font-bold">Purchase Link (e.g., Ko-fi)</label>
              <input required type="url" placeholder="https://ko-fi.com/..." className="w-full border p-2" value={form.stripe_price_id} onChange={e=>setForm({...form,stripe_price_id:e.target.value})}/>
              <p className="text-xs text-[var(--text2)] mt-1">Buyers will be redirected to this link when they click Buy Now.</p>
            </div>
            <button disabled={loading} className="w-full bg-[var(--text)] text-[var(--bg)] font-bold py-2 rounded mt-6">Create Product</button>
          </form>
        </div>
      </div>
    </FounderGuard>
  );
}
