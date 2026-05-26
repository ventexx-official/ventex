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
      className="fixed bottom-8 left-1/2 z-50 hidden -translate-x-1/2 items-center rounded-xl border p-1 backdrop-blur-xl sm:flex"
      style={{
        animation: 'slideUp 240ms ease-out',
        background: 'color-mix(in srgb, var(--bg2) 86%, transparent)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-1">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(section.id)}
            style={{
              background: active === section.id ? 'var(--bg)' : 'transparent',
              color: active === section.id ? 'var(--text)' : 'var(--text2)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: active === section.id ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 200ms',
              boxShadow: active === section.id ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
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
