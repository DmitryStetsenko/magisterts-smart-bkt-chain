'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Play, RotateCcw, Copy, Check, Terminal } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

export interface CodePlaygroundProps {
  initialCode: string;
  language?: string;
  title?: string;
  autoRun?: boolean;
  /** Compact toolbar mode for narrow sidebars / drawers (prevents button clipping) */
  compact?: boolean;
  /** Allow running JavaScript code in browser sandbox */
  runnable?: boolean;
  /** Read-only syntax-highlighted Monaco block */
  readOnly?: boolean;
  /** Optional explicit editor height in px */
  height?: number;
  className?: string;
}

function normalizeLanguage(lang?: string): string {
  const lower = (lang || 'javascript').toLowerCase().trim();
  if (lower === 'js' || lower === 'jsx') return 'javascript';
  if (lower === 'ts' || lower === 'tsx') return 'typescript';
  if (lower === 'py') return 'python';
  if (lower === 'html' || lower === 'css' || lower === 'json' || lower === 'sql') return lower;
  return lower || 'javascript';
}

/**
 * 💻 CodePlayground (Unified Monaco Editor Component — Rule 6 & Rule 7)
 * Спільний інтерактивний редактор коду на базі Monaco Editor (VS Code)
 * з автосинхронізацією теми (vs / vs-dark), підсвіткою синтаксису,
 * нумерацією рядків, кнопками копіювання/скидання та пісочницею JS.
 */
export function CodePlayground({
  initialCode,
  language = 'javascript',
  title = 'Пісочниця коду',
  autoRun = false,
  compact = false,
  runnable = true,
  readOnly = false,
  height,
  className = '',
}: CodePlaygroundProps) {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = useState<string>(initialCode);
  const [logs, setLogs] = useState<string[]>([]);
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const codeRef = useRef<string>(initialCode);

  const monacoLang = normalizeLanguage(language);
  const canRun = runnable && (monacoLang === 'javascript' || monacoLang === 'typescript');

  useEffect(() => {
    setCode(initialCode);
    codeRef.current = initialCode;
  }, [initialCode]);

  const executeCode = useCallback((source: string) => {
    const interceptedLogs: string[] = [];
    const customConsole = {
      log: (...args: unknown[]) => {
        interceptedLogs.push(
          args
            .map((a) => {
              if (typeof a === 'object' && a !== null) {
                try {
                  return JSON.stringify(a);
                } catch {
                  return String(a);
                }
              }
              return String(a);
            })
            .join(' ')
        );
      },
      error: (...args: unknown[]) => {
        interceptedLogs.push('❌ Помилка: ' + args.map((a) => String(a)).join(' '));
      },
      warn: (...args: unknown[]) => {
        interceptedLogs.push('⚠️ ' + args.map((a) => String(a)).join(' '));
      },
    };

    try {
      const runner = new Function('console', source);
      runner(customConsole);
      setLogs(interceptedLogs.length > 0 ? interceptedLogs : ['Код виконано без викликів console.log()']);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setLogs(['❌ Виникла помилка: ' + message]);
    }
    setHasRun(true);
  }, []);

  const handleRun = useCallback(() => {
    executeCode(codeRef.current);
  }, [executeCode]);

  useEffect(() => {
    if (autoRun && canRun) {
      executeCode(initialCode);
    }
  }, [autoRun, canRun, initialCode, executeCode]);

  const handleReset = () => {
    setCode(initialCode);
    codeRef.current = initialCode;
    setLogs([]);
    setHasRun(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeRef.current);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    if (canRun) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        executeCode(editor.getValue());
      });
    }
  };

  const lineCount = Math.max(3, code.split('\n').length);
  const computedHeight = height ?? Math.min(Math.max(lineCount * 20 + 26, compact ? 140 : 120), compact ? 320 : 380);

  return (
    <div
      data-testid="monaco-code-playground"
      className={`flex flex-col rounded-xl overflow-hidden border border-[var(--sbc-border-subtle,#2b2b2b)] bg-[var(--sbc-bg-surface,#1f1f1f)] transition-colors ${
        compact ? 'my-1' : 'my-3'
      } ${className}`}
    >
      {/* Компактна безрамкова шапка редактора */}
      <div className="px-3 py-2 bg-[var(--sbc-bg-subtle,#262626)] border-b border-[var(--sbc-border-subtle,#2b2b2b)] flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[11px] font-mono font-semibold text-[var(--sbc-text-primary,#cccccc)] truncate">
            {compact ? monacoLang.toUpperCase() : title}
          </span>
          {!compact && (
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--sbc-bg-surface,#1f1f1f)] text-[var(--sbc-text-muted,#909090)] border border-[var(--sbc-border-subtle,#2b2b2b)] shrink-0">
              {monacoLang}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-md text-[var(--sbc-text-muted,#909090)] hover:text-[var(--sbc-text-primary,#cccccc)] hover:bg-[var(--sbc-bg-surface,#1f1f1f)] transition-colors cursor-pointer"
            title={copied ? 'Скопійовано!' : 'Копіювати код'}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {!readOnly && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-md text-[var(--sbc-text-muted,#909090)] hover:text-[var(--sbc-text-primary,#cccccc)] hover:bg-[var(--sbc-bg-surface,#1f1f1f)] transition-colors cursor-pointer"
              title="Скинути до початкового коду"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {canRun && (
            <button
              type="button"
              onClick={handleRun}
              data-testid="playground-run-btn"
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title="Запустити код (Ctrl+Enter)"
            >
              <Play className="w-3 h-3 fill-current shrink-0" />
              <span>{compact ? 'Запустити' : 'Запустити код'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 💻 Monaco Editor (VS Code Engine) */}
      <div style={{ height: `${computedHeight}px` }} className="w-full relative">
        <Editor
          height="100%"
          language={monacoLang}
          theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
          value={code}
          onChange={(val) => {
            const next = val ?? '';
            setCode(next);
            codeRef.current = next;
          }}
          onMount={handleEditorMount}
          options={{
            readOnly,
            fontSize: compact ? 12 : 13,
            lineHeight: 20,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: 'on',
            lineNumbersMinChars: compact ? 2 : 3,
            glyphMargin: false,
            folding: !compact,
            renderLineHighlight: readOnly ? 'none' : 'line',
            padding: { top: 10, bottom: 10 },
            wordWrap: 'on',
            overviewRulerLanes: 0,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      </div>

      {/* Панель виводу консолі */}
      {canRun && hasRun && (
        <div className="border-t border-[var(--sbc-border-subtle,#2b2b2b)] bg-[var(--sbc-bg-subtle,#262626)] px-3 py-2.5 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--sbc-text-muted,#909090)]">
            <Terminal className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>Консоль виконання:</span>
          </div>
          <div className="font-mono text-xs bg-[var(--sbc-bg-root,#181818)] px-2.5 py-2 rounded-lg border border-[var(--sbc-border-subtle,#2b2b2b)] flex flex-col gap-1 overflow-x-auto">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.startsWith('❌')
                    ? 'text-rose-400'
                    : log.startsWith('⚠️')
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
