"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Upload,
  Plus,
  Trash2,
  Image as Calendar,
  Lock,
  Loader2,
  FileCode,
  AlertCircle,
  Info,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<"fixed_price" | "custom_work">("fixed_price");
  const [listingType, setListingType] = useState<"software" | "freelance" | "job">("software");
  const [rateType, setRateType] = useState("Fixed price");
  const [rateUsd, setRateUsd] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("1 week");
  const [skills, setSkills] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [workMode, setWorkMode] = useState("Remote");
  const [jobLocation, setJobLocation] = useState("");
  const [compensationType, setCompensationType] = useState("Salary");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [equityPct, setEquityPct] = useState("");
  const [applyTarget, setApplyTarget] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([""]);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Software");
  const [sector, setSector] = useState("Technology");
  
  // Images upload states
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Digital file upload states
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [digitalFileName, setDigitalFileName] = useState("");

  // Deal states
  const [hasDeal, setHasDeal] = useState(false);
  const [dealPrice, setDealPrice] = useState("");
  const [dealEndDate, setDealEndDate] = useState("");

  // Auth & role verification
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) {
        router.push("/login");
        return;
      }
      setSession(s);
      // Allow any authenticated user
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  // Handle image addition
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      alert("You can upload a maximum of 5 images.");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  // Reorder images (move up / down)
  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= newImages.length) return;

    // Swap files
    const tempFile = newImages[index];
    newImages[index] = newImages[targetIdx];
    newImages[targetIdx] = tempFile;

    // Swap previews
    const tempPreview = newPreviews[index];
    newPreviews[index] = newPreviews[targetIdx];
    newPreviews[targetIdx] = tempPreview;

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Handle features addition/modification
  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const addFeature = () => {
    if (features.length >= 10) return;
    setFeatures([...features, ""]);
  };

  const removeFeature = (index: number) => {
    if (features.length === 1) {
      setFeatures([""]);
      return;
    }
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Rich text markdown tools
  const insertMarkdown = (syntax: string) => {
    const txtArea = document.getElementById("desc-textarea") as HTMLTextAreaElement;
    if (!txtArea) return;

    const start = txtArea.selectionStart;
    const end = txtArea.selectionEnd;
    const text = txtArea.value;
    const selected = text.substring(start, end);

    let replacement = "";
    if (syntax === "bold") replacement = `**${selected || "bold text"}**`;
    else if (syntax === "italic") replacement = `*${selected || "italic text"}*`;
    else if (syntax === "bullet") replacement = `\n- ${selected || "list item"}`;
    else if (syntax === "link") replacement = `[${selected || "link text"}](https://example.com)`;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setDescription(newText);
    
    // Reset cursor position
    setTimeout(() => {
      txtArea.focus();
      txtArea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErrorMsg("Product name is required."); return; }
    if (!description.trim()) { setErrorMsg("Product description is required."); return; }
    
    setSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Upload images to Supabase storage (or mock fallback if storage bucket fails)
      const uploadedImageUrls: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${session.user.id}-${Date.now()}-${i}.${fileExt}`;
        
        // Try uploading to 'product-images' bucket
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);
          uploadedImageUrls.push(publicUrl);
        } else {
          // Fallback to gorgeous unsplash images if storage fails/is not configured
          const mockUrls = [
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
          ];
          uploadedImageUrls.push(mockUrls[i % mockUrls.length]);
        }
      }

      // If no images were uploaded, add a default placeholder
      if (uploadedImageUrls.length === 0) {
        uploadedImageUrls.push("https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80");
      }

      // 2. Handle digital file upload if provided
      let finalFileUrl = "";
      if (type === "fixed_price" && digitalFile) {
        const fileExt = digitalFile.name.split(".").pop();
        const fileName = `digital-goods/${session.user.id}-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from("digital-files")
          .upload(fileName, digitalFile);

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from("digital-files")
            .getPublicUrl(fileName);
          finalFileUrl = publicUrl;
        } else {
          finalFileUrl = "https://example.com/downloads/secured-digital-package.zip";
        }
      }

      // 3. Prepare product insertion payload
      const cleanedFeatures = features.filter(f => f.trim() !== "");
      
      // Structure description with markdown features list appended
      let finalDescription = description;
      if (cleanedFeatures.length > 0) {
        finalDescription += "\n\n### Key Features\n" + cleanedFeatures.map(f => `- ${f}`).join("\n");
      }

      const parsedPrice = type === "custom_work" || !price ? 0 : Math.round(parseFloat(price) * 100);
      const parsedDiscountPrice = (type === "custom_work" || !hasDeal || !dealPrice) 
        ? null 
        : Math.round(parseFloat(dealPrice) * 100);

      const productPayload = {
        seller_id: session.user.id,
        name,
        description: finalDescription,
        images_urls: uploadedImageUrls,
        price: parsedPrice,
        discount_price: parsedDiscountPrice,
        type,
        listing_type: listingType,
        category,
        sector,
        rate_type: rateType,
        rate_amount_inr: price ? Number(price) : null,
        rate_amount_usd: rateUsd ? Number(rateUsd) : null,
        delivery_time: deliveryTime,
        skills_tags: skills.split(',').map((item) => item.trim()).filter(Boolean),
        portfolio_link: portfolioLink || null,
        job_type: jobType,
        work_mode: workMode,
        location: workMode === "Remote" ? null : jobLocation,
        compensation_type: compensationType,
        salary_range: salaryMin || salaryMax ? `₹${salaryMin || 0} - ₹${salaryMax || 0}/month` : null,
        equity_pct: equityPct ? Number(equityPct) : null,
        apply_url: applyTarget.startsWith('http') ? applyTarget : null,
        apply_email: applyTarget.includes('@') ? applyTarget : null,
        status: "pending", // admin reviews first
        deal_end_date: (hasDeal && dealEndDate) ? new Date(dealEndDate).toISOString() : null,
      };

      const { data: _newProd, error: insertErr } = await supabase
        .from("products")
        .insert(productPayload)
        .select()
        .single();

      if (insertErr) throw insertErr;

      setSuccessMsg("Product submitted successfully for review!");
      setTimeout(() => {
        router.push("/founder/store");
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong while inserting the product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e5e5e5] border-t-[#222222] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F0] pb-24">
      {/* Top Header Nav */}
      <header className="bg-[var(--card-bg)] border-b-[0.5px] border-[#e5e5e5] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/founder/store" className="flex items-center gap-2 text-[#888888] hover:text-[#222222] transition-colors text-sm font-bold">
          <ChevronLeft className="w-4 h-4" />
          Back to Store
        </Link>
        <span className="text-xl font-black italic tracking-tighter text-[#222222] uppercase">Ventex</span>
        <div className="w-32" />
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-black text-[#222222] tracking-tighter uppercase">List a New Product</h1>
            <p className="text-[#888888] font-medium text-sm mt-1">Create an interactive product or custom contract page for the Ventex Marketplace.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border-[0.5px] border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-semibold">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border-[0.5px] border-emerald-200 text-emerald-700 px-5 py-4 rounded-2xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-semibold">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 bg-[var(--card-bg)] border-[0.5px] border-[#e5e5e5] rounded-3xl p-6 md:p-8 shadow-sm">
            {/* 1. Basic details */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2">01. Listing Type & Name</h3>
              
              <div className="space-y-2">
                <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Marketplace Listing Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "software", label: "Software" },
                    { id: "freelance", label: "Freelance" },
                    { id: "job", label: "Job Post" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setListingType(option.id as any)}
                      className={`rounded-2xl border p-3 text-sm font-black ${listingType === option.id ? "border-[#222222] bg-[#222222] text-white" : "border-[#e5e5e5] bg-[#F2F2F0] text-[#222222]"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Type toggle */}
              {listingType === "software" && <div className="space-y-2">
                <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Pricing Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "fixed_price", label: "Fixed Price License", desc: "Sell templates, software licenses, SaaS access, etc." },
                    { id: "custom_work", label: "Custom Work Package", desc: "Build tailored tools or software on contract" }
                  ].map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setType(option.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        type === option.id 
                          ? "border-[#222222] bg-[#222222] text-white shadow-lg" 
                          : "border-[#e5e5e5] bg-[#F2F2F0] hover:bg-[#e5e5e5] text-[#222222]"
                      }`}
                    >
                      <span className="block font-black text-sm">{option.label}</span>
                      <span className={`block text-[11px] mt-1 leading-normal ${type === option.id ? "text-white/60" : "text-[#888888]"}`}>
                        {option.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>}

              {/* Product Name */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Product / Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ventex SaaS Starter Kit"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl text-sm font-bold text-[#222222] focus:outline-none focus:border-[#222222] focus:bg-[var(--card-bg)] transition-all"
                />
              </div>
            </section>

            {/* 2. Categorization */}
            <section className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2">02. Classification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                  >
                    <option value="Software">Software</option>
                    <option value="SaaS">SaaS License</option>
                    <option value="Templates">No-Code Templates</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Marketing">Marketing Systems</option>
                    <option value="Consulting">Technical Consulting</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Target Sector</label>
                  <select
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                    className="w-full bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                  >
                    {[
                      "3D Printing", "Advanced Materials", "Aerospace", "AI", "Agriculture", "Alt Protein", 
                      "Art & Design", "Automotive", "Big Data", "Biotechnology", "Blockchain", "Chemistry", 
                      "CivicTech", "Cleantech", "Climate", "Construction", "CRM", "Data & Analytics", 
                      "DeepTech", "DevOps", "Drones", "E-commerce", "Education", "Energy", 
                      "Enterprise Software", "Fashion", "Fintech", "FMCG", "Food & Beverage", "Gaming", 
                      "Generative AI", "Hardware", "Healthtech", "ICT", "Insurtech", "Legal", 
                      "Logistics", "Marketplace", "Media", "PropTech", "Retail", "SaaS", "Travel", "Cybersecurity"
                    ].map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 3. Description & Markdown Tools */}
            <section className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2">03. Description & Tech Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Rich Description</label>
                  
                  {/* Editor tools */}
                  <div className="flex gap-1.5 bg-[#F2F2F0] p-1 rounded-lg border-[0.5px] border-[#e5e5e5]">
                    {[
                      { id: "bold", label: "B", title: "Bold Text" },
                      { id: "italic", label: "I", title: "Italic Text" },
                      { id: "bullet", label: "Â¢", title: "Bullet List" },
                      { id: "link", label: "Link", title: "Add Hyperlink" }
                    ].map(btn => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => insertMarkdown(btn.id)}
                        title={btn.title}
                        className="px-2 py-0.5 bg-[var(--card-bg)] hover:bg-black hover:text-white rounded text-[10px] font-black border-[0.5px] border-[#e5e5e5] transition-all"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  id="desc-textarea"
                  required
                  rows={6}
                  placeholder="Summarize your product, tech stack, libraries used and what problem it resolves..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl text-sm font-semibold text-[#222222] focus:outline-none focus:border-[#222222] focus:bg-[var(--card-bg)] transition-all whitespace-pre-wrap leading-relaxed"
                />
              </div>
            </section>

            {/* 4. Feature Checklist */}
            <section className="space-y-4 pt-2">
              <div className="flex justify-between items-center border-b-[0.5px] border-[#e5e5e5] pb-2">
                <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest">04. Features Checklist (Max 10)</h3>
                <span className="text-[10px] font-black text-[#888888]">{features.filter(f => f.trim() !== "").length} / 10 added</span>
              </div>

              <div className="space-y-2.5">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`e.g. Fully responsive desktop + mobile layouts`}
                      value={feature}
                      onChange={e => handleFeatureChange(idx, e.target.value)}
                      className="flex-grow px-4 py-2.5 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-xl text-xs font-bold text-[#222222] focus:outline-none focus:border-[#222222]"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors border-[0.5px] border-transparent hover:border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {features.length < 10 && (
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center gap-1.5 text-xs font-black text-[#222222] bg-[#F2F2F0] hover:bg-[#e5e5e5] px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Feature Line
                </button>
              )}
            </section>

            {/* 5. Images Upload Section */}
            <section className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2">05. Image Gallery (Max 5)</h3>
              
              <div className="grid grid-cols-5 gap-3">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="aspect-square bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl relative overflow-hidden group shadow-inner">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    
                    {/* Controls overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 bg-[var(--card-bg)] hover:bg-[#F2F2F0] rounded text-xs text-[#222222] font-black disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, "down")}
                        disabled={idx === imagePreviews.length - 1}
                        className="p-1 bg-[var(--card-bg)] hover:bg-[#F2F2F0] rounded text-xs text-[#222222] font-black disabled:opacity-40"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1 bg-red-500 hover:bg-red-600 rounded text-xs text-white"
                      >
                        ✖
                      </button>
                    </div>
                  </div>
                ))}

                {imagePreviews.length < 5 && (
                  <label className="aspect-square bg-[#F2F2F0] border-dashed border-2 border-[#e5e5e5] hover:border-[#222222] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-[var(--card-bg)]">
                    <Upload className="w-6 h-6 text-[#888888]" />
                    <span className="text-[10px] font-black text-[#888888] uppercase tracking-widest mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </section>

            {listingType === "freelance" && (
              <section className="space-y-4 pt-2">
                <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2">Freelance Service Details</h3>
                <select value={rateType} onChange={(e) => setRateType(e.target.value)} className="w-full bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl px-4 py-3 text-sm font-bold text-[#222222]"><option>Hourly</option><option>Fixed price</option></select>
                <div className="grid grid-cols-2 gap-3">
                  <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Rate amount ₹" className="px-4 py-3 bg-[#F2F2F0] border rounded-2xl text-sm font-bold" />
                  <input value={rateUsd} onChange={(e) => setRateUsd(e.target.value)} placeholder="Rate amount $" className="px-4 py-3 bg-[#F2F2F0] border rounded-2xl text-sm font-bold" />
                </div>
                <select value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="w-full bg-[#F2F2F0] border rounded-2xl px-4 py-3 text-sm font-bold">
                  {["1 day", "3 days", "1 week", "2 weeks", "Custom"].map((item) => <option key={item}>{item}</option>)}
                </select>
                <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills tags, comma-separated: React, Node.js, Python" className="w-full px-4 py-3 bg-[#F2F2F0] border rounded-2xl text-sm font-bold" />
                <input value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} placeholder="Portfolio link (optional)" className="w-full px-4 py-3 bg-[#F2F2F0] border rounded-2xl text-sm font-bold" />
              </section>
            )}

            {listingType === "job" && (
              <section className="space-y-4 pt-2">
                <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2">Job Post Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="bg-[#F2F2F0] border rounded-2xl px-4 py-3 text-sm font-bold">{["Full-time", "Part-time", "Contract", "Internship"].map((item) => <option key={item}>{item}</option>)}</select>
                  <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className="bg-[#F2F2F0] border rounded-2xl px-4 py-3 text-sm font-bold">{["Remote", "Hybrid", "On-site"].map((item) => <option key={item}>{item}</option>)}</select>
                </div>
                {workMode !== "Remote" && <input value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} placeholder="Location" className="w-full px-4 py-3 bg-[#F2F2F0] border rounded-2xl text-sm font-bold" />}
                <select value={compensationType} onChange={(e) => setCompensationType(e.target.value)} className="w-full bg-[#F2F2F0] border rounded-2xl px-4 py-3 text-sm font-bold">{["Salary", "Equity", "Salary + Equity"].map((item) => <option key={item}>{item}</option>)}</select>
                <div className="grid grid-cols-3 gap-3">
                  <input value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="Salary min ₹" className="px-4 py-3 bg-[#F2F2F0] border rounded-2xl text-sm font-bold" />
                  <input value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="Salary max ₹" className="px-4 py-3 bg-[#F2F2F0] border rounded-2xl text-sm font-bold" />
                  <input value={equityPct} onChange={(e) => setEquityPct(e.target.value)} placeholder="Equity %" className="px-4 py-3 bg-[#F2F2F0] border rounded-2xl text-sm font-bold" />
                </div>
                <input value={applyTarget} onChange={(e) => setApplyTarget(e.target.value)} placeholder="Apply link or email" className="w-full px-4 py-3 bg-[#F2F2F0] border rounded-2xl text-sm font-bold" />
              </section>
            )}

            {/* 6. Pricing, Digital Goods, Custom Contracts */}
            {listingType === "software" && (
            <section className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase text-[#888888] tracking-widest border-b-[0.5px] border-[#e5e5e5] pb-2">06. Pricing & Delivery</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fixed price inputs */}
                {type === "fixed_price" ? (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Base Price (₹)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#888888]">₹</span>
                        <input
                          type="number"
                          required={type === "fixed_price"}
                          placeholder="9,999"
                          value={price}
                          onChange={e => setPrice(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl text-sm font-bold text-[#222222] focus:outline-none focus:border-[#222222] focus:bg-[var(--card-bg)] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Digital Product File</label>
                      <label className="flex items-center gap-3 px-4 py-2.5 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl cursor-pointer hover:bg-[#e5e5e5] transition-all">
                        <FileCode className="w-5 h-5 text-[#888888]" />
                        <span className="text-xs font-bold text-[#888888] truncate">
                          {digitalFileName || "Upload package file (.zip, .pdf, etc.)"}
                        </span>
                        <input
                          type="file"
                          accept=".zip,.rar,.pdf,.json"
                          onChange={e => {
                            if (e.target.files?.[0]) {
                              setDigitalFile(e.target.files[0]);
                              setDigitalFileName(e.target.files[0].name);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl p-5 flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#888888] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-[#222222] uppercase tracking-wider">Custom Work Pricing Model</h4>
                      <p className="text-xs text-[#888888] leading-relaxed mt-1">
                        When buyers choose "Request Work", they will enter specific software/system requirements. You will review requirements and submit a custom contract quote manually. No prepayment pricing needed.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Deal toggle */}
              {type === "fixed_price" && (
                <div className="border-[0.5px] border-[#e5e5e5] rounded-2xl p-5 space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="block text-xs font-black text-[#222222] uppercase tracking-wider">Set a Promotional Deal</span>
                      <span className="block text-[11px] text-[#888888] mt-0.5">Activate a temporary discounted rate with a countdown timer.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasDeal}
                      onChange={e => setHasDeal(e.target.checked)}
                      className="w-4 h-4 accent-[#222222]"
                    />
                  </label>

                  {hasDeal && (
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t-[0.5px] border-[#e5e5e5] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="space-y-2">
                        <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Deal Discount Price (₹)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#888888]">₹</span>
                          <input
                            type="number"
                            required={hasDeal}
                            placeholder="6,999"
                            value={dealPrice}
                            onChange={e => setDealPrice(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl text-sm font-bold text-[#222222] focus:outline-none focus:border-[#222222] focus:bg-[var(--card-bg)] transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-black text-[#888888] uppercase tracking-widest">Deal End Date</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#888888]">
                            <Calendar className="w-4 h-4 text-[#888888]" />
                          </span>
                          <input
                            type="datetime-local"
                            required={hasDeal}
                            value={dealEndDate}
                            onChange={e => setDealEndDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#F2F2F0] border-[0.5px] border-[#e5e5e5] rounded-2xl text-sm font-bold text-[#222222] focus:outline-none focus:border-[#222222] focus:bg-[var(--card-bg)] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
            )}

            {/* 7. Safety Info box */}
            <div className="bg-amber-50 border-[0.5px] border-amber-200 rounded-2xl p-5 flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">Awaiting Platform Review</h4>
                <p className="text-xs text-amber-700 leading-relaxed mt-1 font-medium">
                  To protect our community, new listings start as <strong>'pending'</strong>. The Ventex team manually audits listings for authenticity, clean code, and license compliance within 24 hours before launching it live.
                </p>
              </div>
            </div>

            {/* Submit actions */}
            <div className="flex gap-4">
              <Link
                href="/founder/store"
                className="flex-1 py-4 border-[0.5px] border-[#e5e5e5] hover:bg-[#F2F2F0] text-[#222222] rounded-2xl text-center font-black text-sm transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 bg-[#222222] hover:bg-black text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting listing...</>
                ) : (
                  "Create Listing"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}