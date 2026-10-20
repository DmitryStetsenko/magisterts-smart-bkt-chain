'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Brain, Sparkles, CheckCircle, AlertCircle, RefreshCw, User, Code2, BookOpen, Scale, ChevronDown, ArrowRight, AlertTriangle, X, Settings, Network, Compass, Flame, History, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import { MonacoCodeEditor } from '../features/code-editor/ui/MonacoCodeEditor';
import { QuizTaskEditor } from '../features/quiz-editor/ui/QuizTaskEditor';
import { EssayTaskEditor } from '../features/essay-editor/ui/EssayTaskEditor';
import { SkillDagMap } from '../features/skill-graph/ui/SkillDagMap';
import { GameSkillTreeWidget, SkillGraphNode } from '@sbc/ui';

interface TaskDetail {
  id: string;
  taskType: 'CODE' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT_ESSAY';
  title: string;
  description: string;
  starterCode?: string;
  options?: any;
  difficulty: string;
  topic?: string | null;
  subConcept?: string | null;
  skill: {
    id: string;
    slug: string;
    title: string;
  };
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

interface CourseItem {
  slug: string;
  title: string;
  description?: string;
  category?: string;
}

const DEFAULT_COURSES: CourseItem[] = [
  { slug: 'js-dev', title: 'JavaScript & Web Dev', category: 'Programming' },
  { slug: 'english-b2', title: 'Business & Tech English (B2)', category: 'Languages' },
  { slug: 'ukraine-law', title: 'Правознавство України', category: 'Jurisprudence' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function StudentPortalPage() {
  const [courses, setCourses] = useState<CourseItem[]>(DEFAULT_COURSES);
  const [activeCourseSlug, setActiveCourseSlug] = useState<string>('js-dev');
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [exhaustedModalData, setExhaustedModalData] = useState<{ skillId: string; skillTitle: string } | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/courses`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCourses(data);
            if (!data.some((c: any) => c.slug === activeCourseSlug)) {
              setActiveCourseSlug(data[0].slug);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching courses list:', err);
      }
    };
    fetchCourses();
  }, []);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [essayAnswer, setEssayAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [graphNodes, setGraphNodes] = useState<SkillGraphNode[]>([]);
  const [studentAdjustments, setStudentAdjustments] = useState<any[]>([]);

  // Task Submissions History & Drawer Sub-tab ('condition' | 'history')
  const [taskSubmissions, setTaskSubmissions] = useState<any[]>([]);
  const [taskDrawerSubTab, setTaskDrawerSubTab] = useState<'condition' | 'history'>('condition');

  const fetchTaskSubmissions = async (taskId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/tasks/${taskId}/submissions?userId=demo-student`);
      if (res.ok) {
        const data = await res.json();
        setTaskSubmissions(data);
      }
    } catch (err) {
      console.error('Error fetching task submissions:', err);
    }
  };

