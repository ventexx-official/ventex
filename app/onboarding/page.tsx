"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Rocket, LineChart, ShoppingBag, Compass, Upload } from 'lucide-react';
type Role = 'founder' | 'investor' | 'buyer' | 'explorer' | null;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [fullName, setFullName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);
      
      // Get current profile data
      const { data: profile } = await supabase
        .from('users')
        .select('full_name, role, avatar_url')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        if (profile.role !== 'visitor') {
          // Already onboarded
          router.push('/');
          return;
        }
        setFullName(profile.full_name || session.user.user_metadata?.full_name || '');
        setAvatarPreview(profile.avatar_url || session.user.user_metadata?.avatar_url || null);
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  const handleComplete = async () => {
    if (!userId || !role) return;
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          role: role,
          full_name: fullName,
        });

      if (error) {
        console.error('Error updating profile:', error);
        alert('Failed to save profile: ' + error.message + '\n\nIf this persists, make sure you have applied the latest SQL schema changes in Supabase.');
        setSubmitting(false);
        return;
      }

      // Redirect to appropriate landing pages
      switch (role) {
        case 'founder': return router.push('/founder/create-pitch');
        case 'investor': return router.push('/discover');
        case 'buyer': return router.push('/discover');
        case 'explorer': return router.push('/');
        default: return router.push('/');
      }
    } catch (err: any) {
      console.error('Unexpected error during onboarding:', err);
      alert('An unexpected error occurred: ' + (err.message || 'Unknown error'));
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)]  flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--border)]  border-t-[#222222] dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]  flex flex-col items-center justify-center p-4">
      {/* Progress Indicators */}
      <div className="flex gap-2 mb-12">
        <div className={`h-1 w-12 rounded-full ${step >= 1 ? 'bg-[var(--text)] dark:bg-[var(--card-bg)]' : 'bg-[#e5e5e5] dark:bg-[#333333]'}`} />
        <div className={`h-1 w-12 rounded-full ${step >= 2 ? 'bg-[var(--text)] dark:bg-[var(--card-bg)]' : 'bg-[#e5e5e5] dark:bg-[#333333]'}`} />
        <div className={`h-1 w-12 rounded-full ${step >= 3 ? 'bg-[var(--text)] dark:bg-[var(--card-bg)]' : 'bg-[#e5e5e5] dark:bg-[#333333]'}`} />
      </div>

      <div className="w-full max-w-[640px]">
        {/* STEP 1: Role Selection */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-[var(--text)]  mb-8">
              What brings you to Ventex?
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => setRole('founder')}
                className={`p-6 bg-[var(--card-bg)] bg-[var(--card-bg)] rounded-[16px] text-left transition-all ${
                  role === 'founder' 
                    ? 'border-2 border-[#222222] dark:border-white shadow-sm ring-1 ring-black dark:ring-white ring-opacity-5' 
                    : 'border-[0.5px] border-[var(--border)]  hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <Rocket className={`w-8 h-8 mb-4 ${role === 'founder' ? 'text-[var(--text)] ' : 'text-[var(--text2)]'}`} />
                <h3 className="font-bold text-lg text-[var(--text)]  mb-1">I'm a founder</h3>
                <p className="text-sm text-[var(--text2)]">I want to pitch my startup and find investors</p>
              </button>

              <button 
                onClick={() => setRole('investor')}
                className={`p-6 bg-[var(--card-bg)] bg-[var(--card-bg)] rounded-[16px] text-left transition-all ${
                  role === 'investor' 
                    ? 'border-2 border-[#222222] dark:border-white shadow-sm ring-1 ring-black dark:ring-white ring-opacity-5' 
                    : 'border-[0.5px] border-[var(--border)]  hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <LineChart className={`w-8 h-8 mb-4 ${role === 'investor' ? 'text-[var(--text)] ' : 'text-[var(--text2)]'}`} />
                <h3 className="font-bold text-lg text-[var(--text)]  mb-1">I'm an investor</h3>
                <p className="text-sm text-[var(--text2)]">I want to discover and fund great startups</p>
              </button>

              <button 
                onClick={() => setRole('buyer')}
                className={`p-6 bg-[var(--card-bg)] bg-[var(--card-bg)] rounded-[16px] text-left transition-all ${
                  role === 'buyer' 
                    ? 'border-2 border-[#222222] dark:border-white shadow-sm ring-1 ring-black dark:ring-white ring-opacity-5' 
                    : 'border-[0.5px] border-[var(--border)]  hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <ShoppingBag className={`w-8 h-8 mb-4 ${role === 'buyer' ? 'text-[var(--text)] ' : 'text-[var(--text2)]'}`} />
                <h3 className="font-bold text-lg text-[var(--text)]  mb-1">I'm a buyer</h3>
                <p className="text-sm text-[var(--text2)]">I want to buy products from startups</p>
              </button>

              <button 
                onClick={() => setRole('explorer')}
                className={`p-6 bg-[var(--card-bg)] bg-[var(--card-bg)] rounded-[16px] text-left transition-all ${
                  role === 'explorer' 
                    ? 'border-2 border-[#222222] dark:border-white shadow-sm ring-1 ring-black dark:ring-white ring-opacity-5' 
                    : 'border-[0.5px] border-[var(--border)]  hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <Compass className={`w-8 h-8 mb-4 ${role === 'explorer' ? 'text-[var(--text)] ' : 'text-[var(--text2)]'}`} />
                <h3 className="font-bold text-lg text-[var(--text)]  mb-1">Just exploring</h3>
                <p className="text-sm text-[var(--text2)]">I want to see what Ventex is about</p>
              </button>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!role}
                className="bg-[var(--text)] dark:bg-[var(--card-bg)] text-[var(--text)] dark:text-[var(--text)] px-8 py-3 rounded-md font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Quick Profile */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 bg-[var(--card-bg)] bg-[var(--card-bg)] border-[0.5px] border-[var(--border)]  rounded-[16px] p-8 max-w-[440px] mx-auto shadow-sm">
            <h1 className="text-2xl font-bold text-center text-[var(--text)]  mb-2">
              Setup your profile
            </h1>
            <p className="text-center text-[var(--text2)] text-sm mb-8">
              Tell us a bit about yourself to complete your account.
            </p>

            <div className="flex flex-col items-center mb-8">
              <div className="relative w-24 h-24 rounded-full border border-[var(--border)]  bg-[var(--bg)]  flex items-center justify-center overflow-hidden mb-4 group cursor-pointer">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[var(--text2)] font-bold text-2xl">{fullName ? fullName.charAt(0).toUpperCase() : '?'}</span>
                )}
                
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-6 h-6 text-[var(--text)]" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <span className="text-xs text-[var(--text2)]">Upload photo (optional)</span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[var(--text)]  mb-1.5">Full Name</label>
                <input
                  type="text"
                  className="w-full border-[0.5px] border-[var(--border)]  rounded-md px-3 py-2.5 text-sm bg-[var(--card-bg)]  text-[var(--text)]  focus:outline-none focus:ring-1 focus:ring-[#222222] dark:focus:ring-white"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="text-sm font-bold text-[var(--text2)] hover:text-[var(--text)] dark:hover:text-[var(--text)]"
                >
                  &larr; Back
                </button>
                <button 
                  onClick={handleComplete}
                  disabled={!fullName || submitting}
                  className="bg-[var(--text)] dark:bg-[var(--card-bg)] text-[var(--text)] dark:text-[var(--text)] px-8 py-2.5 rounded-md font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Complete setup'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}