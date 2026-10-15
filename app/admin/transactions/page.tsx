"use client";

import { useEffect, useState } from "react";
import { fetchTransactions, type AdminTransaction, type PageResponse } from "@/lib/admin-api";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  SUCCESS: { text: "Thành công", cls: "bg-green-100 text-green-700" },
  FAILED: { text: "Thất bại", cls: "bg-red-100 text-red-700" },
  CANCELLED: { text: "Đã hủy", cls: "bg-zinc-100 text-zinc-500" },
  PENDING: { text: "Đang chờ", cls: "bg-yellow-100 text-yellow-700" },
};

const PLAN_LABEL: Record<string, string> = { BASIC: "Basic", PRO: "Pro" };

function fmtVND(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TransactionsPage() {
  const [data, setData] = useState<PageResponse<AdminTransaction> | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchTransactions({ status: status || undefined, plan: plan || undefined, page, size: 20 })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, plan, page]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a1f14]">Giao dịch</h1>
        <p className="text-zinc-400 text-sm mt-1">Lịch sử thanh toán PayOS</p>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Tất cả trạng thái</option>
          <option value="SUCCESS">Thành công</option>
          <option value="FAILED">Thất bại</option>
          <option value="CANCELLED">Đã hủy</option>
          <option value="PENDING">Đang chờ</option>
        </select>
        <select value={plan} onChange={(e) => { setPlan(e.target.value); setPage(0); }}
          className="border rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Tất cả gói</option>
          <option value="BASIC">Basic</option>
          <option value="PRO">Pro</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">Đang tải...</div>
      ) : !data || data.content.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">Chưa có giao dịch nào</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 text-xs uppercase">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Người dùng</th>
                  <th className="px-4 py-3 text-left">Gói</th>
                  <th className="px-4 py-3 text-right">Số tiền</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Mã GD</th>
                  <th className="px-4 py-3 text-left">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((t, i) => (
                  <tr key={t.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                    <td className="px-4 py-3 text-zinc-400">{page * 20 + i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#0a1f14]">{t.userName}</div>
                      <div className="text-zinc-400 text-xs">{t.userEmail}</div>
                    </td>
                    <td className="px-4 py-3">{PLAN_LABEL[t.targetPlan] ?? t.targetPlan}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{fmtVND(t.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_LABEL[t.status]?.cls ?? ""}`}>
                        {STATUS_LABEL[t.status]?.text ?? t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{t.gatewayReferenceId}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{t.transactionDate ? fmtDate(t.transactionDate) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-zinc-500">
            <span>Tổng: {data.totalElements} giao dịch</span>
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
