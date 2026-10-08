'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Send, Activity, Zap, Clipboard, ArrowRight } from 'lucide-react';
import { useTelemetry } from '../../code-editor/lib/useTelemetry';

interface EssayTaskEditorProps {
  userId: string;
  taskId: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  onNextTask?: () => void;
  isPassed?: boolean;
}

export function EssayTaskEditor({
  userId,
  taskId,
  onChange,
  onSubmit,
  isSubmitting = false,
  onNextTask,
  isPassed = false,
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
    <div className="flex flex-col gap-6 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-xl">
      {/* Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-purple-400">
          <FileText className="w-5 h-5" />
          <h3 className="font-bold text-white text-base">Аналітичне Есе & Відкрита Відповідь</h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-1.5 text-indigo-400">
            <Zap className="w-3.5 h-3.5" />
            <span>WPM: {metrics.wpm}</span>
          </div>

          <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-1.5 text-amber-400">
            <Activity className="w-3.5 h-3.5" />
            <span>Паузи: {(metrics.lastPauseMs / 1000).toFixed(1)}s</span>
          </div>

          <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-1.5 text-rose-400">
            <Clipboard className="w-3.5 h-3.5" />
            <span>Copy-Paste: {metrics.pasteEvents}</span>
          </div>
        </div>
      </div>

      {/* Textarea Input */}
      <div className="flex flex-col gap-2">
        <textarea
          value={essayText}
          onChange={handleChange}
          onKeyDown={handleTextareaKeyDown}
          onPaste={handleTextareaPaste}
          placeholder="Введіть ваш детальний юридичний аналіз або розгорнуту відповідь..."
          className="w-full min-h-[220px] p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 font-sans leading-relaxed resize-y"
        />

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Слів написано: {wordCount}</span>
          <span>Телеметрія вводу активна</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
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
          onClick={onSubmit}
          disabled={wordCount === 0 || isSubmitting}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
            wordCount > 0 && !isSubmitting
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Оцінювання есе...' : 'Відправити На Перевірку'}</span>
        </button>
      </div>
    </div>
  );
}
