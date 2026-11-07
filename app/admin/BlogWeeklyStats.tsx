"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BlogPostAdmin, WeeklyAnalytics } from "@/lib/admin-api";

const PAGE_SIZE = 10;

const TH_CLASS =
  "text-left px-3 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide whitespace-nowrap";

const ANALYTICS_COLUMNS = [
  "Website Sessions",
  "Blog Pageviews",
  "App Store CTA Clicks",
  "Average Engagement Time",
] as const;

function fmtDuration(seconds: number): string {
  if (seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

type AnalyticsRow = Record<(typeof ANALYTICS_COLUMNS)[number], string>;

function matchAnalytics(weekStart: Date, analytics: WeeklyAnalytics[] | null | undefined): AnalyticsRow | null {
  if (!analytics) return null;
  const key = weekStart.toISOString().slice(0, 10);
  const match = analytics.find((a) => a.weekStart === key);
  if (!match) return null;
  return {
    "Website Sessions": String(match.sessions),
    "Blog Pageviews": String(match.blogPageviews),
    "App Store CTA Clicks": String(match.ctaClicks),
    "Average Engagement Time": fmtDuration(match.avgEngagementTime),
  };
}

/** dd/MM — không dùng Intl vì locale vi-VN trả về "29-12", lẫn với dấu nối khoảng tuần. */
function dayMonth(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

/** Thứ Hai của tuần chứa `date`, chuẩn hoá về 00:00 giờ địa phương. */
function startOfWeek(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = (d.getDay() + 6) % 7; // Chủ nhật = 0 -> 6, thứ Hai = 1 -> 0
  d.setDate(d.getDate() - weekday);
  return d;
}

function weekLabel(monday: Date) {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return `${dayMonth(monday)} – ${dayMonth(sunday)}/${String(sunday.getFullYear()).slice(2)}`;
}

export default function BlogWeeklyStats({ posts, analyticsData }: { posts: BlogPostAdmin[]; analyticsData?: WeeklyAnalytics[] | null }) {
  const [page, setPage] = useState(1);

  // Chỉ tính bài đã đăng — bài nháp chưa có publishedAt nên không thuộc tuần nào.
  const weeks = useMemo(() => {
    const countByWeek = new Map<number, number>();
    let earliest = Infinity;
    let latest = -Infinity;

    for (const post of posts) {
      if (!post.publishedAt) continue;
      const week = startOfWeek(new Date(post.publishedAt)).getTime();
      countByWeek.set(week, (countByWeek.get(week) ?? 0) + 1);
      if (week < earliest) earliest = week;
      if (week > latest) latest = week;
    }

    if (countByWeek.size === 0) return [];

    // Đi ngược từ tuần mới nhất về tuần có bài đầu tiên, tuần không có bài vẫn
    // hiện số 0 để nhìn ra được quãng ngưng đăng.
    const currentWeek = startOfWeek(new Date()).getTime();
    const cursor = new Date(Math.max(currentWeek, latest));
    const rows: { start: Date; posts: number }[] = [];

    while (cursor.getTime() >= earliest) {
      rows.push({ start: new Date(cursor), posts: countByWeek.get(cursor.getTime()) ?? 0 });
      cursor.setDate(cursor.getDate() - 7);
    }
    return rows;
  }, [posts]);

  const totalPages = Math.max(1, Math.ceil(weeks.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paged = weeks.slice(startIndex, startIndex + PAGE_SIZE);

  const totalPosts = weeks.reduce((sum, w) => sum + w.posts, 0);

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden mb-6">
      <div className="px-4 py-3 border-b border-zinc-50">
        <h2 className="text-sm font-semibold text-[#0a1f14]">Thống kê theo tuần</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          {weeks.length} tuần · {totalPosts} bài đã đăng
        </p>
      </div>

      {weeks.length === 0 ? (
        <div className="px-4 py-10 text-center text-zinc-400 text-sm">
          Chưa có bài viết nào được đăng
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-50">
                  <th className={TH_CLASS}>Week</th>
                  <th className={TH_CLASS}>Blog Posts</th>
                  {ANALYTICS_COLUMNS.map((label) => (
                    <th key={label} className={TH_CLASS}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {paged.map((week) => {
                  const metrics = matchAnalytics(week.start, analyticsData);

                  return (
                    <tr key={week.start.getTime()} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-3 py-3 text-xs text-zinc-500 whitespace-nowrap tabular-nums">
                        {weekLabel(week.start)}
                      </td>
                      <td className="px-3 py-3 text-sm font-medium text-[#0a1f14] tabular-nums">
                        {week.posts}
                      </td>
                      {ANALYTICS_COLUMNS.map((label) => (
                        <td
                          key={label}
                          className={
                            metrics
                              ? "px-3 py-3 text-xs text-zinc-500 tabular-nums whitespace-nowrap"
                              : "px-3 py-3 text-zinc-300 text-xs"
                          }
                        >
                          {metrics ? metrics[label] : "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-zinc-50 flex items-center justify-between gap-3">
            <p className="text-xs text-zinc-400">
              {startIndex + 1}–{startIndex + paged.length} / {weeks.length} tuần
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs text-zinc-500 px-2 tabular-nums">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
