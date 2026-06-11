"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function WinnersPage() {
  const [enabled, setEnabled] = useState(false);
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "winners_archive").maybeSingle();
      setEnabled(!!flag?.enabled);
      if (flag?.enabled) {
        const { data } = await supabase.from("battle_winners").select("*, pitch:pitch_id(*)").order("created_at", { ascending: false });
        setWinners(data || []);
      }
    };
    load();
  }, []);

  if (!enabled) return <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-6 text-center"><h1 className="text-4xl font-black">Pitch winners archive coming soon.</h1></main>;

  return (
    <main className="min-h-screen bg-[var(--bg)] p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-black">Pitch of the Month Winners</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {winners.map((winner) => (
            <Link key={winner.id} href={`/pitch/${winner.pitch_id}`} className="card p-5">
              <h2 className="font-black">{winner.pitch?.title || "Winner"}</h2>
              <p className="mt-2 text-sm text-[var(--text2)]">{winner.vote_count || 0} votes · {winner.outcome || "Featured winner"}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}