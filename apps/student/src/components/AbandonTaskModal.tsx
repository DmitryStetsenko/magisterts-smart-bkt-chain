'use client';

import React from 'react';
import { AlertTriangle, BookOpen, ArrowRight, X, TrendingDown, RotateCcw } from 'lucide-react';

export interface AbandonTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetLessonUrl: string | null;
  isSubmitting?: boolean;
}

/**
 * ⚠️ AbandonTaskModal
 * Модальне вікно підтвердження добровільної відмови від розв'язання задачі
 * заради переходу до повного підручника (режим строгої ремедіації в BKT).
 */
export function AbandonTaskModal({
  isOpen,
  onClose,
  onConfirm,
  targetLessonUrl,
  isSubmitting = false,
}: AbandonTaskModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 animate-fadeIn transition-opacity"
        onClick={isSubmitting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          data-testid="abandon-task-modal"
          className="w-full max-w-md bg-slate-900 border border-slate-800/90 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 pointer-events-auto animate-fadeIn select-none"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-white">
                  Перехід до повного підручника
                </h3>
                <span className="text-xs text-amber-400 font-medium">
                  Поточне завдання буде перервано
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              data-testid="close-abandon-modal-btn"
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Закрити вікно"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description & Strict BKT Consequences */}
          <div className="flex flex-col gap-2.5 text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            <p className="text-slate-200 font-medium">
              Ви збираєтеся залишити активне середовище тренажера. У системі адаптивного навчання діє <span className="text-amber-300 font-semibold">строгий контроль знань</span>:
            </p>

            <ul className="space-y-2 text-[11px] text-slate-300">
              <li className="flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Скидання прогресу модуля:</strong> увесь прогрес та історія спроб за поточною навичкою буде анульовано (<code className="font-mono text-rose-300">0%</code>).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Скидання стану:</strong> набраний код, обрані варіанти та підказки буде очищено без збереження чернетки.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Режим ремедіації:</strong> відкриється повний інтерактивний Zen-урок у підручнику для ґрунтовного повторення теми.
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              data-testid="cancel-abandon-btn"
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Залишитися в тренажері
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirm}
              data-testid="confirm-abandon-btn"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-amber-900/30"
            >
              {isSubmitting ? (
                <span>Скидання прогресу...</span>
              ) : (
                <>
                  <span>Скинути прогрес і відкрити підручник</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
