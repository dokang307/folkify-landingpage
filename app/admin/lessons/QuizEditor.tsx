"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2, X, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import {
  fetchLessonQuiz,
  replaceLessonQuiz,
  type QuestionType,
  type QuizQuestionAdmin,
} from "@/lib/admin-api";

const inputCls =
  "text-sm border border-zinc-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#52b788]/30";

const newQuestion = (): QuizQuestionAdmin => ({
  question: "",
  type: "SINGLE",
  explanation: "",
  options: [
    { text: "", correct: true },
    { text: "", correct: false },
  ],
});

/** Trả về lỗi đầu tiên (giống luật validate phía backend) hoặc null nếu hợp lệ. */
export function validateQuiz(questions: QuizQuestionAdmin[]): string | null {
  for (const [i, q] of questions.entries()) {
    const n = `Câu ${i + 1}`;
    if (!q.question.trim()) return `${n}: chưa nhập nội dung câu hỏi`;
    if (q.options.length < 2) return `${n}: cần ít nhất 2 đáp án`;
    if (q.options.some((o) => !o.text.trim())) return `${n}: có đáp án đang để trống`;
    const correct = q.options.filter((o) => o.correct).length;
    if (q.type === "SINGLE" && correct !== 1) return `${n}: câu một đáp án phải có đúng 1 đáp án đúng`;
    if (q.type === "MULTI" && correct < 1) return `${n}: cần ít nhất 1 đáp án đúng`;
  }
  return null;
}

export default function QuizEditor({
  lessonId,
  lessonTitle,
  onClose,
}: {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestionAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLessonQuiz(lessonId)
      .then((q) => setQuestions(q.questions))
      .catch((e: unknown) => toast.error(e instanceof Error ? e.message : "Không tải được quiz"))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const update = (i: number, patch: Partial<QuizQuestionAdmin>) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  const move = (i: number, dir: -1 | 1) =>
    setQuestions((qs) => {
      const j = i + dir;
      if (j < 0 || j >= qs.length) return qs;
      const next = [...qs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const setCorrect = (qi: number, oi: number) => {
    const q = questions[qi];
    update(qi, {
      options: q.options.map((o, idx) =>
        q.type === "SINGLE" ? { ...o, correct: idx === oi } : idx === oi ? { ...o, correct: !o.correct } : o,
      ),
    });
  };

  const changeType = (qi: number, type: QuestionType) => {
    const q = questions[qi];
    // Chuyển sang SINGLE: giữ lại đúng 1 đáp án đúng đầu tiên
    const firstCorrect = Math.max(0, q.options.findIndex((o) => o.correct));
    update(qi, {
      type,
      options: type === "SINGLE" ? q.options.map((o, idx) => ({ ...o, correct: idx === firstCorrect })) : q.options,
    });
  };

  const handleSave = async () => {
    const problem = validateQuiz(questions);
    if (problem) {
      toast.error(problem);
      return;
    }
    setSaving(true);
    try {
      const saved = await replaceLessonQuiz(lessonId, questions);
      setQuestions(saved.questions);
      toast.success(`Đã lưu ${saved.questions.length} câu hỏi`);
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi lưu quiz");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h2 className="font-semibold text-[#0a1f14]">Câu hỏi ôn tập</h2>
            <p className="text-xs text-zinc-400">{lessonTitle}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600" aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {loading && <p className="text-sm text-zinc-400">Đang tải...</p>}
          {!loading && questions.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-6">Bài học chưa có câu hỏi. Học viên sẽ không làm được quiz cho bài này.</p>
          )}
          {questions.map((q, qi) => (
            <div key={qi} className="rounded-xl border border-zinc-100 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#2d6a4f]">Câu {qi + 1}</span>
                <select
                  value={q.type}
                  onChange={(e) => changeType(qi, e.target.value as QuestionType)}
                  className="text-xs border border-zinc-200 rounded-lg px-2 py-1"
                >
                  <option value="SINGLE">Một đáp án</option>
                  <option value="MULTI">Nhiều đáp án</option>
                </select>
                <div className="ml-auto flex items-center gap-1">
                  <button onClick={() => move(qi, -1)} disabled={qi === 0} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30" aria-label="Lên">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => move(qi, 1)} disabled={qi === questions.length - 1} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30" aria-label="Xuống">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== qi))}
                    className="text-zinc-400 hover:text-red-500"
                    aria-label="Xóa câu hỏi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                placeholder="Nội dung câu hỏi"
                value={q.question}
                onChange={(e) => update(qi, { question: e.target.value })}
                className={`${inputCls} resize-none`}
              />
              <div className="space-y-2">
                {q.options.map((o, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrect(qi, oi)}
                      title={o.correct ? "Đáp án đúng" : "Đánh dấu là đáp án đúng"}
                      aria-pressed={o.correct}
                      className={`flex-shrink-0 w-6 h-6 flex items-center justify-center border ${
                        q.type === "SINGLE" ? "rounded-full" : "rounded-md"
                      } ${o.correct ? "bg-[#52b788] border-[#52b788] text-white" : "border-zinc-300 text-transparent"}`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <input
                      value={o.text}
                      placeholder={`Đáp án ${String.fromCharCode(65 + oi)}`}
                      onChange={(e) =>
                        update(qi, { options: q.options.map((x, idx) => (idx === oi ? { ...x, text: e.target.value } : x)) })
                      }
                      className={inputCls}
                    />
                    <button
                      onClick={() => update(qi, { options: q.options.filter((_, idx) => idx !== oi) })}
                      disabled={q.options.length <= 2}
                      className="text-zinc-300 hover:text-red-500 disabled:opacity-30"
                      aria-label="Xóa đáp án"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => update(qi, { options: [...q.options, { text: "", correct: false }] })}
                  className="text-xs text-[#2d6a4f] hover:underline"
                >
                  + Thêm đáp án
                </button>
              </div>
              <input
                placeholder="Giải thích (hiện sau khi học viên nộp bài)"
                value={q.explanation ?? ""}
                onChange={(e) => update(qi, { explanation: e.target.value })}
                className={inputCls}
              />
            </div>
          ))}
          {!loading && (
            <button
              onClick={() => setQuestions((qs) => [...qs, newQuestion()])}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#2d6a4f] border border-dashed border-[#52b788]/50 rounded-xl py-3 hover:bg-[#52b788]/5"
            >
              <Plus className="w-4 h-4" /> Thêm câu hỏi
            </button>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-sm text-zinc-500 hover:text-zinc-700 px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-xl disabled:opacity-50 transition-colors"
            style={{ background: "linear-gradient(135deg,#52b788,#2d6a4f)" }}
          >
            <Check className="w-4 h-4" />
            {saving ? "Đang lưu..." : "Lưu quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
