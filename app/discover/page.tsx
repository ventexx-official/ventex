"use client";

import { useState, useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { Search, Filter, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { getRunwayDays, shouldShowRunway } from '@/lib/runway';

const INDUSTRIES = ['Fintech', 'Edtech', 'Healthtech', 'SaaS', 'E-commerce', 'AI/ML', 'Cleantech', 'Logistics', 'PropTech', 'AgriTech', 'FoodTech', 'Gaming', 'Media', 'Cybersecurity', 'Other'];
const STAGES = ['Idea', 'Pre-seed', 'Seed', 'Early Growth', 'Growth'];
const COUNTRIES = ['India', 'USA', 'UK', 'Singapore', 'UAE', 'Other'];

function formatCurrency(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString()}`;
}

export default function Discover() {
  const [pitches, setPitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const PAGE_SIZE = 9;

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [minFunding, setMinFunding] = useState('');
  const [maxFunding, setMaxFunding] = useState('');
  const [activelyRaising, setActivelyRaising] = useState(false);
  
  // Sort State
  const [sortBy, setSortBy] = useState('latest');

  const fetchPitches = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setPage(0);
      }

      const currentPage = isLoadMore ? page + 1 : 0;
      const start = currentPage * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      let query = supabase
        .from('pitches')
        .select('*', { count: 'exact' })
        .eq('status', 'live');

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%`);
      }
      
      if (selectedIndustries.length > 0) {
        query = query.in('industry', selectedIndustries);
      }

      if (selectedStages.length > 0) {
        query = query.in('company_stage', selectedStages);
      }

      if (selectedCountry) {
        query = query.eq('country', selectedCountry);
      }

      if (minFunding) {
        query = query.gte('amount_seeking', parseInt(minFunding));
      }

      if (maxFunding) {
        query = query.lte('amount_seeking', parseInt(maxFunding));
      }

      if (activelyRaising) {
        query = query.eq('is_raising', true);
      }

      if (sortBy === 'latest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'most_viewed') {
        query = query.order('views', { ascending: false });
      } else if (sortBy === 'funding_high') {
        query = query.order('amount_seeking', { ascending: false });
      }

      const { data, error, count } = await query.range(start, end);

      if (error) throw error;

      if (data) {
        setFetchError(null);
        if (isLoadMore) {
          setPitches([...pitches, ...data]);
        } else {
          setPitches(data);
        }
        setHasMore(count ? start + data.length < count : false);
        setPage(currentPage);
      }
    } catch (error: any) {
      console.error('Error fetching pitches:', error);
      setFetchError(error?.message || 'Failed to load pitches. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPitches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]); 

  const handleApplyFilters = () => {
    setMobileFiltersOpen(false);
    fetchPitches();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedIndustries([]);
    setSelectedStages([]);
    setSelectedCountry('');
    setMinFunding('');
    setMaxFunding('');
    setActivelyRaising(false);
    // Let fetch happen after state settles, but React state updates batching makes it tricky to call fetchPitches immediately without useEffect.
    // Easiest is to force a re-fetch manually with reset variables here.
    resetAndFetch();
  };

  const resetAndFetch = async () => {
    setSearchQuery('');
    setSelectedIndustries([]);
    setSelectedStages([]);
    setSelectedCountry('');
    setMinFunding('');
    setMaxFunding('');
    setActivelyRaising(false);
    setLoading(true);
    
    // Perform fetch with empty filters immediately
    let query = supabase.from('pitches').select('*', { count: 'exact' }).eq('status', 'live').order('created_at', { ascending: false }).range(0, PAGE_SIZE - 1);
    const { data, count } = await query;
    if (data) {
      setPitches(data);
      setHasMore(count ? data.length < count : false);
      setPage(0);
    }
    setLoading(false);
  }

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const SidebarContent = () => (
    <div className="space-y-8">
      {/* Industry */}
      <div>
        <h3 className="font-bold text-[#222222] dark:text-white mb-4 text-sm tracking-wider uppercase">Industry</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {INDUSTRIES.map((ind) => (
            <label key={ind} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-[#e5e5e5] dark:border-[#444444] bg-white dark:bg-[#111111] text-[#222222] dark:text-white focus:ring-[#222222] dark:focus:ring-white"
                checked={selectedIndustries.includes(ind)}
                onChange={() => toggleArrayItem(selectedIndustries, setSelectedIndustries, ind)}
              />
              <span className="text-sm text-[#888888]">{ind}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stage */}
      <div>
        <h3 className="font-bold text-[#222222] dark:text-white mb-4 text-sm tracking-wider uppercase">Stage</h3>
        <div className="space-y-2">
          {STAGES.map((stage) => (
            <label key={stage} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-[#e5e5e5] dark:border-[#444444] bg-white dark:bg-[#111111] text-[#222222] dark:text-white focus:ring-[#222222] dark:focus:ring-white"
                checked={selectedStages.includes(stage)}
                onChange={() => toggleArrayItem(selectedStages, setSelectedStages, stage)}
              />
              <span className="text-sm text-[#888888]">{stage}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Country */}
      <div>
        <h3 className="font-bold text-[#222222] dark:text-white mb-4 text-sm tracking-wider uppercase">Country</h3>
        <select 
          className="w-full border-[0.5px] border-[#e5e5e5] dark:border-[#444444] rounded-md p-2 text-sm bg-white dark:bg-[#111111] text-[#222222] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#222222]"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          <option value="">All Countries</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Funding Range */}
      <div>
        <h3 className="font-bold text-[#222222] dark:text-white mb-4 text-sm tracking-wider uppercase">Funding Range (₹)</h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            className="w-full border-[0.5px] border-[#e5e5e5] dark:border-[#444444] rounded-md p-2 text-sm bg-white dark:bg-[#111111] text-[#222222] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#222222]"
            value={minFunding}
            onChange={(e) => setMinFunding(e.target.value)}
          />
          <span className="text-[#888888]">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            className="w-full border-[0.5px] border-[#e5e5e5] dark:border-[#444444] rounded-md p-2 text-sm bg-white dark:bg-[#111111] text-[#222222] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#222222]"
            value={maxFunding}
            onChange={(e) => setMaxFunding(e.target.value)}
          />
        </div>
      </div>

      {/* Actively Raising Toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            className="rounded border-[#e5e5e5] dark:border-[#444444] bg-white dark:bg-[#111111] text-[#222222] dark:text-white focus:ring-[#222222] dark:focus:ring-white"
            checked={activelyRaising}
            onChange={(e) => setActivelyRaising(e.target.checked)}
          />
          <span className="text-sm font-medium text-[#222222] dark:text-white">Actively raising only</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t-[0.5px] border-[#e5e5e5] dark:border-[#444444] flex flex-col gap-3">
        <button 
          onClick={handleApplyFilters}
          className="w-full bg-[#222222] dark:bg-white text-white dark:text-[#222222] py-2.5 rounded-md text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors"
        >
          Apply filters
        </button>
        <button 
          onClick={handleResetFilters}
          className="w-full text-center text-[#888888] text-sm hover:text-[#222222] dark:hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-[#111111] min-h-screen pb-24">
        
        {/* Header & Search */}
        <div className="bg-[#F2F2F0] dark:bg-[#1a1a1a] py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#222222] dark:text-white mb-4">Discover startups</h1>
            <p className="text-[#888888] text-lg mb-10 max-w-2xl mx-auto">
              Browse investor-ready startups from across India and the world
            </p>
            <div className="max-w-3xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by startup name, industry, or keyword..." 
                className="w-full pl-12 pr-4 py-4 rounded-full border-[0.5px] border-[#e5e5e5] dark:border-[#444444] bg-white dark:bg-[#222222] text-[#222222] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#222222] dark:focus:ring-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8 items-start">
          
          {/* Mobile Filter Toggle */}
          <div className="w-full md:hidden flex items-center justify-between border-b-[0.5px] border-[#e5e5e5] dark:border-[#444444] pb-4 mb-4">
            <h2 className="font-bold text-[#222222] dark:text-white">Pitches</h2>
            <button 
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 border-[0.5px] border-[#e5e5e5] dark:border-[#444444] px-4 py-2 rounded-md text-sm font-medium text-[#222222] dark:text-white"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden md:block w-[260px] flex-shrink-0 sticky top-8">
            <SidebarContent />
          </div>

          {/* Right Content */}
          <div className="flex-1 w-full">
            
            {/* Sort Bar — visible on all screen sizes */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-[#888888] font-medium">{pitches.length > 0 ? `${pitches.length} startups` : ''}</p>
              <select 
                className="border-[0.5px] border-[#e5e5e5] dark:border-[#444444] rounded-md p-2 text-sm bg-white dark:bg-[#111111] text-[#222222] dark:text-white focus:outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Latest</option>
                <option value="most_viewed">Most viewed</option>
                <option value="funding_high">Funding: High to low</option>
              </select>
            </div>

            {/* Error State */}
            {fetchError && (
              <div className="bg-red-50 dark:bg-red-900/20 border-[0.5px] border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6 text-center">
                <p className="text-red-600 dark:text-red-400 font-medium text-sm mb-3">{fetchError}</p>
                <button
                  onClick={() => fetchPitches()}
                  className="text-sm font-bold text-red-600 dark:text-red-400 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 flex md:hidden">
                <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)}></div>
                <div className="relative w-4/5 max-w-sm bg-white dark:bg-[#111111] h-full p-6 overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="font-bold text-xl text-[#222222] dark:text-white">Filters</h2>
                    <button onClick={() => setMobileFiltersOpen(false)} className="text-[#888888] hover:text-[#222222] dark:hover:text-white">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <SidebarContent />
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading && page === 0 ? (
                /* Skeleton Loaders */
                [...Array(6)].map((_, i) => (
                  <div key={i} className="border-[0.5px] border-[#e5e5e5] dark:border-[#444444] rounded-[12px] p-6 bg-white dark:bg-[#222222] animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-[#333333] rounded-md mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[#333333] rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-[#333333] rounded w-1/4 mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-200 dark:bg-[#333333] rounded w-full"></div>
                      <div className="h-3 bg-gray-200 dark:bg-[#333333] rounded w-full"></div>
                      <div className="h-3 bg-gray-200 dark:bg-[#333333] rounded w-2/3"></div>
                    </div>
                    <div className="h-20 bg-gray-200 dark:bg-[#333333] rounded-md mb-4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-[#333333] rounded-md"></div>
                  </div>
                ))
              ) : pitches.length === 0 ? (
                /* Empty State */
                <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
                  <div className="bg-[#F2F2F0] dark:bg-[#1a1a1a] p-6 rounded-full mb-6">
                    <Filter className="w-8 h-8 text-[#888888]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#222222] dark:text-white mb-2">No pitches found</h3>
                  <p className="text-[#888888] max-w-md">Try adjusting your filters or search query to find what you're looking for.</p>
                  <button 
                    onClick={handleResetFilters}
                    className="mt-6 border-[0.5px] border-[#e5e5e5] dark:border-[#444444] px-6 py-2 rounded-md text-sm font-medium text-[#222222] dark:text-white hover:bg-[#F2F2F0] dark:hover:bg-[#222222] transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                /* Pitch Cards */
                pitches.map((pitch) => {
                  const valuation = pitch.amount_seeking && pitch.equity_pct 
                    ? pitch.amount_seeking / (pitch.equity_pct / 100)
                    : 0;
                  const runwayDays = getRunwayDays(pitch.round_closes_at);
                  const showRunway = shouldShowRunway(pitch.is_raising, pitch.round_closes_at);

                  return (
                    <Link key={pitch.id} href={`/pitch/${pitch.id}`} className="border-[0.5px] border-[#e5e5e5] dark:border-[#444444] rounded-[12px] p-6 bg-white dark:bg-[#222222] flex flex-col transition-all hover:shadow-lg hover:border-[#cccccc] dark:hover:border-[#555555] hover:-translate-y-0.5">
                      <div className="flex justify-between items-start mb-4 gap-2">
                        <div className="w-10 h-10 bg-[#222222] dark:bg-[#111111] rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                          {pitch.logo_url ? <img src={pitch.logo_url} alt={pitch.title} className="w-full h-full object-cover" /> : <span className="text-white text-xs font-bold">{pitch.title?.[0]}</span>}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {showRunway && runwayDays !== null && (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                              ⏰ Closes in {runwayDays} {runwayDays === 1 ? 'day' : 'days'}
                            </span>
                          )}
                          {pitch.is_raising ? (
                            <span className="bg-[#222222] dark:bg-[#111111] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Raising</span>
                          ) : (
                            <span className="bg-[#e5e5e5] dark:bg-[#444444] text-[#222222] dark:text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Verified</span>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-[#222222] dark:text-white text-[14px] mb-3">{pitch.title}</h3>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <Sparkles className="w-3 h-3 text-[#888888]" />
                        <span className="text-[#888888] text-[11px] font-medium uppercase tracking-wider">AI Briefing</span>
                      </div>
                      
                      <p className="text-[#888888] text-[13px] leading-[1.6] line-clamp-3 mb-4 flex-grow">
                        {pitch.ai_summary || pitch.short_description || 'No description available.'}
                      </p>
                      
                      <div className="flex gap-2 mb-6 flex-wrap">
                        {pitch.industry && <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#222222] dark:text-white text-[10px] px-2 py-1 rounded-md">{pitch.industry}</span>}
                        {pitch.company_stage && <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#222222] dark:text-white text-[10px] px-2 py-1 rounded-md">{pitch.company_stage}</span>}
                        {pitch.country && <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#222222] dark:text-white text-[10px] px-2 py-1 rounded-md">{pitch.country}</span>}
                      </div>
                      
                      <hr className="border-[#e5e5e5] dark:border-[#444444] mb-4" />
                      
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="bg-[#F2F2F0] dark:bg-[#333333] p-2 rounded-md text-center">
                          <div className="text-[10px] text-[#888888] mb-1">Seeking</div>
                          <div className="text-[11px] font-bold text-[#222222] dark:text-white">{pitch.amount_seeking ? formatCurrency(pitch.amount_seeking) : 'N/A'}</div>
                        </div>
                        <div className="bg-[#F2F2F0] dark:bg-[#333333] p-2 rounded-md text-center">
                          <div className="text-[10px] text-[#888888] mb-1">Equity</div>
                          <div className="text-[11px] font-bold text-[#222222] dark:text-white">{pitch.equity_pct ? `${pitch.equity_pct}%` : 'N/A'}</div>
                        </div>
                        <div className="bg-[#F2F2F0] dark:bg-[#333333] p-2 rounded-md text-center">
                          <div className="text-[10px] text-[#888888] mb-1">Valuation</div>
                          <div className="text-[11px] font-bold text-[#222222] dark:text-white">{valuation ? formatCurrency(valuation) : 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[#888888] text-sm hover:text-[#222222] dark:hover:text-white underline decoration-[0.5px] underline-offset-4">Read full pitch &rarr;</span>
                        <span className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-4 py-2 rounded-md text-sm font-medium hover:bg-black dark:hover:bg-gray-200 transition-colors">View</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Load More Button */}
            {hasMore && !loading && pitches.length > 0 && (
              <div className="mt-12 text-center">
                <button 
                  onClick={() => fetchPitches(true)}
                  disabled={loadingMore}
                  className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-8 py-3 rounded-full text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
