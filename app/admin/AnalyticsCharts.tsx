"use client";

import { Globe, Monitor, Smartphone, Tablet } from "lucide-react";
import type { DailyUsers, TrafficSource, DeviceBreakdown, PagePopularity } from "@/lib/admin-api";

// ── Daily Users Chart ──────────────────────────────────────────────────────

function formatDate(yyyymmdd: string) {
  return `${yyyymmdd.slice(6, 8)}/${yyyymmdd.slice(4, 6)}`;
}

export function DailyUsersChart({ data }: { data: DailyUsers[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.activeUsers), 1);
  const h = 160;
  const w = 100;
  const stepX = w / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => `${(i * stepX).toFixed(1)},${(h - (d.activeUsers / max) * h).toFixed(1)}`);
  const linePath = `M${points.join("L")}`;
  const areaPath = `${linePath}L${((data.length - 1) * stepX).toFixed(1)},${h}L0,${h}Z`;

  const tickCount = 5;
  const labelInterval = Math.max(1, Math.floor(data.length / tickCount));

  return (
    <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm mb-6">
      <h3 className="text-sm font-medium text-zinc-500 mb-4">Active Users — 30 ngày</h3>
      <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="auGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#auGrad)" />
        <path d={linePath} fill="none" stroke="#34d399" strokeWidth="0.6" />
        {data.map((d, i) =>
          i % labelInterval === 0 || i === data.length - 1 ? (
            <text key={i} x={i * stepX} y={h + 12} textAnchor="middle" className="fill-zinc-400" style={{ fontSize: "3.5px" }}>
              {formatDate(d.date)}
            </text>
          ) : null,
        )}
      </svg>
      <div className="flex justify-between text-xs text-zinc-400 mt-1">
        <span>Min: {Math.min(...data.map((d) => d.activeUsers))}</span>
        <span>Max: {max}</span>
      </div>
    </div>
  );
}

// ── Traffic Sources ────────────────────────────────────────────────────────

export function TrafficSourcesTable({ data }: { data: TrafficSource[] }) {
  if (data.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-50">
        <h3 className="text-sm font-medium text-zinc-500">Nguồn truy cập</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-50">
              <th className="text-left px-3 py-2 text-xs font-semibold text-zinc-400 uppercase">Source / Medium</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-zinc-400 uppercase">Sessions</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-zinc-400 uppercase">Users</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {data.map((s) => (
              <tr key={`${s.source}-${s.medium}`} className="hover:bg-zinc-50/50">
                <td className="px-3 py-2 text-[#0a1f14] whitespace-nowrap">
                  <span className="font-medium">{s.source}</span>
                  <span className="text-zinc-400"> / {s.medium}</span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-zinc-600">{s.sessions.toLocaleString()}</td>
                <td className="px-3 py-2 text-right tabular-nums text-zinc-600">{s.users.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Device Breakdown ───────────────────────────────────────────────────────

const deviceIcons: Record<string, typeof Monitor> = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };
const deviceColors: Record<string, string> = { desktop: "bg-sky-400", mobile: "bg-emerald-400", tablet: "bg-amber-400" };

export function DeviceBreakdownBars({ data }: { data: DeviceBreakdown[] }) {
  if (data.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
      <h3 className="text-sm font-medium text-zinc-500 mb-4">Thiết bị</h3>
      <div className="space-y-3">
        {data.map((d) => {
          const Icon = deviceIcons[d.category] ?? Globe;
          const barColor = deviceColors[d.category] ?? "bg-zinc-400";
          return (
            <div key={d.category} className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#0a1f14] capitalize">{d.category}</span>
                  <span className="text-zinc-400 tabular-nums">{d.percentage}%</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${d.percentage}%` }} />
                </div>
              </div>
              <span className="text-xs text-zinc-400 tabular-nums w-12 text-right">{d.sessions.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Top Pages ──────────────────────────────────────────────────────────────

export function TopPagesTable({ data }: { data: PagePopularity[] }) {
  if (data.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden mb-6">
      <div className="px-4 py-3 border-b border-zinc-50">
        <h3 className="text-sm font-medium text-zinc-500">Trang phổ biến — 30 ngày</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-50">
              <th className="text-left px-3 py-2 text-xs font-semibold text-zinc-400 uppercase">Trang</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-zinc-400 uppercase">Views</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-zinc-400 uppercase">Users</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {data.map((p) => (
              <tr key={p.pagePath} className="hover:bg-zinc-50/50">
                <td className="px-3 py-2 min-w-0">
                  <p className="text-[#0a1f14] truncate max-w-[200px] sm:max-w-[300px]" title={p.pagePath}>{p.pagePath}</p>
                  {p.pageTitle && <p className="text-xs text-zinc-400 truncate max-w-[200px] sm:max-w-[300px]">{p.pageTitle}</p>}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-zinc-600">{p.pageviews.toLocaleString()}</td>
                <td className="px-3 py-2 text-right tabular-nums text-zinc-600">{p.activeUsers.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
