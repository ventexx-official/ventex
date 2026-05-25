"use client";

import Link from 'next/link';
import { Menu, X, LayoutDashboard, LogOut, Settings, User, ShoppingBag, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

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
    <nav className={`bg-[#222222] text-white sticky top-0 z-50 transition-shadow ${scrolled ? 'shadow-xl shadow-black/30' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-black italic uppercase text-lg tracking-wider hover:opacity-80 transition-opacity flex-shrink-0">
            Ventex
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {user ? (
              <>
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-300 hover:text-white transition-colors"
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
                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-[#111111] text-white hover:opacity-90 transition-opacity"
                    aria-label="Open profile menu"
                  >
                    {userProfile?.avatar_url ? (
                      <img src={userProfile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold">{initial}</span>
                    )}
                  </button>

                  {avatarMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111111] border border-white/10 shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="text-sm font-semibold text-white truncate">{displayName}</div>
                        <div className="text-[11px] text-gray-400 truncate">{user?.email}</div>
                      </div>

                      <div className="py-1">
                        <Link
                          href={`/profile/${user.id}`}
                          onClick={() => setAvatarMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          My Profile
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setAvatarMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          My Dashboard
                        </Link>
                        <Link
                          href="/my-purchases"
                          onClick={() => setAvatarMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-400" />
                          My Purchases
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setAvatarMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Settings
                        </Link>
                      </div>

                      <div className="border-t border-white/10" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors"
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
                  className="border border-white/30 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 hover:border-white transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-[#222222] px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-100 active:scale-95 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10">
          <div className="px-4 pt-4 pb-6 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
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
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    My Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    My Dashboard
                  </Link>
                  <Link
                    href="/my-purchases"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Package className="w-5 h-5" />
                    My Purchases
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
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
                    className="block w-full text-center border border-white/30 text-white px-4 py-3 rounded-xl text-base font-medium hover:bg-white/10 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-white text-[#222222] px-4 py-3 rounded-xl text-base font-bold hover:bg-gray-100 transition-colors"
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
