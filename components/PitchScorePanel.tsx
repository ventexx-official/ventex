"use client";

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

const SCORE_KEYS = [
  ['problem_clarity', 'Problem'],
  ['market_size', 'Market'],
  ['team_strength', 'Team'],
  ['traction', 'Traction'],
  ['business_model', 'Model'],
] as const;

export default function PitchScorePanel({ pitchId }: { pitchId: string }) {
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<any>(null);
  const [error, setError] = useState('');

  const scorePitch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/score-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scoring failed');
      setScore(data.score);
    } catch (err: any) {
      setError(err.message || 'Could not score pitch');
    } finally {
      setLoading(false);
    }
  };

  if (!score) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={scorePitch}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#F2F2F0] px-3 py-1.5 text-xs font-black text-[#222222] hover:bg-[#e5e5e5] disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {loading ? 'Scoring...' : 'Score My Pitch'}
        </button>
        {error ? <p className="text-[11px] font-semibold text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-[#e5e5e5] bg-[#F8F8F8] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-widest text-[#888888]">AI score</span>
        <span className="text-lg font-black text-[#222222]">{score.overall}/100</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {SCORE_KEYS.map(([key, label]) => (
          <div key={key} className="text-center">
            <div className="text-sm font-black text-[#222222]">{score[key] ?? 0}</div>
            <div className="text-[9px] font-bold text-[#888888]">{label}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs font-medium leading-relaxed text-[#666666]">{score.feedback}</p>
    </div>
  );
}
