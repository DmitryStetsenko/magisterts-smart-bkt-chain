'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Network, Users, BarChart3, ArrowLeft, Code2, BookOpen, Scale, ChevronDown } from 'lucide-react';
import { StudentAnalyticsTable } from '../features/analytics/ui/StudentAnalyticsTable';
import { StudentAnalyticsItem } from '../features/analytics/model/analytics.types';
import { CourseOverviewWidget } from '../features/course-map/ui/CourseOverviewWidget';

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
  const [activeCourseSlug, setActiveCourseSlug] = useState<string>('js-dev');
  const [students, setStudents] = useState<StudentAnalyticsItem[]>([]);

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
            if (!mapped.some((c) => c.slug === activeCourseSlug)) {
              setActiveCourseSlug(mapped[0].slug);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    fetchCourses();
  }, []);

  const fetchStudentAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/bkt/analytics/students?courseSlug=${activeCourseSlug}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setStudents(data);
        }
      }
    } catch (err) {
      console.error('Error fetching live student analytics:', err);
    }
  };

  useEffect(() => {
    fetchStudentAnalytics();
  }, [activeCourseSlug]);

  const handleResetStudent = () => {
    fetchStudentAnalytics();
  };

  const [activeDrawer, setActiveDrawer] = useState<'analytics' | 'coursemap' | 'settings' | null>('analytics');

  const toggleDrawer = (tab: 'analytics' | 'coursemap' | 'settings') => {
    setActiveDrawer((prev) => (prev === tab ? null : tab));
  };

  const activeCourse = courses.find((c) => c.slug === activeCourseSlug) || courses[0] || DEFAULT_COURSES[0];

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

        {/* Top Controls: Course Filter Selector & Profile */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px] sm:min-w-[280px]">
            <select
              id="teacher-course-select"
              value={activeCourseSlug}
              onChange={(e) => setActiveCourseSlug(e.target.value)}
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
          {/* Main Action Tabs */}
          <button
            onClick={() => toggleDrawer('analytics')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeDrawer === 'analytics'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Аналітика та BKT Heatmap"
          >
            <BarChart3 className="w-5 h-5" />
            {activeDrawer === 'analytics' && <span className="absolute -left-1 w-1 h-5 bg-purple-400 rounded-r-full"></span>}
          </button>

          <button
            onClick={() => toggleDrawer('coursemap')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeDrawer === 'coursemap'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Інспекція Курсу та Завдань"
          >
            <Network className="w-5 h-5" />
            {activeDrawer === 'coursemap' && <span className="absolute -left-1 w-1 h-5 bg-purple-400 rounded-r-full"></span>}
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
              onClick={() => toggleDrawer('settings')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeDrawer === 'settings'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Налаштування"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>
          </div>
        </nav>

        {/* 📂 Expandable Side Drawer Panel */}
        {activeDrawer && (
          <aside className="w-full sm:w-[380px] lg:w-[440px] bg-slate-900/95 border-r border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto shrink-0 shadow-2xl backdrop-blur-xl animate-fadeIn z-10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {activeDrawer === 'analytics' && (
                  <>
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span>Показники BKT Курсу</span>
                  </>
                )}
                {activeDrawer === 'coursemap' && (
                  <>
                    <Network className="w-4 h-4 text-indigo-400" />
                    <span>Інспекція Графа Навичок</span>
                  </>
                )}
                {activeDrawer === 'settings' && (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Параметри Оцінювання</span>
                  </>
                )}
              </h2>
              <button
                onClick={() => setActiveDrawer(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                title="Закрити панель"
              >
                ✕
              </button>
            </div>

            {/* Metrics Breakdown */}
            {activeDrawer === 'analytics' && (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                  <Network className="w-6 h-6 text-indigo-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Модулів Курсу</span>
                    <h3 className="text-lg font-bold text-white">{activeCourse.skillSlugs.length} Модулів (DAG)</h3>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                  <Users className="w-6 h-6 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Активні Студенти</span>
                    <h3 className="text-lg font-bold text-white">{students.length} Студенти</h3>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Середня Майстерність P(L)</span>
                    <h3 className="text-lg font-bold text-white">
                      {students.length > 0 && students[0].averageMastery !== undefined
                        ? `${(students[0].averageMastery * 100).toFixed(1)}%`
                        : '0.0%'}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {activeDrawer === 'coursemap' && (
              <div className="flex flex-col gap-4">
                <CourseOverviewWidget courseSlug={activeCourseSlug} />
              </div>
            )}

            {activeDrawer === 'settings' && (
              <div className="flex flex-col gap-3 text-xs text-slate-300">
                <p>Налаштування порогів оновлення BKT та алгоритму секвенвування.</p>
              </div>
            )}
          </aside>
        )}

        {/* 💻 Center Main Canvas: Student Analytics Table & Heatmap */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto flex flex-col gap-6 bg-slate-950">
          <StudentAnalyticsTable
            students={students}
            skillSlugs={activeCourse.skillSlugs}
            onResetStudent={handleResetStudent}
          />
        </main>
      </div>
    </div>
  );
}
