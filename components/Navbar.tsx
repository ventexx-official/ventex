"use client";

import Link from 'next/link';
import { Menu, X, LayoutDashboard, LogOut, Settings, User, ShoppingBag, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{ full_name?: string | null; avatar_url?: string | null } | null>(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);

  const fetchCartCount = async (userId: string) => {
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    setCartCount(count || 0);
  };

  useEffect(() => {
    const handleCartUpdated = () => {
      if (user) fetchCartCount(user.id);
    };
    window.addEventListener('cart_updated', handleCartUpdated);
    return () => window.removeEventListener('cart_updated', handleCartUpdated);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role, full_name, avatar_url')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setUserProfile({ full_name: profile.full_name, avatar_url: profile.avatar_url });
        }
        fetchCartCount(session.user.id);
      } else {
        setUserProfile(null);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase.from('users').select('role, full_name, avatar_url').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data) {
              setUserProfile({ full_name: data.full_name, avatar_url: data.avatar_url });
            }
          });
        fetchCartCount(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    setAvatarMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/discover', label: 'Discover' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/catalyst', label: 'Catalyst' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!avatarMenuRef.current) return;
      if (e.target instanceof Node && !avatarMenuRef.current.contains(e.target)) setAvatarMenuOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAvatarMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [avatarMenuOpen]);

  const displayName = userProfile?.full_name || user?.email?.split('@')[0] || 'User';
  const initial = (displayName?.trim()?.[0] || 'U').toUpperCase();

  return (
    <nav
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${scrolled ? 'shadow-[0_1px_20px_rgba(0,0,0,.05)]' : ''}`}
      style={{ background: 'color-mix(in srgb, var(--bg) 82%, transparent)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-[18px] font-bold tracking-[-.5px] text-[var(--text)] hover:opacity-70 transition-opacity flex-shrink-0">
            Ventex
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-[var(--text)]'
                    : 'text-[var(--text2)] hover:text-[var(--text)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <ThemeToggle />
            {user ? (
              <>
                <Link
                  href="/cart"
                  className="relative p-2 text-[var(--text2)] hover:text-[var(--text)] transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="relative" ref={avatarMenuRef}>
                  <button
                    type="button"
                    onClick={() => setAvatarMenuOpen((v) => !v)}
                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-[var(--text)] text-[var(--bg)] hover:opacity-90 transition-opacity"
                    aria-label="Open profile menu"
                  >
                    {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold">{initial}</span>
                    )}
                  </button>

                  {avatarMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 overflow-hidden border bg-[var(--bg)] shadow-xl" style={{ borderColor: 'var(--border)' }}>
                      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="text-sm font-semibold text-[var(--text)] truncate">{displayName}</div>
                        <div className="text-[11px] text-[var(--text3)] truncate">{user?.email}</div>
                      </div>

                      <div className="py-1">
                        <Link
                          href={`/profile/${user.id}`}
                          onClick={() => setAvatarMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text2)] hover:bg-[var(--bg2)] hover:text-[var(--text)] transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          My Profile
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setAvatarMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text2)] hover:bg-[var(--bg2)] hover:text-[var(--text)] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          My Dashboard
                        </Link>
                        <Link
                          href="/my-purchases"
                          onClick={() => setAvatarMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text2)] hover:bg-[var(--bg2)] hover:text-[var(--text)] transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-400" />
                          My Purchases
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setAvatarMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text2)] hover:bg-[var(--bg2)] hover:text-[var(--text)] transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Settings
                        </Link>
                      </div>

                      <div className="border-t" style={{ borderColor: 'var(--border)' }} />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--text2)] hover:bg-[var(--bg2)] hover:text-[var(--text)] transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-gray-400" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-secondary"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary"
                >
                  Get Started →
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--text)] hover:bg-[var(--bg3)] transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          />
          <div className="relative max-h-full overflow-y-auto border-t bg-[var(--bg)] px-4 pb-8 pt-4 shadow-2xl transition-transform duration-200" style={{ borderColor: 'var(--border)' }}>
            <div className="mb-3">
              <ThemeToggle />
            </div>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block min-h-11 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-[var(--bg3)] text-[var(--text)]'
                    : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t mt-4 space-y-2" style={{ borderColor: 'var(--border)' }}>
              {user ? (
                <>
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-11 items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5" />
                      Cart
                    </div>
                    {cartCount > 0 && (
                      <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-11 items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] transition-colors"
                  >
                    <User className="w-5 h-5" />
                    My Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-11 items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    My Dashboard
                  </Link>
                  <Link
                    href="/my-purchases"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-11 items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] transition-colors"
                  >
                    <Package className="w-5 h-5" />
                    My Purchases
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-11 items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex min-h-11 items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center btn-secondary"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center btn-primary"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
