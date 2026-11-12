'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ShieldCheck, Network, Users, BarChart3, Code2, BookOpen, Scale, ChevronDown, ChevronUp, X, Search, RotateCcw, AlertTriangle, CheckCircle2, Lock, HelpCircle, Code, FileText, CheckSquare, Sparkles, Keyboard, Copy, Activity, Info, GitBranch, Layers, ClipboardCheck, Tag, FlaskConical, Compass, User, Globe, Plus, Minus, GraduationCap, Clock } from 'lucide-react';
import { StudentAnalyticsItem } from '../features/analytics/model/analytics.types';
import { AnomalyTreeWidget, GameSkillTreeWidget, SkillGraphNode, AppShellLayout, Breadcrumbs, UserProfileDrawer } from '@sbc/ui';
import { CourseDto, TaskDto } from '@sbc/types';
import { ReviewQueueInspector } from '../features/reviews/ui/ReviewQueueInspector';
import { CourseGraphViewer } from '../features/course-map/ui/CourseGraphViewer';
import { MetricsAuditInspector } from '../features/metrics-audit/ui/MetricsAuditInspector';
import { StudentActivityTimelineWidget } from '../features/analytics/ui/StudentActivityTimelineWidget';
import { ClassroomManager } from '../features/classrooms/ui/ClassroomManager';

export type CourseItem = Omit<Partial<CourseDto>, 'icon'> & {
  slug: string;
  title: string;
  description?: string;
  icon?: any;
  skillSlugs: string[];
};

