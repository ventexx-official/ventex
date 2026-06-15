"use client";

import { useState, useEffect } from 'react';
import { X, Heart, Coffee } from 'lucide-react';

export default function KofiSupport() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user dismissed it permanently or temporarily
    const dismissedUntil = localStorage.getItem('ventex_kofi_dismissed_until');
    const dismissedForever = localStorage.getItem('ventex_kofi_dismissed_forever');

    if (dismissedForever === 'true') {
      return;
    }

    if (dismissedUntil) {
      const untilDate = new Date(dismissedUntil);
      if (new Date() < untilDate) {
        return;
      }
    }

    // Show after a slight delay to not interrupt initial render
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleRemindLater = () => {
    setIsVisible(false);
    // Remind again in 3 days
    const nextTime = new Date();
    nextTime.setDate(nextTime.getDate() + 3);
    localStorage.setItem('ventex_kofi_dismissed_until', nextTime.toISOString());
  };

  const handleHidePermanently = () => {
    setIsVisible(false);
    localStorage.setItem('ventex_kofi_dismissed_forever', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-neutral-900 border border-neutral-700/80 p-5 rounded-2xl shadow-2xl max-w-sm relative">
        <button 
          onClick={handleHidePermanently}
          className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-300"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="bg-pink-500/20 p-3 rounded-full text-pink-500">
            <Heart className="w-6 h-6 fill-pink-500" />
          </div>
          <div>
            <h4 className="font-bold text-neutral-100 mb-1">Support Ventex</h4>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              If you find our startup ecosystem valuable, consider buying us a coffee. It helps keep the platform running!
            </p>
            
            <div className="flex items-center gap-2">
              <a 
                href="https://ko-fi.com/ventexhq" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleHidePermanently}
                className="flex items-center gap-2 bg-[#FF5E5B] hover:bg-[#FF4A47] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                <Coffee className="w-4 h-4" /> Support on Ko-fi
              </a>
              <button 
                onClick={handleRemindLater}
                className="text-xs text-neutral-400 hover:text-neutral-200 px-2"
              >
                Remind later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
