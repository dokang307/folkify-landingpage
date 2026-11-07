"use client";

import { useEffect, useState } from "react";
import { Users, Crown, Zap, UserCheck, TrendingUp, MessageSquare, DollarSign, CheckCircle, XCircle, Clock, Star } from "lucide-react";
import {
  fetchAdminStats, fetchAdminBlogPosts, fetchRevenueSummary, fetchRatingSummary,
  fetchTrafficOverview, fetchWeeklyAnalytics, fetchTrafficSources, fetchDeviceBreakdown,
  fetchTopPages, fetchDailyActiveUsers,
  type AdminStats, type BlogPostAdmin, type AdminRevenue, type RatingSummary,
  type TrafficOverview, type WeeklyAnalytics, type TrafficSource, type DeviceBreakdown,
  type PagePopularity, type DailyUsers,
} from "@/lib/admin-api";
import BlogWeeklyStats from "./BlogWeeklyStats";
import TrafficOverviewCards from "./TrafficOverviewCards";
import { DailyUsersChart, TrafficSourcesTable, DeviceBreakdownBars, TopPagesTable } from "./AnalyticsCharts";

function fmtVND(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [posts, setPosts] = useState<BlogPostAdmin[]>([]);
  const [revenue, setRevenue] = useState<AdminRevenue | null>(null);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [trafficOverview, setTrafficOverview] = useState<TrafficOverview | null>(null);
  const [weeklyAnalytics, setWeeklyAnalytics] = useState<WeeklyAnalytics[] | null>(null);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[] | null>(null);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdown[] | null>(null);
  const [topPages, setTopPages] = useState<PagePopularity[] | null>(null);
  const [dailyUsers, setDailyUsers] = useState<DailyUsers[] | null>(null);

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchAdminBlogPosts(), fetchRevenueSummary(), fetchRatingSummary()])
      .then(([adminStats, blogPosts, rev, ratings]) => {
        setStats(adminStats);
        setPosts(blogPosts);
        setRevenue(rev);
        setRatingSummary(ratings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    Promise.allSettled([
      fetchTrafficOverview(),
      fetchWeeklyAnalytics(12),
      fetchTrafficSources(30),
      fetchDeviceBreakdown(30),
      fetchTopPages(30, 10),
      fetchDailyActiveUsers(30),
    ]).then(([overview, weekly, sources, devices, pages, daily]) => {
      if (overview.status === "fulfilled") setTrafficOverview(overview.value);
      if (weekly.status === "fulfilled") setWeeklyAnalytics(weekly.value);
      if (sources.status === "fulfilled") setTrafficSources(sources.value);
      if (devices.status === "fulfilled") setDeviceBreakdown(devices.value);
      if (pages.status === "fulfilled") setTopPages(pages.value);
      if (daily.status === "fulfilled") setDailyUsers(daily.value);
    });
  }, []);

  const paidUsers = stats ? stats.basicUsers + stats.proUsers : 0;

  const statCards = stats
    ? [
        { label: "Tổng người dùng", value: stats.totalUsers, sub: `${paidUsers} trả phí`, icon: Users, color: "text-[#52b788]", bg: "bg-[#52b788]/10" },
        { label: "Người dùng mới tuần này", value: stats.newUsersThisWeek, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Gói Basic", value: stats.basicUsers, icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Gói Pro", value: stats.proUsers, icon: Crown, color: "text-amber-500", bg: "bg-amber-50" },
        { label: "Gói Free", value: stats.freeUsers, icon: UserCheck, color: "text-zinc-400", bg: "bg-zinc-100" },
        { label: "Tổng đánh giá", value: ratingSummary?.totalRatings ?? 0, sub: ratingSummary ? `${ratingSummary.averageScore.toFixed(1)} ★` : undefined, icon: MessageSquare, color: "text-amber-500", bg: "bg-amber-50" },
      ]
    : [];

  const revenueCards = revenue
    ? [
        { label: "Tổng doanh thu", value: fmtVND(revenue.totalRevenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Giao dịch thành công", value: revenue.successCount, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
        { label: "Giao dịch thất bại", value: revenue.failedCount, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
        { label: "Giao dịch đang chờ", value: revenue.pendingCount, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50" },
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
                {s.sub && <p className="text-xs text-zinc-400 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* ── GA4 Analytics ── */}
          {trafficOverview && (
            <>
              <h2 className="text-lg font-semibold text-[#0a1f14] mb-4">Lưu lượng truy cập — 7 ngày</h2>
              <TrafficOverviewCards data={trafficOverview} />
            </>
          )}

          {dailyUsers && dailyUsers.length > 0 && <DailyUsersChart data={dailyUsers} />}

          {(trafficSources || deviceBreakdown) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {trafficSources && <TrafficSourcesTable data={trafficSources} />}
              {deviceBreakdown && <DeviceBreakdownBars data={deviceBreakdown} />}
            </div>
          )}

          {topPages && <TopPagesTable data={topPages} />}

          {/* ── Revenue ── */}
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

          {ratingSummary && (
            <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm mb-6">
              <h2 className="text-lg font-semibold text-[#0a1f14] mb-4">Đánh giá ứng dụng</h2>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-4xl font-bold text-[#0a1f14]">{ratingSummary.averageScore.toFixed(1)}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-4 h-4 ${n <= Math.round(ratingSummary.averageScore) ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                    ))}
                  </div>
                  <p className="text-zinc-400 text-sm mt-1">{ratingSummary.totalRatings} đánh giá</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const count = ratingSummary.distribution[n] ?? 0;
                    const pct = ratingSummary.totalRatings > 0 ? (count / ratingSummary.totalRatings) * 100 : 0;
                    return (
                      <div key={n} className="flex items-center gap-2 text-xs">
                        <span className="w-6 text-right text-zinc-400">{n}★</span>
                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right text-zinc-400 tabular-nums">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <BlogWeeklyStats posts={posts} analyticsData={weeklyAnalytics} />
        </>
      )}
    </div>
  );
}
