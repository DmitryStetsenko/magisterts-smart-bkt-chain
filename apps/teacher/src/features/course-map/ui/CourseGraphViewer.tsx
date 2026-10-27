'use client';

import React, { useState, useMemo } from 'react';
import { TaskDto } from '@sbc/types';
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
  Target,
  GitBranch,
  Compass,
  Cpu
} from 'lucide-react';

export type TaskItem = TaskDto;

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
  // Modes: 'tree' (RPG Interactive Skill Tree) | 'triads' (Cognitive Triad Matrix)
  const [viewMode, setViewMode] = useState<'full' | 'tree' | 'triads'>('full');
  const [expandedSkillSlugs, setExpandedSkillSlugs] = useState<string[]>(skills.map(s => s.slug));
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

  const toggleSkillExpand = (slug: string) => {
    setExpandedSkillSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleTopicExpand = (topicKey: string) => {
    setExpandedTopics((prev) =>
      prev.includes(topicKey) ? prev.filter((t) => t !== topicKey) : [...prev, topicKey]
    );
  };

  const expandAll = () => {
    setExpandedSkillSlugs(skills.map((s) => s.slug));
  };

  const collapseAll = () => {
    setExpandedSkillSlugs([]);
  };
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Group all tasks across ALL skills into hierarchic syllabus
  const fullCourseTree = useMemo(() => {
    return skills.map((skill, idx) => {
      const skillTasks = allTasks.filter(
        (t: any) => t.skillId === skill.id || t.skill?.id === skill.id
      );

      // Group skill tasks into topics
      const topicMap: Record<
        string,
        {
          topic: string;
          subConcepts: string[];
          easy?: TaskItem;
          medium?: TaskItem;
          hard?: TaskItem;
          all: TaskItem[];
        }
      > = {};

      skillTasks.forEach((task) => {
        const topic = task.topic || 'general-topic';
        if (!topicMap[topic]) {
          topicMap[topic] = {
            topic,
            subConcepts: [],
            all: [],
          };
        }
        topicMap[topic].all.push(task);
        if (task.subConcept && !topicMap[topic].subConcepts.includes(task.subConcept)) {
          topicMap[topic].subConcepts.push(task.subConcept);
        }
        if (task.difficulty === 'EASY' && !topicMap[topic].easy) {
          topicMap[topic].easy = task;
        } else if (task.difficulty === 'MEDIUM' && !topicMap[topic].medium) {
          topicMap[topic].medium = task;
        } else if (task.difficulty === 'HARD' && !topicMap[topic].hard) {
          topicMap[topic].hard = task;
        }
      });

      return {
        skill,
        order: idx + 1,
        tasksCount: skillTasks.length,
        topics: Object.values(topicMap),
      };
    });
  }, [skills, allTasks]);

  // Active module
  const activeSkill = useMemo(() => {
    return skills.find((s) => s.slug === selectedSkillSlug) || skills[0];
  }, [skills, selectedSkillSlug]);

  // Tasks in currently active module
  const activeSkillTasks = useMemo(() => {
    if (!activeSkill) return [];
    return allTasks.filter((t: any) => t.skillId === activeSkill.id || t.skill?.id === activeSkill.id);
  }, [activeSkill, allTasks]);

  // Group tasks by Topic into complete Cognitive Triads
  const topicTriads = useMemo(() => {
    const map: Record<
      string,
      {
        topic: string;
        subConcepts: string[];
        easy?: TaskItem;
        medium?: TaskItem;
        hard?: TaskItem;
        all: TaskItem[];
      }
    > = {};

    activeSkillTasks.forEach((task) => {
      const topic = task.topic || 'core-topic';
      if (!map[topic]) {
        map[topic] = {
          topic,
          subConcepts: [],
          all: [],
        };
      }
      map[topic].all.push(task);
      if (task.subConcept && !map[topic].subConcepts.includes(task.subConcept)) {
        map[topic].subConcepts.push(task.subConcept);
      }

      if (task.difficulty === 'EASY' && !map[topic].easy) {
        map[topic].easy = task;
      } else if (task.difficulty === 'MEDIUM' && !map[topic].medium) {
        map[topic].medium = task;
      } else if (task.difficulty === 'HARD' && !map[topic].hard) {
        map[topic].hard = task;
      }
    });

    return map;
  }, [activeSkillTasks]);

  const availableTopics = useMemo(() => Object.keys(topicTriads), [topicTriads]);

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
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-semibold">
            <HelpCircle className="w-2.5 h-2.5" /> Тест
          </span>
        );
      case 'MULTIPLE_CHOICE':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-semibold">
            <CheckSquare className="w-2.5 h-2.5" /> Вибір
          </span>
        );
      case 'TEXT_ESSAY':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-semibold">
            <FileText className="w-2.5 h-2.5" /> Есе
          </span>
        );
      case 'CODE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-semibold">
            <Code className="w-2.5 h-2.5" /> Код
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
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 shadow-md">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Дерево Навичок & Компетенцій</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
                  {allTasks.length} Завдань у Базі
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {courseTitle} — розгалужене дерево знань: від кореневого модуля до тематичних гілок та когнітивних тріад
              </p>
            </div>
          </div>

          {/* View Mode Toggle Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setViewMode('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'full'
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Повне Дерево Курсу</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Фокус Модуля</span>
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
            <span>Гілки тем:</span>
          </span>
          <button
            onClick={() => setSelectedTopic(null)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              selectedTopic === null
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Усі гілки ({activeSkillTasks.length})
          </button>
          {availableTopics.map((topic) => {
            const count = topicTriads[topic]?.all.length || 0;
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
              placeholder="Пошук завдання, підконцепту..."
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

          {viewMode === 'full' && (
            <div className="flex items-center gap-1">
              <button
                onClick={expandAll}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold transition-all cursor-pointer"
                title="Розгорнути всі модулі"
              >
                + Всі
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold transition-all cursor-pointer"
                title="Згорнути всі модулі"
              >
                - Згорнути
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🌳 MAIN CONTENT: Full Course Knowledge Tree vs Module Focus vs Bloom Matrix */}
      {viewMode === 'full' ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-8">
          {/* Cyber Tree Background Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 10%, rgba(168, 85, 247, 0.18) 0%, transparent 60%),
                linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 32px 32px, 32px 32px',
            }}
          />

          {/* 👑 ROOT TRUNK: Whole Course Apex */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="px-8 py-5 rounded-2xl bg-gradient-to-b from-indigo-950/90 via-purple-950/90 to-slate-950/95 border-2 border-purple-500/60 shadow-2xl shadow-purple-950/80 flex items-center gap-5 backdrop-blur-md max-w-2xl text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
                <FolderTree className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-purple-300 font-bold bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                    Навчальна Програма Курсу
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    {skills.length} Модулів • {allTasks.length} Завдань
                  </span>
                </div>
                <h3 className="text-lg font-black text-white tracking-wide mt-1">
                  {courseTitle}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                  Повна онтологія знань: клацайте на завдання для миттєвої перевірки умов та тест-кейсів
                </p>
              </div>
            </div>

            {/* Trunk Vertical Connection Ray to Modules */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500 to-indigo-500/40"></div>
            <div className="w-3 h-3 rounded-full bg-purple-400 ring-4 ring-purple-500/20 shadow-sm shadow-purple-400"></div>
          </div>

          {/* 🌿 MODULES LAYER & BRANCHES */}
          <div className="relative z-10 flex flex-col gap-8">
            {fullCourseTree.map((item) => {
              const isExpanded = expandedSkillSlugs.includes(item.skill.slug);

              // Filter module topics by search and difficulty
              const matchingTopics = item.topics.filter((tg) => {
                const matchesSearch = (task?: TaskItem) => {
                  if (!task) return false;
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    task.title.toLowerCase().includes(q) ||
                    task.description.toLowerCase().includes(q) ||
                    (task.subConcept || '').toLowerCase().includes(q) ||
                    (task.topic || '').toLowerCase().includes(q)
                  );
                };

                const isEasy = tg.easy && (difficultyFilter === 'ALL' || difficultyFilter === 'EASY') && matchesSearch(tg.easy);
                const isMedium = tg.medium && (difficultyFilter === 'ALL' || difficultyFilter === 'MEDIUM') && matchesSearch(tg.medium);
                const isHard = tg.hard && (difficultyFilter === 'ALL' || difficultyFilter === 'HARD') && matchesSearch(tg.hard);

                return isEasy || isMedium || isHard;
              });

              if (searchQuery && matchingTopics.length === 0) return null;

              return (
                <div
                  key={item.skill.id}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden transition-all backdrop-blur-md"
                >
                  {/* Module Header Bar (Accordion Trigger) */}
                  <div
                    onClick={() => toggleSkillExpand(item.skill.slug)}
                    className="p-4 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center font-mono font-bold text-sm text-indigo-300 shrink-0 shadow-sm">
                        {item.order}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white tracking-wide truncate">
                            {item.skill.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {item.skill.slug}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.skill.description || 'Базовий розділ програми'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        {item.topics.length} Тем • {item.tasksCount} Завдань
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Module Body: Sub-branches / Topics */}
                  {isExpanded && (
                    <div className="p-5 flex flex-col gap-6 bg-slate-950/40">
                      {matchingTopics.map((tg) => {
                        const matchesSearch = (task?: TaskItem) => {
                          if (!task) return false;
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            task.title.toLowerCase().includes(q) ||
                            task.description.toLowerCase().includes(q) ||
                            (task.subConcept || '').toLowerCase().includes(q) ||
                            (task.topic || '').toLowerCase().includes(q)
                          );
                        };

                        const isEasyVisible = tg.easy && (difficultyFilter === 'ALL' || difficultyFilter === 'EASY') && matchesSearch(tg.easy);
                        const isMediumVisible = tg.medium && (difficultyFilter === 'ALL' || difficultyFilter === 'MEDIUM') && matchesSearch(tg.medium);
                        const isHardVisible = tg.hard && (difficultyFilter === 'ALL' || difficultyFilter === 'HARD') && matchesSearch(tg.hard);

                        return (
                          <div
                            key={tg.topic}
                            className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col lg:flex-row items-stretch gap-5 hover:border-slate-700/80 transition-all shadow-sm"
                          >
                            {/* Left: Topic Name & Subconcepts */}
                            <div className="lg:w-64 shrink-0 flex flex-col justify-between p-3.5 rounded-lg bg-slate-950/90 border border-slate-800">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                                    <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Тема</span>
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                    {tg.all.length} завд.
                                  </span>
                                </div>
                                <h5 className="text-xs font-bold text-white font-mono mt-1.5 break-all">
                                  {tg.topic}
                                </h5>

                                {tg.subConcepts.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {tg.subConcepts.map((sc) => (
                                      <span
                                        key={sc}
                                        className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20"
                                      >
                                        {sc}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                                <span>Тріада Блума</span>
                                <span className="text-emerald-400 font-semibold">Easy➔Med➔Hard</span>
                              </div>
                            </div>

                            {/* Center SVG connector line */}
                            <div className="hidden lg:flex w-8 relative items-center justify-center shrink-0">
                              <svg className="w-full h-full" viewBox="0 0 32 140" preserveAspectRatio="none">
                                {isEasyVisible && (
                                  <path d="M 0 70 C 16 70, 16 25, 32 25" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.8" />
                                )}
                                {isMediumVisible && (
                                  <path d="M 0 70 C 16 70, 16 70, 32 70" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.8" />
                                )}
                                {isHardVisible && (
                                  <path d="M 0 70 C 16 70, 16 115, 32 115" stroke="#f43f5e" strokeWidth="2" fill="none" opacity="0.8" />
                                )}
                                <circle cx="0" cy="70" r="3.5" fill="#6366f1" />
                              </svg>
                            </div>

                            {/* Right: Question Cards (Easy, Medium, Hard) */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* 🟢 Easy */}
                              {isEasyVisible ? (
                                <div
                                  onClick={() => tg.easy && onSelectTask(tg.easy.id)}
                                  className={`p-3 rounded-lg border flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                                    selectedTaskId === tg.easy?.id
                                      ? 'bg-emerald-950/70 border-emerald-400 shadow-md ring-2 ring-emerald-500/50'
                                      : 'bg-slate-950/80 border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-900'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                      🟢 EASY (70%)
                                    </span>
                                    {tg.easy && renderTypeBadge(tg.easy.taskType)}
                                  </div>
                                  <div className="text-xs font-semibold text-slate-100 line-clamp-2">
                                    {tg.easy?.title}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                                    <span>{tg.easy?.subConcept || 'concept'}</span>
                                    <span className="text-emerald-400 font-semibold">Ознайомче</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 rounded-lg border border-dashed border-slate-800/60 flex items-center justify-center text-[10px] font-mono text-slate-600 bg-slate-950/30">
                                  — Немає EASY —
                                </div>
                              )}

                              {/* 🟡 Medium */}
                              {isMediumVisible ? (
                                <div
                                  onClick={() => tg.medium && onSelectTask(tg.medium.id)}
                                  className={`p-3 rounded-lg border flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                                    selectedTaskId === tg.medium?.id
                                      ? 'bg-amber-950/70 border-amber-400 shadow-md ring-2 ring-amber-500/50'
                                      : 'bg-slate-950/80 border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-900'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                      🟡 MEDIUM (100%)
                                    </span>
                                    {tg.medium && renderTypeBadge(tg.medium.taskType)}
                                  </div>
                                  <div className="text-xs font-semibold text-slate-100 line-clamp-2">
                                    {tg.medium?.title}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                                    <span>{tg.medium?.subConcept || 'practice'}</span>
                                    <span className="text-amber-400 font-semibold">Практика</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 rounded-lg border border-dashed border-slate-800/60 flex items-center justify-center text-[10px] font-mono text-slate-600 bg-slate-950/30">
                                  — Немає MEDIUM —
                                </div>
                              )}

                              {/* 🔴 Hard */}
                              {isHardVisible ? (
                                <div
                                  onClick={() => tg.hard && onSelectTask(tg.hard.id)}
                                  className={`p-3 rounded-lg border flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                                    selectedTaskId === tg.hard?.id
                                      ? 'bg-rose-950/70 border-rose-400 shadow-md ring-2 ring-rose-500/50'
                                      : 'bg-slate-950/80 border-slate-800/90 hover:border-rose-500/50 hover:bg-slate-900'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                      🔴 HARD (100%)
                                    </span>
                                    {tg.hard && renderTypeBadge(tg.hard.taskType)}
                                  </div>
                                  <div className="text-xs font-semibold text-slate-100 line-clamp-2">
                                    {tg.hard?.title}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                                    <span>{tg.hard?.subConcept || 'mastery'}</span>
                                    <span className="text-rose-400 font-semibold">Виклик</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 rounded-lg border border-dashed border-slate-800/60 flex items-center justify-center text-[10px] font-mono text-slate-600 bg-slate-950/30">
                                  — Немає HARD —
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'tree' ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-8">
          {/* Cyber Tree Background Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.18) 0%, transparent 60%),
                linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 32px 32px, 32px 32px',
            }}
          />

          {/* 👑 ROOT TRUNK: Course Module Core */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="px-6 py-4 rounded-2xl bg-gradient-to-b from-indigo-900/80 to-purple-950/80 border-2 border-indigo-500/60 shadow-xl shadow-indigo-950/80 flex items-center gap-4 backdrop-blur-md max-w-xl">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner shrink-0">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                    Корінь Модуля • DAG Trunk
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {activeSkill?.slug}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-wide truncate">
                  {activeSkill?.title}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                  {activeSkill?.description || 'Базовий фундамент знань та навичок курсу'}
                </p>
              </div>
            </div>

            {/* Trunk Vertical Connection Ray to Topic Branches */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-500 to-indigo-500/30"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 ring-4 ring-indigo-500/20 shadow-sm shadow-indigo-400"></div>
          </div>

          {/* 🌿 BRANCHES: Topic Clusters Radiating into Triad Leaves */}
          <div className="relative z-10 flex flex-col gap-8">
            {Object.values(topicTriads)
              .filter((tg) => selectedTopic === null || tg.topic === selectedTopic)
              .map((tg) => {
                // Determine whether each leaf matches the active difficulty and search filters
                const matchesSearch = (task?: TaskItem) => {
                  if (!task) return false;
                  if (!searchQuery) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    task.title.toLowerCase().includes(q) ||
                    task.description.toLowerCase().includes(q) ||
                    (task.subConcept || '').toLowerCase().includes(q) ||
                    (task.topic || '').toLowerCase().includes(q)
                  );
                };

                const isEasyVisible =
                  tg.easy &&
                  (difficultyFilter === 'ALL' || difficultyFilter === 'EASY') &&
                  matchesSearch(tg.easy);

                const isMediumVisible =
                  tg.medium &&
                  (difficultyFilter === 'ALL' || difficultyFilter === 'MEDIUM') &&
                  matchesSearch(tg.medium);

                const isHardVisible =
                  tg.hard &&
                  (difficultyFilter === 'ALL' || difficultyFilter === 'HARD') &&
                  matchesSearch(tg.hard);

                // If filter is active and none of the triad tasks match, hide this whole branch
                const totalMatching = (isEasyVisible ? 1 : 0) + (isMediumVisible ? 1 : 0) + (isHardVisible ? 1 : 0);
                if (totalMatching === 0) return null;

                return (
                  <div
                    key={tg.topic}
                    className="relative bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row items-stretch gap-6 backdrop-blur-sm hover:border-slate-700/80 transition-all"
                  >
                    {/* Left: Topic Hub / Branch Node */}
                    <div className="lg:w-72 shrink-0 flex flex-col justify-between p-4 rounded-xl bg-gradient-to-br from-slate-900/90 to-indigo-950/30 border border-indigo-500/20 shadow-md">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Гілка Навичок</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {totalMatching} з {tg.all.length} завдань
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white font-mono mt-2 break-all">
                          {tg.topic}
                        </h4>
                        {/* Subconcept Tags */}
                        {tg.subConcepts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {tg.subConcepts.map((sc) => (
                              <span
                                key={sc}
                                className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                                <span>{sc}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Graceful Triad</span>
                        <span className="text-emerald-400 font-semibold">Easy ➔ Med ➔ Hard</span>
                      </div>
                    </div>

                    {/* Center SVG Branching Curves (Visible on large screens) */}
                    <div className="hidden lg:flex w-10 relative items-center justify-center shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 40 160" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`grad-${tg.topic}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                          </linearGradient>
                        </defs>
                        {/* 3 Radiating curves from center-left to 3 leaf tiers on the right */}
                        {isEasyVisible && (
                          <path d="M 0 80 C 20 80, 20 28, 40 28" stroke="#10b981" strokeWidth="2.5" fill="none" opacity="0.9" />
                        )}
                        {isMediumVisible && (
                          <path d="M 0 80 C 20 80, 20 80, 40 80" stroke="#f59e0b" strokeWidth="2.5" fill="none" opacity="0.9" />
                        )}
                        {isHardVisible && (
                          <path d="M 0 80 C 20 80, 20 132, 40 132" stroke="#f43f5e" strokeWidth="2.5" fill="none" opacity="0.9" />
                        )}
                        {/* Dimmed lines if filtered out */}
                        {!isEasyVisible && difficultyFilter === 'ALL' && (
                          <path d="M 0 80 C 20 80, 20 28, 40 28" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.4" />
                        )}
                        {!isMediumVisible && difficultyFilter === 'ALL' && (
                          <path d="M 0 80 C 20 80, 20 80, 40 80" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.4" />
                        )}
                        {!isHardVisible && difficultyFilter === 'ALL' && (
                          <path d="M 0 80 C 20 80, 20 132, 40 132" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.4" />
                        )}
                        {/* Topic Hub Anchor Point */}
                        <circle cx="0" cy="80" r="4" fill="#6366f1" />
                      </svg>
                    </div>

                    {/* Right: Triad Leaves (Filtered dynamically by difficulty) */}
                    <div className={`flex-1 grid gap-3.5 ${
                      difficultyFilter === 'ALL'
                        ? 'grid-cols-1 md:grid-cols-3'
                        : 'grid-cols-1'
                    }`}>
                      {/* 🟢 LEAF 1: EASY */}
                      {isEasyVisible && (
                        <div
                          onClick={() => tg.easy && onSelectTask(tg.easy.id)}
                          className={`group relative p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all cursor-pointer ${
                            selectedTaskId === tg.easy?.id
                              ? 'bg-emerald-950/70 border-emerald-400 shadow-lg shadow-emerald-950/80 ring-2 ring-emerald-500/50 -translate-y-0.5'
                              : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 hover:-translate-y-0.5 shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>Рівень 1: EASY</span>
                            </span>
                            {tg.easy && renderTypeBadge(tg.easy.taskType)}
                          </div>

                          <div>
                            <h5 className="text-xs font-semibold text-slate-100 group-hover:text-white line-clamp-2">
                              {tg.easy?.title}
                            </h5>
                            {tg.easy?.subConcept && (
                              <span className="text-[10px] text-purple-300 font-mono block mt-1">
                                ✦ {tg.easy.subConcept}
                              </span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-emerald-400 font-bold">Max 70%</span>
                            <span className="text-slate-400">P(G)=0.25</span>
                          </div>
                        </div>
                      )}

                      {/* 🟡 LEAF 2: MEDIUM */}
                      {isMediumVisible && (
                        <div
                          onClick={() => tg.medium && onSelectTask(tg.medium.id)}
                          className={`group relative p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all cursor-pointer ${
                            selectedTaskId === tg.medium?.id
                              ? 'bg-amber-950/70 border-amber-400 shadow-lg shadow-amber-950/80 ring-2 ring-amber-500/50 -translate-y-0.5'
                              : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 hover:-translate-y-0.5 shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              <span>Рівень 2: MEDIUM</span>
                            </span>
                            {tg.medium && renderTypeBadge(tg.medium.taskType)}
                          </div>

                          <div>
                            <h5 className="text-xs font-semibold text-slate-100 group-hover:text-white line-clamp-2">
                              {tg.medium?.title}
                            </h5>
                            {tg.medium?.subConcept && (
                              <span className="text-[10px] text-purple-300 font-mono block mt-1">
                                ✦ {tg.medium.subConcept}
                              </span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-amber-400 font-bold">Max 100%</span>
                            <span className="text-slate-400">P(G)=0.05</span>
                          </div>
                        </div>
                      )}

                      {/* 🔴 LEAF 3: HARD */}
                      {isHardVisible && (
                        <div
                          onClick={() => tg.hard && onSelectTask(tg.hard.id)}
                          className={`group relative p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all cursor-pointer ${
                            selectedTaskId === tg.hard?.id
                              ? 'bg-rose-950/70 border-rose-400 shadow-lg shadow-rose-950/80 ring-2 ring-rose-500/50 -translate-y-0.5'
                              : 'bg-slate-900/90 border-slate-800 hover:border-rose-500/50 hover:bg-slate-900 hover:-translate-y-0.5 shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                              <span>Рівень 3: HARD</span>
                            </span>
                            {tg.hard && renderTypeBadge(tg.hard.taskType)}
                          </div>

                          <div>
                            <h5 className="text-xs font-semibold text-slate-100 group-hover:text-white line-clamp-2">
                              {tg.hard?.title}
                            </h5>
                            {tg.hard?.subConcept && (
                              <span className="text-[10px] text-purple-300 font-mono block mt-1">
                                ✦ {tg.hard.subConcept}
                              </span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-rose-400 font-bold">Max 100%</span>
                            <span className="text-slate-400">P(G)=0.01 • Edge</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
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
                <th className="py-2.5 px-3">Тематична Гілка & Підконцепти</th>
                <th className="py-2.5 px-3 text-emerald-400">🟢 Полегшений (Рівень 1 / EASY)</th>
                <th className="py-2.5 px-3 text-amber-400">🟡 Стандартний (Рівень 2 / MEDIUM)</th>
                <th className="py-2.5 px-3 text-rose-400">🔴 Складний (Рівень 3 / HARD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {Object.values(topicTriads)
                .filter((tg) => selectedTopic === null || tg.topic === selectedTopic)
                .filter((tg) => {
                  const matchesSearch = (task?: TaskItem) => {
                    if (!task) return false;
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      task.title.toLowerCase().includes(q) ||
                      task.description.toLowerCase().includes(q) ||
                      (task.subConcept || '').toLowerCase().includes(q) ||
                      (task.topic || '').toLowerCase().includes(q)
                    );
                  };

                  const isEasyVisible = tg.easy && (difficultyFilter === 'ALL' || difficultyFilter === 'EASY') && matchesSearch(tg.easy);
                  const isMediumVisible = tg.medium && (difficultyFilter === 'ALL' || difficultyFilter === 'MEDIUM') && matchesSearch(tg.medium);
                  const isHardVisible = tg.hard && (difficultyFilter === 'ALL' || difficultyFilter === 'HARD') && matchesSearch(tg.hard);

                  return isEasyVisible || isMediumVisible || isHardVisible;
                })
                .map((tg) => (
                  <tr key={tg.topic} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-3 align-top">
                      <div className="font-mono text-indigo-400 font-bold">{tg.topic}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1 flex flex-wrap gap-1">
                        {tg.subConcepts.map((sc) => (
                          <span key={sc} className="px-1 rounded bg-slate-800 text-purple-300">
                            {sc}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* EASY TD */}
                    <td className="py-3 px-3 align-top">
                      {tg.easy && (difficultyFilter === 'ALL' || difficultyFilter === 'EASY') ? (
                        <div
                          onClick={() => tg.easy && onSelectTask(tg.easy.id)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                            selectedTaskId === tg.easy.id
                              ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500/50'
                              : 'bg-slate-950/80 border-slate-800/80 hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="font-semibold text-slate-200">{tg.easy.title}</div>
                          <div className="flex items-center justify-between gap-1.5 mt-2">
                            {renderTypeBadge(tg.easy.taskType)}
                            <span className="text-[10px] text-emerald-400 font-mono">Max 70%</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-[11px]">— відсутній / відфільтровано —</span>
                      )}
                    </td>

                    {/* MEDIUM TD */}
                    <td className="py-3 px-3 align-top">
                      {tg.medium && (difficultyFilter === 'ALL' || difficultyFilter === 'MEDIUM') ? (
                        <div
                          onClick={() => tg.medium && onSelectTask(tg.medium.id)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                            selectedTaskId === tg.medium.id
                              ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-500/50'
                              : 'bg-slate-950/80 border-slate-800/80 hover:border-amber-500/40'
                          }`}
                        >
                          <div className="font-semibold text-slate-200">{tg.medium.title}</div>
                          <div className="flex items-center justify-between gap-1.5 mt-2">
                            {renderTypeBadge(tg.medium.taskType)}
                            <span className="text-[10px] text-amber-400 font-mono">Max 100%</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-[11px]">— відсутній / відфільтровано —</span>
                      )}
                    </td>

                    {/* HARD TD */}
                    <td className="py-3 px-3 align-top">
                      {tg.hard && (difficultyFilter === 'ALL' || difficultyFilter === 'HARD') ? (
                        <div
                          onClick={() => tg.hard && onSelectTask(tg.hard.id)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                            selectedTaskId === tg.hard.id
                              ? 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-500/50'
                              : 'bg-slate-950/80 border-slate-800/80 hover:border-rose-500/40'
                          }`}
                        >
                          <div className="font-semibold text-slate-200">{tg.hard.title}</div>
                          <div className="flex items-center justify-between gap-1.5 mt-2">
                            {renderTypeBadge(tg.hard.taskType)}
                            <span className="text-[10px] text-rose-400 font-mono">Max 100%</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-[11px]">— відсутній / відфільтровано —</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📌 Task Inspector: Sliding Right-Hand Drawer (Slide-Over Panel below Sticky Header) */}
      {activeTask && (
        <aside className="fixed right-0 top-14 bottom-0 w-full sm:w-[480px] lg:w-[540px] bg-slate-900 border-l border-indigo-500/30 shadow-2xl z-20 flex flex-col overflow-hidden animate-slideInRight">
          {/* Drawer Top Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-3 shrink-0">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {renderDifficultyBadge(activeTask.difficulty)}
                  {renderTypeBadge(activeTask.taskType)}
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    {activeTask.topic || 'general'} ➔ {activeTask.subConcept || 'core'}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white leading-snug">{activeTask.title}</h2>
              </div>
              <button
                onClick={() => onSelectTask('')}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Закрити бічну панель інспектора"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
              {/* Task Description */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Умова Завдання:</span>
                </h4>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
                  {activeTask.description}
                </div>
              </div>

              {/* Starter Code Preview */}
              {activeTask.starterCode && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Стартовий Шаблон Коду:</span>
                  </h4>
                  <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
                    {activeTask.starterCode}
                  </pre>
                </div>
              )}

              {/* Quiz Options Preview */}
              {activeTask.options && Array.isArray(activeTask.options) && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                    <span>Варіанти Відповідей:</span>
                  </h4>
                  <div className="flex flex-col gap-2">
                    {activeTask.options.map((opt: any, i: number) => (
                      <div
                        key={opt.id || i}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
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
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Тест-кейси ({activeTask.testCases.length}):</span>
                    </h4>
                    {activeTask.testCases.some((tc) => tc.isSecret) && (
                      <span className="text-[10px] text-rose-300 font-mono bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        🔒 Захист Secret-тестами
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {activeTask.testCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl font-mono text-xs flex flex-col gap-1 border ${
                          tc.isSecret
                            ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">Тест #{idx + 1}</span>
                          {tc.isSecret && (
                            <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                              SECRET
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] truncate">
                          <span className="text-slate-500">Вхід:</span>{' '}
                          <code className="text-white">{tc.input}</code>
                        </div>
                        <div className="text-[11px] truncate">
                          <span className="text-slate-500">Очікується:</span>{' '}
                          <code className="text-emerald-400">{tc.expectedOutput}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Bottom Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
              <span>BKT ID: {activeTask.id.slice(0, 8)}...</span>
              <button
                onClick={() => onSelectTask('')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-sans text-xs transition-colors cursor-pointer"
              >
                Закрити
              </button>
            </div>
          </aside>
      )}
    </div>
  );
}
