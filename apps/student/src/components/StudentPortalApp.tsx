'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Brain, Sparkles, CheckCircle, AlertCircle, RefreshCw, User, Code2, BookOpen, Scale, ChevronDown, ArrowRight, AlertTriangle, X, Settings, Network, Compass, Flame, History, MessageSquareQuote, CheckCircle2, Trophy, Target, MessageSquare, Info, HelpCircle, GraduationCap, Lock, Unlock } from 'lucide-react';
import { MonacoCodeEditor } from '../features/code-editor/ui/MonacoCodeEditor';
import { QuizTaskEditor } from '../features/quiz-editor/ui/QuizTaskEditor';
import { EssayTaskEditor } from '../features/essay-editor/ui/EssayTaskEditor';
import { SkillDagMap } from '../features/skill-graph/ui/SkillDagMap';
import { StudentProgressPill } from './StudentProgressPill';
import { StudentProfileDrawer } from './StudentProfileDrawer';
import { AbandonTaskModal } from './AbandonTaskModal';
import { JustInTimeTheoryDrawer } from '../features/theory-capsule/ui/JustInTimeTheoryDrawer';
import { resolveTheoryCapsule } from '../features/theory-capsule/model/theory-capsules';
import { GameSkillTreeWidget, SkillGraphNode, DrawerSection, AppShellLayout, Breadcrumbs } from '@sbc/ui';
import {
  TaskDto,
  CourseDto,
  CodeTestDetailDto,
  StudentAdjustmentDto,
  StudentAnalyticsItemDto,
  TaskEvaluationResponseDto,
  TaskSequencerResultDto,
} from '@sbc/types';
import { getAppBaseUrl, ROUTES, resolveStudyUrl } from '@sbc/routes';

// Перевикористовуємо уніфіковані типи DTO платформи
export type TaskDetail = TaskDto;
export type CourseItem = Partial<CourseDto> & { slug: string; title: string; category?: string };

