import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GoogleAuth } from "google-auth-library";

// ── Types ──────────────────────────────────────────────────────────────────

export interface TrafficOverview {
  sessions: number;
  activeUsers: number;
  newUsers: number;
  pageviews: number;
  sessionsPrev: number;
  activeUsersPrev: number;
  newUsersPrev: number;
  pageviewsPrev: number;
}

export interface WeeklyAnalytics {
  weekStart: string;
  sessions: number;
  blogPageviews: number;
  ctaClicks: number;
  avgEngagementTime: number;
}

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
}

export interface DeviceBreakdown {
  category: string;
  sessions: number;
  percentage: number;
}

export interface PagePopularity {
  pagePath: string;
  pageTitle: string;
  pageviews: number;
  activeUsers: number;
}

export interface DailyUsers {
  date: string;
  activeUsers: number;
}

// ── Cache ──────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { data: unknown; expiry: number }>();

function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) return Promise.resolve(entry.data as T);
  return fn().then((data) => {
    cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
    return data;
  });
}

// ── Client ─────────────────────────────────────────────────────────────────

let _client: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient {
  if (_client) return _client;
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) {
    throw new Error("GA4 credentials not configured");
  }
  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  _client = new BetaAnalyticsDataClient({ auth });
  return _client;
}

function propertyId(): string {
  const id = process.env.GA4_PROPERTY_ID;
  if (!id) throw new Error("GA4_PROPERTY_ID not set");
  return `properties/${id}`;
}

function num(val: string | null | undefined): number {
  return parseInt(val ?? "0", 10) || 0;
}

// ── Queries ────────────────────────────────────────────────────────────────

export async function getTrafficOverview(): Promise<TrafficOverview> {
  return cached("overview", async () => {
    const [response] = await getClient().runReport({
      property: propertyId(),
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "screenPageViews" },
      ],
      dateRanges: [
        { startDate: "7daysAgo", endDate: "today" },
        { startDate: "14daysAgo", endDate: "8daysAgo" },
      ],
    });
    const current = response.rows?.[0]?.metricValues ?? [];
    const prev = response.rows?.[1]?.metricValues ?? [];
    return {
      sessions: num(current[0]?.value),
      activeUsers: num(current[1]?.value),
      newUsers: num(current[2]?.value),
      pageviews: num(current[3]?.value),
      sessionsPrev: num(prev[0]?.value),
      activeUsersPrev: num(prev[1]?.value),
      newUsersPrev: num(prev[2]?.value),
      pageviewsPrev: num(prev[3]?.value),
    };
  });
}

