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
    <div className="flex flex-col gap-6 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-indigo-400">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-bold text-white text-base">
            {taskType === 'SINGLE_CHOICE' ? 'Тестове Завдання (Один варіант)' : 'Тестове Завдання (Кілька варіантів)'}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Телеметрія активна</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
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
              className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                isPassed
                  ? active
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-500/40 cursor-default'
                    : 'bg-slate-950/40 border-slate-900 text-slate-400 cursor-not-allowed'
                  : active
                  ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 cursor-pointer'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-6 h-6 rounded-${
                    taskType === 'SINGLE_CHOICE' ? 'full' : 'md'
                  } border flex items-center justify-center font-mono font-bold text-xs transition-all shrink-0 ${
                    isPassed
                      ? active
                        ? 'bg-emerald-500 border-emerald-300 text-slate-950 font-black shadow-md'
                        : 'border-slate-800 bg-slate-900 text-slate-600'
                      : active
                      ? 'bg-indigo-600 border-indigo-400 text-white'
                      : 'border-slate-700 bg-slate-900 text-slate-400'
                  }`}
                >
                  {active ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : letter}
                </div>
                <span className={`text-sm ${active ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                  {opt.text}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isPassed && active && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                    ✓ Обрано вами
                  </span>
                )}
                <span className="text-xs font-mono text-slate-600 font-semibold">{letter}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onNextTask}
          disabled={!isPassed}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            isPassed
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-900/40 cursor-pointer border border-emerald-400/40 ring-2 ring-emerald-500/30 animate-pulse'
              : 'bg-slate-950 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-50'
          }`}
        >
          <span>Наступне завдання</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting || isPassed}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
            isPassed
              ? 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800 opacity-60'
              : canSubmit && !isSubmitting
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>
            {isPassed
              ? '✓ Відповідь зараховано'
              : isSubmitting
              ? 'Відправка відповіді...'
              : 'Відправити Відповідь'}
          </span>
        </button>
      </div>
    </div>
  );
}
