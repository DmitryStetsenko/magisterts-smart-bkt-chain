'use client';

import React, { useState, useMemo } from 'react';
import {
  Network,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Code,
  CheckSquare,
  FileText,
  Search,
  Sparkles,
  Layers,
  Tag,
  ArrowRight,
  Activity,
  Zap,
  Info,
  SlidersHorizontal,
  Flame,
  ShieldAlert,
  FolderTree,
  ChevronLeft,
  X,
  Target
} from 'lucide-react';

export interface TaskItem {
  id: string;
  skillId: string;
  topic?: string | null;
  subConcept?: string | null;
  taskType: 'CODE' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT_ESSAY';
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  starterCode?: string;
  options?: any;
  testCases?: Array<{ input: string; expectedOutput: string; isSecret?: boolean }>;
  referenceAnswer?: string;
  rubrics?: any;
}

export interface SkillNodeItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
}

export interface CourseGraphViewerProps {
  courseTitle: string;
  courseSlug: string;
  skills: SkillNodeItem[];
  allTasks: TaskItem[];
  selectedSkillSlug?: string | null;
  selectedTaskId?: string | null;
  onSelectSkill: (slug: string) => void;
  onSelectTask: (taskId: string) => void;
  onCloseDrawer?: () => void;
}

export function CourseGraphViewer({
  courseTitle,
  courseSlug,
  skills,
  allTasks,
  selectedSkillSlug,
  selectedTaskId,
  onSelectSkill,
  onSelectTask,
}: CourseGraphViewerProps) {
  // Current view modes: 'graph' (interactive visual tree) | 'triads' (Cognitive Triad matrix)
  const [viewMode, setViewMode] = useState<'graph' | 'triads'>('graph');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Active module
  const activeSkill = useMemo(() => {
    return skills.find((s) => s.slug === selectedSkillSlug) || skills[0];
  }, [skills, selectedSkillSlug]);

  // Tasks in currently active module
  const activeSkillTasks = useMemo(() => {
    if (!activeSkill) return [];
    return allTasks.filter((t: any) => t.skillId === activeSkill.id || t.skill?.id === activeSkill.id);
  }, [activeSkill, allTasks]);

  // Group tasks by Topic -> SubConcept (Cognitive Triad)
  const topicGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        topic: string;
        subConcepts: Record<
          string,
          {
            subConcept: string;
            easy?: TaskItem;
            medium?: TaskItem;
            hard?: TaskItem;
            other: TaskItem[];
          }
        >;
      }
    > = {};

    activeSkillTasks.forEach((task) => {
      const topic = task.topic || 'general-practice';
      const sub = task.subConcept || 'core-concept';

      if (!groups[topic]) {
        groups[topic] = { topic, subConcepts: {} };
      }
      if (!groups[topic].subConcepts[sub]) {
        groups[topic].subConcepts[sub] = { subConcept: sub, other: [] };
      }

      const sc = groups[topic].subConcepts[sub];
      if (task.difficulty === 'EASY' && !sc.easy) {
        sc.easy = task;
      } else if (task.difficulty === 'MEDIUM' && !sc.medium) {
        sc.medium = task;
      } else if (task.difficulty === 'HARD' && !sc.hard) {
        sc.hard = task;
      } else {
        sc.other.push(task);
      }
    });

    return groups;
  }, [activeSkillTasks]);

  // All unique topics in this module for filter pills
  const availableTopics = useMemo(() => Object.keys(topicGroups), [topicGroups]);

  // Active task details for the inspector canvas
  const activeTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return allTasks.find((t) => t.id === selectedTaskId) || null;
  }, [selectedTaskId, allTasks]);

  // Helper for task type badges
  const renderTypeBadge = (type: string) => {
    switch (type) {
      case 'SINGLE_CHOICE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold">
            <HelpCircle className="w-3 h-3" /> Тест (1)
          </span>
        );
      case 'MULTIPLE_CHOICE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-semibold">
            <CheckSquare className="w-3 h-3" /> Мульти-вибір
          </span>
        );
      case 'TEXT_ESSAY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
            <FileText className="w-3 h-3" /> Текст / Есе
          </span>
        );
      case 'CODE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
            <Code className="w-3 h-3" /> Практичний Код
          </span>
        );
    }
  };

  // Helper for difficulty pill
  const renderDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'HARD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
            🔴 Складне (100%)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
            🟡 Нормальне (100%)
          </span>
        );
      case 'EASY':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
            🟢 Полегшене (70%)
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 🧭 Top Navigation & Course DAG Module Stepper */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Граф Навичок & Багаторівневий Банк Завдань</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
                  {allTasks.length} Завдань у Базі
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {courseTitle} — візуальна ієрархія розділів, підконцептів та когнітивних тріад (EASY / MEDIUM / HARD)
              </p>
            </div>
          </div>

          {/* View Mode Toggle Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'graph'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Дерево Концептів</span>
            </button>
            <button
              onClick={() => setViewMode('triads')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'triads'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Матриця Тріад (Bloom)</span>
            </button>
          </div>
        </div>

        {/* 🗺️ Interactive DAG Module Pipeline */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
          {skills.map((skill, idx) => {
            const isSelected = skill.slug === activeSkill?.slug;
            const skillTasksCount = allTasks.filter(
              (t: any) => t.skillId === skill.id || t.skill?.id === skill.id
            ).length;

            return (
              <React.Fragment key={skill.id}>
                <button
                  onClick={() => {
                    onSelectSkill(skill.slug);
                    setSelectedTopic(null);
                  }}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/60 border-indigo-500 shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                      isSelected
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{skill.title}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {skillTasksCount} завдань • {skill.slug}
                    </div>
                  </div>
                </button>
                {idx < skills.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 🔍 Search & Topic Sub-filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 rounded-xl p-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span>Теми модуля:</span>
          </span>
          <button
            onClick={() => setSelectedTopic(null)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              selectedTopic === null
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Усі теми ({activeSkillTasks.length})
          </button>
          {availableTopics.map((topic) => {
            const count = activeSkillTasks.filter((t) => (t.topic || 'general-practice') === topic).length;
            const isTopSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(isTopSelected ? null : topic)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  isTopSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{topic}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-800 text-slate-300 font-bold">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Пошук концепту, коду..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e: any) => setDifficultyFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="ALL">Всі рівні</option>
            <option value="EASY">🟢 Полегшені</option>
            <option value="MEDIUM">🟡 Нормальні</option>
            <option value="HARD">🔴 Складні</option>
          </select>
        </div>
      </div>

      {/* 🧩 Main Content: Dual-Mode Display */}
      {viewMode === 'graph' ? (
        /* 1. Interactive Topic Graph & Cognitive Triads */
        <div className="flex flex-col gap-6">
          {Object.values(topicGroups)
            .filter((tg) => selectedTopic === null || tg.topic === selectedTopic)
            .map((tg) => {
              const subConceptList = Object.values(tg.subConcepts);

              return (
                <div
                  key={tg.topic}
                  className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col gap-4"
                >
                  {/* Topic Root Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Tag className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                          <span>{tg.topic}</span>
                          <span className="text-[11px] font-normal text-slate-400 font-sans">
                            ({subConceptList.length} підконцептів)
                          </span>
                        </h3>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      Bloom Triad Module
                    </span>
                  </div>

                  {/* SubConcepts Grid / Cognitive Triads Cards */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {subConceptList.map((sc) => {
                      const tasksToRender = [sc.easy, sc.medium, sc.hard, ...sc.other]
                        .filter(Boolean)
                        .filter((t: any) => {
                          if (difficultyFilter !== 'ALL' && t.difficulty !== difficultyFilter) return false;
                          if (
                            searchQuery &&
                            !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                            !t.description.toLowerCase().includes(searchQuery.toLowerCase())
                          ) {
                            return false;
                          }
                          return true;
                        }) as TaskItem[];

                      if (tasksToRender.length === 0) return null;

                      return (
                        <div
                          key={sc.subConcept}
                          className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3 shadow-inner hover:border-slate-700/80 transition-all"
                        >
                          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                            <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                              <span>{sc.subConcept}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {tasksToRender.length} варіацій
                            </span>
                          </div>

                          {/* Triad Horizontal Steps */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {/* Easy Slot (Tier 1) */}
                            <div
                              onClick={() => sc.easy && onSelectTask(sc.easy.id)}
                              className={`p-2.5 rounded-lg border flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                                sc.easy
                                  ? selectedTaskId === sc.easy.id
                                    ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                                    : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900'
                                  : 'bg-slate-950 border-dashed border-slate-800/60 opacity-40 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                  Рівень 1: EASY
                                </span>
                                {sc.easy && renderTypeBadge(sc.easy.taskType)}
                              </div>
                              <span className="text-xs font-medium text-slate-200 line-clamp-2">
                                {sc.easy ? sc.easy.title : 'Немає полегшеного'}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {sc.easy ? '70% Бал • Тест' : 'Потрібно додати'}
                              </span>
                            </div>

                            {/* Medium Slot (Tier 2 Standard) */}
                            <div
                              onClick={() => sc.medium && onSelectTask(sc.medium.id)}
                              className={`p-2.5 rounded-lg border flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                                sc.medium
                                  ? selectedTaskId === sc.medium.id
                                    ? 'bg-amber-950/60 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                                    : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
                                  : 'bg-slate-950 border-dashed border-slate-800/60 opacity-40 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                  Рівень 2: MEDIUM
                                </span>
                                {sc.medium && renderTypeBadge(sc.medium.taskType)}
                              </div>
                              <span className="text-xs font-medium text-slate-200 line-clamp-2">
                                {sc.medium ? sc.medium.title : 'Немає практичного'}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {sc.medium ? '100% Бал • Практика' : 'Потрібно додати'}
                              </span>
                            </div>

                            {/* Hard Slot (Tier 3 Advanced) */}
                            <div
                              onClick={() => sc.hard && onSelectTask(sc.hard.id)}
                              className={`p-2.5 rounded-lg border flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                                sc.hard
                                  ? selectedTaskId === sc.hard.id
                                    ? 'bg-rose-950/60 border-rose-500 shadow-md ring-1 ring-rose-500/50'
                                    : 'bg-slate-900/90 border-slate-800 hover:border-rose-500/40 hover:bg-slate-900'
                                  : 'bg-slate-950 border-dashed border-slate-800/60 opacity-40 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                                  Рівень 3: HARD
                                </span>
                                {sc.hard && renderTypeBadge(sc.hard.taskType)}
                              </div>
                              <span className="text-xs font-medium text-slate-200 line-clamp-2">
                                {sc.hard ? sc.hard.title : 'Немає складного'}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {sc.hard ? '100% Бал • Edge cases' : 'Потрібно додати'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        /* 2. Bloom Triads Matrix Comparison Table */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4 overflow-x-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Матриця Когнітивних Тріад за Таксономією Блума</span>
                <span className="text-xs text-slate-400 font-normal">
                  (Діагностика зв'язку між складним завданням та його полегшеними альтернативами)
                </span>
              </h3>
            </div>
            <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Graceful Degradation Model
            </span>
          </div>

          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Тема & Підконцепт</th>
                <th className="py-2.5 px-3 text-emerald-400">🟢 Полегшений (Рівень 1 / EASY)</th>
                <th className="py-2.5 px-3 text-amber-400">🟡 Стандартний (Рівень 2 / MEDIUM)</th>
                <th className="py-2.5 px-3 text-rose-400">🔴 Складний (Рівень 3 / HARD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {Object.values(topicGroups)
                .filter((tg) => selectedTopic === null || tg.topic === selectedTopic)
                .flatMap((tg) =>
                  Object.values(tg.subConcepts).map((sc) => (
                    <tr key={`${tg.topic}-${sc.subConcept}`} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3 px-3 align-top">
                        <div className="font-mono text-indigo-400 font-bold">{tg.topic}</div>
                        <div className="text-[11px] text-slate-300 font-mono mt-0.5">{sc.subConcept}</div>
                      </td>

                      {/* EASY TD */}
                      <td className="py-3 px-3 align-top">
                        {sc.easy ? (
                          <div
                            onClick={() => sc.easy && onSelectTask(sc.easy.id)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              selectedTaskId === sc.easy.id
                                ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500/50'
                                : 'bg-slate-950/80 border-slate-800/80 hover:border-emerald-500/40'
                            }`}
                          >
                            <div className="font-semibold text-slate-200">{sc.easy.title}</div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {renderTypeBadge(sc.easy.taskType)}
                              <span className="text-[10px] text-emerald-400 font-mono">Max 70%</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic text-[11px]">— відсутній —</span>
                        )}
                      </td>

                      {/* MEDIUM TD */}
                      <td className="py-3 px-3 align-top">
                        {sc.medium ? (
                          <div
                            onClick={() => sc.medium && onSelectTask(sc.medium.id)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              selectedTaskId === sc.medium.id
                                ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-500/50'
                                : 'bg-slate-950/80 border-slate-800/80 hover:border-amber-500/40'
                            }`}
                          >
                            <div className="font-semibold text-slate-200">{sc.medium.title}</div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {renderTypeBadge(sc.medium.taskType)}
                              <span className="text-[10px] text-amber-400 font-mono">Max 100%</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic text-[11px]">— відсутній —</span>
                        )}
                      </td>

                      {/* HARD TD */}
                      <td className="py-3 px-3 align-top">
                        {sc.hard ? (
                          <div
                            onClick={() => sc.hard && onSelectTask(sc.hard.id)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              selectedTaskId === sc.hard.id
                                ? 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-500/50'
                                : 'bg-slate-950/80 border-slate-800/80 hover:border-rose-500/40'
                            }`}
                          >
                            <div className="font-semibold text-slate-200">{sc.hard.title}</div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {renderTypeBadge(sc.hard.taskType)}
                              <span className="text-[10px] text-rose-400 font-mono">Max 100%</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic text-[11px]">— відсутній —</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
      )}

      {/* 📌 Task Inspector Modal / Slide-down Preview */}
      {activeTask && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 mt-2 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                {renderDifficultyBadge(activeTask.difficulty)}
                {renderTypeBadge(activeTask.taskType)}
                <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {activeTask.topic || 'general'} ➔ {activeTask.subConcept || 'core'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1.5">{activeTask.title}</h2>
            </div>
            <button
              onClick={() => onSelectTask('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Закрити інспектор"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Умова Завдання:</h4>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
              {activeTask.description}
            </div>
          </div>

          {/* Starter Code Preview */}
          {activeTask.starterCode && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Стартовий Шаблон Коду:</h4>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap">
                {activeTask.starterCode}
              </div>
            </div>
          )}

          {/* Quiz Options Preview */}
          {activeTask.options && Array.isArray(activeTask.options) && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Варіанти Відповідей:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeTask.options.map((opt: any, i: number) => (
                  <div
                    key={opt.id || i}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      opt.isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{opt.text}</span>
                    {opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test cases Preview */}
          {activeTask.testCases && activeTask.testCases.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Тест-кейси ({activeTask.testCases.length}):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeTask.testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl font-mono text-xs flex items-center justify-between border ${
                      tc.isSecret
                        ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-slate-500">Input:</span>{' '}
                      <code className="text-white">{tc.input}</code>
                    </div>
                    <div>
                      <span className="text-slate-500">Expect:</span>{' '}
                      <code className="text-emerald-400">{tc.expectedOutput}</code>
                      {tc.isSecret && (
                        <span className="ml-2 text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                          SECRET
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
