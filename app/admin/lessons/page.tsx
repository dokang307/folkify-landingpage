"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, BookOpen, ListChecks } from "lucide-react";
import { toast } from "sonner";
import {
  fetchAdminInstruments, fetchAdminLessons, createLesson, updateLesson, deleteLesson,
  type InstrumentAdmin, type LessonAdmin, type Plan,
} from "@/lib/admin-api";
import QuizEditor from "./QuizEditor";

// Giá trị lưu DB là tiếng Anh (web/app nhóm lộ trình theo giá trị này); nhãn hiển thị tiếng Việt
const LEVELS = [
  { value: "Beginner", label: "Cơ bản" },
  { value: "Intermediate", label: "Trung cấp" },
  { value: "Advanced", label: "Nâng cao" },
];
const levelLabel = (v: string) => LEVELS.find((l) => l.value === v)?.label ?? v;

const PLANS: { value: Plan; label: string }[] = [
  { value: "FREE", label: "Miễn phí" },
  { value: "BASIC", label: "Basic" },
  { value: "PRO", label: "Premium" },
];

const emptyLesson = (): Omit<LessonAdmin, "id" | "instrumentName"> => ({
  instrumentId: "",
  slug: "",
  title: "",
  duration: "",
  level: "Beginner",
  description: "",
  steps: [],
  tips: [],
  xp: 10,
  youtubeUrl: "",
  orderIndex: 0,
  requiredPlan: "FREE",
  youtubeVideoId: "",
  channelName: "",
  sourceUrl: "",
});

