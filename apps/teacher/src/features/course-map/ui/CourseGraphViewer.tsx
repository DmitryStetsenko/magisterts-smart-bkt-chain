'use client';

import React, { useState, useMemo } from 'react';
import { SkillNodeDto, TaskDto } from '@sbc/types';
import {
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Code,
  CheckSquare,
  FileText,
  Search,
  Layers,
  Tag,
  Zap,
  FolderTree,
  X,
  GitBranch
} from 'lucide-react';
import { SubConceptsPopover } from './SubConceptsPopover';

export type TaskItem = TaskDto;
export type SkillNodeItem = Pick<SkillNodeDto, 'id' | 'slug' | 'title' | 'description' | 'category' | 'difficulty'>;

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
  const [viewMode, setViewMode] = useState<'full' | 'tree' | 'triads'>('full');
  const [expandedSkillSlugs, setExpandedSkillSlugs] = useState<string[]>(skills.map(s => s.slug));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubConcepts, setSelectedSubConcepts] = useState<string[]>([]);

  const toggleSubConcept = (sc: string) => {
    setSelectedSubConcepts((prev) =>
      prev.includes(sc) ? prev.filter((item) => item !== sc) : [...prev, sc]
    );
  };

  const selectAllTopicSubConcepts = (scs: string[]) => {
    setSelectedSubConcepts((prev) => Array.from(new Set([...prev, ...scs])));
  };

  const clearTopicSubConcepts = (scs: string[]) => {
    setSelectedSubConcepts((prev) => prev.filter((item) => !scs.includes(item)));
  };

  const clearAllSubConcepts = () => {
    setSelectedSubConcepts([]);
  };

  const matchesSearchQuery = (task?: TaskItem) => {
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

  const matchesSubConceptFilter = (task?: TaskItem) => {
    if (!task) return false;
    if (selectedSubConcepts.length === 0) return true;
    return Boolean(task.subConcept && selectedSubConcepts.includes(task.subConcept));
  };

  const matchesAllFilters = (task?: TaskItem) => {
    if (!task) return false;
    return matchesSearchQuery(task) && matchesSubConceptFilter(task);
  };

  const toggleSkillExpand = (slug: string) => {
    setExpandedSkillSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const expandAll = () => {
    setExpandedSkillSlugs(skills.map((s) => s.slug));
  };

  const collapseAll = () => {
    setExpandedSkillSlugs([]);
  };

  // Group all tasks across ALL skills into hierarchic syllabus
  const fullCourseTree = useMemo(() => {
    return skills.map((skill, idx) => {
      const skillTasks = allTasks.filter(
        (t: any) => t.skillId === skill.id || t.skill?.id === skill.id
      );

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

  const activeSkill = useMemo(() => {
    return skills.find((s) => s.slug === selectedSkillSlug) || skills[0];
  }, [skills, selectedSkillSlug]);

  const activeSkillTasks = useMemo(() => {
    if (!activeSkill) return [];
    return allTasks.filter((t: any) => t.skillId === activeSkill.id || t.skill?.id === activeSkill.id);
  }, [activeSkill, allTasks]);

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

  const activeTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return allTasks.find((t) => t.id === selectedTaskId) || null;
  }, [selectedTaskId, allTasks]);

  const renderTypeBadge = (type: string) => {
    switch (type) {
      case 'SINGLE_CHOICE':
        return (
          <span className="inline-flex items-center gap-1 text-blue-400 text-[10px] font-medium">
            <HelpCircle className="w-2.5 h-2.5" /> Тест
          </span>
        );
      case 'MULTIPLE_CHOICE':
        return (
          <span className="inline-flex items-center gap-1 text-purple-400 text-[10px] font-medium">
            <CheckSquare className="w-2.5 h-2.5" /> Вибір
          </span>
        );
      case 'TEXT_ESSAY':
        return (
          <span className="inline-flex items-center gap-1 text-amber-400 text-[10px] font-medium">
            <FileText className="w-2.5 h-2.5" /> Есе
          </span>
        );
      case 'CODE':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-medium">
            <Code className="w-2.5 h-2.5" /> Код
          </span>
        );
    }
  };

  const renderDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'HARD':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>Складне (100%)</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>Нормальне (100%)</span>
          </span>
        );
      case 'EASY':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Полегшене (70%)</span>
          </span>
        );
    }
  };

  const renderTriadRow = (tg: {
    topic: string;
    subConcepts: string[];
    easy?: TaskItem;
    medium?: TaskItem;
    hard?: TaskItem;
    all: TaskItem[];
  }) => {
    // If filters are active, check if ANY task in tg.all matches
    const hasAnyMatchingTask = tg.all.some(matchesAllFilters);
    if ((searchQuery || selectedSubConcepts.length > 0) && !hasAnyMatchingTask) {
      return null;
    }

    // Find best matching task for each difficulty from tg.all
    const easyTasks = tg.all.filter((t) => t.difficulty === 'EASY');
    const mediumTasks = tg.all.filter((t) => t.difficulty === 'MEDIUM');
    const hardTasks = tg.all.filter((t) => t.difficulty === 'HARD');

    const hasFilters = Boolean(searchQuery || selectedSubConcepts.length > 0);
    const activeEasy = hasFilters
      ? easyTasks.find(matchesAllFilters)
      : easyTasks[0];
    const activeMedium = hasFilters
      ? mediumTasks.find(matchesAllFilters)
      : mediumTasks[0];
    const activeHard = hasFilters
      ? hardTasks.find(matchesAllFilters)
      : hardTasks[0];

    const isEasyVisible = activeEasy && (difficultyFilter === 'ALL' || difficultyFilter === 'EASY');
    const isMediumVisible = activeMedium && (difficultyFilter === 'ALL' || difficultyFilter === 'MEDIUM');
    const isHardVisible = activeHard && (difficultyFilter === 'ALL' || difficultyFilter === 'HARD');

    if (difficultyFilter !== 'ALL' && !isEasyVisible && !isMediumVisible && !isHardVisible) {
      return null;
    }

    return (
      <div
        key={tg.topic}
        className="py-3.5 first:pt-2 last:pb-2 border-b border-slate-800/60 last:border-b-0 flex flex-col lg:flex-row items-stretch gap-4"
      >
        {/* Left: Topic Name & Subconcepts (Borderless flat column) */}
        <div className="lg:w-60 shrink-0 flex flex-col justify-between pr-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200 font-mono break-all">
                {tg.topic}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                ({tg.all.length})
              </span>
            </div>

            <SubConceptsPopover
              subConcepts={tg.subConcepts}
              selectedSubConcepts={selectedSubConcepts}
              onToggleSubConcept={toggleSubConcept}
              onSelectAllTopic={selectAllTopicSubConcepts}
              onClearTopic={clearTopicSubConcepts}
              className="mt-1"
            />
          </div>
        </div>

        {/* Right: Question Cards (Easy, Medium, Hard) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* 🟢 Easy */}
          {isEasyVisible && activeEasy ? (
            <div
              onClick={() => onSelectTask(activeEasy.id)}
              className={`p-3 rounded-lg border flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                selectedTaskId === activeEasy.id
                  ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>EASY · 70%</span>
                </span>
                {renderTypeBadge(activeEasy.taskType)}
              </div>
              <div className="text-xs font-medium text-slate-200 line-clamp-2">
                {activeEasy.title}
              </div>
              {activeEasy.subConcept && (
                <div className="text-[10px] font-mono text-slate-500 truncate">
                  {activeEasy.subConcept}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-dashed border-slate-800/40 flex items-center justify-center text-[10px] font-mono text-slate-600">
              — Немає EASY —
            </div>
          )}

          {/* 🟡 Medium */}
          {isMediumVisible && activeMedium ? (
            <div
              onClick={() => onSelectTask(activeMedium.id)}
              className={`p-3 rounded-lg border flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                selectedTaskId === activeMedium.id
                  ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-amber-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>MEDIUM · 100%</span>
                </span>
                {renderTypeBadge(activeMedium.taskType)}
              </div>
              <div className="text-xs font-medium text-slate-200 line-clamp-2">
                {activeMedium.title}
              </div>
              {activeMedium.subConcept && (
                <div className="text-[10px] font-mono text-slate-500 truncate">
                  {activeMedium.subConcept}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-dashed border-slate-800/40 flex items-center justify-center text-[10px] font-mono text-slate-600">
              — Немає MEDIUM —
            </div>
          )}

          {/* 🔴 Hard */}
          {isHardVisible && activeHard ? (
            <div
              onClick={() => onSelectTask(activeHard.id)}
              className={`p-3 rounded-lg border flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                selectedTaskId === activeHard.id
                  ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/40'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-rose-500/40 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold text-rose-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>HARD · 100%</span>
                </span>
                {renderTypeBadge(activeHard.taskType)}
              </div>
              <div className="text-xs font-medium text-slate-200 line-clamp-2">
                {activeHard.title}
              </div>
              {activeHard.subConcept && (
                <div className="text-[10px] font-mono text-slate-500 truncate">
                  {activeHard.subConcept}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-dashed border-slate-800/40 flex items-center justify-center text-[10px] font-mono text-slate-600">
              — Немає HARD —
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 🧭 Unified Clean Control Bar */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-800/80">
        {/* Top Row: View Mode Switcher & Search / Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View Mode Toggle Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800/80">
            <button
              onClick={() => setViewMode('full')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'full'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Повне Дерево ({allTasks.length})</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Фокус Модуля</span>
            </button>
            <button
              onClick={() => setViewMode('triads')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'triads'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Матриця Блума</span>
            </button>
          </div>

          {/* Search & Difficulty Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
              <input
                type="text"
                placeholder="Пошук завдання, підконцепту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer transition-colors"
                  title="Очистити фільтр"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={difficultyFilter}
              onChange={(e: any) => setDifficultyFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-purple-500 font-mono"
            >
              <option value="ALL">Всі рівні</option>
              <option value="EASY">Полегшені</option>
              <option value="MEDIUM">Нормальні</option>
              <option value="HARD">Складні</option>
            </select>

            {viewMode === 'full' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={expandAll}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-[11px] transition-all cursor-pointer"
                >
                  + Всі
                </button>
                <button
                  onClick={collapseAll}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-[11px] transition-all cursor-pointer"
                >
                  − Згорнути
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Subconcept Multi-Filter Badges */}
        {selectedSubConcepts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 pb-0.5 border-t border-slate-800/60 animate-fadeIn">
            <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Фільтр підконцептів ({selectedSubConcepts.length}):</span>
            </span>
            {selectedSubConcepts.map((sc) => (
              <span
                key={sc}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 border border-purple-500/40 text-purple-200"
              >
                <span>{sc}</span>
                <button
                  type="button"
                  onClick={() => toggleSubConcept(sc)}
                  className="text-purple-400 hover:text-white cursor-pointer"
                  title={`Видалити ${sc} з фільтра`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAllSubConcepts}
              className="text-[10px] font-mono text-slate-400 hover:text-rose-300 hover:underline cursor-pointer ml-1"
            >
              Скинути всі
            </button>
          </div>
        )}

        {/* Module Stepper Bar (Clean Horizontal Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin scrollbar-thumb-slate-800">
          {skills.map((skill, idx) => {
            const isSelected = skill.slug === activeSkill?.slug;
            const skillTasksCount = allTasks.filter(
              (t: any) => t.skillId === skill.id || t.skill?.id === skill.id
            ).length;

            return (
              <button
                key={skill.id}
                onClick={() => {
                  onSelectSkill(skill.slug);
                  setSelectedTopic(null);
                  if (viewMode === 'full' && !expandedSkillSlugs.includes(skill.slug)) {
                    setExpandedSkillSlugs((prev) => [...prev, skill.slug]);
                  }
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg border transition-all text-left flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/60 text-white'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold ${
                    isSelected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="text-xs font-medium truncate max-w-[220px]">{skill.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">({skillTasksCount})</span>
              </button>
            );
          })}
        </div>

        {/* Topic Pills (Only when focusing a single module in 'tree' or 'triads' view) */}
        {viewMode !== 'full' && availableTopics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-purple-400" />
              <span>Теми:</span>
            </span>
            <button
              onClick={() => setSelectedTopic(null)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                selectedTopic === null
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Усі ({activeSkillTasks.length})
            </button>
            {availableTopics.map((topic) => {
              const count = topicTriads[topic]?.all.length || 0;
              const isTopSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(isTopSelected ? null : topic)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                    isTopSelected
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{topic}</span>
                  <span className="text-[9px] text-slate-500">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 🌳 MAIN CONTENT: Clean Flat Sections without nested outer boxes */}
      {viewMode === 'full' ? (
        <div className="flex flex-col divide-y divide-slate-800/80">
          {fullCourseTree.map((item) => {
            const isExpanded = expandedSkillSlugs.includes(item.skill.slug);

            const matchingTopics = item.topics.filter((tg) => {
              if (selectedSubConcepts.length === 0 && !searchQuery && difficultyFilter === 'ALL') {
                return true;
              }
              return tg.all.some(matchesAllFilters);
            });

            if ((searchQuery || selectedSubConcepts.length > 0) && matchingTopics.length === 0) return null;

            return (
              <div key={item.skill.id} className="py-3 first:pt-0">
                {/* Clean Module Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSkillExpand(item.skill.slug)}
                  className="w-full py-2 flex items-center justify-between gap-4 cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-mono font-bold text-xs text-purple-300 shrink-0">
                      {item.order}
                    </span>
                    <div className="min-w-0 flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {item.skill.title}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">
                        {item.skill.slug}
                      </span>
                      {item.skill.description && (
                        <span className="hidden xl:inline text-xs text-slate-500 truncate max-w-md">
                          — {item.skill.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.topics.length} тем · {item.tasksCount} завд.
                    </span>
                    <span className="text-slate-400 group-hover:text-white transition-colors">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                  </div>
                </button>

                {/* Module Topics List */}
                {isExpanded && (
                  <div className="mt-1 pl-2 sm:pl-4 border-l border-slate-800/80 flex flex-col">
                    {matchingTopics.map((tg) => renderTriadRow(tg))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : viewMode === 'tree' ? (
        <div className="flex flex-col">
          {/* Active Module Header */}
          <div className="pb-3 mb-2 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{activeSkill?.title}</h3>
                <span className="text-[11px] font-mono text-purple-400">{activeSkill?.slug}</span>
              </div>
              {activeSkill?.description && (
                <p className="text-xs text-slate-400 mt-0.5">{activeSkill.description}</p>
              )}
            </div>
            <span className="text-xs font-mono text-slate-400">
              {Object.keys(topicTriads).length} тем · {activeSkillTasks.length} завдань
            </span>
          </div>

          <div className="flex flex-col">
            {Object.values(topicTriads)
              .filter((tg) => selectedTopic === null || tg.topic === selectedTopic)
              .map((tg) => renderTriadRow(tg))}
          </div>
        </div>
      ) : (
        /* Bloom Triads Matrix Comparison Table (Clean Flat Table) */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 pr-4">Тематична Гілка & Підконцепти</th>
                <th className="py-2.5 px-3 text-emerald-400">
                  <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />EASY (70%)</span>
                </th>
                <th className="py-2.5 px-3 text-amber-400">
                  <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />MEDIUM (100%)</span>
                </th>
                <th className="py-2.5 pl-3 text-rose-400">
                  <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" />HARD (100%)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {Object.values(topicTriads)
                .filter((tg) => selectedTopic === null || tg.topic === selectedTopic)
                .filter((tg) => {
                  if (selectedSubConcepts.length === 0 && !searchQuery && difficultyFilter === 'ALL') {
                    return true;
                  }
                  return tg.all.some(matchesAllFilters);
                })
                .map((tg) => {
                  const easyTasks = tg.all.filter((t) => t.difficulty === 'EASY');
                  const mediumTasks = tg.all.filter((t) => t.difficulty === 'MEDIUM');
                  const hardTasks = tg.all.filter((t) => t.difficulty === 'HARD');

                  const hasFilters = Boolean(searchQuery || selectedSubConcepts.length > 0);
                  const activeEasy = hasFilters
                    ? easyTasks.find(matchesAllFilters)
                    : easyTasks[0];
                  const activeMedium = hasFilters
                    ? mediumTasks.find(matchesAllFilters)
                    : mediumTasks[0];
                  const activeHard = hasFilters
                    ? hardTasks.find(matchesAllFilters)
                    : hardTasks[0];

                  const isEasyVisible = activeEasy && (difficultyFilter === 'ALL' || difficultyFilter === 'EASY');
                  const isMediumVisible = activeMedium && (difficultyFilter === 'ALL' || difficultyFilter === 'MEDIUM');
                  const isHardVisible = activeHard && (difficultyFilter === 'ALL' || difficultyFilter === 'HARD');

                  return (
                    <tr key={tg.topic} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 pr-4 align-top w-60">
                        <div className="font-mono text-slate-200 font-bold">{tg.topic}</div>
                        <SubConceptsPopover
                          subConcepts={tg.subConcepts}
                          selectedSubConcepts={selectedSubConcepts}
                          onToggleSubConcept={toggleSubConcept}
                          onSelectAllTopic={selectAllTopicSubConcepts}
                          onClearTopic={clearTopicSubConcepts}
                          className="mt-1"
                        />
                      </td>

                      <td className="py-3 px-3 align-top">
                        {isEasyVisible && activeEasy ? (
                          <div
                            onClick={() => onSelectTask(activeEasy.id)}
                            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                              selectedTaskId === activeEasy.id
                                ? 'bg-emerald-950/40 border-emerald-500/60'
                                : 'bg-slate-900/40 border-slate-800/80 hover:border-emerald-500/40'
                            }`}
                          >
                            <div className="font-medium text-slate-200">{activeEasy.title}</div>
                            <div className="flex items-center justify-between gap-1.5 mt-1.5">
                              {renderTypeBadge(activeEasy.taskType)}
                              <span className="text-[10px] text-slate-500 font-mono">{activeEasy.subConcept}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 align-top">
                        {isMediumVisible && activeMedium ? (
                          <div
                            onClick={() => onSelectTask(activeMedium.id)}
                            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                              selectedTaskId === activeMedium.id
                                ? 'bg-amber-950/40 border-amber-500/60'
                                : 'bg-slate-900/40 border-slate-800/80 hover:border-amber-500/40'
                            }`}
                          >
                            <div className="font-medium text-slate-200">{activeMedium.title}</div>
                            <div className="flex items-center justify-between gap-1.5 mt-1.5">
                              {renderTypeBadge(activeMedium.taskType)}
                              <span className="text-[10px] text-slate-500 font-mono">{activeMedium.subConcept}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 pl-3 align-top">
                        {isHardVisible && activeHard ? (
                          <div
                            onClick={() => onSelectTask(activeHard.id)}
                            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                              selectedTaskId === activeHard.id
                                ? 'bg-rose-950/40 border-rose-500/60'
                                : 'bg-slate-900/40 border-slate-800/80 hover:border-rose-500/40'
                            }`}
                          >
                            <div className="font-medium text-slate-200">{activeHard.title}</div>
                            <div className="flex items-center justify-between gap-1.5 mt-1.5">
                              {renderTypeBadge(activeHard.taskType)}
                              <span className="text-[10px] text-slate-500 font-mono">{activeHard.subConcept}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* 📌 Task Inspector: Sliding Right-Hand Drawer */}
      {activeTask && (
        <aside className="fixed right-0 top-[62px] bottom-0 w-full sm:w-[460px] lg:w-[520px] bg-slate-900 border-l border-slate-800 shadow-2xl z-20 flex flex-col overflow-hidden animate-slideInRight">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3 shrink-0">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {renderDifficultyBadge(activeTask.difficulty)}
                {renderTypeBadge(activeTask.taskType)}
                <span className="text-[10px] font-mono text-slate-400">
                  {activeTask.topic || 'general'} / {activeTask.subConcept || 'core'}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white leading-snug">{activeTask.title}</h2>
            </div>
            <button
              onClick={() => onSelectTask('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              title="Закрити інспектор"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 divide-y divide-slate-800/60">
            <div className="flex flex-col gap-1.5">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Умова Завдання
              </h4>
              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {activeTask.description}
              </div>
            </div>

            {activeTask.starterCode && (
              <div className="pt-3 flex flex-col gap-1.5">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Стартовий Шаблон Коду
                </h4>
                <pre className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
                  {activeTask.starterCode}
                </pre>
              </div>
            )}

            {activeTask.options && Array.isArray(activeTask.options) && (
              <div className="pt-3 flex flex-col gap-1.5">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Варіанти Відповідей
                </h4>
                <div className="flex flex-col gap-1.5">
                  {activeTask.options.map((opt: any, i: number) => (
                    <div
                      key={opt.id || i}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                        opt.isCorrect
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-medium'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <span>{opt.text}</span>
                      {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTask.testCases && activeTask.testCases.length > 0 && (
              <div className="pt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Тест-кейси ({activeTask.testCases.length})</span>
                  </h4>
                  {activeTask.testCases.some((tc) => tc.isSecret) && (
                    <span className="text-[10px] text-rose-300 font-mono">
                      🔒 Secret-тести
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  {activeTask.testCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg font-mono text-xs flex flex-col gap-1 border ${
                        tc.isSecret
                          ? 'bg-rose-950/15 border-rose-500/30 text-rose-300'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Тест #{idx + 1}</span>
                        {tc.isSecret && <span className="text-rose-400">SECRET</span>}
                      </div>
                      <div className="text-[11px] truncate">
                        <span className="text-slate-500">Вхід:</span> <code className="text-white">{tc.input}</code>
                      </div>
                      <div className="text-[11px] truncate">
                        <span className="text-slate-500">Очікується:</span> <code className="text-emerald-400">{tc.expectedOutput}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
