'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Upload,
  Globe,
  ExternalLink,
  History,
  FileText,
  Trash2,
  Eye,
  Info,
  ChevronDown,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import FounderGuard from '@/components/FounderGuard';
import { ENABLE_AI_MENTOR, ENABLE_PUBLIC_PITCH_PAGE } from '@/lib/brand';
import { Pitch, PitchVersion } from '@/lib/types/pitch';

const STAGES = [
  { value: 'idea', label: 'Idea' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'mvp', label: 'MVP' },
  { value: 'early_revenue', label: 'Early Revenue' },
  { value: 'growth', label: 'Growth' },
];

const INDUSTRIES = [
  'Artificial Intelligence',
  'B2B SaaS',
  'Fintech',
  'Healthtech',
  'Edtech',
  'E-commerce',
  'CleanTech / Climate',
  'Hardware / IoT',
  'Developer Tools',
  'Cybersecurity',
  'Consumer Tech',
  'Other',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

const CORE_SECTIONS: { key: keyof Pitch; label: string; fieldId: string }[] = [
  { key: 'title', label: 'Title', fieldId: 'field-title' },
  { key: 'tagline', label: 'Tagline', fieldId: 'field-tagline' },
  { key: 'industry', label: 'Industry', fieldId: 'field-industry' },
  { key: 'stage', label: 'Stage', fieldId: 'field-stage' },
  { key: 'problem', label: 'Problem', fieldId: 'field-problem' },
  { key: 'solution', label: 'Solution', fieldId: 'field-solution' },
  { key: 'target_customer', label: 'Target Customer', fieldId: 'field-target_customer' },
  { key: 'market_size', label: 'Market Size', fieldId: 'field-market_size' },
  { key: 'business_model', label: 'Business Model', fieldId: 'field-business_model' },
  { key: 'traction', label: 'Traction', fieldId: 'field-traction' },
  { key: 'team', label: 'Team', fieldId: 'field-team' },
  { key: 'use_of_funds', label: 'Use of Funds', fieldId: 'field-use_of_funds' },
];

export default function PitchWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const welcome = searchParams.get('welcome') === '1';

  const pitchIdParam = params?.id as string | undefined;
  const isNew = !pitchIdParam || pitchIdParam === 'new';

  const [pitchId, setPitchId] = useState<string | null>(isNew ? null : pitchIdParam);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState<string>('idea');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [marketSize, setMarketSize] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  const [traction, setTraction] = useState('');
  const [team, setTeam] = useState('');
  const [isRaising, setIsRaising] = useState(false);
  const [amountSeeking, setAmountSeeking] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [useOfFunds, setUseOfFunds] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');
  const [pitchDeckPath, setPitchDeckPath] = useState<string | null>(null);
  const [status, setStatus] = useState<'draft' | 'live' | 'removed'>('draft');
  const [removedReason, setRemovedReason] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Upload progress
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDeck, setUploadingDeck] = useState(false);

  // Version History Modal/Panel
  const [versions, setVersions] = useState<PitchVersion[]>([]);
  const [viewingVersion, setViewingVersion] = useState<PitchVersion | null>(null);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Publish checklist modal
  const [showPublishChecklist, setShowPublishChecklist] = useState(false);

  // Warn on leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Load Session and Pitch
  useEffect(() => {
    async function loadData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      setUserId(session.user.id);

      if (!isNew && pitchIdParam) {
        setLoading(true);
        const { data, error: fetchErr } = await supabase
          .from('pitches')
          .select('*')
          .eq('id', pitchIdParam)
          .single();

        if (fetchErr || !data) {
          setError('Pitch not found or you do not have permission.');
          setLoading(false);
          return;
        }

        // Check ownership
        if (data.founder_id !== session.user.id) {
          setError('You are not authorized to edit this pitch.');
          setLoading(false);
          return;
        }

        setPitchId(data.id);
        setTitle(data.title || '');
        setTagline(data.tagline || '');
        setIndustry(data.industry || '');
        setStage(data.stage || 'idea');
        setCountry(data.country || '');
        setCity(data.city || '');
        setProblem(data.problem || '');
        setSolution(data.solution || '');
        setTargetCustomer(data.target_customer || '');
        setMarketSize(data.market_size || '');
        setCompetitors(data.competitors || '');
        setBusinessModel(data.business_model || '');
        setTraction(data.traction || '');
        setTeam(data.team || '');
        setIsRaising(!!data.is_raising);
        setAmountSeeking(data.amount_seeking ? String(data.amount_seeking) : '');
        setCurrency(data.currency || 'USD');
        setUseOfFunds(data.use_of_funds || '');
        setLogoUrl(data.logo_url || null);
        setWebsiteUrl(data.website_url || '');
        setDemoVideoUrl(data.demo_video_url || '');
        setPitchDeckPath(data.pitch_deck_path || null);
        setStatus(data.status);
        setRemovedReason(data.removed_reason);
        setCurrentVersion(data.current_version);
        setLastSavedAt(data.last_saved_at);
        setLoading(false);
      }
    }
    loadData();
  }, [isNew, pitchIdParam, router]);

  // Load Versions
  const loadVersionHistory = async () => {
    if (!pitchId) return;
    setLoadingVersions(true);
    const { data, error } = await supabase
      .from('pitch_versions')
      .select('*')
      .eq('pitch_id', pitchId)
      .order('version_number', { ascending: false });

    if (!error && data) {
      setVersions(data);
    }
    setLoadingVersions(false);
  };

  // Completeness check
  const completeness = CORE_SECTIONS.map((sec) => {
    let filled = false;
    switch (sec.key) {
      case 'title':
        filled = !!title.trim();
        break;
      case 'tagline':
        filled = !!tagline.trim();
        break;
      case 'industry':
        filled = !!industry.trim();
        break;
      case 'stage':
        filled = !!stage.trim();
        break;
      case 'problem':
        filled = !!problem.trim();
        break;
      case 'solution':
        filled = !!solution.trim();
        break;
      case 'target_customer':
        filled = !!targetCustomer.trim();
        break;
      case 'market_size':
        filled = !!marketSize.trim();
        break;
      case 'business_model':
        filled = !!businessModel.trim();
        break;
      case 'traction':
        filled = !!traction.trim();
        break;
      case 'team':
        filled = !!team.trim();
        break;
      case 'use_of_funds':
        filled = !!useOfFunds.trim();
        break;
    }
    return { ...sec, filled };
  });

  const filledCount = completeness.filter((c) => c.filled).length;
  const completenessPercent = Math.round((filledCount / CORE_SECTIONS.length) * 100);

  // Publish requirements
  const publishRequirements = [
    { label: 'Title (required)', met: !!title.trim(), id: 'field-title' },
    { label: 'Tagline (required)', met: !!tagline.trim(), id: 'field-tagline' },
    { label: 'Problem (required)', met: !!problem.trim(), id: 'field-problem' },
    { label: 'Solution (required)', met: !!solution.trim(), id: 'field-solution' },
    { label: 'Industry (required)', met: !!industry.trim(), id: 'field-industry' },
    { label: 'Stage (required)', met: !!stage.trim(), id: 'field-stage' },
  ];
  const canPublish = publishRequirements.every((r) => r.met);

  const scrollToField = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  };

  // Save handler
  const handleSave = async (overrideStatus?: 'draft' | 'live', exitAfter: boolean = false) => {
    if (status === 'removed') return;

    // Validate lengths
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required (1-150 characters)';
    if (title.length > 150) errors.title = 'Title must be 150 characters or less';
    if (tagline && tagline.length > 200) errors.tagline = 'Tagline must be 200 characters or less';
    if (problem && problem.length > 5000) errors.problem = 'Problem must be 5000 characters or less';
    if (solution && solution.length > 5000) errors.solution = 'Solution must be 5000 characters or less';
    if (targetCustomer && targetCustomer.length > 3000) errors.targetCustomer = 'Max 3000 chars';
    if (marketSize && marketSize.length > 3000) errors.marketSize = 'Max 3000 chars';
    if (competitors && competitors.length > 3000) errors.competitors = 'Max 3000 chars';
    if (businessModel && businessModel.length > 3000) errors.businessModel = 'Max 3000 chars';
    if (traction && traction.length > 3000) errors.traction = 'Max 3000 chars';
    if (team && team.length > 3000) errors.team = 'Max 3000 chars';
    if (useOfFunds && useOfFunds.length > 3000) errors.useOfFunds = 'Max 3000 chars';

    const amtNum = amountSeeking ? parseFloat(amountSeeking) : null;
    if (amtNum !== null && (isNaN(amtNum) || amtNum < 0)) {
      errors.amountSeeking = 'Amount seeking cannot be negative';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please resolve the errors highlighted below.');
      return;
    }

    setValidationErrors({});
    setError(null);
    setSaving(true);

    try {
      const payload: Partial<Pitch> = {
        title: title.trim(),
        tagline: tagline.trim() || null,
        industry: industry.trim() || null,
        stage: (stage as any) || null,
        country: country.trim() || null,
        city: city.trim() || null,
        problem: problem.trim() || null,
        solution: solution.trim() || null,
        target_customer: targetCustomer.trim() || null,
        market_size: marketSize.trim() || null,
        competitors: competitors.trim() || null,
        business_model: businessModel.trim() || null,
        traction: traction.trim() || null,
        team: team.trim() || null,
        is_raising: isRaising,
        amount_seeking: amtNum,
        currency,
        use_of_funds: useOfFunds.trim() || null,
        logo_url: logoUrl,
        website_url: websiteUrl.trim() || null,
        demo_video_url: demoVideoUrl.trim() || null,
        pitch_deck_path: pitchDeckPath,
      };

      if (overrideStatus) {
        payload.status = overrideStatus;
        if (overrideStatus === 'live') {
          payload.published_at = new Date().toISOString();
        }
      }

      if (!pitchId) {
        // Insert new pitch
        const { data: newPitch, error: insertErr } = await supabase
          .from('pitches')
          .insert({
            ...payload,
            founder_id: userId,
            status: overrideStatus || 'draft',
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        setPitchId(newPitch.id);
        setCurrentVersion(newPitch.current_version);
        setLastSavedAt(newPitch.last_saved_at);
        setStatus(newPitch.status);
        setIsDirty(false);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setSaveStatus(`Saved, version ${newPitch.current_version}, ${timeStr}`);

        if (exitAfter) {
          router.push('/founder/dashboard');
        } else {
          router.replace(`/founder/pitches/${newPitch.id}`);
        }
      } else {
        // Update existing pitch
        const { data: updated, error: updateErr } = await supabase
          .from('pitches')
          .update({
            ...payload,
            last_saved_at: new Date().toISOString(),
          })
          .eq('id', pitchId)
          .select()
          .single();

        if (updateErr) throw updateErr;
        setCurrentVersion(updated.current_version);
        setLastSavedAt(updated.last_saved_at);
        if (overrideStatus) setStatus(updated.status);
        setIsDirty(false);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setSaveStatus(`Saved, version ${updated.current_version}, ${timeStr}`);

        if (exitAfter) {
          router.push('/founder/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(err.message || 'Failed to save pitch.');
    } finally {
      setSaving(false);
    }
  };

  // Logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Logo must be an image (JPG, PNG, WebP, or GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo image must be smaller than 5MB.');
      return;
    }

    try {
      setUploadingLogo(true);
      const ext = file.name.split('.').pop() || 'png';
      const randomStr = Math.random().toString(36).substring(2, 9);
      const filePath = `${userId}/logos/${randomStr}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('assets')
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: pubData } = supabase.storage.from('assets').getPublicUrl(filePath);
      setLogoUrl(pubData.publicUrl);
      setIsDirty(true);
    } catch (err: any) {
      alert(err.message || 'Error uploading logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Pitch deck upload
  const handleDeckUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const validExtensions = ['pdf', 'pptx'];
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!validExtensions.includes(ext)) {
      alert('Pitch deck must be a PDF or PPTX file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('Pitch deck must be 20MB or less.');
      return;
    }

    try {
      setUploadingDeck(true);
      const targetPitchId = pitchId || 'draft-' + Math.random().toString(36).substring(2, 7);
      const filePath = `${userId}/${targetPitchId}/deck.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('pitch-decks')
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      setPitchDeckPath(filePath);
      setIsDirty(true);
    } catch (err: any) {
      alert(err.message || 'Error uploading deck');
    } finally {
      setUploadingDeck(false);
    }
  };

  // Restore Version Snapshot
  const handleRestoreVersion = (ver: PitchVersion) => {
    if (!confirm(`Restore Version ${ver.version_number}? This will populate the form and you can save a new version.`)) {
      return;
    }
    const snap = ver.snapshot;
    if (snap) {
      if (snap.title !== undefined) setTitle(snap.title || '');
      if (snap.tagline !== undefined) setTagline(snap.tagline || '');
      if (snap.industry !== undefined) setIndustry(snap.industry || '');
      if (snap.stage !== undefined) setStage(snap.stage || 'idea');
      if (snap.country !== undefined) setCountry(snap.country || '');
      if (snap.city !== undefined) setCity(snap.city || '');
      if (snap.problem !== undefined) setProblem(snap.problem || '');
      if (snap.solution !== undefined) setSolution(snap.solution || '');
      if (snap.target_customer !== undefined) setTargetCustomer(snap.target_customer || '');
      if (snap.market_size !== undefined) setMarketSize(snap.market_size || '');
      if (snap.competitors !== undefined) setCompetitors(snap.competitors || '');
      if (snap.business_model !== undefined) setBusinessModel(snap.business_model || '');
      if (snap.traction !== undefined) setTraction(snap.traction || '');
      if (snap.team !== undefined) setTeam(snap.team || '');
      if (snap.is_raising !== undefined) setIsRaising(!!snap.is_raising);
      if (snap.amount_seeking !== undefined) setAmountSeeking(snap.amount_seeking ? String(snap.amount_seeking) : '');
      if (snap.currency !== undefined) setCurrency(snap.currency || 'USD');
      if (snap.use_of_funds !== undefined) setUseOfFunds(snap.use_of_funds || '');
      if (snap.logo_url !== undefined) setLogoUrl(snap.logo_url);
      if (snap.website_url !== undefined) setWebsiteUrl(snap.website_url || '');
      if (snap.demo_video_url !== undefined) setDemoVideoUrl(snap.demo_video_url || '');
      if (snap.pitch_deck_path !== undefined) setPitchDeckPath(snap.pitch_deck_path);
      setIsDirty(true);
      setViewingVersion(null);
    }
  };

  // Delete draft
  const handleDeleteDraft = async () => {
    if (!pitchId || status !== 'draft') return;
    if (!confirm('Are you sure you want to permanently delete this draft pitch? This cannot be undone.')) {
      return;
    }

    try {
      const { error: delErr } = await supabase.from('pitches').delete().eq('id', pitchId);
      if (delErr) throw delErr;
      router.push('/founder/dashboard');
    } catch (err: any) {
      alert(err.message || 'Could not delete draft');
    }
  };

  const isReadOnly = status === 'removed';

  if (loading) {
    return (
      <FounderGuard>
        <div className="min-h-screen bg-[var(--ink)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--red)]" />
        </div>
      </FounderGuard>
    );
  }

  return (
    <FounderGuard>
      <div className="min-h-screen bg-[var(--ink)] text-[var(--paper)] pb-24">
        {/* Top Control Bar */}
        <header className="sticky top-0 z-20 bg-[var(--card)]/90 backdrop-blur border-b border-[var(--line)] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/founder/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <span className="text-[var(--line)]">/</span>
            <span className="text-xs font-mono font-medium text-[var(--paper)] truncate max-w-[200px]">
              {title || 'Untitled Pitch'}
            </span>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                status === 'live'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : status === 'removed'
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : 'bg-line/20 text-[var(--smoke)] border-line/40'
              }`}
            >
              {status === 'live' ? 'Public' : status === 'removed' ? 'Removed' : 'Private'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Version / Save notice */}
            {saveStatus && (
              <span className="text-[11px] font-mono text-[var(--smoke)] hidden md:inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                {saveStatus}
              </span>
            )}

            {/* Version History Button */}
            {pitchId && (
              <button
                type="button"
                onClick={() => {
                  loadVersionHistory();
                  setViewingVersion(null);
                  (document.getElementById('version-modal') as any)?.showModal();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border border-[var(--line)] bg-[var(--ink)] hover:border-[var(--red)] transition-colors min-h-[44px] cursor-pointer"
                title="View version history"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">v{currentVersion}</span>
              </button>
            )}

            {/* Private/Public Toggle */}
            {!isReadOnly && (
              <>
                {status === 'draft' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!canPublish) {
                        setShowPublishChecklist(true);
                      } else {
                        handleSave('live');
                      }
                    }}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-medium bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 transition-colors min-h-[44px] cursor-pointer"
                  >
                    Publish
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSave('draft')}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-medium border border-[var(--line)] text-[var(--smoke)] hover:text-[var(--paper)] transition-colors min-h-[44px] cursor-pointer"
                  >
                    Unpublish
                  </button>
                )}
              </>
            )}

            {/* Save Buttons */}
            {!isReadOnly && (
              <>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-[var(--red)] text-white hover:bg-[var(--red)]/90 transition-colors min-h-[44px] cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(undefined, true)}
                  disabled={saving}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border border-[var(--line)] hover:border-[var(--red)] transition-colors min-h-[44px] cursor-pointer"
                >
                  Save & Dashboard
                </button>
              </>
            )}

            {/* Delete Draft Button */}
            {!isReadOnly && status === 'draft' && pitchId && (
              <button
                type="button"
                onClick={handleDeleteDraft}
                className="p-2 text-[var(--smoke)] hover:text-red-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                title="Delete draft pitch"
                aria-label="Delete draft"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Welcome banner if ?welcome=1 */}
        {welcome && (
          <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs sm:text-sm text-[var(--paper)] flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[var(--red)] shrink-0" />
              <div>
                <span className="font-semibold">Your seed is planted!</span> Fill in what you can, save anytime, and publish when you're ready.
              </div>
            </div>
          </div>
        )}

        {/* Removed Banner */}
        {status === 'removed' && (
          <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6">
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs sm:text-sm text-red-300">
              <div className="font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> This pitch was removed by an administrator
              </div>
              <p className="text-xs text-red-200/80">
                Reason: {removedReason || 'No reason specified'}. The form is read-only.
              </p>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Main Layout: 2 Columns */}
        <div className="max-w-7xl mx-auto mt-6 px-4 sm:px-6 flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT: Sectioned Form */}
          <div className="flex-1 w-full space-y-8">
            <fieldset disabled={isReadOnly} className="space-y-8">
              {/* 1. Basics */}
              <section className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2 border-b border-[var(--line)]/60 pb-3">
                  <span>1. Basics</span>
                </h2>

                <div className="space-y-1">
                  <label htmlFor="field-title" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                    Title <span className="text-[var(--red)]">*</span>
                  </label>
                  <input
                    id="field-title"
                    type="text"
                    maxLength={150}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. Acme AI"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                  />
                  {validationErrors.title && (
                    <span className="text-[11px] text-red-400">{validationErrors.title}</span>
                  )}
                  <span className="text-[10px] text-[var(--smoke)] float-right">{title.length}/150</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="field-tagline" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                    Tagline
                  </label>
                  <input
                    id="field-tagline"
                    type="text"
                    maxLength={200}
                    value={tagline}
                    onChange={(e) => {
                      setTagline(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="One-line pitch for investors and prospective customers"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                  />
                  <span className="text-[10px] text-[var(--smoke)] float-right">{tagline.length}/200</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label htmlFor="field-industry" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                      Industry
                    </label>
                    <select
                      id="field-industry"
                      value={industry}
                      onChange={(e) => {
                        setIndustry(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)] cursor-pointer"
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="field-stage" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                      Stage
                    </label>
                    <select
                      id="field-stage"
                      value={stage}
                      onChange={(e) => {
                        setStage(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)] cursor-pointer"
                    >
                      {STAGES.map((stg) => (
                        <option key={stg.value} value={stg.value}>
                          {stg.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="field-country" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                      Country
                    </label>
                    <input
                      id="field-country"
                      type="text"
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="e.g. United States"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="field-city" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                      City
                    </label>
                    <input
                      id="field-city"
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="e.g. San Francisco"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                    />
                  </div>
                </div>
              </section>

              {/* 2. Problem and Solution */}
              <section className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2 border-b border-[var(--line)]/60 pb-3">
                  <span>2. Problem & Solution</span>
                </h2>

                <div className="space-y-1">
                  <label htmlFor="field-problem" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                    Problem
                  </label>
                  <textarea
                    id="field-problem"
                    rows={4}
                    maxLength={5000}
                    value={problem}
                    onChange={(e) => {
                      setProblem(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="What painful problem are you solving? Who feels it?"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)] leading-relaxed"
                  />
                  <span className="text-[10px] text-[var(--smoke)] float-right">{problem.length}/5000</span>
                </div>

                <div className="space-y-1 pt-2">
                  <label htmlFor="field-solution" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                    Solution
                  </label>
                  <textarea
                    id="field-solution"
                    rows={4}
                    maxLength={5000}
                    value={solution}
                    onChange={(e) => {
                      setSolution(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="How does your product uniquely solve this problem?"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)] leading-relaxed"
                  />
                  <span className="text-[10px] text-[var(--smoke)] float-right">{solution.length}/5000</span>
                </div>
              </section>

              {/* 3. Market */}
              <section className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2 border-b border-[var(--line)]/60 pb-3">
                  <span>3. Market</span>
                </h2>

                <div className="space-y-1">
                  <label htmlFor="field-target_customer" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                    Target Customer
                  </label>
                  <textarea
                    id="field-target_customer"
                    rows={2}
                    maxLength={3000}
                    value={targetCustomer}
                    onChange={(e) => {
                      setTargetCustomer(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Describe your primary buyer or user persona"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="field-market_size" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                    Market Size
                  </label>
                  <textarea
                    id="field-market_size"
                    rows={2}
                    maxLength={3000}
                    value={marketSize}
                    onChange={(e) => {
                      setMarketSize(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="TAM, SAM, SOM and industry growth indicators"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="field-competitors" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                    Competitors & Moat
                  </label>
                  <textarea
                    id="field-competitors"
                    rows={2}
                    maxLength={3000}
                    value={competitors}
                    onChange={(e) => {
                      setCompetitors(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Existing alternatives and why you will win"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                  />
                </div>
              </section>

              {/* 4. Business */}
              <section className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2 border-b border-[var(--line)]/60 pb-3">
                  <span>4. Business & Traction</span>
                </h2>

                <div className="space-y-1">
                  <label htmlFor="field-business_model" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                    Business Model
                  </label>
                  <textarea
                    id="field-business_model"
                    rows={2}
                    maxLength={3000}
                    value={businessModel}
                    onChange={(e) => {
                      setBusinessModel(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="How do you make money? Pricing, margins, channels"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="field-traction" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                    Traction
                  </label>
                  <textarea
                    id="field-traction"
                    rows={2}
                    maxLength={3000}
                    value={traction}
                    onChange={(e) => {
                      setTraction(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Metrics, revenue, active users, pilot agreements, growth"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="field-team" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                    Team
                  </label>
                  <textarea
                    id="field-team"
                    rows={2}
                    maxLength={3000}
                    value={team}
                    onChange={(e) => {
                      setTeam(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Founding team backgrounds, expertise, key advisors"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                  />
                </div>
              </section>

              {/* 5. Funding */}
              <section className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2 border-b border-[var(--line)]/60 pb-3">
                  <span>5. Funding</span>
                </h2>

                <div className="flex items-center gap-3">
                  <input
                    id="field-is_raising"
                    type="checkbox"
                    checked={isRaising}
                    onChange={(e) => {
                      setIsRaising(e.target.checked);
                      setIsDirty(true);
                    }}
                    className="w-4 h-4 rounded text-[var(--red)] bg-[var(--ink)] border-[var(--line)] focus:ring-[var(--red)] cursor-pointer"
                  />
                  <label htmlFor="field-is_raising" className="text-xs font-mono uppercase text-[var(--paper)] cursor-pointer">
                    Actively seeking funding / raising a round
                  </label>
                </div>

                {isRaising && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label htmlFor="field-amount_seeking" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                        Amount Seeking
                      </label>
                      <input
                        id="field-amount_seeking"
                        type="number"
                        min="0"
                        step="1000"
                        value={amountSeeking}
                        onChange={(e) => {
                          setAmountSeeking(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="e.g. 250000"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                      />
                      {validationErrors.amountSeeking && (
                        <span className="text-[11px] text-red-400">{validationErrors.amountSeeking}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="field-currency" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                        Currency
                      </label>
                      <select
                        id="field-currency"
                        value={currency}
                        onChange={(e) => {
                          setCurrency(e.target.value);
                          setIsDirty(true);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)] cursor-pointer"
                      >
                        {CURRENCIES.map((cur) => (
                          <option key={cur} value={cur}>
                            {cur}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1 pt-2">
                  <label htmlFor="field-use_of_funds" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                    Use of Funds
                  </label>
                  <textarea
                    id="field-use_of_funds"
                    rows={2}
                    maxLength={3000}
                    value={useOfFunds}
                    onChange={(e) => {
                      setUseOfFunds(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="How will this capital be allocated? (e.g. 50% Engineering, 30% GTM, 20% Ops)"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                  />
                </div>
              </section>

              {/* 6. Media and Links */}
              <section className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-5">
                <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)] flex items-center gap-2 border-b border-[var(--line)]/60 pb-3">
                  <span>6. Media & Links</span>
                </h2>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase text-[var(--smoke)]">Company Logo</label>
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-14 h-14 rounded-xl object-cover border border-[var(--line)]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[var(--ink)] border border-[var(--line)] flex items-center justify-center text-[var(--smoke)] text-xs font-mono">
                        No Logo
                      </div>
                    )}
                    <div>
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono border border-[var(--line)] hover:border-[var(--red)] bg-[var(--ink)] cursor-pointer transition-colors min-h-[44px]">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo (max 5MB)'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="sr-only"
                        />
                      </label>
                      <p className="text-[10px] text-[var(--smoke)] mt-1 font-mono">JPG, PNG, WebP or GIF</p>
                    </div>
                  </div>
                </div>

                {/* Pitch Deck Upload */}
                <div className="space-y-2 pt-2 border-t border-[var(--line)]/50">
                  <label className="block text-xs font-mono uppercase text-[var(--smoke)]">Pitch Deck (PDF / PPTX)</label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono border border-[var(--line)] hover:border-[var(--red)] bg-[var(--ink)] cursor-pointer transition-colors min-h-[44px]">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{uploadingDeck ? 'Uploading...' : pitchDeckPath ? 'Replace Deck (max 20MB)' : 'Upload Deck (max 20MB)'}</span>
                      <input
                        type="file"
                        accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        onChange={handleDeckUpload}
                        disabled={uploadingDeck}
                        className="sr-only"
                      />
                    </label>
                    {pitchDeckPath && (
                      <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Deck attached
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--line)]/50">
                  <div className="space-y-1">
                    <label htmlFor="field-website_url" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                      Website URL
                    </label>
                    <input
                      id="field-website_url"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => {
                        setWebsiteUrl(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="https://example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="field-demo_video_url" className="block text-xs font-mono uppercase text-[var(--smoke)]">
                      Demo Video URL
                    </label>
                    <input
                      id="field-demo_video_url"
                      type="url"
                      value={demoVideoUrl}
                      onChange={(e) => {
                        setDemoVideoUrl(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] focus:outline-none focus:border-[var(--red)]"
                    />
                  </div>
                </div>
              </section>
            </fieldset>
          </div>

          {/* RIGHT: Side Panel */}
          <aside className="w-full lg:w-80 space-y-6 shrink-0 lg:sticky lg:top-24">
            {/* Pitch Completeness Card */}
            <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono uppercase mb-1">
                  <span className="text-[var(--paper)] font-semibold">Completeness</span>
                  <span className="text-[var(--smoke)]">{completenessPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--line)]/40 overflow-hidden">
                  <div
                    className="h-full bg-[var(--red)] transition-all duration-300 rounded-full"
                    style={{ width: `${completenessPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-[var(--smoke)] mt-1.5 font-mono">
                  {filledCount} of {CORE_SECTIONS.length} core sections complete
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[var(--line)]/50 text-xs font-mono">
                {completeness.map((sec) => (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => scrollToField(sec.fieldId)}
                    className="w-full flex items-center justify-between py-1 px-1.5 rounded hover:bg-[var(--line)]/20 transition-colors text-left cursor-pointer min-h-[32px]"
                  >
                    <span className={sec.filled ? 'text-[var(--paper)]' : 'text-[var(--smoke)]'}>
                      {sec.label}
                    </span>
                    {sec.filled ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-[var(--smoke)] uppercase">Missing</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Mentor Card (When Flag is False) */}
            {!ENABLE_AI_MENTOR && (
              <div className="p-4 rounded-2xl bg-[var(--card)]/40 border border-dashed border-[var(--line)] text-center space-y-1">
                <Sparkles className="w-4 h-4 text-[var(--smoke)] mx-auto opacity-70" />
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--smoke)]">
                  AI Mentor
                </div>
                <p className="text-[11px] text-[var(--smoke)]">Coming soon</p>
              </div>
            )}
          </aside>
        </div>

        {/* Publish Requirements Modal */}
        {showPublishChecklist && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[var(--card)] border border-[var(--line)] rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-mono uppercase tracking-wider text-[var(--paper)]">
                Cannot Publish Yet
              </h3>
              <p className="text-xs text-[var(--smoke)] leading-relaxed">
                Before publishing your pitch to the live marketplace, the following 6 core fields are required:
              </p>

              <div className="space-y-2 py-2">
                {publishRequirements.map((req) => (
                  <button
                    key={req.label}
                    type="button"
                    onClick={() => {
                      setShowPublishChecklist(false);
                      scrollToField(req.id);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-[var(--ink)]/40 border border-[var(--line)]/50 text-xs font-mono text-left cursor-pointer hover:border-[var(--red)] transition-colors min-h-[44px]"
                  >
                    <span className={req.met ? 'text-[var(--paper)]' : 'text-red-400'}>
                      {req.label}
                    </span>
                    {req.met ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] uppercase text-red-400">Required</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowPublishChecklist(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-medium bg-[var(--line)] hover:bg-[var(--line)]/80 text-[var(--paper)] transition-colors min-h-[44px]"
                >
                  Close & Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Version History Dialog */}
        <dialog
          id="version-modal"
          className="rounded-2xl bg-[var(--card)] border border-[var(--line)] p-6 max-w-lg w-full text-[var(--paper)] backdrop:bg-black/70"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--paper)]">
              Version History
            </h3>
            <button
              onClick={() => (document.getElementById('version-modal') as any)?.close()}
              className="text-xs font-mono text-[var(--smoke)] hover:text-[var(--paper)] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="my-4 max-h-[60vh] overflow-y-auto space-y-3">
            {loadingVersions && (
              <div className="py-8 text-center text-xs font-mono text-[var(--smoke)]">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                Loading versions...
              </div>
            )}
            {!loadingVersions && versions.length === 0 && (
              <p className="py-8 text-center text-xs font-mono text-[var(--smoke)]">
                No past versions recorded.
              </p>
            )}
            {!loadingVersions &&
              versions.map((ver) => (
                <div
                  key={ver.id}
                  className="p-3.5 rounded-xl bg-[var(--ink)]/50 border border-[var(--line)] flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div>
                    <div className="font-semibold text-[var(--paper)]">
                      Version {ver.version_number}
                    </div>
                    <div className="text-[10px] text-[var(--smoke)]">
                      {new Date(ver.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(ver)}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--line)] text-[var(--paper)] hover:border-[var(--red)] transition-colors cursor-pointer min-h-[36px]"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <div className="pt-3 border-t border-[var(--line)] flex justify-end">
            <button
              onClick={() => (document.getElementById('version-modal') as any)?.close()}
              className="px-4 py-2 rounded-xl text-xs font-mono bg-[var(--line)] text-[var(--paper)] min-h-[44px] cursor-pointer"
            >
              Close
            </button>
          </div>
        </dialog>
      </div>
    </FounderGuard>
  );
}
