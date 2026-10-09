'use client';

import React, { useState, useEffect } from 'react';
import { Network, HelpCircle, CheckCircle2, ChevronRight, ChevronDown, Code, CheckSquare, FileText, List, Layers, Search, Sparkles } from 'lucide-react';

export interface TaskItem {
  id: string;
  taskType: 'CODE' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT_ESSAY';
  title: string;
  description: string;
  difficulty: string;
  options?: any;
  testCases?: Array<{ input: string; expectedOutput: string }>;
}

export interface SkillNodeItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  parentDependencies?: Array<{ parentSkillId: string }>;
  tasks?: TaskItem[];
}

export interface CourseData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  skills: SkillNodeItem[];
}

interface CourseOverviewWidgetProps {
  courseSlug: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function CourseOverviewWidget({ courseSlug }: CourseOverviewWidgetProps) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchCourseAndTasks = async () => {
      setIsLoading(true);
      try {
        const [courseRes, tasksRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/courses/${courseSlug}`),
          fetch(`${API_URL}/api/v1/tasks?courseSlug=${courseSlug}`),
        ]);

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourse(courseData);

          // Default expand all skills
          const initialExpanded: Record<string, boolean> = {};
          if (Array.isArray(courseData.skills)) {
            courseData.skills.forEach((s: SkillNodeItem) => {
              initialExpanded[s.id] = true;
            });
          }
          setExpandedSkills(initialExpanded);
        }

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setAllTasks(tasksData);
        }
      } catch (err) {
        console.error('Error fetching course overview details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndTasks();
  }, [courseSlug]);

  const toggleSkill = (skillId: string) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [skillId]: !prev[skillId],
    }));
  };

  const getTaskTypeBadge = (taskType: string) => {
    switch (taskType) {
      case 'SINGLE_CHOICE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium">
            <HelpCircle className="w-3 h-3" /> Тест (Single)
          </span>
        );
      case 'MULTIPLE_CHOICE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-medium">
            <CheckSquare className="w-3 h-3" /> Чекбокси (Multi)
          </span>
        );
      case 'TEXT_ESSAY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium">
            <FileText className="w-3 h-3" /> Есе / Текст
          </span>
        );
      case 'CODE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <Code className="w-3 h-3" /> Практичний Код
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-400 font-medium">Завантаження карти курсу та ієрархії питань...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400 text-sm">
        Курс не знайдено або відсутні доступні модулі.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col gap-4 p-6">
      {/* Widget Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Карта Навичок та Питань Курсу</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {course.skills.length} Модулів
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {course.title} — повне ієрархічне дерево модулів (DAG) та пов'язаних завдань
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Пошук завдань та модулів..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Modules Tree List */}
      <div className="flex flex-col gap-4">
        {course.skills.map((skill, index) => {
          const skillTasks = allTasks.filter((t: any) => t.skillId === skill.id || t.skill?.id === skill.id);
          const filteredTasks = skillTasks.filter(
            (t) =>
              t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.description.toLowerCase().includes(searchQuery.toLowerCase()),
          );

          const isExpanded = expandedSkills[skill.id] !== false;

          return (
            <div key={skill.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl overflow-hidden">
              {/* Module Node Banner */}
              <button
                onClick={() => toggleSkill(skill.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-900/80 transition-colors text-left border-b border-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{skill.title}</span>
                      <span className="text-[11px] font-mono text-slate-500">({skill.slug})</span>
                    </h3>
                    {skill.description && <p className="text-xs text-slate-400 mt-0.5">{skill.description}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                    {skillTasks.length} завдань
                  </span>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Tasks List under Module */}
              {isExpanded && (
                <div className="p-4 flex flex-col gap-3 bg-slate-950/40">
                  {filteredTasks.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 italic text-center">
                      Завдань у даному модулі не знайдено.
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getTaskTypeBadge(task.taskType)}
                            <h4 className="text-xs font-bold text-slate-200">{task.title}</h4>
                          </div>

                          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {task.difficulty}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>

                        {/* Options preview for test tasks */}
                        {task.options && Array.isArray(task.options) && (
                          <div className="mt-1 pt-2 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {task.options.map((opt: any, optIdx: number) => (
                              <div
                                key={opt.id || optIdx}
                                className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center justify-between ${
                                  opt.isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-medium'
                                    : 'bg-slate-900 border-slate-800 text-slate-400'
                                }`}
                              >
                                <span>{opt.text}</span>
                                {opt.isCorrect && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
