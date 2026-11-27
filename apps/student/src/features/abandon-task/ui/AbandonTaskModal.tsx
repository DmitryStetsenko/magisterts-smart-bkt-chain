'use client';

import React from 'react';
import { AlertTriangle, BookOpen, TrendingDown, RotateCcw } from 'lucide-react';
import { ConfirmModal } from '@sbc/ui';

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
  isSubmitting = false,
}: AbandonTaskModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      variant="warning"
      icon={<AlertTriangle className="w-5 h-5" />}
      title="Перехід до повного підручника"
      description={
        <span>
          Поточне завдання буде перервано. У системі адаптивного навчання діє{' '}
          <strong className="text-[var(--sbc-text-primary,#cccccc)]">строгий контроль знань</strong>:
        </span>
      }
      confirmLabel={isSubmitting ? 'Скидання прогресу...' : 'Скинути прогрес і відкрити підручник'}
      cancelLabel="Залишитися в тренажері"
      isConfirming={isSubmitting}
      testId="abandon-task-modal"
      confirmTestId="confirm-abandon-btn"
      cancelTestId="cancel-abandon-btn"
      closeTestId="close-abandon-modal-btn"
    >
      <ul className="space-y-2 text-[11px] text-[var(--sbc-text-muted,#909090)] bg-[var(--sbc-bg-subtle,#262626)]/60 p-3 rounded-xl border border-[var(--sbc-border-subtle,#2b2b2b)]">
        <li className="flex items-start gap-2">
          <RotateCcw className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-[var(--sbc-text-primary,#cccccc)]">Скидання прогресу модуля:</strong> увесь прогрес та історія спроб за поточною навичкою буде анульовано (<code className="font-mono text-rose-300">0%</code>).
          </span>
        </li>
        <li className="flex items-start gap-2">
          <TrendingDown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-[var(--sbc-text-primary,#cccccc)]">Скидання стану:</strong> набраний код, обрані варіанти та підказки буде очищено без збереження чернетки.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-[var(--sbc-text-primary,#cccccc)]">Режим ремедіації:</strong> відкриється повний інтерактивний Zen-урок у підручнику для ґрунтовного повторення теми.
          </span>
        </li>
      </ul>
    </ConfirmModal>
  );
}
