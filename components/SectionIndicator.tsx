"use client";

import { useEffect, useState } from 'react';

const sections = [
  { id: 'hero', label: 'Hero' },
  { id: 'discover', label: 'Discover' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'join', label: 'Join' },
];

export default function SectionIndicator() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const update = () => {
      let closest = sections[0].id;
      let best = Number.POSITIVE_INFINITY;
      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (!el) return;
        const distance = Math.abs(el.getBoundingClientRect().top - window.innerHeight * 0.2);
        if (distance < best) {
          best = distance;
          closest = section.id;
        }
      });
      setActive(closest);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="reveal fixed bottom-8 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-1 rounded-xl border p-1 backdrop-blur-xl sm:flex" data-delay="300" style={{ background: 'color-mix(in srgb, var(--bg2) 86%, transparent)', borderColor: 'var(--border)' }}>
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="rounded-lg px-4 py-2 text-xs font-medium transition-all"
          style={{
            background: active === section.id ? 'var(--bg)' : 'transparent',
            color: active === section.id ? 'var(--text)' : 'var(--text2)',
            boxShadow: active === section.id ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
          }}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}
