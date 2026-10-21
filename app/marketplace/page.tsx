"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SITE_NAME } from "@/lib/brand";
import {
  Search,
  Filter,
  Sparkles,
  ShoppingBag,
  ArrowUpRight,
  Clock,
  Check,
  Tag,
  Star,
  ExternalLink,
} from "lucide-react";

/* ── Live Countdown Timer for Deals ── */
function DealCountdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft("");
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

  return (
    <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-[rgba(255,248,240,0.15)] text-[var(--paper)] w-fit border border-[rgba(255,248,240,0.2)]">
      <Clock className="w-2.5 h-2.5 flex-shrink-0 text-[var(--paper)]" />
      Ends in {timeLeft}
    </div>
  );
}

const CATEGORIES = ["All", "Software", "Templates", "Services", "Hardware", "Courses"];

export default function MarketplacePage() {
  const brandName = SITE_NAME.toUpperCase();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tick, setTick] = useState(0);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [dealsOnly, setDealsOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("recommended");

  // Tabs
  const [activeTab, setActiveTab] = useState<"Explore" | "Purchases">("Explore");
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // Fixed: query public_profiles instead of users to comply with DB schema
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          seller:seller_id ( id, display_name, avatar_url ),
          pitch:pitch_id ( id, title )
        `)
        .in("status", ["live", "published"]);

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === "Purchases" && user) {
      const fetchPurchases = async () => {
        setLoadingPurchases(true);
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            product:product_id (
              *,
              seller:seller_id ( id, display_name, avatar_url )
            )
          `)
          .eq("buyer_id", user.id);

        if (!error && data) {
          setPurchases(data.map((o) => o.product).filter(Boolean));
        }
        setLoadingPurchases(false);
      };
      fetchPurchases();
    }
  }, [activeTab, user]);

  const activeDeals = useMemo(() => {
    const now = new Date();
    return products.filter(
      (p) => p.discount_price && p.deal_end_date && new Date(p.deal_end_date) > now
    );
  }, [products, tick]);

  const filteredProducts = useMemo(() => {
    const now = new Date();
    return products
      .filter((p) => {
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()))
          return false;
        if (selectedCategory !== "All" && p.category !== selectedCategory)
          return false;
        if (selectedType !== "All" && p.type !== selectedType) return false;
        if (
          dealsOnly &&
          (!p.discount_price || !p.deal_end_date || new Date(p.deal_end_date) <= now)
        )
          return false;

        const priceToCompare = p.discount_price || p.price;
        if (priceMin && priceToCompare < parseInt(priceMin)) return false;
        if (priceMax && priceToCompare > parseInt(priceMax)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") {
          return (a.discount_price || a.price) - (b.discount_price || b.price);
        }
        if (sortBy === "price_desc") {
          return (b.discount_price || b.price) - (a.discount_price || a.price);
        }
        if (sortBy === "newest") {
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedType, dealsOnly, priceMin, priceMax, sortBy, tick]);

  return (
    <div className="inner-page inner-page--red min-h-screen">
      {/* HERO SECTION */}
      <section className="inner-hero page-padding">
        <div className="inner-hero__meta">
          <span className="status-dot" /> THE FOUNDER MARKETPLACE{" "}
          <span>/ {brandName} / 2026</span>
        </div>
        <h1>
          Things worth
          <br />
          <em>putting to work.</em>
        </h1>
        <p>
          Founders can list software, licenses, digital assets, or custom work; buyers and investors can purchase or inquire directly.
        </p>
        <div className="inner-hero__line" aria-hidden="true">
          <span>SCROLL TO EXPLORE</span>
          <span />
        </div>
      </section>

      {/* CATALOGUE SECTION */}
      <section className="inner-market-list page-padding">
        <div className="inner-section__head">
          <span>01 / THE CATALOGUE</span>
          <p>Useful things, made by people close to the problem.</p>
        </div>

        {/* CONTROLS BAR: SEARCH, TABS, CATEGORY PILLS */}
        <div className="mt-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* TABS */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("Explore")}
                className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "Explore"
                    ? "bg-[var(--paper)] text-[var(--ink)] font-bold shadow-md"
                    : "border border-[rgba(255,248,240,0.3)] text-[var(--paper)] hover:bg-[rgba(255,248,240,0.1)]"
                }`}
              >
                Catalogue ({filteredProducts.length})
              </button>
              <button
                onClick={() => setActiveTab("Purchases")}
                className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "Purchases"
                    ? "bg-[var(--paper)] text-[var(--ink)] font-bold shadow-md"
                    : "border border-[rgba(255,248,240,0.3)] text-[var(--paper)] hover:bg-[rgba(255,248,240,0.1)]"
                }`}
              >
                My Purchases {user && purchases.length > 0 && `(${purchases.length})`}
              </button>
            </div>

            {/* SEARCH */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(255,248,240,0.6)]" />
              <input
                type="text"
                placeholder="Search tools, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[rgba(16,16,15,0.25)] border border-[rgba(255,248,240,0.25)] rounded-full text-xs font-mono text-[var(--paper)] placeholder-[rgba(255,248,240,0.5)] focus:outline-none focus:border-[var(--paper)] transition-all"
              />
            </div>
          </div>

          {/* FILTER PILLS ROW */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[rgba(255,248,240,0.2)]">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[var(--paper)] text-[var(--ink)] font-bold"
                      : "text-[rgba(255,248,240,0.7)] hover:text-[var(--paper)] border border-[rgba(255,248,240,0.2)] hover:border-[rgba(255,248,240,0.4)]"
                  }`}
                >
                  {cat}
                </button>
              ))}

              <button
                onClick={() => setDealsOnly(!dealsOnly)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  dealsOnly
                    ? "bg-[var(--paper)] text-[var(--ink)] font-bold"
                    : "text-[rgba(255,248,240,0.7)] hover:text-[var(--paper)] border border-[rgba(255,248,240,0.2)]"
                }`}
              >
                <Tag className="w-3 h-3" />
                Deals Only
              </button>
            </div>

            {/* SORT DROPDOWN */}
            <div className="flex items-center gap-2 text-xs font-mono text-[rgba(255,248,240,0.8)]">
              <span className="uppercase text-[10px] tracking-widest text-[rgba(255,248,240,0.6)]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[rgba(16,16,15,0.25)] border border-[rgba(255,248,240,0.25)] rounded-full px-3 py-1 text-xs font-mono text-[var(--paper)] focus:outline-none cursor-pointer"
              >
                <option value="recommended" className="bg-[#22211f] text-white">Recommended</option>
                <option value="newest" className="bg-[#22211f] text-white">Newest</option>
                <option value="price_asc" className="bg-[#22211f] text-white">Price: Low to High</option>
                <option value="price_desc" className="bg-[#22211f] text-white">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="mt-8">
          {activeTab === "Explore" ? (
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-[rgba(255,248,240,0.7)]">
                  <div className="w-8 h-8 border-2 border-[rgba(255,248,240,0.3)] border-t-[var(--paper)] rounded-full animate-spin" />
                  <span className="text-xs font-mono uppercase tracking-widest">Loading catalogue...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                /* EMPTY STATE - ELEGANT TABLET CARD */
                <div className="border border-[rgba(255,248,240,0.25)] rounded-3xl p-12 md:p-16 text-center bg-[rgba(16,16,15,0.18)] backdrop-blur-sm mt-8">
                  <ShoppingBag className="w-12 h-12 text-[rgba(255,248,240,0.4)] mx-auto mb-4" />
                  <h3 className="font-display text-2xl md:text-3xl uppercase tracking-tight text-[var(--paper)] mb-2 font-medium">
                    {products.length === 0 ? "Catalogue opening soon" : "No matching items found"}
                  </h3>
                  <p className="text-xs md:text-sm font-mono text-[rgba(255,248,240,0.7)] max-w-md mx-auto mb-8">
                    {products.length === 0
                      ? "The founder marketplace is in preview. Early founders can submit software listings, digital products, and tools."
                      : "Try clearing your filters or searching for another term."}
                  </p>
                  {products.length === 0 ? (
                    <Link
                      href="/founder/store/new-product"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--paper)] text-[var(--ink)] font-bold text-xs uppercase tracking-wider hover:bg-[#fffaf0] transition-all cursor-pointer"
                    >
                      List a product <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                        setSelectedType("All");
                        setDealsOnly(false);
                        setPriceMin("");
                        setPriceMax("");
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--paper)] text-[var(--ink)] font-bold text-xs uppercase tracking-wider hover:bg-[#fffaf0] transition-all cursor-pointer"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              ) : (
                /* PRODUCTS LIST - EDITORIAL LIST FORMAT MATCHING REFERENCE */
                <div className="border-t border-[rgba(255,248,240,0.38)] mt-8">
                  {filteredProducts.map((product, index) => {
                    const price = product.discount_price || product.price || 0;
                    const hasDiscount = product.discount_price && product.discount_price < product.price;

                    return (
                      <Link
                        href={`/marketplace/${product.id}`}
                        key={product.id}
                        className="market-row block group text-inherit cursor-pointer"
                      >
                        <span>0{index + 1}</span>
                        <span>{product.category || product.type || "PRODUCT"}</span>
                        <div>
                          <h2>{product.name}</h2>
                          {product.seller?.display_name && (
                            <p className="text-[11px] font-mono text-[rgba(255,248,240,0.6)] mt-1">
                              By {product.seller.display_name}
                              {product.pitch?.title ? ` / ${product.pitch.title}` : ""}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-right">
                          ₹{price.toLocaleString()}
                          {hasDiscount && (
                            <span className="block text-[9px] line-through text-[rgba(255,248,240,0.5)]">
                              ₹{product.price.toLocaleString()}
                            </span>
                          )}
                        </span>
                        <ArrowUpRight className="w-5 h-5 text-[var(--paper)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* PURCHASES TAB */
            <div className="mt-8">
              {!user ? (
                <div className="border border-[rgba(255,248,240,0.25)] rounded-3xl p-12 text-center bg-[rgba(16,16,15,0.18)]">
                  <ShoppingBag className="w-12 h-12 text-[rgba(255,248,240,0.4)] mx-auto mb-4" />
                  <h3 className="font-display text-2xl uppercase tracking-tight text-[var(--paper)] mb-2">
                    Sign in to view your purchases
                  </h3>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--paper)] text-[var(--ink)] font-bold text-xs uppercase tracking-wider hover:bg-[#fffaf0] transition-all mt-4"
                  >
                    Sign In
                  </Link>
                </div>
              ) : loadingPurchases ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-[rgba(255,248,240,0.7)]">
                  <div className="w-8 h-8 border-2 border-[rgba(255,248,240,0.3)] border-t-[var(--paper)] rounded-full animate-spin" />
                  <span className="text-xs font-mono uppercase tracking-widest">Loading purchases...</span>
                </div>
              ) : purchases.length === 0 ? (
                <div className="border border-[rgba(255,248,240,0.25)] rounded-3xl p-12 text-center bg-[rgba(16,16,15,0.18)]">
                  <ShoppingBag className="w-12 h-12 text-[rgba(255,248,240,0.4)] mx-auto mb-4" />
                  <h3 className="font-display text-2xl uppercase tracking-tight text-[var(--paper)] mb-2">
                    No purchases yet
                  </h3>
                  <p className="text-xs font-mono text-[rgba(255,248,240,0.7)]">
                    When you purchase products or tools on {brandName}, they will appear here.
                  </p>
                  <button
                    onClick={() => setActiveTab("Explore")}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--paper)] text-[var(--ink)] font-bold text-xs uppercase tracking-wider hover:bg-[#fffaf0] transition-all mt-6 cursor-pointer"
                  >
                    Explore Marketplace
                  </button>
                </div>
              ) : (
                <div className="border-t border-[rgba(255,248,240,0.38)]">
                  {purchases.map((product, index) => (
                    <Link
                      href={`/marketplace/${product.id}`}
                      key={product.id}
                      className="market-row block group text-inherit cursor-pointer"
                    >
                      <span>0{index + 1}</span>
                      <span>PURCHASED</span>
                      <div>
                        <h2>{product.name}</h2>
                      </div>
                      <span className="font-mono text-xs uppercase">Access</span>
                      <ArrowUpRight className="w-5 h-5 text-[var(--paper)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA SECTION MATCHING REFERENCE */}
      <section className="market-cta page-padding">
        <span className="inner-kicker">HAVE SOMETHING USEFUL?</span>
        <h2>
          Put it in
          <br />
          <em>motion.</em>
        </h2>
        <Link href="/founder/store/new-product" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--red)] font-bold mt-6">
          List a product <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
