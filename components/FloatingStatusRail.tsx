"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'discover', label: 'Startups' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'join', label: 'Join' },
];

export default function FloatingStatusRail() {
  const [theme, setTheme] = useState('light');
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('hero');

  // Hide rail on certain routes
  const noRailRoutes = ['/onboarding', '/login', '/signup', '/forgot-password', '/auth/callback', '/admin', '/founder'];
  const hideRail = noRailRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    
    if (pathname !== '/') return;

    const handleScroll = () => {
      let current = 'hero';
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setTheme(next);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (hideRail) return null;

  return (
    <div className="floating-status-rail stagger-5 hidden md:flex items-center justify-center gap-4">
      {pathname === '/' ? (
        <div className="flex items-center gap-1 bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)] p-1 rounded-[100px] mr-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                activeSection === section.id 
                  ? 'bg-white text-black shadow-sm dark:bg-black dark:text-white' 
                  : 'text-[var(--text2)] hover:text-[var(--text)]'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="rail-telemetry">
          <div className="rail-dot"></div>
          <span>SYS_STATUS: ACTIVE</span>
          <span>{'//'}</span>
          <span>DATA PARAMETERS NORMAL</span>
          <span>{'//'}</span>
          <span>MATCHING SUITE ONLINE</span>
        </div>
      )}
      <button className="spectrum-toggle shrink-0" onClick={toggleTheme} aria-label="Toggle spectrum theme">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </button>
    </div>
  );
}
