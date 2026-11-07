import { authFetch } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function uploadImage(file: File, folder = "uploads"): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const res = await authFetch(`${API_URL}/api/admin/upload`, {
    method: "POST",
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Lỗi upload ảnh");
  return (json.result as { url: string }).url;
}

async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await authFetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Lỗi server");
  return json.result as T;
}

// ── Analytics (GA4 Data API via Next.js route handler) ────────────────────

import type {
  TrafficOverview, WeeklyAnalytics, TrafficSource,
  DeviceBreakdown, PagePopularity, DailyUsers,
} from "./ga4-client";

export type {
  TrafficOverview, WeeklyAnalytics, TrafficSource,
  DeviceBreakdown, PagePopularity, DailyUsers,
};

async function analyticsRequest<T>(type: string, params?: Record<string, string>): Promise<T> {
  const sp = new URLSearchParams({ type, ...params });
  const res = await authFetch(`/api/admin/analytics?${sp}`);
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(json.error ?? "Analytics unavailable");
  return json.data as T;
}

export const fetchTrafficOverview = () => analyticsRequest<TrafficOverview>("overview");
export const fetchWeeklyAnalytics = (weeks = 12) => analyticsRequest<WeeklyAnalytics[]>("weekly", { weeks: String(weeks) });
export const fetchTrafficSources = (days = 30) => analyticsRequest<TrafficSource[]>("sources", { days: String(days) });
export const fetchDeviceBreakdown = (days = 30) => analyticsRequest<DeviceBreakdown[]>("devices", { days: String(days) });
export const fetchTopPages = (days = 30, limit = 10) => analyticsRequest<PagePopularity[]>("pages", { days: String(days), limit: String(limit) });
export const fetchDailyActiveUsers = (days = 30) => analyticsRequest<DailyUsers[]>("daily-users", { days: String(days) });

// ── Users ──────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  freeUsers: number;
  basicUsers: number;
  proUsers: number;
  newUsersThisWeek: number;
  totalAdmins: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  /** Ngày thanh toán thành công gần nhất. NULL = chưa từng mua. */
  lastPurchaseAt: string | null;
  /** NULL = không giới hạn (gói tặng tay / tài khoản FREE). */
  planExpiresAt: string | null;
  createdAt: string;
}

export const fetchAdminStats = () => adminRequest<AdminStats>("/api/admin/stats");
export const fetchAdminUsers = () => adminRequest<AdminUser[]>("/api/admin/users");

// Gói và role chỉ theo dõi trên trang admin — không cho cập nhật.

export const deleteUser = (id: string) =>
  adminRequest<void>(`/api/admin/users/${id}`, { method: "DELETE" });

// ── Instruments ────────────────────────────────────────────────────────────

export interface InstrumentAdmin {
  id: string;
  slug: string;
  name: string;
  englishName: string;
  region: string;
  category: string;
  emoji: string;
  color: string;
  imageUrl: string;
  shortDesc: string;
  description: string;
  origin: string;
  material: string;
  soundRange: string;
  difficulty: number;
  popularity: number;
  lessonCount: number;
  facts: string[];
}

export const fetchAdminInstruments = () => adminRequest<InstrumentAdmin[]>("/api/admin/instruments");

