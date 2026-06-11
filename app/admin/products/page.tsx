"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShoppingBag,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Tag,
  DollarSign,
  Image as ImageIcon
} from "lucide-react";

const FINANCIAL_KEYWORDS = [
  "revenue", "profit", "gmv", "mrr", "arr", "roi", "financial",
  "payout", "dividend", "invest", "equity", "share", "valuation",
  "sales", "ebitda", "cash flow", "net income", "gross margin"
];

function hasFinancialKeyword(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return FINANCIAL_KEYWORDS.some((kw) => lower.includes(kw));
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number;
  type: string;
  category: string;
  sector: string;
  status: string;
  images_urls: string[];
  created_at: string;
  sales_count: number;
  users: { full_name: string; email: string } | null;
}

type Tab = "pending" | "live" | "banned";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, description, price, discount_price, type, category,
          sector, status, images_urls, created_at, sales_count,
          users:seller_id (full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) console.error("Error loading products:", error);
      else setProducts((data as any) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const updateStatus = async (productId: string, newStatus: string) => {
    try {
      setActionLoadingId(productId);
      const { error } = await supabase
        .from("products")
        .update({ status: newStatus })
        .eq("id", productId);
      if (error) throw error;
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
      );
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = products
    .filter((p) => p.status === activeTab)
    .filter(
      (p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const counts = {
    pending: products.filter((p) => p.status === "pending").length,
    live: products.filter((p) => p.status === "live").length,
    banned: products.filter((p) => p.status === "banned").length,
  };

  const TAB_CONFIG: { key: Tab; label: string; color: string }[] = [
    { key: "pending", label: "Pending Review", color: "amber" },
    { key: "live", label: "Live", color: "emerald" },
    { key: "banned", label: "Banned", color: "red" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">Product Review Queue</h2>
          <p className="text-sm text-[var(--text2)] mt-1">
            Approve or ban marketplace product listings. Flagged items contain financial disclosure terms.
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[var(--bg2)] border border-[0.5px] border-[var(--border)]  text-xs font-semibold text-[var(--text)] rounded-lg hover:bg-[var(--bg2)] transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-[var(--card-bg)] p-1 border border-[0.5px] border-[var(--border)]  rounded-[24px] w-full md:w-auto">
          {TAB_CONFIG.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === key
                  ? "bg-violet-600 text-[var(--text)] shadow-lg shadow-violet-600/10"
                  : "text-[var(--text2)] hover:text-[var(--text)]"
              }`}
            >
              {label}
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === key ? "bg-violet-500 text-violet-100" : "bg-[var(--bg2)] text-[var(--text2)]"}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text3)] h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name, category, seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)]  rounded-[24px] text-sm text-[var(--text)] placeholder-[#888888] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)]  rounded-[24px] p-12 text-center">
          <ShoppingBag className="h-10 w-10 text-[var(--text3)] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[var(--text)]">No products found</h3>
          <p className="text-xs text-[var(--text3)] mt-1">No listings match this filter or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((product) => {
            const flagged = hasFinancialKeyword(product.description);
            const isLoading = actionLoadingId === product.id;
            const imageUrl = product.images_urls?.[0];

            return (
              <div
                key={product.id}
                className={`bg-[var(--card-bg)] border rounded-[24px] p-5 transition-all ${
                  flagged ? "border-amber-900/50 bg-amber-950/5" : "border-[0.5px] border-[var(--border)] "
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="h-16 w-16 rounded-[24px] bg-[var(--bg2)] border border-[0.5px] border-[var(--border)]  flex items-center justify-center text-[var(--text3)] shrink-0 overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={22} />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <h3 className="text-sm font-bold text-[var(--text)]">{product.name || "Unnamed Product"}</h3>
                      {flagged && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle size={10} /> Financial Disclosure Risk
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-[var(--text3)]">
                      {product.category && (
                        <span className="flex items-center gap-1">
                          <Tag size={11} />
                          {product.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <DollarSign size={11} />
                        {product.discount_price
                          ? `$${(product.discount_price / 100).toFixed(2)}`
                          : product.price
                          ? `$${(product.price / 100).toFixed(2)}`
                          : "Free"}
                      </span>
                      {product.type && (
                        <span className="px-2 py-0.5 bg-[var(--bg2)] border border-[0.5px] border-[var(--border)]  rounded text-[10px] uppercase font-mono font-bold">
                          {product.type}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text2)] leading-relaxed line-clamp-2 mb-3">
                      {product.description || "No description provided."}
                    </p>

                    {/* Seller info + date */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--text3)]">
                      {product.users && (
                        <span>
                          Seller: <span className="text-[var(--text2)] font-semibold">{product.users.full_name}</span>
                          {" · "}
                          <span className="font-mono">{product.users.email}</span>
                        </span>
                      )}
                      <span>{new Date(product.created_at).toLocaleDateString()}</span>
                      <span>{product.sales_count || 0} sales</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {activeTab === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(product.id, "live")}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-[var(--text)] rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(product.id, "banned")}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-950/30 hover:bg-red-950/50 border border-red-900/50 text-xs font-bold text-red-400 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                          Ban
                        </button>
                      </>
                    )}
                    {activeTab === "live" && (
                      <button
                        onClick={() => updateStatus(product.id, "banned")}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-950/30 hover:bg-red-950/50 border border-red-900/50 text-xs font-bold text-red-400 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                        Ban Product
                      </button>
                    )}
                    {activeTab === "banned" && (
                      <button
                        onClick={() => updateStatus(product.id, "live")}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-[var(--text)] rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        Reinstate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}