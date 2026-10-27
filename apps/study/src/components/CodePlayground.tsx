'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, Check, Sparkles } from 'lucide-react';

interface CodePlaygroundProps {
  initialCode: string;
  language?: string;
  title?: string;
}

export function CodePlayground({ initialCode, title = 'Інтерактивна пісочниця коду' }: CodePlaygroundProps) {
  const [code, setCode] = useState<string>(initialCode);
  const [logs, setLogs] = useState<string[]>([]);
  const [hasRun, setHasRun] = useState<boolean>(false);

  const handleRun = () => {
    setLogs([]);
    const interceptedLogs: string[] = [];
    
    // Створюємо безпечний контекст для виведення в консоль
    const customConsole = {
      log: (...args: any[]) => {
        interceptedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      },
      error: (...args: any[]) => {
        interceptedLogs.push('Помилка: ' + args.map(a => String(a)).join(' '));
      }
    };

    try {
      // Виконуємо код у функціональній ізоляції
      const runner = new Function('console', code);
      runner(customConsole);
      setLogs(interceptedLogs.length > 0 ? interceptedLogs : ['Код виконано без викликів console.log()']);
    } catch (err: any) {
      setLogs(['❌ Виникла помилка: ' + (err?.message || String(err))]);
    }

    setHasRun(true);
  };

  const handleReset = () => {
    setCode(initialCode);
    setLogs([]);
    setHasRun(false);
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-xl my-4">
      {/* Шапка пісочниці */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-mono font-bold text-slate-300">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            title="Скинути до вихідного стану"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Скинути</span>
          </button>
          <button
            onClick={handleRun}
            className="px-3.5 py-1.2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Запустити код</span>
          </button>
        </div>
      </div>

      {/* Тіло редактора коду */}
      <div className="p-3 bg-slate-950">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={Math.max(5, code.split('\n').length + 1)}
          className="w-full bg-transparent text-slate-200 font-mono text-xs leading-relaxed outline-none resize-none selection:bg-blue-600/40"
          spellCheck={false}
        />
      </div>

      {/* Панель виводу консолі */}
      {hasRun && (
        <div className="border-t border-slate-800/80 bg-slate-900/60 p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Результат виконання (Консоль браузера):</span>
          </div>
          <div className="font-mono text-xs text-emerald-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex flex-col gap-1">
            {logs.map((log, idx) => (
              <div key={idx} className={log.startsWith('❌') ? 'text-rose-400' : 'text-emerald-300'}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
