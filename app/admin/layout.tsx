"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Music, BookOpen, Award, LogOut, Shield, Menu, X, Music2, FileMusic, Newspaper } from "lucide-react";
import { getSession, clearSession } from "@/lib/auth";

const navItems = [
  { label: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { label: "Người dùng", href: "/admin/users", icon: Users },
  { label: "Nhạc cụ", href: "/admin/instruments", icon: Music },
  { label: "Bài học", href: "/admin/lessons", icon: BookOpen },
  { label: "Tác phẩm", href: "/admin/songs", icon: Music2 },
  { label: "Sheet nhạc", href: "/admin/sheets", icon: FileMusic },
  { label: "Thành tích", href: "/admin/achievements", icon: Award },
  { label: "Blog", href: "/admin/blogs", icon: Newspaper },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace("/login"); return; }
    if (session.role !== "ADMIN") { router.replace("/dashboard"); return; }
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 bg-[#0a1f14] flex flex-col transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:flex
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
          <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Folkify" className="w-7 h-7 object-contain" />
          </div>
          <span className="text-white font-bold text-base">Folkify</span>
          <div className="ml-auto flex items-center gap-1 text-red-400 text-xs font-semibold">
            <Shield className="w-3 h-3" />
            Admin
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#52b788]/20 text-[#95d5b2]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
            User Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white border-b border-zinc-100 h-14 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-500">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-[#0a1f14]">Admin</span>
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-zinc-500">
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
