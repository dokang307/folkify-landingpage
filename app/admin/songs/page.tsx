"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Music2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  createSong,
  deleteSong,
  fetchAdminInstruments,
  fetchAdminSongs,
  updateSong,
  uploadSongReference,
  type InstrumentAdmin,
  type Plan,
  type SongAdmin,
  type SongInput,
} from "@/lib/admin-api";

const inputCls =
  "text-sm border border-zinc-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#52b788]/30";
const MAX_UPLOAD_MB = 25; // khớp AI_MAX_UPLOAD_BYTES phía backend
const PLANS: { value: Plan; label: string }[] = [
  { value: "FREE", label: "Miễn phí" },
  { value: "BASIC", label: "Basic" },
  { value: "PRO", label: "Premium" },
];

const emptySong = (instrumentId = ""): SongInput => ({
  instrumentId,
  title: "",
  artist: "",
  duration: "",
  orderIndex: 0,
  requiredPlan: "BASIC",
  sourceUrl: "",
  attribution: "",
});

function clock(seconds: number | null): string {
  if (!seconds) return "";
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function SongsPage() {
  const [instruments, setInstruments] = useState<InstrumentAdmin[]>([]);
  const [songs, setSongs] = useState<SongAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterInstrument, setFilterInstrument] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SongInput>(emptySong());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<string | null>(null);

  useEffect(() => {
    Promise.all([fetchAdminInstruments(), fetchAdminSongs()])
      .then(([insts, sgs]) => {
        setInstruments(insts);
        setSongs(sgs);
      })
      .catch(() => toast.error("Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterInstrument ? songs.filter((s) => s.instrumentId === filterInstrument) : songs;
  const readyCount = songs.filter((s) => s.scoringReady).length;

  const openCreate = () => {
    setEditId(null);
    setForm(emptySong(filterInstrument || instruments[0]?.id || ""));
    setShowForm(true);
  };

  const openEdit = (s: SongAdmin) => {
    setEditId(s.id);
    setForm({
      instrumentId: s.instrumentId,
      title: s.title,
      artist: s.artist ?? "",
      duration: s.duration ?? "",
      orderIndex: s.orderIndex,
      requiredPlan: s.requiredPlan ?? "BASIC",
      sourceUrl: s.sourceUrl ?? "",
      attribution: s.attribution ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.instrumentId) {
      toast.error("Vui lòng nhập tên tác phẩm và chọn nhạc cụ");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateSong(editId, form);
        setSongs((prev) => prev.map((x) => (x.id === editId ? updated : x)));
        toast.success("Đã cập nhật tác phẩm");
      } else {
        const created = await createSong(form);
        setSongs((prev) => [...prev, created]);
        toast.success("Đã tạo tác phẩm — hãy upload audio mẫu để AI chấm được");
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
      await deleteSong(id);
      setSongs((prev) => prev.filter((x) => x.id !== id));
      toast.success("Đã xóa tác phẩm");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi xóa");
    } finally {
      setDeleteId(null);
    }
  };

  const pickReference = (id: string) => {
    uploadTarget.current = id;
    fileInput.current?.click();
  };

  const handleReference = async (file: File | undefined) => {
    const id = uploadTarget.current;
    if (!file || !id) return;
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      toast.error(`File quá lớn (tối đa ${MAX_UPLOAD_MB} MB) — hãy dùng mp3/m4a thay cho wav`);
      return;
    }
    setUploadingId(id);
    try {
      const updated = await uploadSongReference(id, file);
      setSongs((prev) => prev.map((x) => (x.id === id ? updated : x)));
      toast.success("Đã phân tích audio mẫu — tác phẩm sẵn sàng chấm điểm");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi upload audio mẫu");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div className="text-zinc-400 text-sm">Đang tải...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0a1f14]">Tác phẩm</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {songs.length} tác phẩm · {readyCount} có bản mẫu. Học viên chơi một đoạn hoặc cả bài, AI so với bản mẫu để chấm điểm.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-xl transition-colors"
          style={{ background: "linear-gradient(135deg,#52b788,#2d6a4f)" }}
        >
          <Plus className="w-4 h-4" />
          Thêm tác phẩm
        </button>
      </div>

      <div className="mb-4">
        <select value={filterInstrument} onChange={(e) => setFilterInstrument(e.target.value)} className={`${inputCls} w-auto bg-white`}>
          <option value="">Tất cả nhạc cụ</option>
          {instruments.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Tác phẩm</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Nhạc cụ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Gói chấm AI</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Bản mẫu</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-zinc-400 text-sm py-10">Chưa có tác phẩm nào</td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-50/50 align-top">
                <td className="px-5 py-3">
                  <div className="flex items-start gap-2">
                    <Music2 className="w-4 h-4 mt-0.5 text-[#52b788] flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="font-medium text-[#0a1f14]">{s.title}</p>
                      <p className="text-xs text-zinc-400">{[s.artist, s.duration].filter(Boolean).join(" · ") || "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-600">{s.instrumentName}</td>
                <td className="px-4 py-3 text-zinc-600">{PLANS.find((p) => p.value === s.requiredPlan)?.label ?? "Basic"}</td>
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                        s.scoringReady ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {s.scoringReady ? `Sẵn sàng · ${clock(s.referenceDurationSeconds)}` : "Chưa có bản mẫu"}
                    </span>
                    {s.referenceAudioUrl && <audio src={s.referenceAudioUrl} controls preload="none" className="h-8 w-56" />}
                    {s.attribution && <p className="text-xs text-zinc-400">Nguồn: {s.attribution}</p>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => pickReference(s.id)}
                      disabled={uploadingId !== null}
                      title="Upload audio mẫu (mp3, m4a, wav, ogg, webm) — tối đa 6 phút"
                      className="flex items-center gap-1 text-xs text-[#2d6a4f] border border-[#52b788]/40 rounded-lg px-2 py-1 hover:bg-[#52b788]/5 disabled:opacity-50"
                    >
                      {uploadingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploadingId === s.id ? "Đang phân tích..." : s.scoringReady ? "Thay bản mẫu" : "Upload bản mẫu"}
                    </button>
                    <button onClick={() => openEdit(s)} className="text-zinc-400 hover:text-[#52b788] transition-colors" aria-label="Sửa">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {deleteId === s.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Xóa</button>
                        <button onClick={() => setDeleteId(null)} className="text-xs text-zinc-400 hover:text-zinc-600">Hủy</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(s.id)} className="text-zinc-400 hover:text-red-500 transition-colors" aria-label="Xóa">
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

      <input
        ref={fileInput}
        type="file"
        accept=".mp3,.m4a,.wav,.ogg,.webm,.aac,audio/*"
        className="hidden"
        onChange={(e) => {
          handleReference(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="font-semibold text-[#0a1f14]">{editId ? "Sửa tác phẩm" : "Thêm tác phẩm"}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-600" aria-label="Đóng">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Nhạc cụ *</label>
                <select value={form.instrumentId} onChange={(e) => setForm((f) => ({ ...f, instrumentId: e.target.value }))} className={inputCls}>
                  {instruments.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Tên tác phẩm *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="VD: Trống cơm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1">Xuất xứ / nghệ sĩ</label>
                  <input value={form.artist ?? ""} onChange={(e) => setForm((f) => ({ ...f, artist: e.target.value }))} className={inputCls} placeholder="Dân ca Bắc Bộ" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1">Thời lượng</label>
                  <input value={form.duration ?? ""} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} className={inputCls} placeholder="3:10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1">Gói tối thiểu để AI chấm</label>
                  <select value={form.requiredPlan} onChange={(e) => setForm((f) => ({ ...f, requiredPlan: e.target.value as Plan }))} className={inputCls}>
                    {PLANS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 block mb-1">Thứ tự</label>
                  <input type="number" min={0} value={form.orderIndex} onChange={(e) => setForm((f) => ({ ...f, orderIndex: Number(e.target.value) }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Ghi công bản mẫu</label>
                <input value={form.attribution ?? ""} onChange={(e) => setForm((f) => ({ ...f, attribution: e.target.value }))} className={inputCls} placeholder="VD: NSƯT Nguyễn Văn A, thu âm 2026" />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 block mb-1">Link nguồn</label>
                <input value={form.sourceUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))} className={inputCls} />
              </div>
              {!editId && <p className="text-xs text-zinc-400">Sau khi tạo, bấm “Upload bản mẫu” trên dòng tác phẩm để AI chấm được.</p>}
            </div>
            <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="text-sm text-zinc-500 hover:text-zinc-700 px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors">
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
    </div>
  );
}