export async function getWeeklyBlogAnalytics(weeks: number): Promise<WeeklyAnalytics[]> {
  return cached(`weekly-${weeks}`, async () => {
    const days = weeks * 7;
    const startDate = `${days}daysAgo`;
    const client = getClient();
    const prop = propertyId();

    const [sessionsRes] = await client.runReport({
      property: prop,
      metrics: [
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
      ],
      dimensions: [{ name: "date" }],
      dateRanges: [{ startDate, endDate: "today" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: "/blog" },
        },
      },
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const [ctaRes] = await client.runReport({
      property: prop,
      metrics: [{ name: "eventCount" }],
      dimensions: [{ name: "date" }],
      dateRanges: [{ startDate, endDate: "today" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: "app_store_cta_click" },
        },
      },
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const blogByDate = new Map<string, { sessions: number; pageviews: number; duration: number }>();
    for (const row of sessionsRes.rows ?? []) {
      const date = row.dimensionValues?.[0]?.value ?? "";
      blogByDate.set(date, {
        sessions: num(row.metricValues?.[0]?.value),
        pageviews: num(row.metricValues?.[1]?.value),
        duration: parseFloat(row.metricValues?.[2]?.value ?? "0") || 0,
      });
    }

    const ctaByDate = new Map<string, number>();
    for (const row of ctaRes.rows ?? []) {
      const date = row.dimensionValues?.[0]?.value ?? "";
      ctaByDate.set(date, num(row.metricValues?.[0]?.value));
    }

    const weekMap = new Map<string, WeeklyAnalytics>();
    const allDates = new Set([...blogByDate.keys(), ...ctaByDate.keys()]);

    for (const dateStr of allDates) {
      const y = parseInt(dateStr.slice(0, 4));
      const m = parseInt(dateStr.slice(4, 6)) - 1;
      const d = parseInt(dateStr.slice(6, 8));
      const date = new Date(y, m, d);
      const weekday = (date.getDay() + 6) % 7;
      const monday = new Date(date);
      monday.setDate(monday.getDate() - weekday);
      const weekKey = monday.toISOString().slice(0, 10);

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { weekStart: weekKey, sessions: 0, blogPageviews: 0, ctaClicks: 0, avgEngagementTime: 0 });
      }
      const week = weekMap.get(weekKey)!;
      const blog = blogByDate.get(dateStr);
      if (blog) {
        week.sessions += blog.sessions;
        week.blogPageviews += blog.pageviews;
        week.avgEngagementTime += blog.duration * blog.sessions;
      }
      week.ctaClicks += ctaByDate.get(dateStr) ?? 0;
    }

    for (const week of weekMap.values()) {
      if (week.sessions > 0) {
        week.avgEngagementTime = Math.round(week.avgEngagementTime / week.sessions);
      }
    }

    return Array.from(weekMap.values()).sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  });
}

export async function getTrafficSources(days: number): Promise<TrafficSource[]> {
  return cached(`sources-${days}`, async () => {
    const [response] = await getClient().runReport({
      property: propertyId(),
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    });
    return (response.rows ?? []).map((row) => ({
      source: row.dimensionValues?.[0]?.value ?? "(direct)",
      medium: row.dimensionValues?.[1]?.value ?? "(none)",
      sessions: num(row.metricValues?.[0]?.value),
      users: num(row.metricValues?.[1]?.value),
    }));
  });
}

export async function getDeviceBreakdown(days: number): Promise<DeviceBreakdown[]> {
  return cached(`devices-${days}`, async () => {
    const [response] = await getClient().runReport({
      property: propertyId(),
      metrics: [{ name: "sessions" }],
      dimensions: [{ name: "deviceCategory" }],
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    });
    const rows = (response.rows ?? []).map((row) => ({
      category: row.dimensionValues?.[0]?.value ?? "unknown",
      sessions: num(row.metricValues?.[0]?.value),
      percentage: 0,
    }));
    const total = rows.reduce((s, r) => s + r.sessions, 0) || 1;
    for (const r of rows) r.percentage = Math.round((r.sessions / total) * 1000) / 10;
    return rows.sort((a, b) => b.sessions - a.sessions);
  });
}

export async function getTopPages(days: number, limit: number): Promise<PagePopularity[]> {
  return cached(`pages-${days}-${limit}`, async () => {
    const [response] = await getClient().runReport({
      property: propertyId(),
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit,
    });
    return (response.rows ?? []).map((row) => ({
      pagePath: row.dimensionValues?.[0]?.value ?? "/",
      pageTitle: row.dimensionValues?.[1]?.value ?? "",
      pageviews: num(row.metricValues?.[0]?.value),
      activeUsers: num(row.metricValues?.[1]?.value),
    }));
  });
}

export async function getDailyActiveUsers(days: number): Promise<DailyUsers[]> {
  return cached(`daily-${days}`, async () => {
    const [response] = await getClient().runReport({
      property: propertyId(),
      metrics: [{ name: "activeUsers" }],
      dimensions: [{ name: "date" }],
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });
    return (response.rows ?? []).map((row) => ({
      date: row.dimensionValues?.[0]?.value ?? "",
      activeUsers: num(row.metricValues?.[0]?.value),
    }));
  });
}
