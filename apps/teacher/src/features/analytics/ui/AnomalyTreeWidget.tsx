'use client';

import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2, 
  Code2,
  BookOpen,
  FolderTree,
  Search,
  Check,
  ShieldAlert,
  ClipboardCopy,
  Gauge,
  Repeat,
  BrainCircuit,
  MessageSquareQuote,
  Flame,
  Info,
  ShieldCheck,
  Lightbulb
} from 'lucide-react';
import { SkillGraphNode } from '../../skill-graph/model/skill-graph.types';

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

export type AnomalyCategoryKey = 'paste' | 'speedrun' | 'semantic' | 'friction';

export interface AnomalyTreeWidgetProps {
  adjustments: AnomalyItem[];
  nodes?: SkillGraphNode[];
  title?: string;
  subtitle?: string;
  onNavigateToTask?: (taskId: string, skillSlug?: string) => void;
  role?: 'student' | 'teacher';
  defaultMode?: any; // kept for backwards compatibility
}

interface CategoryConfig {
  key: AnomalyCategoryKey;
  icon: any;
  titleStudent: string;
  titleTeacher: string;
  descStudent: string;
  descTeacher: string;
  badgeStudent: string;
  badgeTeacher: string;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'paste',
    icon: ClipboardCopy,
    titleStudent: 'Копіювання коду та буфер обміну',
    titleTeacher: 'Буфер обміну / Сторонній код (Paste Anomaly)',
    descStudent: 'Спроби, де значну частину коду або тексту було вставлено без ручного набору.',
    descTeacher: 'Разова вставка великого фрагмента тексту або pasteRatio > 0.70 (підозра на ШІ або списування).',
    badgeStudent: 'Рекомендація набору',
    badgeTeacher: 'Копіпаст коду',
    accentColor: 'amber',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-950/20',
    textColor: 'text-amber-400',
  },
  {
    key: 'speedrun',
    icon: Gauge,
    titleStudent: 'Аномально швидкі відповіді',
    titleTeacher: 'Швидкісна здача / Спідран (Speedrun Anomaly)',
    descStudent: 'Завдання було вирішено за лічені секунди, швидше за звичайний час прочитання умови.',
    descTeacher: 'Час рішення нижче когнітивного порогу (< 3.5с або < 5с). Підвищення P(Guess).',
    badgeStudent: 'Швидка відповідь',
    badgeTeacher: 'Спідран / Вгадування',
    accentColor: 'orange',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-950/20',
    textColor: 'text-orange-400',
  },
  {
    key: 'semantic',
    icon: Repeat,
    titleStudent: 'Текстові повтори та семантика',
    titleTeacher: 'Семантичний спам / Лупінг фраз (Semantic Anomaly)',
    descStudent: 'У відповіді виявлено повторювані фрази або недостатню аргументацію.',
    descTeacher: 'Спрацював спам-фільтр циклічного повторення фраз або низький семантичний скор.',
    badgeStudent: 'Потрібна увага',
    badgeTeacher: 'Семантичний спам',
    accentColor: 'rose',
    borderColor: 'border-rose-500/30',
    bgColor: 'bg-rose-950/20',
    textColor: 'text-rose-400',
  },
  {
    key: 'friction',
    icon: BrainCircuit,
    titleStudent: 'Когнітивне тертя та боротьба з кодом',
    titleTeacher: 'Когнітивне тертя / Невпевненість (Cognitive Friction)',
    descStudent: 'Спроби з великою кількістю виправлень та тривалими паузами. Це природна частина навчання!',
    descTeacher: 'Висока частка видалень (Backspace/Delete) та високий prior P(L). Пом\'якшення через P(Slip).',
    badgeStudent: 'Активний пошук',
    badgeTeacher: 'Захист P(Slip)',
    accentColor: 'indigo',
    borderColor: 'border-indigo-500/30',
    bgColor: 'bg-indigo-950/20',
    textColor: 'text-indigo-400',
  },
];

