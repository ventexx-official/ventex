"use client";

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  const [spin, setSpin] = useState(false);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') || 'light');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setTheme(next);
    setSpin(true);
    window.setTimeout(() => setSpin(false), 300);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex h-9 w-10 items-center justify-center rounded-lg border text-[var(--text2)] transition-colors hover:text-[var(--text)]"
      style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}
    >
      <span className={`transition-transform duration-300 ${spin ? 'rotate-[360deg]' : ''}`}>
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </span>
    </button>
  );
}
