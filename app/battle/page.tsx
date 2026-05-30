"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function weekStartDate() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

function endOfWeekLabel() {
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + (7 - now.getDay()));
  end.setHours(24, 0, 0, 0);
  const diff = end.getTime() - Date.now();
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  return `${days}d ${hours}h`;
}

export default function BattlePage() {
  const week = weekStartDate();
  const [entries, setEntries] = useState<any[]>([]);
  const [votedId, setVotedId] = useState<string | null>(null);

  const load = async () => {
    const { data: battleData } = await supabase
      .from('pitch_battles')
      .select('*, pitch:pitch_id ( id, title, tagline, logo_url, industry, company_stage )')
      .eq('week_start', week)
      .order('votes', { ascending: false });

    if (battleData && battleData.length >= 5) {
      setEntries(battleData.slice(0, 5));
      return;
    }

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    let { data: pitches } = await supabase
      .from('pitches')
      .select('id, title, tagline, logo_url, industry, company_stage, pitch_score, created_at, is_raising')
      .or(`status.eq.raising,created_at.gte.${fourteenDaysAgo}`)
      .order('pitch_score', { ascending: false })
      .limit(8);

    if (!pitches || pitches.length === 0) {
      const fallback = await supabase
        .from('pitches')
        .select('id, title, tagline, logo_url, industry, company_stage, pitch_score, created_at, is_raising')
        .order('created_at', { ascending: false })
        .limit(8);
      pitches = fallback.data || [];
    }

    const existingByPitch = new Map((battleData || []).map((entry) => [entry.pitch_id, entry]));
    const fallbackEntries = (pitches || []).map((pitch) => existingByPitch.get(pitch.id) || {
      id: pitch.id,
      pitch_id: pitch.id,
      week_start: week,
      votes: 0,
      pitch,
    });
    setEntries(fallbackEntries.slice(0, 8));
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      setVotedId(localStorage.getItem(`ventex_battle_vote_${week}_${userId || 'guest'}`));
    };
    init();
    load();

    const channel = supabase
      .channel(`pitch_battles:${week}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pitch_battles' }, load)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  const totalVotes = useMemo(() => entries.reduce((sum, entry) => sum + (entry.votes || 0), 0), [entries]);

  const vote = async (entry: any) => {
    if (votedId) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Please log in to vote in the weekly pitch battle.');
      return;
    }

    const voteKey = `ventex_battle_vote_${week}_${session.user.id}`;
    if (localStorage.getItem(voteKey)) {
      setVotedId(localStorage.getItem(voteKey));
      return;
    }

    localStorage.setItem(voteKey, entry.pitch_id);
    setVotedId(entry.pitch_id);

    const { data: existing } = await supabase
      .from('pitch_battles')
      .select('id, votes')
      .eq('week_start', week)
      .eq('pitch_id', entry.pitch_id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('pitch_battles').update({ votes: (existing.votes || 0) + 1 }).eq('id', existing.id);
      if (error) {
        localStorage.removeItem(voteKey);
        setVotedId(null);
        alert('Vote failed: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('pitch_battles').insert({ week_start: week, pitch_id: entry.pitch_id, votes: 1 });
      if (error) {
        localStorage.removeItem(voteKey);
        setVotedId(null);
        alert('Vote failed: ' + error.message);
        return;
      }
    }

    load();
  };

  return (
    <div className="min-h-screen bg-[#F2F2F0] px-4 py-10">
      <main className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-[#222222]">Weekly pitch battle</h1>
            <p className="mt-2 text-sm font-medium text-[#666666]">Vote for the strongest startup of the week. Ends in {endOfWeekLabel()}.</p>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#222222]">{totalVotes} votes</div>
        </header>

        {entries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d4d4d4] bg-white p-10 text-center text-sm font-bold text-[#888888]">
            Battle entries are being prepared. Submit a pitch to be considered this week.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {entries.map((entry) => {
              const pitch = entry.pitch || {};
              const pct = totalVotes ? Math.round(((entry.votes || 0) / totalVotes) * 100) : 0;
              return (
                <article key={entry.pitch_id} className="rounded-3xl border border-[#e5e5e5] bg-white p-5">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[#222222] text-xl font-black text-white">
                    {pitch.logo_url ? <img src={pitch.logo_url} alt="" className="h-full w-full object-cover" /> : (pitch.title || 'P')[0]}
                  </div>
                  <h2 className="mt-4 line-clamp-2 min-h-[3rem] text-lg font-black leading-tight text-[#222222]">{pitch.title || 'Untitled pitch'}</h2>
                  <p className="mt-2 line-clamp-3 min-h-[4rem] text-sm font-medium text-[#666666]">{pitch.tagline || 'No tagline yet.'}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F2F2F0]">
                    <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 text-xs font-black text-[#888888]">{entry.votes || 0} votes · {pct}%</div>
                  <button
                    onClick={() => vote(entry)}
                    disabled={!!votedId}
                    className="mt-4 w-full rounded-2xl bg-[#222222] py-3 text-sm font-black text-white disabled:bg-[#d4d4d4]"
                  >
                    {votedId === entry.pitch_id ? 'Voted' : votedId ? 'Vote locked' : 'Vote'}
                  </button>
                  <Link href={`/pitch/${entry.pitch_id}`} className="mt-3 block text-center text-xs font-black text-[#222222] underline underline-offset-4">
                    View pitch
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