export function AnomalyTreeWidget({
  adjustments,
  nodes = [],
  title,
  subtitle,
  onNavigateToTask,
  role = 'teacher',
}: AnomalyTreeWidgetProps) {
  const [selectedItem, setSelectedItem] = useState<AnomalyItem | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<AnomalyCategoryKey | 'all'>('all');

  // Track open/collapsed categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    paste: true,
    speedrun: true,
    semantic: true,
    friction: true,
  });

  const toggleCategory = (catKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  // Build a lookup map of tasks across all skill nodes
  const taskLookup = useMemo(() => {
    const map = new Map<string, any>();
    nodes.forEach((node) => {
      if (node.tasks && Array.isArray(node.tasks)) {
        node.tasks.forEach((t) => {
          if (t.id) map.set(t.id, t);
          if (t.title) map.set(t.title, t);
        });
      }
    });
    return map;
  }, [nodes]);

  // Enrich adjustments with task details if missing from backend history
  const enrichedAdjustments: AnomalyItem[] = useMemo(() => {
    return adjustments.map((item, idx) => {
      const parentNode = nodes.find((n) => n.slug === item.skillSlug || n.title === item.skillTitle);
      const matchedTask = item.taskId
        ? taskLookup.get(item.taskId)
        : (parentNode?.tasks && parentNode.tasks[idx % (parentNode.tasks.length || 1)]) || null;

      const taskTitle = item.taskTitle || matchedTask?.title || `Завдання модуля «${item.skillTitle}»`;
      const taskDescription = item.taskDescription || matchedTask?.description || matchedTask?.content || 'Опис завдання: практичне тестування знань теми.';
      const taskType = item.taskType || matchedTask?.taskType || (matchedTask?.type) || 'SINGLE_CHOICE';
      const taskOptions = item.taskOptions || matchedTask?.options || matchedTask?.payload?.options || undefined;

      return {
        ...item,
        taskTitle,
        taskDescription,
        taskType,
        taskOptions,
        taskId: item.taskId || matchedTask?.id,
      };
    });
  }, [adjustments, nodes, taskLookup]);

  // Classify each anomaly item into one of the 4 clean categories
  const classifiedItems = useMemo(() => {
    const paste: AnomalyItem[] = [];
    const speedrun: AnomalyItem[] = [];
    const semantic: AnomalyItem[] = [];
    const friction: AnomalyItem[] = [];

    enrichedAdjustments.forEach((item) => {
      const reasons = (item.adjustReasons || []).join(' ').toLowerCase();

      if (reasons.includes('paste') || reasons.includes('вставка') || reasons.includes('копіюв') || reasons.includes('буфер')) {
        paste.push(item);
      } else if (reasons.includes('loop') || reasons.includes('зацикл') || reasons.includes('спам') || reasons.includes('повтор') || reasons.includes('семантик')) {
        semantic.push(item);
      } else if (item.pGuessUsed && item.pGuessUsed > 0.3) {
        speedrun.push(item);
      } else if (item.pSlipUsed && item.pSlipUsed > 0.2) {
        friction.push(item);
      } else if (reasons.includes('швидк') || reasons.includes('latency') || reasons.includes('час')) {
        speedrun.push(item);
      } else {
        // Fallback: if pGuess modified -> speedrun, else friction
        if ((item.pGuessUsed || 0) >= (item.pSlipUsed || 0)) {
          speedrun.push(item);
        } else {
          friction.push(item);
        }
      }
    });

    return { paste, speedrun, semantic, friction };
  }, [enrichedAdjustments]);

  const totalAnomalies = enrichedAdjustments.length;

  // Filter items by category tab and search query
  const getFilteredItems = (items: AnomalyItem[]) => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        (item.taskTitle && item.taskTitle.toLowerCase().includes(term)) ||
        (item.skillTitle && item.skillTitle.toLowerCase().includes(term)) ||
        (item.adjustReasons && item.adjustReasons.some((r) => r.toLowerCase().includes(term)))
    );
  };

  const defaultTitle = role === 'student' 
    ? 'Аналіз складнощів та рекомендації навчання' 
    : 'Аномалії курсу: Категорії поведінкових інцидентів';

  const defaultSubtitle = role === 'student'
    ? 'Аналітика навчального стилю: формуйте моторну пам\'ять та закріплюйте алгоритми власноруч'
    : 'Структурований аудит копіпасту, спідранів, семантичних повторів та когнітивних труднощів за категоріями';

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5 text-slate-100 font-sans">
      {/* Clean Header: Title + Incidents Badge + Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{title || defaultTitle}</span>
              {totalAnomalies > 0 ? (
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 animate-pulse">
                  {totalAnomalies} {totalAnomalies === 1 ? 'інцидент' : totalAnomalies < 5 ? 'інциденти' : 'інцидентів'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  Аномалій 0
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle || defaultSubtitle}</p>
          </div>
        </div>

        {/* Category Filter Chips & Search Box */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Filter Chips */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs font-bold font-mono">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Всі ({totalAnomalies})
            </button>
            {CATEGORIES.map((cat) => {
              const count = classifiedItems[cat.key].length;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategoryFilter(cat.key)}
                  className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeCategoryFilter === cat.key
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  <span>{cat.key === 'paste' ? 'Копіпаст' : cat.key === 'speedrun' ? 'Швидкість' : cat.key === 'semantic' ? 'Спам' : 'Тертя'} ({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Пошук інциденту..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CLEAN CATEGORIES ACCORDION (One Level, Zero Confusion)        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 font-mono text-xs">
        {totalAnomalies === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-200">
              {role === 'student' 
                ? 'Чудово! Ви розв\'язуєте завдання автентично у природному темпі.' 
                : 'Усі відповіді пройшли в межах нормальної поведінкової біометрії.'}
            </p>
            <p className="text-xs text-slate-500 max-w-md">
              Жодних копіювань з буфера, аномальних спідранів або семантичних збоїв не зафіксовано.
            </p>
          </div>
        ) : (
          CATEGORIES.filter((cat) => activeCategoryFilter === 'all' || activeCategoryFilter === cat.key).map((cat) => {
            const rawItems = classifiedItems[cat.key];
            const items = getFilteredItems(rawItems);
            const isExpanded = expandedCategories[cat.key] ?? true;

            // If empty in this category and not searching, show compact clean card
            if (rawItems.length === 0) {
              return (
                <div
                  key={cat.key}
                  className="bg-slate-950/40 border border-slate-800/60 rounded-xl px-4 py-3 flex items-center justify-between opacity-60"
                >
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <cat.icon className="w-4 h-4 text-slate-500" />
                    <span className="font-bold">{role === 'student' ? cat.titleStudent : cat.titleTeacher}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">0 інцидентів</span>
                </div>
              );
            }

            return (
              <div
                key={cat.key}
                className={`bg-slate-950/80 border ${cat.borderColor} rounded-xl overflow-hidden shadow-lg transition-all`}
              >
                {/* Category Header Bar */}
                <div
                  onClick={() => toggleCategory(cat.key)}
                  className={`px-4 py-3 ${cat.bgColor} hover:brightness-110 flex items-center justify-between cursor-pointer border-b ${cat.borderColor} transition-all select-none`}
                >
                  <div className="flex items-center gap-2.5">
                    {isExpanded ? (
                      <ChevronDown className={`w-4 h-4 ${cat.textColor}`} />
                    ) : (
                      <ChevronRight className={`w-4 h-4 ${cat.textColor}`} />
                    )}
                    <cat.icon className={`w-4 h-4 ${cat.textColor}`} />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm ${cat.textColor}`}>
                        {role === 'student' ? cat.titleStudent : cat.titleTeacher}
                      </span>
                      <span className="text-[11px] text-slate-400 font-sans hidden md:inline">
                        — {role === 'student' ? cat.descStudent : cat.descTeacher}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cat.bgColor} ${cat.textColor} border ${cat.borderColor}`}>
                    {items.length} {items.length === 1 ? 'інцидент' : items.length < 5 ? 'інциденти' : 'інцидентів'}
                  </span>
                </div>

                {/* Expanded Incident Cards */}
                {isExpanded && (
                  <div className="p-3 pl-4 sm:pl-6 flex flex-col gap-2.5 border-l-2 border-slate-700/50 ml-3 my-2">
                    {items.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2">Немає інцидентів за пошуковим запитом "{searchTerm}"</p>
                    ) : (
                      items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          onClick={() => setSelectedItem(item)}
                          className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 flex flex-col gap-2.5 cursor-pointer group transition-all shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full bg-${cat.accentColor}-400 shrink-0 mt-1`} />
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-white font-bold group-hover:text-purple-300 text-xs">
                                    {item.taskTitle || 'Завдання курсу'}
                                  </span>
                                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">
                                    {item.skillTitle} ({item.skillSlug})
                                  </span>
                                  {item.taskType && (
                                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                                      {item.taskType}
                                    </span>
                                  )}
                                </div>

                                {item.taskDescription && (
                                  <p className="text-[11px] text-slate-400 line-clamp-1 font-sans">
                                    {item.taskDescription}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono">
                              <span className="text-slate-500 hidden sm:inline">
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                              
                              {role === 'teacher' ? (
                                <span className={`px-2 py-0.5 rounded ${cat.bgColor} ${cat.textColor} font-bold border ${cat.borderColor}`}>
                                  {item.pGuessUsed ? `G=${item.pGuessUsed}` : `S=${item.pSlipUsed}`}
                                </span>
                              ) : (
                                <span className={`px-2 py-0.5 rounded ${cat.bgColor} ${cat.textColor} font-sans font-bold border ${cat.borderColor}`}>
                                  {cat.badgeStudent}
                                </span>
                              )}
                              
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-all" />
                            </div>
                          </div>

                          {/* Reason or Guidance Banner */}
                          {item.adjustReasons && item.adjustReasons.length > 0 && (
                            <div className={`flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px] ${cat.textColor} font-sans`}>
                              <cat.icon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">
                                {role === 'student' && cat.key === 'paste'
                                  ? 'Порада: Спробуйте набрати цей алгоритм власноруч для повноцінного опанування навички'
                                  : item.adjustReasons[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL INSPECTOR: Detailed Incident View                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedItem && (
        <div 
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-slate-200 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-purple-400">Деталі інциденту:</span>
                  <span>{selectedItem.taskTitle}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Модуль: <strong className="text-slate-200">{selectedItem.skillTitle}</strong> ({selectedItem.skillSlug})
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">Умова завдання:</span>
              <p className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 leading-relaxed font-sans">
                {selectedItem.taskDescription}
              </p>
            </div>

            {/* Role specific explanation */}
            <div className="flex flex-col gap-1 text-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
                {role === 'student' ? 'Вплив на прогрес та порада:' : 'Діагноз Телеметрії та Реакція Рушія BKT:'}
              </span>
              <div className="p-3.5 bg-purple-950/20 border border-purple-500/30 rounded-xl flex flex-col gap-2">
                {role === 'teacher' ? (
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-300 font-bold">
                      {selectedItem.pGuessUsed && selectedItem.pGuessUsed > 0.3
                        ? 'Підвищення P(Guess): Ймовірність вгадування збільшено'
                        : 'Підвищення P(Slip): Захист від втрати знання'}
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
                ) : (
                  <div className="flex items-start gap-2 text-xs text-purple-200 font-sans leading-relaxed">
                    <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <p>
                      Рушій BKT помітив особливість введення (наприклад, вставку тексту або швидке надсилання). Щоб тема впевнено перейшла у стан засвоєння, наберіть наступне практичне завдання вручну.
                    </p>
                  </div>
                )}

                {selectedItem.adjustReasons && selectedItem.adjustReasons.length > 0 && (
                  <div className="pt-2 border-t border-purple-500/20 flex flex-col gap-1 font-mono text-[11px] text-purple-200">
                    {selectedItem.adjustReasons.map((r, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{r}</span>
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
                  <span>Перейти до завдання</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
