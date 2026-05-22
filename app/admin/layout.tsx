"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Users,
  Tag,
  AlertTriangle,
  Flag,
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
      <div className="min-h-screen bg-[#0F0F11] flex flex-col items-center justify-center text-white">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin mb-4" />
        <p className="text-sm text-neutral-400 font-medium tracking-wide">
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
    { name: "Flagged Activities", icon: Flag, path: "/admin/flagged" }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-neutral-200 flex">
      {/* Sidebar */}
      <aside
        className={`bg-[#0F0F13] border-r border-neutral-900 transition-all duration-300 flex flex-col justify-between ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div>
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-900">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-violet-500" />
                <span className="font-extrabold tracking-tighter text-white text-lg font-mono">
                  VENTEX <span className="text-violet-500">ADMIN</span>
                </span>
              </div>
            )}
            {collapsed && (
              <ShieldCheck className="h-6 w-6 text-violet-500 mx-auto" />
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-neutral-500 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition-all duration-200 group"
                >
                  <Icon className="h-5 w-5 text-neutral-500 group-hover:text-violet-400 transition-colors" />
                  {!collapsed && (
                    <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & exit */}
        <div className="p-4 border-t border-neutral-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
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
                <p className="text-xs font-bold text-white truncate">
                  {adminUser.full_name || "Admin Account"}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono uppercase truncate">
                  System Admin
                </p>
              </div>
            )}
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut size={18} />
            {!collapsed && <span className="text-xs font-bold">Exit Admin</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="h-16 border-b border-neutral-900 bg-[#0F0F13]/40 backdrop-blur flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-bold text-white">Management Console</h1>
          <div className="text-xs text-neutral-400 font-mono">
            System Live · {new Date().toLocaleDateString()}
          </div>
        </header>

        <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