const DEFAULT_COURSES: CourseItem[] = [
  { slug: 'js-dev', title: 'JavaScript & Web Dev', icon: Code2, skillSlugs: ['js-basics', 'js-functions', 'js-collections', 'js-async', 'js-oop'] },
  { slug: 'english-b2', title: 'Business English (B2)', icon: BookOpen, skillSlugs: ['eng-grammar', 'eng-vocab', 'eng-writing'] },
  { slug: 'ukraine-law', title: 'Правознавство України', icon: Scale, skillSlugs: ['law-basics', 'law-constitutional', 'law-case-analysis'] },
];

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

  // Search & Filter state inside side drawers and top bar
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState<boolean>(false);
  const [cohortFilter, setCohortFilter] = useState<'all' | 'mastery' | 'proficient' | 'basic' | 'at_risk' | 'anomalies'>('all');
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
  type TeacherTab = 'analytics' | 'coursemap' | 'reviews' | 'classrooms' | 'metrics-audit' | 'settings';
  const [activeTab, setActiveTab] = useState<TeacherTab>('analytics');
  const [auditSubTab, setAuditSubTab] = useState<'live-log' | 'what-if' | 'test-matrix' | 'mechanisms'>('live-log');
  // Collapsible sections state inside Metrics Audit drawer
  const [isGeneralToolsOpen, setIsGeneralToolsOpen] = useState<boolean>(true);
  const [isStudentsListOpen, setIsStudentsListOpen] = useState<boolean>(true);
  // Collapsible sections state inside Analytics drawer (Rule 7)
  const [isCohortDistributionOpen, setIsCohortDistributionOpen] = useState<boolean>(true);
  const [isRiskFeedOpen, setIsRiskFeedOpen] = useState<boolean>(true);
  const [isFilteredRosterOpen, setIsFilteredRosterOpen] = useState<boolean>(true);
  // Collapsible sections state inside CourseMap drawer (Rule 7)
  const [isTriadAuditOpen, setIsTriadAuditOpen] = useState<boolean>(true);
  const [isCognitiveTrapsOpen, setIsCognitiveTrapsOpen] = useState<boolean>(true);
  const [isAdaptiveParamsOpen, setIsAdaptiveParamsOpen] = useState<boolean>(true);
  // By default, student selection is in the top bar, so canvas has 100% space
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeStudentView, setActiveStudentView] = useState<'metrics' | 'tree' | 'timeline'>('metrics');
  const [liveActivityLogs, setLiveActivityLogs] = useState<any[]>([]);

  // Teacher Review Queue State & Filter Tab ('pending' | 'reviewed')
  const [reviewFilterTab, setReviewFilterTab] = useState<'pending' | 'reviewed'>('pending');
  const [isReviewFilterOpen, setIsReviewFilterOpen] = useState<boolean>(true);
  const [isReviewItemsOpen, setIsReviewItemsOpen] = useState<boolean>(true);
  // Settings Drawer State (Rule 7)
  const [isBktThresholdsOpen, setIsBktThresholdsOpen] = useState<boolean>(true);
  const [isGuessPenaltiesOpen, setIsGuessPenaltiesOpen] = useState<boolean>(true);
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
        <>
          {/* Drawer 1: Cohort Bloom Distribution & Live Risk Feed */}
          {activeTab === 'analytics' && (
            <div className="flex flex-col divide-y divide-slate-800/70">
              {/* 📊 Section 1: Cohort Mastery Distribution */}
              <div className="pb-3 flex flex-col gap-2">
                <button
                  onClick={() => setIsCohortDistributionOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Розподіл Групи</span>
                    <span className="text-[10px] font-mono text-slate-500 font-normal">({students.length})</span>
                  </span>
                  <span className="text-slate-500 group-hover:text-white">
                    {isCohortDistributionOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {isCohortDistributionOpen && (
                  <div className="flex flex-col gap-2 animate-fadeIn">
                    <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden flex">
                      <div
                        style={{ width: `${students.length ? (cohortMasteryStudents.length / students.length) * 100 : 0}%` }}
                        className="bg-amber-400 transition-all"
                        title={`Mastery: ${cohortMasteryStudents.length}`}
                      />
                      <div
                        style={{ width: `${students.length ? (cohortProficientStudents.length / students.length) * 100 : 0}%` }}
                        className="bg-emerald-500 transition-all"
                        title={`Proficient: ${cohortProficientStudents.length}`}
                      />
                      <div
                        style={{ width: `${students.length ? (cohortBasicStudents.length / students.length) * 100 : 0}%` }}
                        className="bg-blue-500 transition-all"
                        title={`Basic: ${cohortBasicStudents.length}`}
                      />
                      <div
                        style={{ width: `${students.length ? (cohortAtRiskStudents.length / students.length) * 100 : 0}%` }}
                        className="bg-rose-500 transition-all"
                        title={`At Risk: ${cohortAtRiskStudents.length}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setCohortFilter((prev) => (prev === 'mastery' ? 'all' : 'mastery'))}
                        className={`py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between text-xs select-none ${
                          cohortFilter === 'mastery'
                            ? 'bg-amber-500/15 text-amber-300 font-medium'
                            : 'hover:bg-slate-800/50 text-slate-400'
                        }`}
                      >
                        <span className="text-[11px] text-amber-400">🏆 Mastery</span>
                        <span className="font-mono text-[11px] font-bold text-slate-200">{cohortMasteryStudents.length}</span>
                      </button>

                      <button
                        onClick={() => setCohortFilter((prev) => (prev === 'proficient' ? 'all' : 'proficient'))}
                        className={`py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between text-xs select-none ${
                          cohortFilter === 'proficient'
                            ? 'bg-emerald-500/15 text-emerald-300 font-medium'
                            : 'hover:bg-slate-800/50 text-slate-400'
                        }`}
                      >
                        <span className="text-[11px] text-emerald-400">🟢 Proficient</span>
                        <span className="font-mono text-[11px] font-bold text-slate-200">{cohortProficientStudents.length}</span>
                      </button>

                      <button
                        onClick={() => setCohortFilter((prev) => (prev === 'basic' ? 'all' : 'basic'))}
                        className={`py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between text-xs select-none ${
                          cohortFilter === 'basic'
                            ? 'bg-blue-500/15 text-blue-300 font-medium'
                            : 'hover:bg-slate-800/50 text-slate-400'
                        }`}
                      >
                        <span className="text-[11px] text-blue-400">🟡 Basic</span>
                        <span className="font-mono text-[11px] font-bold text-slate-200">{cohortBasicStudents.length}</span>
                      </button>

                      <button
                        onClick={() => setCohortFilter((prev) => (prev === 'at_risk' ? 'all' : 'at_risk'))}
                        className={`py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between text-xs select-none ${
                          cohortFilter === 'at_risk'
                            ? 'bg-rose-500/15 text-rose-300 font-medium'
                            : 'hover:bg-slate-800/50 text-slate-400'
                        }`}
                      >
                        <span className="text-[11px] text-rose-400">🔴 At Risk</span>
                        <span className="font-mono text-[11px] font-bold text-slate-200">{cohortAtRiskStudents.length}</span>
                      </button>
                    </div>

                    {cohortFilter !== 'all' && (
                      <button
                        onClick={() => setCohortFilter('all')}
                        className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors text-right cursor-pointer"
                      >
                        ✕ Скинути фільтр
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 🚨 Section 2: Live Risk Feed */}
              <div className="py-3 flex flex-col gap-2">
                <button
                  onClick={() => setIsRiskFeedOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Радар Ризиків</span>
                    <span className="text-[10px] font-mono text-slate-500 font-normal">({riskFeedStudents.length})</span>
                  </span>
                  <span className="text-slate-500 group-hover:text-white">
                    {isRiskFeedOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {isRiskFeedOpen && (
                  <div className="flex flex-col divide-y divide-slate-800/50 animate-fadeIn">
                    {riskFeedStudents.length === 0 ? (
                      <div className="py-2 text-xs text-slate-500">
                        ✓ Аномалій не зафіксовано
                      </div>
                    ) : (
                      riskFeedStudents.slice(0, 3).map((st) => {
                        const stId = st.id || st.studentId || st.email;
                        const isCopyPaste = (st.copyPasteRatio ?? 0) >= 0.60;
                        const isGuess = st.hasGuessAlert || (st.recentAdjustments?.some((a) => (a.pGuessUsed ?? 0) > 0.30) ?? false);
                        const isFatigue = (st.fatigueIndex ?? 0) >= 5;

                        return (
                          <div
                            key={`risk-${stId}`}
                            onClick={() => setSelectedStudentId(stId)}
                            className="py-2 px-1.5 hover:bg-slate-800/40 rounded transition-colors cursor-pointer flex flex-col gap-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-200 truncate max-w-[170px]">{st.name}</span>
                              <span className="text-[10px] font-mono text-amber-400">
                                {((st.averageMastery ?? 0) * 100).toFixed(0)}% P(L)
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                              {isCopyPaste && (
                                <span className="text-rose-400">
                                  Copy {((st.copyPasteRatio ?? 0) * 100).toFixed(0)}%
                                </span>
                              )}
                              {isGuess && (
                                <span className="text-amber-400">
                                  P(G) Вгадування
                                </span>
                              )}
                              {isFatigue && (
                                <span className="text-purple-400">
                                  Втома F={st.fatigueIndex}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* 🔍 Section 3: Filtered Students Roster */}
              <div className="pt-3 flex flex-col gap-2">
                <button
                  onClick={() => setIsFilteredRosterOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Список Учнів</span>
                    <span className="text-[10px] font-mono text-slate-500 font-normal">({filteredStudents.length})</span>
                  </span>
                  <span className="text-slate-500 group-hover:text-white">
                    {isFilteredRosterOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {isFilteredRosterOpen && (
                  <div className="flex flex-col gap-2 animate-fadeIn">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Пошук серед учнів..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="flex flex-col divide-y divide-slate-800/50 max-h-60 overflow-y-auto pr-0.5">
                      {filteredStudents.length === 0 ? (
                        <div className="py-3 text-center text-xs text-slate-500">
                          Учнів не знайдено
                        </div>
                      ) : (
                        filteredStudents.map((st) => {
                          const stId = st.id || st.studentId || st.email;
                          const isSelected = selectedStudentId === stId;
                          const avgMastery = st.averageMastery !== undefined ? (st.averageMastery * 100).toFixed(0) : '0';

                          return (
                            <div
                              key={stId}
                              onClick={() => setSelectedStudentId(stId)}
                              className={`py-2 px-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-2 select-none ${
                                isSelected
                                  ? 'bg-slate-800/60 ring-1 ring-purple-500/30 text-white'
                                  : 'hover:bg-slate-800/40 text-slate-300'
                              }`}
                            >
                              <div className="overflow-hidden">
                                <div className="text-xs font-medium truncate flex items-center gap-1.5">
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />}
                                  <span className="truncate">{st.name}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate font-mono">{st.email}</div>
                              </div>
                              <div className="flex flex-col items-end shrink-0 font-mono">
                                <span className="text-xs font-bold text-emerald-400">
                                  {avgMastery}%
                                </span>
                                <span className="text-[9px] text-slate-500">
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
            </div>
          )}

          {/* Drawer 2: Pedagogical Control Panel */}
          {activeTab === 'coursemap' && courseDetails && (
            <div className="flex flex-col divide-y divide-slate-800/70">
              {/* 1. 🏆 Section 1: Bloom Triad Coverage */}
              {(() => {
                const currentSkill = courseDetails.skills?.find((s: any) => s.slug === (selectedSkillSlug || courseDetails.skills[0]?.slug)) || courseDetails.skills[0];
                const skillTasks = allTasks.filter((t) => t.skillId === currentSkill?.id || t.skill?.id === currentSkill?.id);

                const topicsMap: Record<string, { easy: number; medium: number; hard: number; total: number }> = {};
                let codeTasks = 0;
                let quizTasks = 0;
                let secretTestsCount = 0;

                skillTasks.forEach((tk) => {
                  const top = tk.topic || 'general';
                  if (!topicsMap[top]) topicsMap[top] = { easy: 0, medium: 0, hard: 0, total: 0 };
                  topicsMap[top].total++;
                  if (tk.difficulty === 'EASY') topicsMap[top].easy++;
                  if (tk.difficulty === 'MEDIUM') topicsMap[top].medium++;
                  if (tk.difficulty === 'HARD') topicsMap[top].hard++;

                  if (tk.taskType === 'CODE') codeTasks++;
                  else quizTasks++;

                  if (tk.testCases && tk.testCases.some((tc: any) => tc.isSecret)) secretTestsCount++;
                });

                const totalTopics = Object.keys(topicsMap).length;
                const completeTriads = Object.values(topicsMap).filter((t) => t.easy > 0 && t.medium > 0 && t.hard > 0).length;
                const completePercent = totalTopics > 0 ? Math.round((completeTriads / totalTopics) * 100) : 0;

                return (
                  <div className="pb-3 flex flex-col gap-2">
                    <button
                      onClick={() => setIsTriadAuditOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>Баланс Тріад</span>
                        <span className="text-[10px] font-mono text-slate-500 font-normal">({currentSkill?.slug || 'all'})</span>
                      </span>
                      <span className="text-slate-500 group-hover:text-white">
                        {isTriadAuditOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </span>
                    </button>

                    {isTriadAuditOpen && (
                      <div className="flex flex-col gap-2 animate-fadeIn">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">Повнота Тріад (3/3):</span>
                            <span className="font-mono font-bold text-emerald-400">
                              {completeTriads}/{totalTopics} ({completePercent}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 transition-all"
                              style={{ width: `${completePercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                          <div className="py-1.5 px-2 rounded bg-slate-950/40 flex items-center justify-between">
                            <span className="text-slate-500 text-[10px]">Код:</span>
                            <span className="text-emerald-400 font-bold">{codeTasks}</span>
                          </div>
                          <div className="py-1.5 px-2 rounded bg-slate-950/40 flex items-center justify-between">
                            <span className="text-slate-500 text-[10px]">Тести:</span>
                            <span className="text-blue-400 font-bold">{quizTasks}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono pt-0.5 text-slate-400">
                          <span>Приховані тести (Secret):</span>
                          <span className="text-rose-400 font-bold">{secretTestsCount} задач</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 2. ⚡ Section 2: Cognitive Traps */}
              <div className="py-3 flex flex-col gap-2">
                <button
                  onClick={() => setIsCognitiveTrapsOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>Когнітивні Пастки</span>
                  </span>
                  <span className="text-slate-500 group-hover:text-white">
                    {isCognitiveTrapsOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {isCognitiveTrapsOpen && (
                  <div className="flex flex-col divide-y divide-slate-800/50 animate-fadeIn">
                    <div
                      onClick={() => {
                        const task = allTasks.find((t) => t.subConcept?.includes('dead-zone') || t.title.includes('Temporal Dead Zone'));
                        if (task) setSelectedTaskId(task.id);
                      }}
                      className="py-2 px-1.5 hover:bg-slate-800/40 rounded transition-colors cursor-pointer flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200 truncate">Temporal Dead Zone (TDZ)</span>
                        <span className="text-[10px] font-mono text-rose-400">42% пом.</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Часте перемикання на EASY (70%)</span>
                    </div>

                    <div
                      onClick={() => {
                        const task = allTasks.find((t) => t.subConcept?.includes('coercion') || t.title.includes('приведення'));
                        if (task) setSelectedTaskId(task.id);
                      }}
                      className="py-2 px-1.5 hover:bg-slate-800/40 rounded transition-colors cursor-pointer flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200 truncate">Strict Equality & Coercion</span>
                        <span className="text-[10px] font-mono text-amber-400">35% пом.</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Плутанина між == та ===</span>
                    </div>

                    <div
                      onClick={() => {
                        const task = allTasks.find((t) => t.subConcept?.includes('closure') || t.title.includes('замикан'));
                        if (task) setSelectedTaskId(task.id);
                      }}
                      className="py-2 px-1.5 hover:bg-slate-800/40 rounded transition-colors cursor-pointer flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200 truncate">Lexical Scope & Closures</span>
                        <span className="text-[10px] font-mono text-amber-400">28% пом.</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Збереження стану при викликах</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. ⚙️ Section 3: BKT Adaptive Tuner */}
              <div className="pt-3 flex flex-col gap-2">
                <button
                  onClick={() => setIsAdaptiveParamsOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Пороги Адаптації</span>
                  </span>
                  <span className="text-slate-500 group-hover:text-white">
                    {isAdaptiveParamsOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {isAdaptiveParamsOpen && (
                  <div className="flex flex-col divide-y divide-slate-800/50 font-mono text-[11px] animate-fadeIn">
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400">Proficient (DAG):</span>
                      <span className="text-indigo-400 font-bold">P(L) ≥ 0.75</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400">Gold Mastery:</span>
                      <span className="text-emerald-400 font-bold">P(L) ≥ 0.90</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400">Ліміт EASY:</span>
                      <span className="text-amber-400 font-bold">Max 70%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Drawer: Review Queue List */}
          {activeTab === 'reviews' && (
            <div className="flex flex-col divide-y divide-slate-800/70">
              {/* Section 1: Режими Черги */}
              <div className="pb-3 flex flex-col gap-2">
                <div className="bg-slate-950/60 p-1 rounded-lg border border-slate-800/80 flex items-center gap-1">
                  <button
                    onClick={() => setReviewFilterTab('pending')}
                    className={`flex-1 py-1 px-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reviewFilterTab === 'pending'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>В черзі</span>
                  </button>
                  <button
                    onClick={() => setReviewFilterTab('reviewed')}
                    className={`flex-1 py-1 px-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reviewFilterTab === 'reviewed'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Перевірені</span>
                  </button>
                </div>
              </div>

              {/* Section 2: Роботи Студентів */}
              <div className="pt-3 flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Роботи Студентів</span>
                  <span className="font-mono text-[10px] text-slate-500">({reviewQueue.length})</span>
                </span>

                {reviewQueue.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    {reviewFilterTab === 'pending'
                      ? 'Черга перевірки порожня'
                      : 'Немає перевірених робіт'}
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-slate-800/50">
                    {reviewQueue.map((item) => {
                      const isSelected = selectedReviewId === item.submissionId;
                      const isApproved = item.teacherReviewStatus === 'APPROVED';
                      const isRejected = item.teacherReviewStatus === 'REJECTED';

                      return (
                        <div
                          key={item.submissionId}
                          onClick={() => setSelectedReviewId(item.submissionId)}
                          className={`py-2.5 px-2 rounded-md transition-colors cursor-pointer flex flex-col gap-1 ${
                            isSelected
                              ? 'bg-purple-500/15 text-white'
                              : 'hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-white truncate">{item.studentName}</span>
                            <span className={`text-[10px] font-mono ${
                              isApproved
                                ? 'text-emerald-400'
                                : isRejected
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }`}>
                              {isApproved ? '✓ Затверджено' : isRejected ? '✕ Відхилено' : 'В черзі'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{item.taskTitle}</div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                            <span>{item.skillTitle}</span>
                            <span>{new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Drawer: Classrooms Info */}
          {activeTab === 'classrooms' && (
            <div className="flex flex-col gap-3 p-1">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex flex-col gap-1.5">
                <span className="font-semibold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Швидке Зарахування</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Згенеруйте інвайт-код або надішліть учням посилання /join. Вони авторизуються в 1 клік через Google та автоматично підключаться до вашого курсу.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col gap-1.5">
                <span className="font-semibold text-slate-300">Дидактичні Режими</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  • <strong className="text-purple-300">FULL_CYCLE:</strong> обов'язкова теорія в підручнику + адаптивний тренажер BKT ($P(L_n) \ge 0.85$).<br/>
                  • <strong className="text-amber-300">TESTING_ONLY:</strong> експрес-зріз або екзамен без блокування на конспекті.
                </p>
              </div>
            </div>
          )}

          {/* Drawer: Metrics Audit */}
          {activeTab === 'metrics-audit' && (
            <div className="flex flex-col divide-y divide-slate-800/70">
              {/* SECTION 1: Загальні системні інструменти */}
              <div className="pb-3 flex flex-col gap-1.5">
                <button
                  onClick={() => setIsGeneralToolsOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Інструменти Системи</span>
                  </span>
                  <span className="text-slate-500 group-hover:text-white">
                    {isGeneralToolsOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {isGeneralToolsOpen && (
                  <div className="flex flex-col divide-y divide-slate-800/50 animate-fadeIn">
                    <button
                      onClick={() => setAuditSubTab('mechanisms')}
                      className={`w-full py-2 px-2 rounded-md text-left flex items-center justify-between transition-colors cursor-pointer ${
                        auditSubTab === 'mechanisms'
                          ? 'bg-purple-500/15 text-white'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-xs font-medium truncate">Реєстр Механізмів (4-in-1)</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">➔</span>
                    </button>

                    <button
                      onClick={() => setAuditSubTab('test-matrix')}
                      className={`w-full py-2 px-2 rounded-md text-left flex items-center justify-between transition-colors cursor-pointer ${
                        auditSubTab === 'test-matrix'
                          ? 'bg-purple-500/15 text-white'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-xs font-medium truncate">Еталонна Матриця</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">6/6</span>
                    </button>

                    <button
                      onClick={() => setAuditSubTab('what-if')}
                      className={`w-full py-2 px-2 rounded-md text-left flex items-center justify-between transition-colors cursor-pointer ${
                        auditSubTab === 'what-if'
                          ? 'bg-purple-500/15 text-white'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="text-xs font-medium truncate">Пісочниця "What-If"</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">➔</span>
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 2: Студенти для аудиту */}
              <div className="pt-3 flex flex-col gap-2">
                <button
                  onClick={() => setIsStudentsListOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>Студенти для Аудиту</span>
                    <span className="text-[10px] font-mono text-slate-500 font-normal">({students.length})</span>
                  </span>
                  <span className="text-slate-500 group-hover:text-white">
                    {isStudentsListOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {isStudentsListOpen && (
                  <div className="flex flex-col divide-y divide-slate-800/50 max-h-[calc(100vh-340px)] overflow-y-auto pr-0.5 animate-fadeIn">
                    {students.map((st) => {
                      const stId = st.id || st.studentId || st.email;
                      const isSelected = selectedStudentId === stId;
                      const avgMastery = st.averageMastery !== undefined ? (st.averageMastery * 100).toFixed(0) : '0';

                      return (
                        <div
                          key={stId}
                          onClick={() => {
                            setSelectedStudentId(stId);
                            setAuditSubTab('live-log');
                          }}
                          className={`py-2 px-2 rounded-md transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected && auditSubTab === 'live-log'
                              ? 'bg-purple-500/15 text-white'
                              : 'hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="text-xs font-medium truncate flex items-center gap-1.5">
                              {isSelected && auditSubTab === 'live-log' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />}
                              <span className="truncate">{st.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate font-mono">{st.email}</div>
                          </div>
                          <div className="flex flex-col items-end shrink-0 font-mono">
                            <span className="text-xs font-bold text-emerald-400">
                              {avgMastery}%
                            </span>
                            <span className="text-[9px] text-slate-500">
                              Спроб: {st.recentAdjustments?.length || 0}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Drawer 3: Settings */}
          {activeTab === 'settings' && (
            <div className="flex flex-col divide-y divide-slate-800/70 text-xs text-slate-300">
              <div className="pb-3 flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Поріг Майстерності BKT
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  P(L) ≥ 0.95 відкриває залежні вершини графа навичок.
                </p>
              </div>

              <div className="pt-3 flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Штраф за Вгадування P(G)
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  При швидкості відповіді &lt; 3.5 сек активується захист від випадкового вгадування.
                </p>
              </div>
            </div>
          )}
        </>
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
      {metricModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 relative">
            <button
              onClick={() => setMetricModal(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {metricModal === 'bkt' && (
              <>
                <div className="flex items-center gap-3 text-emerald-400">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Середня Майстерність P(L) — Bayesian Knowledge Tracing</h3>
                </div>
                <div className="text-xs text-slate-300 flex flex-col gap-3 leading-relaxed">
                  <p>
                    Параметр <span className="font-mono text-emerald-400 font-bold">P(L)</span> визначає ймовірність того, що студент повністю засвоїв концепцію конкретного модуля.
                  </p>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-200">
                    P(L_t | obs) = [ P(L_t-1) * (1 - P(S)) ] / [ P(L_t-1) * (1 - P(S)) + (1 - P(L_t-1)) * P(G) ]
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">P(G) = 0.20:</strong> Ймовірність вгадування (Guessing).</li>
                    <li><strong className="text-slate-200">P(S) = 0.10:</strong> Ймовірність описки/вислизання (Slip).</li>
                    <li><strong className="text-slate-200">P(T) = 0.15:</strong> Ймовірність засвоєння після спроби (Transition).</li>
                  </ul>
                  <p className="text-[11px] text-slate-400 italic">
                    При досягненні P(L) ≥ 0.95 (95%) модуль вважається успішно засвоєним, і студенту відкривається доступ до наступних вузлів DAG.
                  </p>
                </div>
              </>
            )}

            {metricModal === 'wpm' && (
              <>
                <div className="flex items-center gap-3 text-indigo-400">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Швидкість Набору Коду (WPM)</h3>
                </div>
                <div className="text-xs text-slate-300 flex flex-col gap-3 leading-relaxed">
                  <p>
                    <span className="font-mono text-indigo-400 font-bold">WPM (Words Per Minute)</span> розраховується в реальному часі на основі натискань клавіш у Monaco Editor.
                  </p>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-200">
                    WPM = (Всього символів / 5) / (Час введення в хвилинах)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Нормальний темп розробника: 35–65 WPM. Аномально високі стрибки (&gt;150 WPM) вказують на автодоповнення або масовий paste коду.
                  </p>
                </div>
              </>
            )}

            {metricModal === 'copypaste' && (
              <>
                <div className="flex items-center gap-3 text-amber-400">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <Copy className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Copy-Paste Ratio (Частка Вставленого Коду)</h3>
                </div>
                <div className="text-xs text-slate-300 flex flex-col gap-3 leading-relaxed">
                  <p>
                    <span className="font-mono text-amber-400 font-bold">Copy-Paste Ratio</span> визначає співвідношення символів, доданих через комбінації Ctrl+V / Command+V, до загального обсягу коду.
                  </p>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-200">
                    CopyPasteRatio = Символів з Clipboard / Загальна кількість символів рішення
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Показник &gt; 60% може свідчити про списування чи використання сторонніх генераторів коду без самостійного введення.
                  </p>
                </div>
              </>
            )}

            {metricModal === 'fatigue' && (
              <>
                <div className="flex items-center gap-3 text-purple-400">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Індекс Втоми (Idle Pauses & Cognitive Load)</h3>
                </div>
                <div className="text-xs text-slate-300 flex flex-col gap-3 leading-relaxed">
                  <p>
                    <span className="font-mono text-purple-400 font-bold">Індекс Втоми</span> відстежує аномально тривалі зупинки редагування (&gt; 15 секунд) та часті видалення великих блоків (Backspace / Delete).
                  </p>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-200">
                    FatigueIndex = Кількість_Пауз_&gt;15с + (Видалено_Символів / 50)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Високий показник свідчить про виникнення труднощів, замішання або когнітивного перевантаження під час виконання задачі.
                  </p>
                </div>
              </>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setMetricModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Зрозуміло
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Switch Confirmation Modal Popup */}
      {pendingCourseSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full p-6 bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl flex flex-col gap-5 text-center transform transition-all scale-100">
            <div className="mx-auto p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400">
              <ShieldCheck className="w-8 h-8 animate-pulse" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-white">Перемикання Дисципліни Моніторингу</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Перемкнути навчальну аналітику, журнал перевірки та граф навичок на курс <strong className="text-purple-300">"{courses.find(c => c.slug === pendingCourseSlug)?.title || pendingCourseSlug}"</strong>?
              </p>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 text-left flex flex-col gap-1">
                <span>📊 Буде перераховано метрики когорти для обраного курсу.</span>
                <span>🎓 Список студентів та черга перевірки оновляться відповідно.</span>
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
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all cursor-pointer border border-purple-400/30"
              >
                Підтвердити перехід
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Reset Student BKT Progress Confirmation Modal (Course-Scoped vs Global with Safety Toggle) */}
      {resetConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col gap-5 text-center transform transition-all scale-100">
            <div className="mx-auto p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400">
              <RotateCcw className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-bold text-white">Анулювання Прогресу Студента</h3>
              <p className="text-xs text-slate-300">
                Оберіть рівень скидання даних для студента <strong className="text-white">"{resetConfirmStudent.name}"</strong>
              </p>
            </div>

            {/* Option 1: Course-Scoped Reset (Primary & Safe) */}
            <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/40 rounded-xl text-left flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🎯 Скинути прогрес поточного курсу</span>
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Рекомендовано
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Скидає відповіді, BKT-оцінки <code className="text-indigo-300 font-mono">P(L)</code> та чернетки <strong className="text-white">лише для дисципліни "{activeCourse.title}"</strong>. Прогрес студента в інших предметах залишиться недоторканим.
              </p>
              <button
                disabled={isResettingStudent}
                onClick={() => handleResetStudent(resetConfirmStudent.id || resetConfirmStudent.studentId || resetConfirmStudent.email, 'course')}
                className="w-full mt-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isResettingStudent ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Скидання курсу...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Скинути тільки курс "{activeCourse.title}"</span>
                  </>
                )}
              </button>
            </div>

            {/* Option 2: Global Account Reset with Safety Toggle */}
            <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-left flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Повне анулювання акаунта (всі курси)</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Безповоротно видаляє всі спроби, історію та BKT-стан по <strong className="text-rose-300">всіх навчальних курсах платформи</strong>.
              </p>

              {/* Safety Switch Toggle */}
              <label className="flex items-center gap-2.5 p-2 bg-slate-950/70 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-all select-none">
                <input
                  type="checkbox"
                  checked={resetGlobalSafetyToggle}
                  onChange={(e) => setResetGlobalSafetyToggle(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-900 cursor-pointer"
                />
                <span className="text-[11px] font-medium text-slate-300">
                  Я розумію ризики і підтверджую глобальне скидання
                </span>
              </label>

              <button
                disabled={!resetGlobalSafetyToggle || isResettingStudent}
                onClick={() => handleResetStudent(resetConfirmStudent.id || resetConfirmStudent.studentId || resetConfirmStudent.email, 'all')}
                className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
                  resetGlobalSafetyToggle && !isResettingStudent
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 border-rose-400/40 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border-slate-700/60 cursor-not-allowed opacity-60'
                }`}
              >
                {isResettingStudent ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Повне скидання...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Скинути весь прогрес студента</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                disabled={isResettingStudent}
                onClick={() => {
                  setResetConfirmStudent(null);
                  setResetGlobalSafetyToggle(false);
                }}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer border border-slate-700 disabled:opacity-50"
              >
                Закрити без змін
              </button>
            </div>
          </div>
        </div>
      )}
    
        </>
      }
    >
      <div className="flex flex-col gap-6">

          {/* Main View 1: Student Detailed Analytics & Heatmap */}
          {activeTab === 'analytics' && selectedStudent && (
            <div className="flex flex-col gap-5">
              {/* Clean Borderless Student Toolbar */}
              <div className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-sm font-bold shrink-0">
                    {selectedStudent.name ? selectedStudent.name.charAt(0) : 'S'}
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base font-bold text-white">{selectedStudent.name}</h2>
                    <span className="text-xs font-mono text-slate-400">{selectedStudent.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* View Mode Toggle: Metrics Heatmap vs RPG Skill Tree vs Activity Timeline */}
                  <div className="bg-slate-950/60 p-0.5 rounded-lg border border-slate-800/60 flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveStudentView('metrics')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                        activeStudentView === 'metrics'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Аналітика</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStudentView('tree')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                        activeStudentView === 'tree'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                      <span>Дерево Знань</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStudentView('timeline')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                        activeStudentView === 'timeline'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Хроніка дій</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setResetConfirmStudent(selectedStudent)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-slate-700/60 hover:border-rose-500/40 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer select-none"
                    title="Анулювати всі BKT-оцінки та історію спроб для цього студента"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>Скинути прогрес</span>
                  </button>
                </div>
              </div>

              {/* 🌟 Dynamic View Mode: RPG Game Skill Tree vs Activity Timeline vs Traditional Metrics */}
              {activeStudentView === 'tree' ? (
                <div className="w-full h-[680px] rounded-xl overflow-hidden border border-slate-800/80">
                  <GameSkillTreeWidget
                    nodes={studentGraphNodes}
                    courseTitle={activeCourse.title}
                    studentName={selectedStudent.name}
                    role="teacher"
                    adjustments={selectedStudent.recentAdjustments || []}
                    showInspector={true}
                    onSelectSkill={(slug) => {
                      setActiveTab('coursemap');
                      setIsDrawerOpen(true);
                      setSelectedSkillSlug(slug);
                      setSelectedTaskId(null);
                    }}
                  />
                </div>
              ) : activeStudentView === 'timeline' ? (
                <StudentActivityTimelineWidget
                  studentId={selectedStudent.id || 'demo-student'}
                  studentName={selectedStudent.name}
                  apiUrl={API_URL}
                  incomingLogs={liveActivityLogs}
                />
              ) : (
                <>
                  {/* Clean Student Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {/* Metric 1: P(L) Mastery */}
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between gap-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-medium uppercase text-slate-400">Середня Майстерність P(L)</span>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </div>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <div className="text-xl font-bold text-emerald-400 font-mono">
                          {selectedStudent.averageMastery !== undefined ? `${(selectedStudent.averageMastery * 100).toFixed(1)}%` : '0.0%'}
                        </div>
                        <button
                          type="button"
                          onClick={() => setMetricModal('bkt')}
                          className="text-[10px] text-slate-400 hover:text-indigo-300 cursor-pointer flex items-center gap-0.5"
                        >
                          <Info className="w-3 h-3" />
                          <span>Формула</span>
                        </button>
                      </div>
                    </div>

                    {/* Metric 2: WPM (Course Median) */}
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between gap-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-medium uppercase text-slate-400">Медіана WPM (Курс)</span>
                        <Keyboard className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      </div>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <div className="text-xl font-bold text-indigo-400 font-mono">
                          {selectedStudent.wpm ?? selectedStudent.avgWpm ?? 0} <span className="text-[10px] font-normal text-slate-400">WPM</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMetricModal('wpm')}
                          className="text-[10px] text-slate-400 hover:text-indigo-300 cursor-pointer flex items-center gap-0.5"
                        >
                          <Info className="w-3 h-3" />
                          <span>Розрахунок</span>
                        </button>
                      </div>
                    </div>

                    {/* Metric 3: Copy-Paste Ratio */}
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between gap-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-medium uppercase text-slate-400">Медіана Copy-Paste</span>
                          {selectedStudent.peakAnomaly?.hasAnomaly && (
                            <span className="text-[9px] text-red-400 mt-0.5 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                              <span>Пік: {selectedStudent.peakAnomaly.peakSkillTitle || selectedStudent.peakAnomaly.peakSkillSlug} ({(selectedStudent.peakAnomaly.copyPasteRatio * 100).toFixed(0)}%)</span>
                            </span>
                          )}
                        </div>
                        <Copy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      </div>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <div className="text-xl font-bold text-amber-400 font-mono">
                          {selectedStudent.copyPasteRatio !== undefined ? `${(selectedStudent.copyPasteRatio * 100).toFixed(0)}%` : '0%'}
                        </div>
                        <button
                          type="button"
                          onClick={() => setMetricModal('copypaste')}
                          className="text-[10px] text-slate-400 hover:text-indigo-300 cursor-pointer flex items-center gap-0.5"
                        >
                          <Info className="w-3 h-3" />
                          <span>Аналіз</span>
                        </button>
                      </div>
                    </div>

                    {/* Metric 4: Fatigue Index */}
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between gap-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-medium uppercase text-slate-400">Медіана Втоми</span>
                        <Activity className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      </div>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <div className="text-xl font-bold text-purple-400 font-mono">
                          {selectedStudent.fatigueIndex ?? 0}
                        </div>
                        <button
                          type="button"
                          onClick={() => setMetricModal('fatigue')}
                          className="text-[10px] text-slate-400 hover:text-indigo-300 cursor-pointer flex items-center gap-0.5"
                        >
                          <Info className="w-3 h-3" />
                          <span>Пояснення</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Behavioral Telemetry & Anomaly Tree */}
                  {selectedStudent.recentAdjustments && selectedStudent.recentAdjustments.length > 0 && (
                    <AnomalyTreeWidget
                      adjustments={selectedStudent.recentAdjustments}
                      nodes={studentGraphNodes}
                      title="Дерево Аномалій та Когнітивних Відхилень"
                      subtitle="Ієрархічний огляд інцидентів студента за категоріями, навичками та запитаннями"
                      onNavigateToTask={(taskId, skillSlug) => {
                        setActiveTab('coursemap');
                        setIsDrawerOpen(true);
                        if (skillSlug) setSelectedSkillSlug(skillSlug);
                        setSelectedTaskId(taskId);
                      }}
                    />
                  )}

                  {/* Flat BKT Skill Mastery Section (No Heavy Outer Box) */}
                  <div className="flex flex-col gap-3 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                        <span>BKT Mastery Breakdown & Модульна Телеметрія</span>
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500">
                        Per-Module Telemetry Level
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {activeCourse.skillSlugs.map((slug) => {
                        const masteryMap = selectedStudent.bktBySkill || selectedStudent.skillMastery || {};
                        const p = masteryMap[slug] ?? 0;
                        const isMastered = p >= 0.95;
                        const skillTelemetry = selectedStudent.telemetryBySkill?.[slug];
                        const isPeakAnomaly = skillTelemetry && skillTelemetry.copyPasteRatio >= 0.60;

                        return (
                          <div
                            key={slug}
                            className={`p-3 bg-slate-900/40 border rounded-lg flex flex-col gap-1.5 transition-all ${
                              isPeakAnomaly
                                ? 'border-red-500/50 bg-red-950/15'
                                : 'border-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono text-slate-200 font-semibold truncate flex items-center gap-1.5">
                                <span>{slug}</span>
                                {isPeakAnomaly && (
                                  <span className="text-[9px] font-medium text-red-400">
                                    ⚠️ Списування
                                  </span>
                                )}
                              </span>
                              <span className={`font-mono font-bold text-xs ${isMastered ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {(p * 100).toFixed(1)}%
                              </span>
                            </div>

                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${isMastered ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                style={{ width: `${Math.min(100, p * 100)}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                              <span>WPM: <strong className="text-slate-200">{skillTelemetry ? skillTelemetry.wpm : 0}</strong></span>
                              <span>Copy-Paste: <strong className={isPeakAnomaly ? 'text-red-400 font-bold' : 'text-slate-200'}>{skillTelemetry ? `${(skillTelemetry.copyPasteRatio * 100).toFixed(0)}%` : '0%'}</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <h2 className="text-lg font-bold text-white">Параметри Оцінювання та Алгоритму BKT</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Тут показуються загальні параметри сітки оцінювання BKT: ймовірності вгадування $P(G)$, вислизання $P(S)$, та поріг майстерності $P(L) \ge 0.95$.
              </p>
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