export const updateInstrument = (id: string, data: Partial<InstrumentAdmin>) =>
  adminRequest<InstrumentAdmin>(`/api/admin/instruments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// ── Lessons ────────────────────────────────────────────────────────────────

export interface LessonAdmin {
  id: string;
  instrumentId: string;
  instrumentName: string;
  slug: string;
  title: string;
  duration: string;
  level: string;
  description: string;
  steps: string[];
  tips: string[];
  xp: number;
  youtubeUrl: string;
  orderIndex: number;
  /** Gói tối thiểu để mở bài (gating phía backend). */
  requiredPlan: Plan;
  youtubeVideoId: string | null;
  channelName: string | null;
  sourceUrl: string | null;
}

export type Plan = "FREE" | "BASIC" | "PRO";

export const fetchAdminLessons = (instrumentId?: string) =>
  adminRequest<LessonAdmin[]>(`/api/admin/lessons${instrumentId ? `?instrumentId=${instrumentId}` : ""}`);

export const createLesson = (data: Omit<LessonAdmin, "id" | "instrumentName">) =>
  adminRequest<LessonAdmin>("/api/admin/lessons", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateLesson = (id: string, data: Omit<LessonAdmin, "id" | "instrumentName">) =>
  adminRequest<LessonAdmin>(`/api/admin/lessons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteLesson = (id: string) =>
  adminRequest<void>(`/api/admin/lessons/${id}`, { method: "DELETE" });

// ── Songs ──────────────────────────────────────────────────────────────────

/** Tác phẩm — đơn vị để AI chấm phần trình diễn (cần 1 audio mẫu). */
export interface SongAdmin {
  id: string;
  instrumentId: string;
  instrumentName: string;
  title: string;
  artist: string;
  duration: string;
  orderIndex: number;
  /** Gói tối thiểu để được AI chấm tác phẩm này. */
  requiredPlan: Plan;
  scoringReady: boolean;
  referenceAudioUrl: string | null;
  referenceDurationSeconds: number | null;
  sourceUrl: string | null;
  attribution: string | null;
}

export type SongInput = Pick<
  SongAdmin,
  "instrumentId" | "title" | "artist" | "duration" | "orderIndex" | "requiredPlan" | "sourceUrl" | "attribution"
>;

export const fetchAdminSongs = (instrumentId?: string) =>
  adminRequest<SongAdmin[]>(`/api/admin/songs${instrumentId ? `?instrumentId=${instrumentId}` : ""}`);

export const createSong = (data: SongInput) =>
  adminRequest<SongAdmin>("/api/admin/songs", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateSong = (id: string, data: SongInput) =>
  adminRequest<SongAdmin>(`/api/admin/songs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteSong = (id: string) =>
  adminRequest<void>(`/api/admin/songs/${id}`, { method: "DELETE" });

// ── Sheet Music ────────────────────────────────────────────────────────────

export interface SheetMusicAdmin {
  id: string;
  title: string;
  author: string;
  genre: string;
  difficulty: string;
  pages: number;
  isPremium: boolean;
  fileUrl: string;
  description: string;
  instrumentId: string | null;
  instrumentName: string | null;
}

export const fetchAdminSheets = (instrumentId?: string) =>
  adminRequest<SheetMusicAdmin[]>(`/api/admin/sheets${instrumentId ? `?instrumentId=${instrumentId}` : ""}`);

export const createSheet = (data: Omit<SheetMusicAdmin, "id" | "instrumentName">) =>
  adminRequest<SheetMusicAdmin>("/api/admin/sheets", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateSheet = (id: string, data: Omit<SheetMusicAdmin, "id" | "instrumentName">) =>
  adminRequest<SheetMusicAdmin>(`/api/admin/sheets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteSheet = (id: string) =>
  adminRequest<void>(`/api/admin/sheets/${id}`, { method: "DELETE" });

// ── Blog ───────────────────────────────────────────────────────────────────

export interface BlogPostAdmin {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  category: string;
  authorName: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const fetchAdminBlogPosts = () =>
  adminRequest<BlogPostAdmin[]>("/api/admin/blog");

export const createBlogPost = (data: Omit<BlogPostAdmin, "id" | "publishedAt" | "createdAt" | "updatedAt">) =>
  adminRequest<BlogPostAdmin>("/api/admin/blog", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateBlogPost = (id: string, data: Omit<BlogPostAdmin, "id" | "publishedAt" | "createdAt" | "updatedAt">) =>
  adminRequest<BlogPostAdmin>(`/api/admin/blog/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteBlogPost = (id: string) =>
  adminRequest<void>(`/api/admin/blog/${id}`, { method: "DELETE" });

// ── Quiz (câu hỏi ôn tập theo bài học) ─────────────────────────────────────

export type QuestionType = "SINGLE" | "MULTI";

export interface QuizOptionAdmin {
  id?: string;
  text: string;
  correct: boolean;
}

export interface QuizQuestionAdmin {
  id?: string;
  question: string;
  type: QuestionType;
  explanation: string | null;
  options: QuizOptionAdmin[];
}

export const fetchLessonQuiz = (lessonId: string) =>
  adminRequest<{ lessonId: string; questions: QuizQuestionAdmin[] }>(`/api/admin/lessons/${lessonId}/quiz`);

/** Thay toàn bộ quiz của bài học (thứ tự trong mảng = thứ tự hiển thị). */
export const replaceLessonQuiz = (lessonId: string, questions: QuizQuestionAdmin[]) =>
  adminRequest<{ lessonId: string; questions: QuizQuestionAdmin[] }>(`/api/admin/lessons/${lessonId}/quiz`, {
    method: "PUT",
    body: JSON.stringify({
      questions: questions.map((q) => ({
        question: q.question,
        type: q.type,
        explanation: q.explanation || null,
        options: q.options.map((o) => ({ text: o.text, correct: o.correct })),
      })),
    }),
  });

/** Upload audio mẫu → backend lưu R2 + AI trích đường cao độ → tác phẩm chấm điểm được. */
export async function uploadSongReference(id: string, file: File): Promise<SongAdmin> {
  const form = new FormData();
  form.append("file", file);
  const res = await authFetch(`${API_URL}/api/admin/songs/${id}/reference`, { method: "POST", body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Lỗi upload audio mẫu");
  return json.result as SongAdmin;
}

// ── Revenue & Transactions ────────────────────────────────────────────

export interface AdminRevenue {
  totalRevenue: number;
  successCount: number;
  failedCount: number;
  cancelledCount: number;
  pendingCount: number;
  monthly: { month: string; amount: number; count: number }[];
}

export interface AdminTransaction {
  id: string;
  userName: string;
  userEmail: string;
  targetPlan: Plan;
  amount: number;
  status: "PENDING" | "SUCCESS" | "CANCELLED" | "FAILED";
  gatewayReferenceId: string;
  transactionDate: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const fetchRevenueSummary = () =>
  adminRequest<AdminRevenue>("/api/admin/revenue/summary");

export const fetchTransactions = (params?: {
  status?: string;
  plan?: string;
  page?: number;
  size?: number;
}) => {
  const sp = new URLSearchParams();
  if (params?.status) sp.set("status", params.status);
  if (params?.plan) sp.set("plan", params.plan);
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  const qs = sp.toString();
  return adminRequest<PageResponse<AdminTransaction>>(
    `/api/admin/transactions${qs ? `?${qs}` : ""}`
  );
};

// ── Ratings ───────────────────────────────────────────────────────────

export interface AdminRating {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  score: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RatingSummary {
  averageScore: number;
  totalRatings: number;
  distribution: Record<number, number>;
}

export const fetchRatingSummary = () =>
  adminRequest<RatingSummary>("/api/admin/ratings/summary");

export const fetchAdminRatings = (params?: { score?: number; page?: number; size?: number }) => {
  const sp = new URLSearchParams();
  if (params?.score != null) sp.set("score", String(params.score));
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.size != null) sp.set("size", String(params.size));
  const qs = sp.toString();
  return adminRequest<PageResponse<AdminRating>>(`/api/admin/ratings${qs ? `?${qs}` : ""}`);
};
