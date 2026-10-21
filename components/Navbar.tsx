"use client";

import Link from "next/link";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { getDashboardRoute } from "@/lib/role-routing";
import { SITE_NAME } from "@/lib/brand";
import MagneticButton from "./MagneticButton";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{
    display_name?: string | null;
    avatar_url?: string | null;
    role?: string | null;
  } | null>(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const avatarMenuRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const fetchUnreadMessages = async (userId: string) => {
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .or(`founder_id.eq.${userId},investor_id.eq.${userId}`);
    const ids = (conversations || []).map((item: any) => item.id);
    if (ids.length === 0) {
      setUnreadMessages(0);
      return;
    }
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", ids)
      .neq("sender_id", userId)
      .eq("read", false);
    setUnreadMessages(count || 0);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open, handle ESC, focus trapping
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, display_name, avatar_url")
          .eq("id", session.user.id)
          .single();
        if (profile) {
          setUserProfile({
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            role: profile.role,
          });
        }
        fetchUnreadMessages(session.user.id);
      } else {
        setUserProfile(null);
        setUnreadMessages(0);
      }
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("role, display_name, avatar_url")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUserProfile({
                display_name: data.display_name,
                avatar_url: data.avatar_url,
                role: data.role,
              });
            }
          });
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
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/discover", label: "Discover", index: "01" },
    { href: "/marketplace", label: "Marketplace", index: "02" },
    { href: "/about", label: "About", index: "03" },
    { href: "/faq", label: "FAQ", index: "04" },
    { href: "/contact", label: "Contact", index: "05" },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!avatarMenuRef.current) return;
      if (
        e.target instanceof Node &&
        !avatarMenuRef.current.contains(e.target)
      ) {
        setAvatarMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAvatarMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [avatarMenuOpen]);

  const displayName =
    userProfile?.display_name || user?.email?.split("@")[0] || "User";
  const initial = (displayName?.trim()?.[0] || "U").toUpperCase();
  const brandName = SITE_NAME.toUpperCase();

  return (
    <>
      <header className={`site-nav ${scrolled ? "site-nav--scrolled" : ""}`}>
        {/* Brand Lockup */}
        <Link href="/" className="brand-lockup" aria-label={`${brandName} home`}>
          <span className="brand-mark">
            <span>{brandName.charAt(0)}</span>
          </span>
          <span>{brandName}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="desktop-nav"
          aria-label="Primary navigation"
        >
          {navLinks.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "nav-page--active" : ""}
            >
              <span className="nav-page__index">{link.index}</span>
              <span className="nav-page__label">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Nav Actions */}
        <div className="nav-actions">
          {user ? (
            <>
              <Link
                href="/messages"
                className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-paper-dim hover:text-paper rounded-full transition-colors"
                aria-label="Messages"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-red px-1 text-[9px] font-bold text-paper flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Link>

              {/* Profile Avatar & Dropdown */}
              <div className="relative" ref={avatarMenuRef}>
                <button
                  type="button"
                  onClick={() => setAvatarMenuOpen((v) => !v)}
                  className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full overflow-hidden flex items-center justify-center bg-card border border-line text-paper hover:border-red transition-all cursor-pointer"
                  aria-label="Open profile menu"
                >
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold">{initial}</span>
                  )}
                </button>

                {avatarMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-line bg-card shadow-2xl backdrop-blur-md transition-all z-50 text-paper">
                    <div className="px-4 py-3 border-b border-line">
                      <div className="text-xs font-bold truncate text-paper">
                        {displayName}
                      </div>
                      <div className="text-[10px] text-paper-dim truncate">
                        {user?.email}
                      </div>
                    </div>

                    <div className="py-2 text-xs">
                      <Link
                        href={`/profile/${user.id}`}
                        onClick={() => setAvatarMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-muted text-paper transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-paper-dim" /> My Profile
                      </Link>
                      <Link
                        href={getDashboardRoute(userProfile?.role)}
                        onClick={() => setAvatarMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-muted text-paper transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-paper-dim" />{" "}
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setAvatarMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-muted text-paper transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-paper-dim" /> Settings
                      </Link>
                    </div>

                    <div className="border-t border-line py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-xs text-red hover:bg-red/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-login hover:text-paper transition-colors min-h-[44px] flex items-center px-2">
                Sign in
              </Link>
              <MagneticButton href="/signup" variant="crimson" className="nav-cta min-h-[44px]">
                Get Started <ArrowUpRight size={13} />
              </MagneticButton>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Full-screen Mobile Navigation Drawer */}
      {isOpen && (
        <div
          ref={drawerRef}
          className="fixed inset-0 z-40 bg-[var(--ink)]/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-8 animate-in fade-in duration-200 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/"
              className="brand-lockup text-lg font-bold"
              onClick={() => setIsOpen(false)}
            >
              <span className="brand-mark">
                <span>{brandName.charAt(0)}</span>
              </span>
              <span>{brandName}</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-full text-[var(--paper)] border border-line"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="flex flex-col gap-4 my-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-baseline gap-3 text-2xl font-bold uppercase tracking-tight py-2 transition-colors ${
                  isActive(link.href) ? "text-[var(--red)]" : "text-[var(--paper)] hover:text-[var(--red)]"
                }`}
              >
                <span className="text-xs text-[var(--red)] font-mono">{link.index}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 pt-6 border-t border-line">
            {user ? (
              <>
                <Link
                  href={getDashboardRoute(userProfile?.role)}
                  onClick={() => setIsOpen(false)}
                  className="w-full min-h-[44px] flex items-center justify-center rounded-full bg-[var(--paper)] text-[var(--ink)] font-bold text-sm tracking-wider uppercase"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full min-h-[44px] flex items-center justify-center rounded-full border border-line text-[var(--red)] font-bold text-sm tracking-wider uppercase"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full min-h-[44px] flex items-center justify-center rounded-full bg-[var(--red)] text-[var(--paper)] font-bold text-sm tracking-wider uppercase"
                >
                  Create Pitch / Get Started
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full min-h-[44px] flex items-center justify-center rounded-full border border-line text-[var(--paper)] font-bold text-sm tracking-wider uppercase"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
