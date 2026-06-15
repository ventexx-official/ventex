"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminLocations() {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newStateName, setNewStateName] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: cData } = await supabase.from('countries').select('*').order('name');
    if (cData) {
      setCountries(cData);
      if (cData.length > 0 && !selectedCountryId) setSelectedCountryId(cData[0].id);
    }
    
    const { data: sData } = await supabase.from('states').select('*, countries(name)').order('name');
    if (sData) setStates(sData);
    setLoading(false);
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryName || !newCountryCode) return;
    const { error } = await supabase.from('countries').insert({ name: newCountryName, code: newCountryCode });
    if (error) alert(error.message);
    else {
      setNewCountryName('');
      setNewCountryCode('');
      fetchData();
    }
  };

  const handleDeleteCountry = async (id: string) => {
    if (!confirm("Are you sure? This will delete all states inside it.")) return;
    await supabase.from('countries').delete().eq('id', id);
    fetchData();
  };

  const handleAddState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName || !selectedCountryId) return;
    const { error } = await supabase.from('states').insert({ name: newStateName, country_id: selectedCountryId });
    if (error) alert(error.message);
    else {
      setNewStateName('');
      fetchData();
    }
  };

  const handleDeleteState = async (id: string) => {
    if (!confirm("Delete state?")) return;
    await supabase.from('states').delete().eq('id', id);
    fetchData();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-sm font-bold text-[var(--text2)] hover:text-[var(--text)]">&larr; Back to Admin</Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Manage Locations</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Countries */}
        <div className="bg-[var(--card-bg)] border p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Countries</h2>
          <form onSubmit={handleAddCountry} className="flex gap-2 mb-6">
            <input placeholder="Name (e.g. Japan)" value={newCountryName} onChange={e=>setNewCountryName(e.target.value)} className="border p-2 rounded-md flex-1 text-sm" required />
            <input placeholder="Code (e.g. JP)" value={newCountryCode} onChange={e=>setNewCountryCode(e.target.value)} className="border p-2 rounded-md w-24 text-sm" required />
            <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold">Add</button>
          </form>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {countries.map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <span className="font-bold">{c.name}</span> <span className="text-gray-500 text-sm">({c.code})</span>
                </div>
                <button onClick={() => handleDeleteCountry(c.id)} className="text-red-500 text-xs font-bold hover:underline">Delete</button>
              </div>
            ))}
          </div>
        </div>

        {/* States */}
        <div className="bg-[var(--card-bg)] border p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">States / Regions</h2>
          <form onSubmit={handleAddState} className="flex gap-2 mb-6">
            <select value={selectedCountryId} onChange={e=>setSelectedCountryId(e.target.value)} className="border p-2 rounded-md text-sm max-w-[120px]" required>
              {countries.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
            <input placeholder="State Name (e.g. Tokyo)" value={newStateName} onChange={e=>setNewStateName(e.target.value)} className="border p-2 rounded-md flex-1 text-sm" required />
            <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold">Add</button>
          </form>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {states.map(s => (
              <div key={s.id} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <span className="font-bold">{s.name}</span> <span className="text-gray-500 text-xs">({s.countries?.name})</span>
                </div>
                <button onClick={() => handleDeleteState(s.id)} className="text-red-500 text-xs font-bold hover:underline">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
