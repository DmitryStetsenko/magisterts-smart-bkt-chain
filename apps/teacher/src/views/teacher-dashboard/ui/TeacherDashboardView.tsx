'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ShieldCheck, Network, Users, BarChart3, Code2, BookOpen, ChevronDown, X, Search, RotateCcw, AlertTriangle, CheckCircle2, Sparkles, Keyboard, Copy, Activity, Info, ClipboardCheck, FlaskConical } from 'lucide-react';
import { StudentAnalyticsItem } from '@/features/analytics/model/analytics.types';
import { SkillGraphNode, AppShellLayout, Breadcrumbs, UserProfileDrawer, ThemeSettingsSection, Modal, ConfirmModal, Button, Badge } from '@sbc/ui';
import { TaskDto } from '@sbc/types';
import { ReviewQueueInspector } from '@/features/reviews/ui/ReviewQueueInspector';
import { CourseGraphViewer } from '@/features/course-map/ui/CourseGraphViewer';
import { MetricsAuditInspector } from '@/features/metrics-audit/ui/MetricsAuditInspector';
import { ClassroomManager } from '@/features/classrooms/ui/ClassroomManager';
import { CourseItem, DEFAULT_COURSES } from '@/entities/course';
import { TeacherSidebarDrawer, type TeacherTab, type CohortFilter, type AuditSubTab } from '@/widgets/teacher-sidebar';
import { StudentAnalyticsWorkspace } from '@/widgets/student-analytics';

export type { CourseItem };

