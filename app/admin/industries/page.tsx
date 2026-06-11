"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  Loader2,
  RefreshCw,
  Search,
  Lightbulb
} from "lucide-react";

interface Sector {
  name: string;
  created_at: string;
}

export default function AdminIndustries() {
  const [officialSectors, setOfficialSectors] = useState<Sector[]>([]);
  const [proposedSectors, setProposedSectors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newSectorName, setNewSectorName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [{ data: sectors }, { data: pitches }] = await Promise.all([
        supabase.from("sectors").select("name, created_at").order("name"),
        supabase.from("pitches").select("custom_industry").not("custom_industry", "is", null),
      ]);

      const officialNames = new Set((sectors || []).map((s: Sector) => s.name.toLowerCase()));

      const proposed = Array.from(
        new Set(
          (pitches || [])
            .map((p: any) => p.custom_industry?.trim())
            .filter((name: string) => name && !officialNames.has(name.toLowerCase()))
        )
      ) as string[];

      setOfficialSectors(sectors || []);
      setProposedSectors(proposed);
    } catch (err) {
      console.error("Error loading sectors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addSector = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      setAddLoading(true);
      const { error } = await supabase
        .from("sectors")
        .insert({ name: trimmed });
      if (error) throw error;
      await fetchData();
      setNewSectorName("");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setAddLoading(false);
    }
  };

  const approveSector = async (name: string) => {
    try {
      setActionLoading(name);
      const { error } = await supabase.from("sectors").insert({ name: name.trim() });
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteSector = async (name: string) => {
    if (!confirm(`Delete sector "${name}"? This cannot be undone.`)) return;
    try {
      setActionLoading(name);
      const { error } = await supabase.from("sectors").delete().eq("name", name);
      if (error) throw error;
      setOfficialSectors((prev) => prev.filter((s) => s.name !== name));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSectors = officialSectors.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Industry Sector Manager</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Manage the official list of industry sectors available on Ventex. Approve custom suggestions from founders.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 border border-neutral-800 text-xs font-semibold text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Official Sectors List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search + Add */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search sectors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0F0F13] border border-neutral-900 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>

            {/* Add New Sector Form */}
            <div className="bg-[#0F0F13] border border-neutral-900 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
                <Plus size={14} className="text-violet-400" /> Add Sector Manually
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. Quantum Computing"
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSector(newSectorName)}
                  className="flex-1 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
                <button
                  onClick={() => addSector(newSectorName)}
                  disabled={addLoading || !newSectorName.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {addLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  Add Sector
                </button>
              </div>
            </div>

            {/* Official List */}
            <div className="bg-[#0F0F13] border border-neutral-900 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-900 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Tag size={14} className="text-violet-400" /> Official Sectors
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {filteredSectors.length} of {officialSectors.length}
                </span>
              </div>
              <div className="divide-y divide-neutral-900 max-h-[480px] overflow-y-auto">
                {filteredSectors.map((sector) => {
                  const isLoading = actionLoading === sector.name;
                  return (
                    <div
                      key={sector.name}
                      className="flex items-center justify-between px-6 py-3 hover:bg-neutral-900/20 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-violet-500/60" />
                        <span className="text-sm text-neutral-200 font-medium">{sector.name}</span>
                        <span className="text-[10px] text-neutral-600 font-mono">
                          {new Date(sector.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteSector(sector.name)}
                        disabled={isLoading}
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-950/20 border border-red-900/40 text-red-400 text-xs font-bold rounded-lg hover:bg-red-950/40 transition-all disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                        Remove
                      </button>
                    </div>
                  );
                })}
                {filteredSectors.length === 0 && (
                  <div className="px-6 py-8 text-center text-xs text-neutral-500 italic">
                    No sectors match your search.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Proposed Sectors */}
          <div className="space-y-4">
            <div className="bg-[#0F0F13] border border-amber-900/30 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-amber-900/30 bg-amber-950/10">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Lightbulb size={14} /> Proposed by Founders
                </h3>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Custom industries entered by founders not yet in the official list.
                </p>
              </div>
              <div className="divide-y divide-neutral-900">
                {proposedSectors.length === 0 ? (
                  <div className="px-5 py-8 text-center text-xs text-neutral-500 italic">
                    No custom sectors proposed yet.
                  </div>
                ) : (
                  proposedSectors.map((name) => {
                    const isLoading = actionLoading === name;
                    return (
                      <div
                        key={name}
                        className="flex items-center justify-between px-5 py-3 hover:bg-neutral-900/20 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500/60" />
                          <span className="text-sm text-neutral-300 font-medium">{name}</span>
                        </div>
                        <button
                          onClick={() => approveSector(name)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-950/40 transition-all disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                          Approve
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-[#0F0F13] border border-neutral-900 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Quick Stats</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Official Sectors</span>
                  <span className="font-bold text-white font-mono">{officialSectors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pending Proposals</span>
                  <span className="font-bold text-amber-400 font-mono">{proposedSectors.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}