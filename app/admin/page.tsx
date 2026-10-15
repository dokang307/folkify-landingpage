"use client";

import { useEffect, useState } from "react";
import { Users, Crown, Zap, UserCheck, TrendingUp, Shield, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  fetchAdminStats, fetchAdminBlogPosts, fetchRevenueSummary,
  type AdminStats, type BlogPostAdmin, type AdminRevenue,
} from "@/lib/admin-api";
import BlogWeeklyStats from "./BlogWeeklyStats";

function fmtVND(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [posts, setPosts] = useState<BlogPostAdmin[]>([]);
  const [revenue, setRevenue] = useState<AdminRevenue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchAdminBlogPosts(), fetchRevenueSummary()])
      .then(([adminStats, blogPosts, rev]) => {
        setStats(adminStats);
        setPosts(blogPosts);
        setRevenue(rev);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Tổng người dùng", value: stats.totalUsers, icon: Users, color: "text-[#52b788]", bg: "bg-[#52b788]/10" },
        { label: "Mới tuần này", value: stats.newUsersThisWeek, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Gói Basic", value: stats.basicUsers, icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Gói Pro", value: stats.proUsers, icon: Crown, color: "text-amber-500", bg: "bg-amber-50" },
        { label: "Gói Free", value: stats.freeUsers, icon: UserCheck, color: "text-zinc-400", bg: "bg-zinc-100" },
        { label: "Admins", value: stats.totalAdmins, icon: Shield, color: "text-red-400", bg: "bg-red-50" },
      ]
    : [];

  const revenueCards = revenue
    ? [
        { label: "Tổng doanh thu", value: fmtVND(revenue.totalRevenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Thành công", value: revenue.successCount, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
        { label: "Thất bại", value: revenue.failedCount, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
        { label: "Đang chờ", value: revenue.pendingCount, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50" },
      ]
    : [];

  const maxMonthly = revenue ? Math.max(...revenue.monthly.map((m) => m.amount), 1) : 1;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a1f14]">Tổng quan</h1>
        <p className="text-zinc-400 text-sm mt-1">Thống kê hệ thống Folkify</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {statCards.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} strokeWidth={1.5} />
                </div>
                <p className="text-3xl font-bold text-[#0a1f14]">{s.value}</p>
                <p className="text-zinc-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {revenue && (
            <>
              <h2 className="text-lg font-semibold text-[#0a1f14] mb-4">Doanh thu</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {revenueCards.map((r) => (
                  <div key={r.label} className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
                    <div className={`w-9 h-9 rounded-xl ${r.bg} flex items-center justify-center mb-4`}>
                      <r.icon className={`w-5 h-5 ${r.color}`} strokeWidth={1.5} />
                    </div>
                    <p className="text-2xl font-bold text-[#0a1f14]">{r.value}</p>
                    <p className="text-zinc-400 text-sm mt-1">{r.label}</p>
                  </div>
                ))}
              </div>

              {revenue.monthly.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm mb-6">
                  <h3 className="text-sm font-medium text-zinc-500 mb-4">Doanh thu 12 tháng gần nhất</h3>
                  <div className="space-y-2">
                    {revenue.monthly.map((m) => (
                      <div key={m.month} className="flex items-center gap-3 text-sm">
                        <span className="w-16 text-zinc-400 tabular-nums text-xs">{m.month}</span>
                        <div className="flex-1 h-6 bg-zinc-50 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-lg transition-all"
                            style={{ width: `${(m.amount / maxMonthly) * 100}%` }}
                          />
                        </div>
                        <span className="w-28 text-right text-xs tabular-nums font-medium text-[#0a1f14]">
                          {fmtVND(m.amount)}
                        </span>
                        <span className="w-12 text-right text-xs text-zinc-400">{m.count} GD</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <BlogWeeklyStats posts={posts} />
        </>
      )}
    </div>
  );
}
