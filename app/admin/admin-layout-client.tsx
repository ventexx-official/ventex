"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Users,
  Tag,
  AlertTriangle,
  Flag,
  Handshake,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  ShieldCheck,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error || !profile || profile.role !== "admin") {
          console.error("Admin Access Denied: User role is not admin.", profile);
          router.push("/");
          return;
        }

        setAdminUser(profile);
      } catch (err) {
        console.error("Error checking admin auth:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center text-[var(--text)]">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin mb-4" />
        <p className="text-sm text-[var(--text2)] font-medium tracking-wide">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  if (!adminUser) return null;

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/admin" },
    { name: "Pitches Queue", icon: FileText, path: "/admin/pitches" },
    { name: "Products Queue", icon: ShoppingBag, path: "/admin/products" },
    { name: "User Management", icon: Users, path: "/admin/users" },
    { name: "Industry Sectors", icon: Tag, path: "/admin/industries" },
    { name: "Disputes Resolution", icon: AlertTriangle, path: "/admin/disputes" },
    { name: "Flagged Activities", icon: Flag, path: "/admin/flagged" },
    { name: "Deals", icon: Handshake, path: "/admin/deals" }
  ];

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex">
      {/* Sidebar */}
      <aside
        className={`bg-[var(--card-bg)] border-r border-[0.5px] border-[#e5e5e5] dark:border-[#333333] transition-all duration-300 flex flex-col justify-between shrink-0 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div>
          {/* Header */}
          <div className={`h-16 flex items-center border-b border-[0.5px] border-[#e5e5e5] dark:border-[#333333] px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
            {!collapsed && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-violet-500 shrink-0" />
                <span className="font-extrabold tracking-tighter text-[var(--text)] text-lg font-mono">
                  VENTEX <span className="text-violet-500">ADMIN</span>
                </span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-[var(--text3)] hover:text-[var(--text)] p-1.5 rounded-lg hover:bg-[var(--bg2)] transition-colors shrink-0"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 px-3 space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    active
                      ? "bg-violet-600/15 text-violet-400 border border-violet-500/20"
                      : "text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)]/60 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      active ? "text-violet-400" : "text-[var(--text3)] group-hover:text-violet-400"
                    }`}
                  />
                  {!collapsed && (
                    <span className={`text-sm font-semibold tracking-wide truncate ${active ? "text-violet-300" : ""}`}>
                      {item.name}
                    </span>
                  )}
                  {!collapsed && active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & exit */}
        <div className="p-4 border-t border-[0.5px] border-[#e5e5e5] dark:border-[#333333] space-y-3">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="h-9 w-9 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 overflow-hidden">
              {adminUser.avatar_url ? (
                <img
                  src={adminUser.avatar_url}
                  alt={adminUser.full_name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User size={18} />
              )}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[var(--text)] truncate">
                  {adminUser.full_name || "Admin Account"}
                </p>
                <p className="text-[10px] text-violet-400 font-mono uppercase truncate">
                  System Admin
                </p>
              </div>
            )}
          </div>
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Exit Admin" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span className="text-xs font-bold">Exit Admin</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="h-16 border-b border-[0.5px] border-[#e5e5e5] dark:border-[#333333] bg-[var(--card-bg)]/40 backdrop-blur flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-base font-bold text-[var(--text)]">
              {menuItems.find(m => isActive(m.path))?.name || "Management Console"}
            </h1>
            <p className="text-[10px] text-[var(--text3)] font-mono">Ventex Admin Console</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              System Live
            </span>
            <span className="text-xs text-[var(--text3)] font-mono">{new Date().toLocaleDateString()}</span>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}