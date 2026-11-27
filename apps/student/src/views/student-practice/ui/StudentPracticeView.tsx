'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Brain, Sparkles, RefreshCw, BookOpen, Settings, Network, X } from 'lucide-react';
import { StudentProgressPill } from '@/features/practice-progress';
import { StudentProfileDrawer } from '@/widgets/student-profile';
import { PracticeSidebarDrawer, type StudentTab } from '@/widgets/practice-sidebar';
import { PracticeTaskWorkspace } from '@/widgets/practice-workspace';
import { AbandonTaskModal } from '@/features/abandon-task';
import { JustInTimeTheoryDrawer } from '@/features/theory-capsule/ui/JustInTimeTheoryDrawer';
import { resolveTheoryCapsule } from '@/features/theory-capsule/model/theory-capsules';
import { GameSkillTreeWidget, SkillGraphNode, AppShellLayout, Breadcrumbs, AuthModal, ConfirmModal } from '@sbc/ui';
import {
  TaskDto,
  StudentAdjustmentDto,
  StudentAnalyticsItemDto,
  TaskEvaluationResponseDto,
  TaskSequencerResultDto,
  PracticeIntegrityMode,
  IntegrityPolicy,
} from '@sbc/types';
import { resolveStudyUrl } from '@sbc/routes';
import type { CourseItem } from '@/entities/course';

// Перевикористовуємо уніфіковані типи DTO платформи
export type TaskDetail = TaskDto;
export type { CourseItem };

