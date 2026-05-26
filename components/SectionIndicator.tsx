"use client";

import { useEffect, useState } from 'react';

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'discover', label: 'Startups' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'join', label: 'Join' },
];

export default function SectionIndicator() {
  const [active, setActive] = useState('hero');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 100);
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

      setActive(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!visible) return null;

  return (
    <div
      className="fixed left-1/2 z-50 hidden -translate-x-1/2 items-center sm:flex"
      style={{
        animation: 'slideUp 240ms ease-out',
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '14px',
        padding: '6px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
        bottom: '40px',
      }}
    >
      <div className="flex items-center gap-1">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(section.id)}
            style={{
              background: active === section.id ? '#ffffff' : 'transparent',
              color: active === section.id ? '#000000' : 'rgba(255,255,255,0.6)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: active === section.id ? '700' : '400',
              cursor: 'pointer',
              transition: 'all 200ms',
              boxShadow: active === section.id ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}
