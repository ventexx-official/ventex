'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Presentation,
  ShoppingBag,
  Mail,
  AlertCircle,
  Search,
  RotateCcw,
  Ban,
  Filter,
  CheckCircle2,
  Loader2,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DashboardShell } from '@/components/ui-kit/DashboardShell';

interface UserRow {
  id: string;
  display_name: string | null;
  role: string;
  country: string | null;
  created_at: string;
}

interface PitchRow {
  id: string;
  title: string;
  status: 'draft' | 'live' | 'removed';
  removed_reason: string | null;
  current_version: number;
  updated_at: string;
  founder_id: string;
  founder_name?: string;
}

interface ProductRow {
  id: string;
  name: string;
  status: 'draft' | 'live' | 'removed';
  removed_reason: string | null;
  product_type: string;
  updated_at: string;
  seller_id: string;
  seller_name?: string;
}

interface ContactRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data lists
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pitches, setPitches] = useState<PitchRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [inquiriesCount, setInquiriesCount] = useState<number>(0);

  // Filters & Searches
  const [pitchFilter, setPitchFilter] = useState<'all' | 'draft' | 'live' | 'removed'>('all');
  const [pitchSearch, setPitchSearch] = useState('');
  const [productFilter, setProductFilter] = useState<'all' | 'draft' | 'live' | 'removed'>('all');
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Takedown dialog state
  const [takedownTarget, setTakedownTarget] = useState<{ type: 'pitch' | 'product'; id: string; name: string } | null>(null);
  const [removedReason, setRemovedReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login?next=/admin');
        return;
      }
      setCurrentAdminId(session.user.id);

      // Verify admin role
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profErr || prof?.role !== 'admin') {
        router.replace('/discover');
        return;
      }

      // 1. Fetch Users
      const { data: usersData, error: uErr } = await supabase
        .from('profiles')
        .select('id, display_name, role, country, created_at')
        .order('created_at', { ascending: false });

      if (uErr) throw uErr;
      setUsers(usersData || []);

      // 2. Fetch Pitches
      const { data: pitchesData, error: pErr } = await supabase
        .from('pitches')
        .select('id, title, status, removed_reason, current_version, updated_at, founder_id')
        .order('updated_at', { ascending: false });

      if (pErr) throw pErr;

      // 3. Fetch Products
      const { data: productsData, error: prodErr } = await supabase
        .from('products')
        .select('id, name, status, removed_reason, product_type, updated_at, seller_id')
        .order('updated_at', { ascending: false });

      if (prodErr) throw prodErr;

      // Combine founder/seller display names
      const profMap = new Map((usersData || []).map((u) => [u.id, u.display_name || 'Anonymous']));

      setPitches(
        (pitchesData || []).map((p) => ({
          ...p,
          founder_name: profMap.get(p.founder_id) || 'Founder',
        }))
      );

      setProducts(
        (productsData || []).map((pr) => ({
          ...pr,
          seller_name: profMap.get(pr.seller_id) || 'Seller',
        }))
      );

      // 4. Fetch Contact Submissions
      const { data: contactData } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      setContacts(contactData || []);

      // 5. Inquiries Count
      const { count: inqCount } = await supabase
        .from('product_inquiries')
        .select('*', { count: 'exact', head: true });

      setInquiriesCount(inqCount || 0);
    } catch (err: any) {
      console.error('Error loading admin portal:', err);
      setError(err.message || 'Failed to load admin portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [router]);

  // Actions: Take down item
  const handleConfirmTakedown = async () => {
    if (!takedownTarget || !removedReason.trim()) {
      alert('A removal reason is required.');
      return;
    }

    try {
      setActionLoading(true);
      const table = takedownTarget.type === 'pitch' ? 'pitches' : 'products';
      const { error: updErr } = await supabase
        .from(table)
        .update({
          status: 'removed',
          removed_reason: removedReason.trim(),
        })
        .eq('id', takedownTarget.id);

      if (updErr) throw updErr;

      setTakedownTarget(null);
      setRemovedReason('');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove item');
    } finally {
      setActionLoading(false);
    }
  };

  // Actions: Restore item
  const handleRestore = async (type: 'pitch' | 'product', id: string) => {
    if (!confirm(`Restore this ${type} to draft status?`)) return;

    try {
      const table = type === 'pitch' ? 'pitches' : 'products';
      const { error: updErr } = await supabase
        .from(table)
        .update({
          status: 'draft',
          removed_reason: null,
        })
        .eq('id', id);

      if (updErr) throw updErr;
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to restore item');
    }
  };

  // Actions: Change user role
  const handleChangeRole = async (userId: string, newRole: string) => {
    if (userId === currentAdminId && newRole !== 'admin') {
      alert('You cannot remove your own administrator role.');
      return;
    }

    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      const { error: updErr } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (updErr) throw updErr;
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  // Filtered pitches
  const filteredPitches = pitches.filter((p) => {
    const matchesFilter = pitchFilter === 'all' || p.status === pitchFilter;
    const matchesSearch =
      pitchSearch === '' ||
      p.title.toLowerCase().includes(pitchSearch.toLowerCase()) ||
      p.founder_name?.toLowerCase().includes(pitchSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered products
  const filteredProducts = products.filter((pr) => {
    const matchesFilter = productFilter === 'all' || pr.status === productFilter;
    const matchesSearch =
      productSearch === '' ||
      pr.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      pr.seller_name?.toLowerCase().includes(productSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    return (
      u.display_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.country?.toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  // Statistics
  const founderUsers = users.filter((u) => u.role === 'founder').length;
  const investorUsers = users.filter((u) => u.role === 'investor').length;
  const buyerUsers = users.filter((u) => u.role === 'buyer').length;

  return (
    <DashboardShell role="admin">
      <div className="space-y-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--line)]/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-mono uppercase tracking-tight text-[var(--paper)]">
              Admin System Portal
            </h1>
            <p className="text-xs sm:text-sm text-[var(--smoke)] mt-1">
              Platform governance, content moderation, user management, and contact requests.
            </p>
          </div>
          <button
            onClick={loadAdminData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border border-[var(--line)] hover:border-[var(--red)] transition-colors min-h-[44px] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadAdminData}
              className="px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/20 text-xs font-mono flex items-center gap-1.5 cursor-pointer min-h-[36px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* 1. Overview Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--smoke)]">
              Total Users
            </span>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold text-[var(--paper)]">{users.length}</span>
              <span className="text-[10px] font-mono text-[var(--smoke)] block mt-0.5">
                {founderUsers}F · {investorUsers}I · {buyerUsers}B
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--smoke)]">
              Pitches
            </span>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold text-[var(--paper)]">{pitches.length}</span>
              <span className="text-[10px] font-mono text-[var(--smoke)] block mt-0.5">
                {pitches.filter((p) => p.status === 'live').length} live · {pitches.filter((p) => p.status === 'removed').length} removed
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--smoke)]">
              Products
            </span>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold text-[var(--paper)]">{products.length}</span>
              <span className="text-[10px] font-mono text-[var(--smoke)] block mt-0.5">
                {products.filter((p) => p.status === 'live').length} live · {products.filter((p) => p.status === 'removed').length} removed
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--smoke)]">
              Inquiries
            </span>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold text-[var(--paper)]">{inquiriesCount}</span>
              <span className="text-[10px] font-mono text-[var(--smoke)] block mt-0.5">
                Marketplace requests
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--smoke)]">
              Contact Forms
            </span>
            <div className="mt-2">
              <span className="text-2xl font-mono font-bold text-[var(--paper)]">{contacts.length}</span>
              <span className="text-[10px] font-mono text-[var(--smoke)] block mt-0.5">
                Submissions received
              </span>
            </div>
          </div>
        </div>

        {/* 2. Pitches Table */}
        <section id="pitches" className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--line)]/50 pb-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
              <Presentation className="w-4 h-4 text-[var(--red)]" />
              Pitches ({filteredPitches.length})
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-[var(--ink)] border border-[var(--line)] rounded-xl px-2.5 py-1 text-xs font-mono">
                <Search className="w-3.5 h-3.5 text-[var(--smoke)]" />
                <input
                  type="text"
                  placeholder="Search title or founder..."
                  value={pitchSearch}
                  onChange={(e) => setPitchSearch(e.target.value)}
                  className="bg-transparent text-[var(--paper)] focus:outline-none w-36 sm:w-48 py-1"
                />
              </div>

              <select
                value={pitchFilter}
                onChange={(e) => setPitchFilter(e.target.value as any)}
                className="bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] text-xs font-mono rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none min-h-[36px]"
              >
                <option value="all">All statuses</option>
                <option value="live">Live</option>
                <option value="draft">Draft</option>
                <option value="removed">Removed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)]/50 text-[var(--smoke)] uppercase text-[10px]">
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Founder</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Updated</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]/30">
                {filteredPitches.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--line)]/10 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--paper)] max-w-xs truncate">
                      {p.title}
                      {p.removed_reason && (
                        <span className="block text-[10px] text-red-400 font-normal">
                          Reason: {p.removed_reason}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[var(--smoke)]">{p.founder_name}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded-full border ${
                          p.status === 'live'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : p.status === 'removed'
                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                            : 'bg-line/20 text-[var(--smoke)] border-line/40'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--smoke)]">v{p.current_version}</td>
                    <td className="py-3 px-3 text-[var(--smoke)]">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {p.status === 'removed' ? (
                        <button
                          type="button"
                          onClick={() => handleRestore('pitch', p.id)}
                          className="px-2.5 py-1 rounded-lg border border-[var(--line)] text-emerald-400 hover:bg-emerald-500/10 transition-colors min-h-[32px] cursor-pointer"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setTakedownTarget({ type: 'pitch', id: p.id, name: p.title })
                          }
                          className="px-2.5 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors min-h-[32px] cursor-pointer"
                        >
                          Take down
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Products Table */}
        <section id="products" className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--line)]/50 pb-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              Products ({filteredProducts.length})
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-[var(--ink)] border border-[var(--line)] rounded-xl px-2.5 py-1 text-xs font-mono">
                <Search className="w-3.5 h-3.5 text-[var(--smoke)]" />
                <input
                  type="text"
                  placeholder="Search product or seller..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="bg-transparent text-[var(--paper)] focus:outline-none w-36 sm:w-48 py-1"
                />
              </div>

              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value as any)}
                className="bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] text-xs font-mono rounded-xl px-2.5 py-2 cursor-pointer focus:outline-none min-h-[36px]"
              >
                <option value="all">All statuses</option>
                <option value="live">Live</option>
                <option value="draft">Draft</option>
                <option value="removed">Removed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)]/50 text-[var(--smoke)] uppercase text-[10px]">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Seller</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Updated</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]/30">
                {filteredProducts.map((pr) => (
                  <tr key={pr.id} className="hover:bg-[var(--line)]/10 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--paper)] max-w-xs truncate">
                      {pr.name}
                      {pr.removed_reason && (
                        <span className="block text-[10px] text-red-400 font-normal">
                          Reason: {pr.removed_reason}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[var(--smoke)]">{pr.seller_name}</td>
                    <td className="py-3 px-3 uppercase text-[10px] text-[var(--smoke)]">
                      {pr.product_type}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded-full border ${
                          pr.status === 'live'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : pr.status === 'removed'
                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                            : 'bg-line/20 text-[var(--smoke)] border-line/40'
                        }`}
                      >
                        {pr.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--smoke)]">
                      {new Date(pr.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {pr.status === 'removed' ? (
                        <button
                          type="button"
                          onClick={() => handleRestore('product', pr.id)}
                          className="px-2.5 py-1 rounded-lg border border-[var(--line)] text-emerald-400 hover:bg-emerald-500/10 transition-colors min-h-[32px] cursor-pointer"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setTakedownTarget({ type: 'product', id: pr.id, name: pr.name })
                          }
                          className="px-2.5 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors min-h-[32px] cursor-pointer"
                        >
                          Take down
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Users Table */}
        <section id="users" className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--line)]/50 pb-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Users ({filteredUsers.length})
            </h2>

            <div className="flex items-center gap-1 bg-[var(--ink)] border border-[var(--line)] rounded-xl px-2.5 py-1 text-xs font-mono">
              <Search className="w-3.5 h-3.5 text-[var(--smoke)]" />
              <input
                type="text"
                placeholder="Search user name or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-transparent text-[var(--paper)] focus:outline-none w-48 py-1"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)]/50 text-[var(--smoke)] uppercase text-[10px]">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Current Role</th>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3">Joined</th>
                  <th className="py-2.5 px-3 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]/30">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--line)]/10 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--paper)]">
                      {u.display_name || 'Anonymous User'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="uppercase text-[10px] px-2 py-0.5 rounded border border-[var(--line)] text-[var(--smoke)]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--smoke)]">{u.country || '—'}</td>
                    <td className="py-3 px-3 text-[var(--smoke)]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] text-xs font-mono rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
                      >
                        <option value="visitor">Visitor</option>
                        <option value="founder">Founder</option>
                        <option value="investor">Investor</option>
                        <option value="buyer">Buyer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Contact Messages */}
        <section id="contact-messages" className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
          <div className="border-b border-[var(--line)]/50 pb-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              Contact Messages ({contacts.length})
            </h2>
            <p className="text-xs text-[var(--smoke)] mt-1">
              External contact submissions and early access signups.
            </p>
          </div>

          {contacts.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[var(--smoke)]">
              No contact submissions received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-[var(--ink)]/40 border border-[var(--line)] space-y-2 text-xs font-mono"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--paper)]">{c.name}</span>
                      <span className="text-[var(--smoke)]">&lt;{c.email}&gt;</span>
                    </div>
                    <span className="text-[10px] text-[var(--smoke)]">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                  {c.subject && (
                    <div className="text-[11px] font-semibold text-[var(--paper)]">
                      Subject: {c.subject}
                    </div>
                  )}
                  <p className="text-[11px] text-[var(--paper-dim)] bg-[var(--card)]/50 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                    {c.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Takedown Dialog */}
        {takedownTarget && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[var(--card)] border border-[var(--line)] rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-mono uppercase tracking-wider text-red-400 flex items-center gap-2">
                <Ban className="w-4 h-4" />
                Take Down {takedownTarget.type === 'pitch' ? 'Pitch' : 'Product'}
              </h3>
              <p className="text-xs text-[var(--smoke)]">
                You are about to remove <strong className="text-[var(--paper)]">{takedownTarget.name}</strong> from public view. A reason is required.
              </p>

              <div>
                <label className="block text-xs font-mono uppercase text-[var(--smoke)] mb-1">
                  Reason for removal *
                </label>
                <textarea
                  required
                  rows={3}
                  value={removedReason}
                  onChange={(e) => setRemovedReason(e.target.value)}
                  placeholder="e.g. Terms of Service violation, intellectual property dispute"
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTakedownTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono border border-[var(--line)] text-[var(--smoke)] hover:text-[var(--paper)] min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading || !removedReason.trim()}
                  onClick={handleConfirmTakedown}
                  className="px-4 py-2 rounded-xl text-xs font-mono bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 min-h-[44px] cursor-pointer"
                >
                  {actionLoading ? 'Removing...' : 'Confirm Take Down'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
