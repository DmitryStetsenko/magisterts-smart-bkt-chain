'use client';

import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Activity, Zap, Trash2, Clipboard, Play } from 'lucide-react';
import { useTelemetry } from '../lib/useTelemetry';

interface MonacoCodeEditorProps {
  userId: string;
  taskId: string;
  initialCode: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function MonacoCodeEditor({
  userId,
  taskId,
  initialCode,
  onChange,
  onSubmit,
  isSubmitting = false,
}: MonacoCodeEditorProps) {
  const { metrics, handleKeyDown, handlePaste } = useTelemetry(userId, taskId);
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

    // Detect paste when inserted text length is > 3 characters in a single change
    editor.onDidChangeModelContent((e) => {
      const changes = e.changes;
      for (const change of changes) {
        if (change.text.length > 3) {
          handlePaste();
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

        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isSubmitting ? 'Оцінювання...' : 'Перевірити код'}</span>
        </button>
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
