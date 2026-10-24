'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ShieldCheck, Network, Users, BarChart3, Code2, BookOpen, Scale, ChevronDown, ChevronUp, X, Search, RotateCcw, AlertTriangle, CheckCircle2, Lock, HelpCircle, Code, FileText, CheckSquare, Sparkles, Keyboard, Copy, Activity, Info, GitBranch, Layers, ClipboardCheck, Tag, FlaskConical, Compass, User, Globe, Plus, Minus } from 'lucide-react';
import { StudentAnalyticsItem } from '../features/analytics/model/analytics.types';
import { AnomalyTreeWidget, GameSkillTreeWidget, SkillGraphNode } from '@sbc/ui';
import { ReviewQueueInspector } from '../features/reviews/ui/ReviewQueueInspector';
import { CourseGraphViewer } from '../features/course-map/ui/CourseGraphViewer';
import { MetricsAuditInspector } from '../features/metrics-audit/ui/MetricsAuditInspector';

interface CourseItem {
  slug: string;
  title: string;
  description?: string;
  icon?: any;
  skillSlugs: string[];
}

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
  const [allTasks, setAllTasks] = useState<any[]>([]);

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/courses`);
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

  const handleSelectCourse = (slug: string) => {
    setActiveCourseSlug(slug);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sbc_teacher_active_course', slug);
    }
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
  type TeacherTab = 'analytics' | 'reviews' | 'coursemap' | 'metrics-audit' | 'settings';
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
  const [activeStudentView, setActiveStudentView] = useState<'metrics' | 'tree'>('metrics');

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

  const handleResetStudent = async (studentId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/bkt/reset/${studentId}`, { method: 'POST' });
      if (res.ok) {
        await Promise.all([
          fetchStudentAnalytics(),
          fetchReviewQueue(),
        ]);
        setSelectedReviewId(null);
      }
    } catch (err) {
      console.error('Error resetting student BKT:', err);
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

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* 📌 Sticky Top Navigation Bar */}
      <header className="h-14 w-full bg-slate-900 border-b border-slate-800/90 px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Smart-BKT-Chain</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                Teacher Portal v2.0
              </span>
            </h1>
          </div>
        </div>

        {/* Top Controls: Course Selector, Searchable Student Selector & Profile */}
        <div className="flex items-center gap-3">
          {/* Course Selector */}
          <div className="relative min-w-[180px] sm:min-w-[240px]">
            <select
              id="teacher-course-select"
              value={activeCourseSlug}
              onChange={(e) => handleSelectCourse(e.target.value)}
              className="w-full appearance-none px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 cursor-pointer pr-8 shadow-inner"
            >
              {courses.map((course) => (
                <option key={course.slug} value={course.slug} className="bg-slate-900 text-white py-1">
                  🎓 {course.title} ({course.slug})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 🔍 Searchable Student Dropdown Selector */}
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <button
              id="teacher-student-dropdown-btn"
              onClick={() => setIsStudentDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950 border border-purple-500/40 hover:border-purple-400 text-xs font-semibold text-white transition-all shadow-inner cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="truncate">
                  {selectedStudent ? selectedStudent.name : 'Обрати студента...'}
                </span>
                {selectedStudent && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                    {(selectedStudent.averageMastery !== undefined ? (selectedStudent.averageMastery * 100).toFixed(0) : '0')}% P(L)
                  </span>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-purple-400 shrink-0 transition-transform ${isStudentDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu with Search */}
            {isStudentDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col backdrop-blur-xl animate-fadeIn">
                <div className="p-2.5 border-b border-slate-800 bg-slate-950/80">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Пошук студента за ім'ям чи email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      autoFocus
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto p-1.5 flex flex-col gap-1">
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
                          className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-purple-950/60 border border-purple-500/80 text-white shadow-sm'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold truncate flex items-center gap-1.5">
                              <span>{st.name}</span>
                              {isSelected && <span className="text-[10px] text-purple-400">●</span>}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate font-mono">{st.email}</div>
                          </div>
                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {avgMastery}% P(L)
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                              WPM: {st.wpm ?? st.avgWpm ?? 0}
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

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-slate-200">Викладач</span>
          </div>
        </div>
      </header>

      {/* 🧭 Main Workspace Area with Left Opera Icon Rail */}
      <div className="flex-1 flex overflow-hidden">
        {/* 🎨 Opera-Style Vertical Icon Rail (Slim Left Bar) */}
        <nav className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-3 shrink-0 z-20 shadow-xl">
          <button
            onClick={() => handleTabClick('analytics')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'analytics'
                ? isDrawerOpen
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-1 ring-purple-400/50'
                  : 'bg-purple-950/80 text-purple-300 border border-purple-500/30 hover:bg-purple-900/90 hover:text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title={
              activeTab === 'analytics'
                ? isDrawerOpen
                  ? 'Огляд групи відкритий (клік згорне сайдбар на весь екран)'
                  : 'Аналітика на весь екран (клік відкриє огляд групи та радар ризиків)'
                : 'Огляд Групи & Радар Ризиків'
            }
          >
            <BarChart3 className="w-5 h-5" />
            {activeTab === 'analytics' && isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-5 bg-purple-400 rounded-r-full shadow-sm shadow-purple-400"></span>
            )}
            {activeTab === 'analytics' && !isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-2 bg-purple-400/70 rounded-r-full"></span>
            )}
          </button>

          <button
            onClick={() => handleTabClick('coursemap')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'coursemap'
                ? isDrawerOpen
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-1 ring-purple-400/50'
                  : 'bg-purple-950/80 text-purple-300 border border-purple-500/30 hover:bg-purple-900/90 hover:text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title={
              activeTab === 'coursemap'
                ? isDrawerOpen
                  ? 'Граф навичок відкритий (клік згорне сайдбар на весь екран)'
                  : 'Інспектор на весь екран (клік відкриє дерево модулів)'
                : 'Граф Навичок & Завдання'
            }
          >
            <Network className="w-5 h-5" />
            {activeTab === 'coursemap' && isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-5 bg-purple-400 rounded-r-full shadow-sm shadow-purple-400"></span>
            )}
            {activeTab === 'coursemap' && !isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-2 bg-purple-400/70 rounded-r-full"></span>
            )}
          </button>

          <button
            id="teacher-tab-reviews"
            onClick={() => handleTabClick('reviews')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'reviews'
                ? isDrawerOpen
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-1 ring-purple-400/50'
                  : 'bg-purple-950/80 text-purple-300 border border-purple-500/30 hover:bg-purple-900/90 hover:text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Черга Перевірки Відкритих Відповідей (Human-in-the-Loop)"
          >
            <ClipboardCheck className="w-5 h-5" />
            {reviewQueue.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 font-mono shadow-sm">
                {reviewQueue.length}
              </span>
            )}
            {activeTab === 'reviews' && isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-5 bg-purple-400 rounded-r-full shadow-sm shadow-purple-400"></span>
            )}
            {activeTab === 'reviews' && !isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-2 bg-purple-400/70 rounded-r-full"></span>
            )}
          </button>

          <button
            id="teacher-tab-metrics-audit"
            onClick={() => handleTabClick('metrics-audit')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'metrics-audit'
                ? isDrawerOpen
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-1 ring-emerald-400/50'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/90 hover:text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Математичний Аудит & Симулятор BKT (What-If Sandbox)"
          >
            <FlaskConical className="w-5 h-5" />
            {activeTab === 'metrics-audit' && isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-5 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400"></span>
            )}
            {activeTab === 'metrics-audit' && !isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-2 bg-emerald-400/70 rounded-r-full"></span>
            )}
          </button>

          {/* Bottom Area (External Shortcuts & Settings) */}
          <div className="mt-auto flex flex-col items-center gap-2.5">
            <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 flex items-center justify-center hover:bg-indigo-600/30 hover:border-indigo-500/40 transition-all"
              title="Кабінет Студента"
            >
              <BookOpen className="w-4 h-4" />
            </a>

            <a
              href="http://localhost:3004"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-600/30 hover:border-emerald-500/40 transition-all"
              title="Панель Адміністратора CMS"
            >
              <Code2 className="w-4 h-4" />
            </a>

            <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

            <button
              onClick={() => handleTabClick('settings')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'settings'
                  ? isDrawerOpen
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40 ring-1 ring-amber-400/50'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500/30 hover:bg-amber-900/90 hover:text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Налаштування"
            >
              <ShieldCheck className="w-5 h-5" />
              {activeTab === 'settings' && isDrawerOpen && (
                <span className="absolute -left-1 w-1 h-5 bg-amber-400 rounded-r-full shadow-sm shadow-amber-400"></span>
              )}
              {activeTab === 'settings' && !isDrawerOpen && (
                <span className="absolute -left-1 w-1 h-2 bg-amber-400/70 rounded-r-full"></span>
              )}
            </button>
          </div>
        </nav>

        {/* 📂 Expandable Side Drawer Panel (List View) */}
        {isDrawerOpen && (
          <aside className="w-full sm:w-[340px] lg:w-[380px] bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0 shadow-2xl backdrop-blur-xl animate-fadeIn z-10 overflow-hidden">
            {/* 📌 Fixed Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur-md">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {activeTab === 'analytics' && (
                  <>
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span>Огляд Групи & Ризики</span>
                  </>
                )}
                {activeTab === 'coursemap' && (
                  <>
                    <Network className="w-4 h-4 text-indigo-400" />
                    <span>Педагогічний Пульт Модуля</span>
                  </>
                )}
                {activeTab === 'reviews' && (
                  <>
                    <ClipboardCheck className="w-4 h-4 text-amber-400" />
                    <span>Черга Перевірки ({reviewQueue.length})</span>
                  </>
                )}
                {activeTab === 'metrics-audit' && (
                  <>
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    <span>Аудит Метрик & Студенти</span>
                  </>
                )}
                {activeTab === 'settings' && (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Параметри Оцінювання</span>
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

            {/* 📜 Scrollable Drawer Body Content (Lists) */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {/* Drawer 1: Cohort Bloom Distribution & Live Risk Feed (Rule 7 Standard) */}
              {activeTab === 'analytics' && (
                <div className="flex flex-col gap-3">
                  {/* 📊 Section 1: Cohort Mastery Distribution (Bloom Tiers) */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setIsCohortDistributionOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 group-hover:text-purple-300 transition-colors">
                        <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Розподіл Групи (Блум)</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {students.length}
                        </span>
                      </span>
                      <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
                        {isCohortDistributionOpen ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                      </span>
                    </button>

                    {isCohortDistributionOpen && (
                      <div className="flex flex-col gap-2.5 animate-fadeIn">
                        {/* Progress Bar of Cohorts */}
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
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

                        {/* Interactive Filter Pills */}
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                          <button
                            onClick={() => setCohortFilter((prev) => (prev === 'mastery' ? 'all' : 'mastery'))}
                            className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                              cohortFilter === 'mastery'
                                ? 'bg-amber-500/20 border-amber-500/80 text-white shadow-sm'
                                : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400">
                              <span>🏆 Mastery</span>
                              <span className="font-mono font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                {cohortMasteryStudents.length}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">P(L) ≥ 0.90</span>
                          </button>

                          <button
                            onClick={() => setCohortFilter((prev) => (prev === 'proficient' ? 'all' : 'proficient'))}
                            className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                              cohortFilter === 'proficient'
                                ? 'bg-emerald-500/20 border-emerald-500/80 text-white shadow-sm'
                                : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400">
                              <span>🟢 Proficient</span>
                              <span className="font-mono font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                {cohortProficientStudents.length}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">0.75 - 0.89</span>
                          </button>

                          <button
                            onClick={() => setCohortFilter((prev) => (prev === 'basic' ? 'all' : 'basic'))}
                            className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                              cohortFilter === 'basic'
                                ? 'bg-blue-500/20 border-blue-500/80 text-white shadow-sm'
                                : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-semibold text-blue-400">
                              <span>🟡 Basic</span>
                              <span className="font-mono font-bold bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                                {cohortBasicStudents.length}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">0.50 - 0.74</span>
                          </button>

                          <button
                            onClick={() => setCohortFilter((prev) => (prev === 'at_risk' ? 'all' : 'at_risk'))}
                            className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                              cohortFilter === 'at_risk'
                                ? 'bg-rose-500/20 border-rose-500/80 text-white shadow-sm'
                                : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-semibold text-rose-400">
                              <span>🔴 At Risk</span>
                              <span className="font-mono font-bold bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                                {cohortAtRiskStudents.length}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">P(L) &lt; 0.50</span>
                          </button>
                        </div>

                        {cohortFilter !== 'all' && (
                          <button
                            onClick={() => setCohortFilter('all')}
                            className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors text-right pt-0.5 cursor-pointer underline"
                          >
                            ✕ Скинути фільтр групи
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 🚨 Section 2: Live Risk Feed (Anomalies & Wheel-Spinning) */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setIsRiskFeedOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Радар Ризиків & Аномалій</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {riskFeedStudents.length}
                        </span>
                      </span>
                      <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
                        {isRiskFeedOpen ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                      </span>
                    </button>

                    {isRiskFeedOpen && (
                      <div className="flex flex-col gap-2 animate-fadeIn">
                        {riskFeedStudents.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            ✓ Аномалій не зафіксовано. Усі метрики студентів у межах норми.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {riskFeedStudents.slice(0, 3).map((st) => {
                              const stId = st.id || st.studentId || st.email;
                              const isCopyPaste = (st.copyPasteRatio ?? 0) >= 0.60;
                              const isGuess = st.hasGuessAlert || (st.recentAdjustments?.some((a) => (a.pGuessUsed ?? 0) > 0.30) ?? false);
                              const isFatigue = (st.fatigueIndex ?? 0) >= 5;

                              return (
                                <div
                                  key={`risk-${stId}`}
                                  onClick={() => setSelectedStudentId(stId)}
                                  className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer flex flex-col gap-1.5 shadow-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white truncate max-w-[170px]">{st.name}</span>
                                    <span className="text-[10px] font-mono text-purple-300">
                                      {((st.averageMastery ?? 0) * 100).toFixed(0)}% P(L)
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {isCopyPaste && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                        <Copy className="w-2.5 h-2.5" />
                                        <span>Вставка {((st.copyPasteRatio ?? 0) * 100).toFixed(0)}%</span>
                                      </span>
                                    )}
                                    {isGuess && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                        <Activity className="w-2.5 h-2.5" />
                                        <span>P(G) Вгадування</span>
                                      </span>
                                    )}
                                    {isFatigue && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                        <Activity className="w-2.5 h-2.5" />
                                        <span>Втома F={st.fatigueIndex}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 🔍 Section 3: Filtered Students Roster */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setIsFilteredRosterOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 group-hover:text-indigo-300 transition-colors">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Список Учнів</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {filteredStudents.length}
                        </span>
                      </span>
                      <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
                        {isFilteredRosterOpen ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                      </span>
                    </button>

                    {isFilteredRosterOpen && (
                      <div className="flex flex-col gap-2 animate-fadeIn">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Пошук серед учнів..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 shadow-inner"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-0.5">
                          {filteredStudents.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
                              Учнів за обраним критерієм не знайдено
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
                                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                                    isSelected
                                      ? 'bg-purple-950/50 border-purple-500 shadow-sm ring-1 ring-purple-500/50 text-white'
                                      : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700 text-slate-300'
                                  }`}
                                >
                                  <div className="overflow-hidden">
                                    <div className="text-xs font-bold truncate flex items-center gap-1.5">
                                      <span>{st.name}</span>
                                      {isSelected && <span className="text-[10px] text-purple-400">●</span>}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate font-mono">{st.email}</div>
                                  </div>
                                  <div className="flex flex-col items-end shrink-0">
                                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                      {avgMastery}% P(L)
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                                      WPM: {st.wpm ?? st.avgWpm ?? 0}
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

              {/* Drawer 2: Pedagogical Control Panel (Rule 7 Standard) */}
              {activeTab === 'coursemap' && courseDetails && (
                <div className="flex flex-col gap-3">
                  {/* 1. 🏆 Section 1: Bloom Triad Coverage & Anti-Gaming Audit Widget */}
                  {(() => {
                    const currentSkill = courseDetails.skills?.find((s: any) => s.slug === (selectedSkillSlug || courseDetails.skills[0]?.slug)) || courseDetails.skills[0];
                    const skillTasks = allTasks.filter((t) => t.skillId === currentSkill?.id || t.skill?.id === currentSkill?.id);

                    // Compute unique topics and triad completeness
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
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setIsTriadAuditOpen((prev) => !prev)}
                          className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                        >
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 group-hover:text-purple-300 transition-colors">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>Аудит Балансу Тріад</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {currentSkill?.slug || 'all'}
                            </span>
                          </span>
                          <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
                            {isTriadAuditOpen ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                          </span>
                        </button>

                        {isTriadAuditOpen && (
                          <div className="flex flex-col gap-2.5 animate-fadeIn">
                            {/* Triad Completeness Gauge */}
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 text-[11px]">Повнота Тріад (3/3):</span>
                                <span className="font-mono font-bold text-emerald-400">
                                  {completeTriads} / {totalTopics} тем ({completePercent}%)
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all"
                                  style={{ width: `${completePercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Practical Code vs Diagnosis Ratio */}
                            <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px] font-mono">
                              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-0.5">
                                <span className="text-slate-500 text-[9px] uppercase">Практика (Код)</span>
                                <span className="text-emerald-400 font-bold text-xs">{codeTasks} завдань</span>
                              </div>
                              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-0.5">
                                <span className="text-slate-500 text-[9px] uppercase">Тести (Вибір)</span>
                                <span className="text-blue-400 font-bold text-xs">{quizTasks} завдань</span>
                              </div>
                            </div>

                            {/* Anti-gaming protection ratio */}
                            <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between text-[11px] font-mono">
                              <span className="text-slate-300 text-[10px] flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                                <span>Приховані тести (Secret):</span>
                              </span>
                              <span className="text-rose-300 font-bold">{secretTestsCount} задач</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 2. ⚡ Section 2: Cognitive Traps & Wheel-Spinning Radar */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setIsCognitiveTrapsOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                        <Activity className="w-3.5 h-3.5 text-amber-400" />
                        <span>Когнітивні Пастки Модуля</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          3 теми
                        </span>
                      </span>
                      <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
                        {isCognitiveTrapsOpen ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                      </span>
                    </button>

                    {isCognitiveTrapsOpen && (
                      <div className="flex flex-col gap-2 animate-fadeIn">
                        <div
                          onClick={() => {
                            const task = allTasks.find((t) => t.subConcept?.includes('dead-zone') || t.title.includes('Temporal Dead Zone'));
                            if (task) setSelectedTaskId(task.id);
                          }}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer flex flex-col gap-1 shadow-sm"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white truncate max-w-[170px]">Temporal Dead Zone (TDZ)</span>
                            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                              🔴 42% помилок
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Часте перемикання на EASY (70% бал)</span>
                        </div>

                        <div
                          onClick={() => {
                            const task = allTasks.find((t) => t.subConcept?.includes('coercion') || t.title.includes('приведення'));
                            if (task) setSelectedTaskId(task.id);
                          }}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer flex flex-col gap-1 shadow-sm"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white truncate max-w-[170px]">Strict Equality & Coercion</span>
                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              🟡 35% помилок
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Плутанина між == та === при об'єктах</span>
                        </div>

                        <div
                          onClick={() => {
                            const task = allTasks.find((t) => t.subConcept?.includes('closure') || t.title.includes('замикан'));
                            if (task) setSelectedTaskId(task.id);
                          }}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer flex flex-col gap-1 shadow-sm"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white truncate max-w-[170px]">Lexical Scope & Closures</span>
                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              🟡 28% помилок
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Збереження стану при декількох викликах</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. ⚙️ Section 3: BKT Adaptive Tuner & Thresholds */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setIsAdaptiveParamsOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 group-hover:text-indigo-300 transition-colors">
                        <Network className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Параметри Адаптації</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          3 пороги
                        </span>
                      </span>
                      <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
                        {isAdaptiveParamsOpen ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                      </span>
                    </button>

                    {isAdaptiveParamsOpen && (
                      <div className="flex flex-col gap-1.5 font-mono text-[11px] animate-fadeIn">
                        <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400">Розблокування DAG (Proficient):</span>
                          <span className="text-indigo-400 font-bold">P(L) ≥ 0.75</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400">Золота Майстерність (Mastery):</span>
                          <span className="text-emerald-400 font-bold">P(L) ≥ 0.90</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400">Штраф за легкий рівень (Cap):</span>
                          <span className="text-amber-400 font-bold">Max 70%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Drawer: Review Queue List (Rule 7 Standard) */}
              {activeTab === 'reviews' && (
                <div className="flex flex-col gap-3">
                  {/* Section 1: Режими Черги (Фільтрація) */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setIsReviewFilterOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                        <ClipboardCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Режим Черги</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {reviewFilterTab === 'pending' ? 'В черзі' : 'Архів'}
                        </span>
                      </span>
                      <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
                        {isReviewFilterOpen ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                      </span>
                    </button>

                    {isReviewFilterOpen && (
                      <div className="flex flex-col gap-2 animate-fadeIn">
                        {/* Review Queue Filter Tabs: Pending vs Reviewed Archive */}
                        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
                          <button
                            onClick={() => setReviewFilterTab('pending')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              reviewFilterTab === 'pending'
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            }`}
                          >
                            <span>⏳ В черзі</span>
                          </button>
                          <button
                            onClick={() => setReviewFilterTab('reviewed')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              reviewFilterTab === 'reviewed'
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            }`}
                          >
                            <span>✓ Перевірені</span>
                          </button>
                        </div>

                        <div className="text-[11px] text-slate-400 px-0.5">
                          {reviewFilterTab === 'pending'
                            ? 'Відповіді, що потрапили у «сіру зону» або вимагають верифікації викладачем:'
                            : 'Архів уже перевірених та оцінених викладачем відкритих робіт:'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Роботи Студентів для Оцінювання */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setIsReviewItemsOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 group-hover:text-purple-300 transition-colors">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        <span>Роботи Студентів</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {reviewQueue.length}
                        </span>
                      </span>
                      <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
                        {isReviewItemsOpen ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                      </span>
                    </button>

                    {isReviewItemsOpen && (
                      <div className="flex flex-col gap-2 animate-fadeIn">
                        {reviewQueue.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            {reviewFilterTab === 'pending'
                              ? 'Черга перевірки порожня. Усі відкриті відповіді оцінені.'
                              : 'Немає перевірених робіт в архіві.'}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {reviewQueue.map((item) => {
                              const isSelected = selectedReviewId === item.submissionId;
                              const isApproved = item.teacherReviewStatus === 'APPROVED';
                              const isRejected = item.teacherReviewStatus === 'REJECTED';

                              return (
                                <div
                                  key={item.submissionId}
                                  onClick={() => setSelectedReviewId(item.submissionId)}
                                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                                    isSelected
                                      ? isApproved
                                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                                        : isRejected
                                        ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/50 ring-1 ring-rose-500/50'
                                        : 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/50 ring-1 ring-amber-500/50'
                                      : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white truncate">{item.studentName}</span>
                                    <div className="flex items-center gap-1">
                                      {(item.attemptNumber || (item.attemptsHistory && item.attemptsHistory.length > 1)) && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                                          Спроба {item.attemptNumber || item.attemptsHistory?.length}
                                        </span>
                                      )}
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                        isApproved
                                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                          : isRejected
                                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                      }`}>
                                        {isApproved
                                          ? '✓ Затверджено'
                                          : isRejected
                                          ? '✕ Відхилено'
                                          : 'В черзі'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-[11px] text-slate-300 font-semibold truncate">{item.taskTitle}</div>
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
                    )}
                  </div>
                </div>
              )}

              {/* Drawer: Metrics Audit - Clean minimalist sections with +/- collapse toggles */}
              {activeTab === 'metrics-audit' && (
                <div className="flex flex-col gap-4">
                  {/* SECTION 1: Загальні системні інструменти (Не прив'язані до студента) */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setIsGeneralToolsOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 group-hover:text-cyan-300 transition-colors">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Загальні інструменти</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">3</span>
                      </span>
                      <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
                        {isGeneralToolsOpen ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                      </span>
                    </button>

                    {isGeneralToolsOpen && (
                      <div className="flex flex-col gap-2 animate-fadeIn">
                        {/* Quick-Access to Mechanisms Catalog */}
                        <button
                          onClick={() => {
                            setAuditSubTab('mechanisms');
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                            auditSubTab === 'mechanisms'
                              ? 'bg-amber-950/60 border-amber-500 text-white shadow-amber-950/40 ring-1 ring-amber-500/50'
                              : 'bg-slate-950/80 border-slate-800/80 hover:border-amber-500/40 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                              <Compass className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                <span>Реєстр Механізмів</span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  4-in-1
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                Спрощення, підказки, телеметрія
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] text-amber-400 font-bold shrink-0">➔</span>
                        </button>

                        {/* Quick-Access to Gold Standard Matrix */}
                        <button
                          onClick={() => {
                            setAuditSubTab('test-matrix');
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                            auditSubTab === 'test-matrix'
                              ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                              : 'bg-slate-950/80 border-slate-800/80 hover:border-emerald-500/40 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                <span>Еталонна Матриця</span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  6/6 PASS
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                Автоматична верифікація правил
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-bold shrink-0">➔</span>
                        </button>

                        {/* Quick-Access to What-If Sandbox */}
                        <button
                          onClick={() => {
                            setAuditSubTab('what-if');
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                            auditSubTab === 'what-if'
                              ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                              : 'bg-slate-950/80 border-slate-800/80 hover:border-indigo-500/40 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                <span>Пісочниця "What-If"</span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                Інтерактивний тренажер параметрів
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] text-indigo-400 font-bold shrink-0">➔</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SECTION 2: Персональний аудит конкретного студента */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setIsStudentsListOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-400 group-hover:text-purple-300 transition-colors">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        <span>Студенти для аудиту</span>
                        <span className="font-mono text-[9px] text-slate-400 font-normal px-1.5 py-0.2 rounded bg-purple-500/10 border border-purple-500/20">
                          {students.length}
                        </span>
                      </div>
                      <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
                        {isStudentsListOpen ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                      </span>
                    </button>

                    {isStudentsListOpen && (
                      <div className="flex flex-col gap-1.5 max-h-[calc(100vh-380px)] overflow-y-auto pr-1 animate-fadeIn">
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
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                isSelected && auditSubTab === 'live-log'
                                  ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/50 text-white'
                                  : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700 text-slate-300'
                              }`}
                            >
                              <div className="overflow-hidden">
                                <div className="text-xs font-bold truncate flex items-center gap-1.5">
                                  <span>{st.name}</span>
                                  {isSelected && auditSubTab === 'live-log' && <span className="text-[10px] text-purple-400">●</span>}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate font-mono">{st.email}</div>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {avgMastery}% P(L)
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
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

              {/* Drawer 3: Settings (Rule 7 Standard) */}
              {activeTab === 'settings' && (
                <div className="flex flex-col gap-3 text-xs text-slate-300">
                  {/* Section 1: Пороги Майстерності */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setIsBktThresholdsOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Поріг Майстерності BKT</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          P(L) ≥ 0.95
                        </span>
                      </span>
                      <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
                        {isBktThresholdsOpen ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                      </span>
                    </button>

                    {isBktThresholdsOpen && (
                      <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl animate-fadeIn">
                        <span className="font-bold text-white block mb-1">Поточний поріг переходу між модулями</span>
                        <p className="text-[11px] text-slate-400">P(L) ≥ 0.95 відкриває залежні вершини графа навичок</p>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Штрафи за Вгадування */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setIsGuessPenaltiesOpen((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 group-hover:text-purple-300 transition-colors">
                        <Activity className="w-3.5 h-3.5 text-purple-400" />
                        <span>Штраф за Згадування</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          P(G)
                        </span>
                      </span>
                      <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
                        {isGuessPenaltiesOpen ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                      </span>
                    </button>

                    {isGuessPenaltiesOpen && (
                      <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl animate-fadeIn">
                        <span className="font-bold text-white block mb-1">Динамічне підвищення P(G)</span>
                        <p className="text-[11px] text-slate-400">При швидкості відповіді &lt; 2.0 сек активується захист від випадкового вгадування</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* 💻 Center Main Canvas: Detailed Inspector View */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto flex flex-col gap-6 bg-slate-950">
          {/* Main View 1: Student Detailed Analytics & Heatmap */}
          {activeTab === 'analytics' && selectedStudent && (
            <div className="flex flex-col gap-6">
              {/* Student Header Summary Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg font-bold">
                    {selectedStudent.name ? selectedStudent.name.charAt(0) : 'S'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{selectedStudent.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/10 text-purple-300 rounded border border-purple-500/20">
                        {selectedStudent.email}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Курс: <span className="text-slate-200 font-semibold">{activeCourse.title}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Mode Toggle: Metrics Heatmap vs RPG Skill Tree */}
                  <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
                    <button
                      onClick={() => setActiveStudentView('metrics')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeStudentView === 'metrics'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Аналітика</span>
                    </button>
                    <button
                      onClick={() => setActiveStudentView('tree')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeStudentView === 'tree'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Дерево Знань Студента</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleResetStudent(selectedStudent.id || selectedStudent.studentId || selectedStudent.email)}
                    className="px-3 py-2 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 transition-all text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Скинути BKT Прогрес</span>
                  </button>
                </div>
              </div>

              {/* 🌟 Dynamic View Mode: RPG Game Skill Tree vs Traditional Metrics */}
              {activeStudentView === 'tree' ? (
                <div className="w-full h-[680px] rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
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
              ) : (
                <>
                  {/* Compact Student Metrics Grid with Icons & Metric Explanations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Metric 1: P(L) Mastery */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between gap-2 shadow-md relative group">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 leading-tight">Середня Майстерність P(L)</span>
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <div className="text-xl font-bold text-emerald-400 font-mono">
                      {selectedStudent.averageMastery !== undefined ? `${(selectedStudent.averageMastery * 100).toFixed(1)}%` : '0.0%'}
                    </div>
                    <button
                      onClick={() => setMetricModal('bkt')}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline flex items-center gap-0.5"
                    >
                      <Info className="w-3 h-3" />
                      <span>Формула ➔</span>
                    </button>
                  </div>
                </div>

                {/* Metric 2: WPM (Course Median) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between gap-2 shadow-md relative group">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 leading-tight">Медіана WPM (Курс)</span>
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                      <Keyboard className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <div className="text-xl font-bold text-indigo-400 font-mono">
                      {selectedStudent.wpm ?? selectedStudent.avgWpm ?? 0} <span className="text-[10px] font-normal text-slate-400">WPM</span>
                    </div>
                    <button
                      onClick={() => setMetricModal('wpm')}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline flex items-center gap-0.5"
                    >
                      <Info className="w-3 h-3" />
                      <span>Розрахунок ➔</span>
                    </button>
                  </div>
                </div>

                {/* Metric 3: Copy-Paste Ratio (Course Median & Peak Anomaly) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between gap-2 shadow-md relative group">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 leading-tight">Медіана Copy-Paste (Курс)</span>
                      {selectedStudent.peakAnomaly?.hasAnomaly && (
                        <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30 mt-1 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                          <span>Пік: {selectedStudent.peakAnomaly.peakSkillTitle || selectedStudent.peakAnomaly.peakSkillSlug} ({(selectedStudent.peakAnomaly.copyPasteRatio * 100).toFixed(0)}%)</span>
                        </span>
                      )}
                    </div>
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      <Copy className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <div className="text-xl font-bold text-amber-400 font-mono">
                      {selectedStudent.copyPasteRatio !== undefined ? `${(selectedStudent.copyPasteRatio * 100).toFixed(0)}%` : '0%'}
                    </div>
                    <button
                      onClick={() => setMetricModal('copypaste')}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline flex items-center gap-0.5"
                    >
                      <Info className="w-3 h-3" />
                      <span>Аналіз ➔</span>
                    </button>
                  </div>
                </div>

                {/* Metric 4: Fatigue Index (Course Median) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between gap-2 shadow-md relative group">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 leading-tight">Медіана Втоми (Курс)</span>
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <div className="text-xl font-bold text-purple-400 font-mono">
                      {selectedStudent.fatigueIndex ?? 0}
                    </div>
                    <button
                      onClick={() => setMetricModal('fatigue')}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline flex items-center gap-0.5"
                    >
                      <Info className="w-3 h-3" />
                      <span>Пояснення ➔</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Behavioral Telemetry & Anomaly Tree (Teacher Only) */}
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

              {/* Compact BKT Skill Mastery Heatmap Table with Per-Module Telemetry */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>BKT Mastery Breakdown & Модульна Телеметрія</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
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
                        className={`p-2.5 bg-slate-950 border rounded-lg flex flex-col gap-1.5 transition-all ${
                          isPeakAnomaly
                            ? 'border-red-500/60 bg-red-950/20 shadow-md shadow-red-950/30'
                            : 'border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-300 font-bold uppercase truncate flex items-center gap-1">
                            <span>{slug}</span>
                            {isPeakAnomaly && (
                              <span className="text-[8px] font-bold text-red-400 bg-red-500/20 px-1 rounded border border-red-500/30">
                                ⚠️ Списування
                              </span>
                            )}
                          </span>
                          <span className={`font-mono font-bold text-xs ${isMastered ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {(p * 100).toFixed(1)}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-500 ${isMastered ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            style={{ width: `${Math.min(100, p * 100)}%` }}
                          />
                        </div>

                        {/* Per-Module Telemetry Badge */}
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5 border-t border-slate-800/50 mt-0.5">
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
            />
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
        </main>
      </div>

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
    </div>
  );
}

