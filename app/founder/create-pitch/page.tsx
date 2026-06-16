"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { awardXp } from '@/lib/award-xp';
import { isPitchProfileComplete } from '@/lib/pitch-completion';
import { getDealEnforcementState } from '@/lib/deal-enforcement';
import { 
 Plus, 
 X, 
 Globe,
 CheckCircle2,
 Upload,
 FileText,
 Video,
 Users,
 Trash2,
 Edit2,
 Lock,
 ArrowRight
} from 'lucide-react';

const SECTORS = [
 "3D Printing", "Advanced Materials", "Aerospace", "AI", "Agriculture", "Alt Protein", 
 "Art & Design", "Automotive", "Big Data", "Biotechnology", "Blockchain", "Chemistry", 
 "CivicTech", "Cleantech", "Climate", "Construction", "CRM", "Data & Analytics", 
 "DeepTech", "DevOps", "Drones", "E-commerce", "Education", "Energy", 
 "Enterprise Software", "Fashion", "Fintech", "FMCG", "Food & Beverage", "Gaming", 
 "Generative AI", "Hardware", "Healthtech", "ICT", "Insurtech", "Legal", 
 "Logistics", "Marketplace", "Media", "PropTech", "Retail", "SaaS", "Travel", "Cybersecurity"
];

const QUESTIONS = [
 { id: 'q1', text: "What does your company do?" },
 { id: 'q2', text: "What problem do you solve?" },
 { id: 'q3', text: "How does your product/service work? List main features." },
 { id: 'q4', text: "What is the development stage and roadmap?" },
 { id: 'q5', text: "What is your go-to-market strategy?" },
 { id: 'q6', text: "What is your business and revenue model?" },
 { id: 'q7', text: "What traction have you achieved?" },
 { id: 'q8', text: "What is your competitive advantage and moat?" },
 { id: 'q9', text: "Why is now the right time?" }
];

