"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
 ArrowLeft,
 CheckCircle,
 XCircle,
 Loader2,
 Building2,
 Globe,
 MapPin,
 Users as UsersIcon,
 HelpCircle,
 FileText
} from "lucide-react";
import Link from "next/link";

interface Pitch {
 id: string;
 title: string;
 tagline: string;
 logo_url: string;
 website_url: string;
 short_description: string;
 problem: string;
 solution: string;
 unique_insight: string;
 tam: number;
 sam: number;
 som: number;
 target_customer: string;
 geography_focus: string;
 market_trend: string;
 competitors: string;
 competitive_advantages: string;
 moat: string;
 revenue_model: string;
 revenue_streams: string;
 pricing: string;
 cac: string;
 ltv: string;
 mrr: number;
 arr: number;
 users_count: number;
 mom_growth: string;
 milestones: string;
 notable_customers: string;
 pitch_deck_url: string;
 demo_video_url: string;
 round_type: string;
 security_type: string;
 amount_seeking: number;
 equity_pct: number;
 already_committed: number;
 committed_investors: string;
 use_of_funds: string;
 industry: string;
 secondary_industry: string;
 custom_industry: string;
 company_stage: string;
 business_type: string;
 product_type: string;
 employees_count: number;
 annual_revenue: number;
 linkedin_url: string;
 x_url: string;
 video_url: string;
 founding_year: number;
 country: string;
 city: string;
 status: string;
 qa_data: Record<string, string>;
 team_data: any[];
 founder_id: string;
 users: {
 full_name: string;
 email: string;
 } | null;
}

