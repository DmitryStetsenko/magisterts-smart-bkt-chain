'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, Clock, Send, ArrowRight } from 'lucide-react';
import { QuizOptionDto } from '@sbc/types';

export type QuizOption = QuizOptionDto;

interface QuizTaskEditorProps {
  taskId: string;
  taskType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  title: string;
  description: string;
  options: QuizOptionDto[];
  onSubmit: (payload: { selectedOptionId?: string; selectedOptionIds?: string[]; reactionLatencyMs: number }) => void;
  isSubmitting?: boolean;
  onNextTask?: () => void;
  isPassed?: boolean;
}

export function QuizTaskEditor({
  taskId,
  taskType,
  title,
  description,
  options = [],
  onSubmit,
  isSubmitting = false,
  onNextTask,
  isPassed = false,
}: QuizTaskEditorProps) {
  const [selectedSingleId, setSelectedSingleId] = useState<string>('');
  const [selectedMultipleIds, setSelectedMultipleIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Deterministically shuffle options per task to prevent correct answer always appearing first (Fisher-Yates)
  const shuffledOptions = React.useMemo(() => {
    if (!options || options.length <= 1) return options;
    const arr = [...options];
    // Simple deterministic hash seed from taskId
    let seed = 0;
    for (let i = 0; i < (taskId || '').length; i++) {
      seed = (seed * 31 + taskId.charCodeAt(i)) & 0xffffffff;
    }
    const pseudoRandom = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 4294967296;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(pseudoRandom() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [taskId, options]);

  // Reset selection only when moving to a different task
  useEffect(() => {
    setStartTime(Date.now());
    setSelectedSingleId('');
    setSelectedMultipleIds([]);
  }, [taskId]);

  const handleToggleMultiple = (id: string) => {
    setSelectedMultipleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const latency = Date.now() - startTime;
    if (taskType === 'SINGLE_CHOICE') {
      if (!selectedSingleId) return;
      onSubmit({ selectedOptionId: selectedSingleId, reactionLatencyMs: latency });
    } else {
      if (selectedMultipleIds.length === 0) return;
      onSubmit({ selectedOptionIds: selectedMultipleIds, reactionLatencyMs: latency });
    }
  };

  const isSelected = (id: string) =>
    taskType === 'SINGLE_CHOICE' ? selectedSingleId === id : selectedMultipleIds.includes(id);

  const canSubmit =
    taskType === 'SINGLE_CHOICE' ? Boolean(selectedSingleId) : selectedMultipleIds.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2.5 border-b border-[var(--sbc-border-subtle,#27272a)]">
        <div className="flex items-center gap-2 text-indigo-400">
          <HelpCircle className="w-4 h-4" />
          <h3 className="font-semibold text-[var(--sbc-text-primary,#f4f4f5)] text-xs uppercase tracking-wider">
            {taskType === 'SINGLE_CHOICE' ? 'Оберіть один варіант відповіді:' : 'Оберіть усі правильні варіанти:'}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--sbc-text-muted,#a1a1aa)]">
          <Clock className="w-3 h-3 text-indigo-400" />
          <span>Телеметрія активна</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {shuffledOptions.map((opt, idx) => {
          const active = isSelected(opt.id);
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          return (
            <div
              key={opt.id}
              onClick={() => {
                if (isPassed) return;
                taskType === 'SINGLE_CHOICE'
                  ? setSelectedSingleId(opt.id)
                  : handleToggleMultiple(opt.id);
              }}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                isPassed
                  ? active
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white cursor-default shadow-sm shadow-emerald-950/40'
                    : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 cursor-not-allowed opacity-60'
                  : active
                  ? 'bg-zinc-800/90 border-indigo-500 text-white shadow-md shadow-zinc-950/50 ring-1 ring-indigo-500/40'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 text-zinc-200'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`w-6 h-6 rounded-${
                    taskType === 'SINGLE_CHOICE' ? 'full' : 'md'
                  } flex items-center justify-center font-mono font-bold text-xs transition-colors shrink-0 mt-0.5 ${
                    isPassed
                      ? active
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-500'
                      : active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 border border-zinc-700/60 text-zinc-300'
                  }`}
                >
                  {active ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> : letter}
                </div>
                <span className={`text-sm leading-relaxed ${active ? 'font-semibold text-white' : 'font-normal text-zinc-300'}`}>
                  {opt.text}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isPassed && active && (
                  <span className="text-[10px] font-mono font-semibold text-emerald-400">
                    ✓ Обрано
                  </span>
                )}
                <span className="text-[11px] font-mono text-zinc-500">{letter}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-1">
        <button
          onClick={onNextTask}
          disabled={!isPassed}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-colors ${
            isPassed
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
              : 'bg-slate-900 text-slate-600 cursor-not-allowed opacity-50'
          }`}
        >
          <span>Наступне завдання</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting || isPassed}
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-xs transition-colors ${
            isPassed
              ? 'bg-slate-900 text-slate-500 cursor-not-allowed opacity-60'
              : canSubmit && !isSubmitting
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
              : 'bg-slate-800/70 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            {isPassed
              ? '✓ Відповідь зараховано'
              : isSubmitting
              ? 'Відправка відповіді...'
              : 'Відправити відповідь'}
          </span>
        </button>
      </div>
    </div>
  );
}
