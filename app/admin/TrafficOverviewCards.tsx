"use client";

import { Activity, Users, UserPlus, Eye, TrendingUp, TrendingDown } from "lucide-react";
import type { TrafficOverview } from "@/lib/admin-api";

function pctChange(current: number, prev: number): number | null {
  if (prev === 0) return current > 0 ? 100 : null;
  return Math.round(((current - prev) / prev) * 100);
}

function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-xs text-zinc-300">—</span>;
  const positive = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {positive ? "+" : ""}{pct}%
    </span>
  );
}

const cards = [
  { key: "sessions" as const, prevKey: "sessionsPrev" as const, label: "Sessions", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50" },
  { key: "activeUsers" as const, prevKey: "activeUsersPrev" as const, label: "Active Users", icon: Users, color: "text-sky-500", bg: "bg-sky-50" },
  { key: "newUsers" as const, prevKey: "newUsersPrev" as const, label: "New Users", icon: UserPlus, color: "text-violet-500", bg: "bg-violet-50" },
  { key: "pageviews" as const, prevKey: "pageviewsPrev" as const, label: "Pageviews", icon: Eye, color: "text-cyan-500", bg: "bg-cyan-50" },
];

export default function TrafficOverviewCards({ data }: { data: TrafficOverview }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <div key={c.key} className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
          <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
            <c.icon className={`w-5 h-5 ${c.color}`} strokeWidth={1.5} />
          </div>
          <p className="text-2xl font-bold text-[#0a1f14]">
            {data[c.key].toLocaleString("vi-VN")}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-zinc-400 text-sm">{c.label}</p>
            <ChangeBadge pct={pctChange(data[c.key], data[c.prevKey])} />
          </div>
        </div>
      ))}
    </div>
  );
}
