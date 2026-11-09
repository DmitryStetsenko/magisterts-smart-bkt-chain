'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Send, Activity, Zap, Clipboard, ArrowRight } from 'lucide-react';
import { useTelemetry } from '../../code-editor/lib/useTelemetry';

interface EssayTaskEditorProps {
  userId: string;
  taskId: string;
  title?: string;
  description?: string;
  onChange: (value: string) => void;
  onSubmit: (telemetry?: any) => void;
  isSubmitting?: boolean;
  onNextTask?: () => void;
  isPassed?: boolean;
  isPendingReview?: boolean;
}

export function EssayTaskEditor({
  userId,
  taskId,
  title,
  description,
  onChange,
  onSubmit,
  isSubmitting = false,
  onNextTask,
  isPassed = false,
  isPendingReview = false,
}: EssayTaskEditorProps) {
  const [essayText, setEssayText] = useState<string>('');
  const { metrics, handleKeyDown, handleDelete, handlePaste } = useTelemetry(userId, taskId);

  useEffect(() => {
    setEssayText('');
  }, [taskId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEssayText(val);
    onChange(val);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      handleDelete();
    }
    handleKeyDown(e as any);
  };

  const handleTextareaPaste = () => {
    handlePaste();
  };

  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-purple-400">
          <FileText className="w-4 h-4" />
          <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
            Аналітичне есе & Відкрита відповідь
          </h3>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1 text-indigo-400">
            <Zap className="w-3 h-3" />
            <span>WPM: {metrics.wpm}</span>
          </div>

          <div className="flex items-center gap-1 text-amber-400">
            <Activity className="w-3 h-3" />
            <span>Паузи: {(metrics.lastPauseMs / 1000).toFixed(1)}s</span>
          </div>

          <div className="flex items-center gap-1 text-rose-400">
            <Clipboard className="w-3 h-3" />
            <span>Paste: {metrics.pasteEvents}</span>
          </div>
        </div>
      </div>

      {/* Textarea Input */}
      <div className="flex flex-col gap-2 w-full">
        <textarea
          value={essayText}
          onChange={handleChange}
          onKeyDown={handleTextareaKeyDown}
          onPaste={handleTextareaPaste}
          placeholder="Введіть вашу розгорнуту відповідь або аналіз..."
          className="w-full min-h-[220px] p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-indigo-500/60 font-sans leading-relaxed resize-y"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Слів написано: {wordCount}</span>
          <span>Телеметрія вводу активна</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5">
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
          onClick={() => {
            const deletionRatio =
              metrics.totalKeystrokes > 0
                ? Number((metrics.deleteCount / metrics.totalKeystrokes).toFixed(2))
                : 0;
            onSubmit({
              reactionLatencyMs: metrics.lastPauseMs,
              deletionRatio,
              pauseCount: metrics.lastPauseMs > 2000 ? 1 : 0,
              pasteEvents: metrics.pasteEvents,
              typingWpm: metrics.wpm,
            });
          }}
          disabled={wordCount === 0 || isSubmitting}
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-xs transition-colors ${
            wordCount > 0 && !isSubmitting
              ? isPendingReview
                ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
              : 'bg-slate-800/70 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            {isSubmitting
              ? 'Оцінювання есе...'
              : isPendingReview
              ? 'Оновити відповідь (нова спроба)'
              : 'Відправити на перевірку'}
          </span>
        </button>
      </div>
    </div>
  );
}
