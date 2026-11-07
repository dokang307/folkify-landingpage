import { NextRequest, NextResponse } from "next/server";
import {
  getTrafficOverview,
  getWeeklyBlogAnalytics,
  getTrafficSources,
  getDeviceBreakdown,
  getTopPages,
  getDailyActiveUsers,
} from "@/lib/ga4-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  try {
    const res = await fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: auth },
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json.result?.role === "ADMIN";
  } catch {
    return false;
  }
}

function ok(data: unknown) {
  return NextResponse.json({ ok: true, data }, {
    headers: { "Cache-Control": "private, max-age=600" },
  });
}

function fail(error: string, status = 500) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) return fail("Unauthorized", 401);

  const type = req.nextUrl.searchParams.get("type");

  try {
    switch (type) {
      case "overview":
        return ok(await getTrafficOverview());

      case "weekly": {
        const weeks = parseInt(req.nextUrl.searchParams.get("weeks") ?? "12", 10);
        return ok(await getWeeklyBlogAnalytics(Math.min(weeks, 52)));
      }

      case "sources": {
        const days = parseInt(req.nextUrl.searchParams.get("days") ?? "30", 10);
        return ok(await getTrafficSources(Math.min(days, 90)));
      }

      case "devices": {
        const days = parseInt(req.nextUrl.searchParams.get("days") ?? "30", 10);
        return ok(await getDeviceBreakdown(Math.min(days, 90)));
      }

      case "pages": {
        const days = parseInt(req.nextUrl.searchParams.get("days") ?? "30", 10);
        const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "10", 10);
        return ok(await getTopPages(Math.min(days, 90), Math.min(limit, 50)));
      }

      case "daily-users": {
        const days = parseInt(req.nextUrl.searchParams.get("days") ?? "30", 10);
        return ok(await getDailyActiveUsers(Math.min(days, 90)));
      }

      default:
        return fail("Invalid type parameter", 400);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "GA4 query failed";
    console.error("[analytics]", msg);
    return fail(msg, 502);
  }
}
