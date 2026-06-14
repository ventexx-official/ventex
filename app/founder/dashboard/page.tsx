"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, Users, ShoppingBag, DollarSign, Plus } from 'lucide-react';
import FounderGuard from '@/components/FounderGuard';

export default function FounderDashboard() {
  const router = useRouter();
  const [pitches, setPitches] = useState<any[]>([]);
  const [stats, setStats] = useState({ views: 0, interests: 0, sales: 0, earnings: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('pitches').select('*').eq('user_id', session.user.id).then(({ data }) => {
          if (data) setPitches(data);
          if (data && data.length === 0) {
            router.push('/pitches/new'); // Auto-shown after first login if pitch_count = 0
          }
        });
      }
    });
  }, [router]);

  return (
    <FounderGuard>
      <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-[var(--border)] bg-[var(--card-bg)] p-6 space-y-4">
          <div className="font-black text-xl mb-8 text-[var(--text)]">Founder</div>
          <nav className="space-y-2 text-sm font-bold">
            <Link href="/dashboard/founder" className="block px-3 py-2 bg-[var(--bg2)] rounded-md text-[var(--text)]">Dashboard</Link>
            <Link href="/founder/pitches" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">My Pitches</Link>
            <Link href="/pitches/new" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Create Pitch</Link>
            <Link href="/founder/store" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">My Store</Link>
            <Link href="/messages" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Messages</Link>
            <Link href="/founder/settings" className="block px-3 py-2 text-[var(--text2)] hover:text-[var(--text)]">Settings</Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text)]">Overview</h1>
            <Link href="/pitches/new" className="bg-[var(--text)] text-[var(--bg)] px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4"/> New Pitch
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <Eye className="w-5 h-5 text-[var(--text2)] mb-4" />
              <div className="text-2xl font-black text-[var(--text)]">{stats.views}</div>
              <div className="text-sm font-bold text-[var(--text2)]">Pitch Views</div>
            </div>
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <Users className="w-5 h-5 text-[var(--text2)] mb-4" />
              <div className="text-2xl font-black text-[var(--text)]">{stats.interests}</div>
              <div className="text-sm font-bold text-[var(--text2)]">Investor Interests</div>
            </div>
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <ShoppingBag className="w-5 h-5 text-[var(--text2)] mb-4" />
              <div className="text-2xl font-black text-[var(--text)]">{stats.sales}</div>
              <div className="text-sm font-bold text-[var(--text2)]">Products Sold</div>
            </div>
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <DollarSign className="w-5 h-5 text-[var(--text2)] mb-4" />
              <div className="text-2xl font-black text-[var(--text)]">${stats.earnings}</div>
              <div className="text-sm font-bold text-[var(--text2)]">Earnings</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <h2 className="text-xl font-bold mb-4 text-[var(--text)]">My Pitches</h2>
              {pitches.length === 0 ? (
                <div className="text-[var(--text2)] text-sm">No pitches yet.</div>
              ) : (
                <div className="space-y-4">
                  {pitches.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                      <div>
                        <div className="font-bold text-[var(--text)]">{p.company_name}</div>
                        <div className="text-xs text-[var(--text2)] flex gap-2 mt-1">
                          {p.status === 'draft' && <span className="text-amber-500 font-bold">DRAFT</span>}
                          {p.status !== 'draft' && <span>{p.status}</span>}
                        </div>
                      </div>
                      <Link href={`/pitches/new?id=${p.id}`} className="text-sm font-bold px-3 py-1 bg-[var(--bg2)] rounded-md text-[var(--text)]">Edit</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-[var(--card-bg)] p-6 rounded-[16px] border border-[var(--border)]">
              <h2 className="text-xl font-bold mb-4 text-[var(--text)]">Investor Interests</h2>
              <div className="text-[var(--text2)] text-sm">No interests yet. Complete your pitch to attract investors.</div>
            </div>
          </div>
        </main>
      </div>
    </FounderGuard>
  );
}
