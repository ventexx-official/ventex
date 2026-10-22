'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { X, ChevronLeft, ChevronRight, ExternalLink, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

type ProductType = 'software' | 'hardware';
type InquiryStatus = 'new' | 'replied' | 'closed';

interface Product {
  id: string;
  seller_id: string;
  pitch_id: string | null;
  status: string;
  removed_reason: string | null;
  name: string;
  description: string | null;
  product_type: ProductType;
  category: string | null;
  price: number | null;
  currency: string;
  image_urls: string[];
  product_url: string | null;
  created_at: string;
  updated_at: string;
}

interface SellerProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  company: string | null;
}

interface Pitch {
  id: string;
  status: string;
  title: string;
}

function getTypeBadge(type: string) {
  if (type === 'software') return { label: 'Software', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
  if (type === 'hardware') return { label: 'Hardware', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  return { label: type, cls: 'bg-line/20 text-[var(--paper-dim)] border-line' };
}

function formatPrice(price: number | null, currency: string) {
  if (price === null || price === undefined) return 'Contact seller';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(price);
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');

  const [imgIdx, setImgIdx] = useState(0);

  // Inquiry form
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser(session.user);
        setUserEmail(session.user.email || '');
        setInquiryEmail(session.user.email || '');
      }

      // Fetch product
      const { data: prod, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !prod) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // If not live, only seller and admin can view it
      if (prod.status !== 'live') {
        if (!session) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        // Check if current user is seller
        if (prod.seller_id !== session.user.id) {
          // check admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          if (profile?.role !== 'admin') {
            setNotFound(true);
            setLoading(false);
            return;
          }
        }
      }

      setProduct(prod);

      // Fetch seller from public_profiles
      const { data: sellerData } = await supabase
        .from('public_profiles')
        .select('id, display_name, avatar_url, headline, company')
        .eq('id', prod.seller_id)
        .single();

      setSeller(sellerData || null);

      // Fetch linked pitch if any (only show if live)
      if (prod.pitch_id) {
        const { data: pitchData } = await supabase
          .from('pitches')
          .select('id, status, title')
          .eq('id', prod.pitch_id)
          .eq('status', 'live')
          .single();
        setPitch(pitchData || null);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push(`/login?next=/marketplace/${id}`);
      return;
    }

    setInquiryError(null);
    const trimmedMsg = inquiryMsg.trim();
    if (!trimmedMsg) {
      setInquiryError('Message is required.');
      return;
    }
    if (trimmedMsg.length > 2000) {
      setInquiryError('Message must be 2000 characters or fewer.');
      return;
    }
    if (inquiryEmail && inquiryEmail.length > 254) {
      setInquiryError('Email address is too long.');
      return;
    }
    if (inquiryPhone && inquiryPhone.length > 30) {
      setInquiryError('Phone number is too long.');
      return;
    }

    setInquirySubmitting(true);

    const { error } = await supabase
      .from('product_inquiries')
      .insert({
        product_id: id,
        buyer_id: currentUser.id,
        // seller_id is set automatically by the database trigger – do NOT send it
        message: trimmedMsg,
        contact_email: inquiryEmail.trim() || null,
        contact_phone: inquiryPhone.trim() || null,
      });

    if (error) {
      setInquiryError(error.message || 'Failed to send inquiry. Please try again.');
      setInquirySubmitting(false);
      return;
    }

    setInquirySuccess(true);
    setInquirySubmitting(false);
  };

  if (loading) {
    return (
      <div className="inner-page min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--red)]" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="inner-page min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-4xl font-display uppercase text-[var(--paper)] mb-3">Not found</p>
        <p className="text-sm font-mono text-[var(--smoke)] mb-6">This product doesn't exist or is not publicly available.</p>
        <Link href="/marketplace" className="bg-[var(--red)] text-[var(--paper)] px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider">
          Back to marketplace
        </Link>
      </div>
    );
  }

  const badge = getTypeBadge(product.product_type);
  const images = product.image_urls || [];
  const isSeller = currentUser?.id === product.seller_id;

  return (
    <div className="inner-page min-h-screen">
      {/* BREADCRUMB */}
      <nav className="page-padding pt-6 pb-2">
        <ol className="flex items-center gap-2 text-xs font-mono text-[var(--smoke)]">
          <li><Link href="/marketplace" className="hover:text-[var(--paper)] transition-colors">Marketplace</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-[var(--paper-dim)] truncate max-w-[200px]">{product.name}</li>
        </ol>
      </nav>

      {/* REMOVED BANNER */}
      {product.status === 'removed' && (
        <div className="page-padding py-3">
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-sm font-mono text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider mb-1">Listing removed</p>
              {product.removed_reason && <p>{product.removed_reason}</p>}
            </div>
          </div>
        </div>
      )}

      {product.status === 'draft' && (
        <div className="page-padding py-3">
          <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-sm font-mono text-yellow-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>This listing is in <strong>draft</strong> and only visible to you.</span>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="page-padding py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* IMAGE GALLERY */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--ink)] border border-line">
              {images.length > 0 ? (
                <img
                  src={images[imgIdx]}
                  alt={`${product.name} – image ${imgIdx + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--smoke)]">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/75 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/75 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-[var(--red)]' : 'border-line'}`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFO */}
          <div className="flex flex-col gap-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border ${badge.cls}`}>
                {badge.label}
              </span>
              {product.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-line/10 text-[var(--smoke)] border border-line/30">
                  {product.category}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-display text-3xl md:text-4xl font-medium uppercase tracking-tight text-[var(--paper)] leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-2xl font-bold text-[var(--paper)]">
              {formatPrice(product.price, product.currency)}
            </p>

            {/* Linked pitch */}
            {pitch && (
              <div className="flex items-center gap-2 p-3 bg-[var(--card)] border border-line rounded-xl">
                <ExternalLink className="w-4 h-4 text-[var(--red)] shrink-0" />
                <span className="text-xs font-mono text-[var(--smoke)]">Linked pitch:</span>
                <Link href={`/pitch/${pitch.id}`} className="text-xs font-mono text-[var(--paper)] hover:text-[var(--red)] transition-colors underline underline-offset-2">
                  {pitch.title}
                </Link>
              </div>
            )}

            {/* Product URL */}
            {product.product_url && (
              <a
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono text-[var(--red)] hover:text-[var(--paper)] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Visit product website
              </a>
            )}

            {/* Seller card */}
            {seller && (
              <div className="flex items-center gap-3 p-4 bg-[var(--card)] border border-line rounded-2xl">
                {seller.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt={seller.display_name || 'Seller'}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--ink)] flex items-center justify-center text-sm font-bold text-[var(--paper)] flex-shrink-0">
                    {(seller.display_name || 'S')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--paper)] truncate">{seller.display_name || 'Anonymous seller'}</p>
                  {seller.headline && <p className="text-xs font-mono text-[var(--smoke)] truncate">{seller.headline}</p>}
                  {seller.company && <p className="text-xs font-mono text-[var(--smoke)]">{seller.company}</p>}
                </div>
              </div>
            )}

            {/* CTA */}
            {isSeller ? (
              <div className="p-4 bg-[var(--card)] border border-line rounded-2xl text-center space-y-2">
                <p className="text-xs font-mono text-[var(--paper-dim)] uppercase tracking-wider">This is your listing</p>
                <Link
                  href={`/founder/store/${product.id}`}
                  className="inline-flex items-center gap-2 bg-[var(--red)] text-[var(--paper)] px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-colors min-h-[44px]"
                >
                  Manage listing
                </Link>
              </div>
            ) : product.status === 'live' ? (
              <>
                {!showInquiry ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        router.push(`/login?next=/marketplace/${id}`);
                      } else {
                        setShowInquiry(true);
                      }
                    }}
                    className="w-full bg-[var(--red)] text-[var(--paper)] py-4 px-6 rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-colors min-h-[44px]"
                  >
                    {currentUser ? "I'm interested" : "Sign in to enquire"}
                  </button>
                ) : inquirySuccess ? (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Request sent</p>
                    <p className="text-xs font-mono text-[var(--smoke)]">Your request was sent to the seller. They'll reach out using your contact details.</p>
                    <button
                      type="button"
                      onClick={() => { setShowInquiry(false); setInquirySuccess(false); setInquiryMsg(''); setInquiryPhone(''); }}
                      className="text-xs font-mono text-[var(--paper-dim)] hover:text-[var(--paper)] underline"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4 p-5 bg-[var(--card)] border border-line rounded-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--paper)]">Send enquiry</h3>
                      <button type="button" onClick={() => setShowInquiry(false)} className="text-[var(--smoke)] hover:text-[var(--paper)] transition-colors p-1" aria-label="Close">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {inquiryError && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono text-red-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {inquiryError}
                      </div>
                    )}

                    <div>
                      <label htmlFor="inq-msg" className="block text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-1.5">
                        Message <span className="text-[var(--red)]">*</span>
                      </label>
                      <textarea
                        id="inq-msg"
                        required
                        maxLength={2000}
                        rows={4}
                        value={inquiryMsg}
                        onChange={(e) => setInquiryMsg(e.target.value)}
                        placeholder="Describe what you're looking for, your use case, or any questions..."
                        className="w-full bg-[var(--ink)] border border-line rounded-xl px-4 py-3 text-base text-[var(--paper)] placeholder:text-[var(--smoke)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] transition-colors resize-none"
                      />
                      <p className="text-right text-[10px] font-mono text-[var(--smoke)] mt-1">{inquiryMsg.length}/2000</p>
                    </div>

                    <div>
                      <label htmlFor="inq-email" className="block text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-1.5">
                        Contact email
                      </label>
                      <input
                        id="inq-email"
                        type="email"
                        maxLength={254}
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        autoComplete="email"
                        className="w-full bg-[var(--ink)] border border-line rounded-xl px-4 py-3 text-base text-[var(--paper)] placeholder:text-[var(--smoke)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] transition-colors min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label htmlFor="inq-phone" className="block text-xs font-mono uppercase tracking-wider text-[var(--smoke)] mb-1.5">
                        Phone (optional)
                      </label>
                      <input
                        id="inq-phone"
                        type="tel"
                        maxLength={30}
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        autoComplete="tel"
                        className="w-full bg-[var(--ink)] border border-line rounded-xl px-4 py-3 text-base text-[var(--paper)] placeholder:text-[var(--smoke)] focus:outline-none focus:ring-1 focus:border-[var(--red)] focus:ring-[var(--red)] transition-colors min-h-[44px]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={inquirySubmitting}
                      className="w-full bg-[var(--red)] text-[var(--paper)] py-3 px-6 rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-[#ed594d] transition-colors disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
                    >
                      {inquirySubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : 'Send request'}
                    </button>
                  </form>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* DESCRIPTION */}
        {product.description && (
          <div className="max-w-6xl mx-auto mt-12 pt-10 border-t border-line">
            <h2 className="font-display text-xl uppercase text-[var(--paper)] mb-5">About this product</h2>
            <div className="prose prose-invert prose-sm max-w-none text-[var(--paper-dim)] font-mono leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
