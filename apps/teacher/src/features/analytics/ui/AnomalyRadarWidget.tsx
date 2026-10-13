'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  ExternalLink, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  X, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Code2,
  BookOpen
} from 'lucide-react';

export interface AnomalyItem {
  id?: string;
  skillSlug: string;
  skillTitle: string;
  taskId?: string;
  taskTitle?: string;
  taskType?: string;
  taskDescription?: string;
  taskOptions?: any;
  pSlipUsed?: number | null;
  pGuessUsed?: number | null;
  adjustReasons: string[];
  isCorrect: boolean;
  createdAt: string;
}

interface AnomalyRadarWidgetProps {
  adjustments: AnomalyItem[];
  title?: string;
  subtitle?: string;
  onNavigateToTask?: (taskId: string, skillSlug?: string) => void;
  showOnlyAnomalies?: boolean;
}

export function AnomalyRadarWidget({
  adjustments,
  title = 'Радар Аномалій та Поведінкової Телеметрії',
  subtitle = 'Хронологічне дерево підозрілих дій, вгадувань та коригувань BKT',
  onNavigateToTask,
  showOnlyAnomalies = false,
}: AnomalyRadarWidgetProps) {
  const [selectedItem, setSelectedItem] = useState<AnomalyItem | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'GUESS' | 'SLIP'>('ALL');

  const filtered = adjustments.filter((item) => {
    const isGuess = Boolean(item.pGuessUsed && item.pGuessUsed > 0.3);
    const isSlip = Boolean(item.pSlipUsed && item.pSlipUsed > 0.2);

    if (showOnlyAnomalies && !isGuess && !isSlip) return false;
    if (filterType === 'GUESS') return isGuess;
    if (filterType === 'SLIP') return isSlip;
    return true;
  });

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 text-slate-100">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{title}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-purple-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Всі ({adjustments.length})
          </button>
          <button
            onClick={() => setFilterType('GUESS')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              filterType === 'GUESS'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-amber-400/70 hover:text-amber-300'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Вгадування</span>
          </button>
          <button
            onClick={() => setFilterType('SLIP')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              filterType === 'SLIP'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-indigo-400/70 hover:text-indigo-300'
            }`}
          >
            <span>Описки</span>
          </button>
        </div>
      </div>

      {/* Anomaly Tree / Items List */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 border border-slate-800/40 rounded-xl">
          Аномалій чи специфічних коригувань для обраного фільтру не знайдено.
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
          {filtered.map((item, idx) => {
            const isGuess = Boolean(item.pGuessUsed && item.pGuessUsed > 0.3);
            const isSlip = Boolean(item.pSlipUsed && item.pSlipUsed > 0.2);

            return (
              <div
                key={item.id || idx}
                onClick={() => setSelectedItem(item)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs group ${
                  isGuess
                    ? 'bg-amber-950/20 hover:bg-amber-950/30 border-amber-500/30 hover:border-amber-500/60 shadow-md shadow-amber-950/20'
                    : isSlip
                    ? 'bg-indigo-950/20 hover:bg-indigo-950/30 border-indigo-500/30 hover:border-indigo-500/60'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800'
                }`}
              >
                {/* Left side: status & title */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0">
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {item.taskTitle || item.skillTitle}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {item.skillTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      {item.taskType && (
                        <>
                          <span>•</span>
                          <span className="text-purple-400">{item.taskType}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: telemetry badges & details button */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {item.pGuessUsed !== undefined && item.pGuessUsed !== null && (
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        isGuess
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      P(Guess)={item.pGuessUsed}
                    </span>
                  )}

                  {item.pSlipUsed !== undefined && item.pSlipUsed !== null && (
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        isSlip
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      P(Slip)={item.pSlipUsed}
                    </span>
                  )}

                  <button className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-amber-500/20 group-hover:text-amber-300 text-slate-400 transition-all">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deep Dive Modal: Question & Anomaly Inspector */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-xl w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Аудит Питання та Аномалії</h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    Модуль: <strong className="text-purple-300">{selectedItem.skillTitle}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task Title & Description */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Завдання / Запитання:
              </span>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h5 className="font-bold text-white text-sm mb-1">
                  {selectedItem.taskTitle || 'Тестове Запитання'}
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {selectedItem.taskDescription || 'Опис завдання відсутній.'}
                </p>
              </div>
            </div>

            {/* Anomaly Diagnosis & System Reasons */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Діагноз Телеметрії:
              </span>
              <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/30 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-300 font-bold">
                    {selectedItem.pGuessUsed && selectedItem.pGuessUsed > 0.3
                      ? '⚡ Аномально висока швидкість відповіді (Штраф за вгадування)'
                      : selectedItem.pSlipUsed && selectedItem.pSlipUsed > 0.2
                      ? '🛡️ Виявлено ознаки випадкової описки сильного студента'
                      : 'Стандартне оцінювання BKT'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">P(G) = {selectedItem.pGuessUsed ?? 0.2}</span>
                    <span className="text-indigo-400 font-bold">P(S) = {selectedItem.pSlipUsed ?? 0.1}</span>
                  </div>
                </div>

                {selectedItem.adjustReasons && selectedItem.adjustReasons.length > 0 && (
                  <div className="pt-2 border-t border-amber-500/20 flex flex-col gap-1">
                    {selectedItem.adjustReasons.map((reason, rIdx) => (
                      <div key={rIdx} className="text-xs text-amber-200 flex items-center gap-2">
                        <span>💡</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-all"
              >
                Закрити
              </button>
              {onNavigateToTask && selectedItem.taskId && (
                <button
                  onClick={() => {
                    const tid = selectedItem.taskId!;
                    const sslug = selectedItem.skillSlug;
                    setSelectedItem(null);
                    onNavigateToTask(tid, sslug);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Перейти до цього завдання</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