const DEFAULT_COURSES: CourseItem[] = [
  { slug: 'web-algorithms-school', title: 'Вебтехнології та алгоритмізація (10–11 класи)', category: 'Програмування & IT' },
  { slug: 'js-dev', title: 'JavaScript & Web Engineering', category: 'Програмування & IT' },
  { slug: 'english-b2', title: 'Business & Tech English (B2)', category: 'Іноземні Мови' },
  { slug: 'ukraine-law', title: 'Правознавство України', category: 'Право & Суспільствознавство' },
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
  const [isCourseHydrated, setIsCourseHydrated] = useState<boolean>(Boolean(initialCourseSlug));
  const courseFetchSeqRef = useRef<number>(0);
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [exhaustedModalData, setExhaustedModalData] = useState<{ skillId: string; skillTitle: string } | null>(null);

  // 🔐 Авторизація, Тестовий режим та Режим зарахування (Enrollment Mode Gating)
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [testModeEnabled, setTestModeEnabled] = useState(true);
  const [googleClientId, setGoogleClientId] = useState<string | undefined>(undefined);
  const [enrollmentMode, setEnrollmentMode] = useState<'FULL_CYCLE' | 'TESTING_ONLY' | 'MODULAR'>('FULL_CYCLE');
  const [allowedModules, setAllowedModules] = useState<string[]>([]);

  const currentUserId = currentUser?.id || 'demo-student';
  const currentUserName = currentUser?.profile?.firstName
    ? `${currentUser.profile.firstName} ${currentUser.profile.lastName || ''}`.trim()
    : currentUser?.email || 'Дмитро Стеценко';
  const currentUserRole = currentUser?.role || 'УЧЕНЬ';
  const currentUserInitials = currentUserName
    .split(' ')
    .filter(Boolean)
    .map((s: string) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ДС';

  // Синхронізація сесії користувача та завантаження системної конфігурації
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('sbc_auth_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
    }

    const fetchAuthConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/config`);
        if (res.ok) {
          const data = await res.json();
          setTestModeEnabled(!!data.testModeEnabled);
          setGoogleClientId(data.googleClientId);
        }
      } catch (err) {
        console.warn('Failed to load auth config:', err);
      }
    };
    fetchAuthConfig();
  }, []);

  // Динамічне завантаження статусу зарахування на курс (Enrollment Mode)
  useEffect(() => {
    const fetchEnrollment = async () => {
      const activeId = currentUser?.id;
      if (!activeId) {
        setEnrollmentMode('FULL_CYCLE');
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/v1/classrooms/student/${activeId}`);
        if (res.ok) {
          const enrollments = await res.json();
          if (Array.isArray(enrollments)) {
            const currentEnrollment = enrollments.find(
              (e: any) => e.course?.slug === activeCourseSlug || e.courseId === activeCourseSlug
            );
            if (currentEnrollment) {
              setEnrollmentMode(currentEnrollment.mode || 'FULL_CYCLE');
              setAllowedModules(currentEnrollment.allowedModules || []);
            } else {
              setEnrollmentMode('FULL_CYCLE');
              setAllowedModules([]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching student enrollment:', err);
      }
    };
    fetchEnrollment();
  }, [currentUser, activeCourseSlug]);

  const handleGoogleLogin = async (credential: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sbc_auth_token', data.token);
          localStorage.setItem('sbc_auth_user', JSON.stringify(data.user));
        }
        setCurrentUser(data.user);
        fetchRecommendedTask(activeCourseSlug, undefined, undefined, data.user.id);
      }
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  const handleMockLogin = async (roleKey: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/mock-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdOrEmail: roleKey }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sbc_auth_token', data.token);
          localStorage.setItem('sbc_auth_user', JSON.stringify(data.user));
        }
        setCurrentUser(data.user);
        fetchRecommendedTask(activeCourseSlug, undefined, undefined, data.user.id);
      }
    } catch (err) {
      console.error('Mock login failed:', err);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sbc_auth_token');
      localStorage.removeItem('sbc_auth_user');
    }
    setCurrentUser(null);
    setEnrollmentMode('FULL_CYCLE');
    setAllowedModules([]);
    fetchRecommendedTask(activeCourseSlug, undefined, undefined, 'demo-student');
  };

  // Синхронізація збереженого в localStorage курсу виключно після монтування компонента на клієнті
  useEffect(() => {
    if (initialCourseSlug) {
      setActiveCourseSlug(initialCourseSlug);
      setIsCourseHydrated(true);
      return;
    }
    if (typeof window !== 'undefined') {
      const savedCourse = localStorage.getItem('sbc_student_active_course');
      if (savedCourse && savedCourse !== activeCourseSlug) {
        setActiveCourseSlug(savedCourse);
      }
    }
    setIsCourseHydrated(true);
  }, [initialCourseSlug]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/courses?status=PUBLISHED`);
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
      // Синхронізуємо URL маршруту, щоб після F5 завантажувався саме обраний курс
      if (window.location.pathname.startsWith('/practice/')) {
        window.history.replaceState(null, '', `/practice/${slug}`);
      }
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

  // 🛡️ Режими проходження навички (TRAINING vs GRADED) та політика викладача (Brainstorm #22)
  const [skillModeMap, setSkillModeMap] = useState<
    Record<string, { activeMode: PracticeIntegrityMode; attemptsCount: number; gradedMastery: number | null }>
  >({});
  const [integrityPolicy, setIntegrityPolicy] = useState<IntegrityPolicy>('STUDENT_CHOICE');
  const [strictModeUntil, setStrictModeUntil] = useState<string | null>(null);
  const [policyClassroomName, setPolicyClassroomName] = useState<string | null>(null);
  const [pendingModeSwitch, setPendingModeSwitch] = useState<PracticeIntegrityMode | null>(null);
  const [isSwitchingMode, setIsSwitchingMode] = useState<boolean>(false);
  const [modeSwitchNotice, setModeSwitchNotice] = useState<string | null>(null);
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
  const [revealedHintLevel, setRevealedHintLevel] = useState<number>(0);
  const [isSocraticHintsOpen, setIsSocraticHintsOpen] = useState<boolean>(false);
  const [annulmentAlert, setAnnulmentAlert] = useState<{
    reason: string;
    comment?: string;
    pMasteryUpdated?: number;
  } | null>(null);
  const [theoryOpenStartTime, setTheoryOpenStartTime] = useState<number | null>(null);

  const logActivity = async (eventType: string, payload: Record<string, any> = {}) => {
    try {
      await fetch(`${API_URL}/api/v1/bkt/activity-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          userId: currentUserId,
          courseId: activeCourseSlug,
          skillId: task?.skillId,
          taskId: task?.id,
          eventType,
          payload,
        }),
      });
    } catch (e) {
      // Non-blocking activity logging
    }
  };

  const fetchTaskSubmissions = async (taskId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/tasks/${taskId}/submissions?userId=${currentUserId}`);
      if (res.ok) {
        const data = await res.json();
        setTaskSubmissions(data);
      }
    } catch (err) {
      console.error('Error fetching task submissions:', err);
    }
  };

  const fetchCourseStructureAndState = async (courseSlug: string) => {
    const reqId = ++courseFetchSeqRef.current;
    try {
      const courseRes = await fetch(`${API_URL}/api/v1/courses/${courseSlug}`);
      const bktRes = await fetch(`${API_URL}/api/v1/bkt/state/${currentUserId}`);
      const analyticsRes = await fetch(`${API_URL}/api/v1/bkt/analytics/students?courseSlug=${courseSlug}`);

      // Ігноруємо застарілу відповідь, якщо курс уже перемкнули
      if (reqId !== courseFetchSeqRef.current) return;

      let bktMap: Record<string, number> = {};
      if (bktRes.ok) {
        const states: Array<{
          skillId: string;
          pMastery: number;
          attemptsCount?: number;
          activeMode?: PracticeIntegrityMode;
          gradedMastery?: number | null;
        }> = await bktRes.json();
        const nextModeMap: Record<
          string,
          { activeMode: PracticeIntegrityMode; attemptsCount: number; gradedMastery: number | null }
        > = {};
        states.forEach((s) => {
          bktMap[s.skillId] = s.pMastery;
          nextModeMap[s.skillId] = {
            activeMode: s.activeMode || 'TRAINING',
            attemptsCount: s.attemptsCount ?? 0,
            gradedMastery: s.gradedMastery ?? null,
          };
        });
        setSkillModeMap(nextModeMap);
      }

      let adjustments: StudentAdjustmentDto[] = [];
      let telemetryBySkill: Record<string, any> = {};
      if (analyticsRes.ok) {
        const studentsList: StudentAnalyticsItemDto[] = await analyticsRes.json();
        const demoStudent = studentsList.find((s) => s.id === currentUserId || s.email === currentUser?.email || s.id === 'demo-student') || studentsList[0];
        if (demoStudent) {
          adjustments = demoStudent.recentAdjustments || [];
          telemetryBySkill = demoStudent.telemetryBySkill || {};
          setStudentAdjustments(adjustments);
        }
      }

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        const modules = courseData.modules || [];
        const skills = courseData.skills || [];

        // 1. Обрахунок середньої майстерності BKT для кожного модуля
        const moduleMasteryMap: Record<string, number> = {};
        modules.forEach((mod: any) => {
          const modSkills = skills.filter((s: any) => s.moduleId === mod.id);
          if (modSkills.length === 0) {
            moduleMasteryMap[mod.id] = 1.0;
          } else {
            const sum = modSkills.reduce((acc: number, s: any) => acc + (bktMap[s.id] ?? 0.0), 0);
            moduleMasteryMap[mod.id] = sum / modSkills.length;
          }
        });

        // 2. Визначення статусу розблокування модулів (Mastery Gating)
        const isTestingOnly = enrollmentMode === 'TESTING_ONLY';
        const moduleUnlockMap: Record<string, boolean> = {};
        const sortedModules = [...modules].sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));

        sortedModules.forEach((mod: any, index: number) => {
          const isAllowed =
            !allowedModules ||
            allowedModules.length === 0 ||
            allowedModules.includes(mod.id) ||
            allowedModules.includes(mod.slug);

          if (!isAllowed) {
            moduleUnlockMap[mod.id] = false;
            return;
          }

          if (isTestingOnly || index === 0) {
            moduleUnlockMap[mod.id] = true;
          } else {
            const prevMod = sortedModules[index - 1];
            const prevMastery = moduleMasteryMap[prevMod.id] ?? 0.0;
            const prevThreshold = prevMod.minMasteryThreshold ?? courseData.defaultMasteryThreshold ?? 0.85;
            moduleUnlockMap[mod.id] = prevMastery >= prevThreshold;
          }
        });

        const mappedNodes: SkillGraphNode[] = skills.map((skill: any) => {
          const p = bktMap[skill.id] ?? 0.0;
          const isMastered = p >= 0.90; // Gold Mastery threshold
          const parentIds = skill.parentDependencies?.map((d: any) => d.parentSkillId) || [];
          const parentThresholds: Record<string, number> = {};
          (skill.parentDependencies || []).forEach((d: any) => {
            if (d.parentSkillId) {
              parentThresholds[d.parentSkillId] = typeof d.requiredMastery === 'number' ? d.requiredMastery : 0.85;
            }
          });
          const parentMastered =
            parentIds.length === 0 ||
            parentIds.every((pid: string) => (bktMap[pid] ?? 0) >= (parentThresholds[pid] ?? 0.85));

          const isModUnlocked = skill.moduleId ? (moduleUnlockMap[skill.moduleId] ?? true) : true;
          const isAllowedSkill =
            !allowedModules ||
            allowedModules.length === 0 ||
            !skill.moduleId ||
            allowedModules.includes(skill.moduleId);

          const isLockedByModule = !isModUnlocked || !isAllowedSkill;

          const skillAdjustments = adjustments.filter(
            (a) => a.skillSlug === skill.slug || a.skillTitle === skill.title
          );
          const hasGuess = skillAdjustments.some((a) => Boolean(a.pGuessUsed && a.pGuessUsed > 0.3));
          const hasSlip = skillAdjustments.some((a) => Boolean(a.pSlipUsed && a.pSlipUsed > 0.2));

          const status: 'MASTERED' | 'IN_PROGRESS' | 'LOCKED' = isMastered
            ? 'MASTERED'
            : isTestingOnly || (parentMastered && !isLockedByModule)
            ? 'IN_PROGRESS'
            : 'LOCKED';

          return {
            id: skill.id,
            slug: skill.slug,
            title: skill.title,
            description: skill.description,
            pMastery: p,
            status,
            parentSkillIds: parentIds,
            parentThresholds,
            moduleId: skill.moduleId,
            moduleTitle: skill.module?.title,
            moduleOrder: skill.module?.orderIndex,
            moduleSlug: skill.module?.slug,
            isModuleLocked: isLockedByModule,
            lockReason: !isAllowedSkill
              ? 'Тема не включена до програми цієї групи'
              : !isModUnlocked
              ? 'Опануйте попередній модуль з P(L) ≥ 85%'
              : undefined,
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

  const fetchRecommendedTask = async (
    courseSlug: string, 
    excludeTaskId?: string, 
    targetSkillSlug?: string,
    overrideUserId?: string
  ) => {
    setIsLoading(true);
    setEvalResult(null);
    try {
      await fetchCourseStructureAndState(courseSlug);
      const activeUid = overrideUserId || currentUserId;
      const skillFilter = targetSkillSlug || initialSkillSlug;
      const url = `${API_URL}/api/v1/tasks/recommended?courseSlug=${courseSlug}&userId=${activeUid}${
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
        const restoredHintLevel = typeof data.revealedHintLevel === 'number' ? data.revealedHintLevel : 0;
        setRevealedHintLevel(restoredHintLevel);
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
          userId: currentUserId,
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
    if (!isCourseHydrated) return;
    fetchRecommendedTask(activeCourseSlug, undefined, initialSkillSlug);
  }, [activeCourseSlug, initialSkillSlug, isCourseHydrated]);

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

      socket.on('submission_annulled', (data: any) => {
        console.log('⚠️ [StudentPortal] Submission annulled via WebSocket:', data);
        fetchCourseStructureAndState(activeCourseSlug);
        if (task?.id) {
          fetchTaskSubmissions(task.id);
        }
        setAnnulmentAlert({
          reason: data.reason,
          comment: data.comment,
          pMasteryUpdated: data.pMasteryUpdated,
        });
        setEvalResult((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            isPassed: false,
            teacherReviewStatus: 'ANNULLED',
            feedback: `⚠️ Спробу анульовано викладачем (причина: ${data.reason}). ${data.comment ? `"${data.comment}"` : ''}`,
            teacherComment: data.comment,
          };
        });
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
          userId: currentUserId,
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

  const currentSkillModeMeta = task?.skillId ? skillModeMap[task.skillId] : undefined;
  const isPolicyLocked = integrityPolicy !== 'STUDENT_CHOICE';
  const effectiveSkillMode: PracticeIntegrityMode =
    integrityPolicy === 'FORCED_GRADED'
      ? 'GRADED'
      : integrityPolicy === 'FORCED_TRAINING'
      ? 'TRAINING'
      : currentSkillModeMeta?.activeMode || 'TRAINING';
  const isPostMasteryReview =
    effectiveSkillMode === 'TRAINING' &&
    currentSkillModeMeta?.gradedMastery !== null &&
    currentSkillModeMeta?.gradedMastery !== undefined &&
    currentSkillModeMeta.gradedMastery >= 0.85;

  // Завантаження ефективної політики викладача для курсу та live-підписка на її зміну
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/v1/bkt/policy/${currentUserId}?courseSlug=${encodeURIComponent(activeCourseSlug)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setIntegrityPolicy(data.effectivePolicy || 'STUDENT_CHOICE');
          setStrictModeUntil(data.strictModeUntil || null);
          setPolicyClassroomName(data.classroomName || null);
        }
      } catch (err) {
        console.warn('Failed to load integrity policy:', err);
      }
    };
    fetchPolicy();

    const socket = io(`${API_URL}/telemetry`, {
      transports: ['websocket'],
      upgrade: false,
    });
    socket.on('integrity_policy_changed', () => {
      fetchPolicy();
    });
    return () => {
      socket.disconnect();
    };
  }, [currentUserId, activeCourseSlug]);

  // Синхронізація активної строгої сесії з бекендом для крос-портального Study Lock (apps/study)
  // Важливо: НЕ скидаємо сувору сесію на beforeunload/unmount, щоб перехід у тій самій вкладці
  // чи стрілками браузера назад/вперед на підручник не обходив Study Lock!
  useEffect(() => {
    if (!task?.skillId) return;
    const isStrictActive = effectiveSkillMode === 'GRADED';
    fetch(`${API_URL}/api/v1/bkt/active-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        userId: currentUserId,
        courseSlug: activeCourseSlug,
        skillId: task.skillId,
        skillTitle: task.skill?.title || '',
        taskId: task.id,
        mode: isStrictActive ? 'GRADED' : 'TRAINING',
        active: isStrictActive,
      }),
    }).catch(() => {});
  }, [currentUserId, activeCourseSlug, task?.id, task?.skillId, task?.skill?.title, effectiveSkillMode]);

  // Трекінг перемикання вкладок (visibilitychange) для всіх типів завдань у режимі GRADED
  useEffect(() => {
    if (!task?.id || effectiveSkillMode !== 'GRADED') return;
    let blurAt: number | null = null;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        blurAt = Date.now();
        logActivity('TAB_SWITCH_OUT', { mode: 'GRADED', phase: 'blur' });
      } else if (blurAt !== null) {
        const awayMs = Date.now() - blurAt;
        blurAt = null;
        logActivity('TAB_SWITCH_RETURN', { mode: 'GRADED', awayMs });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [task?.id, effectiveSkillMode]);

  const executeModeSwitch = async (targetMode: PracticeIntegrityMode, forceReset: boolean) => {
    if (!task?.skillId) return;
    setIsSwitchingMode(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/bkt/switch-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          skillId: task.skillId,
          targetMode,
          courseSlug: activeCourseSlug,
          forceReset,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setModeSwitchNotice(errData.message || 'Не вдалося перемкнути режим');
        setTimeout(() => setModeSwitchNotice(null), 4000);
        return;
      }
      const result = await res.json();
      setSkillModeMap((prev) => ({
        ...prev,
        [task.skillId]: {
          activeMode: result.activeMode,
          attemptsCount: result.wasReset ? 0 : prev[task.skillId]?.attemptsCount ?? 0,
          gradedMastery: result.preservedGradedMastery ?? null,
        },
      }));
      if (result.wasReset) {
        setCode('');
        setEssayAnswer('');
        setRevealedHintLevel(0);
        setEvalResult(null);
        setTaskSubmissions([]);
        setConsecutiveFailures(0);
      }
      await fetchCourseStructureAndState(activeCourseSlug);
      if (result.wasReset) {
        await fetchRecommendedTask(activeCourseSlug);
      }
      setModeSwitchNotice(
        result.activeMode === 'GRADED'
          ? 'Увімкнено Суворий режим «На оцінку» (підручник заблоковано під час спроби)'
          : result.preservedGradedMastery
          ? 'Увімкнено режим повторення (вашу офіційну оцінку збережено)'
          : 'Увімкнено Тренувальний режим (підручник відкрито вільно)',
      );
      setTimeout(() => setModeSwitchNotice(null), 3500);
    } catch (err) {
      console.error('Failed to switch mode:', err);
    } finally {
      setIsSwitchingMode(false);
      setPendingModeSwitch(null);
    }
  };

  const handleRequestModeSwitch = (targetMode: PracticeIntegrityMode) => {
    if (isPolicyLocked || targetMode === effectiveSkillMode || !task?.skillId) return;
    const hasAttempts = (currentSkillModeMeta?.attemptsCount ?? 0) > 0;
    const isGoingToPostMasteryReview =
      targetMode === 'TRAINING' &&
      currentSkillModeMeta?.gradedMastery !== null &&
      currentSkillModeMeta?.gradedMastery !== undefined &&
      currentSkillModeMeta.gradedMastery >= 0.85;

    if (hasAttempts && !isGoingToPostMasteryReview) {
      setPendingModeSwitch(targetMode);
    } else {
      executeModeSwitch(targetMode, false);
    }
  };

  const handleRequestFullLesson = (url: string) => {
    // У Тренувальному режимі підручник відкривається вільно БЕЗ скидання прогресу!
    if (effectiveSkillMode === 'TRAINING') {
      logActivity('TEXTBOOK_OPENED_IN_TRAINING', { destinationUrl: url });
      window.open(url, '_blank');
      return;
    }

    const currentSkill = graphNodes.find((n) => n.slug === task?.skill?.slug);
    logActivity('TASK_ABANDON_PROMPTED', {
      destinationUrl: url,
      attemptsCount: taskSubmissions.length,
      currentMastery: currentSkill?.pMastery,
    });
    setFullLessonConfirmUrl(url);
  };

  const handleConfirmAbandonAndStudy = async () => {
    if (!fullLessonConfirmUrl || !task) return;
    setIsAbandoning(true);
    try {
      // 1. Повне скидання BKT-стану, спроб та історії для цієї навички/модуля
      await fetch(`${API_URL}/api/v1/bkt/reset-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          skillId: task.skillId,
        }),
      });

      // 2. Очищення локального стану тренажера
      setCode('');
      setEssayAnswer('');
      setRevealedHintLevel(0);
      setEvalResult(null);
      setTaskSubmissions([]);
      setConsecutiveFailures(0);

      // 3. Синхронізація оновленого стану курсу та завантаження чистого завдання
      await Promise.all([
        fetchCourseStructureAndState(activeCourseSlug),
        fetchRecommendedTask(activeCourseSlug),
      ]);

      // 4. Відкриття повного Zen-уроку підручника
      window.open(fullLessonConfirmUrl, '_blank');
    } catch (err) {
      console.error('Error during task abandonment and reset:', err);
    } finally {
      setIsAbandoning(false);
      setFullLessonConfirmUrl(null);
      setIsTheoryDrawerOpen(false);
    }
  };

  // Unified Navigation State:
  // activeTab defines which workspace / module is active.
  // isDrawerOpen controls whether its companion sidebar drawer is visible.
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
  // In TESTING_ONLY mode, theory is accessible directly without scaffolding locks.
  // In FULL_CYCLE mode, it unlocks when student revealed Socratic hints to Level 2+ (revealedHintLevel >= 2).
  const isTestingOnlyMode = enrollmentMode === 'TESTING_ONLY';
  const isTheoryUnlocked = isTestingOnlyMode || revealedHintLevel >= 2;

  const getDrawerConfig = () => {
    let title: React.ReactNode = 'Панель';
    let icon = BookOpen;
    let iconColor = 'text-indigo-400';

    if (activeTab === 'task') {
      title = 'Контекст та Підказки Завдання';
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
        <PracticeSidebarDrawer
          activeTab={activeTab}
          task={task}
          activeCourseSlug={activeCourseSlug}
          taskDrawerSubTab={taskDrawerSubTab}
          onSetTaskDrawerSubTab={setTaskDrawerSubTab}
          effectiveSkillMode={effectiveSkillMode}
          isPolicyLocked={isPolicyLocked}
          isSwitchingMode={isSwitchingMode}
          policyClassroomName={policyClassroomName}
          strictModeUntil={strictModeUntil}
          isPostMasteryReview={isPostMasteryReview}
          gradedMastery={currentSkillModeMeta?.gradedMastery ?? null}
          modeSwitchNotice={modeSwitchNotice}
          onRequestModeSwitch={handleRequestModeSwitch}
          activeSkillMasteryPct={activeSkillMasteryPct}
          recommendation={recommendation}
          isTheoryUnlocked={isTheoryUnlocked}
          onOpenTheoryDrawer={(trigger) => {
            setTheoryOpenStartTime(Date.now());
            setIsTheoryDrawerOpen(true);
            logActivity('THEORY_DRAWER_OPENED', { trigger });
          }}
          onRequestFullLesson={handleRequestFullLesson}
          revealedHintLevel={revealedHintLevel}
          onRevealHint={(level, penaltyPct) => {
            setRevealedHintLevel(level);
            logActivity('HINT_REQUESTED', { level, penaltyPct });
          }}
          isSocraticHintsOpen={isSocraticHintsOpen}
          onToggleSocraticHints={setIsSocraticHintsOpen}
          hasFailedAttemptOnCurrentTask={hasFailedAttemptOnCurrentTask}
          taskSubmissions={taskSubmissions}
          onRefreshTask={() => fetchRecommendedTask(activeCourseSlug)}
          onRefreshSubmissions={fetchTaskSubmissions}
          graphNodes={graphNodes}
          inspectedSkill={inspectedSkill}
          onSelectTab={handleTabClick}
          onStartInspectedSkillTask={() => {
            setActiveTab('task');
            setMainView('editor');
            setIsDrawerOpen(true);
            fetchRecommendedTask(activeCourseSlug);
          }}
        />
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
            title={
              !isCourseHydrated
                ? 'Завантаження курсу...'
                : `Активний курс: ${courses.find((c) => c.slug === activeCourseSlug)?.title || activeCourseSlug}`
            }
          >
            {!isCourseHydrated
              ? 'Завантаження курсу...'
              : courses.find((c) => c.slug === activeCourseSlug)?.title || activeCourseSlug}
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
              title="Натисніть для відкриття профілю, входу або вибору курсів"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {currentUserInitials}
              </div>
              <div className="hidden lg:flex flex-col leading-none">
                <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors truncate max-w-[120px]">
                  {currentUserName}
                </span>
                <span className="text-[9px] font-mono text-indigo-400 mt-0.5">
                  {currentUserRole}
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
      mainClassName="overflow-hidden flex flex-col bg-[var(--sbc-bg-root,#181818)]"
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
      <ConfirmModal
        isOpen={Boolean(exhaustedModalData)}
        onClose={handleConfirmSkillReset}
        onConfirm={handleConfirmSkillReset}
        variant="warning"
        hideCancelButton
        title="Завдання модуля закінчилися"
        description={
          exhaustedModalData ? (
            <>
              Завдання даного модуля (<strong className="text-indigo-400">&quot;{exhaustedModalData.skillTitle}&quot;</strong>) закінчилися, і ви не набрали необхідну кількість балів (&ge;95%). Ваш прогрес на цьому модулі буде анульований для повторної спроби.
            </>
          ) : undefined
        }
        confirmLabel="ОК, анулювати прогрес модуля"
      />

      {/* Course Switch Confirmation Modal Popup */}
      <ConfirmModal
        isOpen={Boolean(pendingCourseSlug)}
        onClose={cancelCourseSwitch}
        onConfirm={confirmCourseSwitch}
        variant="info"
        icon={<BookOpen className="w-5 h-5" />}
        title="Перемикання Навчального Курсу"
        description={
          pendingCourseSlug ? (
            <>
              Ви дійсно бажаєте перейти до вивчення курсу{' '}
              <strong className="text-indigo-300">
                &quot;{courses.find((c) => c.slug === pendingCourseSlug)?.title || pendingCourseSlug}&quot;
              </strong>
              ?
            </>
          ) : undefined
        }
        warnings={[
          'Незбережені зміни в поточному коді будуть скинуті.',
          'Буде завантажено індивідуальну траєкторію BKT нового курсу.',
        ]}
        cancelLabel="Скасувати"
        confirmLabel="Підтвердити перехід"
      />
        </>
      }
    >
      
          {mainView === 'tree' ? (
            <div className="w-full h-full overflow-hidden flex flex-col">
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
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400 my-auto mx-auto select-none">
              <RefreshCw className="w-7 h-7 animate-spin text-indigo-400" />
              <p className="text-xs font-mono text-slate-400">Завантаження адаптивного завдання з BKT графа...</p>
            </div>
          ) : task ? (
            <PracticeTaskWorkspace
              task={task}
              currentUserId={currentUserId}
              source={source}
              unitSlug={unitSlug}
              isTestingOnlyMode={isTestingOnlyMode}
              isTheoryUnlocked={isTheoryUnlocked}
              recommendation={recommendation}
              annulmentAlert={annulmentAlert}
              onDismissAnnulmentAlert={() => setAnnulmentAlert(null)}
              code={code}
              onChangeCode={setCode}
              essayAnswer={essayAnswer}
              onChangeEssayAnswer={setEssayAnswer}
              isSubmitting={isSubmitting}
              evalResult={evalResult}
              hasRemediationTask={hasRemediationTask}
              consecutiveFailures={consecutiveFailures}
              onEvaluate={handleEvaluate}
              onNextTask={() => fetchRecommendedTask(activeCourseSlug)}
              onOpenRemediationTask={(taskId) => fetchRecommendedTask(activeCourseSlug, taskId)}
              onOpenTheoryDrawer={(trigger) => {
                setTheoryOpenStartTime(Date.now());
                setIsTheoryDrawerOpen(true);
                logActivity('THEORY_DRAWER_OPENED', { trigger });
              }}
              onOpenSkillTree={() => handleTabClick('tree')}
              onOpenSocraticHints={() => {
                setIsDrawerOpen(true);
                setTaskDrawerSubTab('condition');
                setIsSocraticHintsOpen(true);
              }}
            />
          ) : (
            <div className="p-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-center text-slate-400 text-sm my-auto">
              Завдань у даному курсі не знайдено.
            </div>
          )}
        
      </AppShellLayout>

      {/* 📘 Права бічна панель експрес-теорії (Just-in-Time Theory Micro-Module) */}
      <JustInTimeTheoryDrawer
        isOpen={isTheoryDrawerOpen}
        onClose={() => {
          setIsTheoryDrawerOpen(false);
          const dwellSeconds = theoryOpenStartTime
            ? Math.round((Date.now() - theoryOpenStartTime) / 1000)
            : 0;
          logActivity('THEORY_DRAWER_CLOSED', { dwellTimeSeconds: dwellSeconds });
          setTheoryOpenStartTime(null);
        }}
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

      {/* 🔄 Модальне вікно підтвердження зміни режиму навички (Zero-Mix Rule) */}
      <ConfirmModal
        isOpen={Boolean(pendingModeSwitch)}
        onClose={() => !isSwitchingMode && setPendingModeSwitch(null)}
        onConfirm={() => {
          if (pendingModeSwitch) {
            return executeModeSwitch(pendingModeSwitch, true);
          }
        }}
        variant="warning"
        testId="switch-mode-confirm-modal"
        confirmTestId="confirm-switch-mode-btn"
        isConfirming={isSwitchingMode}
        title={
          pendingModeSwitch === 'GRADED'
            ? 'Перехід у Суворий режим «На оцінку»'
            : 'Перехід у Тренувальний режим'
        }
        description={
          pendingModeSwitch === 'GRADED'
            ? 'Щоб оцінювання було чесним (Zero-Mix Rule), тренувальний прогрес поточної навички буде скинуто, а підручник заблоковано на час проходження. Прогрес інших модулів курсу збережеться.'
            : 'Поточна оцінювальна спроба цієї навички буде скинута, і ви зможете вільно тренуватися з відкритим підручником.'
        }
        warnings={['Прогрес поточної навички буде скинуто на 0%.']}
        cancelLabel="Скасувати"
        confirmLabel={isSwitchingMode ? 'Перемикання...' : 'Скинути навичку і перемкнути режим'}
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
        currentUser={currentUser}
        onOpenAuthModal={() => {
          setIsProfileDrawerOpen(false);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onResetBktState={() => {
          fetchRecommendedTask(activeCourseSlug);
          setIsProfileDrawerOpen(false);
        }}
      />

      {/* 🔐 Модальне вікно авторизації, Google Sign-In та Тестового входу */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser ? {
          id: currentUser.id,
          email: currentUser.email,
          name: currentUserName,
          role: currentUser.role,
          authProvider: currentUser.authProvider,
        } : null}
        testModeEnabled={testModeEnabled}
        googleClientId={googleClientId}
        onGoogleLogin={handleGoogleLogin}
        onMockLogin={handleMockLogin}
        onLogout={handleLogout}
        onJoinCode={(joinCode) => {
          window.location.href = `/join/${joinCode}`;
        }}
      />
    </>
  );
}

export default StudentPortalContent;
