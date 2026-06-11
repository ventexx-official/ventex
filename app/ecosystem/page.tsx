"use client";

import { useEffect, useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { supabase } from '@/lib/supabase';

const INDIA_TOPO = 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json';

function stateColor(count: number) {
  if (count >= 10) return '#16a34a';
  if (count >= 4) return '#4ade80';
  if (count >= 1) return '#bbf7d0';
  return '#f0f0f0';
}

export default function EcosystemPage() {
  const [pitches, setPitches] = useState<any[]>([]);
  const [hovered, setHovered] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('pitches')
        .select('id, title, state, industry')
        .eq('status', 'live');
      setPitches(data || []);
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const byState = new Map<string, { count: number; sectors: Record<string, number> }>();
    pitches.forEach((pitch) => {
      const state = pitch.state || 'Unknown';
      const current = byState.get(state) || { count: 0, sectors: {} };
      current.count += 1;
      if (pitch.industry) current.sectors[pitch.industry] = (current.sectors[pitch.industry] || 0) + 1;
      byState.set(state, current);
    });
    return byState;
  }, [pitches]);

  const rows = Array.from(stats.entries())
    .filter(([state]) => state !== 'Unknown')
    .sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="min-h-screen bg-[#F2F2F0] px-4 py-10">
      <main className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-4xl font-black tracking-tighter text-[#222222]">India startup heat map</h1>
          <p className="mt-2 text-sm font-medium text-[#666666]">Startup density by state, powered by live Ventex pitch data.</p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-3xl border border-[#e5e5e5] bg-[var(--card-bg)] p-4">
            <ComposableMap projection="geoMercator" projectionConfig={{ center: [82, 23], scale: 900 }} className="h-[560px] w-full">
              <Geographies geography={INDIA_TOPO}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const name = geo.properties.NAME_1 || geo.properties.name || geo.properties.NAME || '';
                    const item = stats.get(name);
                    const topSector = item ? Object.entries(item.sectors).sort((a, b) => b[1] - a[1])[0]?.[0] : 'No sector yet';
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={stateColor(item?.count || 0)}
                        stroke="#ffffff"
                        strokeWidth={0.6}
                        onMouseEnter={() => setHovered({ name, count: item?.count || 0, topSector })}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          default: { outline: 'none' },
                          hover: { outline: 'none', fill: '#15803d' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-[#e5e5e5] bg-[var(--card-bg)] p-6">
              <div className="text-xs font-black uppercase tracking-widest text-[#888888]">Hover details</div>
              <div className="mt-3 text-2xl font-black text-[#222222]">{hovered?.name || 'Select a state'}</div>
              <p className="mt-2 text-sm font-medium text-[#666666]">
                {hovered ? `${hovered.count} startups · Top sector: ${hovered.topSector}` : 'Hover over the map to inspect startup count and top sector.'}
              </p>
            </div>
            <div className="rounded-3xl border border-[#e5e5e5] bg-[var(--card-bg)] p-6">
              <div className="mb-3 text-xs font-black uppercase tracking-widest text-[#888888]">Top states</div>
              <div className="space-y-3">
                {rows.slice(0, 8).map(([state, item]) => (
                  <div key={state} className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-bold text-[#222222]">{state}</span>
                    <span className="font-black text-emerald-700">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}