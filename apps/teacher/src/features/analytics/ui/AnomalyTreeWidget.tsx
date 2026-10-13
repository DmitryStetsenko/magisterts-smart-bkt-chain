'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown,
  Clock, 
  Sparkles, 
  X, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Code2,
  BookOpen,
  Folder,
  FolderOpen,
  FolderTree,
  ShieldAlert,
  Search,
  Check
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

interface AnomalyTreeWidgetProps {
  adjustments: AnomalyItem[];
  title?: string;
  subtitle?: string;
  onNavigateToTask?: (taskId: string, skillSlug?: string) => void;
  defaultExpanded?: boolean;
}

export function AnomalyTreeWidget({
  adjustments,
  title = 'Дерево Аномалій та Когнітивних Відхилень',
  subtitle = 'Структурована ієрархія: Категорія аномалії ➔ Модуль (Skill) ➔ Питання та Відповіді',
  onNavigateToTask,
  defaultExpanded = true,
}: AnomalyTreeWidgetProps) {
  const [selectedItem, setSelectedItem] = useState<AnomalyItem | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Track open/collapsed tree nodes (keys can be category or skill)
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'category-guess': true,
    'category-slip': true,
    'category-copypaste': true,
  });

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  };

  // Group items by Anomaly Category -> Skill Slug -> Items
  const guessItems = adjustments.filter((a) => Boolean(a.pGuessUsed && a.pGuessUsed > 0.3));
  const slipItems = adjustments.filter((a) => Boolean(a.pSlipUsed && a.pSlipUsed > 0.2));
  const normalItems = adjustments.filter(
    (a) => (!a.pGuessUsed || a.pGuessUsed <= 0.3) && (!a.pSlipUsed || a.pSlipUsed <= 0.2)
  );

  const groupBySkill = (items: AnomalyItem[]) => {
    const groups: Record<string, { skillTitle: string; skillSlug: string; items: AnomalyItem[] }> = {};
    items.forEach((item) => {
      const slug = item.skillSlug || 'other';
      if (!groups[slug]) {
        groups[slug] = {
          skillSlug: slug,
          skillTitle: item.skillTitle || slug,
          items: [],
        };
      }
      groups[slug].items.push(item);
    });
    return Object.values(groups);
  };

  const guessGrouped = groupBySkill(guessItems);
  const slipGrouped = groupBySkill(slipItems);

  const totalAnomalies = guessItems.length + slipItems.length;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5 text-slate-100">
      {/* 🌲 Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{title}</span>
              {totalAnomalies > 0 ? (
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 animate-pulse">
                  {totalAnomalies} виявлено
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  Аномалій 0
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Search input for questions/skills */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Пошук у дереві аномалій..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* 🌳 Interactive Hierarchical Tree */}
      <div className="flex flex-col gap-3 font-mono text-xs">
        {totalAnomalies === 0 && (
          <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center text-slate-500 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500/60" />
            <p className="text-xs text-slate-400">Усі поточні відповіді пройшли в межах нормальної поведінкової телеметрії.</p>
          </div>
        )}

        {/* ── Branch 1: Аномалії Вгадування (Fast Guessing P(G) > 0.3) ── */}
        {guessItems.length > 0 && (
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl overflow-hidden shadow-lg shadow-amber-950/10">
            {/* Category Node */}
            <div
              onClick={() => toggleNode('category-guess')}
              className="px-4 py-3 bg-amber-950/20 hover:bg-amber-950/30 flex items-center justify-between cursor-pointer border-b border-amber-500/20 transition-all select-none"
            >
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                {expandedNodes['category-guess'] ? (
                  <ChevronDown className="w-4 h-4 text-amber-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                )}
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Гілка: Аномалії Вгадування (Латентність &lt; 3.5с, P(Guess)=0.85)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {guessItems.length} {guessItems.length === 1 ? 'інцидент' : 'інциденти'}
              </span>
            </div>

            {/* Sub-tree: Grouped by Skills */}
            {expandedNodes['category-guess'] && (
              <div className="p-3 pl-6 flex flex-col gap-2.5 border-l-2 border-amber-500/40 ml-4 my-2">
                {guessGrouped.map((grp) => {
                  const skillKey = `guess-skill-${grp.skillSlug}`;
                  const isSkillExpanded = expandedNodes[skillKey] ?? true;

                  const filteredItems = grp.items.filter((item) =>
                    !searchTerm ||
                    (item.taskTitle && item.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    grp.skillTitle.toLowerCase().includes(searchTerm.toLowerCase())
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={grp.skillSlug} className="flex flex-col gap-1.5">
                      {/* Skill Node */}
                      <div
                        onClick={() => toggleNode(skillKey)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-900 border border-slate-800 cursor-pointer text-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          {isSkillExpanded ? (
                            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span className="font-bold text-white text-xs">{grp.skillTitle}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">({grp.skillSlug})</span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold">
                          {filteredItems.length} {filteredItems.length === 1 ? 'питання' : 'питань'}
                        </span>
                      </div>

                      {/* Leaves: Questions */}
                      {isSkillExpanded && (
                        <div className="flex flex-col gap-1.5 pl-6 border-l border-slate-800 ml-3 py-1">
                          {filteredItems.map((item, qIdx) => (
                            <div
                              key={item.id || qIdx}
                              onClick={() => setSelectedItem(item)}
                              className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-amber-950/30 border border-slate-800/80 hover:border-amber-500/40 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-ping" />
                                <span className="text-white font-medium group-hover:text-amber-300 truncate">
                                  {item.taskTitle || 'Тестове Запитання'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 text-[10px]">
                                <span className="text-slate-500">
                                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                  G={item.pGuessUsed}
                                </span>
                                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Branch 2: Описки та Нетипові Помилки (Slip Corrections P(S) > 0.2) ── */}
        {slipItems.length > 0 && (
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl overflow-hidden shadow-lg shadow-indigo-950/10">
            {/* Category Node */}
            <div
              onClick={() => toggleNode('category-slip')}
              className="px-4 py-3 bg-indigo-950/20 hover:bg-indigo-950/30 flex items-center justify-between cursor-pointer border-b border-indigo-500/20 transition-all select-none"
            >
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                {expandedNodes['category-slip'] ? (
                  <ChevronDown className="w-4 h-4 text-indigo-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-indigo-400" />
                )}
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span>Гілка: Випадкові Описки Сильних Студентів (Захист P(Slip) &gt; 0.2)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {slipItems.length} {slipItems.length === 1 ? 'інцидент' : 'інциденти'}
              </span>
            </div>

            {/* Sub-tree: Grouped by Skills */}
            {expandedNodes['category-slip'] && (
              <div className="p-3 pl-6 flex flex-col gap-2.5 border-l-2 border-indigo-500/40 ml-4 my-2">
                {slipGrouped.map((grp) => {
                  const skillKey = `slip-skill-${grp.skillSlug}`;
                  const isSkillExpanded = expandedNodes[skillKey] ?? true;

                  const filteredItems = grp.items.filter((item) =>
                    !searchTerm ||
                    (item.taskTitle && item.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    grp.skillTitle.toLowerCase().includes(searchTerm.toLowerCase())
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={grp.skillSlug} className="flex flex-col gap-1.5">
                      {/* Skill Node */}
                      <div
                        onClick={() => toggleNode(skillKey)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-900 border border-slate-800 cursor-pointer text-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          {isSkillExpanded ? (
                            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                          <span className="font-bold text-white text-xs">{grp.skillTitle}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">({grp.skillSlug})</span>
                        </div>
                        <span className="text-[10px] text-indigo-400 font-bold">
                          {filteredItems.length} {filteredItems.length === 1 ? 'питання' : 'питань'}
                        </span>
                      </div>

                      {/* Leaves: Questions */}
                      {isSkillExpanded && (
                        <div className="flex flex-col gap-1.5 pl-6 border-l border-slate-800 ml-3 py-1">
                          {filteredItems.map((item, qIdx) => (
                            <div
                              key={item.id || qIdx}
                              onClick={() => setSelectedItem(item)}
                              className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-indigo-950/30 border border-slate-800/80 hover:border-indigo-500/40 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                <span className="text-white font-medium group-hover:text-indigo-300 truncate">
                                  {item.taskTitle || 'Тестове Запитання'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 text-[10px]">
                                <span className="text-slate-500">
                                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                                  S={item.pSlipUsed}
                                </span>
                                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🔍 Interactive Deep Dive Modal: Question, Options & Telemetry Reason */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-xl w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col gap-4 text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${
                  selectedItem.pGuessUsed && selectedItem.pGuessUsed > 0.3
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                }`}>
                  {selectedItem.pGuessUsed && selectedItem.pGuessUsed > 0.3 ? (
                    <Zap className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    {selectedItem.pGuessUsed && selectedItem.pGuessUsed > 0.3
                      ? 'Аудит Аномалії: Підозра на Вгадування'
                      : 'Аудит Аномалії: Випадковий Промах'}
                  </h4>
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

            {/* Task Question & Description */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Запитання, що викликало аномалію:</span>
              </span>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
                <h5 className="font-bold text-white text-sm">
                  {selectedItem.taskTitle || 'Тестове Запитання'}
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {selectedItem.taskDescription || 'Опис завдання відсутній.'}
                </p>
              </div>
            </div>

            {/* Options display if choice task */}
            {selectedItem.taskOptions && Array.isArray(selectedItem.taskOptions) && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Варіанти відповідей завдання:
                </span>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto">
                  {selectedItem.taskOptions.map((opt: any, oIdx: number) => (
                    <div
                      key={oIdx}
                      className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-300">{opt.text || opt}</span>
                      <span className="text-[10px] font-mono text-slate-500">{opt.id || `Варіант ${oIdx + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Telemetry Verdict & Adjusted BKT Values */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Діагноз Телеметрії та Реакція Рушія BKT:
              </span>
              <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-300 font-bold">
                    {selectedItem.pGuessUsed && selectedItem.pGuessUsed > 0.3
                      ? '⚡ Латентність < 3.5с: Ймовірність вгадування підвищено до 0.85'
                      : '🛡️ Високий prior P(L): Студент знає матеріал, зрізання балів пом\'якшено'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      P(Guess) = {selectedItem.pGuessUsed ?? 0.2}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                      P(Slip) = {selectedItem.pSlipUsed ?? 0.1}
                    </span>
                  </div>
                </div>

                {selectedItem.adjustReasons && selectedItem.adjustReasons.length > 0 && (
                  <div className="pt-2 border-t border-amber-500/20 flex flex-col gap-1">
                    {selectedItem.adjustReasons.map((reason, rIdx) => (
                      <div key={rIdx} className="text-xs text-amber-200 flex items-center gap-2 font-mono">
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
                  <span>Перейти до редактора цього завдання</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
