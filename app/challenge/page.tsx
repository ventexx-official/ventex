"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ChallengePage() {
  const [enabled, setEnabled] = useState(false);
  const [pitches, setPitches] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "cold_pitch_challenge").maybeSingle();
      setEnabled(!!flag?.enabled);
      if (flag?.enabled) {
        const { data } = await supabase.from("pitches").select("*").eq("challenge", true).in("status", ["live", "published"]).order("created_at", { ascending: false });
        setPitches(data || []);
      }
    };
    load();
  }, []);

  if (!enabled) return <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-6 text-center"><h1 className="text-4xl font-black">Cold Pitch Challenge coming soon.</h1></main>;

  return (
    <main className="min-h-screen bg-[var(--bg)] p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-black">Cold Pitch Challenge</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {pitches.map((pitch) => (
            <Link key={pitch.id} href={`/pitch/${pitch.id}`} className="card p-5">
              <h2 className="font-black">{pitch.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--text2)]">{pitch.tagline || pitch.short_description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
