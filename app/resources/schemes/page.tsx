"use client";

import { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronDown, Check, Bookmark, BookmarkCheck,
  Building2, MapPin, DollarSign, Clock, CheckCircle2, ArrowRight,
  Info, ExternalLink, Activity, Scale, Award
} from 'lucide-react';
import Link from 'next/link';

const STAGES = ['Ideation', 'Validation', 'Early Traction', 'Scaling'];
const INDUSTRIES = ['SaaS', 'FinTech', 'HealthTech', 'EdTech', 'DeepTech', 'E-commerce', 'Hardware', 'AgriTech', 'Other'];
const STATES = ['Maharashtra', 'Karnataka', 'Delhi', 'Gujarat', 'Tamil Nadu', 'Telangana', 'Other'];

export default function DPIITSchemeHelper() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ 
    stage: '', industry: '', state: '', fundingReq: '', 
    age: '', dpiitStatus: 'Not Applied', businessType: '' 
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [savedSchemes, setSavedSchemes] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);

  // Load saved from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ventex_saved_schemes');
    if (saved) setSavedSchemes(JSON.parse(saved));
  }, []);

  const toggleSave = (id: string) => {
    const newSaved = savedSchemes.includes(id) 
      ? savedSchemes.filter(s => s !== id)
      : [...savedSchemes, id];
    setSavedSchemes(newSaved);
    localStorage.setItem('ventex_saved_schemes', JSON.stringify(newSaved));
  };

  const toggleCompare = (id: string) => {
    if (compareList.includes(id)) {
      setCompareList(prev => prev.filter(c => c !== id));
    } else if (compareList.length < 3) {
      setCompareList(prev => [...prev, id]);
    }
  };

  const submitAnalysis = async () => {
    setLoading(true);
    // Analysis is currently unavailable
    await new Promise(r => setTimeout(r, 800));
    setResults([]);
    setLoading(false);
    setStep(3);
  };
  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg2)] pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-indigo-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[var(--text)]">
              DPIIT Scheme Helper
            </h1>
          </div>
          <p className="text-lg text-[var(--text2)] max-w-2xl">
            Navigate the complex landscape of Indian government startup schemes. Discover grants, tax benefits, and loans tailored to your startup's exact profile.
          </p>
          
          {results && (
            <div className="mt-8 flex gap-4">
              <button onClick={() => setStep(1)} className="text-sm font-bold text-[var(--text)] bg-[var(--card-bg)] border border-[var(--border)] px-4 py-2 rounded-lg hover:bg-[var(--bg)] transition-colors">
                Edit Profile
              </button>
              <button 
                onClick={() => setCompareMode(!compareMode)} 
                className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors border ${compareMode ? 'bg-indigo-500 text-white border-indigo-500' : 'text-[var(--text)] bg-[var(--card-bg)] border-[var(--border)] hover:bg-[var(--bg)]'}`}
              >
                {compareMode ? 'Exit Compare' : 'Compare Schemes'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        
        {/* Step 1: Guided Workflow / Profile Builder */}
        {step === 1 && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-[var(--text)]">Startup Profile</h2>
              <div className="text-sm font-bold text-[var(--text3)]">Step 1 of 2</div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text2)] mb-2 block">Startup Stage</label>
                  <select 
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 text-sm font-medium text-[var(--text)] outline-none focus:border-indigo-500 appearance-none"
                    value={form.stage} onChange={e => update('stage', e.target.value)}
                  >
                    <option value="">Select stage...</option>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text2)] mb-2 block">Primary Industry</label>
                  <select 
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 text-sm font-medium text-[var(--text)] outline-none focus:border-indigo-500 appearance-none"
                    value={form.industry} onChange={e => update('industry', e.target.value)}
                  >
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text2)] mb-2 block">HQ State</label>
                  <select 
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 text-sm font-medium text-[var(--text)] outline-none focus:border-indigo-500 appearance-none"
                    value={form.state} onChange={e => update('state', e.target.value)}
                  >
                    <option value="">Select state...</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text2)] mb-2 block">Business Type</label>
                  <select 
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 text-sm font-medium text-[var(--text)] outline-none focus:border-indigo-500 appearance-none"
                    value={form.businessType} onChange={e => update('businessType', e.target.value)}
                  >
                    <option value="">Select type...</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="Partnership">Registered Partnership</option>
                    <option value="Proprietorship">Sole Proprietorship</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border)] flex justify-end">
                <button 
                  onClick={() => setStep(2)}
                  disabled={!form.stage || !form.industry || !form.businessType}
                  className="bg-[var(--text)] text-[var(--bg)] px-8 py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Advanced Criteria */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-[var(--text)]">Eligibility Details</h2>
              <div className="text-sm font-bold text-[var(--text3)]">Step 2 of 2</div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text2)] mb-2 block">Startup Age</label>
                  <select 
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 text-sm font-medium text-[var(--text)] outline-none focus:border-indigo-500 appearance-none"
                    value={form.age} onChange={e => update('age', e.target.value)}
                  >
                    <option value="">Select age...</option>
                    <option value="Not Incorporated">Not yet incorporated</option>
                    <option value="< 1 Year">Less than 1 year</option>
                    <option value="1-3 Years">1 to 3 years</option>
                    <option value="3-5 Years">3 to 5 years</option>
                    <option value="> 5 Years">More than 5 years</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text2)] mb-2 block">DPIIT Status</label>
                  <select 
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 text-sm font-medium text-[var(--text)] outline-none focus:border-indigo-500 appearance-none"
                    value={form.dpiitStatus} onChange={e => update('dpiitStatus', e.target.value)}
                  >
                    <option value="Not Applied">Not Applied</option>
                    <option value="Applied, Pending">Applied, Pending</option>
                    <option value="Recognised">Recognised</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--text2)] mb-2 block">Immediate Goal</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Seed Grant', 'Tax Exemption', 'Debt/Loan', 'Incubation'].map(goal => (
                      <div 
                        key={goal}
                        onClick={() => update('fundingReq', goal)}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors text-sm font-bold text-center ${form.fundingReq === goal ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-[var(--border)] bg-[var(--card-bg)] text-[var(--text2)] hover:border-[var(--text)]'}`}
                      >
                        {goal}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border)] flex justify-between items-center">
                <button 
                  onClick={() => setStep(1)}
                  className="text-[var(--text2)] hover:text-[var(--text)] font-bold text-sm"
                >
                  Back
                </button>
                <button 
                  onClick={submitAnalysis}
                  disabled={loading || !form.age}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                  ) : (
                    <><Activity className="w-4 h-4" /> Generate Report</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Results Dashboard */}
        {step === 3 && results && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            
            {/* Compare View Overlay */}
            {compareMode && compareList.length > 0 && (
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 overflow-x-auto shadow-2xl mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-xl text-[var(--text)]">Comparing {compareList.length} Schemes</h3>
                  <button onClick={() => setCompareMode(false)} className="text-sm font-bold text-[var(--text2)] hover:text-[var(--text)]">Close</button>
                </div>
                <div className="flex gap-6 min-w-max">
                  {compareList.map(id => {
                    const s = results.find(r => r.id === id);
                    if (!s) return null;
                    return (
                      <div key={s.id} className="w-80 flex flex-col gap-4">
                        <div className="font-bold text-[var(--text)] text-lg">{s.name}</div>
                        <div className="p-4 rounded-xl bg-[var(--bg2)] text-sm text-[var(--text2)] h-32 overflow-y-auto">
                          <span className="font-bold text-[var(--text)] block mb-1">Benefit</span>
                          {s.benefit}
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--bg2)] text-sm text-[var(--text2)] h-32 overflow-y-auto">
                          <span className="font-bold text-[var(--text)] block mb-1">Eligibility</span>
                          {s.eligibility}
                        </div>
                        <div className="text-xs font-bold text-[var(--text3)] p-2">Deadline: {s.deadline}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              {/* Main Results */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-[var(--text)]">Highly Relevant Schemes ({results.length})</h2>
                  <div className="flex items-center gap-2 text-sm text-[var(--text2)]">
                    <Filter className="w-4 h-4" /> Sorted by Eligibility Score
                  </div>
                </div>

                {results.map((scheme) => (
                  <article key={scheme.id} className={`rounded-3xl border transition-all duration-300 ${compareList.includes(scheme.id) ? 'border-indigo-500 shadow-[0_0_0_1px_rgba(99,102,241,1)]' : 'border-[var(--border)] hover:border-[var(--text3)]'} bg-[var(--card-bg)] overflow-hidden`}>
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                      
                      {/* Score Circle */}
                      <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-24 h-24 rounded-full border-[4px] border-[var(--bg2)] border-t-green-500 bg-[var(--bg)] relative">
                        <span className="text-2xl font-black text-[var(--text)]">{scheme.score}</span>
                        <span className="text-[10px] font-bold text-[var(--text3)] uppercase">Match</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded-md bg-[var(--bg)] text-xs font-black uppercase tracking-widest text-[var(--text2)] border border-[var(--border)]">
                              {scheme.category}
                            </span>
                            {savedSchemes.includes(scheme.id) && <span className="text-xs font-bold text-indigo-500 flex items-center gap-1"><BookmarkCheck className="w-3.5 h-3.5" /> Saved</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {compareMode && (
                              <label className="flex items-center gap-2 text-sm font-bold cursor-pointer text-[var(--text2)] hover:text-[var(--text)]">
                                <input 
                                  type="checkbox" 
                                  checked={compareList.includes(scheme.id)} 
                                  onChange={() => toggleCompare(scheme.id)}
                                  className="w-4 h-4 accent-indigo-500 rounded"
                                />
                                Compare
                              </label>
                            )}
                            <button onClick={() => toggleSave(scheme.id)} className="p-2 hover:bg-[var(--bg)] rounded-lg text-[var(--text2)] hover:text-indigo-500 transition-colors">
                              {savedSchemes.includes(scheme.id) ? <BookmarkCheck className="w-5 h-5 text-indigo-500" /> : <Bookmark className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold text-[var(--text)] mb-3 pr-4">{scheme.name}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <p className="text-xs font-bold text-[var(--text3)] uppercase mb-1 flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Key Benefit</p>
                            <p className="text-sm text-[var(--text2)] leading-relaxed">{scheme.benefit}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[var(--text3)] uppercase mb-1 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Core Eligibility</p>
                            <p className="text-sm text-[var(--text2)] leading-relaxed">{scheme.eligibility}</p>
                          </div>
                        </div>

                        {/* Action Plan */}
                        <div className="bg-[var(--bg2)] rounded-xl p-4">
                          <p className="text-xs font-bold text-[var(--text)] uppercase mb-3">Recommended Next Actions</p>
                          <ul className="space-y-2">
                            {scheme.actions.map((act: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text2)]">
                                <div className="mt-0.5 w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0 text-[10px] font-bold">{i+1}</div>
                                {act}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[var(--bg)] px-6 py-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-[var(--text2)]">
                        <Clock className="w-4 h-4" /> Deadline: <span className="text-[var(--text)]">{scheme.deadline}</span>
                      </div>
                      <a href={scheme.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-black text-indigo-500 hover:text-indigo-600 transition-colors">
                        View Official Guidelines <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>

              {/* Sidebar Summary */}
              <div className="space-y-6">
                <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 sticky top-24">
                  <h3 className="font-bold text-[var(--text)] mb-4 pb-4 border-b border-[var(--border)]">Your Profile Summary</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text3)]">Stage</span>
                      <span className="font-bold text-[var(--text)]">{form.stage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text3)]">Industry</span>
                      <span className="font-bold text-[var(--text)] text-right">{form.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text3)]">Entity</span>
                      <span className="font-bold text-[var(--text)] text-right">{form.businessType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text3)]">DPIIT</span>
                      <span className="font-bold text-[var(--text)]">{form.dpiitStatus}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-[var(--border)]">
                    <div className="text-xs font-bold text-[var(--text3)] uppercase mb-3">Saved Items</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text2)]">Bookmarked Schemes</span>
                      <span className="font-black text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-md">{savedSchemes.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
