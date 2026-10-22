'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  MapPin,
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DashboardShell } from '@/components/ui-kit/DashboardShell';

interface BuyerAddress {
  id: string;
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  phone: string | null;
  is_default: boolean;
}

interface BuyerInquiry {
  id: string;
  product_id: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  created_at: string;
  product_name?: string;
  product_image?: string | null;
}

interface LiveProduct {
  id: string;
  name: string;
  price: number | null;
  currency: string;
  product_type: string;
  image_urls: string[];
}

export default function BuyerDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [inquiries, setInquiries] = useState<BuyerInquiry[]>([]);
  const [addresses, setAddresses] = useState<BuyerAddress[]>([]);
  const [highlights, setHighlights] = useState<LiveProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Address modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    is_default: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login?next=/buyer/dashboard');
        return;
      }
      const uid = session.user.id;

      // 1. Fetch Profile
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (profErr) throw profErr;
      if (prof.role !== 'buyer' && prof.role !== 'admin') {
        router.replace('/discover');
        return;
      }
      setProfile(prof);

      // 2. Fetch Requests / Inquiries
      const { data: inqData } = await supabase
        .from('product_inquiries')
        .select('id, product_id, message, status, created_at')
        .eq('buyer_id', uid)
        .order('created_at', { ascending: false })
        .limit(5);

      if (inqData && inqData.length > 0) {
        const prodIds = Array.from(new Set(inqData.map((i) => i.product_id)));
        const { data: prods } = await supabase
          .from('products')
          .select('id, name, image_urls')
          .in('id', prodIds);

        const prodMap = new Map((prods || []).map((p) => [p.id, p]));
        const combined = inqData.map((item) => {
          const p = prodMap.get(item.product_id);
          return {
            ...item,
            product_name: p?.name || 'Product',
            product_image: p?.image_urls?.[0] || null,
          };
        });
        setInquiries(combined);
      } else {
        setInquiries([]);
      }

      // 3. Fetch Buyer Addresses
      const { data: addrData } = await supabase
        .from('buyer_addresses')
        .select('*')
        .eq('user_id', uid)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      setAddresses(addrData || []);

      // 4. Fetch Marketplace Highlights (up to 4 newest live products)
      const { data: highData } = await supabase
        .from('products')
        .select('id, name, price, currency, product_type, image_urls')
        .eq('status', 'live')
        .order('created_at', { ascending: false })
        .limit(4);

      setHighlights(highData || []);
    } catch (err: any) {
      console.error('Error loading buyer dashboard:', err);
      setError(err.message || 'Failed to load buyer dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleOpenAddressModal = (addr?: BuyerAddress) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({
        full_name: addr.full_name,
        line1: addr.line1,
        line2: addr.line2 || '',
        city: addr.city,
        state: addr.state || '',
        postal_code: addr.postal_code || '',
        country: addr.country,
        phone: addr.phone || '',
        is_default: addr.is_default,
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        full_name: profile?.display_name || '',
        line1: '',
        line2: '',
        city: profile?.city || '',
        state: '',
        postal_code: '',
        country: profile?.country || '',
        phone: '',
        is_default: addresses.length === 0,
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.full_name.trim() || !addressForm.line1.trim() || !addressForm.city.trim() || !addressForm.country.trim()) {
      alert('Full name, address line 1, city, and country are required.');
      return;
    }

    try {
      setSavingAddress(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (addressForm.is_default) {
        // unset other defaults
        await supabase
          .from('buyer_addresses')
          .update({ is_default: false })
          .eq('user_id', session.user.id);
      }

      if (editingAddressId) {
        const { error: updErr } = await supabase
          .from('buyer_addresses')
          .update({
            full_name: addressForm.full_name.trim(),
            line1: addressForm.line1.trim(),
            line2: addressForm.line2.trim() || null,
            city: addressForm.city.trim(),
            state: addressForm.state.trim() || null,
            postal_code: addressForm.postal_code.trim() || null,
            country: addressForm.country.trim(),
            phone: addressForm.phone.trim() || null,
            is_default: addressForm.is_default,
          })
          .eq('id', editingAddressId);

        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase.from('buyer_addresses').insert({
          user_id: session.user.id,
          full_name: addressForm.full_name.trim(),
          line1: addressForm.line1.trim(),
          line2: addressForm.line2.trim() || null,
          city: addressForm.city.trim(),
          state: addressForm.state.trim() || null,
          postal_code: addressForm.postal_code.trim() || null,
          country: addressForm.country.trim(),
          phone: addressForm.phone.trim() || null,
          is_default: addressForm.is_default,
        });

        if (insErr) throw insErr;
      }

      setIsAddressModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error saving address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Delete this delivery address?')) return;
    try {
      const { error: delErr } = await supabase.from('buyer_addresses').delete().eq('id', id);
      if (delErr) throw delErr;
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting address');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.from('buyer_addresses').update({ is_default: false }).eq('user_id', session.user.id);
      await supabase.from('buyer_addresses').update({ is_default: true }).eq('id', id);

      loadData();
    } catch (err: any) {
      alert(err.message || 'Error updating default address');
    }
  };

  const firstName = profile?.display_name ? profile.display_name.split(' ')[0] : 'Buyer';

  return (
    <DashboardShell role="buyer">
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--line)]/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-mono uppercase tracking-tight text-[var(--paper)]">
              Welcome, {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--smoke)] mt-1">
              Track vendor requests, manage delivery details, and discover innovative products.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-[var(--red)] text-white hover:bg-[var(--red)]/90 transition-colors min-h-[44px] cursor-pointer shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore Marketplace
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/20 text-xs font-mono flex items-center gap-1.5 cursor-pointer min-h-[36px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] h-32 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] h-48 animate-pulse" />
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] h-48 animate-pulse" />
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Profile Summary Card */}
            <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || 'Buyer'}
                    className="w-12 h-12 rounded-full object-cover border border-[var(--line)]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[var(--ink)] border border-[var(--line)] flex items-center justify-center font-mono text-sm font-bold text-[var(--paper)]">
                    {firstName.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--paper)]">
                    {profile?.display_name || 'Buyer Profile'}
                  </h3>
                  <p className="text-xs text-[var(--smoke)] font-mono">
                    {profile?.company || profile?.city ? `${profile?.city || ''}, ${profile?.country || ''}` : 'Verified Buyer'}
                  </p>
                </div>
              </div>
              <Link
                href="/settings"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-mono border border-[var(--line)] hover:border-[var(--red)] transition-colors text-[var(--paper)] min-h-[44px]"
              >
                Edit settings
              </Link>
            </div>

            {/* My Requests & Delivery Addresses Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. My Requests (product inquiries) */}
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--line)]/50 pb-3">
                  <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)]">
                    My Requests
                  </h2>
                  <Link
                    href="/marketplace/my-inquiries"
                    className="text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] transition-colors min-h-[44px] flex items-center"
                  >
                    View all
                  </Link>
                </div>

                {inquiries.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-[var(--smoke)]">
                    No vendor inquiries submitted yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="p-3.5 rounded-xl bg-[var(--ink)]/50 border border-[var(--line)] space-y-2 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/marketplace/${inq.product_id}`}
                            className="font-semibold text-[var(--paper)] hover:text-[var(--red)] transition-colors truncate"
                          >
                            {inq.product_name}
                          </Link>
                          <span
                            className={`text-[9px] uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                              inq.status === 'replied'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : inq.status === 'closed'
                                ? 'bg-line/20 text-[var(--smoke)] border-line/40'
                                : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--paper-dim)] line-clamp-2">
                          "{inq.message}"
                        </p>
                        <div className="text-[10px] text-[var(--smoke)]">
                          {new Date(inq.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Delivery Addresses */}
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--line)]/50 pb-3">
                  <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--smoke)]" />
                    Delivery Addresses
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleOpenAddressModal()}
                    className="inline-flex items-center gap-1 text-xs font-mono text-[var(--red)] hover:underline min-h-[44px] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add address</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-[var(--smoke)]">
                    No delivery addresses saved yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-3.5 rounded-xl bg-[var(--ink)]/50 border border-[var(--line)] space-y-1 text-xs font-mono relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[var(--paper)]">{addr.full_name}</span>
                          {addr.is_default && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--smoke)]">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.country}
                        </p>
                        {addr.phone && (
                          <p className="text-[10px] text-[var(--smoke)]">Phone: {addr.phone}</p>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-2">
                          {!addr.is_default && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-[11px] text-[var(--smoke)] hover:text-[var(--paper)] min-h-[32px] cursor-pointer"
                            >
                              Set default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenAddressModal(addr)}
                            className="text-[11px] text-[var(--smoke)] hover:text-[var(--paper)] min-h-[32px] flex items-center gap-1 cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-[11px] text-red-400 hover:text-red-300 min-h-[32px] flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Marketplace Highlights & Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              {/* Highlights */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--line)]/50 pb-3">
                  <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)]">
                    Marketplace Highlights
                  </h2>
                  <Link
                    href="/marketplace"
                    className="text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] transition-colors min-h-[44px] flex items-center"
                  >
                    View store
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {highlights.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/marketplace/${prod.id}`}
                      className="p-4 rounded-xl bg-[var(--ink)]/50 border border-[var(--line)] hover:border-[var(--red)] transition-colors flex items-start gap-3"
                    >
                      {prod.image_urls?.[0] ? (
                        <img
                          src={prod.image_urls[0]}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg object-cover border border-[var(--line)] shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[var(--card)] border border-[var(--line)] flex items-center justify-center font-mono text-xs font-bold text-[var(--paper)] shrink-0">
                          {prod.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-[var(--paper)] truncate">
                          {prod.name}
                        </h4>
                        <span className="text-[10px] font-mono text-[var(--smoke)] uppercase block mt-0.5">
                          {prod.product_type}
                        </span>
                        <div className="text-xs font-mono font-bold text-[var(--paper)] mt-1">
                          {prod.price ? `$${prod.price}` : 'Contact for pricing'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Messages Coming Soon */}
              <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-3 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[var(--smoke)]" />
                  <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)]">
                    Messages
                  </h2>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--line)] text-[var(--smoke)]">
                    Soon
                  </span>
                </div>
                <p className="text-xs text-[var(--smoke)] leading-relaxed">
                  Message sellers directly. Coming soon.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Address Modal */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[var(--card)] border border-[var(--line)] rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-mono uppercase tracking-wider text-[var(--paper)]">
                {editingAddressId ? 'Edit Address' : 'Add Delivery Address'}
              </h3>
              <form onSubmit={handleSaveAddress} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-[var(--smoke)] uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.full_name}
                    onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--smoke)] uppercase mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--smoke)] uppercase mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={addressForm.line2}
                    onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--smoke)] uppercase mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--smoke)] uppercase mb-1">Country *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[var(--smoke)] uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_default_addr"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                    className="w-4 h-4 rounded text-[var(--red)] cursor-pointer"
                  />
                  <label htmlFor="is_default_addr" className="text-[var(--smoke)] cursor-pointer">
                    Set as default address
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--line)] text-[var(--smoke)] hover:text-[var(--paper)] min-h-[44px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="px-4 py-2 rounded-xl bg-[var(--red)] text-white hover:bg-[var(--red)]/90 min-h-[44px] cursor-pointer"
                  >
                    {savingAddress ? 'Saving...' : 'Save address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
