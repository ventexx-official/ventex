"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function InvestorLeaderboardPage() {
  const [enabled, setEnabled] = useState(false);
  const [investors, setInvestors] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "investor_leaderboard").maybeSingle();
      setEnabled(!!flag?.enabled);
      if (flag?.enabled) {
        const { data } = await supabase
          .from("users")
          .select("id, full_name, avatar_url, response_rate, pitches_reviewed_count, intros_made_count")
          .eq("role", "investor")
          .order("response_rate", { ascending: false })
          .limit(50);
        setInvestors(data || []);
      }
    };
    load();
  }, []);

  if (!enabled) return <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-6 text-center"><h1 className="text-4xl font-black">Investor leaderboard coming soon.</h1></main>;

  return (
    <main className="min-h-screen bg-[var(--bg)] p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-black">Investor Leaderboard</h1>
        <div className="mt-8 space-y-3">
          {investors.map((investor, index) => (
            <article key={investor.id} className="flex items-center justify-between border bg-[var(--bg2)] p-4" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <span className="font-black">#{index + 1}</span>
                <div>
                  <h2 className="font-black">{investor.full_name || "Investor"}</h2>
                  <p className="text-sm text-[var(--text2)]">Badge: Verified investor</p>
                </div>
              </div>
              <div className="text-right text-sm text-[var(--text2)]">
                <div>{investor.response_rate || 0}% response</div>
                <div>{investor.pitches_reviewed_count || 0} reviewed · {investor.intros_made_count || 0} intros</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}