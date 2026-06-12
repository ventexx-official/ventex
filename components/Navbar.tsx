"use client";

import Link from 'next/link';
import { Menu, X, LayoutDashboard, LogOut, Settings, User, ShoppingBag, Package, MessageSquare } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

// Hook: detect scroll direction and return 'up' | 'down'
function useScrollDirection() {
 const [direction, setDirection] = useState<'up' | 'down'>('up');
 const lastY = useRef(0);
 useEffect(() => {
 const handleScroll = () => {
 const y = window.scrollY;
 if (y < 60) { setDirection('up'); lastY.current = y; return; }
 setDirection(y > lastY.current ? 'down' : 'up');
 lastY.current = y;
 };
 window.addEventListener('scroll', handleScroll, { passive: true });
 return () => window.removeEventListener('scroll', handleScroll);
 }, []);
 return direction;
}

export default function Navbar() {
 const [isOpen, setIsOpen] = useState(false);
 const [user, setUser] = useState<any>(null);
 const [userProfile, setUserProfile] = useState<{ full_name?: string | null; avatar_url?: string | null } | null>(null);
 const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
 const [scrolled, setScrolled] = useState(false);
 const [cartCount, setCartCount] = useState(0);
 const [unreadMessages, setUnreadMessages] = useState(0);
 const router = useRouter();
 const pathname = usePathname();
 const avatarMenuRef = useRef<HTMLDivElement | null>(null);
 const scrollDirection = useScrollDirection();
 const isHome = pathname === '/';
 // On non-home pages collapse center + right pills when scrolling down
 const pillsHidden = !isHome && scrollDirection === 'down';

 const fetchCartCount = async (userId: string) => {
 const { count } = await supabase
 .from('cart_items')
 .select('*', { count: 'exact', head: true })
 .eq('user_id', userId);
 setCartCount(count || 0);
 };

 const fetchUnreadMessages = async (userId: string) => {
 const { data: conversations } = await supabase
 .from('conversations')
 .select('id')
 .or(`founder_id.eq.${userId},investor_id.eq.${userId}`);
 const ids = (conversations || []).map((item: any) => item.id);
 if (ids.length === 0) {
 setUnreadMessages(0);
 return;
 }
 const { count } = await supabase
 .from('messages')
 .select('*', { count: 'exact', head: true })
 .in('conversation_id', ids)
 .neq('sender_id', userId)
 .eq('read', false);
 setUnreadMessages(count || 0);
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
 fetchUnreadMessages(session.user.id);
 } else {
 setUserProfile(null);
 setUnreadMessages(0);
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
 fetchUnreadMessages(session.user.id);
 } else {
 setUserProfile(null);
 setUnreadMessages(0);
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
 { href: '/pricing', label: 'Pricing' },
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

 const hideNavbar = !isHome && scrollDirection === 'down';

 return (
 <nav className={`fixed top-4 left-0 right-0 z-50 pointer-events-none transition-transform duration-500 ${hideNavbar ? '-translate-y-[150%]' : scrolled ? 'translate-y-1' : 'translate-y-0'}`}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14 gap-4">
 {/* Left Pill - Logo */}
 <div className="flex justify-start">
 <div className="pointer-events-auto flex items-center h-14 px-6 rounded-full border transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,.1)] shadow-[0_5px_20px_rgba(0,0,0,.05)] backdrop-blur-[24px]" style={{ background: 'var(--nav-bg)', borderColor: 'var(--border)' }}>
 <Link href="/" className="text-[20px] font-extrabold tracking-[-.5px] text-[var(--text)] hover:opacity-70 transition-opacity flex-shrink-0">
 Ventex
 </Link>
 </div>
 </div>

 {/* Center Pill - Desktop Nav Links - collapses on non-home scroll-down */}
 <div className={`hidden md:flex justify-center transition-all duration-500 ${pillsHidden ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}>
 <div className="pointer-events-auto flex items-center h-14 px-3 rounded-full border transition-all duration-300 shadow-[0_5px_20px_rgba(0,0,0,.05)] backdrop-blur-[24px] gap-1" style={{ background: 'var(--nav-bg)', borderColor: 'var(--border)' }}>
 {navLinks.map(link => (
 <Link
 key={link.href}
 href={link.href}
 className={`px-4 py-2 text-[13px] font-bold rounded-full transition-all duration-300 hover:-translate-y-0.5 ${
 isActive(link.href)
 ? 'bg-[var(--text)] text-[var(--bg)] shadow-md'
 : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)]'
 }`}
 >
 {link.label}
 </Link>
 ))}
 </div>
 </div>

 {/* Right Pill - Actions - collapses on non-home scroll-down */}
 <div className={`flex justify-end gap-2 transition-all duration-500 ${pillsHidden ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}>
 <div className="pointer-events-auto flex items-center h-14 px-3 rounded-full border transition-all duration-300 shadow-[0_5px_20px_rgba(0,0,0,.05)] backdrop-blur-[24px] gap-2" style={{ background: 'var(--nav-bg)', borderColor: 'var(--border)' }}>
 {user ? (
 <>
 <Link
 href="/messages"
 className="relative p-2 text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] rounded-full transition-all duration-300"
 aria-label="Messages"
 >
 <MessageSquare className="w-5 h-5" />
 {unreadMessages > 0 && (
 <span className="absolute top-0.5 right-0.5 min-w-4 h-4 rounded-full bg-red-500 px-1 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
 {unreadMessages}
 </span>
 )}
 </Link>
 <Link
 href="/cart"
 className="relative p-2 text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] rounded-full transition-all duration-300"
 >
 <ShoppingBag className="w-5 h-5" />
 {cartCount > 0 && (
 <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
 {cartCount}
 </span>
 )}
 </Link>
 <div className="relative ml-1" ref={avatarMenuRef}>
 <button
 type="button"
 onClick={() => setAvatarMenuOpen((v) => !v)}
 className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-[var(--text)] text-[var(--bg)] hover:scale-105 transition-all shadow-md"
 aria-label="Open profile menu"
 >
 {userProfile?.avatar_url ? (
 <img src={userProfile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
 ) : (
 <span className="text-xs font-bold">{initial}</span>
 )}
 </button>

 {avatarMenuOpen && (
 <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border bg-[var(--bg)] shadow-2xl backdrop-blur-[24px] transition-all" style={{ borderColor: 'var(--border)' }}>
 <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
 <div className="text-sm font-semibold text-[var(--text)] truncate">{displayName}</div>
 <div className="text-[11px] text-[var(--text3)] truncate">{user?.email}</div>
 </div>

 <div className="py-2">
 <Link href={`/profile/${user.id}`} onClick={() => setAvatarMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text2)] hover:bg-[var(--bg2)] hover:text-[var(--text)] transition-colors">
 <User className="w-4 h-4 text-[var(--text3)]" /> My Profile
 </Link>
 <Link href="/dashboard" onClick={() => setAvatarMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text2)] hover:bg-[var(--bg2)] hover:text-[var(--text)] transition-colors">
 <LayoutDashboard className="w-4 h-4 text-[var(--text3)]" /> My Dashboard
 </Link>
 <Link href="/my-purchases" onClick={() => setAvatarMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text2)] hover:bg-[var(--bg2)] hover:text-[var(--text)] transition-colors">
 <Package className="w-4 h-4 text-[var(--text3)]" /> My Purchases
 </Link>
 <Link href="/settings" onClick={() => setAvatarMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text2)] hover:bg-[var(--bg2)] hover:text-[var(--text)] transition-colors">
 <Settings className="w-4 h-4 text-[var(--text3)]" /> Settings
 </Link>
 </div>

 <div className="border-t" style={{ borderColor: 'var(--border)' }} />

 <div className="py-1">
 <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
 <LogOut className="w-4 h-4" /> Logout
 </button>
 </div>
 </div>
 )}
 </div>
 </>
 ) : (
 <>
 <Link href="/login" className="px-4 py-2 text-sm font-bold text-[var(--text)] hover:text-[var(--text2)] transition-colors">Login</Link>
 <Link href="/signup" className="btn-primary ml-2 hidden sm:flex">Get Started →</Link>
 </>
 )}
 </div>
 
 {/* Mobile Hamburger */}
 <div className="md:hidden pointer-events-auto flex items-center justify-center h-14 w-14 rounded-full border shadow-[0_5px_20px_rgba(0,0,0,.05)] backdrop-blur-[24px]" style={{ background: 'var(--nav-bg)', borderColor: 'var(--border)' }}>
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="inline-flex h-full w-full items-center justify-center rounded-full text-[var(--text)] hover:bg-[var(--bg3)] transition-colors focus:outline-none"
 aria-label="Toggle menu"
 >
 {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
 </button>
 </div>
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
 href="/messages"
 onClick={() => setIsOpen(false)}
 className="flex min-h-11 items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] transition-colors"
 >
 <div className="flex items-center gap-3">
 <MessageSquare className="w-5 h-5" />
 Messages
 </div>
 {unreadMessages > 0 && (
 <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
 {unreadMessages}
 </span>
 )}
 </Link>
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
 Get Started →
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
