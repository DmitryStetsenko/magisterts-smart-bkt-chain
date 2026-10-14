'use client';

import React from 'react';

export interface ReviewQueueItem {
  submissionId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  skillId: string;
  skillTitle: string;
  answerText: string;
  submittedAt: string;
  semanticScore: number;
  teacherReviewStatus: string;
  referenceAnswer: string | null;
  rubrics: any | null;
  misconceptions: any | null;
}

interface ReviewQueueInspectorProps {
  currentReview: ReviewQueueItem | null;
  isSubmitting: boolean;
  reviewComment: string;
  setReviewComment: (comment: string) => void;
  reviewScoreOverride: number | '';
  setReviewScoreOverride: (score: number | '') => void;
  onDecision: (decision: 'APPROVE' | 'REJECT') => void;
}

export const ReviewQueueInspector: React.FC<ReviewQueueInspectorProps> = ({
  currentReview,
  isSubmitting,
  reviewComment,
  setReviewComment,
  reviewScoreOverride,
  setReviewScoreOverride,
  onDecision,
}) => {
  if (!currentReview) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-lg">
          ✓
        </div>
        <h3 className="text-base font-bold text-slate-300">Усі відкриті відповіді перевірено</h3>
        <p className="text-xs text-slate-500 max-w-md">
          Наразі немає робіт, які очікують верифікації викладачем або потрапили у сіру зону автоматичного оцінювання.
        </p>
      </div>
    );
  }

  const wordCount = currentReview.answerText ? currentReview.answerText.trim().split(/\s+/).filter(Boolean).length : 0;
  const keywords = Array.isArray(currentReview.rubrics?.keywords) ? currentReview.rubrics.keywords : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
              ⏳ Очікує верифікації
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Здано: {new Date(currentReview.submittedAt).toLocaleString()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">{currentReview.taskTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Студент: <strong className="text-purple-300">{currentReview.studentName}</strong> ({currentReview.studentEmail}) • Модуль: <strong className="text-indigo-300">{currentReview.skillTitle}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDecision('REJECT')}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-500/30 hover:bg-rose-900/60 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
          >
            ✕ Відхилити відповідь
          </button>
          <button
            onClick={() => onDecision('APPROVE')}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>✓ Затвердити відповідь</span>
          </button>
        </div>
      </div>

      {/* Task Description & Reference Answer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Умова завдання:</span>
          <p className="text-xs text-slate-200 leading-relaxed">{currentReview.taskDescription}</p>
        </div>

        <div className="flex flex-col gap-2 p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl">
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Еталонне пояснення (Reference Answer):</span>
          <p className="text-xs text-indigo-100 leading-relaxed font-sans">
            {currentReview.referenceAnswer || 'Еталонна відповідь не задана для даного завдання.'}
          </p>
        </div>
      </div>

      {/* Student's Answer */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Письмова відповідь студента:</span>
          <span className="text-[11px] font-mono text-slate-400">
            Кількість слів: {wordCount}
          </span>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-sans leading-relaxed whitespace-pre-wrap">
          {currentReview.answerText}
        </div>
      </div>

      {/* Rubrics & Keywords Breakdown */}
      {keywords.length > 0 && (
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Критерії оцінювання (Rubrics):</span>
          <div className="flex flex-wrap items-center gap-2">
            {keywords.map((kw: string, idx: number) => {
              const kwLabel = String(kw).split('|')[0];
              return (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono">
                  🔑 {kwLabel}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Teacher Feedback & Score Override Form */}
      <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl flex flex-col gap-3">
        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
          Рішення та Відгук Викладача:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-3">
            <input
              type="text"
              placeholder="Коментар для студента (пояснення оцінки, зауваження або порада)..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              placeholder="Бал (0.0..1.0, опціонально)"
              value={reviewScoreOverride}
              onChange={(e) => setReviewScoreOverride(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
