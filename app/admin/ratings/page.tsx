"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { fetchAdminRatings, type AdminRating, type PageResponse } from "@/lib/admin-api";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-4 h-4 ${n <= count ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
      ))}
    </div>
  );
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminRatingsPage() {
  const [data, setData] = useState<PageResponse<AdminRating> | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoreFilter, setScoreFilter] = useState<number | undefined>();
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchAdminRatings({ score: scoreFilter, page, size: 20 })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [scoreFilter, page]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a1f14]">Đánh giá</h1>
        <p className="text-zinc-400 text-sm mt-1">Lịch sử đánh giá ứng dụng từ người dùng</p>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={scoreFilter ?? ""}
          onChange={(e) => { setScoreFilter(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Tất cả số sao</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n} sao</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">Đang tải...</div>
      ) : !data || data.content.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">Chưa có đánh giá nào</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 text-xs uppercase">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Người dùng</th>
                  <th className="px-4 py-3 text-left">Số sao</th>
                  <th className="px-4 py-3 text-left">Nhận xét</th>
                  <th className="px-4 py-3 text-left">Ngày đánh giá</th>
                  <th className="px-4 py-3 text-left">Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((r, i) => (
                  <tr key={r.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                    <td className="px-4 py-3 text-zinc-400">{page * 20 + i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#0a1f14]">{r.userName}</div>
                      <div className="text-zinc-400 text-xs">{r.userEmail}</div>
                    </td>
                    <td className="px-4 py-3"><Stars count={r.score} /></td>
                    <td className="px-4 py-3 text-zinc-600 max-w-xs truncate">{r.comment || "—"}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{fmtDate(r.createdAt)}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{fmtDate(r.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-zinc-500">
            <span>Tổng: {data.totalElements} đánh giá</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1.5 rounded-lg border disabled:opacity-30">← Trước</button>
              <span className="px-3 py-1.5">Trang {page + 1} / {data.totalPages || 1}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= (data.totalPages || 1) - 1}
                className="px-3 py-1.5 rounded-lg border disabled:opacity-30">Sau →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