  const fetchCourseStructureAndState = async (courseSlug: string) => {
    try {
      const courseRes = await fetch(`${API_URL}/api/v1/courses/${courseSlug}`);
      const bktRes = await fetch(`${API_URL}/api/v1/bkt/state/demo-student`);
      const analyticsRes = await fetch(`${API_URL}/api/v1/bkt/analytics/students?courseSlug=${courseSlug}`);

      let bktMap: Record<string, number> = {};
      if (bktRes.ok) {
        const states: Array<{ skillId: string; pMastery: number }> = await bktRes.json();
        states.forEach((s) => {
          bktMap[s.skillId] = s.pMastery;
        });
      }

      let adjustments: any[] = [];
      let telemetryBySkill: Record<string, any> = {};
      if (analyticsRes.ok) {
        const studentsList: any[] = await analyticsRes.json();
        const demoStudent = studentsList.find((s) => s.id === 'demo-student' || s.email?.includes('demo') || s.name?.includes('Demo')) || studentsList[0];
        if (demoStudent) {
          adjustments = demoStudent.recentAdjustments || [];
          telemetryBySkill = demoStudent.telemetryBySkill || {};
          setStudentAdjustments(adjustments);
        }
      }

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        const mappedNodes: SkillGraphNode[] = courseData.skills.map((skill: any) => {
          const p = bktMap[skill.id] ?? 0.0;
          const isMastered = p >= 0.95;
          const parentIds = skill.parentDependencies?.map((d: any) => d.parentSkillId) || [];
          const parentMastered =
            parentIds.length === 0 || parentIds.every((pid: string) => (bktMap[pid] ?? 0) >= 0.95);

          const skillAdjustments = adjustments.filter(
            (a) => a.skillSlug === skill.slug || a.skillTitle === skill.title
          );
          const hasGuess = skillAdjustments.some((a) => Boolean(a.pGuessUsed && a.pGuessUsed > 0.3));
          const hasSlip = skillAdjustments.some((a) => Boolean(a.pSlipUsed && a.pSlipUsed > 0.2));

          return {
            id: skill.id,
            slug: skill.slug,
            title: skill.title,
            description: skill.description,
            pMastery: p,
            status: isMastered ? 'MASTERED' : parentMastered ? 'IN_PROGRESS' : 'LOCKED',
            parentSkillIds: parentIds,
            tasks: skill.tasks || [],
            tasksCount: skill.tasks?.length || 0,
            telemetry: telemetryBySkill[skill.slug] || undefined,
            recentAdjustments: skillAdjustments,
            hasGuessAnomaly: hasGuess,
            hasCopyPasteAnomaly: (telemetryBySkill[skill.slug]?.copyPasteRatio || 0) >= 0.6,
          };
        });

        setGraphNodes(mappedNodes);
      }
    } catch (err) {
      console.error('Error fetching course structure:', err);
    }
  };

  const fetchRecommendedTask = async (courseSlug: string) => {
    setIsLoading(true);
    setEvalResult(null);
    try {
      await fetchCourseStructureAndState(courseSlug);
      const res = await fetch(`${API_URL}/api/v1/tasks/recommended?courseSlug=${courseSlug}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setRecommendation(data.recommendation);
        setCode(data.task.starterCode || '');
        setEssayAnswer('');

        if (data.recommendation?.isExhausted || data.recommendation?.reason === 'MODULE_TASKS_EXHAUSTED') {
          setExhaustedModalData({
            skillId: data.recommendation.recommendedSkill.id,
            skillTitle: data.recommendation.recommendedSkill.title,
          });
        }
        if (data.task?.id) {
          fetchTaskSubmissions(data.task.id);
        }
      } else {
        setTask(null);
        setTaskSubmissions([]);
      }
    } catch (err) {
      console.error('Error fetching task:', err);
      setTask(null);
      setTaskSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSkillReset = async () => {
    if (!exhaustedModalData) return;
    try {
      await fetch(`${API_URL}/api/v1/bkt/reset-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-student',
          skillId: exhaustedModalData.skillId,
        }),
      });
    } catch (err) {
      console.error('Error resetting skill progress:', err);
    } finally {
      setExhaustedModalData(null);
      await fetchRecommendedTask(activeCourseSlug);
    }
  };

  useEffect(() => {
    fetchRecommendedTask(activeCourseSlug);
  }, [activeCourseSlug]);

  useEffect(() => {
    const socket = io(`${API_URL}/telemetry`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    if (socket) {
      socket.on('connect', () => {
        socket.emit('join_session', { userId: 'demo-student', taskId: task?.id || 'default' });
      });

      socket.on('bkt_state_reset', (data: { userId: string; skillId?: string }) => {
        console.log('⚡ Received bkt_state_reset via WebSocket:', data);
        fetchRecommendedTask(activeCourseSlug);
      });

      socket.on('teacher_review_decision', (data: any) => {
        console.log('⚡ Received teacher_review_decision via WebSocket:', data);
        fetchCourseStructureAndState(activeCourseSlug);
        if (task?.id) {
          fetchTaskSubmissions(task.id);
        }
        // If decision matches current active task or submission, update live evalResult
        if (task && (!data.taskId || data.taskId === task.id)) {
          const isApproved = data.decision === 'APPROVE';
          setEvalResult((prev: any) => {
            if (!prev) return null;
            return {
              ...prev,
              isPassed: isApproved,
              teacherReviewStatus: isApproved ? 'APPROVED' : 'REJECTED',
              feedback: isApproved
                ? (data.comment ? `Затверджено викладачем: "${data.comment}"` : 'Відповідь перевірено та затверджено викладачем!')
                : (data.comment ? `Відхилено викладачем: "${data.comment}"` : 'Відповідь відхилено викладачем. Потрібно внести виправлення.'),
              teacherComment: data.comment || prev.teacherComment,
              semanticScore: data.scoreOverride !== undefined && data.scoreOverride !== null ? data.scoreOverride : prev.semanticScore,
            };
          });
        }
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [activeCourseSlug, task?.id]);

  const handleEvaluate = async (customPayload?: any) => {
    if (!task) return;
    setIsSubmitting(true);
    try {
      const payload = customPayload || {
        taskId: task.id,
        code,
        essayAnswer,
      };

      const res = await fetch(`${API_URL}/api/v1/bkt/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          ...payload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvalResult(data);
        await Promise.all([
          fetchCourseStructureAndState(activeCourseSlug),
          fetchTaskSubmissions(task.id),
        ]);
      }
    } catch (err) {
      console.error('Error evaluating task submission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unified Navigation State:
  // activeTab defines which workspace / module is active.
  // isDrawerOpen controls whether its companion sidebar drawer is visible.
  type StudentTab = 'task' | 'bkt' | 'tree' | 'settings';
  const [activeTab, setActiveTab] = useState<StudentTab>('task');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [mainView, setMainView] = useState<'editor' | 'tree'>('editor');
  const [inspectedSkill, setInspectedSkill] = useState<SkillGraphNode | null>(null);

  const handleTabClick = (tab: StudentTab) => {
    if (activeTab === tab) {
      // Toggle sidebar open/collapsed without changing active workspace
      setIsDrawerOpen((prev) => !prev);
    } else {
      // Switch workspace & ensure drawer is open
      setActiveTab(tab);
      setIsDrawerOpen(true);
      if (tab === 'tree') {
        setMainView('tree');
        if (!inspectedSkill && graphNodes.length > 0) {
          setInspectedSkill(graphNodes.find((n) => n.slug === task?.skill?.slug) || graphNodes[0]);
        }
      } else {
        setMainView('editor');
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* 📌 Sticky Top Navigation Bar */}
      <header className="h-14 w-full bg-slate-900 border-b border-slate-800/90 px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Smart-BKT-Chain</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                v2.0 Shell
              </span>
            </h1>
          </div>
        </div>

        {/* Top Controls: Course Selector & User Profile */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <select
              id="student-course-select"
              value={activeCourseSlug}
              onChange={(e) => setActiveCourseSlug(e.target.value)}
              className="w-full appearance-none px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer pr-8 shadow-inner"
            >
              {courses.map((course) => (
                <option key={course.slug} value={course.slug} className="bg-slate-900 text-white py-1">
                  📚 {course.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-200">Дмитро Стеценко</span>
          </div>
        </div>
      </header>

      {/* 🧭 Main Workspace Area with Left Opera Icon Rail + Expandable Drawer */}
      <div className="flex-1 flex overflow-hidden">
        {/* 🎨 Opera-Style Vertical Icon Rail (Slim Left Bar) */}
        <nav className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-3 shrink-0 z-20 shadow-xl">
          {/* Tab 1: Task / Editor */}
          <button
            onClick={() => handleTabClick('task')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'task'
                ? isDrawerOpen
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-400/50'
                  : 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/90 hover:text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title={
              activeTab === 'task'
                ? isDrawerOpen
                  ? 'Редактор відкритий із панеллю умови (клік розгорне редактор на весь екран)'
                  : 'Редактор на весь екран (клік поверне бічну панель умови)'
                : 'Перейти до Редактора та завдання'
            }
          >
            <BookOpen className="w-5 h-5" />
            {activeTab === 'task' && isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-5 bg-indigo-400 rounded-r-full shadow-sm shadow-indigo-400"></span>
            )}
            {activeTab === 'task' && !isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-2 bg-indigo-400/70 rounded-r-full"></span>
            )}
          </button>

          {/* Tab 2: BKT Skill Map */}
          <button
            onClick={() => handleTabClick('bkt')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'bkt'
                ? isDrawerOpen
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-1 ring-emerald-400/50'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/90 hover:text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title={
              activeTab === 'bkt'
                ? isDrawerOpen
                  ? 'Карта навичок відкрита (клік розгорне редактор на весь екран)'
                  : 'Редактор на весь екран (клік поверне карту BKT)'
                : 'Карта Навичок BKT (DAG у бічній панелі)'
            }
          >
            <Sparkles className="w-5 h-5" />
            {activeTab === 'bkt' && isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-5 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400"></span>
            )}
            {activeTab === 'bkt' && !isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-2 bg-emerald-400/70 rounded-r-full"></span>
            )}
          </button>

          {/* Tab 3: Knowledge Tree */}
          <button
            onClick={() => handleTabClick('tree')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'tree'
                ? isDrawerOpen
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 border border-indigo-400'
                  : 'bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-md hover:bg-purple-900/90 hover:text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title={
              activeTab === 'tree'
                ? isDrawerOpen
                  ? 'Дерево відкрите із сайдбаром (клік розгорне дерево на весь екран)'
                  : 'Дерево на весь екран (клік поверне сайдбар деталей вузла)'
                : 'Перейти до Дерева Знань'
            }
          >
            <Network className="w-5 h-5" />
            {activeTab === 'tree' && isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-5 bg-purple-400 rounded-r-full shadow-sm shadow-purple-400"></span>
            )}
            {activeTab === 'tree' && !isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-2 bg-purple-400/70 rounded-r-full"></span>
            )}
          </button>

          {/* Bottom Area (External Apps & Settings at very bottom) */}
          <div className="mt-auto flex flex-col items-center gap-2.5">
            <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

            {/* External Apps Group */}
            <a
              href="http://localhost:3003"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-purple-600/15 text-purple-400 border border-purple-500/20 flex items-center justify-center hover:bg-purple-600/30 hover:border-purple-500/40 transition-all"
              title="Кабінет Викладача (Teacher Portal)"
            >
              <User className="w-4 h-4" />
            </a>

            <a
              href="http://localhost:3004"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-600/30 hover:border-emerald-500/40 transition-all"
              title="Панель Адміністратора (CMS DAG)"
            >
              <Code2 className="w-4 h-4" />
            </a>

            {/* Separator before Settings block */}
            <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

            {/* Workspace Settings Block (At the very bottom) */}
            <button
              onClick={() => handleTabClick('settings')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'settings'
                  ? isDrawerOpen
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40 ring-1 ring-amber-400/50'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500/30 hover:bg-amber-900/90 hover:text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Налаштування Workspace"
            >
              <Settings className="w-5 h-5" />
              {activeTab === 'settings' && isDrawerOpen && (
                <span className="absolute -left-1 w-1 h-5 bg-amber-400 rounded-r-full shadow-sm shadow-amber-400"></span>
              )}
              {activeTab === 'settings' && !isDrawerOpen && (
                <span className="absolute -left-1 w-1 h-2 bg-amber-400/70 rounded-r-full"></span>
              )}
            </button>
          </div>
        </nav>

        {/* 📂 Expandable Side Drawer Panel */}
        {isDrawerOpen && (
          <aside className="w-full sm:w-[380px] lg:w-[420px] bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0 shadow-2xl backdrop-blur-xl animate-fadeIn z-10 overflow-hidden">
            {/* 📌 Fixed Drawer Header (Does not scroll) */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur-md">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {activeTab === 'task' && (
                  <>
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Умова та Контекст Завдання</span>
                  </>
                )}
                {activeTab === 'bkt' && (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Карта Навичок (Skill DAG)</span>
                  </>
                )}
                {activeTab === 'tree' && (
                  <>
                    <Network className="w-4 h-4 text-purple-400" />
                    <span>Деталізація Вузла Дерева</span>
                  </>
                )}
                {activeTab === 'settings' && (
                  <>
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>Налаштування Студента</span>
                  </>
                )}
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                title="Закрити панель (розгорнути вікно на весь екран)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 📜 Scrollable Drawer Body Content */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
              {/* Content Drawer 1: Task Condition & Attempt History */}
              {activeTab === 'task' && task && (
                <div className="flex flex-col gap-4 flex-1">
                  {/* Sub-tab navigation: Condition vs History */}
                  <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
                    <button
                      onClick={() => setTaskDrawerSubTab('condition')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        taskDrawerSubTab === 'condition'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Умова</span>
                    </button>
                    <button
                      onClick={() => setTaskDrawerSubTab('history')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                        taskDrawerSubTab === 'history'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Історія спроб</span>
                      {taskSubmissions.length > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                          taskSubmissions.some((s) => s.teacherComment)
                            ? 'bg-amber-400 text-slate-950 animate-pulse'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {taskSubmissions.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {taskDrawerSubTab === 'condition' ? (
                    <div className="flex flex-col gap-5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {task.skill.title}
                        </span>
                        {recommendation?.isDifficultyDegraded && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Допоміжний рівень (Макс: {recommendation?.maxScoreCap ?? 70}%)</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white mb-2">{task.title}</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
                      </div>

                      {recommendation && (
                        <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <div className="text-[11px] text-indigo-200">
                            <span className="font-bold text-indigo-300 block mb-0.5">Рекомендація BKT Engine:</span>
                            {recommendation.reason || 'Завдання обрано відповідно до вашого рівня засвоєння.'}
                          </div>
                        </div>
                      )}

                      {task.taskType === 'CODE' && task.testCases.length > 0 && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Відкриті Тест-Кейси
                          </span>
                          {task.testCases.map((tc, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs font-mono flex flex-col gap-0.5"
                            >
                              <span className="text-slate-400 text-[11px]">
                                Вхідні дані: <code className="text-indigo-300">{tc.input}</code>
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                Очікуваний вивід: <code className="text-emerald-300">{tc.expectedOutput}</code>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => fetchRecommendedTask(activeCourseSlug)}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer mt-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Оновити рекомендоване завдання</span>
                      </button>
                    </div>
                  ) : (
                    /* History Sub-tab */
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                          Хронологія спроб та перевірок:
                        </span>
                        <button
                          onClick={() => task && fetchTaskSubmissions(task.id)}
                          className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-mono"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Оновити</span>
                        </button>
                      </div>

                      {taskSubmissions.length === 0 ? (
                        <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-xl text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                          <History className="w-6 h-6 text-slate-600" />
                          <span>Ви ще не надсилали спроб для цього завдання.</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {taskSubmissions.map((sub, idx) => {
                            const isLatest = idx === 0;
                            const isApproved = sub.teacherReviewStatus === 'APPROVED' || sub.status === 'ACCEPTED';
                            const isPending = sub.teacherReviewStatus === 'PENDING_REVIEW';
                            const isSuperseded = sub.teacherReviewStatus === 'SUPERSEDED';

                            return (
                              <div
                                key={sub.id}
                                className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all ${
                                  isLatest
                                    ? isApproved
                                      ? 'bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                                      : isPending
                                      ? 'bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-950/30'
                                      : 'bg-purple-950/30 border-purple-500/40'
                                    : 'bg-slate-950/60 border-slate-800 opacity-80'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white">
                                      Спроба #{sub.attemptNumber || taskSubmissions.length - idx}
                                    </span>
                                    {isLatest && (
                                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                        Остання
                                      </span>
                                    )}
                                  </div>
                                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                                    isApproved
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                      : isPending
                                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                      : isSuperseded
                                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  }`}>
                                    {isApproved
                                      ? '✓ Затверджено'
                                      : isPending
                                      ? '⏳ В черзі'
                                      : isSuperseded
                                      ? 'Архівована'
                                      : '✕ Відхилено'}
                                  </span>
                                </div>

                                <div className="text-[10px] text-slate-500 font-mono">
                                  Здано: {new Date(sub.createdAt).toLocaleString()}
                                </div>

                                {/* Teacher Comment Banner if present */}
                                {sub.teacherComment && (
                                  <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/40 flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[11px]">
                                      <MessageSquareQuote className="w-3.5 h-3.5 shrink-0" />
                                      <span>Коментар викладача:</span>
                                    </div>
                                    <p className="text-xs text-purple-100 font-sans italic leading-relaxed pl-5">
                                      "{sub.teacherComment}"
                                    </p>
                                  </div>
                                )}

                                {/* Submitted Answer Preview */}
                                {sub.code && (
                                  <details className="text-[11px] text-slate-400">
                                    <summary className="cursor-pointer hover:text-slate-200 select-none">
                                      Переглянути текст відповіді
                                    </summary>
                                    <pre className="mt-1 p-2 bg-slate-900 border border-slate-800 rounded text-slate-300 font-mono text-[10px] whitespace-pre-wrap max-h-32 overflow-y-auto">
                                      {sub.code}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Content Drawer 2: Skill DAG Map */}
              {activeTab === 'bkt' && (
                <div className="flex flex-col gap-3">
                  <SkillDagMap nodes={graphNodes} activeSkillSlug={task?.skill?.slug} />

                  <button
                    onClick={() => {
                      handleTabClick('tree');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Network className="w-4 h-4" />
                    <span>Відкрити Дерево Знань на Екрані</span>
                  </button>
                </div>
              )}

              {/* Content Drawer: Node Detail (Inspector for Tree) */}
              {activeTab === 'tree' && (
                <div className="flex flex-col gap-4">
                  {inspectedSkill ? (
                    <div className="flex flex-col gap-4">
                      {/* Node Status Badge */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
                          <Network className="w-3.5 h-3.5" />
                          Модуль Дерева Знань
                        </span>
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                            inspectedSkill.pMastery >= 0.95
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : inspectedSkill.status === 'LOCKED'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          {inspectedSkill.pMastery >= 0.95
                            ? '✨ Опановано'
                            : inspectedSkill.status === 'LOCKED'
                            ? '🔒 Заблоковано'
                            : '⚔️ У процесі'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-white">{inspectedSkill.title}</h3>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {inspectedSkill.description || 'Ключовий модуль курсу для набуття практичних навичок.'}
                        </p>
                      </div>

                      {/* Locked Warning Notice if node is locked */}
                      {inspectedSkill.status === 'LOCKED' && (
                        <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div className="text-[11px] text-rose-200">
                            <strong className="text-rose-300 block mb-0.5">Вузол Наразі Заблоковано!</strong>
                            Для розблокування цього модуля необхідно спершу засвоїти попередні залежні модулі до рівня майстерності P(L) ≥ 0.95.
                          </div>
                        </div>
                      )}

                      {/* BKT Mastery Breakdown */}
                      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">Рівень Майстерності P(L):</span>
                          <span className={`font-mono font-bold text-sm ${
                            inspectedSkill.pMastery >= 0.95 ? 'text-emerald-400' : 'text-indigo-400'
                          }`}>
                            {(inspectedSkill.pMastery * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-500 ${
                              inspectedSkill.pMastery >= 0.95
                                ? 'bg-emerald-400'
                                : inspectedSkill.status === 'LOCKED'
                                ? 'bg-slate-700'
                                : 'bg-gradient-to-r from-amber-500 to-indigo-500'
                            }`}
                            style={{ width: `${Math.min(100, inspectedSkill.pMastery * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>0%</span>
                          <span className="text-emerald-400">Поріг: ≥ 95.0%</span>
                        </div>
                      </div>

                      {/* Prerequisites info */}
                      <div className="flex flex-col gap-1.5 text-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Вимоги до Розблокування:
                        </span>
                        <div className="text-[11px] text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                          {inspectedSkill.parentSkillIds.length === 0
                            ? '🟢 Базовий стартовий вузол курсу.'
                            : inspectedSkill.status === 'LOCKED'
                            ? '🔒 Потребує опанування попередніх навичок.'
                            : '✨ Усі пререквізити виконано! Модуль відкрито.'}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        disabled={inspectedSkill.status === 'LOCKED'}
                        onClick={() => {
                          setActiveTab('task');
                          setMainView('editor');
                          setIsDrawerOpen(true);
                          fetchRecommendedTask(activeCourseSlug);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg mt-2 ${
                          inspectedSkill.status === 'LOCKED'
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                            : inspectedSkill.pMastery >= 0.95
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/40'
                        }`}
                      >
                        <span>{inspectedSkill.status === 'LOCKED' ? '🔒 Заблоковано' : inspectedSkill.pMastery >= 0.95 ? 'Тренувати знову' : 'Розпочати квест модуля ➔'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs p-4 text-center">
                      Оберіть вузол на дереві знань для перегляду деталей.
                    </div>
                  )}
                </div>
              )}

              {/* Content Drawer 3: Settings */}
              {activeTab === 'settings' && (
                <div className="flex flex-col gap-4 text-xs text-slate-300">
                  <p>Налаштування робочого середовища та відображення Monaco Editor.</p>
                  <button
                    onClick={() => fetchRecommendedTask(activeCourseSlug)}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer hover:bg-indigo-500 transition-all"
                  >
                    Перезавантажити стан BKT
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* 💻 Center Main Canvas: Editor & Evaluation Result */}
        <main className="flex-1 overflow-hidden flex flex-col bg-slate-950">
          {mainView === 'tree' ? (
            <div className="w-full h-full p-4 lg:p-6 overflow-hidden flex flex-col">
              <GameSkillTreeWidget
                nodes={graphNodes}
                adjustments={studentAdjustments}
                activeSkillSlug={task?.skill?.slug}
                selectedSkillSlug={inspectedSkill?.slug}
                courseTitle={courses.find((c) => c.slug === activeCourseSlug)?.title || 'Курс'}
                showInspector={false}
                onInspectSkill={(node) => {
                  setInspectedSkill(node);
                  setActiveTab('tree');
                  setIsDrawerOpen(true);
                }}
                onSelectSkill={(slug) => {
                  const node = graphNodes.find((n) => n.slug === slug);
                  if (node) {
                    setInspectedSkill(node);
                    setActiveTab('tree');
                    setIsDrawerOpen(true);
                  }
                }}
              />
            </div>
          ) : isLoading ? (
            <div className="p-12 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 text-slate-400 my-auto mx-auto">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Завантаження адаптивного завдання з BKT графа...</p>
            </div>
          ) : task ? (
            <div className="flex-1 p-4 lg:p-6 overflow-y-auto flex flex-col gap-4">
              {/* ⚠️ Top Adaptive Degradation Notice Banner */}
              {recommendation?.isDifficultyDegraded && (
                <div className="w-full bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-xl flex items-start sm:items-center justify-between gap-4 animate-fadeIn">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">Рівень складності адаптовано</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Максимальний бал: {recommendation?.maxScoreCap ?? 70}%
                        </span>
                      </div>
                      <p className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">
                        Система помітила труднощі в попередніх завданнях і тимчасово надала допоміжні питання для закріплення базових концепцій. Ви зможете повернутися до 100% балу після успішного освоєння теми.
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-amber-400/80 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-amber-500/20">
                      Тема: {task.topic || task.skill.title}
                    </span>
                  </div>
                </div>
              )}

              {task.taskType === 'SINGLE_CHOICE' || task.taskType === 'MULTIPLE_CHOICE' ? (
                <QuizTaskEditor
                  taskId={task.id}
                  taskType={task.taskType}
                  title={task.title}
                  description={task.description}
                  options={task.options || []}
                  onSubmit={(payload) => handleEvaluate(payload)}
                  isSubmitting={isSubmitting}
                  onNextTask={() => fetchRecommendedTask(activeCourseSlug)}
                  isPassed={Boolean(evalResult?.isPassed)}
                />
              ) : task.taskType === 'TEXT_ESSAY' ? (
                <EssayTaskEditor
                  userId="demo-student"
                  taskId={task.id}
                  onChange={setEssayAnswer}
                  onSubmit={(telemetry) => handleEvaluate({ essayAnswer, ...(telemetry || {}) })}
                  isSubmitting={isSubmitting}
                  onNextTask={() => fetchRecommendedTask(activeCourseSlug)}
                  isPassed={Boolean(evalResult?.isPassed)}
                  isPendingReview={evalResult?.teacherReviewStatus === 'PENDING_REVIEW'}
                />
              ) : (
                <MonacoCodeEditor
                  userId="demo-student"
                  taskId={task.id}
                  initialCode={code}
                  onChange={setCode}
                  onSubmit={() => handleEvaluate({ code })}
                  isSubmitting={isSubmitting}
                  onNextTask={() => fetchRecommendedTask(activeCourseSlug)}
                  isPassed={Boolean(evalResult?.isPassed)}
                />
              )}

              {/* Evaluation Result Toast Panel */}
              {evalResult && (
                <div
                  className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all shadow-xl shrink-0 ${
                    evalResult.isPassed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {evalResult.isPassed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm">
                        {evalResult.isPassed ? 'Вітаємо! Перевірку пройдено' : 'Необхідне доопрацювання'}
                      </h4>
                      <p className="text-xs opacity-90">{evalResult.feedback}</p>
                    </div>
                  </div>

                  {evalResult.bktUpdate && (
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span>Оновлення рівня засвоєння для "{evalResult.bktUpdate.skillTitle}":</span>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-slate-400">{(evalResult.bktUpdate.pMasteryBefore * 100).toFixed(1)}%</span>
                        <span>➔</span>
                        <span className={evalResult.bktUpdate.pMasteryChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {(evalResult.bktUpdate.pMasteryAfter * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 🔬 Semantic Evaluation & Teacher Review Details */}
                  {(evalResult.semanticScore !== undefined || evalResult.semanticDetails) && (
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/90 flex flex-col gap-2.5 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <span>📊 Семантична оцінка відповіді:</span>
                          <span className="font-mono font-bold text-indigo-400">
                            {evalResult.semanticScore !== undefined ? `${Math.round(evalResult.semanticScore * 100)}%` : '—'}
                          </span>
                        </span>

                        {evalResult.teacherReviewStatus === 'PENDING_REVIEW' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <span>⏳</span> Очікує верифікації викладачем
                          </span>
                        ) : evalResult.teacherReviewStatus === 'APPROVED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <span>✓</span> Підтверджено викладачем
                          </span>
                        ) : null}
                      </div>

                      {evalResult.semanticDetails && (
                        <div className="flex flex-col gap-1.5">
                          {evalResult.semanticDetails.keyConceptsCovered?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 text-[11px]">
                              <span className="text-slate-400">Розкрито поняття:</span>
                              {evalResult.semanticDetails.keyConceptsCovered.map((kw: string, i: number) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono">
                                  {kw.split('|')[0]}
                                </span>
                              ))}
                            </div>
                          )}

                          {evalResult.semanticDetails.missingConcepts?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 text-[11px]">
                              <span className="text-slate-400">Варто додати:</span>
                              {evalResult.semanticDetails.missingConcepts.map((kw: string, i: number) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300 font-mono">
                                  {kw.split('|')[0]}
                                </span>
                              ))}
                            </div>
                          )}

                          {evalResult.semanticDetails.detectedMisconceptions?.length > 0 && (
                            <div className="p-2 bg-rose-950/30 border border-rose-500/30 rounded text-rose-200 text-[11px]">
                              ⚠️ Виявлено когнітивну помилку: зверніть увагу на точність формулювання щодо теми.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Teacher Comment Banner in Toast if reviewed */}
                      {evalResult.teacherComment && (
                        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 flex flex-col gap-1.5 mt-1">
                          <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs">
                            <MessageSquareQuote className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>Відгук та зауваження викладача:</span>
                          </div>
                          <p className="text-xs text-purple-100 italic leading-relaxed pl-5">
                            "{evalResult.teacherComment}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-center text-slate-400 text-sm my-auto">
              Завдань у даному курсі не знайдено.
            </div>
          )}
        </main>
      </div>

      {/* Exhausted Module Tasks Modal Popup */}
      {exhaustedModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col gap-5 text-center transform transition-all scale-100">
            <div className="mx-auto p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-white">Завдання модуля закінчилися</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Завдання даного модуля (<strong className="text-indigo-400">"{exhaustedModalData.skillTitle}"</strong>) закінчилися, і ви не набрали необхідну кількість балів (&ge;95%).
                Ваш прогрес на цьому модулі буде анульований для повторної спроби.
              </p>
            </div>
            <button
              onClick={handleConfirmSkillReset}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-indigo-400/30"
            >
              ОК, анулювати прогрес модуля
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
