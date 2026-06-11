"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Tag,
  ArrowRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Live Countdown Timer Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
function DealCountdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft('');
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) {
        setTimeLeft(`${d}d ${h}h ${m}m`);
      } else {
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (expired) return null;

  const isUrgent = (() => {
    const diff = new Date(endDate).getTime() - Date.now();
    return diff < 3600000; // under 1 hour
  })();

  return (
    <div className={`flex items-center gap-1.5 mt-2 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full w-fit ${
      isUrgent
        ? 'bg-red-100 text-red-600 animate-pulse'
        : 'bg-amber-100 text-amber-700'
    }`}>
      <Clock className="w-2.5 h-2.5 flex-shrink-0" />
      Deal ends in {timeLeft}
    </div>
  );
}

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Deal Banner Countdown Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
function BannerCountdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endDate]);

  if (expired) return null;

  const pads = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
      <Clock className="w-3.5 h-3.5" />
      {timeLeft.d > 0 && <span>{timeLeft.d}d </span>}
      <span>{pads(timeLeft.h)}:{pads(timeLeft.m)}:{pads(timeLeft.s)}</span>
    </div>
  );
}

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Main Page Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tick, setTick] = useState(0); // forces re-evaluation of expired deals

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [dealsOnly, setDealsOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [listingTab, _setListingTab] = useState<'All' | 'software' | 'freelance' | 'job'>('All');

  const CATEGORIES = ['All', 'Software', 'Templates', 'Services', 'Hardware', 'Courses'];
  const _TYPES = ['All', 'fixed_price', 'custom_work'];

  // Global 1-minute tick to remove expired deals from view automatically
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const [activeTab, setActiveTab] = useState<'Explore' | 'Purchases'>('Explore');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:seller_id ( id, full_name, avatar_url ),
          pitch:pitch_id ( id, title )
        `)
        .in('status', ['live', 'published']);
        
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'Purchases') {
      if (!user) return;
      const fetchPurchases = async () => {
        setLoadingPurchases(true);
        // Assuming 'orders' table links buyer_id to product_id
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            product:product_id (
              *,
              seller:seller_id ( id, full_name, avatar_url )
            )
          `)
          .eq('buyer_id', user.id);
          
        if (!error && data) {
          setPurchases(data.map(o => o.product).filter(Boolean));
        }
        setLoadingPurchases(false);
      };
      fetchPurchases();
    }
  }, [activeTab, user]);

  // Active deals Ã¢â‚¬â€ re-evaluated each tick to auto-remove expired ones
  const activeDeals = useMemo(() => {
    const now = new Date();
    return products.filter(p => p.discount_price && p.deal_end_date && new Date(p.deal_end_date) > now);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, tick]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    const now = new Date();
    return products.filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (selectedSector !== 'All' && p.sector !== selectedSector) return false;
      if (selectedType !== 'All' && p.type !== selectedType) return false;
      const listingType = p.listing_type || (p.type === 'freelance' || p.type === 'job' ? p.type : 'software');
      if (listingTab !== 'All' && listingType !== listingTab) return false;
      if (dealsOnly && (!p.discount_price || !p.deal_end_date || new Date(p.deal_end_date) <= now)) return false;
      if (minRating > 0 && (p.average_rating || 0) < minRating) return false;
      
      const priceToCompare = p.discount_price || p.price;
      if (priceMin && priceToCompare < parseInt(priceMin)) return false;
      if (priceMax && priceToCompare > parseInt(priceMax)) return false;

      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchQuery, selectedCategory, selectedSector, selectedType, dealsOnly, minRating, priceMin, priceMax, listingTab, tick]);

  return (
    <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111] pb-24">
      {/* HEADER */}
      <div className="bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-b-[0.5px] border-[#e5e5e5] dark:border-[#333333] pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#222222] dark:text-white uppercase tracking-tighter flex items-center gap-3">
              <ShoppingBag className="w-8 h-8" />
              Marketplace
            </h1>
            <p className="text-[#888888] mt-2">Discover premium startup tools, services, and assets.</p>
          </div>
          
          <div className="relative w-full md:w-96 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#F2F2F0] dark:bg-[#111111] border-[0.5px] border-transparent rounded-2xl text-sm font-medium focus:outline-none focus:bg-[var(--card-bg)] dark:focus:bg-[#222222] focus:border-[#222222] dark:focus:border-white transition-all text-[#222222] dark:text-white placeholder-[#888888]"
            />
          </div>
        </div>
      </div>

      <div className="border-b-[0.5px] border-[#e5e5e5] bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-800 dark:border-[#333333] dark:bg-emerald-950 dark:text-emerald-100">
        <div className="mx-auto max-w-7xl">
          Ventex Premium is for marketplace access Ã¢â‚¬â€ buying software, hiring, and custom build requests. For investment features, see <a href="/pricing" className="underline underline-offset-4">Investor Accounts</a>.
        </div>
      </div>

      {/* DEALS BANNER with countdown */}
      {activeDeals.length > 0 && !dealsOnly && (
        <div className="bg-[#222222] text-white py-8 px-6 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 mb-6 text-emerald-400">
              <Sparkles className="w-5 h-5" /> Live Deals Ã¢â‚¬â€ Ends Soon
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'none' }}>
              {activeDeals.map(deal => (
                <div key={deal.id} className="min-w-[300px] max-w-[300px] bg-[#333333] rounded-2xl p-4 snap-start border-[0.5px] border-[#444444] shadow-xl relative group flex-shrink-0">
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full z-10 shadow-lg">
                    {Math.round((1 - deal.discount_price / deal.price) * 100)}% OFF
                  </span>
                  <div className="aspect-video bg-[#222222] rounded-xl overflow-hidden mb-4 relative">
                    {deal.images_urls?.[0] ? (
                      <img loading="lazy" src={deal.images_urls[0]} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#555555]">
                        <ShoppingBag className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm truncate">{deal.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-black text-emerald-400">Ã¢â€šÂ¹{deal.discount_price?.toLocaleString()}</span>
                    <span className="text-xs text-[#888888] line-through font-medium">Ã¢â€šÂ¹{deal.price?.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t-[0.5px] border-[#444444] flex items-center justify-between">
                    {deal.deal_end_date && <BannerCountdown endDate={deal.deal_end_date} />}
                    <Link href={`/marketplace/${deal.id}`} className="text-white hover:text-emerald-400 flex items-center gap-1 text-xs font-bold transition-colors ml-auto">
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row gap-10">
        
        {/* FILTER SIDEBAR (Only visible in Explore) */}
        {(activeTab === 'Explore' && (loading || products.length > 0)) ? <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-[#222222] dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </h2>
            {(selectedCategory !== 'All' || selectedSector !== 'All' || selectedType !== 'All' || dealsOnly || minRating > 0 || priceMin || priceMax) && (
              <button 
                onClick={() => {
                  setSelectedCategory('All'); setSelectedSector('All'); setSelectedType('All'); 
                  setDealsOnly(false); setMinRating(0); setPriceMin(''); setPriceMax('');
                }}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Category */}
            <div>
              <label className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-3 block">Category</label>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category"
                      checked={selectedCategory === cat} 
                      onChange={() => setSelectedCategory(cat)}
                      className="w-4 h-4 text-[#222222] border-gray-300 focus:ring-[#222222]" 
                    />
                    <span className={`text-sm font-medium transition-colors ${selectedCategory === cat ? 'text-[#222222] dark:text-white font-bold' : 'text-[#888888] group-hover:text-[#222222] dark:group-hover:text-gray-300'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type */}
            <div className="border-t-[0.5px] border-[#e5e5e5] dark:border-[#333333] pt-6">
              <label className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-3 block">Type</label>
              <div className="space-y-2">
                {[
                  { value: 'All', label: 'All' },
                  { value: 'fixed_price', label: 'Fixed Price' },
                  { value: 'custom_work', label: 'Custom Work' },
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" checked={selectedType === value} onChange={() => setSelectedType(value)} className="w-4 h-4 text-[#222222] border-gray-300 focus:ring-[#222222]" />
                    <span className={`text-sm font-medium ${selectedType === value ? 'text-[#222222] dark:text-white font-bold' : 'text-[#888888]'}`}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Deals Only Toggle */}
            <div className="border-t-[0.5px] border-[#e5e5e5] dark:border-[#333333] pt-6">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-bold text-[#222222] dark:text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-500" /> Deals Only
                </span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={dealsOnly} onChange={(e) => setDealsOnly(e.target.checked)} />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-[#333333] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--card-bg)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#222222] dark:peer-checked:bg-emerald-500"></div>
                </div>
              </label>
            </div>

            {/* Price Range */}
            <div className="border-t-[0.5px] border-[#e5e5e5] dark:border-[#333333] pt-6">
              <label className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-3 block">Price Range (Ã¢â€šÂ¹)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" placeholder="Min" value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-lg text-sm text-[#222222] dark:text-white focus:outline-none focus:border-[#222222]" 
                />
                <span className="text-[#888888]">-</span>
                <input 
                  type="number" placeholder="Max" value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-lg text-sm text-[#222222] dark:text-white focus:outline-none focus:border-[#222222]" 
                />
              </div>
            </div>

            {/* Rating */}
            <div className="border-t-[0.5px] border-[#e5e5e5] dark:border-[#333333] pt-6">
              <label className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-3 block">Rating</label>
              <div className="space-y-2">
                {[0, 4, 3].map(rating => (
                  <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" checked={minRating === rating} onChange={() => setMinRating(rating)} className="w-4 h-4 text-[#222222] border-gray-300 focus:ring-[#222222]" />
                    <span className={`text-sm font-medium flex items-center gap-1 ${minRating === rating ? 'text-[#222222] dark:text-white font-bold' : 'text-[#888888]'}`}>
                      {rating === 0 ? 'All Ratings' : (
                        <>{rating} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> & Up</>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside> : null}

        {/* MAIN CONTENT AREA */}
        <div className="flex-1">
          {/* TABS */}
          <div className="mb-6 flex gap-2 border-b-[0.5px] border-[#e5e5e5] dark:border-[#333333] pb-4">
            <button
              onClick={() => setActiveTab('Explore')}
              className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'Explore' ? 'border-[#222222] text-[#222222] dark:border-white dark:text-white' : 'border-transparent text-[#888888] hover:text-[#222222] dark:hover:text-white'}`}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab('Purchases')}
              className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'Purchases' ? 'border-[#222222] text-[#222222] dark:border-white dark:text-white' : 'border-transparent text-[#888888] hover:text-[#222222] dark:hover:text-white'}`}
            >
              My Purchases
            </button>
          </div>

          {activeTab === 'Explore' ? (
            <>
              {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-3xl p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-[#e5e5e5] dark:text-[#333333] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#222222] dark:text-white mb-2">{products.length === 0 ? 'No products listed yet.' : 'No products found'}</h3>
              <p className="text-[#888888] mb-6">{products.length === 0 ? 'Are you a founder with a product to sell?' : 'Try adjusting your filters or search query.'}</p>
              {products.length === 0 ? (
                <Link href="/founder/store/new-product" className="bg-[#222222] dark:bg-[var(--card-bg)] text-white dark:text-[#222222] px-6 py-2.5 rounded-full text-sm font-bold transition-colors">
                  List your product
                </Link>
              ) : (
                <button 
                  onClick={() => {
                    setSearchQuery(''); setSelectedCategory('All'); setSelectedSector('All'); 
                    setSelectedType('All'); setDealsOnly(false); setMinRating(0); setPriceMin(''); setPriceMax('');
                  }}
                  className="bg-[#222222] dark:bg-[var(--card-bg)] text-white dark:text-[#222222] px-6 py-2.5 rounded-full text-sm font-bold transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-bold text-[#888888]">Showing {filteredProducts.length} results</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#222222] dark:text-white uppercase tracking-widest">Sort by:</span>
                  <select className="bg-transparent text-sm font-bold text-[#888888] focus:outline-none cursor-pointer">
                    <option>Recommended</option>
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(product => {
                  const now = new Date();
                  const isDeal = product.discount_price && product.deal_end_date && new Date(product.deal_end_date) > now;
                  const listingType = product.listing_type || (product.type === 'freelance' || product.type === 'job' ? product.type : 'software');
                  const isCustom = product.type === 'custom_work';
                  const isFreelance = listingType === 'freelance';
                  const isJob = listingType === 'job';

                  return (
                    <div key={product.id} className="bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] overflow-hidden group hover:shadow-xl hover:border-[#cccccc] dark:hover:border-[#555555] transition-all flex flex-col h-full relative">
                      {isDeal && (
                        <span className="absolute top-4 left-4 bg-[#222222] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full z-10 shadow-lg flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                        </span>
                      )}
                      
                      <Link href={`/marketplace/${product.id}`} className="block aspect-video bg-[#F2F2F0] dark:bg-[#222222] relative overflow-hidden">
                        {product.images_urls?.[0] ? (
                          <img loading="lazy" src={product.images_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#cccccc] dark:text-[#444444]">
                            <ShoppingBag className="w-10 h-10" />
                          </div>
                        )}
                      </Link>

                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Link href={`/marketplace/${product.id}`}>
                            <h3 className="font-bold text-[#222222] dark:text-white text-base leading-tight group-hover:underline decoration-2 underline-offset-2">{product.name}</h3>
                          </Link>
                          {(isCustom || isFreelance || isJob) && (
                            <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#888888] dark:text-gray-300 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded flex-shrink-0">
                              {isJob ? 'Job' : isFreelance ? 'Freelance' : 'Request'}
                            </span>
                          )}
                        </div>

                        {product.pitch && (
                          <Link href={`/pitch/${product.pitch.id}`} className="text-xs text-[#888888] hover:text-[#222222] dark:hover:text-white transition-colors mb-2 line-clamp-1">
                            By {product.seller?.full_name || 'Anonymous'} ({product.pitch.title})
                          </Link>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className={`w-3.5 h-3.5 ${product.average_rating > 0 ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-[#444444]'}`} />
                            <span className="text-xs font-bold text-[#222222] dark:text-white">{product.average_rating > 0 ? product.average_rating.toFixed(1) : 'New'}</span>
                          </div>
                          {product.review_count > 0 && (
                            <span className="text-[10px] text-[#888888]">({product.review_count})</span>
                          )}
                        </div>

                        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Live countdown timer on card Ã¢â€â‚¬Ã¢â€â‚¬ */}
                        {isDeal && product.deal_end_date && (
                          <DealCountdown endDate={product.deal_end_date} />
                        )}

                        <div className="mt-auto pt-4 border-t-[0.5px] border-[#e5e5e5] dark:border-[#333333] flex items-end justify-between">
                          <div>
                            {isJob ? (
                              <p className="text-[#888888] text-[10px] font-bold uppercase tracking-widest mb-0.5">{product.job_type || 'Role'}</p>
                            ) : isCustom || isFreelance ? (
                              <p className="text-[#888888] text-[10px] font-bold uppercase tracking-widest mb-0.5">Starts from</p>
                            ) : null}
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-black text-[#222222] dark:text-white">
                                Ã¢â€šÂ¹{(product.discount_price || product.price).toLocaleString()}
                              </span>
                              {isDeal && !isCustom && (
                                <span className="text-xs text-[#888888] line-through font-medium">Ã¢â€šÂ¹{product.price.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                          
                          {isJob ? (
                            <a href={product.apply_url || (product.apply_email ? `mailto:${product.apply_email}` : `/marketplace/${product.id}`)} className="border-[1.5px] border-[#222222] dark:border-white text-[#222222] dark:text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#F2F2F0] dark:hover:bg-[#222222] transition-colors">
                              Apply
                            </a>
                          ) : isCustom || isFreelance ? (
                            <Link href={`/marketplace/${product.id}`} className="border-[1.5px] border-[#222222] dark:border-white text-[#222222] dark:text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#F2F2F0] dark:hover:bg-[#222222] transition-colors">
                              Request
                            </Link>
                          ) : (
                            <Link href={`/marketplace/${product.id}`} className="bg-[#222222] dark:bg-[var(--card-bg)] text-white dark:text-[#222222] px-4 py-2 rounded-full text-xs font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-md">
                              Buy Now
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          </>
        ) : (
          /* PURCHASES TAB */
          <div>
              {!user ? (
                <div className="bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-[#e5e5e5] dark:text-[#333333] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#222222] dark:text-white mb-2">Sign in to view your purchases</h3>
                  <Link href="/login" className="bg-[#222222] dark:bg-[var(--card-bg)] text-white dark:text-[#222222] px-6 py-2.5 rounded-full text-sm font-bold transition-colors inline-block mt-4">
                    Sign In
                  </Link>
                </div>
              ) : loadingPurchases ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin"></div>
                </div>
              ) : purchases.length === 0 ? (
                <div className="bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-[#e5e5e5] dark:text-[#333333] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#222222] dark:text-white mb-2">No purchases yet</h3>
                  <p className="text-[#888888]">When you buy products on Ventex, they will appear here.</p>
                  <button onClick={() => setActiveTab('Explore')} className="bg-[#222222] dark:bg-[var(--card-bg)] text-white dark:text-[#222222] px-6 py-2.5 rounded-full text-sm font-bold transition-colors inline-block mt-6">
                    Explore Marketplace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {purchases.map(product => (
                    <div key={product.id} className="bg-[var(--card-bg)] dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] overflow-hidden group hover:shadow-xl hover:border-[#cccccc] dark:hover:border-[#555555] transition-all flex flex-col h-full relative">
                      <Link href={`/marketplace/${product.id}`} className="block aspect-video bg-[#F2F2F0] dark:bg-[#222222] relative overflow-hidden">
                        {product.images_urls?.[0] ? (
                          <img loading="lazy" src={product.images_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#cccccc] dark:text-[#444444]">
                            <ShoppingBag className="w-10 h-10" />
                          </div>
                        )}
                      </Link>

                      <div className="p-5 flex flex-col flex-grow">
                        <Link href={`/marketplace/${product.id}`}>
                          <h3 className="font-bold text-[#222222] dark:text-white text-base leading-tight group-hover:underline decoration-2 underline-offset-2">{product.name}</h3>
                        </Link>
                        
                        <div className="mt-auto pt-4 border-t-[0.5px] border-[#e5e5e5] dark:border-[#333333] flex justify-end">
                          <Link href={`/marketplace/${product.id}`} className="border-[1.5px] border-[#222222] dark:border-white text-[#222222] dark:text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#F2F2F0] dark:hover:bg-[#222222] transition-colors shadow-md">
                            Access Product
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}