export default function CreatePitch() {
 const router = useRouter();
 const [pitchId, setPitchId] = useState<string | null>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [activeTab, setActiveTab] = useState('Overview');
 const [showSectorModal, setShowSectorModal] = useState(false);
 const [completion, setCompletion] = useState(0);
 const [showMemberDrawer, setShowMemberDrawer] = useState(false);
 const [editingMember, setEditingMember] = useState<any>(null);
 const [drawerType, setDrawerType] = useState<'member' | 'advisor'>('member');
 const [submitting, setSubmitting] = useState(false);
 const [pitchCreationLocked, setPitchCreationLocked] = useState(false);

 // Form State
 const [formData, setFormData] = useState({
 title: '',
 tagline: '',
 logo_url: '',
 website_url: '',
 short_description: '',
 country: '',
 state: '',
 city: '',
 tags: [] as string[],
 custom_industry: '',
 business_type: '',
 product_type: '',
 company_stage: '',
 annual_revenue: '',
 mrr: '',
 employees_count: '',
 linkedin_url: '',
 facebook_url: '',
 x_url: '',
 instagram_url: '',
 round_type: '',
 amount_seeking: '',
 equity_pct: '',
 already_committed: '',
 security_type: '',
 committed_investors: '',
 use_of_funds: '',
 founding_year: '',
 is_raising: true,
 round_closes_at: '',
 pitch_deck_url: '',
 video_url: '',
 demo_video_url: '',
 additional_docs: [] as { name: string, url: string }[],
 team_data: [] as any[],
 qa_data: {} as Record<string, string>,
 custom_qa: [] as { question: string, answer: string }[]
 });

 const [logoPreview, setLogoPreview] = useState<string | null>(null);
 const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 const profileXpAwardedRef = useRef(false);
 const deckXpAwardedRef = useRef(false);
 const [founderId, setFounderId] = useState<string | null>(null);

 // Load existing draft or create new one
 useEffect(() => {
 const initPitch = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 router.push('/login');
 return;
 }
 setFounderId(user.id);

 const { data: founderDeals } = await supabase
 .from('deals')
 .select('*')
 .eq('founder_id', user.id)
 .is('paid_at', null);
 const hasCreationLock = (founderDeals || []).some((deal: any) => {
 const enforcement = getDealEnforcementState(deal);
 return enforcement.isLocked || enforcement.isBanned;
 });
 setPitchCreationLocked(hasCreationLock);

 // Check for draft
 const { data: existingPitch } = await supabase
 .from('pitches')
 .select('*')
 .eq('founder_id', user.id)
 .eq('status', 'draft')
 .order('created_at', { ascending: false })
 .limit(1)
 .single();

 if (existingPitch) {
 setPitchId(existingPitch.id);
 setFormData({
 title: existingPitch.title || '',
 tagline: existingPitch.tagline || '',
 logo_url: existingPitch.logo_url || '',
 website_url: existingPitch.website_url || '',
 short_description: existingPitch.short_description || '',
 country: existingPitch.country || '',
 state: existingPitch.state || '',
 city: existingPitch.city || '',
 tags: existingPitch.tags || [],
 custom_industry: existingPitch.custom_industry || '',
 business_type: existingPitch.business_type || '',
 product_type: existingPitch.product_type || '',
 company_stage: existingPitch.company_stage || '',
 annual_revenue: existingPitch.annual_revenue?.toString() || '',
 mrr: existingPitch.mrr?.toString() || '',
 employees_count: existingPitch.employees_count?.toString() || '',
 linkedin_url: existingPitch.linkedin_url || '',
 facebook_url: existingPitch.facebook_url || '',
 x_url: existingPitch.x_url || '',
 instagram_url: existingPitch.instagram_url || '',
 round_type: existingPitch.round_type || '',
 amount_seeking: existingPitch.amount_seeking?.toString() || '',
 equity_pct: existingPitch.equity_pct?.toString() || '',
 already_committed: existingPitch.already_committed?.toString() || '',
 security_type: existingPitch.security_type || '',
 committed_investors: existingPitch.committed_investors || '',
 use_of_funds: existingPitch.use_of_funds || '',
 founding_year: existingPitch.founding_year?.toString() || '',
 is_raising: existingPitch.is_raising ?? true,
 round_closes_at: existingPitch.round_closes_at
 ? new Date(existingPitch.round_closes_at).toISOString().slice(0, 10)
 : '',
 pitch_deck_url: existingPitch.pitch_deck_url || '',
 video_url: existingPitch.video_url || '',
 demo_video_url: existingPitch.demo_video_url || '',
 additional_docs: existingPitch.additional_docs || [],
 team_data: existingPitch.team_data || [],
 qa_data: existingPitch.qa_data || {},
 custom_qa: existingPitch.custom_qa || []
 });
 if (existingPitch.logo_url) setLogoPreview(existingPitch.logo_url);
 if (existingPitch.pitch_deck_url) deckXpAwardedRef.current = true;
 if (isPitchProfileComplete({
 title: existingPitch.title || '',
 logo_url: existingPitch.logo_url || '',
 website_url: existingPitch.website_url || '',
 short_description: existingPitch.short_description || '',
 country: existingPitch.country || '',
 state: existingPitch.state || '',
 city: existingPitch.city || '',
 business_type: existingPitch.business_type || '',
 product_type: existingPitch.product_type || '',
 company_stage: existingPitch.company_stage || '',
 founding_year: existingPitch.founding_year?.toString() || '',
 tags: existingPitch.tags || [],
 })) {
 profileXpAwardedRef.current = true;
 }
 } else {
 // Create new draft
 const { data: newPitch, error } = await supabase
 .from('pitches')
 .insert([{ founder_id: user.id, status: 'draft' }])
 .select()
 .single();
 
 if (newPitch) setPitchId(newPitch.id);
 }
 setLoading(false);
 };

 initPitch();
 }, [router]);

 // Calculate completion percentage
 useEffect(() => {
 const fields = [
 'title', 'logo_url', 'website_url', 'short_description', 
 'country', 'state', 'city', 'business_type', 'product_type', 
 'company_stage', 'founding_year'
 ];
 const filled = fields.filter(f => !!formData[f as keyof typeof formData]).length;
 const sectorFilled = formData.tags.length > 0 ? 1 : 0;
 const total = fields.length + 1;
 setCompletion(Math.round(((filled + sectorFilled) / total) * 100));
 }, [formData]);

 useEffect(() => {
 if (!founderId || profileXpAwardedRef.current) return;
 if (isPitchProfileComplete(formData)) {
 profileXpAwardedRef.current = true;
 awardXp('profile_complete', founderId);
 }
 }, [formData, founderId]);

 const buildPitchPayload = useCallback((data: typeof formData, extras: Record<string, any> = {}) => ({
 title: data.title,
 tagline: data.tagline,
 website_url: data.website_url,
 short_description: data.short_description,
 country: data.country,
 state: data.state,
 city: data.city,
 tags: data.tags,
 custom_industry: data.custom_industry,
 business_type: data.business_type,
 product_type: data.product_type,
 company_stage: data.company_stage,
 annual_revenue: data.annual_revenue ? parseInt(data.annual_revenue) : null,
 mrr: data.mrr ? parseInt(data.mrr) : null,
 employees_count: data.employees_count ? parseInt(data.employees_count) : null,
 linkedin_url: data.linkedin_url,
 facebook_url: data.facebook_url,
 x_url: data.x_url,
 instagram_url: data.instagram_url,
 round_type: data.round_type,
 amount_seeking: data.amount_seeking ? parseInt(data.amount_seeking) : null,
 equity_pct: data.equity_pct ? parseFloat(data.equity_pct) : null,
 already_committed: data.already_committed ? parseInt(data.already_committed) : null,
 security_type: data.security_type,
 committed_investors: data.committed_investors,
 use_of_funds: data.use_of_funds,
 founding_year: data.founding_year ? parseInt(data.founding_year) : null,
 is_raising: data.is_raising,
 round_closes_at: data.round_closes_at
 ? new Date(data.round_closes_at).toISOString()
 : null,
 pitch_deck_url: data.pitch_deck_url,
 video_url: data.video_url,
 demo_video_url: data.demo_video_url,
 additional_docs: data.additional_docs,
 team_data: data.team_data,
 qa_data: data.qa_data,
 custom_qa: data.custom_qa,
 updated_at: new Date().toISOString(),
 ...extras
 }), []);

 const updatePitch = useCallback(async (payload: Record<string, any>) => {
 const { error } = await supabase
 .from('pitches')
 .update(payload)
 .eq('id', pitchId);

 if (error && error.message?.includes('custom_qa')) {
 const { custom_qa, ...payloadWithoutCustomQa } = payload;
 return supabase
 .from('pitches')
 .update(payloadWithoutCustomQa)
 .eq('id', pitchId);
 }

 return { error };
 }, [pitchId]);

 // Auto-save logic
 const saveToSupabase = useCallback(async (data: typeof formData) => {
 if (!pitchId) return;
 setSaving(true);
 
 const { error } = await updatePitch(buildPitchPayload(data));

 if (error) console.error('Error auto-saving:', error);
 setSaving(false);
 }, [pitchId, buildPitchPayload, updatePitch]);

 const notifySavedInvestors = async () => {
 if (!pitchId) return;
 const { data: savedRows } = await supabase
 .from('saved_pitches')
 .select('user_id')
 .eq('pitch_id', pitchId);

 const userIds = Array.from(new Set((savedRows || []).map((row: any) => row.user_id).filter(Boolean)));
 if (userIds.length === 0) return;

 await supabase.from('notifications').insert(userIds.map((userId) => ({
 user_id: userId,
 type: 'funding_closed',
 message: 'A pitch you saved has marked funding as closed.',
 link: `/pitch/${pitchId}`,
 })));
 };

 const handleChange = (field: string, value: any) => {
 setFormData(prev => {
 const newData = { ...prev, [field]: value };
 if (field === 'is_raising' && prev.is_raising === true && value === false) {
 setTimeout(() => {
 if (confirm('Notify your Ventex investors?')) {
 notifySavedInvestors();
 }
 }, 0);
 }
 
 if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
 saveTimeoutRef.current = setTimeout(() => {
 saveToSupabase(newData);
 }, 2000);
 
 return newData;
 });
 };

 const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file || !pitchId) return;

 // Preview
 const reader = new FileReader();
 reader.onloadend = () => setLogoPreview(reader.result as string);
 reader.readAsDataURL(file);

 // Upload to Supabase Storage
 const fileExt = file.name.split('.').pop();
 const filePath = `pitch-logos/${pitchId}.${fileExt}`;

 const { error: uploadError } = await supabase.storage
 .from('ventex-assets')
 .upload(filePath, file, { upsert: true });

 if (!uploadError) {
 const { data: { publicUrl } } = supabase.storage
 .from('ventex-assets')
 .getPublicUrl(filePath);
 
 handleChange('logo_url', publicUrl);
 }
 };

 const toggleSector = (sector: string) => {
 let newTags = [...formData.tags];
 if (newTags.includes(sector)) {
 newTags = newTags.filter(t => t !== sector);
 } else if (newTags.length < 5) {
 newTags.push(sector);
 }
 handleChange('tags', newTags);
 };

 const handleSubmit = async () => {
 console.log("handleSubmit called. pitchId:", pitchId);
 if (!pitchId) {
 alert("Error: No pitch ID found. Please try refreshing the page.");
 return;
 }
 if (pitchCreationLocked) {
 alert("Founder cannot create new pitches while a platform fee settlement is overdue post early access.");
 return;
 }
 
 setSubmitting(true);
 
 const { error } = await updatePitch(buildPitchPayload(formData, { status: 'pending' }));

 if (!error) {
 console.log("Pitch submitted successfully");
 // Call AI summary API
 try {
 const { data: { session } } = await supabase.auth.getSession();
 await fetch('/api/generate-summary', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
 },
 body: JSON.stringify({ pitchId })
 });
 } catch (e) {
 console.error("AI summary failed", e);
 }
 
 alert("Your pitch has been submitted for review!");
 router.push('/founder/dashboard');
 } else {
 console.error("Submit error:", error);
 alert("Failed to submit pitch: " + error.message);
 }
 setSubmitting(false);
 };

 if (loading) {
 return (
 <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
 <div className="flex flex-col items-center gap-4">
 <div className="w-8 h-8 border-4 border-[#222222]/20 border-t-[#222222] rounded-full animate-spin"></div>
 <span className="text-sm font-bold text-[var(--text)] uppercase tracking-widest">Loading Pitch...</span>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-[var(--bg)] pb-20">
 {/* Top Bar */}
 <div className="sticky top-0 z-50 bg-[var(--text)] text-[var(--bg)] px-6 py-4 shadow-lg">
 <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
 <div className="flex items-center gap-4 min-w-[150px]">
 <span className="text-sm font-medium whitespace-nowrap">Profile {completion}%</span>
 </div>
 
 <div className="flex-grow max-w-xl h-2 bg-[var(--card-bg)]/10 rounded-full overflow-hidden">
 <div 
 className="h-full bg-[var(--card-bg)] transition-all duration-500 ease-out" 
 style={{ width: `${completion}%` }}
 />
 </div>

 <div className="flex items-center gap-3">
 {saving && <span className="text-[10px] text-[var(--text)]/50 animate-pulse uppercase tracking-widest font-bold">Auto-saving...</span>}
 <button className="px-5 py-2 text-sm font-bold bg-[var(--card-bg)]/10 hover:bg-[var(--card-bg)]/20 rounded-lg transition-colors">
 Preview profile
 </button>
 <button className="px-5 py-2 text-sm font-bold bg-[var(--card-bg)] text-[var(--text)] rounded-lg hover:bg-gray-200 transition-colors">
 Checklist
 </button>
 </div>
 </div>
 </div>

 {pitchCreationLocked && (
 <div className="bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700">
 Founder cannot create new pitches while a platform fee settlement is overdue post early access.
 </div>
 )}

 <div className="max-w-4xl mx-auto mt-8 px-4">
 {/* Tabs */}
 <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
 {['Overview', 'Pitch Deck', 'Video', 'Team', 'Q&A'].map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
 activeTab === tab 
 ? 'bg-[var(--text)] text-[var(--bg)]' 
 : 'bg-[var(--card-bg)] text-[var(--text2)] border-[0.5px] border-[var(--border)] hover:border-[#222222] hover:text-[var(--text)]'
 }`}
 >
 {tab}
 </button>
 ))}
 </div>

 {activeTab === 'Overview' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <section className="bg-[var(--card-bg)] rounded-2xl p-8 border-[0.5px] border-[var(--border)] shadow-sm">
 <h2 className="text-xl font-bold text-[var(--text)] mb-6">Company Overview</h2>
 <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
 <div className="flex flex-col gap-3">
 <label className="text-sm font-bold text-[var(--text)]">Logo</label>
 <div 
 className="w-[200px] h-[200px] bg-[var(--bg)] rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
 onClick={() => document.getElementById('logo-input')?.click()}
 >
 {logoPreview ? (
 <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
 ) : (
 <>
 <Upload className="w-8 h-8 text-[var(--text2)] mb-2" />
 <span className="text-[10px] text-[var(--text2)] font-bold uppercase tracking-wider">Drag & drop</span>
 </>
 )}
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
 <span className="text-[var(--text)] text-xs font-bold">Change Logo</span>
 </div>
 </div>
 <input id="logo-input" type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
 </div>

 <div className="space-y-6">
 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Startup title</label>
 <input 
 type="text"
 placeholder="e.g. Ventex"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.title}
 onChange={(e) => handleChange('title', e.target.value)}
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Short description</label>
 <div className="relative">
 <textarea 
 maxLength={200}
 rows={3}
 placeholder="What problem are you solving? (Max 200 chars)"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all resize-none"
 value={formData.short_description}
 onChange={(e) => handleChange('short_description', e.target.value)}
 />
 <span className="absolute bottom-3 right-4 text-[10px] font-bold text-[var(--text2)]">
 {formData.short_description.length}/200
 </span>
 </div>
 <p className="mt-2 text-xs text-[var(--text2)] italic">
 Note: Our AI will also auto-generate a separate briefing when you submit.
 </p>
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Website URL</label>
 <div className="relative">
 <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text2)]" />
 <input 
 type="url"
 placeholder="https://example.com"
 className="w-full pl-11 pr-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.website_url}
 onChange={(e) => handleChange('website_url', e.target.value)}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Country</label>
 <select 
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--card-bg)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all appearance-none"
 value={formData.country}
 onChange={(e) => handleChange('country', e.target.value)}
 >
 <option value="">Select country</option>
 <option value="United States">United States</option>
 <option value="United Kingdom">United Kingdom</option>
 <option value="Germany">Germany</option>
 <option value="India">India</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">State</label>
 <input
 type="text"
 placeholder="e.g. Kerala"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.state}
 onChange={(e) => handleChange('state', e.target.value)}
 />
 </div>
 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">City</label>
 <input 
 type="text"
 placeholder="e.g. San Francisco"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.city}
 onChange={(e) => handleChange('city', e.target.value)}
 />
 </div>
 </div>
 </div>
 </div>

 <div className="mt-10 pt-10 border-t-[0.5px] border-[var(--border)]">
 <div className="flex items-center justify-between mb-4">
 <label className="text-sm font-bold text-[var(--text)]">Sectors (Select up to 5)</label>
 <button 
 onClick={() => setShowSectorModal(true)}
 className="flex items-center gap-2 text-sm font-bold text-[var(--text)] hover:opacity-70"
 >
 <Plus className="w-4 h-4" /> Add sector
 </button>
 </div>

 <div className="flex flex-wrap gap-2">
 {formData.tags.map(sector => (
 <span 
 key={sector} 
 className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--text)] text-[var(--bg)] text-xs font-bold rounded-full"
 >
 {sector}
 <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSector(sector)} />
 </span>
 ))}
 {formData.tags.length === 0 && (
 <span className="text-sm text-[var(--text2)]">No sectors selected yet.</span>
 )}
 </div>

 <div className="mt-6">
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Propose a custom sector</label>
 <input 
 type="text"
 placeholder="Enter custom sector name..."
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.custom_industry}
 onChange={(e) => handleChange('custom_industry', e.target.value)}
 />
 </div>
 </div>
 </section>

 <section className="bg-[var(--card-bg)] rounded-2xl p-8 border-[0.5px] border-[var(--border)] shadow-sm">
 <h2 className="text-xl font-bold text-[var(--text)] mb-6">Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Business type</label>
 <div className="grid grid-cols-2 gap-2">
 {['B2B', 'B2C', 'B2B2C', 'Marketplace'].map(type => (
 <button
 key={type}
 onClick={() => handleChange('business_type', type)}
 className={`py-3 rounded-xl border-[0.5px] text-xs font-bold transition-all ${
 formData.business_type === type 
 ? 'bg-[var(--text)] text-[var(--bg)] border-[#222222]' 
 : 'bg-[var(--card-bg)] text-[var(--text)] border-[var(--border)] hover:border-[#222222]'
 }`}
 >
 {type}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Product type</label>
 <div className="grid grid-cols-2 gap-2">
 {['SaaS', 'App', 'Hardware', 'Service', 'Other'].map(type => (
 <button
 key={type}
 onClick={() => handleChange('product_type', type)}
 className={`py-3 rounded-xl border-[0.5px] text-xs font-bold transition-all ${
 formData.product_type === type 
 ? 'bg-[var(--text)] text-[var(--bg)] border-[#222222]' 
 : 'bg-[var(--card-bg)] text-[var(--text)] border-[var(--border)] hover:border-[#222222]'
 }`}
 >
 {type}
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Company stage</label>
 <select 
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--card-bg)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all appearance-none"
 value={formData.company_stage}
 onChange={(e) => handleChange('company_stage', e.target.value)}
 >
 <option value="">Select stage</option>
 {['Idea', 'Building', 'Pre-Launch', 'Beta', 'Live', 'Seeking Investment', 'Revenue Generating'].map(stage => (
 <option key={stage} value={stage}>{stage}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Annual revenue (USD)</label>
 <input 
 type="number"
 placeholder="e.g. 500000"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.annual_revenue}
 onChange={(e) => handleChange('annual_revenue', e.target.value)}
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">MRR (USD)</label>
 <input 
 type="number"
 placeholder="e.g. 40000"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.mrr}
 onChange={(e) => handleChange('mrr', e.target.value)}
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Employees count</label>
 <input 
 type="number"
 placeholder="e.g. 10"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.employees_count}
 onChange={(e) => handleChange('employees_count', e.target.value)}
 />
 </div>
 </div>
 </section>

 <section className="bg-[var(--card-bg)] rounded-2xl p-8 border-[0.5px] border-[var(--border)] shadow-sm">
 <h2 className="text-xl font-bold text-[var(--text)] mb-6">Social Media Links</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {[
 { name: 'LinkedIn', icon: Globe, field: 'linkedin_url' },
 { name: 'Facebook', icon: Globe, field: 'facebook_url' },
 { name: 'X', icon: Globe, field: 'x_url' },
 { name: 'Instagram', icon: Globe, field: 'instagram_url' }
 ].map(social => (
 <div key={social.name}>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">{social.name}</label>
 <div className="relative">
 <social.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text2)]" />
 <input 
 type="url"
 placeholder={`${social.name} profile URL`}
 className="w-full pl-11 pr-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={(formData[social.field as keyof typeof formData] as string) || ''}
 onChange={(e) => handleChange(social.field, e.target.value)}
 />
 </div>
 </div>
 ))}
 </div>
 </section>

 <section className="bg-[var(--card-bg)] rounded-2xl p-8 border-[0.5px] border-[var(--border)] shadow-sm">
 <h2 className="text-xl font-bold text-[var(--text)] mb-6">Funding Rounds</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Round type</label>
 <select 
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--card-bg)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all appearance-none"
 value={formData.round_type}
 onChange={(e) => handleChange('round_type', e.target.value)}
 >
 <option value="">Select round</option>
 {['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Bridge', 'Grant'].map(r => (
 <option key={r} value={r}>{r}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Amount seeking (USD)</label>
 <input 
 type="number"
 placeholder="e.g. 1000000"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.amount_seeking}
 onChange={(e) => handleChange('amount_seeking', e.target.value)}
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Equity %</label>
 <input 
 type="number"
 step="0.01"
 placeholder="e.g. 10"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.equity_pct}
 onChange={(e) => handleChange('equity_pct', e.target.value)}
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Already committed (USD)</label>
 <input 
 type="number"
 placeholder="e.g. 250000"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.already_committed}
 onChange={(e) => handleChange('already_committed', e.target.value)}
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Security type</label>
 <select 
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] bg-[var(--card-bg)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all appearance-none"
 value={formData.security_type}
 onChange={(e) => handleChange('security_type', e.target.value)}
 >
 <option value="">Select security</option>
 {['SAFE', 'Convertible Note', 'Equity', 'Debt'].map(s => (
 <option key={s} value={s}>{s}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Committed investors</label>
 <input 
 type="text"
 placeholder="e.g. Sequoia, Accel"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.committed_investors}
 onChange={(e) => handleChange('committed_investors', e.target.value)}
 />
 </div>

 <div className="md:col-span-2">
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Use of funds</label>
 <textarea 
 rows={3}
 placeholder="How will you spend the capital?"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all resize-none"
 value={formData.use_of_funds}
 onChange={(e) => handleChange('use_of_funds', e.target.value)}
 />
 </div>

 <div>
 <label className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-2 cursor-pointer">
 <input
 type="checkbox"
 checked={formData.is_raising}
 onChange={(e) => handleChange('is_raising', e.target.checked)}
 className="rounded border-[var(--border)]"
 />
 Actively raising
 </label>
 </div>

 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Round closing date (optional)</label>
 <input
 type="date"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.round_closes_at}
 onChange={(e) => handleChange('round_closes_at', e.target.value)}
 />
 </div>
 </div>
 </section>

 <section className="bg-[var(--card-bg)] rounded-2xl p-8 border-[0.5px] border-[var(--border)] shadow-sm mb-12">
 <h2 className="text-xl font-bold text-[var(--text)] mb-6">Founding Year</h2>
 <div className="max-w-xs">
 <input 
 type="number"
 placeholder="e.g. 2024"
 className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
 value={formData.founding_year}
 onChange={(e) => handleChange('founding_year', e.target.value)}
 />
 </div>
 </section>
 </div>
 )}

 {activeTab === 'Pitch Deck' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <section className="bg-[var(--card-bg)] rounded-2xl p-8 border-[0.5px] border-[var(--border)] shadow-sm">
 <h2 className="text-xl font-bold text-[var(--text)] mb-6">Pitch Deck</h2>
 <div 
 className="w-full h-48 bg-[var(--bg)] rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--bg3)] transition-colors"
 onClick={() => document.getElementById('deck-input')?.click()}
 >
 {formData.pitch_deck_url ? (
 <div className="flex flex-col items-center">
 <FileText className="w-10 h-10 text-[var(--text)] mb-2" />
 <span className="text-sm font-bold text-[var(--text)]">Pitch Deck Uploaded</span>
 <span className="text-xs text-[var(--text2)] mt-1">Click to replace PDF</span>
 </div>
 ) : (
 <>
 <Upload className="w-8 h-8 text-[var(--text2)] mb-2" />
 <span className="text-sm font-bold text-[var(--text)]">Upload Pitch Deck (PDF)</span>
 </>
 )}
 <input id="deck-input" type="file" className="hidden" accept=".pdf" onChange={(e) => {
 const file = e.target.files?.[0];
 if (file && pitchId) {
 const path = `pitch-docs/${pitchId}/deck.pdf`;
 supabase.storage.from('ventex-assets').upload(path, file, { upsert: true }).then(({ error }) => {
 if (!error) {
 const { data: { publicUrl } } = supabase.storage.from('ventex-assets').getPublicUrl(path);
 handleChange('pitch_deck_url', publicUrl);
 if (founderId && !deckXpAwardedRef.current) {
 deckXpAwardedRef.current = true;
 awardXp('deck_upload', founderId);
 }
 }
 });
 }
 }} />
 </div>
 </section>
 
 <section className="bg-[var(--card-bg)] rounded-2xl p-8 border-[0.5px] border-[var(--border)] shadow-sm">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-bold text-[var(--text)]">Additional Documents</h2>
 <button onClick={() => document.getElementById('doc-input')?.click()} className="flex items-center gap-2 text-sm font-bold text-[var(--text)] hover:opacity-70"><Plus className="w-4 h-4" /> Upload other document</button>
 <input id="doc-input" type="file" className="hidden" onChange={(e) => {
 const file = e.target.files?.[0];
 if (file && pitchId) {
 const path = `pitch-docs/${pitchId}/${file.name}`;
 supabase.storage.from('ventex-assets').upload(path, file, { upsert: true }).then(({ error }) => {
 if (!error) {
 const { data: { publicUrl } } = supabase.storage.from('ventex-assets').getPublicUrl(path);
 const newDocs = [...formData.additional_docs, { name: file.name, url: publicUrl }];
 handleChange('additional_docs', newDocs);
 }
 });
 }
 }} />
 </div>
 <div className="space-y-3">
 {formData.additional_docs.map((doc: any, idx: number) => (
 <div key={idx} className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-xl">
 <div className="flex items-center gap-3">
 <FileText className="w-5 h-5 text-[var(--text2)]" />
 <span className="text-sm font-medium text-[var(--text)]">{doc.name}</span>
 </div>
 <button onClick={() => {
 const newDocs = formData.additional_docs.filter((_: any, i: number) => i !== idx);
 handleChange('additional_docs', newDocs);
 }} className="p-2 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
 </div>
 ))}
 {formData.additional_docs.length === 0 && <p className="text-sm text-[var(--text2)]">No additional documents yet.</p>}
 </div>
 </section>
 </div>
 )}
 
 {activeTab === 'Video' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <section className="bg-[var(--card-bg)] rounded-2xl p-8 border-[0.5px] border-[var(--border)] shadow-sm">
 <h2 className="text-xl font-bold text-[var(--text)] mb-6">Pitch Video</h2>
 <div className="space-y-6">
 <div>
 <label className="block text-sm font-bold text-[var(--text)] mb-2">Video URL (YouTube/Loom)</label>
 <div className="relative">
 <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text2)]" />
 <input type="url" placeholder="https://youtube.com/..." className="w-full pl-11 pr-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all" value={formData.video_url} onChange={(e) => handleChange('video_url', e.target.value)} />
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex-grow border-t-[0.5px] border-[var(--border)]"></div>
 <span className="text-xs font-bold text-[var(--text2)] uppercase tracking-widest">or upload MP4</span>
 <div className="flex-grow border-t-[0.5px] border-[var(--border)]"></div>
 </div>
 <div 
 className="w-full h-32 bg-[var(--bg)] rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--bg3)] transition-colors"
 onClick={() => document.getElementById('video-input')?.click()}
 >
 <Upload className="w-6 h-6 text-[var(--text2)] mb-2" />
 <span className="text-sm font-bold text-[var(--text)]">Upload MP4 (Max 500MB)</span>
 <input id="video-input" type="file" className="hidden" accept="video/mp4" onChange={(e) => {
 const file = e.target.files?.[0];
 if (file && pitchId) {
 if (file.size > 500 * 1024 * 1024) return alert("File too large");
 const path = `pitch-videos/${pitchId}/main.mp4`;
 supabase.storage.from('ventex-assets').upload(path, file, { upsert: true }).then(({ error }) => {
 if (!error) {
 const { data: { publicUrl } } = supabase.storage.from('ventex-assets').getPublicUrl(path);
 handleChange('video_url', publicUrl);
 }
 });
 }
 }} />
 </div>
 </div>
 </section>
 <section className="bg-[var(--card-bg)] rounded-2xl p-8 border-[0.5px] border-[var(--border)] shadow-sm">
 <h2 className="text-xl font-bold text-[var(--text)] mb-6">Product Demo Video (Optional)</h2>
 <div className="relative">
 <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text2)]" />
 <input type="url" placeholder="Link to product walkthrough" className="w-full pl-11 pr-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all" value={formData.demo_video_url} onChange={(e) => handleChange('demo_video_url', e.target.value)} />
 </div>
 </section>
 </div>
 )}
 
 {activeTab === 'Team' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <section className="bg-[var(--card-bg)] rounded-2xl p-8 border-[0.5px] border-[var(--border)] shadow-sm">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-bold text-[var(--text)]">Core Team</h2>
 <button onClick={() => { setDrawerType('member'); setEditingMember(null); setShowMemberDrawer(true); }} className="flex items-center gap-2 text-sm font-bold text-[var(--text)] hover:opacity-70"><Plus className="w-4 h-4" /> Add member</button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {formData.team_data.filter((m: any) => m.type === 'member').map((member: any, idx: number) => (
 <div key={idx} className="flex items-center gap-4 p-4 bg-[var(--bg)] rounded-2xl relative group">
 <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
 {member.photo_url ? <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" /> : <Users className="w-full h-full p-4 text-[var(--text2)]" />}
 </div>
 <div>
 <h4 className="font-bold text-[var(--text)]">{member.name}</h4>
 <p className="text-xs text-[var(--text2)] font-medium">{member.role}</p>
 </div>
 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
 <button onClick={() => { setDrawerType('member'); setEditingMember(member); setShowMemberDrawer(true); }} className="p-1.5 bg-[var(--card-bg)] rounded-lg shadow-sm hover:text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
 <button onClick={() => handleChange('team_data', formData.team_data.filter((m: any) => m.id !== member.id))} className="p-1.5 bg-[var(--card-bg)] rounded-lg shadow-sm hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
 </div>
 </div>
 ))}
 {formData.team_data.filter((m: any) => m.type === 'member').length === 0 && (
 <div className="md:col-span-2 py-12 flex flex-col items-center border-2 border-dashed border-[var(--border)] rounded-2xl">
 <Users className="w-10 h-10 text-[var(--text2)] mb-3" />
 <p className="text-sm text-[var(--text2)] font-bold">No team members added yet.</p>
 </div>
 )}
 </div>
 </section>
 <section className="bg-[var(--card-bg)] rounded-2xl p-8 border-[0.5px] border-[var(--border)] shadow-sm">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-bold text-[var(--text)]">Advisors</h2>
 <button onClick={() => { setDrawerType('advisor'); setEditingMember(null); setShowMemberDrawer(true); }} className="flex items-center gap-2 text-sm font-bold text-[var(--text)] hover:opacity-70"><Plus className="w-4 h-4" /> Add advisor</button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {formData.team_data.filter((m: any) => m.type === 'advisor').map((member: any, idx: number) => (
 <div key={idx} className="flex items-center gap-4 p-4 bg-[var(--bg)] rounded-2xl relative group">
 <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
 {member.photo_url ? <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" /> : <Users className="w-full h-full p-3 text-[var(--text2)]" />}
 </div>
 <div>
 <h4 className="font-bold text-[var(--text)] text-sm">{member.name}</h4>
 <p className="text-[10px] text-[var(--text2)] font-bold uppercase tracking-wider">{member.role}</p>
 </div>
 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
 <button onClick={() => { setDrawerType('advisor'); setEditingMember(member); setShowMemberDrawer(true); }} className="p-1.5 bg-[var(--card-bg)] rounded-lg shadow-sm hover:text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
 <button onClick={() => handleChange('team_data', formData.team_data.filter((m: any) => m.id !== member.id))} className="p-1.5 bg-[var(--card-bg)] rounded-lg shadow-sm hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
 </div>
 </div>
 ))}
 {formData.team_data.filter((m: any) => m.type === 'advisor').length === 0 && <p className="text-sm text-[var(--text2)]">No advisors listed yet.</p>}
 </div>
 </section>
 </div>
 )}
 
 {activeTab === 'Q&A' && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="bg-emerald-50 border-[0.5px] border-emerald-200 rounded-xl p-4 flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[var(--text)] font-bold text-sm">!</div>
 <p className="text-sm text-emerald-800 font-medium">Investors love this section - we recommend filling it.</p>
 </div>
 <section className="bg-[var(--card-bg)] rounded-2xl p-8 border-[0.5px] border-[var(--border)] shadow-sm">
 <div className="space-y-10">
 {QUESTIONS.map((q: any) => (
 <div key={q.id}>
 <label className="text-sm font-bold text-[var(--text)] flex items-center gap-2 mb-3">
 {q.text}
 </label>
 <div className="border-[0.5px] border-[var(--border)] rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#222222] transition-all">
 <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg2)] border-b-[0.5px] border-[var(--border)]">
 {['B', 'I', 'U', 'Â¢', '1.'].map(tool => <button key={tool} className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[var(--text2)] hover:bg-[var(--card-bg)] rounded-md">{tool}</button>)}
 <div className="flex-grow"></div>
 <button className="p-1.5 hover:bg-[var(--card-bg)] rounded-md"><Globe className="w-3.5 h-3.5 text-[var(--text2)]" /></button>
 </div>
 <textarea rows={4} className="w-full px-4 py-3 text-sm focus:outline-none resize-none" placeholder="Write your answer..." value={formData.qa_data[q.id] || ''} onChange={(e) => handleChange('qa_data', { ...formData.qa_data, [q.id]: e.target.value })} />
 </div>
 </div>
 ))}
 {formData.custom_qa.map((qa: any, idx: number) => (
 <div key={idx} className="relative group">
 <div className="flex items-center justify-between mb-3">
 <input type="text" className="text-sm font-bold text-[var(--text)] bg-transparent border-none focus:outline-none w-full" placeholder="Custom Question Title" value={qa.question} onChange={(e) => {
 const newCustom = [...formData.custom_qa]; newCustom[idx].question = e.target.value; handleChange('custom_qa', newCustom);
 }} />
 <button onClick={() => handleChange('custom_qa', formData.custom_qa.filter((_: any, i: number) => i !== idx))} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
 </div>
 <div className="border-[0.5px] border-[var(--border)] rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#222222] transition-all">
 <textarea rows={4} className="w-full px-4 py-3 text-sm focus:outline-none resize-none" placeholder="Write your answer..." value={qa.answer} onChange={(e) => {
 const newCustom = [...formData.custom_qa]; newCustom[idx].answer = e.target.value; handleChange('custom_qa', newCustom);
 }} />
 </div>
 </div>
 ))}
 <button onClick={() => handleChange('custom_qa', [...formData.custom_qa, { question: '', answer: '' }])} className="w-full py-4 border-2 border-dashed border-[var(--border)] rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-[var(--text2)] hover:border-[#222222] hover:text-[var(--text)] transition-all"><Plus className="w-4 h-4" /> Add section</button>
 </div>
 </section>
 </div>
 )}
 
 <div className="mt-12 pb-12">
 <button onClick={handleSubmit} disabled={submitting} className="w-full py-5 bg-[var(--text)] text-[var(--bg)] rounded-2xl font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
 {submitting ? <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> Submitting...</> : <>Submit Pitch <ArrowRight className="w-5 h-5" /></>}
 </button>
 </div>
 </div>
 
 {/* Sector Modal */}
 {showSectorModal && <SectorModal formData={formData} toggleSector={toggleSector} onClose={() => setShowSectorModal(false)} />}
 
 {/* Team Member Drawer */}
 {showMemberDrawer && (
 <MemberDrawer 
 member={editingMember} 
 type={drawerType}
 onClose={() => setShowMemberDrawer(false)}
 onSave={(memberData: any) => {
 let newTeam = [...formData.team_data];
 if (editingMember) {
 newTeam = newTeam.map(m => m.id === editingMember.id ? { ...memberData, id: m.id, type: drawerType } : m);
 } else {
 newTeam.push({ ...memberData, id: Math.random().toString(36).substr(2, 9), type: drawerType });
 }
 handleChange('team_data', newTeam);
 setShowMemberDrawer(false);
 }}
 />
 )}
 </div>
 );
}
 
function SectorModal({ formData, toggleSector, onClose }: any) {
 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
 <div className="bg-[var(--card-bg)] rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
 <div className="px-8 py-6 border-b-[0.5px] border-[var(--border)] flex items-center justify-between">
 <div><h3 className="text-xl font-bold text-[var(--text)]">Select Sectors</h3><p className="text-xs text-[var(--text2)] font-bold uppercase tracking-wider mt-1">{formData.tags.length}/5 selected</p></div>
 <button onClick={onClose} className="p-2 hover:bg-[var(--bg)] rounded-full transition-colors"><X className="w-6 h-6" /></button>
 </div>
 <div className="flex-grow overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-3 gap-3">
 {SECTORS.map(sector => (
 <button key={sector} onClick={() => toggleSector(sector)} disabled={!formData.tags.includes(sector) && formData.tags.length >= 5} className={`flex items-center justify-between px-4 py-2.5 rounded-xl border-[0.5px] text-xs font-bold transition-all ${formData.tags.includes(sector) ? 'bg-[var(--text)] text-[var(--bg)] border-[#222222]' : 'bg-[var(--card-bg)] text-[var(--text)] border-[var(--border)] hover:border-[#222222] disabled:opacity-30'}`}>
 {sector} {formData.tags.includes(sector) && <CheckCircle2 className="w-3 h-3" />}
 </button>
 ))}
 </div>
 <div className="px-8 py-6 border-t-[0.5px] border-[var(--border)] flex justify-end"><button onClick={onClose} className="px-8 py-3 bg-[var(--text)] text-[var(--bg)] rounded-xl text-sm font-bold hover:bg-black transition-colors">Done</button></div>
 </div>
 </div>
 );
}
 
function MemberDrawer({ member, type, onClose, onSave }: any) {
 const [data, setData] = useState(member || { name: '', role: '', bio: '', linkedin: '', photo_url: '' });
 return (
 <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
 <div className="w-full max-w-md bg-[var(--card-bg)] h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto p-8">
 <div className="flex items-center justify-between mb-8">
 <h3 className="text-xl font-bold text-[var(--text)]">{member ? 'Edit' : 'Add'} {type === 'member' ? 'Team Member' : 'Advisor'}</h3>
 <button onClick={onClose} className="p-2 hover:bg-[var(--bg3)] rounded-full"><X className="w-6 h-6" /></button>
 </div>
 <div className="space-y-6">
 <div className="flex flex-col items-center mb-8">
 <div className="w-24 h-24 rounded-full bg-[var(--bg3)] border-[0.5px] border-[var(--border)] flex items-center justify-center overflow-hidden mb-2">
 {data.photo_url ? <img src={data.photo_url} className="w-full h-full object-cover" /> : <Users className="w-8 h-8 text-[var(--text2)]" />}
 </div>
 <button className="text-[10px] font-black uppercase tracking-widest text-[var(--text2)] hover:text-[var(--text)]">Upload photo</button>
 </div>
 <div><label className="block text-sm font-bold text-[var(--text)] mb-2">Full Name</label><input type="text" className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:ring-1 focus:ring-black outline-none" value={data.name} onChange={e => setData({...data, name: e.target.value})} /></div>
 <div><label className="block text-sm font-bold text-[var(--text)] mb-2">Role / Title</label><input type="text" className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:ring-1 focus:ring-black outline-none" value={data.role} onChange={e => setData({...data, role: e.target.value})} /></div>
 <div><label className="block text-sm font-bold text-[var(--text)] mb-2">LinkedIn URL</label><input type="url" className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:ring-1 focus:ring-black outline-none" value={data.linkedin} onChange={e => setData({...data, linkedin: e.target.value})} /></div>
 <div><label className="block text-sm font-bold text-[var(--text)] mb-2">Background</label><textarea rows={4} className="w-full px-4 py-3 rounded-xl border-[0.5px] border-[var(--border)] focus:ring-1 focus:ring-black outline-none resize-none" value={data.bio} onChange={e => setData({...data, bio: e.target.value})} /></div>
 <button onClick={() => onSave(data)} className="w-full py-4 bg-[var(--text)] text-[var(--bg)] rounded-xl font-bold hover:bg-black transition-all">Save {type === 'member' ? 'Member' : 'Advisor'}</button>
 </div>
 </div>
 </div>
 );
}
