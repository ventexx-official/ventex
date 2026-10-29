'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Presentation,
  ShoppingBag,
  MessageSquare,
  Settings,
  LogOut,
  Compass,
  Users,
  Mail,
  Shield,
  Layers,
  Home,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ENABLE_MESSAGING } from '@/lib/brand';

export type UserRole = 'founder' | 'investor' | 'buyer' | 'visitor' | 'admin';

interface DashboardShellProps {
  children: React.ReactNode;
  role?: UserRole;
}

export function DashboardShell({ children, role: roleProp }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{
    role?: UserRole | null;
    display_name?: string | null;
    avatar_url?: string | null;
    company?: string | null;
  } | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('profiles')
        .select('role, display_name, avatar_url, company')
        .eq('id', session.user.id)
        .single();

      if (data) setProfile(data as any);
    }
    loadProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const activeRole: UserRole = roleProp || profile?.role || 'founder';

  // Role-specific navigation items
  let navItems: {
    label: string;
    href: string;
    icon: any;
    active: boolean;
    soon?: boolean;
  }[] = [];

  switch (activeRole) {
    case 'investor':
      navItems = [
        {
          label: 'Dashboard',
          href: '/investor/portal',
          icon: LayoutDashboard,
          active: pathname === '/investor/portal',
        },
        {
          label: 'Discover',
          href: '/discover',
          icon: Compass,
          active: pathname.startsWith('/discover'),
        },
        {
          label: 'Messages',
          href: '/messages',
          icon: MessageSquare,
          active: pathname.startsWith('/messages'),
          soon: !ENABLE_MESSAGING,
        },
        {
          label: 'Settings',
          href: '/settings',
          icon: Settings,
          active: pathname.startsWith('/settings'),
        },
      ];
      break;

    case 'buyer':
      navItems = [
        {
          label: 'Dashboard',
          href: '/buyer/dashboard',
          icon: LayoutDashboard,
          active: pathname === '/buyer/dashboard',
        },
        {
          label: 'Marketplace',
          href: '/marketplace',
          icon: ShoppingBag,
          active: pathname === '/marketplace',
        },
        {
          label: 'Messages',
          href: '/messages',
          icon: MessageSquare,
          active: pathname.startsWith('/messages'),
          soon: !ENABLE_MESSAGING,
        },
        {
          label: 'Settings',
          href: '/settings',
          icon: Settings,
          active: pathname.startsWith('/settings'),
        },
      ];
      break;

    case 'visitor':
      navItems = [
        {
          label: 'Home',
          href: '/explorer',
          icon: Home,
          active: pathname === '/explorer',
        },
        {
          label: 'Discover',
          href: '/discover',
          icon: Compass,
          active: pathname.startsWith('/discover'),
        },
        {
          label: 'Marketplace',
          href: '/marketplace',
          icon: ShoppingBag,
          active: pathname === '/marketplace',
        },
        {
          label: 'Settings',
          href: '/settings',
          icon: Settings,
          active: pathname.startsWith('/settings'),
        },
      ];
      break;

    case 'admin':
      navItems = [
        {
          label: 'Overview',
          href: '/admin',
          icon: LayoutDashboard,
          active: pathname === '/admin' && !pathname.includes('#'),
        },
        {
          label: 'Pitches',
          href: '/admin#pitches',
          icon: Presentation,
          active: false,
        },
        {
          label: 'Products',
          href: '/admin#products',
          icon: ShoppingBag,
          active: false,
        },
        {
          label: 'Users',
          href: '/admin#users',
          icon: Users,
          active: false,
        },
        {
          label: 'Contact messages',
          href: '/admin#contact-messages',
          icon: Mail,
          active: false,
        },
        {
          label: 'Settings',
          href: '/settings',
          icon: Settings,
          active: pathname.startsWith('/settings'),
        },
      ];
      break;

    case 'founder':
    default:
      navItems = [
        {
          label: 'Dashboard',
          href: '/founder/dashboard',
          icon: LayoutDashboard,
          active: pathname === '/founder/dashboard',
        },
        {
          label: 'My pitches',
          href: '/founder/pitches/new',
          icon: Presentation,
          active: pathname.startsWith('/founder/pitches'),
        },
        {
          label: 'Marketplace',
          href: '/founder/store',
          icon: ShoppingBag,
          active: pathname.startsWith('/founder/store'),
        },
        {
          label: 'Messages',
          href: '/messages',
          icon: MessageSquare,
          active: pathname.startsWith('/messages'),
          soon: !ENABLE_MESSAGING,
        },
        {
          label: 'Settings',
          href: '/settings',
          icon: Settings,
          active: pathname.startsWith('/settings'),
        },
      ];
      break;
  }

  const roleLabel = activeRole === 'visitor' ? 'Explorer' : activeRole.charAt(0).toUpperCase() + activeRole.slice(1);

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--paper)] flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[var(--line)] bg-[var(--card)]/40 backdrop-blur shrink-0 min-h-screen p-4">
        {/* Brand */}
        <div className="px-3 py-4 mb-6 border-b border-[var(--line)] flex items-center justify-between">
          <Link href="/" className="text-sm font-mono tracking-widest uppercase font-bold text-[var(--paper)] hover:text-[var(--red)] transition-colors">
            VENTEX
          </Link>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--line)] text-[var(--smoke)]">
            {roleLabel}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5" aria-label="Main sidebar navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.soon) {
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono text-[var(--smoke)] opacity-60 cursor-not-allowed select-none min-h-[44px]"
                  title="Messages are coming soon"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[var(--line)] text-[var(--paper)]">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-colors min-h-[44px] ${
                  item.active
                    ? 'bg-[var(--red)] text-white font-semibold'
                    : 'text-[var(--smoke)] hover:text-[var(--paper)] hover:bg-[var(--card)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Mini Card */}
        <div className="pt-4 border-t border-[var(--line)] mt-auto">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--ink)]/50 border border-[var(--line)]/50">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || roleLabel}
                className="w-8 h-8 rounded-full object-cover border border-[var(--line)]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--paper-dim)]/10 text-[var(--paper)] font-mono text-xs flex items-center justify-center border border-[var(--line)]">
                {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : roleLabel.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate text-[var(--paper)]">
                {profile?.display_name || roleLabel}
              </div>
              <div className="text-[10px] text-[var(--smoke)] truncate font-mono">
                {profile?.company || roleLabel}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-[var(--smoke)] hover:text-red-400 transition-colors rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[var(--line)] bg-[var(--card)]/20 backdrop-blur px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/" className="text-xs font-mono tracking-widest uppercase font-bold text-[var(--paper)]">
              VENTEX
            </Link>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--line)] text-[var(--smoke)]">
              {roleLabel}
            </span>
          </div>

          <div className="hidden md:block">
            <span className="text-xs font-mono text-[var(--smoke)]">
              VENTEX / {roleLabel.toUpperCase()} WORKSPACE
            </span>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-2">
            {/* Messages Icon with Tooltip */}
            <Link
              href="/messages"
              title="Messages are coming soon"
              className="relative p-2 text-[var(--smoke)] hover:text-[var(--paper)] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Messages"
            >
              <MessageSquare className="w-4 h-4" />
              {/* Unread badge slot (reserved) */}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((v) => !v)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[var(--card)] transition-colors min-w-[44px] min-h-[44px] cursor-pointer"
                aria-label="Profile and settings"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || roleLabel}
                    className="w-7 h-7 rounded-full object-cover border border-[var(--line)]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[var(--paper-dim)]/10 text-[var(--paper)] font-mono text-xs flex items-center justify-center border border-[var(--line)]">
                    {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : roleLabel.charAt(0)}
                  </div>
                )}
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--card)] border border-[var(--line)] shadow-xl p-1 z-30 font-mono text-xs animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[var(--smoke)] hover:text-[var(--paper)] hover:bg-[var(--line)]/30 min-h-[44px]"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </Link>
                  <div className="my-1 border-t border-[var(--line)]/50" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 min-h-[44px] text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--card)]/90 backdrop-blur border-t border-[var(--line)] flex items-center justify-around px-2 z-30"
        aria-label="Mobile bottom navigation"
      >
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          if (item.soon) {
            return (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center gap-0.5 text-[var(--smoke)] opacity-50 min-h-[44px] min-w-[44px] py-1"
                title="Messages are coming soon"
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-mono uppercase leading-none">Soon</span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-1 transition-colors ${
                item.active ? 'text-[var(--red)] font-semibold' : 'text-[var(--smoke)] hover:text-[var(--paper)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase leading-none truncate max-w-[50px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default DashboardShell;