export default function LessonsPage() {
  const [instruments, setInstruments] = useState<InstrumentAdmin[]>([]);
  const [lessons, setLessons] = useState<LessonAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterInstrument, setFilterInstrument] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyLesson());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [quizLesson, setQuizLesson] = useState<LessonAdmin | null>(null);

  useEffect(() => {
    Promise.all([fetchAdminInstruments(), fetchAdminLessons()])
      .then(([insts, lsns]) => {
        setInstruments(insts);
        setLessons(lsns);
        if (insts.length) setForm((f) => ({ ...f, instrumentId: insts[0].id }));
      })
      .catch(() => toast.error("Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterInstrument
    ? lessons.filter((l) => l.instrumentId === filterInstrument)
    : lessons;

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyLesson(), instrumentId: instruments[0]?.id ?? "" });
    setShowForm(true);
  };

  const openEdit = (l: LessonAdmin) => {
    setEditId(l.id);
    setForm({
      instrumentId: l.instrumentId,
      slug: l.slug,
      title: l.title,
      duration: l.duration,
      level: l.level,
      description: l.description,
      steps: l.steps,
      tips: l.tips,
      xp: l.xp,
      youtubeUrl: l.youtubeUrl,
      orderIndex: l.orderIndex,
      requiredPlan: l.requiredPlan ?? "FREE",
      youtubeVideoId: l.youtubeVideoId ?? "",
      channelName: l.channelName ?? "",
      sourceUrl: l.sourceUrl ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.instrumentId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateLesson(editId, form);
        setLessons((prev) => prev.map((l) => (l.id === editId ? updated : l)));
        toast.success("Cập nhật bài học thành công");
      } else {
        const created = await createLesson(form);
        setLessons((prev) => [...prev, created]);
        toast.success("Tạo bài học thành công");
      }
      setShowForm(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLesson(id);
      setLessons((prev) => prev.filter((l) => l.id !== id));
      toast.success("Xóa bài học thành công");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi xóa");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <div className="text-zinc-400 text-sm">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0a1f14]">Bài học</h1>
          <p className="text-zinc-400 text-sm mt-1">{lessons.length} bài học</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-xl transition-colors"
          style={{ background: "linear-gradient(135deg,#52b788,#2d6a4f)" }}
        >
          <Plus className="w-4 h-4" />
          Thêm bài học
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterInstrument}
          onChange={(e) => setFilterInstrument(e.target.value)}
          className="text-sm border border-zinc-200 rounded-xl px-3 py-2 bg-white text-[#0a1f14] focus:outline-none focus:ring-2 focus:ring-[#52b788]/30"
        >
          <option value="">Tất cả nhạc cụ</option>
          {instruments.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Tên bài học</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Nhạc cụ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Cấp độ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Gói</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">XP</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Thứ tự</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-zinc-400 text-sm py-10">Chưa có bài học nào</td>
              </tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-zinc-50/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#52b788] flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="font-medium text-[#0a1f14]">{l.title}</p>
                      <p className="text-xs text-zinc-400">{l.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-600">{l.instrumentName}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{levelLabel(l.level)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${l.requiredPlan === "PRO" ? "bg-amber-100 text-amber-700" : l.requiredPlan === "BASIC" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {PLANS.find((p) => p.value === l.requiredPlan)?.label ?? "Miễn phí"}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600">{l.xp} XP</td>
                <td className="px-4 py-3 text-zinc-400">{l.orderIndex}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setQuizLesson(l)} title="Câu hỏi ôn tập" className="text-zinc-400 hover:text-[#52b788] transition-colors">
                      <ListChecks className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(l)} className="text-zinc-400 hover:text-[#52b788] transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {deleteId === l.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(l.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Xóa</button>
                        <button onClick={() => setDeleteId(null)} className="text-xs text-zinc-400 hover:text-zinc-600">Hủy</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(l.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="font-semibold text-[#0a1f14]">{editId ? "Sửa bài học" : "Thêm bài học"}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Nhạc cụ *</label>
                <select
                  value={form.instrumentId}
                  onChange={(e) => setForm((f) => ({ ...f, instrumentId: e.target.value }))}
                  className="text-sm border border-zinc-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#52b788]/30"
                >
                  {instruments.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              {[
                ["Tên bài học *", "title", "text"],
                ["Slug *", "slug", "text"],
                ["Thời lượng", "duration", "text"],
                ["YouTube URL", "youtubeUrl", "text"],
                ["YouTube Video ID (11 ký tự)", "youtubeVideoId", "text"],
                ["Tên kênh YouTube", "channelName", "text"],
                ["Link nguồn", "sourceUrl", "text"],
              ].map(([label, key, type]) => (
                <div key={key}>
                  <label className="text-xs font-medium text-zinc-500 block mb-1">{label}</label>
                  <input
                    type={type}
                    value={(form[key as keyof typeof form] as string) ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="text-sm border border-zinc-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#52b788]/30"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Cấp độ</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                  className="text-sm border border-zinc-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#52b788]/30"
                >
                  {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Gói tối thiểu để mở bài</label>
                <select
                  value={form.requiredPlan}
                  onChange={(e) => setForm((f) => ({ ...f, requiredPlan: e.target.value as Plan }))}
                  className="text-sm border border-zinc-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#52b788]/30"
                >
                  {PLANS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1">XP</label>
                  <input
                    type="number" min={0}
                    value={form.xp}
                    onChange={(e) => setForm((f) => ({ ...f, xp: Number(e.target.value) }))}
                    className="text-sm border border-zinc-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#52b788]/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1">Thứ tự</label>
                  <input
                    type="number" min={0}
                    value={form.orderIndex}
                    onChange={(e) => setForm((f) => ({ ...f, orderIndex: Number(e.target.value) }))}
                    className="text-sm border border-zinc-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#52b788]/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Mô tả</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="text-sm border border-zinc-200 rounded-xl px-3 py-2 w-full resize-none focus:outline-none focus:ring-2 focus:ring-[#52b788]/30"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Các bước (mỗi dòng 1 bước)</label>
                <textarea
                  rows={3}
                  value={form.steps.join("\n")}
                  onChange={(e) => setForm((f) => ({ ...f, steps: e.target.value.split("\n").filter(Boolean) }))}
                  className="text-sm border border-zinc-200 rounded-xl px-3 py-2 w-full resize-none focus:outline-none focus:ring-2 focus:ring-[#52b788]/30"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Tips (mỗi dòng 1 tip)</label>
                <textarea
                  rows={2}
                  value={form.tips.join("\n")}
                  onChange={(e) => setForm((f) => ({ ...f, tips: e.target.value.split("\n").filter(Boolean) }))}
                  className="text-sm border border-zinc-200 rounded-xl px-3 py-2 w-full resize-none focus:outline-none focus:ring-2 focus:ring-[#52b788]/30"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-zinc-500 hover:text-zinc-700 px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-xl disabled:opacity-50 transition-colors"
                style={{ background: "linear-gradient(135deg,#52b788,#2d6a4f)" }}
              >
                <Check className="w-4 h-4" />
                {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {quizLesson && (
        <QuizEditor lessonId={quizLesson.id} lessonTitle={quizLesson.title} onClose={() => setQuizLesson(null)} />
      )}
    </div>
  );
}
