"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Compass, Bookmark, Activity, Users, Settings, MessageSquare } from 'lucide-react';
import InvestorGuard from '@/components/InvestorGuard';

export default function InvestorDashboard() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('users').select('*').eq('id', session.user.id).single().then(({ data }) => setProfile(data));
      }
    });
  }, []);

  const isMentor = profile?.investor_type === 'mentor' || profile?.investor_type === 'investor_mentor';

  return (
    <InvestorGuard>
      <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-[var(--border)] bg-[var(--card-bg)] p-6 space-y-4">
          <div className="font-black text-xl mb-8 text-[var(--text)]">Investor</div>
          <nav className="space-y-2 text-sm font-bold">
            <Link href="/dashboard/investor" className="block px-3 py-2 bg-[var(--bg2)] rounded-md text-[var(--text)]">Dashboard</Link>
            <Link href="/discover" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Discover</Link>
            {profile?.investor_type !== 'mentor' && (
              <>
                <Link href="/watchlist" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Watchlist</Link>
                <Link href="/deal-flow" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Deal Flow</Link>
              </>
            )}
            {isMentor && (
              <Link href="/mentor-hub" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Mentor Hub</Link>
            )}
            <Link href="/messages" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Messages</Link>
            <Link href="/investor/settings" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Settings</Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {profile && !profile.investor_verified && (
            <div className="bg-amber-100 text-amber-800 p-4 rounded-xl mb-8 font-bold text-sm">
              Account pending verification. You have limited access to founder contact details and data rooms.
            </div>
          )}

          <h1 className="text-3xl font-bold text-[var(--text)] mb-8">Investor Overview</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <Compass className="w-5 h-5 text-[var(--text2)] mb-4" />
              <div className="text-2xl font-black text-[var(--text)]">0</div>
              <div className="text-sm font-bold text-[var(--text2)]">Startups Discovered</div>
            </div>
            {profile?.investor_type !== 'mentor' && (
              <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
                <Bookmark className="w-5 h-5 text-[var(--text2)] mb-4" />
                <div className="text-2xl font-black text-[var(--text)]">0</div>
                <div className="text-sm font-bold text-[var(--text2)]">Saved</div>
              </div>
            )}
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <MessageSquare className="w-5 h-5 text-[var(--text2)] mb-4" />
              <div className="text-2xl font-black text-[var(--text)]">0</div>
              <div className="text-sm font-bold text-[var(--text2)]">Conversations</div>
            </div>
            {profile?.investor_type !== 'mentor' && (
              <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
                <Activity className="w-5 h-5 text-[var(--text2)] mb-4" />
                <div className="text-2xl font-black text-[var(--text)]">0</div>
                <div className="text-sm font-bold text-[var(--text2)]">Deals</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </InvestorGuard>
  );
}