export default function TeacherDashboardPage() {
  const [courses, setCourses] = useState<CourseItem[]>(DEFAULT_COURSES);
  const [activeCourseSlug, setActiveCourseSlug] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sbc_teacher_active_course') || 'js-dev';
    }
    return 'js-dev';
  });
  const [students, setStudents] = useState<StudentAnalyticsItem[]>([]);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [allTasks, setAllTasks] = useState<TaskDto[]>([]);

  // Selected item states for Main Canvas Detail views
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedSkillSlug, setSelectedSkillSlug] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [studentIntegrityPolicy, setStudentIntegrityPolicy] = useState<'STUDENT_CHOICE' | 'FORCED_TRAINING' | 'FORCED_GRADED'>('STUDENT_CHOICE');
  const [isUpdatingStudentPolicy, setIsUpdatingStudentPolicy] = useState<boolean>(false);

  // Search & Filter state inside side drawers and top bar
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState<boolean>(false);
  const [cohortFilter, setCohortFilter] = useState<CohortFilter>('all');
  const [dagSearch, setDagSearch] = useState<string>('');

  // Modal explanation state for BKT/WPM/CopyPaste/Fatigue metrics
  const [metricModal, setMetricModal] = useState<'bkt' | 'wpm' | 'copypaste' | 'fatigue' | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);

  // Modal confirmation state for student BKT reset
  const [resetConfirmStudent, setResetConfirmStudent] = useState<StudentAnalyticsItem | null>(null);
  const [resetGlobalSafetyToggle, setResetGlobalSafetyToggle] = useState<boolean>(false);
  const [isResettingStudent, setIsResettingStudent] = useState<boolean>(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/courses?status=PUBLISHED`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: CourseItem[] = data.map((c: any) => ({
              slug: c.slug,
              title: c.title,
              description: c.description,
              icon: BookOpen,
              skillSlugs: Array.isArray(c.skills) ? c.skills.map((s: any) => s.slug) : [],
            }));
            setCourses(mapped);
            const savedCourse = typeof window !== 'undefined' ? localStorage.getItem('sbc_teacher_active_course') : null;
            if (savedCourse && mapped.some((c) => c.slug === savedCourse)) {
              setActiveCourseSlug(savedCourse);
            } else if (!mapped.some((c) => c.slug === activeCourseSlug)) {
              const defaultSlug = mapped[0].slug;
              setActiveCourseSlug(defaultSlug);
              if (typeof window !== 'undefined') {
                localStorage.setItem('sbc_teacher_active_course', defaultSlug);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    fetchCourses();
  }, []);

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
      localStorage.setItem('sbc_teacher_active_course', slug);
    }
    const targetCourse = courses.find((c) => c.slug === slug);
    const title = targetCourse ? targetCourse.title : slug;
    setCourseNotification(`Курс для аналітики змінено на: ${title}`);
    setTimeout(() => {
      setCourseNotification(null);
    }, 3500);
    setPendingCourseSlug(null);
  };

  const cancelCourseSwitch = () => {
    setPendingCourseSlug(null);
  };

  const fetchStudentAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/bkt/analytics/students?courseSlug=${activeCourseSlug}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setStudents(data);
          if (data.length > 0 && !selectedStudentId) {
            const firstId = data[0].id || data[0].studentId || data[0].email;
            setSelectedStudentId(firstId);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching live student analytics:', err);
    }
  };

  const fetchCourseStructure = async () => {
    try {
      const [courseRes, tasksRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/courses/${activeCourseSlug}`),
        fetch(`${API_URL}/api/v1/tasks?courseSlug=${activeCourseSlug}`),
      ]);
      if (courseRes.ok) {
        const data = await courseRes.json();
        setCourseDetails(data);
      }
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setAllTasks(tasksData);
      }
    } catch (err) {
      console.error('Error fetching course structure:', err);
    }
  };

  useEffect(() => {
    fetchStudentAnalytics();
    fetchCourseStructure();
  }, [activeCourseSlug]);

  // Unified Navigation State:
  // activeTab defines which workspace / module is active.
  // isDrawerOpen controls whether its companion sidebar drawer is visible.
  const [activeTab, setActiveTab] = useState<TeacherTab>('analytics');
  const [auditSubTab, setAuditSubTab] = useState<AuditSubTab>('live-log');
  // By default, student selection is in the top bar, so canvas has 100% space
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeStudentView, setActiveStudentView] = useState<'metrics' | 'tree' | 'timeline'>('metrics');
  const [liveActivityLogs, setLiveActivityLogs] = useState<any[]>([]);

  // Teacher Review Queue State & Filter Tab ('pending' | 'reviewed')
  const [reviewFilterTab, setReviewFilterTab] = useState<'pending' | 'reviewed'>('pending');
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState<boolean>(false);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewScoreOverride, setReviewScoreOverride] = useState<number | ''>('');

  const fetchReviewQueue = async (tabOverride?: 'pending' | 'reviewed') => {
    try {
      const activeTabMode = tabOverride || reviewFilterTab;
      const statusParam = activeTabMode === 'reviewed' ? 'REVIEWED' : 'PENDING';
      const res = await fetch(`${API_URL}/api/v1/bkt/reviews/queue?courseSlug=${activeCourseSlug}&status=${statusParam}`);
      if (res.ok) {
        const data = await res.json();
        setReviewQueue(data);
        setSelectedReviewId((prev) => {
          if (!data || data.length === 0) return null;
          const exists = data.some((item: any) => item.submissionId === prev);
          return exists ? prev : data[0].submissionId;
        });
      }
    } catch (err) {
      console.error('Error fetching teacher review queue:', err);
    }
  };

  useEffect(() => {
    fetchReviewQueue();
  }, [activeCourseSlug, reviewFilterTab]);

  // Real-time WebSocket listener for student submissions, telemetry updates, and state resets
  useEffect(() => {
    const socket = io(`${API_URL}/telemetry`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    if (socket) {
      socket.on('bkt_state_reset', () => {
        fetchStudentAnalytics();
        fetchReviewQueue();
        setSelectedReviewId(null);
      });

      socket.on('student_submitted', (data: any) => {
        console.log('⚡ [TeacherPortal] Real-time student submission detected:', data);
        fetchStudentAnalytics();
        fetchReviewQueue();
      });

      socket.on('student_telemetry_updated', () => {
        fetchStudentAnalytics();
      });

      socket.on('activity_log', (data: any) => {
        console.log('⚡ [TeacherPortal] Real-time activity log detected:', data);
        setLiveActivityLogs((prev) => [data, ...prev.slice(0, 50)]);
        fetchStudentAnalytics();
      });

      socket.on('submission_annulled', (data: any) => {
        console.log('⚠️ [TeacherPortal] Submission annulled event:', data);
        fetchStudentAnalytics();
        fetchReviewQueue();
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [activeCourseSlug]);

  const handleReviewDecision = async (submissionId: string, decision: 'APPROVE' | 'REJECT') => {
    setIsReviewSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/bkt/reviews/${submissionId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          comment: reviewComment || undefined,
          scoreOverride: reviewScoreOverride !== '' ? Number(reviewScoreOverride) : undefined,
        }),
      });

      if (res.ok) {
        setReviewComment('');
        setReviewScoreOverride('');
        await fetchReviewQueue();
        await fetchStudentAnalytics();
      }
    } catch (err) {
      console.error('Error submitting review decision:', err);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleAnnulDecision = async (
    submissionId: string,
    reason: string,
    comment: string,
    penaltyMultiplier: number = 1.25,
  ) => {
    setIsReviewSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/bkt/submissions/${submissionId}/annul`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: 'teacher-current',
          reason,
          comment,
          penaltyMultiplier,
        }),
      });

      if (res.ok) {
        setReviewComment('');
        setReviewScoreOverride('');
        await fetchReviewQueue();
        await fetchStudentAnalytics();
      }
    } catch (err) {
      console.error('Error annulling submission:', err);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleTabClick = (tab: TeacherTab) => {
    if (activeTab === tab) {
      // Toggle sidebar open/collapsed without changing active workspace
      setIsDrawerOpen((prev) => !prev);
    } else {
      // Switch workspace & ensure drawer is open
      setActiveTab(tab);
      setIsDrawerOpen(true);
      if (tab === 'reviews') {
        fetchReviewQueue();
      }
    }
  };

  const activeCourse = courses.find((c) => c.slug === activeCourseSlug) || courses[0] || DEFAULT_COURSES[0];
  const selectedStudent = students.find((s) => (s.id || s.studentId || s.email) === selectedStudentId) || students[0];

  // Завантаження актуальної політики режиму проходження для обраного студента на поточному курсі
  useEffect(() => {
    const stId = selectedStudent?.id || selectedStudent?.studentId;
    if (!stId || !activeCourseSlug) return;
    let cancelled = false;
    fetch(`${API_URL}/api/v1/bkt/policy/${stId}?courseSlug=${encodeURIComponent(activeCourseSlug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.effectivePolicy) {
          setStudentIntegrityPolicy(data.effectivePolicy);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedStudent?.id, selectedStudent?.studentId, activeCourseSlug]);

  const handleSetStudentIntegrityPolicy = async (
    nextPolicy: 'STUDENT_CHOICE' | 'FORCED_TRAINING' | 'FORCED_GRADED',
  ) => {
    const stId = selectedStudent?.id || selectedStudent?.studentId;
    if (!stId || !activeCourseSlug) return;
    setIsUpdatingStudentPolicy(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/classrooms/student-policy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: stId,
          courseSlug: activeCourseSlug,
          integrityPolicyOverride: nextPolicy,
        }),
      });
      if (res.ok) {
        setStudentIntegrityPolicy(nextPolicy);
      }
    } catch (err) {
      console.error('Failed to update student integrity policy:', err);
    } finally {
      setIsUpdatingStudentPolicy(false);
    }
  };

  // Calculate RPG Skill Graph nodes specifically for the selected student
  const studentGraphNodes: SkillGraphNode[] = React.useMemo(() => {
    if (!courseDetails?.skills || !Array.isArray(courseDetails.skills)) return [];
    const masteryMap = selectedStudent?.bktBySkill || selectedStudent?.skillMastery || {};
    const telemetryMap = selectedStudent?.telemetryBySkill || {};

    return courseDetails.skills.map((skill: any) => {
      const p = masteryMap[skill.slug] ?? masteryMap[skill.id] ?? 0.0;
      const isMastered = p >= 0.95;
      const parentIds = Array.isArray(skill.parentDependencies)
        ? skill.parentDependencies.map((d: any) => d.parentSkillId)
        : [];
      const parentThresholds: Record<string, number> = {};
      if (Array.isArray(skill.parentDependencies)) {
        skill.parentDependencies.forEach((d: any) => {
          if (d.parentSkillId) {
            parentThresholds[d.parentSkillId] = typeof d.requiredMastery === 'number' ? d.requiredMastery : 0.85;
          }
        });
      }
      const parentMastered =
        parentIds.length === 0 ||
        parentIds.every((pid: string) => {
          const parentSkill = courseDetails.skills.find((s: any) => s.id === pid);
          const parentP = parentSkill
            ? (masteryMap[parentSkill.slug] ?? masteryMap[parentSkill.id] ?? 0)
            : (masteryMap[pid] ?? 0);
          return parentP >= 0.95;
        });

      const skillTasks = allTasks.filter((t) => t.skillId === skill.id || t.skill?.id === skill.id);
      const telemetry = telemetryMap[skill.slug] || telemetryMap[skill.id];

      // Skill-specific adjustments from student history
      const skillAdjustments = selectedStudent?.recentAdjustments?.filter(
        (a) => a.skillSlug === skill.slug || a.skillTitle === skill.title
      ) || [];

      const hasGuessAnomaly = skillAdjustments.some(
        (a) => a.pGuessUsed !== undefined && a.pGuessUsed !== null && a.pGuessUsed > 0.3
      );
      const hasCopyPasteAnomaly = (telemetry?.copyPasteRatio ?? 0) >= 0.60;

      return {
        id: skill.id,
        slug: skill.slug,
        title: skill.title,
        description: skill.description || '',
        pMastery: p,
        status: isMastered ? 'MASTERED' : parentMastered ? 'IN_PROGRESS' : 'LOCKED',
        parentSkillIds: parentIds,
        parentThresholds,
        tasksCount: skillTasks.length,
        telemetry: telemetry ? {
          wpm: telemetry.wpm ?? 0,
          copyPasteRatio: telemetry.copyPasteRatio ?? 0,
          fatigueIndex: telemetry.fatigueIndex ?? 0,
        } : undefined,
        recentAdjustments: skillAdjustments,
        hasGuessAnomaly,
        hasCopyPasteAnomaly,
        tasks: skillTasks,
      };
    });
  }, [courseDetails, selectedStudent, allTasks]);

  const handleResetStudent = async (studentId: string, scope: 'course' | 'all' = 'course') => {
    setIsResettingStudent(true);
    try {
      const url = scope === 'course'
        ? `${API_URL}/api/v1/bkt/reset/${studentId}?courseSlug=${activeCourseSlug}`
        : `${API_URL}/api/v1/bkt/reset/${studentId}`;
      const res = await fetch(url, { method: 'POST' });
      if (res.ok) {
        await Promise.all([
          fetchStudentAnalytics(),
          fetchReviewQueue(),
          fetchCourseStructure(),
        ]);
        setSelectedReviewId(null);
        setResetConfirmStudent(null);
        setResetGlobalSafetyToggle(false);
      }
    } catch (err) {
      console.error('Error resetting student BKT:', err);
    } finally {
      setIsResettingStudent(false);
    }
  };

  // Cohort Bloom distribution and anomaly metrics calculation
  const cohortMasteryStudents = students.filter((s) => (s.averageMastery ?? 0) >= 0.90);
  const cohortProficientStudents = students.filter((s) => (s.averageMastery ?? 0) >= 0.75 && (s.averageMastery ?? 0) < 0.90);
  const cohortBasicStudents = students.filter((s) => (s.averageMastery ?? 0) >= 0.50 && (s.averageMastery ?? 0) < 0.75);
  const cohortAtRiskStudents = students.filter((s) => (s.averageMastery ?? 0) < 0.50);

  // Risk Feed: Detect students with Copy-Paste >= 60%, Guess Alert / P(G) > 0.35, or Fatigue Index >= 5
  const riskFeedStudents = students.filter((s) => {
    const hasCopyPasteAnomaly = (s.copyPasteRatio ?? 0) >= 0.60;
    const hasGuessAnomaly = s.hasGuessAlert || (s.recentAdjustments?.some((a) => (a.pGuessUsed ?? 0) > 0.30) ?? false);
    const hasFatigueAnomaly = (s.fatigueIndex ?? 0) >= 5;
    return hasCopyPasteAnomaly || hasGuessAnomaly || hasFatigueAnomaly;
  });

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (cohortFilter === 'mastery') return (s.averageMastery ?? 0) >= 0.90;
    if (cohortFilter === 'proficient') return (s.averageMastery ?? 0) >= 0.75 && (s.averageMastery ?? 0) < 0.90;
    if (cohortFilter === 'basic') return (s.averageMastery ?? 0) >= 0.50 && (s.averageMastery ?? 0) < 0.75;
    if (cohortFilter === 'at_risk') return (s.averageMastery ?? 0) < 0.50;
    if (cohortFilter === 'anomalies') {
      const hasCopyPaste = (s.copyPasteRatio ?? 0) >= 0.60;
      const hasGuess = s.hasGuessAlert || (s.recentAdjustments?.some((a) => (a.pGuessUsed ?? 0) > 0.30) ?? false);
      const hasFatigue = (s.fatigueIndex ?? 0) >= 5;
      return hasCopyPaste || hasGuess || hasFatigue;
    }
    return true;
  });

  const getTaskTypeBadge = (taskType: string) => {
    switch (taskType) {
      case 'SINGLE_CHOICE':
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">Single Test</span>;
      case 'MULTIPLE_CHOICE':
        return <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold">Multi Test</span>;
      case 'TEXT_ESSAY':
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">Essay</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Code VM</span>;
    }
  };

  const getDrawerConfig = () => {
    let title: React.ReactNode = 'Панель';
    let icon = BarChart3;
    let iconColor = 'text-purple-400';

    if (activeTab === 'analytics') {
      title = 'Огляд Групи & Ризики';
      icon = BarChart3;
      iconColor = 'text-purple-400';
    } else if (activeTab === 'coursemap') {
      title = 'Педагогічний Пульт Модуля';
      icon = Network;
      iconColor = 'text-indigo-400';
    } else if (activeTab === 'reviews') {
      title = `Черга Перевірки (${reviewQueue.length})`;
      icon = ClipboardCheck;
      iconColor = 'text-amber-400';
    } else if (activeTab === 'classrooms') {
      title = 'Навчальні Групи & Інвайти';
      icon = Users;
      iconColor = 'text-purple-400';
    } else if (activeTab === 'metrics-audit') {
      title = 'Аудит Метрик & Студенти';
      icon = FlaskConical;
      iconColor = 'text-emerald-400';
    } else if (activeTab === 'settings') {
      title = 'Параметри Оцінювання';
      icon = ShieldCheck;
      iconColor = 'text-amber-400';
    }

    return {
      isOpen: isDrawerOpen,
      title,
      icon,
      iconColor,
      onClose: () => setIsDrawerOpen(false),
      children: (
        <TeacherSidebarDrawer
          activeTab={activeTab}
          students={students}
          filteredStudents={filteredStudents}
          cohortMasteryStudents={cohortMasteryStudents}
          cohortProficientStudents={cohortProficientStudents}
          cohortBasicStudents={cohortBasicStudents}
          cohortAtRiskStudents={cohortAtRiskStudents}
          riskFeedStudents={riskFeedStudents}
          cohortFilter={cohortFilter}
          onSetCohortFilter={setCohortFilter}
          studentSearch={studentSearch}
          onSetStudentSearch={setStudentSearch}
          selectedStudentId={selectedStudentId}
          onSelectStudentId={setSelectedStudentId}
          courseDetails={courseDetails}
          allTasks={allTasks}
          selectedSkillSlug={selectedSkillSlug}
          onSelectTaskId={setSelectedTaskId}
          reviewFilterTab={reviewFilterTab}
          onSetReviewFilterTab={setReviewFilterTab}
          reviewQueue={reviewQueue}
          selectedReviewId={selectedReviewId}
          onSelectReviewId={setSelectedReviewId}
          auditSubTab={auditSubTab}
          onSetAuditSubTab={setAuditSubTab}
        />
      ),
    };
  };

  return (
    <>
      <AppShellLayout
      currentApp="teacher"
      header={{
        appName: 'Smart-BKT-Chain',
        badgeText: 'Teacher',
        logoIcon: ShieldCheck,
        logoColor: 'bg-purple-500/15 text-purple-400',
        courseBadge: (
          <span
            className="text-xs sm:text-[13px] font-normal text-slate-300 select-none tracking-normal"
            title={`Активний курс: ${activeCourse.title}`}
          >
            {activeCourse.title}
          </span>
        ),
        breadcrumbs: (
          <Breadcrumbs
            className="text-[11px]"
            items={[
              {
                label: activeTab === 'analytics'
                  ? 'Аналітика'
                  : activeTab === 'coursemap'
                  ? 'Граф навичок'
                  : activeTab === 'reviews'
                  ? 'Черга перевірки'
                  : activeTab === 'classrooms'
                  ? 'Навчальні групи'
                  : activeTab === 'metrics-audit'
                  ? 'Аудит BKT'
                  : 'Параметри',
                onClick: () => handleTabClick(activeTab),
              },
              ...(selectedStudent && activeTab === 'analytics'
                ? [{
                    label: selectedStudent.name,
                    badge: `${((selectedStudent.averageMastery ?? 0) * 100).toFixed(0)}% P(L)`,
                    isCurrent: true,
                  }]
                : []),
            ]}
          />
        ),
        rightSlot: (
          <div className="flex items-center gap-2">

          {/* 🔍 Searchable Student Dropdown Selector */}
          <div className="relative min-w-[190px] sm:min-w-[230px]">
            <button
              id="teacher-student-dropdown-btn"
              onClick={() => setIsStudentDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="truncate">
                  {selectedStudent ? selectedStudent.name : 'Обрати студента...'}
                </span>
                {selectedStudent && (
                  <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                    {(selectedStudent.averageMastery !== undefined ? (selectedStudent.averageMastery * 100).toFixed(0) : '0')}%
                  </span>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isStudentDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu with Search */}
            {isStudentDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-fadeIn">
                <div className="p-2 border-b border-slate-800/80">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Пошук студента за ім'ям чи email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      autoFocus
                      className="w-full bg-slate-800/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">Студентів не знайдено</div>
                  ) : (
                    filteredStudents.map((st) => {
                      const stId = st.id || st.studentId || st.email;
                      const isSelected = selectedStudentId === stId;
                      const avgMastery = st.averageMastery !== undefined ? (st.averageMastery * 100).toFixed(0) : '0';

                      return (
                        <div
                          key={stId}
                          onClick={() => {
                            setSelectedStudentId(stId);
                            setIsStudentDropdownOpen(false);
                          }}
                          className={`px-3 py-2 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-purple-500/10 text-white'
                              : 'hover:bg-slate-800/50 text-slate-300'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="text-xs font-medium truncate flex items-center gap-1.5">
                              <span>{st.name}</span>
                              {isSelected && <span className="text-[10px] text-purple-400">●</span>}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate font-mono">{st.email}</div>
                          </div>
                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {avgMastery}%
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {st.wpm ?? st.avgWpm ?? 0} WPM
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* 👤 Кнопка профілю викладача (відкриває Profile Drawer) */}
          <button
            type="button"
            onClick={() => setIsProfileDrawerOpen(true)}
            className="flex items-center gap-2 hover:bg-slate-800/60 px-2 py-1 rounded-lg transition-colors cursor-pointer select-none text-left group"
            title="Натисніть для відкриття профілю викладача"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              ВК
            </div>
            <div className="hidden lg:flex flex-col leading-none">
              <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                Олександр Коваленко
              </span>
              <span className="text-[9px] font-mono text-purple-400 mt-0.5">
                ВИКЛАДАЧ
              </span>
            </div>
          </button>
        </div>
        ),
      }}
      navigationRail={{
        tabs: [
          {
            id: 'analytics',
            icon: BarChart3,
            title: 'Огляд Групи & Радар Ризиків',
            activeColor: 'bg-purple-600',
          },
          {
            id: 'coursemap',
            icon: Network,
            title: 'Граф Навичок & Завдання',
            activeColor: 'bg-purple-600',
          },
          {
            id: 'reviews',
            icon: ClipboardCheck,
            title: 'Черга Перевірки Відкритих Відповідей (Human-in-the-Loop)',
            badge: reviewQueue.length > 0 ? reviewQueue.length : undefined,
            activeColor: 'bg-purple-600',
          },
          {
            id: 'classrooms',
            icon: Users,
            title: 'Навчальні Групи & Інвайт-коди',
            activeColor: 'bg-purple-600',
          },
          {
            id: 'metrics-audit',
            icon: FlaskConical,
            title: 'Математичний Аудит & Симулятор BKT (What-If Sandbox)',
            activeColor: 'bg-emerald-600',
          },
        ],
        activeTab: activeTab,
        isDrawerOpen: isDrawerOpen,
        onTabClick: (tabId) => handleTabClick(tabId as TeacherTab),
        onSettingsClick: () => handleTabClick('settings'),
        isSettingsActive: activeTab === 'settings',
      }}
      drawer={getDrawerConfig()}
      mainClassName="p-4 lg:p-6 overflow-y-auto flex flex-col gap-6 bg-slate-950"
      overlays={
        <>
      {/* 🧮 Interactive Metric Explanation Modal */}
      <Modal
        isOpen={Boolean(metricModal)}
        onClose={() => setMetricModal(null)}
        size="lg"
        icon={
          metricModal === 'bkt' ? (
            <div className="p-2 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
          ) : metricModal === 'wpm' ? (
            <div className="p-2 bg-indigo-950/50 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
          ) : metricModal === 'copypaste' ? (
            <div className="p-2 bg-amber-950/50 border border-amber-500/30 rounded-xl text-amber-400">
              <Copy className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 bg-purple-950/50 border border-purple-500/30 rounded-xl text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
          )
        }
        title={
          metricModal === 'bkt'
            ? 'Середня Майстерність P(L) — Bayesian Knowledge Tracing'
            : metricModal === 'wpm'
            ? 'Швидкість Набору Коду (WPM)'
            : metricModal === 'copypaste'
            ? 'Copy-Paste Ratio (Частка Вставленого Коду)'
            : 'Індекс Втоми (Idle Pauses & Cognitive Load)'
        }
        footer={
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setMetricModal(null)}>
              Зрозуміло
            </Button>
          </div>
        }
      >
        {metricModal === 'bkt' && (
          <div className="text-xs text-[var(--sbc-text-muted,#909090)] flex flex-col gap-3 leading-relaxed">
            <p>
              Параметр <span className="font-mono text-emerald-400 font-bold">P(L)</span> визначає ймовірність того, що студент повністю засвоїв концепцію конкретного модуля.
            </p>
            <div className="p-3 bg-[var(--sbc-bg-subtle,#262626)] border border-[var(--sbc-border-subtle,#2b2b2b)] rounded-xl font-mono text-[11px] text-[var(--sbc-text-primary,#cccccc)]">
              P(L_t | obs) = [ P(L_t-1) * (1 - P(S)) ] / [ P(L_t-1) * (1 - P(S)) + (1 - P(L_t-1)) * P(G) ]
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong className="text-[var(--sbc-text-primary,#cccccc)]">P(G) = 0.20:</strong> Ймовірність вгадування (Guessing).</li>
              <li><strong className="text-[var(--sbc-text-primary,#cccccc)]">P(S) = 0.10:</strong> Ймовірність описки/вислизання (Slip).</li>
              <li><strong className="text-[var(--sbc-text-primary,#cccccc)]">P(T) = 0.15:</strong> Ймовірність засвоєння після спроби (Transition).</li>
            </ul>
            <p className="text-[11px] italic">
              При досягненні P(L) ≥ 0.95 (95%) модуль вважається успішно засвоєним, і студенту відкривається доступ до наступних вузлів DAG.
            </p>
          </div>
        )}

        {metricModal === 'wpm' && (
          <div className="text-xs text-[var(--sbc-text-muted,#909090)] flex flex-col gap-3 leading-relaxed">
            <p>
              <span className="font-mono text-indigo-400 font-bold">WPM (Words Per Minute)</span> розраховується в реальному часі на основі натискань клавіш у Monaco Editor.
            </p>
            <div className="p-3 bg-[var(--sbc-bg-subtle,#262626)] border border-[var(--sbc-border-subtle,#2b2b2b)] rounded-xl font-mono text-[11px] text-[var(--sbc-text-primary,#cccccc)]">
              WPM = (Всього символів / 5) / (Час введення в хвилинах)
            </div>
            <p className="text-[11px]">
              Нормальний темп розробника: 35–65 WPM. Аномально високі стрибки (&gt;150 WPM) вказують на автодоповнення або масовий paste коду.
            </p>
          </div>
        )}

        {metricModal === 'copypaste' && (
          <div className="text-xs text-[var(--sbc-text-muted,#909090)] flex flex-col gap-3 leading-relaxed">
            <p>
              <span className="font-mono text-amber-400 font-bold">Copy-Paste Ratio</span> визначає співвідношення символів, доданих через комбінації Ctrl+V / Command+V, до загального обсягу коду.
            </p>
            <div className="p-3 bg-[var(--sbc-bg-subtle,#262626)] border border-[var(--sbc-border-subtle,#2b2b2b)] rounded-xl font-mono text-[11px] text-[var(--sbc-text-primary,#cccccc)]">
              CopyPasteRatio = Символів з Clipboard / Загальна кількість символів рішення
            </div>
            <p className="text-[11px]">
              Показник &gt; 60% може свідчити про списування чи використання сторонніх генераторів коду без самостійного введення.
            </p>
          </div>
        )}

        {metricModal === 'fatigue' && (
          <div className="text-xs text-[var(--sbc-text-muted,#909090)] flex flex-col gap-3 leading-relaxed">
            <p>
              <span className="font-mono text-purple-400 font-bold">Індекс Втоми</span> відстежує аномально тривалі зупинки редагування (&gt; 15 секунд) та часті видалення великих блоків (Backspace / Delete).
            </p>
            <div className="p-3 bg-[var(--sbc-bg-subtle,#262626)] border border-[var(--sbc-border-subtle,#2b2b2b)] rounded-xl font-mono text-[11px] text-[var(--sbc-text-primary,#cccccc)]">
              FatigueIndex = Кількість_Пауз_&gt;15с + (Видалено_Символів / 50)
            </div>
            <p className="text-[11px]">
              Високий показник свідчить про виникнення труднощів, замішання або когнітивного перевантаження під час виконання задачі.
            </p>
          </div>
        )}
      </Modal>

      {/* Course Switch Confirmation Modal Popup */}
      <ConfirmModal
        isOpen={Boolean(pendingCourseSlug)}
        onClose={cancelCourseSwitch}
        onConfirm={confirmCourseSwitch}
        variant="info"
        icon={<ShieldCheck className="w-5 h-5" />}
        title="Перемикання Дисципліни Моніторингу"
        description={
          pendingCourseSlug ? (
            <>
              Перемкнути навчальну аналітику, журнал перевірки та граф навичок на курс{' '}
              <strong className="text-purple-300">
                &quot;{courses.find((c) => c.slug === pendingCourseSlug)?.title || pendingCourseSlug}&quot;
              </strong>
              ?
            </>
          ) : undefined
        }
        warnings={[
          'Буде перераховано метрики когорти для обраного курсу.',
          'Список студентів та черга перевірки оновляться відповідно.',
        ]}
        cancelLabel="Скасувати"
        confirmLabel="Підтвердити перехід"
      />

      {/* ⚠️ Reset Student BKT Progress Confirmation Modal (Course-Scoped vs Global with Safety Toggle) */}
      <Modal
        isOpen={Boolean(resetConfirmStudent)}
        onClose={() => {
          if (isResettingStudent) return;
          setResetConfirmStudent(null);
          setResetGlobalSafetyToggle(false);
        }}
        closeOnOverlayClick={!isResettingStudent}
        closeOnEscape={!isResettingStudent}
        hideCloseButton={isResettingStudent}
        size="md"
        icon={
          <div className="w-9 h-9 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
        }
        title="Анулювання Прогресу Студента"
        subtitle={
          resetConfirmStudent ? (
            <>
              Оберіть рівень скидання даних для студента{' '}
              <strong className="text-[var(--sbc-text-primary,#cccccc)]">&quot;{resetConfirmStudent.name}&quot;</strong>
            </>
          ) : undefined
        }
        footer={
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            disabled={isResettingStudent}
            onClick={() => {
              setResetConfirmStudent(null);
              setResetGlobalSafetyToggle(false);
            }}
          >
            Закрити без змін
          </Button>
        }
      >
        {resetConfirmStudent && (
          <div className="flex flex-col gap-3.5">
            {/* Option 1: Course-Scoped Reset (Primary & Safe) */}
            <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/40 rounded-xl text-left flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🎯 Скинути прогрес поточного курсу</span>
                </span>
                <Badge variant="accent" size="xs" mono>
                  Рекомендовано
                </Badge>
              </div>
              <p className="text-xs text-[var(--sbc-text-muted,#909090)] leading-relaxed">
                Скидає відповіді, BKT-оцінки <code className="text-indigo-300 font-mono">P(L)</code> та чернетки{' '}
                <strong className="text-[var(--sbc-text-primary,#cccccc)]">лише для дисципліни &quot;{activeCourse.title}&quot;</strong>. Прогрес студента в інших предметах залишиться недоторканим.
              </p>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                isLoading={isResettingStudent}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() =>
                  handleResetStudent(
                    resetConfirmStudent.id || resetConfirmStudent.studentId || resetConfirmStudent.email,
                    'course'
                  )
                }
              >
                {isResettingStudent ? 'Скидання курсу...' : `Скинути тільки курс "${activeCourse.title}"`}
              </Button>
            </div>

            {/* Option 2: Global Account Reset with Safety Toggle */}
            <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-left flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Повне анулювання акаунта (всі курси)</span>
                </span>
              </div>
              <p className="text-[11px] text-[var(--sbc-text-muted,#909090)] leading-relaxed">
                Безповоротно видаляє всі спроби, історію та BKT-стан по{' '}
                <strong className="text-rose-300">всіх навчальних курсах платформи</strong>.
              </p>

              {/* Safety Switch Toggle */}
              <label className="flex items-center gap-2.5 p-2 bg-[var(--sbc-bg-subtle,#262626)] border border-[var(--sbc-border-subtle,#2b2b2b)] rounded-lg cursor-pointer transition-all select-none">
                <input
                  type="checkbox"
                  checked={resetGlobalSafetyToggle}
                  onChange={(e) => setResetGlobalSafetyToggle(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-900 cursor-pointer"
                />
                <span className="text-[11px] font-medium text-[var(--sbc-text-primary,#cccccc)]">
                  Я розумію ризики і підтверджую глобальне скидання
                </span>
              </label>

              <Button
                variant="danger"
                size="sm"
                fullWidth
                isLoading={isResettingStudent}
                disabled={!resetGlobalSafetyToggle}
                leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
                onClick={() =>
                  handleResetStudent(
                    resetConfirmStudent.id || resetConfirmStudent.studentId || resetConfirmStudent.email,
                    'all'
                  )
                }
              >
                {isResettingStudent ? 'Повне скидання...' : 'Скинути весь прогрес студента'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    
        </>
      }
    >
      <div className="flex flex-col gap-6">

          {/* Main View 1: Student Detailed Analytics & Heatmap */}
          {activeTab === 'analytics' && selectedStudent && (
            <StudentAnalyticsWorkspace
              selectedStudent={selectedStudent}
              activeCourse={activeCourse}
              studentGraphNodes={studentGraphNodes}
              activeStudentView={activeStudentView}
              onChangeStudentView={setActiveStudentView}
              studentIntegrityPolicy={studentIntegrityPolicy}
              isUpdatingStudentPolicy={isUpdatingStudentPolicy}
              onSetStudentIntegrityPolicy={handleSetStudentIntegrityPolicy}
              onOpenResetConfirm={setResetConfirmStudent}
              onOpenMetricModal={setMetricModal}
              onNavigateToSkillTask={(skillSlug, taskId) => {
                setActiveTab('coursemap');
                setIsDrawerOpen(true);
                if (skillSlug) setSelectedSkillSlug(skillSlug);
                setSelectedTaskId(taskId ?? null);
              }}
              apiUrl={API_URL}
              liveActivityLogs={liveActivityLogs}
            />
          )}

          {/* Main View 2: Course & Tasks Detail Inspector via Interactive CourseGraphViewer */}
          {activeTab === 'coursemap' && (
            <CourseGraphViewer
              courseTitle={courseDetails?.title || activeCourse?.title || 'Навчальний курс'}
              courseSlug={activeCourseSlug}
              skills={courseDetails?.skills || []}
              allTasks={allTasks}
              selectedSkillSlug={selectedSkillSlug}
              selectedTaskId={selectedTaskId}
              onSelectSkill={(slug) => {
                setSelectedSkillSlug(slug);
                setSelectedTaskId(null);
              }}
              onSelectTask={(taskId) => {
                setSelectedTaskId(taskId);
              }}
              onCloseDrawer={() => setIsDrawerOpen(false)}
            />
          )}

          {/* Main View: Teacher Review Queue Inspector */}
          {activeTab === 'reviews' && (
            <ReviewQueueInspector
              currentReview={reviewQueue.find((r) => r.submissionId === selectedReviewId) || reviewQueue[0] || null}
              isSubmitting={isReviewSubmitting}
              reviewComment={reviewComment}
              setReviewComment={setReviewComment}
              reviewScoreOverride={reviewScoreOverride}
              setReviewScoreOverride={setReviewScoreOverride}
              onDecision={(decision) => {
                const current = reviewQueue.find((r) => r.submissionId === selectedReviewId) || reviewQueue[0];
                if (current) {
                  handleReviewDecision(current.submissionId, decision);
                }
              }}
              onAnnul={handleAnnulDecision}
            />
          )}

          {/* Main View: Classrooms & Invite Codes */}
          {activeTab === 'classrooms' && (
            <ClassroomManager apiUrl={API_URL} />
          )}

          {/* Main View: Metrics Audit & BKT Math Simulator */}
          {activeTab === 'metrics-audit' && (
            <MetricsAuditInspector
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={(id) => setSelectedStudentId(id)}
              activeCourseSlug={activeCourseSlug}
              activeSubTab={auditSubTab}
              onSubTabChange={(tab) => setAuditSubTab(tab)}
            />
          )}

          {/* Main View 3: Settings Details */}
          {activeTab === 'settings' && (
            <div className="flex flex-col divide-y divide-slate-800/70 max-w-3xl">
              <div className="pb-5">
                <ThemeSettingsSection variant="panel" title="Тема оформлення інтерфейсу" className="max-w-sm" />
              </div>

              <div className="pt-5 flex flex-col gap-2">
                <h2 className="text-base font-bold text-slate-100">Параметри Оцінювання та Алгоритму BKT</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Тут показуються загальні параметри сітки оцінювання BKT: ймовірності вгадування P(G), вислизання P(S) та поріг майстерності P(L) ≥ 0.95.
                </p>
              </div>
            </div>
          )}
        
      </div>
    </AppShellLayout>

    {/* 👤 Спільний уніфікований Drawer профілю викладача */}
    <UserProfileDrawer
      isOpen={isProfileDrawerOpen}
      onClose={() => setIsProfileDrawerOpen(false)}
      user={{
        name: 'Олександр Коваленко',
        roleName: 'Викладач',
        roleBadge: 'ВИКЛАДАЧ',
        subtitle: 'Кафедра компʼютерних наук · ID: prof-kovalenko',
        initials: 'ВК',
        avatarGradient: 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500',
      }}
      courses={courses.map((c) => ({
        slug: c.slug,
        title: c.title,
        category: 'Навчальний курс',
      }))}
      activeCourseSlug={activeCourseSlug}
      onSelectCourse={(slug) => {
        handleSelectCourse(slug);
        setIsProfileDrawerOpen(false);
      }}
      stats={[
        {
          label: 'Студентів у групі',
          value: students.length,
          icon: Users,
          iconColor: 'text-purple-400',
          valueColor: 'text-white',
        },
        {
          label: 'Черга на перевірку',
          value: `${reviewQueue.length} робіт`,
          icon: ClipboardCheck,
          iconColor: 'text-amber-400',
          valueColor: 'text-amber-400',
        },
      ]}
      statsTitle="Огляд Педагогічного Навантаження"
      quickLinks={[
        {
          label: 'Відкрити CMS Адміністратора',
          href: 'http://localhost:3004',
          icon: Code2,
          iconColor: 'text-emerald-400',
        },
        {
          label: 'Документація Платформи',
          href: 'http://localhost:3005',
          icon: BookOpen,
          iconColor: 'text-blue-400',
        },
      ]}
    />
    </>
  );
}
