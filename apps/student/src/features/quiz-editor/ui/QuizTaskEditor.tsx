'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, Clock, Send, ArrowRight } from 'lucide-react';

export interface QuizOption {
  id: string;
  text: string;
}

interface QuizTaskEditorProps {
  taskId: string;
  taskType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  title: string;
  description: string;
  options: QuizOption[];
  onSubmit: (payload: { selectedOptionId?: string; selectedOptionIds?: string[]; reactionLatencyMs: number }) => void;
  isSubmitting?: boolean;
  onNextTask?: () => void;
  isPassed?: boolean;
}

export function QuizTaskEditor({
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

  useEffect(() => {
    setStartTime(Date.now());
    setSelectedSingleId('');
    setSelectedMultipleIds([]);
  }, [options]);

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

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Латентність реакції активна</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const active = isSelected(opt.id);
          return (
            <div
              key={opt.id}
              onClick={() =>
                taskType === 'SINGLE_CHOICE'
                  ? setSelectedSingleId(opt.id)
                  : handleToggleMultiple(opt.id)
              }
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                active
                  ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-${
                    taskType === 'SINGLE_CHOICE' ? 'full' : 'md'
                  } border flex items-center justify-center transition-all ${
                    active
                      ? 'bg-indigo-600 border-indigo-400 text-white'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className="text-sm font-medium">{opt.text}</span>
              </div>
              <span className="text-xs font-mono text-slate-500 uppercase">{opt.id}</span>
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
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-900/40 cursor-pointer border border-emerald-400/40 ring-2 ring-emerald-500/30'
              : 'bg-slate-950 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-50'
          }`}
        >
          <span>Наступне завдання</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
            canSubmit && !isSubmitting
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Відправка відповіді...' : 'Відправити Відповідь'}</span>
        </button>
      </div>
    </div>
  );
}
