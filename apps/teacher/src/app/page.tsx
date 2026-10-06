'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Network, Users, BarChart3, ArrowLeft, Code2, BookOpen, Scale } from 'lucide-react';
import { StudentAnalyticsTable } from '../features/analytics/ui/StudentAnalyticsTable';
import { StudentAnalyticsItem } from '../features/analytics/model/analytics.types';

const COURSES = [
  { slug: 'js-dev', title: 'JavaScript & Web Dev', icon: Code2, skillSlugs: ['js-basics', 'js-functions', 'js-collections', 'js-async', 'js-oop'] },
  { slug: 'english-b2', title: 'Business English (B2)', icon: BookOpen, skillSlugs: ['eng-grammar', 'eng-vocab', 'eng-writing'] },
  { slug: 'ukraine-law', title: 'Правознавство України', icon: Scale, skillSlugs: ['law-basics', 'law-constitutional', 'law-case-analysis'] },
];

export default function TeacherDashboardPage() {
  const [activeCourseSlug, setActiveCourseSlug] = useState<string>('js-dev');
  const [students, setStudents] = useState<StudentAnalyticsItem[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

  const activeCourse = COURSES.find((c) => c.slug === activeCourseSlug) || COURSES[0];

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto flex flex-col gap-6 font-sans">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>Smart-BKT-Chain Teacher Portal</span>
            </h1>
            <p className="text-sm text-slate-400">
              Кабінет викладача: мультидисциплінарна аналітика BKT студентів, жива телеметрія та Heatmap
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3004"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all"
          >
            <span>Панель Адміністратора (CMS DAG)</span>
          </a>

          <a
            href="http://localhost:3002"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Кабінет Студента</span>
          </a>
        </div>
      </header>

      {/* Course Switcher Filter */}
      <div className="flex items-center gap-3 bg-slate-900/90 p-2 border border-slate-800 rounded-2xl overflow-x-auto shadow-lg">
        {COURSES.map((course) => {
          const Icon = course.icon;
          const isActive = activeCourseSlug === course.slug;
          return (
            <button
              key={course.slug}
              onClick={() => setActiveCourseSlug(course.slug)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{course.title}</span>
            </button>
          );
        })}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <Network className="w-8 h-8 text-indigo-400" />
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Навчальні Модулі Курсу</span>
            <h3 className="text-2xl font-bold text-white">{activeCourse.skillSlugs.length} Модулів (DAG)</h3>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <Users className="w-8 h-8 text-emerald-400" />
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Активні Студенти</span>
            <h3 className="text-2xl font-bold text-white">{students.length} Студенти</h3>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-amber-400" />
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Середня Майстерність P(L)</span>
            <h3 className="text-2xl font-bold text-white">
              {students.length > 0 && students[0].averageMastery !== undefined
                ? `${(students[0].averageMastery * 100).toFixed(1)}%`
                : '0.0%'}
            </h3>
          </div>
        </div>
      </div>

      {/* 📊 Student Analytics & BKT Heatmap */}
      <StudentAnalyticsTable
        students={students}
        skillSlugs={activeCourse.skillSlugs}
        onResetStudent={handleResetStudent}
      />
    </main>
  );
}
