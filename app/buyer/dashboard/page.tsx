"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ShoppingBag, Bookmark, MessageSquare, Tag } from 'lucide-react';
import BuyerGuard from '@/components/BuyerGuard';

export default function BuyerDashboard() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('users').select('*').eq('id', session.user.id).single().then(({ data }) => setProfile(data));
      }
    });
  }, []);

  return (
    <BuyerGuard>
      <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-[var(--border)] bg-[var(--card-bg)] p-6 space-y-4">
          <div className="font-black text-xl mb-8 text-[var(--text)]">Buyer</div>
          <nav className="space-y-2 text-sm font-bold">
            <Link href="/" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Home</Link>
            <Link href="/buyer/dashboard" className="block px-3 py-2 bg-[var(--bg2)] rounded-md text-[var(--text)]">Dashboard</Link>
            <Link href="/marketplace" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Marketplace</Link>
            <Link href="/buyer/saved-products" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Saved Products</Link>
            <Link href="/buyer/purchases" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">My Purchases</Link>
            <Link href="/messages" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Messages</Link>
            <Link href="/buyer/settings" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Settings</Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-8">Buyer Overview</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <Bookmark className="w-5 h-5 text-[var(--text2)] mb-4" />
              <div className="text-2xl font-black text-[var(--text)]">0</div>
              <div className="text-sm font-bold text-[var(--text2)]">Saved</div>
            </div>
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <ShoppingBag className="w-5 h-5 text-[var(--text2)] mb-4" />
              <div className="text-2xl font-black text-[var(--text)]">0</div>
              <div className="text-sm font-bold text-[var(--text2)]">Purchases</div>
            </div>
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <MessageSquare className="w-5 h-5 text-[var(--text2)] mb-4" />
              <div className="text-2xl font-black text-[var(--text)]">0</div>
              <div className="text-sm font-bold text-[var(--text2)]">Active Conversations</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <h2 className="text-xl font-bold mb-4 text-[var(--text)]">Recently Saved Products</h2>
              <div className="text-[var(--text2)] text-sm">No saved products yet.</div>
            </div>
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <h2 className="text-xl font-bold mb-4 text-[var(--text)]">Recent Purchase Intents</h2>
              <div className="text-[var(--text2)] text-sm">No recent intents.</div>
            </div>
          </div>
        </main>
      </div>
    </BuyerGuard>
  );
}
