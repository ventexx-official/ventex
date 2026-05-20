"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Star, 
  Clock, 
  Tag,
  ArrowRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [dealsOnly, setDealsOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);

  // Constants for filters
  const CATEGORIES = ['All', 'Software', 'Templates', 'Services', 'Hardware', 'Courses'];
  const SECTORS = ['All', 'SaaS', 'Fintech', 'Healthtech', 'Edtech', 'E-commerce', 'Enterprise', 'Consumer Tech', 'Marketing', 'Other'];
  const TYPES = ['All', 'fixed_price', 'custom_work'];

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
        .eq('status', 'live');
        
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Active deals calculation
  const activeDeals = useMemo(() => {
    const now = new Date();
    return products.filter(p => p.discount_price && p.deal_end_date && new Date(p.deal_end_date) > now);
  }, [products]);

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (selectedSector !== 'All' && p.sector !== selectedSector) return false;
      if (selectedType !== 'All' && p.type !== selectedType) return false;
      if (dealsOnly && (!p.discount_price || !p.deal_end_date || new Date(p.deal_end_date) <= new Date())) return false;
      if (minRating > 0 && (p.average_rating || 0) < minRating) return false;
      
      const priceToCompare = p.discount_price || p.price;
      if (priceMin && priceToCompare < parseInt(priceMin)) return false;
      if (priceMax && priceToCompare > parseInt(priceMax)) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedSector, selectedType, dealsOnly, minRating, priceMin, priceMax]);

  return (
    <div className="min-h-screen bg-[#F2F2F0] dark:bg-[#111111] pb-24">
      {/* HEADER */}
      <div className="bg-white dark:bg-[#1a1a1a] border-b-[0.5px] border-[#e5e5e5] dark:border-[#333333] pt-12 pb-8 px-6">
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
              className="w-full pl-12 pr-4 py-3.5 bg-[#F2F2F0] dark:bg-[#111111] border-[0.5px] border-transparent rounded-2xl text-sm font-medium focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:border-[#222222] dark:focus:border-white transition-all text-[#222222] dark:text-white placeholder-[#888888]"
            />
          </div>
        </div>
      </div>

      {/* DEALS BANNER */}
      {activeDeals.length > 0 && !dealsOnly && (
        <div className="bg-[#222222] text-white py-8 px-6 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 mb-6 text-emerald-400">
              <Sparkles className="w-5 h-5" /> Live Deals
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {activeDeals.map(deal => (
                <div key={deal.id} className="min-w-[300px] max-w-[300px] bg-[#333333] rounded-2xl p-4 snap-start border-[0.5px] border-[#444444] shadow-xl relative group">
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full z-10 shadow-lg">
                    {Math.round((1 - deal.discount_price / deal.price) * 100)}% OFF
                  </span>
                  <div className="aspect-video bg-[#222222] rounded-xl overflow-hidden mb-4 relative">
                    {deal.images_urls?.[0] ? (
                      <img src={deal.images_urls[0]} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#555555]">
                        <ShoppingBag className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm truncate">{deal.name}</h3>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xl font-black text-emerald-400">₹{deal.discount_price?.toLocaleString()}</span>
                    <span className="text-xs text-[#888888] line-through font-medium">₹{deal.price?.toLocaleString()}</span>
                  </div>
                  <div className="mt-4 pt-3 border-t-[0.5px] border-[#444444] flex items-center justify-between text-xs font-bold text-amber-400">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Ends Soon</span>
                    <Link href={`/marketplace/${deal.id}`} className="text-white hover:text-emerald-400 flex items-center gap-1 transition-colors">
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-10">
        
        {/* FILTER SIDEBAR */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
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
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" checked={selectedType === 'All'} onChange={() => setSelectedType('All')} className="w-4 h-4 text-[#222222] border-gray-300 focus:ring-[#222222]" />
                  <span className={`text-sm font-medium ${selectedType === 'All' ? 'text-[#222222] dark:text-white font-bold' : 'text-[#888888]'}`}>All</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" checked={selectedType === 'fixed_price'} onChange={() => setSelectedType('fixed_price')} className="w-4 h-4 text-[#222222] border-gray-300 focus:ring-[#222222]" />
                  <span className={`text-sm font-medium ${selectedType === 'fixed_price' ? 'text-[#222222] dark:text-white font-bold' : 'text-[#888888]'}`}>Fixed Price</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" checked={selectedType === 'custom_work'} onChange={() => setSelectedType('custom_work')} className="w-4 h-4 text-[#222222] border-gray-300 focus:ring-[#222222]" />
                  <span className={`text-sm font-medium ${selectedType === 'custom_work' ? 'text-[#222222] dark:text-white font-bold' : 'text-[#888888]'}`}>Custom Work</span>
                </label>
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
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-[#333333] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#222222] dark:peer-checked:bg-emerald-500"></div>
                </div>
              </label>
            </div>

            {/* Price Range */}
            <div className="border-t-[0.5px] border-[#e5e5e5] dark:border-[#333333] pt-6">
              <label className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-3 block">Price Range (₹)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-lg text-sm text-[#222222] dark:text-white focus:outline-none focus:border-[#222222]" 
                />
                <span className="text-[#888888]">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-lg text-sm text-[#222222] dark:text-white focus:outline-none focus:border-[#222222]" 
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
        </aside>

        {/* PRODUCT GRID */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-3xl p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-[#e5e5e5] dark:text-[#333333] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#222222] dark:text-white mb-2">No products found</h3>
              <p className="text-[#888888] mb-6">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => {
                  setSearchQuery(''); setSelectedCategory('All'); setSelectedSector('All'); 
                  setSelectedType('All'); setDealsOnly(false); setMinRating(0); setPriceMin(''); setPriceMax('');
                }}
                className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-6 py-2.5 rounded-full text-sm font-bold transition-colors"
              >
                Clear all filters
              </button>
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

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => {
                  const now = new Date();
                  const isDeal = product.discount_price && product.deal_end_date && new Date(product.deal_end_date) > now;
                  const isCustom = product.type === 'custom_work';

                  return (
                    <div key={product.id} className="bg-white dark:bg-[#1a1a1a] border-[0.5px] border-[#e5e5e5] dark:border-[#333333] rounded-[24px] overflow-hidden group hover:shadow-xl hover:border-[#cccccc] dark:hover:border-[#555555] transition-all flex flex-col h-full relative">
                      {isDeal && (
                        <span className="absolute top-4 left-4 bg-[#222222] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full z-10 shadow-lg flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                        </span>
                      )}
                      
                      <Link href={`/marketplace/${product.id}`} className="block aspect-video bg-[#F2F2F0] dark:bg-[#222222] relative overflow-hidden">
                        {product.images_urls?.[0] ? (
                          <img src={product.images_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                          {isCustom && (
                            <span className="bg-[#F2F2F0] dark:bg-[#333333] text-[#888888] dark:text-gray-300 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded flex-shrink-0">
                              Request
                            </span>
                          )}
                        </div>

                        {product.pitch && (
                          <Link href={`/pitch/${product.pitch.id}`} className="text-xs text-[#888888] hover:text-[#222222] dark:hover:text-white transition-colors mb-4 line-clamp-1">
                            By {product.seller?.full_name || 'Anonymous'} ({product.pitch.title})
                          </Link>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className={`w-3.5 h-3.5 ${product.average_rating > 0 ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-[#444444]'}`} />
                            <span className="text-xs font-bold text-[#222222] dark:text-white">{product.average_rating > 0 ? product.average_rating.toFixed(1) : 'New'}</span>
                          </div>
                          {product.review_count > 0 && (
                            <span className="text-[10px] text-[#888888]">({product.review_count})</span>
                          )}
                        </div>

                        <div className="mt-auto pt-4 border-t-[0.5px] border-[#e5e5e5] dark:border-[#333333] flex items-end justify-between">
                          <div>
                            {isCustom ? (
                              <p className="text-[#888888] text-[10px] font-bold uppercase tracking-widest mb-0.5">Starts from</p>
                            ) : null}
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-black text-[#222222] dark:text-white">
                                ₹{(product.discount_price || product.price).toLocaleString()}
                              </span>
                              {isDeal && !isCustom && (
                                <span className="text-xs text-[#888888] line-through font-medium">₹{product.price.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                          
                          {isCustom ? (
                            <button className="border-[1.5px] border-[#222222] dark:border-white text-[#222222] dark:text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#F2F2F0] dark:hover:bg-[#222222] transition-colors">
                              Request Work
                            </button>
                          ) : (
                            <button className="bg-[#222222] dark:bg-white text-white dark:text-[#222222] px-4 py-2 rounded-full text-xs font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-md">
                              Buy Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
