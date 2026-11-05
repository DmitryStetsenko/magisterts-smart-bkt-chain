'use client';

import React from 'react';
import { ReviewQueueItemDto, ReviewAttemptDto } from '@sbc/types';

export type ReviewAttempt = ReviewAttemptDto;
export type ReviewQueueItem = ReviewQueueItemDto;

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

  React.useEffect(() => {
    setSelectedAttemptIndex(null);
  }, [currentReview?.submissionId]);

  if (!currentReview) {
    return (
      <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-bold text-base">
          ✓
        </div>
        <h3 className="text-sm font-bold text-slate-300">Усі відкриті відповіді перевірено</h3>
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
    <div className="flex flex-col gap-5">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
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
            <span className="text-[10px] font-mono text-slate-500">
              Здано: {new Date(currentReview.submittedAt).toLocaleString()}
            </span>
          </div>
          <h2 className="text-base font-bold text-white">{currentReview.taskTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Студент: <span className="text-slate-200 font-medium">{currentReview.studentName}</span> ({currentReview.studentEmail}) · Модуль: <span className="text-purple-300 font-medium">{currentReview.skillTitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDecision('REJECT')}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/25 hover:bg-rose-500/20 font-medium text-xs transition-all cursor-pointer disabled:opacity-50"
          >
            ✕ Відхилити
          </button>
          <button
            onClick={() => onDecision('APPROVE')}
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>✓ Затвердити відповідь</span>
          </button>
        </div>
      </div>

      {/* Task Description & Reference Answer (Clean Two-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Умова завдання</span>
          <p className="text-xs text-slate-200 leading-relaxed">{currentReview.taskDescription}</p>
        </div>

        <div className="flex flex-col gap-1.5 lg:pl-4 lg:border-l lg:border-slate-800/80">
          <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">Еталонне пояснення (Reference Answer)</span>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {currentReview.referenceAnswer || 'Еталонна відповідь не задана для даного завдання.'}
          </p>
        </div>
      </div>

      {/* Attempts History Version Tabs */}
      {history.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Історія спроб ({history.length}):
            </span>
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
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-semibold'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800/80'
                  }`}
                >
                  <span>
                    Спроба #{att.attemptNumber || idx + 1}
                  </span>
                  <span
                    className={`text-[9px] px-1 rounded uppercase ${
                      att.teacherReviewStatus === 'PENDING_REVIEW'
                        ? 'text-amber-300'
                        : isSuperseded
                        ? 'text-slate-500'
                        : 'text-emerald-300'
                    }`}
                  >
                    {att.teacherReviewStatus === 'PENDING_REVIEW'
                      ? 'В черзі'
                      : isSuperseded
                      ? 'Архів'
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
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Письмова відповідь студента</span>
            <span className="text-purple-300 font-mono">
              (Спроба #{displayedAttemptNumber})
            </span>
            {isViewingHistoricalAttempt && (
              <span className="text-amber-400 text-[10px] font-mono normal-case">
                · Перегляд архівної версії
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-500 normal-case">
            {wordCount} слів · {new Date(displayedSubmittedAt).toLocaleTimeString()}
          </span>
        </div>
        <div className={`p-3.5 rounded-lg text-slate-100 text-xs font-sans leading-relaxed whitespace-pre-wrap ${
          isViewingHistoricalAttempt
            ? 'bg-slate-900/40 border border-purple-500/30'
            : 'bg-slate-900/50 border border-slate-800/80'
        }`}>
          {displayedAnswer}
        </div>
      </div>

      {/* Rubrics & Keywords Breakdown */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Критерії (Rubrics):</span>
          {keywords.map((kw: string, idx: number) => {
            const kwLabel = String(kw).split('|')[0];
            return (
              <span key={idx} className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300 text-[11px] font-mono">
                {kwLabel}
              </span>
            );
          })}
        </div>
      )}

      {/* Teacher Feedback & Score Override Form */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Рішення та Відгук Викладача
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-3">
            <input
              type="text"
              placeholder="Коментар для студента (пояснення оцінки, зауваження або порада)..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
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
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
