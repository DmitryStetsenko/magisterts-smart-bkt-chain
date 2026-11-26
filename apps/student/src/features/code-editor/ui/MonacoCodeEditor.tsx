'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Activity, Zap, Trash2, Clipboard, Play, ArrowRight } from 'lucide-react';
import { useTheme } from '@sbc/ui';
import { useTelemetry } from '../lib/useTelemetry';

interface MonacoCodeEditorProps {
  userId: string;
  taskId: string;
  initialCode: string;
  onChange: (value: string) => void;
  onSubmit: (telemetry?: {
    reactionLatencyMs: number;
    deletionRatio: number;
    pauseCount: number;
    pasteEvents: number;
    typingWpm: number;
  }) => void;
  isSubmitting?: boolean;
  onNextTask?: () => void;
  isPassed?: boolean;
  height?: string | number;
}

export function MonacoCodeEditor({
  userId,
  taskId,
  initialCode,
  onChange,
  onSubmit,
  isSubmitting = false,
  onNextTask,
  isPassed = false,
  height,
}: MonacoCodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const { metrics, handleKeyDown, handleDelete, handlePaste } = useTelemetry(userId, taskId);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const applyMonacoTheme = useCallback(() => {
    if (!monacoRef.current) return;
    const isDomDark =
      typeof document !== 'undefined'
        ? document.documentElement.classList.contains('dark')
        : resolvedTheme === 'dark';
    monacoRef.current.editor.setTheme(isDomDark ? 'vs-dark' : 'vs');
  }, [resolvedTheme]);

  useEffect(() => {
    applyMonacoTheme();
  }, [applyMonacoTheme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      applyMonacoTheme();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [applyMonacoTheme]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    const isDomDark =
      typeof document !== 'undefined'
        ? document.documentElement.classList.contains('dark')
        : resolvedTheme === 'dark';
    monaco.editor.setTheme(isDomDark ? 'vs-dark' : 'vs');

    editor.onKeyDown((e) => {
      handleKeyDown(e as any);
    });

    // Фіксуємо виключно реальну вставку з буфера обміну (Ctrl+V / контекстне меню),
    // щоб автодоповнення IntelliSense (autocomplete) не спрацьовувало як копіпаст
    editor.onDidPaste(() => {
      handlePaste();
    });

    // Відстежуємо лише видалення символів (Backspace/Delete) у змінах моделі
    editor.onDidChangeModelContent((e) => {
      for (const change of e.changes) {
        if (change.rangeLength > 0 && change.text.length === 0) {
          handleDelete(1);
        }
      }
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* 📊 Live Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80 text-xs font-mono text-slate-400 gap-4">
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>{metrics.wpm} WPM</span>
          </div>

          <div className="flex items-center gap-1.5 text-indigo-400">
            <Activity className="w-3.5 h-3.5" />
            <span>Pause: {metrics.lastPauseMs}ms</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Deletes: {metrics.deleteCount}</span>
          </div>

          <div className="flex items-center gap-1.5 text-purple-400">
            <Clipboard className="w-3.5 h-3.5" />
            <span>Pastes: {metrics.pasteEvents}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNextTask}
            disabled={!isPassed}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isPassed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                : 'bg-slate-900 border border-slate-800/80 text-slate-500 cursor-not-allowed opacity-70'
            }`}
          >
            <span>Наступне завдання</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              const totalChars = Math.max(1, (initialCode || '').length);
              const deletionRatio = Math.min(1, Number((metrics.deleteCount / (totalChars + metrics.deleteCount)).toFixed(3)));
              onSubmit({
                reactionLatencyMs: metrics.lastPauseMs,
                deletionRatio,
                pauseCount: metrics.lastPauseMs > 2000 ? 1 : 0,
                pasteEvents: metrics.pasteEvents,
                typingWpm: metrics.wpm,
              });
            }}
            disabled={isSubmitting || isPassed}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isPassed
                ? 'bg-slate-900 border border-slate-800/80 text-slate-500 cursor-not-allowed opacity-70'
                : 'bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white cursor-pointer'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPassed ? '✓ Код зараховано' : isSubmitting ? 'Оцінювання...' : 'Перевірити код'}</span>
          </button>
        </div>
      </div>

      {/* 💻 Monaco Code Editor — Bounded & ergonomically constrained */}
      <div 
        ref={containerRef}
        style={height ? { height } : undefined}
        className={`w-full ${height ? '' : 'h-[360px] sm:h-[400px]'} rounded-lg overflow-hidden border border-slate-800/80 shrink-0 relative bg-slate-950`}
      >
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
          value={initialCode}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            lineNumbersMinChars: 3,
            padding: { top: 12, bottom: 12 },
            scrollbar: {
              vertical: 'visible',
              horizontal: 'auto',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
