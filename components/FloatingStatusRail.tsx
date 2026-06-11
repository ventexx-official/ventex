"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function FloatingStatusRail() {
  const [theme, setTheme] = useState('light');
  const pathname = usePathname();

  // Hide rail on certain routes
  const noRailRoutes = ['/onboarding', '/login', '/signup', '/forgot-password', '/auth/callback', '/admin', '/founder'];
  const hideRail = noRailRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') || 'light');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setTheme(next);
  };

  if (hideRail) return null;

  return (
    <div className="floating-status-rail stagger-5 hidden md:flex">
      <div className="rail-telemetry">
        <div className="rail-dot"></div>
        <span>SYS_STATUS: ACTIVE</span>
        <span>{'//'}</span>
        <span>DATA PARAMETERS NORMAL</span>
        <span>{'//'}</span>
        <span>MATCHING SUITE ONLINE</span>
      </div>
      <button className="spectrum-toggle" onClick={toggleTheme} aria-label="Toggle spectrum theme">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </button>
    </div>
  );
}
