'use client';

import React from 'react';

export interface ReviewAttempt {
  id: string;
  attemptNumber: number;
  answerText: string;
  status: string;
  teacherReviewStatus: string;
  teacherComment?: string | null;
  submittedAt: string;
}

export interface ReviewQueueItem {
  submissionId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  skillId?: string;
  skillSlug?: string;
  skillTitle: string;
  answerText: string;
  attemptNumber?: number;
  totalAttempts?: number;
  submittedAt: string;
  semanticScore?: number;
  teacherReviewStatus: string;
  referenceAnswer: string | null;
  rubrics: any | null;
  misconceptions: any | null;
  attemptsHistory?: ReviewAttempt[];
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
  const [selectedAttemptIndex, setSelectedAttemptIndex] = React.useState<number | null>(null);

  // Reset selected attempt index when current review changes
  React.useEffect(() => {
    setSelectedAttemptIndex(null);
  }, [currentReview?.submissionId]);

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

  const history = currentReview.attemptsHistory || [];
  const activeAttempt =
    selectedAttemptIndex !== null && history[selectedAttemptIndex]
      ? history[selectedAttemptIndex]
      : null;

  const displayedAnswer = activeAttempt ? activeAttempt.answerText : currentReview.answerText;
  const displayedSubmittedAt = activeAttempt ? activeAttempt.submittedAt : currentReview.submittedAt;
  const displayedAttemptNumber = activeAttempt ? activeAttempt.attemptNumber : (currentReview.attemptNumber || 1);
  const isViewingHistoricalAttempt = activeAttempt !== null && activeAttempt.id !== currentReview.submissionId;

  const wordCount = displayedAnswer ? displayedAnswer.trim().split(/\s+/).filter(Boolean).length : 0;
  const keywords = Array.isArray(currentReview.rubrics?.keywords) ? currentReview.rubrics.keywords : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${
              currentReview.teacherReviewStatus === 'APPROVED'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : currentReview.teacherReviewStatus === 'REJECTED'
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
            }`}>
              {currentReview.teacherReviewStatus === 'APPROVED'
                ? '✓ Затверджено'
                : currentReview.teacherReviewStatus === 'REJECTED'
                ? '✕ Відхилено'
                : '⏳ Очікує верифікації'}
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

      {/* Attempts History Version Tabs */}
      {history.length > 1 && (
        <div className="flex flex-col gap-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🕒 Історія спроб студента:</span>
              <span className="font-mono text-purple-300">({history.length} версій)</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Попередні спроби автоматично архівовано (Superseded)
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {history.map((att, idx) => {
              const isSelected =
                selectedAttemptIndex === idx ||
                (selectedAttemptIndex === null && att.id === currentReview.submissionId);
              const isLatestActive = att.teacherReviewStatus === 'PENDING_REVIEW' || att.id === currentReview.submissionId;
              const isSuperseded = att.teacherReviewStatus === 'SUPERSEDED' || (!isLatestActive && idx < history.length - 1);

              return (
                <button
                  key={att.id}
                  onClick={() => setSelectedAttemptIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400 font-bold'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>
                    Спроба {att.attemptNumber || idx + 1}
                    {idx === history.length - 1 ? ' • Остання' : ''}
                  </span>
                  <span
                    className={`text-[9px] px-1 rounded uppercase font-bold ${
                      att.teacherReviewStatus === 'PENDING_REVIEW'
                        ? 'bg-amber-400/20 text-amber-300'
                        : isSuperseded
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-emerald-400/20 text-emerald-300'
                    }`}
                  >
                    {att.teacherReviewStatus === 'PENDING_REVIEW'
                      ? 'В черзі'
                      : isSuperseded
                      ? 'Superseded'
                      : att.teacherReviewStatus}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Student's Answer */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Письмова відповідь студента:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-mono font-bold">
              Спроба #{displayedAttemptNumber}
            </span>
            {isViewingHistoricalAttempt && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                ⚠️ Перегляд попередньої версії (архів)
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Кількість слів: {wordCount} • Час: {new Date(displayedSubmittedAt).toLocaleTimeString()}
          </span>
        </div>
        <div className={`p-4 rounded-xl text-slate-100 text-xs font-sans leading-relaxed whitespace-pre-wrap ${
          isViewingHistoricalAttempt
            ? 'bg-slate-950/60 border border-purple-500/30'
            : 'bg-slate-950 border border-slate-800'
        }`}>
          {displayedAnswer}
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
