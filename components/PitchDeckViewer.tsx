"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

interface PitchDeckViewerProps {
  pitchId: string;
  investorName: string;
  investorEmail: string;
}

export default function PitchDeckViewer({ pitchId, investorName, investorEmail }: PitchDeckViewerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;

    const fetchSignedUrl = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const res = await fetch(`/api/pitch-deck/${pitchId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (res.status === 403) throw new Error("Authentication required.");
        if (res.status === 404) throw new Error("Pitch deck not found.");
        if (!res.ok) throw new Error("Failed to load secure document.");

        const data = await res.json();
        
        if (mounted) {
          setUrl(data.url);
          setLoading(false);
          
          // Expire viewer after 30 minutes (1800000 ms)
          timer = setTimeout(() => {
            if (mounted) setExpired(true);
          }, 1800000);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchSignedUrl();

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [pitchId]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F2F2F0] min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[var(--text)] animate-spin mb-4" />
        <p className="text-sm font-bold text-[var(--text2)] uppercase tracking-wider">Securing connection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F2F2F0] min-h-[400px] text-center px-4">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-[var(--text)] font-bold mb-2">Access Denied</p>
        <p className="text-sm text-[var(--text2)]">{error}</p>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F2F2F0] min-h-[400px] text-center px-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mb-4" />
        <p className="text-[var(--text)] font-bold mb-2">Session expired.</p>
        <p className="text-sm text-[var(--text2)] mb-6">For security reasons, viewing sessions are limited to 30 minutes.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-[#222222] text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-black transition-colors"
        >
          Reload to view again
        </button>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-[#F2F2F0] overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Viewer Container */}
      <div className="relative flex-grow w-full h-full min-h-[60vh]">
        
        {/* The PDF iframe. Using toolbar=0 to hide download/print controls if the browser respects it */}
        {url && (
          <iframe 
            src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full border-0 pointer-events-auto"
            title="Pitch Deck"
          />
        )}
        
        {/* Invisible Overlay to prevent direct interaction with iframe in some browsers if needed, 
            though this might break scrolling inside the PDF. Usually, the watermark overlay below is enough. */}

        {/* Diagonal Watermark Overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center opacity-[0.04]">
           <div className="transform -rotate-45 whitespace-nowrap text-center">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="text-black font-black text-4xl mb-16 px-10">
                  {investorName} • {investorEmail}
                </div>
              ))}
           </div>
        </div>
        
        {/* Additional watermark grid for density */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-3 opacity-[0.03] overflow-hidden">
             {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center transform -rotate-45">
                   <p className="text-black font-bold text-lg whitespace-nowrap">{investorEmail}</p>
                </div>
             ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#222222] text-white px-4 py-3 flex items-center justify-between flex-shrink-0 z-10 relative">
        <p className="text-[11px] font-medium tracking-wide uppercase opacity-80">
          Confidential — shared with {investorName}
        </p>
        <p className="text-[10px] opacity-50">Do not distribute</p>
      </div>
    </div>
  );
}
