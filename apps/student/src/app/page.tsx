'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Brain, Sparkles, CheckCircle, AlertCircle, RefreshCw, User, Code2, BookOpen, Scale, ChevronDown, ArrowRight, AlertTriangle, X, Settings, Network, Compass, Flame, History, MessageSquareQuote, CheckCircle2, Trophy, Target, MessageSquare, Info, HelpCircle } from 'lucide-react';
import { MonacoCodeEditor } from '../features/code-editor/ui/MonacoCodeEditor';
import { QuizTaskEditor } from '../features/quiz-editor/ui/QuizTaskEditor';
import { EssayTaskEditor } from '../features/essay-editor/ui/EssayTaskEditor';
import { SkillDagMap } from '../features/skill-graph/ui/SkillDagMap';
import { GameSkillTreeWidget, SkillGraphNode, DrawerSection } from '@sbc/ui';

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
  socraticHints?: Array<{
    level: number;
    hint: string;
    penaltyPct: number;
  }>;
  studyUnitUrl?: string | null;
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
  const [hasRemediationTask, setHasRemediationTask] = useState<boolean>(true);
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
  const [consecutiveFailures, setConsecutiveFailures] = useState<number>(0);
  const [isDegradationTooltipOpen, setIsDegradationTooltipOpen] = useState<boolean>(false);
  const [revealedHintLevel, setRevealedHintLevel] = useState<number>(0);

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
          const isMastered = p >= 0.90; // Gold Mastery threshold
          const parentIds = skill.parentDependencies?.map((d: any) => d.parentSkillId) || [];
          const parentMastered =
            parentIds.length === 0 || parentIds.every((pid: string) => (bktMap[pid] ?? 0) >= 0.75); // Bloom Proficient threshold unlocks next

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

  const fetchRecommendedTask = async (courseSlug: string, excludeTaskId?: string) => {
    setIsLoading(true);
    setEvalResult(null);
    try {
      await fetchCourseStructureAndState(courseSlug);
      const url = `${API_URL}/api/v1/tasks/recommended?courseSlug=${courseSlug}&userId=demo-student${
        excludeTaskId ? `&excludeTaskId=${excludeTaskId}` : ''
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setRecommendation(data.recommendation);
        setHasRemediationTask(data.hasRemediationTask ?? true);
        setCode(data.task.starterCode || '');
        setEssayAnswer('');
        setRevealedHintLevel(0);

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
        if (data.isPassed) {
          setConsecutiveFailures(0);
        } else {
          setConsecutiveFailures((prev) => prev + 1);
        }
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

  // 📊 Real-time Course & Module Progress Metrics
  const totalSkillsCount = graphNodes.length;
  const masteredSkillsCount = graphNodes.filter((n) => n.pMastery >= 0.90).length;
  const courseCompletionPct = totalSkillsCount > 0 ? Math.round((masteredSkillsCount / totalSkillsCount) * 100) : 0;
  
  // Active skill node & mastery
  const activeSkillNode = graphNodes.find((n) => n.slug === task?.skill?.slug);
  const activeSkillMasteryPct = activeSkillNode ? Math.round(activeSkillNode.pMastery * 100) : 0;

  // 💡 Scaffolding Visibility: Show hints & study unit deep-link ONLY when student struggles:
  // 1. Current attempt failed (evalResult && !evalResult.isPassed)
  // 2. Task is an adaptive degradation fallback (recommendation?.isDifficultyDegraded)
  // 3. Task has previous failed submissions in history
  // 4. Consecutive failures on current skill >= 1
  const hasFailedAttemptOnCurrentTask = Boolean(
    (evalResult && !evalResult.isPassed) ||
    taskSubmissions.some((s) => s.status === 'REJECTED' || s.isCorrect === false) ||
    consecutiveFailures > 0 ||
    recommendation?.isDifficultyDegraded
  );

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* 📌 Sticky Top Navigation Bar with Prominent Progress Indicator */}
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

        {/* 🏆 Prominent Central Overall Course Progress Display */}
        <div className="hidden md:flex items-center gap-4 bg-slate-950/80 px-4 py-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-[11px] leading-tight font-semibold text-slate-300">
                <span>Прогрес курсу:</span>
                <span className="font-mono font-bold text-amber-400">{courseCompletionPct}%</span>
                <span className="text-[10px] text-slate-500 font-mono">({masteredSkillsCount}/{totalSkillsCount} модулів)</span>
              </div>
              <div className="w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-1">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${courseCompletionPct}%` }}
                />
              </div>
            </div>
          </div>

          {activeSkillNode && (
            <div className="h-6 w-[1px] bg-slate-800"></div>
          )}

          {activeSkillNode && (
            <div className="flex items-center gap-2">
              <div className="p-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
                <Target className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[11px] leading-tight font-semibold text-slate-300">
                  <span className="truncate max-w-[130px]">{activeSkillNode.title.split(':')[0]}:</span>
                  <span className={`font-mono font-bold ${activeSkillMasteryPct >= 90 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                    {activeSkillMasteryPct}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">(P(L))</span>
                </div>
                <div className="w-28 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-1">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeSkillMasteryPct >= 90
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}
                    style={{ width: `${Math.min(100, activeSkillMasteryPct)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Controls: Course Selector & User Profile */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px] sm:min-w-[240px]">
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
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3">
              {/* Content Drawer 1: Task Condition & Attempt History */}
              {activeTab === 'task' && task && (
                <div className="flex flex-col gap-3 flex-1">
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
                    <div className="flex flex-col gap-3 flex-1">
                      {/* Section 1: Активна навичка та поточний BKT стан */}
                      <DrawerSection
                        title="Поточна навичка та BKT стан"
                        icon={Brain}
                        iconColor="text-indigo-400"
                        titleColor="text-indigo-400 group-hover:text-indigo-300"
                        badge={`${Math.round(activeSkillMasteryPct)}%`}
                        badgeColor={activeSkillMasteryPct >= 90 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'}
                        defaultOpen={true}
                      >
                        <div className="flex flex-col gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {task.skill.title}
                            </span>
                            <div className="flex items-center gap-2">
                              {recommendation?.isDifficultyDegraded && (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setIsDegradationTooltipOpen((prev) => !prev)}
                                    className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center transition-all cursor-pointer shadow-sm group hover:scale-105 active:scale-95"
                                    title="Адаптивне допоміжне завдання (натисніть для деталей)"
                                    aria-label="Пояснення допоміжного рівня"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
                                  </button>

                                  {isDegradationTooltipOpen && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsDegradationTooltipOpen(false)}
                                      />
                                      <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900/95 border border-amber-500/40 rounded-xl shadow-2xl z-50 animate-fadeIn backdrop-blur-md">
                                        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-amber-500/20 text-amber-300 font-bold text-xs">
                                          <div className="flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Допоміжне завдання</span>
                                          </div>
                                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 font-mono">
                                            Ліміт: {recommendation?.maxScoreCap ?? 70}%
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-slate-300 leading-relaxed">
                                          Складність знижена в адаптивному режимі, оскільки попередня спроба викликала труднощі.
                                        </p>
                                        <p className="text-[10px] text-amber-400/90 mt-2 font-medium">
                                          💡 Після засвоєння поверніться до оригінального завдання для 100% майстерності.
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}

                              <span className="text-[11px] font-mono font-bold text-slate-400">
                                P(L): <span className={activeSkillMasteryPct >= 90 ? 'text-emerald-400' : 'text-indigo-400'}>{activeSkillMasteryPct.toFixed(1)}%</span>
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                activeSkillMasteryPct >= 90
                                  ? 'bg-emerald-400'
                                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                              }`}
                              style={{ width: `${Math.min(100, activeSkillMasteryPct)}%` }}
                            />
                          </div>
                        </div>
                      </DrawerSection>

                      {/* Section 2: Умова поточного завдання */}
                      <DrawerSection
                        title="Умова завдання"
                        icon={BookOpen}
                        iconColor="text-cyan-400"
                        titleColor="text-cyan-400 group-hover:text-cyan-300"
                        defaultOpen={true}
                        className="border-t border-slate-800/80 pt-2.5"
                      >
                        <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex flex-col gap-2">
                          <h3 className="text-sm font-bold text-white">{task.title}</h3>
                          <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
                        </div>
                      </DrawerSection>

                      {/* Section 3: Рекомендація BKT Engine */}
                      {recommendation && (
                        <DrawerSection
                          title="Рекомендація BKT Engine"
                          icon={Sparkles}
                          iconColor="text-purple-400"
                          titleColor="text-purple-400 group-hover:text-purple-300"
                          defaultOpen={true}
                          className="border-t border-slate-800/80 pt-2.5"
                        >
                          <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <div className="text-[11px] text-indigo-200">
                              <span className="font-bold text-indigo-300 block mb-0.5">Логіка підбору:</span>
                              {recommendation.reason || 'Завдання обрано відповідно до вашого рівня засвоєння.'}
                            </div>
                          </div>
                        </DrawerSection>
                      )}

                      {/* Section 4: Відкриті Тест-Кейси */}
                      {task.taskType === 'CODE' && task.testCases.length > 0 && (
                        <DrawerSection
                          title="Відкриті Тест-Кейси"
                          icon={Target}
                          iconColor="text-emerald-400"
                          titleColor="text-emerald-400 group-hover:text-emerald-300"
                          badge={task.testCases.length}
                          badgeColor="bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          defaultOpen={true}
                          className="border-t border-slate-800/80 pt-2.5"
                        >
                          <div className="flex flex-col gap-2">
                            {task.testCases.map((tc, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs font-mono flex flex-col gap-0.5"
                              >
                                {tc.input && (
                                  <span className="text-slate-400 text-[11px]">
                                    {tc.input.startsWith('"') && !tc.input.startsWith('"eval:') && !tc.input.startsWith('[')
                                      ? <>Перевірка змінної: <code className="text-indigo-300">{tc.input.replace(/"/g, '')}</code></>
                                      : tc.input.includes('eval:')
                                      ? <>Обчислення виразу: <code className="text-indigo-300">{tc.input.replace('eval:', '').replace(/"/g, '')}</code></>
                                      : <>Вхідні дані: <code className="text-indigo-300">{tc.input}</code></>}
                                  </span>
                                )}
                                <span className="text-slate-400 text-[11px]">
                                  Очікуваний вивід: <code className="text-emerald-300">{tc.expectedOutput}</code>
                                </span>
                              </div>
                            ))}
                          </div>
                        </DrawerSection>
                      )}

                      {/* Section 5: Сократівські підказки */}
                      <DrawerSection
                        title="Сократівські підказки"
                        icon={HelpCircle}
                        iconColor={task.socraticHints && task.socraticHints.length > 0 ? "text-amber-400" : "text-slate-500"}
                        titleColor={task.socraticHints && task.socraticHints.length > 0 ? "text-amber-400 group-hover:text-amber-300" : "text-slate-500"}
                        badge={task.socraticHints && task.socraticHints.length > 0 ? (revealedHintLevel > 0 ? `-${task.socraticHints[revealedHintLevel - 1]?.penaltyPct ?? 0}%` : `${task.socraticHints.length}`) : "0"}
                        badgeColor={task.socraticHints && task.socraticHints.length > 0 ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-slate-800 text-slate-500 border-slate-700"}
                        defaultOpen={Boolean(hasFailedAttemptOnCurrentTask && task.socraticHints && task.socraticHints.length > 0)}
                        className="border-t border-slate-800/80 pt-2.5"
                      >
                        {task.socraticHints && task.socraticHints.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {task.socraticHints.map((hintObj, idx) => {
                              const isRevealed = revealedHintLevel >= hintObj.level;
                              const canUnlock = revealedHintLevel === idx;

                              if (!isRevealed && !canUnlock) return null;

                              return (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-xl border transition-all text-xs ${
                                    isRevealed
                                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  {isRevealed ? (
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center justify-between font-bold text-[11px] text-amber-300">
                                        <span>💡 Підказка {hintObj.level} (Рівень {hintObj.level}):</span>
                                        <span className="text-[10px] font-mono text-amber-400/80">-{hintObj.penaltyPct}% балу</span>
                                      </div>
                                      <p className="text-[11px] leading-relaxed text-slate-200">{hintObj.hint}</p>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setRevealedHintLevel(hintObj.level)}
                                      className="w-full py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs flex items-center justify-between transition-all cursor-pointer"
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Розкрити підказку {hintObj.level}</span>
                                      </span>
                                      <span className="text-[10px] font-mono text-amber-400">(-{hintObj.penaltyPct}%)</span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl flex items-center gap-2 text-slate-500 text-xs">
                            <HelpCircle className="w-4 h-4 shrink-0 opacity-60" />
                            <span>Підказки Сократа не закладені автором для цієї вправи.</span>
                          </div>
                        )}
                      </DrawerSection>

                      {/* Section 6: Навчальний модуль у разі труднощів */}
                      <DrawerSection
                        title="Матеріал для повторення"
                        icon={BookOpen}
                        iconColor={task.studyUnitUrl ? "text-blue-400" : "text-slate-500"}
                        titleColor={task.studyUnitUrl ? "text-blue-400 group-hover:text-blue-300" : "text-slate-500"}
                        defaultOpen={Boolean(task.studyUnitUrl)}
                        className="border-t border-slate-800/80 pt-2.5"
                      >
                        {task.studyUnitUrl ? (
                          <div className="p-3 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-xl flex items-center justify-between gap-3 animate-fadeIn">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-blue-200">Повторити теоретичну тему</span>
                                <span className="text-[10px] text-slate-400">Урок в інтерактивному підручнику</span>
                              </div>
                            </div>
                            <a
                              href={task.studyUnitUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-600/30 transition-all cursor-pointer shrink-0"
                              title="Відкрити урок в інтерактивній системі"
                            >
                              <span>До уроку</span>
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2 text-slate-500 text-xs">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 shrink-0 opacity-60" />
                              <span>Теоретичний конспект не прив'язаний</span>
                            </div>
                            <button
                              disabled
                              className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-600 cursor-not-allowed"
                            >
                              Немає посилання
                            </button>
                          </div>
                        )}
                      </DrawerSection>

                      {/* Action Button */}
                      <button
                        onClick={() => fetchRecommendedTask(activeCourseSlug)}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer mt-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Оновити рекомендоване завдання</span>
                      </button>
                    </div>
                  ) : (
                    /* History Sub-tab */
                    <div className="flex flex-col gap-3 flex-1">
                      <DrawerSection
                        title="Хронологія спроб та перевірок"
                        icon={History}
                        iconColor="text-purple-400"
                        titleColor="text-purple-400 group-hover:text-purple-300"
                        badge={taskSubmissions.length}
                        badgeColor="bg-purple-500/10 text-purple-300 border-purple-500/20"
                        defaultOpen={true}
                        action={
                          <button
                            onClick={() => task && fetchTaskSubmissions(task.id)}
                            className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-mono"
                            title="Оновити список спроб"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Оновити</span>
                          </button>
                        }
                      >
                        {taskSubmissions.length === 0 ? (
                          <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-xl text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                            <History className="w-6 h-6 text-slate-600" />
                            <span>Ви ще не надсилали спроб для цього завдання.</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
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
                                        ? '✓ Зараховано'
                                        : isPending
                                        ? '⏳ В черзі'
                                        : isSuperseded
                                        ? 'Замінено'
                                        : '✕ Відхилено'}
                                    </span>
                                  </div>

                                  <div className="text-[10px] text-slate-500 font-mono">
                                    Час: {new Date(sub.createdAt).toLocaleString()}
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
                                        Переглянути код відповіді
                                      </summary>
                                      <pre className="mt-1 p-2 bg-slate-900 border border-slate-800 rounded text-slate-300 font-mono text-[10px] overflow-x-auto max-h-36">
                                        {sub.code}
                                      </pre>
                                    </details>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </DrawerSection>
                    </div>
                  )}
                </div>
              )}

              {/* Content Drawer 2: Skill DAG Map */}
              {activeTab === 'bkt' && (
                <div className="flex flex-col gap-3">
                  <DrawerSection
                    title="Граф зв'язків компетенцій"
                    icon={Sparkles}
                    iconColor="text-emerald-400"
                    titleColor="text-emerald-400 group-hover:text-emerald-300"
                    badge={graphNodes.length}
                    badgeColor="bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    defaultOpen={true}
                  >
                    <SkillDagMap nodes={graphNodes} activeSkillSlug={task?.skill?.slug} />

                    <button
                      onClick={() => {
                        handleTabClick('tree');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mt-2"
                    >
                      <Network className="w-4 h-4" />
                      <span>Відкрити Дерево Знань на Екрані</span>
                    </button>
                  </DrawerSection>
                </div>
              )}

              {/* Content Drawer: Node Detail (Inspector for Tree) */}
              {activeTab === 'tree' && (
                <div className="flex flex-col gap-3">
                  {inspectedSkill ? (
                    <div className="flex flex-col gap-3">
                      {/* Section 1: Загальний статус вузла */}
                      <DrawerSection
                        title="Статус модуля"
                        icon={Network}
                        iconColor="text-purple-400"
                        titleColor="text-purple-400 group-hover:text-purple-300"
                        badge={inspectedSkill.pMastery >= 0.95 ? 'Опановано' : inspectedSkill.status === 'LOCKED' ? 'Заблоковано' : 'У процесі'}
                        badgeColor={inspectedSkill.pMastery >= 0.95 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : inspectedSkill.status === 'LOCKED' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'}
                        defaultOpen={true}
                      >
                        <div className="flex flex-col gap-2 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                          <h3 className="text-sm font-bold text-white">{inspectedSkill.title}</h3>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {inspectedSkill.description || 'Ключовий модуль курсу для набуття практичних навичок.'}
                          </p>
                          {inspectedSkill.status === 'LOCKED' && (
                            <div className="p-2.5 bg-rose-950/30 border border-rose-500/40 rounded-lg flex items-start gap-2 mt-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <div className="text-[11px] text-rose-200">
                                <strong className="text-rose-300 block mb-0.5">Вузол Наразі Заблоковано!</strong>
                                Необхідно спершу засвоїти попередні залежні модулі до рівня P(L) ≥ 0.75.
                              </div>
                            </div>
                          )}
                        </div>
                      </DrawerSection>

                      {/* Section 2: Рівень засвоєння P(L) */}
                      <DrawerSection
                        title="Майстерність BKT"
                        icon={Brain}
                        iconColor="text-emerald-400"
                        titleColor="text-emerald-400 group-hover:text-emerald-300"
                        badge={`${(inspectedSkill.pMastery * 100).toFixed(1)}%`}
                        badgeColor={inspectedSkill.pMastery >= 0.90 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'}
                        defaultOpen={true}
                        className="border-t border-slate-800/80 pt-2.5"
                      >
                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-semibold">Рівень Майстерності P(L):</span>
                            <span className={`font-mono font-bold text-sm ${
                              inspectedSkill.pMastery >= 0.90 ? 'text-emerald-400' : 'text-indigo-400'
                            }`}>
                              {(inspectedSkill.pMastery * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full transition-all duration-500 ${
                                inspectedSkill.pMastery >= 0.90
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
                            <span className="text-emerald-400">Поріг: ≥ 90.0% (Gold) / 75.0% (Відкрито)</span>
                          </div>
                        </div>
                      </DrawerSection>

                      {/* Section 3: Пререквізити */}
                      <DrawerSection
                        title="Вимоги та залежності"
                        icon={Compass}
                        iconColor="text-indigo-400"
                        titleColor="text-indigo-400 group-hover:text-indigo-300"
                        defaultOpen={true}
                        className="border-t border-slate-800/80 pt-2.5"
                      >
                        <div className="text-[11px] text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                          {inspectedSkill.parentSkillIds.length === 0
                            ? '🟢 Базовий стартовий вузол курсу.'
                            : inspectedSkill.status === 'LOCKED'
                            ? '🔒 Потребує опанування попередніх навичок (P(L) ≥ 0.75).'
                            : '✨ Усі пререквізити виконано! Модуль відкрито.'}
                        </div>
                      </DrawerSection>

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
                            : inspectedSkill.pMastery >= 0.90
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/40'
                        }`}
                      >
                        <span>{inspectedSkill.status === 'LOCKED' ? '🔒 Заблоковано' : inspectedSkill.pMastery >= 0.90 ? 'Повторити тему' : 'Розпочати вправу вузла →'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs p-4 text-center">
                      Виберіть вузол на карті або дереві знань для перегляду деталей.
                    </div>
                  )}
                </div>
              )}

              {/* Content Drawer 3: Settings */}
              {activeTab === 'settings' && (
                <div className="flex flex-col gap-3">
                  <DrawerSection
                    title="Діагностика та середовище"
                    icon={Settings}
                    iconColor="text-amber-400"
                    titleColor="text-amber-400 group-hover:text-amber-300"
                    defaultOpen={true}
                  >
                    <div className="flex flex-col gap-3 text-xs text-slate-300 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                      <p>Параметри середовища розробки та актуалізації моделі знань.</p>
                      <button
                        onClick={() => fetchRecommendedTask(activeCourseSlug)}
                        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Перезавантажити стан BKT</span>
                      </button>
                    </div>
                  </DrawerSection>
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

              {/* 📊 Active Course & Module Progress HUD */}
              <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-indigo-400 shrink-0">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                        {task.skill.title}
                      </span>
                      {task.topic && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {task.topic}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
                      <span>{task.title}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Indicators & Quick Navigation to Skill Tree */}
                <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6 justify-between md:justify-end">
                  {/* Active Module Mastery */}
                  <div className="flex flex-col min-w-[120px]">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-[11px] text-slate-400 font-semibold">Модуль P(L):</span>
                      <span className={`font-mono font-bold text-xs ${activeSkillMasteryPct >= 90 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        {activeSkillMasteryPct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          activeSkillMasteryPct >= 90 ? 'bg-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${Math.min(100, activeSkillMasteryPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Overall Course Progress */}
                  <div className="flex flex-col min-w-[120px]">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-[11px] text-slate-400 font-semibold">Курс:</span>
                      <span className="font-mono font-bold text-xs text-amber-400">
                        {courseCompletionPct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${courseCompletionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Theory / Study Link */}
                  {task.studyUnitUrl ? (
                    <a
                      href={task.studyUnitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 hover:text-white border border-blue-500/40 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                      title="Відкрити урок в інтерактивному підручнику"
                    >
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <span className="hidden lg:inline text-[11px]">Теорія</span>
                    </a>
                  ) : (
                    <div
                      className="p-2 rounded-xl bg-slate-950/40 text-slate-600 border border-slate-800/80 cursor-not-allowed flex items-center gap-1.5 text-xs select-none"
                      title="Теоретичний конспект не прив'язаний автором курсу"
                    >
                      <BookOpen className="w-4 h-4 opacity-50" />
                      <span className="hidden lg:inline text-[11px]">Теорія (—)</span>
                    </div>
                  )}

                  {/* Button to open Tree */}
                  <button
                    onClick={() => handleTabClick('tree')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer"
                    title="Відкрити Дерево Знань"
                  >
                    <Network className="w-4 h-4" />
                  </button>
                </div>
              </div>

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

                  {/* 🧪 Code Test Details Breakdown */}
                  {evalResult.testDetails && evalResult.testDetails.length > 0 && (
                    <div className="flex flex-col gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-mono">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                        Результати перевірки тестів:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {evalResult.testDetails.map((td: any, i: number) => (
                          <div
                            key={i}
                            className={`p-2 rounded-lg border flex items-center justify-between gap-2 text-[11px] ${
                              td.passed
                                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{td.passed ? '✓' : '✕'}</span>
                              <span className="text-slate-300">
                                {td.input && td.input.startsWith('"') && !td.input.includes('eval:')
                                  ? `Змінна ${td.input.replace(/"/g, '')}`
                                  : `Тест #${i + 1}`}:
                              </span>
                              <span className="text-slate-400">Очікувалось:</span>
                              <code className="text-emerald-300">{td.expected}</code>
                              <span className="text-slate-400">| Отримано:</span>
                              <code className={td.passed ? 'text-emerald-300' : 'text-rose-300'}>{td.actual}</code>
                            </div>
                            <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                              td.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {td.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                        ))}
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

                  {/* ⚡ Adaptive Graceful Degradation Action Prompt */}
                  {!evalResult.isPassed && (
                    <div className="pt-2 border-t border-rose-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-rose-950/20 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded-lg border ${
                          hasRemediationTask
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-200">
                            {consecutiveFailures >= 2 ? 'Помічено системні труднощі' : 'Складно з цим завданням?'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {hasRemediationTask
                              ? 'Ви можете переключитися на допоміжне адаптивне завдання легшого рівня (Max: 70%).'
                              : 'Допоміжний ізоморфний бліц для цього поняття не закладений у банку завдань.'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => hasRemediationTask && fetchRecommendedTask(activeCourseSlug, task?.id)}
                        disabled={!hasRemediationTask}
                        className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0 border ${
                          hasRemediationTask
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer border-amber-300'
                            : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
                        }`}
                        title={hasRemediationTask ? 'Перейти до легшого завдання' : 'Допоміжне завдання відсутнє в курсі'}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{hasRemediationTask ? 'Взяти допоміжне завдання' : 'Допоміжний бліц відсутній'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
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