export default function PitchReviewDetails() {
 const { id } = useParams();
 const router = useRouter();
 
 const [pitch, setPitch] = useState<Pitch | null>(null);
 const [loading, setLoading] = useState(true);
 const [actionLoading, setActionLoading] = useState(false);
 const [showRejectForm, setShowRejectForm] = useState(false);
 const [rejectionReason, setRejectionReason] = useState("");

 const fetchPitchDetails = useCallback(async () => {
 try {
 setLoading(true);
 const { data, error } = await supabase
 .from("pitches")
 .select(`
 *,
 users:founder_id (
 full_name,
 email
 )
 `)
 .eq("id", id)
 .single();

 if (error) {
 console.error("Error loading pitch:", error);
 router.push("/admin/pitches");
 } else {
 setPitch(data);
 }
 } catch (err) {
 console.error("Error in fetchPitchDetails:", err);
 } finally {
 setLoading(false);
 }
 }, [id, router]);

 useEffect(() => {
 if (id) {
 fetchPitchDetails();
 }
 }, [id, fetchPitchDetails]);

 const handleApprove = async () => {
 if (!pitch) return;
 try {
 setActionLoading(true);

 // 1. Update pitch status to 'live'
 const { error: updateError } = await supabase
 .from("pitches")
 .update({ status: "live" })
 .eq("id", pitch.id);

 if (updateError) throw updateError;

 // 2. Trigger AI Summary API (it handles generating summary & emailing the founder)
 const { data: { session } } = await supabase.auth.getSession();
 const res = await fetch("/api/generate-summary", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
 },
 body: JSON.stringify({
 pitchId: pitch.id,
 title: pitch.title,
 tagline: pitch.tagline,
 problem: pitch.problem,
 solution: pitch.solution,
 unique_insight: pitch.unique_insight,
 tam: pitch.tam,
 country: pitch.country,
 stage: pitch.company_stage,
 milestones: pitch.milestones,
 mrr: pitch.mrr
 })
 });

 if (!res.ok) {
 console.warn("Failed to generate AI summary, but pitch is set to live.");
 }

 alert("Pitch successfully approved and published live!");
 router.push("/admin/pitches");
 } catch (err: any) {
 console.error("Approval error:", err);
 alert(`Error approving pitch: ${err.message}`);
 } finally {
 setActionLoading(false);
 }
 };

 const handleReject = async () => {
 if (!pitch || !rejectionReason.trim()) return;
 try {
 setActionLoading(true);

 // 1. Update status to 'rejected'
 const { error: updateError } = await supabase
 .from("pitches")
 .update({ status: "rejected" })
 .eq("id", pitch.id);

 if (updateError) throw updateError;

 // 2. Trigger email notify via /api/emails
 if (pitch.users?.email) {
 const { data: { session } } = await supabase.auth.getSession();
 const emailRes = await fetch("/api/emails", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
 },
 body: JSON.stringify({
 type: "pitch_rejected",
 recipientEmail: pitch.users.email,
 data: {
 pitchName: pitch.title || "Your Pitch",
 reason: rejectionReason
 }
 })
 });

 if (!emailRes.ok) {
 console.warn("Failed to send rejection email notification.");
 }
 }

 alert("Pitch successfully rejected. Founder has been notified.");
 router.push("/admin/pitches");
 } catch (err: any) {
 console.error("Rejection error:", err);
 alert(`Error rejecting pitch: ${err.message}`);
 } finally {
 setActionLoading(false);
 }
 };

 if (loading) {
 return (
 <div className="h-96 flex items-center justify-center">
 <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
 </div>
 );
 }

 if (!pitch) return null;

 return (
 <div className="space-y-8">
 {/* Top Navigation Row */}
 <div className="flex items-center justify-between">
 <Link
 href="/admin/pitches"
 className="inline-flex items-center gap-2 text-[var(--text2)] hover:text-[var(--text)] transition-colors text-sm font-semibold"
 >
 <ArrowLeft size={16} /> Back to Pitches Queue
 </Link>
 <span className="text-xs text-[var(--text3)] font-mono">ID: {pitch.id}</span>
 </div>

 {/* Profile Header Header */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
 <div className="flex items-center gap-4">
 <div className="h-16 w-16 rounded-[24px] bg-[var(--bg2)] border border-[0.5px] border-[var(--border)] flex items-center justify-center text-[var(--text2)] font-bold overflow-hidden">
 {pitch.logo_url ? (
 <img src={pitch.logo_url} alt={pitch.title} className="h-full w-full object-cover" />
 ) : (
 <Building2 size={28} />
 )}
 </div>
 <div>
 <div className="flex items-center gap-3">
 <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">{pitch.title}</h2>
 <span className="text-[10px] font-mono font-bold tracking-wider uppercase bg-violet-600/10 text-violet-400 px-2 py-0.5 rounded border border-violet-500/20">
 {pitch.company_stage}
 </span>
 </div>
 <p className="text-sm text-[var(--text2)] mt-1">{pitch.tagline}</p>
 <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-[var(--text3)]">
 {pitch.industry && (
 <span className="flex items-center gap-1">
 <span className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
 {pitch.industry}
 </span>
 )}
 {pitch.country && (
 <span className="flex items-center gap-1">
 <MapPin size={12} />
 {pitch.city ? `${pitch.city}, ` : ""}{pitch.country}
 </span>
 )}
 {pitch.website_url && (
 <a
 href={pitch.website_url}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1 text-violet-400 hover:underline"
 >
 <Globe size={12} /> {pitch.website_url}
 </a>
 )}
 </div>
 </div>
 </div>

 {/* Audit Status Controls */}
 <div className="flex items-center gap-3 w-full md:w-auto">
 {pitch.status === "pending" && (
 <>
 <button
 onClick={() => setShowRejectForm(true)}
 disabled={actionLoading}
 className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 text-xs font-bold text-red-400 rounded-[24px] transition-all"
 >
 <XCircle size={15} /> Reject
 </button>
 <button
 onClick={handleApprove}
 disabled={actionLoading}
 className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-[var(--text)] rounded-[24px] transition-all disabled:opacity-50"
 >
 {actionLoading ? (
 <Loader2 size={15} className="animate-spin" />
 ) : (
 <CheckCircle size={15} />
 )}
 Approve & Publish
 </button>
 </>
 )}
 {pitch.status !== "pending" && (
 <div className="flex items-center gap-3">
 <div className="px-4 py-2 border border-[0.5px] border-[var(--border)] bg-[var(--bg2)]/30 rounded-[24px]">
 <span className="text-xs text-[var(--text2)]">Current Status: </span>
 <span className={`text-xs font-bold uppercase tracking-wider ${
 pitch.status === "live" ? "text-emerald-400" : pitch.status === "rejected" ? "text-red-400" : "text-[var(--text)]"
 }`}>
 {pitch.status}
 </span>
 </div>
 <button
 onClick={async () => {
 if (!confirm("Reset this pitch to pending review?")) return;
 setActionLoading(true);
 const { error } = await supabase.from("pitches").update({ status: "pending" }).eq("id", pitch.id);
 if (error) { alert(`Error: ${error.message}`); } else { setPitch({ ...pitch, status: "pending" }); }
 setActionLoading(false);
 }}
 disabled={actionLoading}
 className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[var(--bg2)] hover:bg-[var(--bg2)] border border-[0.5px] border-[var(--border)] text-xs font-bold text-[var(--text2)] rounded-[24px] transition-all"
 >
 Reset to Pending
 </button>
 </div>
 )}
 </div>
 </div>

 {/* Reject Reason Form Overlay / Panel */}
 {showRejectForm && (
 <div className="bg-[#1A1012] border border-red-950/50 rounded-[24px] p-5 space-y-4">
 <div>
 <h3 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
 <XCircle size={16} /> Provide Reason for Rejection
 </h3>
 <p className="text-xs text-[var(--text2)] mt-1">
 Explain why this pitch doesn't meet publishing guidelines. The founder will receive this feedback via email.
 </p>
 </div>
 <textarea
 value={rejectionReason}
 onChange={(e) => setRejectionReason(e.target.value)}
 placeholder="e.g. Please fill out the financial section with actual metrics, and upload a valid pitch deck PDF."
 rows={4}
 className="w-full p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] text-xs text-[var(--text)] placeholder-[#888888] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
 />
 <div className="flex justify-end gap-3">
 <button
 onClick={() => {
 setShowRejectForm(false);
 setRejectionReason("");
 }}
 disabled={actionLoading}
 className="px-3.5 py-1.5 bg-[var(--bg2)] border border-[0.5px] border-[var(--border)] text-xs font-bold text-[var(--text2)] rounded-lg hover:bg-[var(--bg2)] transition-colors"
 >
 Cancel
 </button>
 <button
 onClick={handleReject}
 disabled={actionLoading || !rejectionReason.trim()}
 className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-xs font-bold text-[var(--text)] rounded-lg transition-colors disabled:opacity-50"
 >
 Confirm Rejection
 </button>
 </div>
 </div>
 )}

 {/* Main Grid Content */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Left Column: Core Description & Q&A */}
 <div className="lg:col-span-2 space-y-6">
 {/* Deck & Video Attachments */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6 space-y-4">
 <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider font-mono">Attachments</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-4 rounded-[24px] bg-[var(--bg)] border border-[0.5px] border-[var(--border)] flex justify-between items-center">
 <div className="flex items-center gap-3">
 <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
 <FileText size={18} />
 </div>
 <div>
 <p className="text-xs font-bold text-[var(--text)]">Pitch Deck PDF</p>
 <p className="text-[10px] text-[var(--text3)]">Startup presentation deck</p>
 </div>
 </div>
 {pitch.pitch_deck_url ? (
 <a
 href={pitch.pitch_deck_url}
 target="_blank"
 rel="noopener noreferrer"
 className="text-xs font-semibold text-violet-400 hover:underline"
 >
 View File
 </a>
 ) : (
 <span className="text-xs text-[var(--text3)]">Not Uploaded</span>
 )}
 </div>

 <div className="p-4 rounded-[24px] bg-[var(--bg)] border border-[0.5px] border-[var(--border)] flex justify-between items-center">
 <div className="flex items-center gap-3">
 <div className="h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
 <Globe size={18} />
 </div>
 <div>
 <p className="text-xs font-bold text-[var(--text)]">Demo Video</p>
 <p className="text-[10px] text-[var(--text3)]">Product walkthrough or pitch</p>
 </div>
 </div>
 {pitch.demo_video_url || pitch.video_url ? (
 <a
 href={pitch.demo_video_url || pitch.video_url}
 target="_blank"
 rel="noopener noreferrer"
 className="text-xs font-semibold text-violet-400 hover:underline"
 >
 Watch Video
 </a>
 ) : (
 <span className="text-xs text-[var(--text3)]">Not Provided</span>
 )}
 </div>
 </div>
 </div>

 {/* Details Sections */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6 space-y-6">
 <div>
 <h4 className="text-xs font-bold text-[var(--text2)] uppercase tracking-wider font-mono mb-2">Short Description</h4>
 <p className="text-sm text-[var(--text)] leading-relaxed bg-[var(--bg)]/40 p-4 border border-[0.5px] border-[var(--border)] rounded-[24px]">
 {pitch.short_description || "No short description provided."}
 </p>
 </div>

 <div>
 <h4 className="text-xs font-bold text-[var(--text2)] uppercase tracking-wider font-mono mb-2">Problem</h4>
 <p className="text-sm text-[var(--text)] leading-relaxed bg-[var(--bg)]/40 p-4 border border-[0.5px] border-[var(--border)] rounded-[24px]">
 {pitch.problem || "No problem statement provided."}
 </p>
 </div>

 <div>
 <h4 className="text-xs font-bold text-[var(--text2)] uppercase tracking-wider font-mono mb-2">Solution</h4>
 <p className="text-sm text-[var(--text)] leading-relaxed bg-[var(--bg)]/40 p-4 border border-[0.5px] border-[var(--border)] rounded-[24px]">
 {pitch.solution || "No solution statement provided."}
 </p>
 </div>

 <div>
 <h4 className="text-xs font-bold text-[var(--text2)] uppercase tracking-wider font-mono mb-2">Unique Insight</h4>
 <p className="text-sm text-[var(--text)] leading-relaxed bg-[var(--bg)]/40 p-4 border border-[0.5px] border-[var(--border)] rounded-[24px]">
 {pitch.unique_insight || "No unique insight statement provided."}
 </p>
 </div>
 </div>

 {/* Q&A Data */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6 space-y-4">
 <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider font-mono">Pitch Q&A</h3>
 {pitch.qa_data && Object.keys(pitch.qa_data).length > 0 ? (
 <div className="space-y-4">
 {Object.entries(pitch.qa_data).map(([q, a]) => (
 <div key={q} className="p-4 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] space-y-2">
 <p className="text-xs font-bold text-[var(--text)] flex items-start gap-1.5">
 <HelpCircle size={14} className="text-violet-400 shrink-0 mt-0.5" />
 {q}
 </p>
 <p className="text-xs text-[var(--text2)] leading-relaxed pl-5">{a}</p>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-[var(--text3)] italic">No Q&A responses filled out.</p>
 )}
 </div>

 {/* Team Members */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6 space-y-4">
 <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider font-mono">Founding Team</h3>
 {pitch.team_data && pitch.team_data.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {pitch.team_data.map((member: any, i: number) => (
 <div key={i} className="p-4 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] flex items-start gap-3">
 <div className="h-10 w-10 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
 {member.avatar_url ? (
 <img src={member.avatar_url} alt={member.name} className="h-full w-full rounded-full object-cover" />
 ) : (
 <UsersIcon size={18} />
 )}
 </div>
 <div>
 <h4 className="text-xs font-bold text-[var(--text)]">{member.name || "Unnamed"}</h4>
 <p className="text-[10px] text-violet-400 font-mono mt-0.5">{member.role || "N/A"}</p>
 <p className="text-[11px] text-[var(--text2)] mt-2 line-clamp-3 leading-relaxed">{member.bio || "No biography details."}</p>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-[var(--text3)] italic">No team details added.</p>
 )}
 </div>
 </div>

 {/* Right Column: Key Details & Financial Metrics */}
 <div className="space-y-6">
 {/* Founder Profile Details */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6 space-y-4">
 <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider font-mono">Founder Profile</h3>
 {pitch.users ? (
 <div className="space-y-3">
 <div className="p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px]">
 <p className="text-[10px] text-[var(--text3)] font-mono uppercase font-bold tracking-wider">Full Name</p>
 <p className="text-sm font-bold text-[var(--text)] mt-0.5">{pitch.users.full_name || "Unknown Founder"}</p>
 </div>
 <div className="p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px]">
 <p className="text-[10px] text-[var(--text3)] font-mono uppercase font-bold tracking-wider">Email Address</p>
 <p className="text-xs text-violet-400 font-semibold mt-0.5">{pitch.users.email}</p>
 </div>
 </div>
 ) : (
 <p className="text-xs text-[var(--text3)] italic">No associated founder profile found.</p>
 )}
 </div>

 {/* Funding Details */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6 space-y-4">
 <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider font-mono">Funding Details</h3>
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px]">
 <p className="text-[10px] text-[var(--text3)] font-mono uppercase">Seeking</p>
 <p className="text-sm font-bold text-[var(--text)] mt-0.5">
 {pitch.amount_seeking ? `$${Number(pitch.amount_seeking).toLocaleString()}` : "N/A"}
 </p>
 </div>
 <div className="p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px]">
 <p className="text-[10px] text-[var(--text3)] font-mono uppercase">Equity</p>
 <p className="text-sm font-bold text-[var(--text)] mt-0.5">
 {pitch.equity_pct ? `${pitch.equity_pct}%` : "N/A"}
 </p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px]">
 <p className="text-[10px] text-[var(--text3)] font-mono uppercase font-bold text-amber-500">Committed</p>
 <p className="text-sm font-bold text-amber-500 mt-0.5">
 {pitch.already_committed ? `$${Number(pitch.already_committed).toLocaleString()}` : "$0"}
 </p>
 </div>
 <div className="p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px]">
 <p className="text-[10px] text-[var(--text3)] font-mono uppercase">Round Type</p>
 <p className="text-sm font-bold text-[var(--text)] mt-0.5 capitalize">{pitch.round_type || "N/A"}</p>
 </div>
 </div>

 <div className="p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px]">
 <p className="text-[10px] text-[var(--text3)] font-mono uppercase">Use of Funds</p>
 <p className="text-xs text-[var(--text2)] mt-1 leading-relaxed">{pitch.use_of_funds || "N/A"}</p>
 </div>

 <div className="p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px]">
 <p className="text-[10px] text-[var(--text3)] font-mono uppercase">Committed Investors</p>
 <p className="text-xs text-[var(--text2)] mt-1 leading-relaxed">{pitch.committed_investors || "N/A"}</p>
 </div>
 </div>
 </div>

 {/* Financial Performance */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6 space-y-4">
 <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider font-mono">Financial Metrics</h3>
 <div className="space-y-3">
 <div className="flex justify-between items-center p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] text-xs">
 <span className="text-[var(--text2)]">MRR</span>
 <span className="font-bold text-[var(--text)] font-mono">{pitch.mrr ? `$${Number(pitch.mrr).toLocaleString()}` : "$0"}</span>
 </div>
 <div className="flex justify-between items-center p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] text-xs">
 <span className="text-[var(--text2)]">ARR</span>
 <span className="font-bold text-[var(--text)] font-mono">{pitch.arr ? `$${Number(pitch.arr).toLocaleString()}` : "$0"}</span>
 </div>
 <div className="flex justify-between items-center p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] text-xs">
 <span className="text-[var(--text2)]">MoM Growth Rate</span>
 <span className="font-bold text-[var(--text)] font-mono">{pitch.mom_growth || "0%"}</span>
 </div>
 <div className="flex justify-between items-center p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] text-xs">
 <span className="text-[var(--text2)]">LTV / CAC Ratio</span>
 <span className="font-bold text-[var(--text)] font-mono">
 {pitch.ltv || "â€”"} / {pitch.cac || "â€”"}
 </span>
 </div>
 <div className="flex justify-between items-center p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] text-xs">
 <span className="text-[var(--text2)]">Active Users</span>
 <span className="font-bold text-[var(--text)] font-mono">{pitch.users_count ? Number(pitch.users_count).toLocaleString() : "0"}</span>
 </div>
 </div>
 </div>

 {/* Market Focus */}
 <div className="bg-[var(--card-bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] p-6 space-y-4">
 <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider font-mono">Market TAM / SAM / SOM</h3>
 <div className="space-y-3">
 <div className="flex justify-between items-center p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] text-xs">
 <span className="text-[var(--text2)]">TAM (Total Addressable)</span>
 <span className="font-bold text-[var(--text)] font-mono">{pitch.tam ? `$${Number(pitch.tam).toLocaleString()}` : "N/A"}</span>
 </div>
 <div className="flex justify-between items-center p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] text-xs">
 <span className="text-[var(--text2)]">SAM (Serviceable Addressable)</span>
 <span className="font-bold text-[var(--text)] font-mono">{pitch.sam ? `$${Number(pitch.sam).toLocaleString()}` : "N/A"}</span>
 </div>
 <div className="flex justify-between items-center p-3 bg-[var(--bg)] border border-[0.5px] border-[var(--border)] rounded-[24px] text-xs">
 <span className="text-[var(--text2)]">SOM (Serviceable Obtainable)</span>
 <span className="font-bold text-[var(--text)] font-mono">{pitch.som ? `$${Number(pitch.som).toLocaleString()}` : "N/A"}</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