const DEFAULT_COURSES: CourseItem[] = [
  { slug: 'js-dev', title: 'JavaScript & Web Dev', category: 'Programming' },
  { slug: 'english-b2', title: 'Business & Tech English (B2)', category: 'Languages' },
  { slug: 'ukraine-law', title: 'Правознавство України', category: 'Jurisprudence' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface StudentPortalPageProps {
  initialCourseSlug?: string;
  initialSkillSlug?: string;
  source?: string;
  unitSlug?: string;
}

export function StudentPortalContent({
  initialCourseSlug,
  initialSkillSlug,
  source,
  unitSlug,
}: StudentPortalPageProps) {
  const [courses, setCourses] = useState<CourseItem[]>(DEFAULT_COURSES);
  // Завжди ініціалізуємо стабільним дефолтним значенням на сервері та клієнті для запобігання Hydration Mismatch
  const [activeCourseSlug, setActiveCourseSlug] = useState<string>(initialCourseSlug || 'js-dev');
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [exhaustedModalData, setExhaustedModalData] = useState<{ skillId: string; skillTitle: string } | null>(null);

  // Синхронізація збереженого в localStorage курсу виключно після монтування компонента на клієнті
  useEffect(() => {
    if (initialCourseSlug) {
      setActiveCourseSlug(initialCourseSlug);
      return;
    }
    if (typeof window !== 'undefined') {
      const savedCourse = localStorage.getItem('sbc_student_active_course');
      if (savedCourse && savedCourse !== activeCourseSlug) {
        setActiveCourseSlug(savedCourse);
      }
    }
  }, [initialCourseSlug]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/courses`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCourses(data);
            if (initialCourseSlug) {
              setActiveCourseSlug(initialCourseSlug);
            } else {
              const savedCourse = typeof window !== 'undefined' ? localStorage.getItem('sbc_student_active_course') : null;
              if (savedCourse && data.some((c: any) => c.slug === savedCourse)) {
                setActiveCourseSlug(savedCourse);
              } else if (!data.some((c: any) => c.slug === activeCourseSlug)) {
                const defaultSlug = data[0].slug;
                setActiveCourseSlug(defaultSlug);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('sbc_student_active_course', defaultSlug);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching courses list:', err);
      }
    };
    fetchCourses();
  }, [initialCourseSlug]);

  const [courseNotification, setCourseNotification] = useState<string | null>(null);
  const [pendingCourseSlug, setPendingCourseSlug] = useState<string | null>(null);

  const handleSelectCourse = (slug: string) => {
    if (slug === activeCourseSlug) return;
    setPendingCourseSlug(slug);
  };

  const confirmCourseSwitch = () => {
    if (!pendingCourseSlug) return;
    const slug = pendingCourseSlug;
    setActiveCourseSlug(slug);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sbc_student_active_course', slug);
    }
    const targetCourse = courses.find((c) => c.slug === slug);
    const title = targetCourse ? targetCourse.title : slug;
    setCourseNotification(`Активний курс переключено на: ${title}`);
    setTimeout(() => {
      setCourseNotification(null);
    }, 3500);
    setPendingCourseSlug(null);
  };

  const cancelCourseSwitch = () => {
    setPendingCourseSlug(null);
  };
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);
  const [isTheoryDrawerOpen, setIsTheoryDrawerOpen] = useState<boolean>(false);
  const [fullLessonConfirmUrl, setFullLessonConfirmUrl] = useState<string | null>(null);
  const [isAbandoning, setIsAbandoning] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<TaskSequencerResultDto | null>(null);
  const [hasRemediationTask, setHasRemediationTask] = useState<boolean>(true);
  const [code, setCode] = useState<string>('');
  const [essayAnswer, setEssayAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<TaskEvaluationResponseDto | null>(null);
  const [graphNodes, setGraphNodes] = useState<SkillGraphNode[]>([]);
  const [studentAdjustments, setStudentAdjustments] = useState<StudentAdjustmentDto[]>([]);

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

      let adjustments: StudentAdjustmentDto[] = [];
      let telemetryBySkill: Record<string, any> = {};
      if (analyticsRes.ok) {
        const studentsList: StudentAnalyticsItemDto[] = await analyticsRes.json();
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

  const fetchRecommendedTask = async (courseSlug: string, excludeTaskId?: string, targetSkillSlug?: string) => {
    setIsLoading(true);
    setEvalResult(null);
    try {
      await fetchCourseStructureAndState(courseSlug);
      const skillFilter = targetSkillSlug || initialSkillSlug;
      const url = `${API_URL}/api/v1/tasks/recommended?courseSlug=${courseSlug}&userId=demo-student${
        excludeTaskId ? `&excludeTaskId=${excludeTaskId}` : ''
      }${skillFilter ? `&skillSlug=${skillFilter}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setRecommendation(data.recommendation);
        setHasRemediationTask(data.hasRemediationTask ?? true);
        setCode(data.task.starterCode || '');
        setEssayAnswer('');
        setRevealedHintLevel(0);
        setIsTheoryDrawerOpen(false);

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
    fetchRecommendedTask(activeCourseSlug, undefined, initialSkillSlug);
  }, [activeCourseSlug, initialSkillSlug]);

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
          setEvalResult((prev) => {
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
      const activeHintPenaltyPct =
        revealedHintLevel > 0 && task.socraticHints
          ? task.socraticHints.find((h) => h.level === revealedHintLevel)?.penaltyPct ?? 0
          : 0;

      const res = await fetch(`${API_URL}/api/v1/bkt/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          ...payload,
          ...(revealedHintLevel > 0
            ? {
                revealedHintLevel,
                appliedPenaltyPct: activeHintPenaltyPct,
              }
            : {}),
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

  const handleRequestFullLesson = (url: string) => {
    setFullLessonConfirmUrl(url);
  };

  const handleConfirmAbandonAndStudy = async () => {
    if (!fullLessonConfirmUrl || !task) return;
    setIsAbandoning(true);
    try {
      // ⚠️ Режим строгої відмови: надсилаємо запит на фіксацію незданої спроби в BKT (Ot = 0)
      await handleEvaluate({
        code: code || '',
        essayAnswer: essayAnswer || '',
        isAbandoned: true,
      });

      // Скидаємо робочу чернетку та підказки Сократа
      setCode('');
      setEssayAnswer('');
      setRevealedHintLevel(0);

      // Відкриваємо повний Zen-урок підручника
      window.open(fullLessonConfirmUrl, '_blank');
    } catch (err) {
      console.error('Error during task abandonment:', err);
    } finally {
      setIsAbandoning(false);
      setFullLessonConfirmUrl(null);
      setIsTheoryDrawerOpen(false);
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

  // 📘 Progressive Scaffolding Escalation for Just-in-Time Theory:
  // Theory capsule is locked initially to encourage independent problem solving.
  // It unlocks ONLY if:
  // 1. Student revealed Socratic hints to Level 2 or higher (revealedHintLevel >= 2)
  // 2. OR student experienced at least one failed attempt on current task (hasFailedAttemptOnCurrentTask)
  const isTheoryUnlocked = revealedHintLevel >= 2 || hasFailedAttemptOnCurrentTask;

  const getDrawerConfig = () => {
    let title: React.ReactNode = 'Панель';
    let icon = BookOpen;
    let iconColor = 'text-indigo-400';

    if (activeTab === 'task') {
      title = 'Умова та Контекст Завдання';
      icon = BookOpen;
      iconColor = 'text-indigo-400';
    } else if (activeTab === 'bkt') {
      title = 'Карта Навичок (Skill DAG)';
      icon = Sparkles;
      iconColor = 'text-emerald-400';
    } else if (activeTab === 'tree') {
      title = 'Деталізація Вузла Дерева';
      icon = Network;
      iconColor = 'text-purple-400';
    } else if (activeTab === 'settings') {
      title = 'Налаштування Студента';
      icon = Settings;
      iconColor = 'text-amber-400';
    }

    return {
      isOpen: isDrawerOpen,
      title,
      icon,
      iconColor,
      onClose: () => setIsDrawerOpen(false),
      children: (
        <>

              {/* Content Drawer 1: Task Condition & Attempt History */}
              {activeTab === 'task' && task && (
                <div className="flex flex-col gap-3 flex-1">
                  {/* Sub-tab navigation: Condition vs History */}
                  <div className="bg-slate-800/60 p-0.5 rounded-lg flex items-center gap-0.5">
                    <button
                      onClick={() => setTaskDrawerSubTab('condition')}
                      className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        taskDrawerSubTab === 'condition'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Умова</span>
                    </button>
                    <button
                      onClick={() => setTaskDrawerSubTab('history')}
                      className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer relative ${
                        taskDrawerSubTab === 'history'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Історія спроб</span>
                      {taskSubmissions.length > 0 && (
                        <span className={`text-[10px] font-mono ${
                          taskSubmissions.some((s) => s.teacherComment)
                            ? 'text-amber-300 font-bold'
                            : 'text-slate-300'
                        }`}>
                          ({taskSubmissions.length})
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
                        defaultOpen={true}
                      >
                        <div className="flex flex-col gap-2 py-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-indigo-400">
                              {task.skill?.title || 'Навичка'}
                            </span>
                            <div className="flex items-center gap-2">
                              {recommendation?.isDifficultyDegraded && (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setIsDegradationTooltipOpen((prev) => !prev)}
                                    className="p-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 flex items-center justify-center transition-colors cursor-pointer group"
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
                                      <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 animate-fadeIn">
                                        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 text-amber-300 font-bold text-xs">
                                          <div className="flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Допоміжне завдання</span>
                                          </div>
                                          <span className="text-[10px] text-amber-400 font-mono">
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
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                activeSkillMasteryPct >= 90
                                  ? 'bg-emerald-400'
                                  : 'bg-indigo-500'
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
                        <div className="flex flex-col gap-1.5 py-1">
                          <h3 className="text-xs font-bold text-white">{task.title}</h3>
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
                          <div className="py-1 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            <div className="text-[11px] text-slate-300 leading-relaxed">
                              <span className="font-semibold text-indigo-300">Логіка підбору: </span>
                              {recommendation.reason || 'Завдання обрано відповідно до вашого рівня засвоєння.'}
                            </div>
                          </div>
                        </DrawerSection>
                      )}

                      {/* Section 4: Відкриті Тест-Кейси */}
                      {task.taskType === 'CODE' && (task.testCases?.length ?? 0) > 0 && (
                        <DrawerSection
                          title="Відкриті Тест-Кейси"
                          icon={Target}
                          iconColor="text-emerald-400"
                          titleColor="text-emerald-400 group-hover:text-emerald-300"
                          badge={task.testCases?.length || 0}
                          defaultOpen={true}
                          className="border-t border-slate-800/80 pt-2.5"
                        >
                          <div className="flex flex-col divide-y divide-slate-800/50">
                            {(task.testCases || []).map((tc, idx) => (
                              <div
                                key={idx}
                                className="py-2 text-xs font-mono flex flex-col gap-0.5"
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
                        defaultOpen={Boolean(hasFailedAttemptOnCurrentTask && task.socraticHints && task.socraticHints.length > 0)}
                        className="border-t border-slate-800/80 pt-2.5"
                      >
                        {task.socraticHints && task.socraticHints.length > 0 ? (
                          <div className="flex flex-col divide-y divide-slate-800/50">
                            {task.socraticHints.map((hintObj, idx) => {
                              const isRevealed = revealedHintLevel >= hintObj.level;
                              const canUnlock = revealedHintLevel === idx;

                              if (!isRevealed && !canUnlock) return null;

                              return (
                                <div
                                  key={idx}
                                  className="py-2 text-xs"
                                >
                                  {isRevealed ? (
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center justify-between font-bold text-[11px] text-amber-300">
                                        <span className="flex items-center gap-1.5">
                                          <span>💡 Підказка {hintObj.level}:</span>
                                          {hintObj.level >= 2 && (
                                            <span className="text-[10px] font-normal text-emerald-400 flex items-center gap-0.5">
                                              <Unlock className="w-2.5 h-2.5" />
                                              <span>Теорію розблоковано</span>
                                            </span>
                                          )}
                                        </span>
                                        <span className="text-[10px] font-mono text-amber-400/80">-{hintObj.penaltyPct}% балу</span>
                                      </div>
                                      <p className="text-[11px] leading-relaxed text-slate-200">{hintObj.hint}</p>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setRevealedHintLevel(hintObj.level)}
                                      className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-medium text-xs flex items-center justify-between transition-colors cursor-pointer"
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Розкрити підказку {hintObj.level}</span>
                                        {hintObj.level === 2 && !isTheoryUnlocked && (
                                          <span className="text-[10px] text-blue-300 font-normal flex items-center gap-0.5">
                                            <Unlock className="w-2.5 h-2.5" />
                                            <span>розблокує теорію</span>
                                          </span>
                                        )}
                                      </span>
                                      <span className="text-[10px] font-mono text-amber-400">(-{hintObj.penaltyPct}%)</span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-2 flex items-center gap-2 text-slate-500 text-xs">
                            <HelpCircle className="w-3.5 h-3.5 shrink-0 opacity-60" />
                            <span>Підказки Сократа не закладені для цієї вправи.</span>
                          </div>
                        )}
                      </DrawerSection>

                      {/* Section 6: Навчальний модуль у разі труднощів */}
                      <DrawerSection
                        title="Матеріал для повторення"
                        icon={BookOpen}
                        iconColor="text-blue-400"
                        titleColor="text-blue-400 group-hover:text-blue-300"
                        defaultOpen={true}
                        className="border-t border-slate-800/80 pt-2.5"
                      >
                        <div className="py-1.5 flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-slate-200">Експрес-теорія (Just-in-Time)</span>
                              <span className="text-[10px] text-slate-500">
                                {isTheoryUnlocked
                                  ? 'Стисла довідка прямо в тренажері'
                                  : 'Потрібна підказка Сократа 2+ або помилка'}
                              </span>
                            </div>
                            <button
                              type="button"
                              disabled={!isTheoryUnlocked}
                              onClick={() => {
                                if (isTheoryUnlocked) setIsTheoryDrawerOpen(true);
                              }}
                              data-testid="drawer-jit-theory-btn"
                              className={`px-2.5 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1 transition-colors shrink-0 ${
                                isTheoryUnlocked
                                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                                  : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-700/40'
                              }`}
                              title={
                                isTheoryUnlocked
                                  ? 'Читати теоретичну капсулу'
                                  : 'Заблоковано: активуйте підказку Сократа 2+ або зробіть спробу розв\'язання'
                              }
                            >
                              {isTheoryUnlocked ? (
                                <>
                                  <span>Читати</span>
                                  <ArrowRight className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3 text-slate-500" />
                                  <span>Заблоковано</span>
                                </>
                              )}
                            </button>
                          </div>
                          {task.studyUnitUrl && (
                            <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between gap-2 text-[11px]">
                              <span className="text-slate-400">Повний інтерактивний підручник</span>
                              <button
                                type="button"
                                data-testid="sidebar-open-full-lesson-btn"
                                onClick={() => handleRequestFullLesson(resolveStudyUrl(task.studyUnitUrl!))}
                                className="text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>Zen-урок</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </DrawerSection>

                      {/* Action Button */}
                      <button
                        onClick={() => fetchRecommendedTask(activeCourseSlug)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer mt-2"
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
                          <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                            <History className="w-5 h-5 text-slate-600" />
                            <span>Ви ще не надсилали спроб для цього завдання.</span>
                          </div>
                        ) : (
                          <div className="flex flex-col divide-y divide-slate-800/50 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                            {taskSubmissions.map((sub, idx) => {
                              const isLatest = idx === 0;
                              const isApproved = sub.teacherReviewStatus === 'APPROVED' || sub.status === 'ACCEPTED';
                              const isPending = sub.teacherReviewStatus === 'PENDING_REVIEW';
                              const isSuperseded = sub.teacherReviewStatus === 'SUPERSEDED';

                              return (
                                <div
                                  key={sub.id}
                                  className="py-2.5 flex flex-col gap-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-medium text-white">
                                        Спроба #{sub.attemptNumber || taskSubmissions.length - idx}
                                      </span>
                                      {isLatest && (
                                        <span className="text-[10px] font-mono text-indigo-400">
                                          (остання)
                                        </span>
                                      )}
                                    </div>
                                    <span className={`text-[10px] font-mono font-bold ${
                                      isApproved
                                        ? 'text-emerald-400'
                                        : isPending
                                        ? 'text-amber-400'
                                        : isSuperseded
                                        ? 'text-slate-500'
                                        : 'text-rose-400'
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
                                    {new Date(sub.createdAt).toLocaleString()}
                                  </div>

                                  {/* Teacher Comment Banner if present */}
                                  {sub.teacherComment && (
                                    <div className="pl-2.5 border-l-2 border-purple-500/50 flex flex-col gap-0.5 my-1">
                                      <span className="text-purple-300 font-semibold text-[10px]">
                                        Коментар викладача:
                                      </span>
                                      <p className="text-xs text-purple-100 italic leading-relaxed">
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
                                      <pre className="mt-1 p-2 bg-slate-950/80 rounded text-slate-300 font-mono text-[10px] overflow-x-auto max-h-36">
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
                    defaultOpen={true}
                  >
                    <SkillDagMap nodes={graphNodes} activeSkillSlug={task?.skill?.slug} />

                    <button
                      onClick={() => {
                        handleTabClick('tree');
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
                    >
                      <Network className="w-3.5 h-3.5" />
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
                        defaultOpen={true}
                      >
                        <div className="flex flex-col gap-1.5 py-1">
                          <h3 className="text-xs font-bold text-white">{inspectedSkill.title}</h3>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {inspectedSkill.description || 'Ключовий модуль курсу для набуття практичних навичок.'}
                          </p>
                          {inspectedSkill.status === 'LOCKED' && (
                            <div className="pl-2.5 border-l-2 border-rose-500/50 text-[11px] text-rose-300 mt-1">
                              Необхідно спершу засвоїти попередні залежні модулі до рівня P(L) ≥ 0.75.
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
                        defaultOpen={true}
                        className="border-t border-slate-800/80 pt-2.5"
                      >
                        <div className="py-1 flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Рівень P(L):</span>
                            <span className={`font-mono font-bold ${
                              inspectedSkill.pMastery >= 0.90 ? 'text-emerald-400' : 'text-indigo-400'
                            }`}>
                              {(inspectedSkill.pMastery * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                inspectedSkill.pMastery >= 0.90
                                  ? 'bg-emerald-400'
                                  : inspectedSkill.status === 'LOCKED'
                                  ? 'bg-slate-700'
                                  : 'bg-indigo-500'
                              }`}
                              style={{ width: `${Math.min(100, inspectedSkill.pMastery * 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>0%</span>
                            <span>Поріг: ≥ 90%</span>
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
                        <div className="text-[11px] text-slate-300 py-1">
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
                        className={`w-full py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2 ${
                          inspectedSkill.status === 'LOCKED'
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : inspectedSkill.pMastery >= 0.90
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
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
                    <div className="flex flex-col gap-3 text-xs text-slate-300 py-1">
                      <p>Параметри середовища розробки та актуалізації моделі знань.</p>
                      <button
                        onClick={() => fetchRecommendedTask(activeCourseSlug)}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium cursor-pointer hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Перезавантажити стан BKT</span>
                      </button>
                    </div>
                  </DrawerSection>
                </div>
              )}
            
        </>
      ),
    };
  };

  return (
    <>
      <AppShellLayout
        currentApp="student"
        header={{
        appName: 'Smart-BKT-Chain',
        badgeText: 'Student',
        logoIcon: Brain,
        logoColor: 'bg-indigo-500/15 text-indigo-400',
        courseBadge: (
          <span
            className="text-xs sm:text-[13px] font-normal text-slate-300 select-none tracking-normal"
            title={`Активний курс: ${courses.find((c) => c.slug === activeCourseSlug)?.title || activeCourseSlug}`}
          >
            {courses.find((c) => c.slug === activeCourseSlug)?.title || activeCourseSlug}
          </span>
        ),
        breadcrumbs: (
          <Breadcrumbs
            className="text-[11px]"
            items={[
              ...(task?.skill?.title ? [{
                label: task.skill.title,
                onClick: () => handleTabClick('bkt'),
              }] : []),
              ...(task ? [{
                label: task.title,
                badge: `${task.difficulty || 'MEDIUM'}`,
                isCurrent: true,
              }] : []),
            ]}
          />
        ),
        rightSlot: (
          <div className="flex items-center gap-2">
            {/* 💊 Компактний інтерактивний мікро-віджет прогресу та BKT */}
            <StudentProgressPill
              courseTitle={courses.find((c) => c.slug === activeCourseSlug)?.title || activeCourseSlug}
              courseCompletionPct={courseCompletionPct}
              masteredSkillsCount={masteredSkillsCount}
              totalSkillsCount={totalSkillsCount}
              activeSkillTitle={activeSkillNode ? activeSkillNode.title : task?.skill?.title}
              activeSkillMasteryPct={activeSkillMasteryPct}
              onOpenSkillTree={() => handleTabClick('tree')}
              onOpenSkillDag={() => handleTabClick('bkt')}
            />

            <div className="h-4 w-[1px] bg-slate-800" />

            {/* Профіль студента у крайньому правому кутку (відкриває Profile Drawer) */}
            <button
              type="button"
              onClick={() => setIsProfileDrawerOpen(true)}
              className="flex items-center gap-2 hover:bg-slate-800/60 px-2 py-1 rounded-lg transition-colors cursor-pointer select-none text-left group"
              title="Натисніть для відкриття профілю та вибору курсів"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                ДС
              </div>
              <div className="hidden lg:flex flex-col leading-none">
                <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                  Дмитро Стеценко
                </span>
                <span className="text-[9px] font-mono text-indigo-400 mt-0.5">
                  УЧЕНЬ
                </span>
              </div>
            </button>
          </div>
        ),
      }}
      navigationRail={{
        tabs: [
          {
            id: 'task',
            icon: BookOpen,
            title: activeTab === 'task'
              ? isDrawerOpen
                ? 'Редактор відкритий із панеллю умови (клік розгорне редактор на весь екран)'
                : 'Редактор на весь екран (клік поверне бічну панель умови)'
              : 'Перейти до Редактора та завдання',
            activeColor: 'bg-indigo-600',
          },
          {
            id: 'bkt',
            icon: Sparkles,
            title: activeTab === 'bkt'
              ? isDrawerOpen
                ? 'Карта навичок відкрита (клік розгорне редактор на весь екран)'
                : 'Редактор на весь екран (клік поверне карту BKT)'
              : 'Карта Навичок BKT (DAG у бічній панелі)',
            activeColor: 'bg-emerald-600',
          },
          {
            id: 'tree',
            icon: Network,
            title: activeTab === 'tree'
              ? isDrawerOpen
                ? 'Дерево відкрите із сайдбаром (клік розгорне дерево на весь екран)'
                : 'Дерево на весь екран (клік поверне сайдбар деталей вузла)'
              : 'Перейти до Дерева Знань',
            activeColor: 'bg-gradient-to-br from-indigo-600 to-purple-600',
          },
        ],
        activeTab: activeTab,
        isDrawerOpen: isDrawerOpen,
        onTabClick: (tabId) => handleTabClick(tabId as any),
        onSettingsClick: () => handleTabClick('settings'),
        isSettingsActive: activeTab === 'settings',
      }}
      drawer={getDrawerConfig()}
      mainClassName="overflow-hidden flex flex-col bg-slate-950"
      overlays={
        <>
          {/* 🔔 Floating Course Switch Toast Notification */}
      {courseNotification && (
        <div className="fixed top-16 right-6 z-50 animate-fadeIn flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-950/90 border border-indigo-500/50 text-white shadow-2xl backdrop-blur-xl">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
          <div className="text-xs font-medium">
            <span className="font-bold text-indigo-300 block text-[11px] uppercase tracking-wider">Навчальний контекст</span>
            {courseNotification}
          </div>
          <button
            onClick={() => setCourseNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
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

      {/* Course Switch Confirmation Modal Popup */}
      {pendingCourseSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full p-6 bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl flex flex-col gap-5 text-center transform transition-all scale-100">
            <div className="mx-auto p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400">
              <BookOpen className="w-8 h-8 animate-pulse" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-white">Перемикання Навчального Курсу</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ви дійсно бажаєте перейти до вивчення курсу <strong className="text-indigo-300">"{courses.find(c => c.slug === pendingCourseSlug)?.title || pendingCourseSlug}"</strong>?
              </p>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 text-left flex flex-col gap-1">
                <span>⚠️ Незбережені зміни в поточному коді будуть скинуті.</span>
                <span>📊 Буде завантажено індивідуальну траєкторію BKT нового курсу.</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={cancelCourseSwitch}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer border border-slate-700"
              >
                Скасувати
              </button>
              <button
                onClick={confirmCourseSwitch}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-indigo-400/30"
              >
                Підтвердити перехід
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      }
    >
      
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
              {/* Хлібні крихти перенесені в головний AppShellLayout хедер для уникнення дублювання */}

              {/* 🎓 Міжпортальна плашка повернення до Підручника Теорії (Cross-App Protocol) */}
              {source === 'study' && (
                <div className="w-full bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-slate-900 border border-blue-500/40 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shrink-0">
                      <GraduationCap className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Шлюз перевірки компетенції з Підручника
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {unitSlug || 'Теоретичний блок'}
                        </span>
                      </div>
                      <p className="text-xs text-blue-200/90 mt-0.5">
                        Ви перейшли для підтвердження знань. Після успішного проходження вправи BKT-секвенсор опрацює результат і розблокує подальші теми.
                      </p>
                    </div>
                  </div>
                  <a
                    href={getAppBaseUrl('study')}
                    className="px-4 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white font-bold text-xs border border-blue-400/40 transition-all flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
                  >
                    <span>← Повернутися до підручника</span>
                  </a>
                </div>
              )}

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
                      Тема: {task.topic || task.skill?.title || 'Навичка'}
                    </span>
                  </div>
                </div>
              )}

              {/* 📊 Active Task Compact Toolbar */}
              <div className="w-full pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-mono font-semibold text-indigo-400">
                      {task.skill?.title || 'Навичка'}
                    </span>
                    {task.topic && (
                      <>
                        <span className="text-slate-600">/</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {task.topic}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    {task.title}
                  </h2>
                </div>

                {/* Quick Navigation to Theory & Skill Tree */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative group">
                    <button
                      type="button"
                      data-testid="open-jit-theory-btn"
                      disabled={!isTheoryUnlocked}
                      onClick={() => {
                        if (isTheoryUnlocked) setIsTheoryDrawerOpen(true);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all select-none ${
                        isTheoryUnlocked
                          ? 'bg-blue-950/40 border border-blue-800/60 text-blue-300 hover:bg-blue-900/60 hover:text-white cursor-pointer shadow-sm shadow-blue-950/50'
                          : 'bg-slate-800/40 border border-slate-700/40 text-slate-500 cursor-not-allowed opacity-75'
                      }`}
                      title={
                        isTheoryUnlocked
                          ? 'Відкрити вбудовану теоретичну капсулу без переходу на іншу вкладку'
                          : '🔒 Експрес-теорія заблокована. Спочатку скористайтеся підказками Сократа (рівень 2+) або спробуйте розв\'язати самостійно.'
                      }
                    >
                      {isTheoryUnlocked ? (
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>Теорія</span>
                      {!isTheoryUnlocked && (
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                          2+
                        </span>
                      )}
                    </button>

                    {/* Tooltip for locked theory button */}
                    {!isTheoryUnlocked && (
                      <div
                        data-testid="jit-theory-locked-tooltip"
                        className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col gap-1 w-64 p-2.5 rounded-lg bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md z-30 text-[11px] text-slate-300 leading-snug animate-fadeIn pointer-events-none"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                          <Lock className="w-3 h-3 shrink-0" />
                          <span>Експрес-теорія обмежена</span>
                        </div>
                        <p className="text-slate-400 text-[10px]">
                          Спробуйте розв'язати самостійно. Теорія розблокується після 2-ї підказки Сократа або при першій невдалій спробі.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleTabClick('tree')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                    title="Відкрити Дерево Знань"
                  >
                    <Network className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">Дерево знань</span>
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

              {/* Evaluation Result Panel */}
              {evalResult && (
                <div
                  className={`pl-3.5 py-2.5 border-l-2 flex flex-col gap-3 shrink-0 ${
                    evalResult.isPassed
                      ? 'border-l-emerald-400 text-emerald-100'
                      : 'border-l-rose-400 text-rose-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                      {evalResult.isPassed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex flex-col gap-0.5">
                        <h4 className="font-bold text-xs text-white">
                          {evalResult.isPassed ? 'Вітаємо! Перевірку пройдено' : 'Необхідне доопрацювання'}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{evalResult.feedback}</p>
                      </div>
                    </div>

                    {evalResult.bktUpdate && (
                      <div className="flex items-center gap-1.5 text-xs font-mono shrink-0">
                        <span className="text-slate-500">P(L):</span>
                        <span className="text-slate-400">{(evalResult.bktUpdate.pMasteryBefore * 100).toFixed(1)}%</span>
                        <span className="text-slate-600">➔</span>
                        <span className={`font-bold ${evalResult.bktUpdate.pMasteryChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {(evalResult.bktUpdate.pMasteryAfter * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 🧪 Code Test Details Breakdown */}
                  {evalResult.testDetails && evalResult.testDetails.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80 text-xs font-mono">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                        Результати перевірки тестів:
                      </span>
                      <div className="flex flex-col divide-y divide-slate-800/50">
                        {evalResult.testDetails.map((td: CodeTestDetailDto, i: number) => (
                          <div
                            key={i}
                            className="py-1.5 flex items-center justify-between gap-2 text-[11px]"
                          >
                            <div className="flex items-center gap-2">
                              <span className={td.passed ? 'text-emerald-400' : 'text-rose-400'}>
                                {td.passed ? '✓' : '✕'}
                              </span>
                              <span className="text-slate-300">
                                {td.input && td.input.startsWith('"') && !td.input.includes('eval:')
                                  ? `Змінна ${td.input.replace(/"/g, '')}`
                                  : `Тест #${i + 1}`}:
                              </span>
                              <span className="text-slate-500">Очікувалось:</span>
                              <code className="text-emerald-300">{td.expected}</code>
                              <span className="text-slate-600">|</span>
                              <span className="text-slate-500">Отримано:</span>
                              <code className={td.passed ? 'text-emerald-300' : 'text-rose-300'}>{td.actual}</code>
                            </div>
                            <span className={`font-bold text-[10px] ${
                              td.passed ? 'text-emerald-400' : 'text-rose-400'
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
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-300 flex items-center gap-1.5">
                          <span>Семантична оцінка:</span>
                          <span className="font-mono font-bold text-indigo-400">
                            {evalResult.semanticScore !== undefined ? `${Math.round(evalResult.semanticScore * 100)}%` : '—'}
                          </span>
                        </span>

                        {evalResult.teacherReviewStatus === 'PENDING_REVIEW' ? (
                          <span className="text-[11px] font-mono text-amber-400">
                            ⏳ Очікує верифікації викладачем
                          </span>
                        ) : evalResult.teacherReviewStatus === 'APPROVED' ? (
                          <span className="text-[11px] font-mono text-emerald-400">
                            ✓ Підтверджено викладачем
                          </span>
                        ) : null}
                      </div>

                      {evalResult.semanticDetails && (
                        <div className="flex flex-col gap-1">
                          {evalResult.semanticDetails.keyConceptsCovered?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              <span className="text-slate-400">Розкрито поняття:</span>
                              {evalResult.semanticDetails.keyConceptsCovered.map((kw: string, i: number) => (
                                <span key={i} className="text-emerald-300 font-mono">
                                  #{kw.split('|')[0]}
                                </span>
                              ))}
                            </div>
                          )}

                          {evalResult.semanticDetails.missingConcepts?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              <span className="text-slate-400">Варто додати:</span>
                              {evalResult.semanticDetails.missingConcepts.map((kw: string, i: number) => (
                                <span key={i} className="text-rose-300 font-mono">
                                  #{kw.split('|')[0]}
                                </span>
                              ))}
                            </div>
                          )}

                          {evalResult.semanticDetails.detectedMisconceptions?.length > 0 && (
                            <div className="text-rose-300 text-[11px]">
                              ⚠️ Виявлено когнітивну помилку: зверніть увагу на точність формулювання щодо теми.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Teacher Comment Banner in Toast if reviewed */}
                      {evalResult.teacherComment && (
                        <div className="pl-2.5 border-l-2 border-purple-500/50 flex flex-col gap-0.5 mt-1">
                          <span className="text-purple-300 font-semibold text-[11px]">
                            Відгук викладача:
                          </span>
                          <p className="text-xs text-purple-100 italic leading-relaxed">
                            "{evalResult.teacherComment}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 🧠 Personalized Cognitive Misconception Diagnostic Block */}
                  {!evalResult.isPassed && evalResult.detectedMisconception && (
                    <div
                      data-testid="misconception-alert"
                      className="pt-2.5 border-t border-slate-800/80 flex flex-col gap-1.5"
                    >
                      <div className="pl-3 border-l-2 border-l-amber-400 flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Діагностика помилки: {evalResult.detectedMisconception.title}</span>
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {evalResult.detectedMisconception.explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 📘 Automatic Just-in-Time Theory Micro-Module Offer */}
                  {!evalResult.isPassed &&
                    (evalResult.offerJustInTimeTheory ||
                      (evalResult.bktUpdate?.pMasteryAfter ?? 1) < 0.35 ||
                      Boolean(evalResult.detectedMisconception)) && (
                      <div
                        data-testid="jit-theory-offer"
                        className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-200">
                              {(evalResult.bktUpdate?.pMasteryAfter ?? 1) < 0.35
                                ? 'Рівень опанування P(L) нижче 35% — рекомендуємо експрес-теорію'
                                : 'Швидке теоретичне пояснення за темою'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Перегляньте стислу теоретичну капсулу та зразок коду прямо в тренажері без втрати відповіді.
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          data-testid="jit-theory-offer-btn"
                          onClick={() => setIsTheoryDrawerOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Відкрити експрес-теорію</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  {/* ⚡ Adaptive Graceful Degradation Action Prompt */}
                  {!evalResult.isPassed && (
                    <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${
                          hasRemediationTask ? 'text-amber-400' : 'text-slate-500'
                        }`} />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-200">
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
                        className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
                          hasRemediationTask
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 cursor-pointer'
                            : 'bg-slate-900 text-slate-600 cursor-not-allowed opacity-60'
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
        
      </AppShellLayout>

      {/* 📘 Права бічна панель експрес-теорії (Just-in-Time Theory Micro-Module) */}
      <JustInTimeTheoryDrawer
        isOpen={isTheoryDrawerOpen}
        onClose={() => setIsTheoryDrawerOpen(false)}
        capsule={resolveTheoryCapsule(task, activeCourseSlug)}
        detectedMisconception={evalResult?.detectedMisconception}
        fullLessonUrl={
          evalResult?.recommendedTheoryUrl
            ? resolveStudyUrl(evalResult.recommendedTheoryUrl)
            : task?.studyUnitUrl
            ? resolveStudyUrl(task.studyUnitUrl)
            : null
        }
        onRequestFullLesson={handleRequestFullLesson}
      />

      {/* ⚠️ Модальне вікно підтвердження відмови від спроби заради повного підручника */}
      <AbandonTaskModal
        isOpen={Boolean(fullLessonConfirmUrl)}
        onClose={() => setFullLessonConfirmUrl(null)}
        onConfirm={handleConfirmAbandonAndStudy}
        targetLessonUrl={fullLessonConfirmUrl}
        isSubmitting={isAbandoning}
      />

      {/* 👤 Права бічна панель (Right Profile & Courses Drawer) */}
      <StudentProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        courses={courses}
        activeCourseSlug={activeCourseSlug}
        onSelectCourse={(slug) => {
          handleSelectCourse(slug);
          setIsProfileDrawerOpen(false);
        }}
        courseCompletionPct={courseCompletionPct}
        masteredSkillsCount={masteredSkillsCount}
        totalSkillsCount={totalSkillsCount}
        onResetBktState={() => {
          fetchRecommendedTask(activeCourseSlug);
          setIsProfileDrawerOpen(false);
        }}
      />
    </>
  );
}

export default StudentPortalContent;
