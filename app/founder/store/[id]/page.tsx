'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, X, Plus, Loader2, Trash2 } from 'lucide-react';
import FounderGuard from '@/components/FounderGuard';

const PRODUCT_TYPES = ['software', 'hardware'] as const;
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

interface Pitch {
  id: string;
  title: string;
  status: string;
}

interface FormState {
  name: string;
  description: string;
  product_type: 'software' | 'hardware';
  category: string;
  price: string;
  currency: string;
  product_url: string;
  pitch_id: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  product_type: 'software',
  category: '',
  price: '',
  currency: 'USD',
  product_url: '',
  pitch_id: '',
};

export default function ProductFormPage() {
  const params = useParams();
  const productId = params?.id as string | undefined;
  const isNew = !productId || productId === 'new';
  const router = useRouter();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<'draft' | 'live'>('draft');
  const [removedReason, setRemovedReason] = useState<string | null>(null);
  const [isRemoved, setIsRemoved] = useState(false);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }
      setUserId(session.user.id);

      // Load seller's pitches for linking
      const { data: pitchData } = await supabase
        .from('pitches')
        .select('id, title, status')
        .eq('founder_id', session.user.id)
        .in('status', ['draft', 'live'])
        .order('updated_at', { ascending: false });
      setPitches(pitchData || []);

      // If editing an existing product
      if (!isNew && productId) {
        const { data: prod, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('seller_id', session.user.id)
          .single();

        if (prodErr || !prod) {
          router.replace('/founder/store');
          return;
        }

        setForm({
          name: prod.name || '',
          description: prod.description || '',
          product_type: prod.product_type || 'software',
          category: prod.category || '',
          price: prod.price != null ? String(prod.price) : '',
          currency: prod.currency || 'USD',
          product_url: prod.product_url || '',
          pitch_id: prod.pitch_id || '',
        });
        setStatus(prod.status === 'live' ? 'live' : 'draft');
        setIsRemoved(prod.status === 'removed');
        setRemovedReason(prod.removed_reason || null);
        setExistingImages(prod.image_urls || []);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
    init();
  }, [isNew, productId, router]);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = existingImages.length + newFiles.length + files.length;
    if (total > 5) {
      setError('Maximum 5 images per product.');
      return;
    }
    const valid = files.filter((f) => {
      if (f.size > 5 * 1024 * 1024) { setError(`${f.name} exceeds 5MB limit.`); return false; }
      if (!['image/jpeg','image/png','image/webp','image/gif'].includes(f.type)) { setError(`${f.name} must be jpg, png, webp or gif.`); return false; }
      return true;
    });
    setNewFiles((prev) => [...prev, ...valid]);
    const previews = valid.map((f) => URL.createObjectURL(f));
    setNewPreviews((prev) => [...prev, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const removeNewFile = (idx: number) => {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateForm = (targetStatus: 'draft' | 'live'): string | null => {
    if (!form.name.trim() || form.name.trim().length < 1) return 'Product name is required.';
    if (form.name.trim().length > 150) return 'Product name must be 150 characters or fewer.';
    if (form.description && form.description.length > 5000) return 'Description must be 5000 characters or fewer.';
    if (form.price && isNaN(parseFloat(form.price))) return 'Price must be a valid number.';
    if (form.price && parseFloat(form.price) < 0) return 'Price cannot be negative.';
    if (targetStatus === 'live') {
      if (!form.description?.trim()) return 'Description is required to publish.';
      if (!form.product_type) return 'Product type is required to publish.';
      const totalImages = existingImages.length + newFiles.length;
      if (totalImages < 1) return 'At least one image is required to publish.';
    }
    return null;
  };

  const uploadNewImages = async (sellerId: string, prodId: string): Promise<string[]> => {
    const uploaded: string[] = [];
    for (const file of newFiles) {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${sellerId}/products/${prodId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('assets').upload(path, file, { upsert: false });
      if (upErr) throw new Error(`Image upload failed: ${upErr.message}`);
      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(path);
      uploaded.push(publicUrl);
    }
    return uploaded;
  };

  const handleSave = async (targetStatus: 'draft' | 'live') => {
    setError(null);
    const validationError = validateForm(targetStatus);
    if (validationError) { setError(validationError); return; }

    setSaving(true);
    setUploadingImages(newFiles.length > 0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated.');
      const sid = session.user.id;

      const payload: Record<string, any> = {
        seller_id: sid,
        name: form.name.trim(),
        description: form.description.trim() || null,
        product_type: form.product_type,
        category: form.category.trim() || null,
        price: form.price ? parseFloat(form.price) : null,
        currency: form.currency,
        product_url: form.product_url.trim() || null,
        pitch_id: form.pitch_id || null,
        status: targetStatus,
      };

      let prodId = productId;

      if (isNew) {
        // Create product first to get the ID
        const { data: created, error: createErr } = await supabase
          .from('products')
          .insert({ ...payload, image_urls: [] })
          .select('id')
          .single();
        if (createErr) throw createErr;
        prodId = created.id;
      }

      // Upload new images
      const newUrls = newFiles.length > 0 ? await uploadNewImages(sid, prodId!) : [];
      const allImageUrls = [...existingImages, ...newUrls];
      setUploadingImages(false);

      if (isNew) {
        await supabase.from('products').update({ image_urls: allImageUrls }).eq('id', prodId!);
        router.replace(`/founder/store/${prodId}`);
      } else {
        const { error: updateErr } = await supabase
          .from('products')
          .update({ ...payload, image_urls: allImageUrls })
          .eq('id', prodId!)
          .eq('seller_id', sid);
        if (updateErr) throw updateErr;
        setStatus(targetStatus);
        setExistingImages(allImageUrls);
        setNewFiles([]);
        setNewPreviews([]);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  const handleDelete = async () => {
    if (!productId || !userId) return;
    setSaving(true);
    const { error: err } = await supabase.from('products').delete().eq('id', productId).eq('seller_id', userId);
    if (err) { setError(err.message); setSaving(false); return; }
    router.replace('/founder/store');
  };

  // Checklist for publishing
  const publishChecklist = [
    { label: 'Product name', done: form.name.trim().length > 0 },
    { label: 'Description', done: (form.description || '').trim().length > 0 },
    { label: 'Product type', done: !!form.product_type },
    { label: 'At least one image', done: existingImages.length + newFiles.length >= 1 },
  ];
  const canPublish = publishChecklist.every((i) => i.done);

  if (loading) {
    return (
      <FounderGuard>
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-line border-t-[var(--red)] rounded-full animate-spin" />
        </div>
      </FounderGuard>
    );
  }

  return (
    <FounderGuard>
      <div className="inner-page min-h-screen">
        <div className="page-padding py-8 max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/founder/store" className="text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] transition-colors flex items-center gap-1.5 mb-4">
              ← My store
            </Link>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--red)] block mb-1">
              {isNew ? '//' + ' NEW PRODUCT' : '//' + ' EDIT PRODUCT'}
            </span>
            <h1 className="font-display text-2xl md:text-3xl uppercase text-[var(--paper)]">
              {isNew ? 'Add product' : form.name || 'Edit product'}
            </h1>
          </div>

          {/* REMOVED banner */}
          {isRemoved && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs font-mono text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase mb-1">This listing was removed by an admin</p>
                {removedReason && <p>{removedReason}</p>}
                <p className="mt-1 text-red-400/70">The form is read-only.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs font-mono text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* STATUS + SAVE ACTIONS */}
            <div className="flex items-center gap-3 p-4 bg-[var(--card)] border border-line rounded-2xl flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--smoke)]">Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase border ${
                  status === 'live' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-line/20 text-[var(--smoke)] border-line/40'
                }`}>
                  {status === 'live' ? 'Public' : 'Private draft'}
                </span>
              </div>

              {!isRemoved && (
                <div className="ml-auto flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave('draft')}
                    className="px-4 py-2 rounded-xl border border-line text-xs font-bold uppercase tracking-wider text-[var(--paper-dim)] hover:text-[var(--paper)] hover:border-[var(--red)] transition-colors disabled:opacity-50 min-h-[40px]"
                  >
                    {saving && status === 'draft' ? 'Saving...' : 'Save draft'}
                  </button>
                  {status === 'live' ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSave('draft')}
                      className="px-4 py-2 rounded-xl bg-[var(--card)] border border-line text-xs font-bold uppercase tracking-wider text-[var(--smoke)] hover:text-[var(--paper)] hover:border-[var(--red)] transition-colors disabled:opacity-50 min-h-[40px]"
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={saving || !canPublish}
                      onClick={() => handleSave('live')}
                      className="px-4 py-2 rounded-xl bg-[var(--red)] text-[var(--paper)] text-xs font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-colors disabled:opacity-50 min-h-[40px]"
                    >
                      {saving ? 'Publishing...' : 'Publish'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Publish checklist (when draft) */}
            {status === 'draft' && !canPublish && !isRemoved && (
              <div className="p-4 bg-[var(--card)] border border-line rounded-2xl space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-3">To publish, you need:</p>
                {publishChecklist.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs font-mono">
                    <span className={item.done ? 'text-emerald-400' : 'text-[var(--smoke)]'}>{item.done ? '✓' : '○'}</span>
                    <span className={item.done ? 'text-[var(--paper-dim)]' : 'text-[var(--smoke)]'}>{item.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="prod-name" className="block text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-2">
                Product name <span className="text-[var(--red)]">*</span>
              </label>
              <input
                id="prod-name"
                type="text"
                disabled={isRemoved}
                maxLength={150}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. FounderKit Dashboard Template"
                className="w-full bg-[var(--card)] border border-line rounded-2xl px-4 py-3 text-base text-[var(--paper)] placeholder:text-[var(--smoke)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] transition-colors min-h-[44px] disabled:opacity-50"
              />
              <p className="text-right text-[10px] font-mono text-[var(--smoke)] mt-1">{form.name.length}/150</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="prod-desc" className="block text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-2">
                Description
              </label>
              <textarea
                id="prod-desc"
                disabled={isRemoved}
                maxLength={5000}
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what the product does, who it's for, and why it matters..."
                className="w-full bg-[var(--card)] border border-line rounded-2xl px-4 py-3 text-base text-[var(--paper)] placeholder:text-[var(--smoke)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] transition-colors resize-none disabled:opacity-50"
              />
              <p className="text-right text-[10px] font-mono text-[var(--smoke)] mt-1">{form.description.length}/5000</p>
            </div>

            {/* Type + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prod-type" className="block text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-2">
                  Product type <span className="text-[var(--red)]">*</span>
                </label>
                <select
                  id="prod-type"
                  disabled={isRemoved}
                  value={form.product_type}
                  onChange={(e) => setForm({ ...form, product_type: e.target.value as 'software' | 'hardware' })}
                  className="w-full bg-[var(--card)] border border-line rounded-2xl px-4 py-3 text-base text-[var(--paper)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] transition-colors min-h-[44px] disabled:opacity-50"
                >
                  <option value="software">Software</option>
                  <option value="hardware">Hardware</option>
                </select>
              </div>
              <div>
                <label htmlFor="prod-cat" className="block text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-2">
                  Category
                </label>
                <input
                  id="prod-cat"
                  type="text"
                  disabled={isRemoved}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Analytics, IoT, Productivity"
                  className="w-full bg-[var(--card)] border border-line rounded-2xl px-4 py-3 text-base text-[var(--paper)] placeholder:text-[var(--smoke)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] transition-colors min-h-[44px] disabled:opacity-50"
                />
              </div>
            </div>

            {/* Price + Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prod-price" className="block text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-2">
                  Price (display only — leave empty for "Contact seller")
                </label>
                <input
                  id="prod-price"
                  type="number"
                  disabled={isRemoved}
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 299"
                  className="w-full bg-[var(--card)] border border-line rounded-2xl px-4 py-3 text-base text-[var(--paper)] placeholder:text-[var(--smoke)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] transition-colors min-h-[44px] disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="prod-currency" className="block text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-2">
                  Currency
                </label>
                <select
                  id="prod-currency"
                  disabled={isRemoved}
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full bg-[var(--card)] border border-line rounded-2xl px-4 py-3 text-base text-[var(--paper)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] transition-colors min-h-[44px] disabled:opacity-50"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Product URL */}
            <div>
              <label htmlFor="prod-url" className="block text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-2">
                Product URL (optional)
              </label>
              <input
                id="prod-url"
                type="url"
                disabled={isRemoved}
                value={form.product_url}
                onChange={(e) => setForm({ ...form, product_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[var(--card)] border border-line rounded-2xl px-4 py-3 text-base text-[var(--paper)] placeholder:text-[var(--smoke)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] transition-colors min-h-[44px] disabled:opacity-50"
              />
            </div>

            {/* Link to pitch */}
            {pitches.length > 0 && (
              <div>
                <label htmlFor="prod-pitch" className="block text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-2">
                  Link to one of my pitches (optional)
                </label>
                <select
                  id="prod-pitch"
                  disabled={isRemoved}
                  value={form.pitch_id}
                  onChange={(e) => setForm({ ...form, pitch_id: e.target.value })}
                  className="w-full bg-[var(--card)] border border-line rounded-2xl px-4 py-3 text-base text-[var(--paper)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] transition-colors min-h-[44px] disabled:opacity-50"
                >
                  <option value="">— No pitch linked —</option>
                  {pitches.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} ({p.status})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Images */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-2">
                Images (max 5, each up to 5MB — jpg, png, webp, gif)
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                {/* Existing images */}
                {existingImages.map((url) => (
                  <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--ink)] border border-line group">
                    <img src={url} alt="Product image" className="w-full h-full object-cover" />
                    {!isRemoved && (
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/75 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {/* New file previews */}
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--ink)] border border-line group">
                    <img src={src} alt="New image preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/75 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove new image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add button */}
                {!isRemoved && existingImages.length + newFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-line hover:border-[var(--red)] flex items-center justify-center text-[var(--smoke)] hover:text-[var(--red)] transition-colors"
                    aria-label="Add image"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileAdd}
                className="sr-only"
                aria-label="Upload product images"
              />
              {uploadingImages && (
                <p className="text-xs font-mono text-[var(--smoke)] flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Uploading images...
                </p>
              )}
            </div>

            {/* Delete (drafts only) */}
            {!isNew && status === 'draft' && !isRemoved && (
              <div className="pt-4 border-t border-line">
                {!deleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    className="flex items-center gap-2 text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete draft
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-mono text-[var(--smoke)]">Are you sure? This cannot be undone.</p>
                    <button type="button" onClick={handleDelete} disabled={saving} className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold uppercase disabled:opacity-50">
                      {saving ? 'Deleting...' : 'Yes, delete'}
                    </button>
                    <button type="button" onClick={() => setDeleteConfirm(false)} className="px-4 py-2 rounded-xl border border-line text-xs font-mono text-[var(--smoke)]">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </FounderGuard>
  );
}
