'use client';

import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Activity, Zap, Trash2, Clipboard, Play, ArrowRight } from 'lucide-react';
import { useTelemetry } from '../lib/useTelemetry';

interface MonacoCodeEditorProps {
  userId: string;
  taskId: string;
  initialCode: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  onNextTask?: () => void;
  isPassed?: boolean;
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
}: MonacoCodeEditorProps) {
  const { metrics, handleKeyDown, handleDelete, handlePaste } = useTelemetry(userId, taskId);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.onKeyDown((e) => {
      handleKeyDown(e as any);
    });

    editor.onDidPaste(() => {
      handlePaste();
    });

    // Detect text deletions or pastes from model content changes
    editor.onDidChangeModelContent((e) => {
      const changes = e.changes;
      for (const change of changes) {
        // If inserted text length is > 3 characters in a single change -> Paste event
        if (change.text.length > 3) {
          handlePaste();
        }
        // If removed text length (rangeLength) > 0 and added text is empty -> Delete event
        else if (change.rangeLength > 0 && change.text.length === 0) {
          handleDelete(1);
        }
      }
    });

    // Also attach native DOM paste event listener on editor container DOM node
    const domNode = editor.getDomNode();
    if (domNode) {
      domNode.addEventListener('paste', () => {
        handlePaste();
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* 📊 Live Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-mono text-slate-400 gap-4">
        <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNextTask}
            disabled={!isPassed}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isPassed
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md shadow-emerald-900/40 cursor-pointer border border-emerald-400/30'
                : 'bg-slate-950 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-50'
            }`}
          >
            <span>Наступне завдання</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onSubmit}
            disabled={isSubmitting || isPassed}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isPassed
                ? 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800 opacity-60'
                : 'bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-900/30 cursor-pointer'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPassed ? '✓ Код зараховано' : isSubmitting ? 'Оцінювання...' : 'Перевірити код'}</span>
          </button>
        </div>
      </div>

      {/* 💻 Monaco Code Editor */}
      <div className="flex-1 min-h-[350px]">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
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
          }}
        />
      </div>
    </div>
  );
}
