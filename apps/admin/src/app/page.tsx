'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Network, 
  BookOpen, 
  Settings, 
  ArrowRight,
  Database,
  Download,
  Filter,
  Sparkles,
  Plus,
  PlusCircle,
  Search,
  Layers,
  CheckCircle2,
  Activity,
  Users,
  Edit2,
  Folder,
  Code,
  Languages,
  Scale,
  Binary,
  ArrowLeft,
  Target,
  ExternalLink,
  FlaskConical,
} from 'lucide-react';
import { AppShellLayout, Breadcrumbs, UserProfileDrawer, DrawerSection } from '@sbc/ui';
import { getAppBaseUrl } from '@sbc/routes';
import type { CourseDto, CourseCategoryDto, CourseModuleDto } from '@sbc/types';
import { CourseManager } from '../features/course-manager/ui/CourseManager';
import { CourseCreateView } from '../features/course-manager/ui/CourseCreateView';
import { CourseStudioView } from '../features/course-manager/ui/CourseStudioView';
import { TheoryLessonBuilderView } from '../features/course-manager/ui/TheoryLessonBuilderView';
import { DatasetExportCenter, DatasetStats } from '../features/dataset-export/ui/DatasetExportCenter';
import { BktAuditVerifierCenter } from '../features/verifier/ui/BktAuditVerifierCenter';
import { UserManagementCenter } from '../features/users/ui/UserManagementCenter';

interface CoursePresetItem {
  id: string;
  presetTitle: string;
  title: string;
  slug: string;
  categorySlug: string;
  targetAudience: string;
  defaultMasteryThreshold: number;
  description: string;
  icon: any;
  color: 'emerald' | 'amber' | 'purple' | 'indigo';
  badge: string;
}

const COURSE_PRESETS: CoursePresetItem[] = [
  {
    id: 'it-frontend',
    presetTitle: 'Веб-розробка (Frontend / Fullstack)',
    title: 'Сучасна веб-розробка та веб-інтерфейси',
    slug: 'web-engineering-frontend',
    categorySlug: 'prog-it',
    targetAudience: '10–11 класи, Студенти IT-спеціальностей',
    defaultMasteryThreshold: 0.85,
    description: 'Практичний курс: семантична розмітка HTML5, стилізація CSS Flex/Grid, динамічний JavaScript та робота з DOM.',
    icon: Code,
    color: 'emerald',
    badge: 'P(L) ≥ 0.85 • IT',
  },
  {
    id: 'stem-math',
    presetTitle: 'Точні Науки & Математика (STEM)',
    title: 'Дискретна математика та основи алгоритмізації',
    slug: 'discrete-math-algorithms',
    categorySlug: 'exact-sciences',
    targetAudience: 'Студенти 1–2 курсів ВНЗ, Профільні STEM-ліцеї',
    defaultMasteryThreshold: 0.90,
    description: 'Фундаментальний курс: теорія графів, комбінаторика, булева алгебра та базові алгоритми з підвищеним порогом BKT.',
    icon: Binary,
    color: 'amber',
    badge: 'P(L) ≥ 0.90 • STEM',
  },
  {
    id: 'law-civics',
    presetTitle: 'Право & Цифрова Безпека',
    title: 'Основи правознавства та цифрове право',
    slug: 'digital-law-civics',
    categorySlug: 'law-social',
    targetAudience: 'Старшокласники, Громадянська освіта, Студенти',
    defaultMasteryThreshold: 0.85,
    description: 'Конституційні засади правової держави, захист цифрових прав, інтелектуальна власність та захист даних.',
    icon: Scale,
    color: 'purple',
    badge: 'P(L) ≥ 0.85 • Право',
  },
  {
    id: 'languages-english',
    presetTitle: 'Ділова & Технічна Англійська',
    title: 'Business & Tech English (B2)',
    slug: 'business-tech-english',
    categorySlug: 'languages',
    targetAudience: 'IT-фахівці, Студенти міжнародних програм',
    defaultMasteryThreshold: 0.80,
    description: 'Професійна комунікація для технічних фахівців: технічна документація, ділове листування та підготовка до технічних інтервʼю.',
    icon: Languages,
    color: 'indigo',
    badge: 'P(L) ≥ 0.80 • B2',
  },
];

export default function AdminCMSDashboard() {
  type AdminTab = 'courses' | 'create_course' | 'users' | 'datasets' | 'verifier' | 'system';
  type CourseViewMode = 'LIST' | 'CREATE' | 'STUDIO' | 'THEORY';

  const [activeTab, setActiveTab] = useState<AdminTab>('courses');
  const [courseViewMode, setCourseViewMode] = useState<CourseViewMode>('LIST');
  const [selectedStudioCourse, setSelectedStudioCourse] = useState<CourseDto | null>(null);
  const [selectedTheoryModule, setSelectedTheoryModule] = useState<CourseModuleDto | null>(null);
  const [studioSubTab, setStudioSubTab] = useState<'CURRICULUM' | 'SETTINGS'>('CURRICULUM');

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);

  const [authorStep, setAuthorStep] = useState<number>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(1);

  // Search & Filter state for Drawer Sections
  const [datasetFilter, setDatasetFilter] = useState<'ALL' | 'SUBMISSIONS' | 'HINTS' | 'THEORY' | 'ANNULMENTS' | 'RESETS'>('ALL');
  const [datasetUserFilter, setDatasetUserFilter] = useState<string>('');
  const [datasetActiveUsers, setDatasetActiveUsers] = useState<{ userId: string; name: string; email?: string; count: number; role?: string }[]>([]);
  const [datasetStats, setDatasetStats] = useState<DatasetStats>({
    total: 0,
    submissions: 0,
    annulled: 0,
    hints: 0,
    theory: 0,
    resets: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Dynamic courses and categories state for Admin sidebar & filtering
  const [dynamicCourses, setDynamicCourses] = useState<CourseDto[]>([]);
  const [categories, setCategories] = useState<CourseCategoryDto[]>([]);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [courseStatusFilter, setCourseStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  const updateBrowserUrl = (params: { tab?: AdminTab; mode?: CourseViewMode; courseSlug?: string; moduleSlug?: string }) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (params.tab) url.searchParams.set('tab', params.tab);
    if (params.mode) {
      if (params.mode === 'LIST') {
        url.searchParams.delete('mode');
        url.searchParams.delete('course');
        url.searchParams.delete('module');
      } else if (params.mode === 'CREATE') {
        url.searchParams.set('mode', 'create');
        url.searchParams.delete('course');
        url.searchParams.delete('module');
      } else if (params.mode === 'STUDIO') {
        url.searchParams.set('mode', 'studio');
        if (params.courseSlug) url.searchParams.set('course', params.courseSlug);
        url.searchParams.delete('module');
      } else if (params.mode === 'THEORY') {
        url.searchParams.set('mode', 'theory');
        if (params.courseSlug) url.searchParams.set('course', params.courseSlug);
        if (params.moduleSlug) url.searchParams.set('module', params.moduleSlug);
      }
    }
    window.history.pushState(null, '', url.pathname + url.search);
  };

  const loadCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/courses?status=ALL`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setDynamicCourses(data);
        else if (data.courses) setDynamicCourses(data.courses);
      }
    } catch (e) {
      console.error('Failed to load courses for Admin sidebar:', e);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/categories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCategories(data);
      }
    } catch (e) {
      console.error('Failed to load categories for Admin sidebar:', e);
    }
  };

  useEffect(() => {
    loadCourses();
    loadCategories();
  }, [API_URL]);

  // Handle browser back/forward and initial URL parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleUrlSync = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AdminTab;
      const modeParam = params.get('mode');
      const courseParam = params.get('course');
      const moduleParam = params.get('module');

      if (tabParam && ['courses', 'create_course', 'users', 'datasets', 'verifier', 'system'].includes(tabParam)) {
        setActiveTab(tabParam);
      }

      if (tabParam === 'create_course' || modeParam === 'create') {
        setActiveTab('create_course');
        if (modeParam === 'theory' && courseParam && moduleParam) {
          const matchCourse = dynamicCourses.find((c) => c.slug === courseParam || c.id === courseParam);
          if (matchCourse) {
            setSelectedStudioCourse(matchCourse);
            const matchMod = (matchCourse.modules || []).find((m) => m.slug === moduleParam || m.id === moduleParam);
            if (matchMod) {
              setSelectedTheoryModule(matchMod);
              setCourseViewMode('THEORY');
            }
          }
        } else if (modeParam === 'studio' && courseParam) {
          setCourseViewMode('STUDIO');
          setSelectedStudioCourse((currentSelected) => {
            if (currentSelected && (currentSelected.slug === courseParam || currentSelected.id === courseParam)) {
              return currentSelected;
            }
            const matchCourse = dynamicCourses.find((c) => c.slug === courseParam || c.id === courseParam);
            if (matchCourse) {
              setSelectedTheoryModule(null);
              return matchCourse;
            }
            fetch(`${API_URL}/api/v1/courses/${courseParam}`)
              .then((res) => (res.ok ? res.json() : null))
              .then((fetched) => {
                if (fetched) {
                  setSelectedStudioCourse(fetched);
                  setSelectedTheoryModule(null);
                  setCourseViewMode('STUDIO');
                }
              })
              .catch(() => {});
            return currentSelected;
          });
        } else {
          setCourseViewMode('CREATE');
          setSelectedStudioCourse(null);
          setSelectedTheoryModule(null);
        }
      } else if (modeParam === 'theory' && courseParam && moduleParam) {
        const matchCourse = dynamicCourses.find((c) => c.slug === courseParam || c.id === courseParam);
        if (matchCourse) {
          setSelectedStudioCourse(matchCourse);
          const matchMod = (matchCourse.modules || []).find((m) => m.slug === moduleParam || m.id === moduleParam);
          if (matchMod) {
            setSelectedTheoryModule(matchMod);
            setCourseViewMode('THEORY');
          }
        }
      } else if (modeParam === 'studio' && courseParam) {
        setCourseViewMode('STUDIO');
        setSelectedStudioCourse((currentSelected) => {
          if (currentSelected && (currentSelected.slug === courseParam || currentSelected.id === courseParam)) {
            return currentSelected;
          }
          const matchCourse = dynamicCourses.find((c) => c.slug === courseParam || c.id === courseParam);
          if (matchCourse) {
            setSelectedTheoryModule(null);
            return matchCourse;
          }
          fetch(`${API_URL}/api/v1/courses/${courseParam}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((fetched) => {
              if (fetched) {
                setSelectedStudioCourse(fetched);
                setSelectedTheoryModule(null);
                setCourseViewMode('STUDIO');
              }
            })
            .catch(() => {});
          return currentSelected;
        });
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    return () => window.removeEventListener('popstate', handleUrlSync);
  }, [dynamicCourses]);

  const handleTabClick = (tabId: string) => {
    if (tabId === 'create_course') {
      if (activeTab === 'create_course') {
        setIsDrawerOpen((prev) => !prev);
      } else {
        setActiveTab('create_course');
        setCourseViewMode('CREATE');
        setSelectedStudioCourse(null);
        setSelectedTheoryModule(null);
        setAuthorStep(1);
        setMaxUnlockedStep(1);
        setIsDrawerOpen(true);
        updateBrowserUrl({ tab: 'create_course', mode: 'CREATE' });
      }
      return;
    }

    if (tabId === 'courses') {
      if (activeTab === 'courses' && courseViewMode === 'LIST') {
        setIsDrawerOpen((prev) => !prev);
      } else {
        setActiveTab('courses');
        setCourseViewMode('LIST');
        setSelectedStudioCourse(null);
        setSelectedTheoryModule(null);
        setAuthorStep(1);
        setMaxUnlockedStep(1);
        setIsDrawerOpen(true);
        updateBrowserUrl({ tab: 'courses', mode: 'LIST' });
      }
      return;
    }

    const tab = tabId as AdminTab;
    if (activeTab === tab) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setActiveTab(tab);
      setIsDrawerOpen(true);
      updateBrowserUrl({ tab });
    }
  };

  const handleOpenStudio = (
    course: CourseDto,
    initialTab: 'CURRICULUM' | 'SETTINGS' = 'CURRICULUM',
    initialStep?: number,
    targetTab?: 'courses' | 'create_course'
  ) => {
    setSelectedStudioCourse(course);
    setSelectedTheoryModule(null);
    setStudioSubTab(initialTab);
    const hasModules = (course.modules?.length ?? 0) > 0;
    const initialMax = hasModules ? 5 : 2;
    setMaxUnlockedStep(initialMax);
    setAuthorStep(initialStep ?? (initialTab === 'SETTINGS' ? 1 : 2));
    setCourseViewMode('STUDIO');
    const destTab = targetTab || (activeTab === 'create_course' ? 'create_course' : 'courses');
    setActiveTab(destTab);
    updateBrowserUrl({ tab: destTab, mode: 'STUDIO', courseSlug: course.slug });
  };

  const handleStepClick = (stepNum: number) => {
    if (stepNum > maxUnlockedStep) return;
    setAuthorStep(stepNum);
    if (stepNum === 1) {
      setStudioSubTab('SETTINGS');
    } else {
      setStudioSubTab('CURRICULUM');
      if (stepNum === 3) {
        setTimeout(() => window.dispatchEvent(new CustomEvent('admin-studio-focus-skills')), 50);
      } else if (stepNum === 4) {
        if (selectedStudioCourse?.modules && selectedStudioCourse.modules.length > 0) {
          handleOpenTheory(selectedStudioCourse, selectedStudioCourse.modules[0]);
        } else {
          setTimeout(() => window.dispatchEvent(new CustomEvent('admin-studio-open-create-module')), 50);
        }
      } else if (stepNum === 5) {
        setTimeout(() => window.dispatchEvent(new CustomEvent('admin-studio-open-test-module')), 50);
      }
    }
  };

  const handleAdvanceStep = (nextStep: number) => {
    setMaxUnlockedStep((prev) => Math.max(prev, nextStep));
    handleStepClick(nextStep);
  };

  const handleOpenTheory = (
    course: CourseDto,
    module: CourseModuleDto,
    targetTab?: 'courses' | 'create_course'
  ) => {
    setSelectedStudioCourse(course);
    setSelectedTheoryModule(module);
    setCourseViewMode('THEORY');
    const destTab = targetTab || (activeTab === 'create_course' ? 'create_course' : 'courses');
    setActiveTab(destTab);
    updateBrowserUrl({ tab: destTab, mode: 'THEORY', courseSlug: course.slug, moduleSlug: module.slug });
  };

  const handleBackToStudio = () => {
    setCourseViewMode('STUDIO');
    setSelectedTheoryModule(null);
    const destTab = activeTab === 'create_course' ? 'create_course' : 'courses';
    setActiveTab(destTab);
    updateBrowserUrl({ tab: destTab, mode: 'STUDIO', courseSlug: selectedStudioCourse?.slug });
  };

  const handleBackToCoursesList = () => {
    setCourseViewMode('LIST');
    setActiveTab('courses');
    setSelectedStudioCourse(null);
    setSelectedTheoryModule(null);
    setStudioSubTab('CURRICULUM');
    setAuthorStep(1);
    setMaxUnlockedStep(1);
    updateBrowserUrl({ tab: 'courses', mode: 'LIST' });
    loadCourses();
  };

  const getDrawerConfig = () => {
    let title: React.ReactNode = 'Навігація';
    let icon = BookOpen;
    let iconColor = 'text-emerald-400';

    if (activeTab === 'create_course') {
      if (courseViewMode === 'THEORY' && selectedStudioCourse && selectedTheoryModule) {
        title = 'Конструктор Теорії';
        icon = BookOpen;
        iconColor = 'text-emerald-400';
      } else if (courseViewMode === 'STUDIO' && selectedStudioCourse) {
        title = 'Майстер створення курсу';
        icon = Layers;
        iconColor = 'text-emerald-400';
      } else {
        title = 'Створення Курсу';
        icon = PlusCircle;
        iconColor = 'text-emerald-400';
      }
    } else if (activeTab === 'courses') {
      if (courseViewMode === 'THEORY' && selectedStudioCourse && selectedTheoryModule) {
        title = 'Конструктор Теорії';
        icon = BookOpen;
        iconColor = 'text-emerald-400';
      } else if (courseViewMode === 'STUDIO' && selectedStudioCourse) {
        title = 'Навігатор курсу';
        icon = Layers;
        iconColor = 'text-emerald-400';
      } else if (courseViewMode === 'CREATE') {
        title = 'Створення Курсу';
        icon = PlusCircle;
        iconColor = 'text-emerald-400';
      } else {
        title = 'Каталог Курсів & Завдань';
        icon = BookOpen;
        iconColor = 'text-emerald-400';
      }
    } else if (activeTab === 'users') {
      title = 'Керування Користувачами';
      icon = Users;
      iconColor = 'text-emerald-400';
    } else if (activeTab === 'datasets') {
      title = 'Аудит & ШІ Датасети';
      icon = Database;
      iconColor = 'text-emerald-400';
    } else if (activeTab === 'verifier') {
      title = 'Математичний Аудит BKT';
      icon = Activity;
      iconColor = 'text-emerald-400';
    } else if (activeTab === 'system') {
      title = 'Конфігурація Системи';
      icon = Settings;
      iconColor = 'text-purple-400';
    }

    return {
      isOpen: isDrawerOpen,
      widthClass: 'w-72 sm:w-80 shrink-0',
      title,
      icon,
      iconColor,
      onClose: () => setIsDrawerOpen(false),
      children: (
        <div className="flex flex-col divide-y divide-slate-800/70">
          {/* Drawer: Course Theory Builder Mode */}
          {(activeTab === 'courses' || activeTab === 'create_course') && courseViewMode === 'THEORY' && selectedStudioCourse && selectedTheoryModule && (
            <>
              {/* Back to Studio Button */}
              <div className="p-2 border-b border-slate-800/60">
                <button
                  type="button"
                  onClick={handleBackToStudio}
                  className="w-full py-2 px-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors flex items-center gap-2 text-xs cursor-pointer group"
                  title="Повернутися до Студії курсу"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-semibold text-slate-200">До Студії курсу</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate">{selectedStudioCourse.title}</span>
                  </div>
                </button>
              </div>

              {/* 1. Lesson Outline (5 Didactic Blocks) */}
              <DrawerSection
                title="Зміст уроку (5 блоків)"
                icon={BookOpen}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('admin-theory-scroll-to-card', { detail: { cardId: 'theory-card-summary' } }))}
                    className="w-full p-2 rounded-lg text-left text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-blue-400 font-bold font-mono">1.</span>
                      <span className="truncate">Вступ & Мета теми</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Summary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('admin-theory-scroll-to-card', { detail: { cardId: 'theory-card-concepts' } }))}
                    className="w-full p-2 rounded-lg text-left text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-emerald-400 font-bold font-mono">2.</span>
                      <span className="truncate">Теоретичні поняття</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Concepts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('admin-theory-scroll-to-card', { detail: { cardId: 'theory-card-code' } }))}
                    className="w-full p-2 rounded-lg text-left text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-indigo-400 font-bold font-mono">3.</span>
                      <span className="truncate">Приклад коду</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Snippet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('admin-theory-scroll-to-card', { detail: { cardId: 'theory-card-misconception' } }))}
                    className="w-full p-2 rounded-lg text-left text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-amber-400 font-bold font-mono">4.</span>
                      <span className="truncate text-amber-300/90">Картка омани</span>
                    </div>
                    <span className="text-[10px] text-amber-500/80 font-mono">Alert</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('admin-theory-scroll-to-card', { detail: { cardId: 'theory-card-takeaways' } }))}
                    className="w-full p-2 rounded-lg text-left text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-purple-400 font-bold font-mono">5.</span>
                      <span className="truncate">Ключові висновки</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Takeaways</span>
                  </button>
                </div>
              </DrawerSection>

              {/* 2. Didactic Presets */}
              <DrawerSection
                title="Дидактичні шаблони"
                icon={Sparkles}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('admin-theory-apply-preset', { detail: { preset: 'html' } }))}
                    className="w-full py-1.5 px-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 text-left transition-colors font-medium cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>HTML (Базова розмітка)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('admin-theory-apply-preset', { detail: { preset: 'js' } }))}
                    className="w-full py-1.5 px-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 text-left transition-colors font-medium cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span>JavaScript (Змінні & Типи)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('admin-theory-apply-preset', { detail: { preset: 'css' } }))}
                    className="w-full py-1.5 px-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 text-left transition-colors font-medium cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    <span>CSS (Flexbox Розкладка)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('admin-theory-apply-preset', { detail: { preset: 'python' } }))}
                    className="w-full py-1.5 px-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 text-left transition-colors font-medium cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>Python (Синтаксис & Типи)</span>
                  </button>
                </div>
              </DrawerSection>

              {/* 3. Course Modules Switcher */}
              <DrawerSection
                title="Теми цього курсу"
                icon={Layers}
                badge={`${selectedStudioCourse.modules?.length || 0} тем`}
                defaultOpen={true}
              >
                <div className="flex flex-col divide-y divide-slate-800/50 pt-1 max-h-56 overflow-y-auto">
                  {(selectedStudioCourse.modules || []).map((m, idx) => {
                    const isCurrent = m.id === selectedTheoryModule.id;
                    const hasTheory = Boolean(m.description && m.description.trim().length > 0);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleOpenTheory(selectedStudioCourse, m)}
                        className={`w-full py-2 px-2 text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-500/15 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-2'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <span className="font-mono text-[10px] text-slate-500 shrink-0">#{idx + 1}</span>
                          <span className="truncate">{m.title}</span>
                        </div>
                        <span className={`text-[9px] font-mono shrink-0 ${hasTheory ? 'text-emerald-400' : 'text-slate-600'}`}>
                          {hasTheory ? '✓ готова' : 'порожньо'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </DrawerSection>

              {/* 4. Live Preview links */}
              <DrawerSection
                title="Зовнішній перегляд"
                icon={ExternalLink}
                defaultOpen={false}
              >
                <div className="flex flex-col gap-1.5 pt-1 text-xs">
                  <a
                    href={`${getAppBaseUrl('study')}/learn/${selectedStudioCourse.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span className="font-semibold truncate">Zen Focus у Підручнику</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                  </a>
                </div>
              </DrawerSection>

            </>
          )}

          {/* Drawer: Course Studio Mode (Focused outline & course tools, zero platform duplication) */}
          {(activeTab === 'courses' || activeTab === 'create_course') && courseViewMode === 'STUDIO' && selectedStudioCourse && (
            <>
              {/* 1. Course Readiness & Quality Audit */}
              {(() => {
                const mods = selectedStudioCourse.modules || [];
                const totalMods = mods.length;
                const modsWithTheory = mods.filter((m) => Boolean(m.theoryUrl)).length;
                let tSkills = 0;
                let tTasks = 0;
                let codeCount = 0;
                let quizCount = 0;

                mods.forEach((m) => {
                  if (m.skills) {
                    tSkills += m.skills.length;
                    m.skills.forEach((s: any) => {
                      if (s.tasks) {
                        tTasks += s.tasks.length;
                        s.tasks.forEach((t: any) => {
                          if (t.taskType === 'CODE') codeCount++;
                          else quizCount++;
                        });
                      }
                    });
                  }
                });

                if (tSkills === 0 && selectedStudioCourse.skills) {
                  tSkills = selectedStudioCourse.skills.length;
                  selectedStudioCourse.skills.forEach((s: any) => {
                    if (s.tasks) {
                      tTasks += s.tasks.length;
                      s.tasks.forEach((t: any) => {
                        if (t.taskType === 'CODE') codeCount++;
                        else quizCount++;
                      });
                    }
                  });
                }

                return (
                  <>
                    <DrawerSection
                      title="Готовність курсу"
                      icon={CheckCircle2}
                      badge={selectedStudioCourse.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      defaultOpen={true}
                    >
                      <div className="flex flex-col gap-2 pt-1 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                          <span className="text-[11px] text-slate-400">Статус курсу:</span>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const nextStatus = !selectedStudioCourse.isPublished;
                                const res = await fetch(`${API_URL}/api/v1/courses/${selectedStudioCourse.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ isPublished: nextStatus }),
                                });
                                if (res.ok) {
                                  const updated = await res.json();
                                  setSelectedStudioCourse(updated);
                                  loadCourses();
                                }
                              } catch {}
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer border ${
                              selectedStudioCourse.isPublished
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                            }`}
                          >
                            {selectedStudioCourse.isPublished ? '✓ Опубліковано' : '● Чернетка'}
                          </button>
                        </div>

                        <div className="flex flex-col divide-y divide-slate-800/50 text-[11px]">
                          <div className="py-1.5 flex items-center justify-between">
                            <span className="text-slate-400">📖 Конспекти теорії:</span>
                            <span className={`font-mono ${modsWithTheory > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {modsWithTheory}/{totalMods} тем
                            </span>
                          </div>
                          <div className="py-1.5 flex items-center justify-between">
                            <span className="text-slate-400">🎯 BKT-компетенції:</span>
                            <span className="font-mono text-slate-200">{tSkills} навичок</span>
                          </div>
                          <div className="py-1.5 flex items-center justify-between">
                            <span className="text-slate-400">📝 Банк завдань:</span>
                            <span className="font-mono text-indigo-400">
                              {tTasks} вправ ({codeCount} код, {quizCount} тест)
                            </span>
                          </div>
                          <div className="py-1.5 flex items-center justify-between">
                            <span className="text-slate-400">⚖️ Поріг майстерності:</span>
                            <span className="font-mono text-emerald-400">
                              P(L) ≥ {selectedStudioCourse.defaultMasteryThreshold ?? 0.85}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DrawerSection>

                    {/* Sequential Guided Course Authoring Stepper in Studio Drawer */}
                    <DrawerSection
                      title="Маршрут автора курсу"
                      icon={Layers}
                      badge={`Крок ${authorStep} з 5`}
                      defaultOpen={true}
                    >
                      <div className="flex flex-col gap-1.5 pt-1 text-xs">
                        {[
                          {
                            num: 1,
                            title: 'Базові метадані',
                            sub: `Паспорт: /${selectedStudioCourse.slug}`,
                            stat: `✓ P(L) ≥ ${selectedStudioCourse.defaultMasteryThreshold ?? 0.85}`,
                          },
                          {
                            num: 2,
                            title: 'Модульна структура',
                            sub: 'Тематичні розділи курсу',
                            stat: `✓ ${totalMods} тем`,
                          },
                          {
                            num: 3,
                            title: 'Граф компетенцій (DAG)',
                            sub: 'Компетенції та пререквізити BKT',
                            stat: `✓ ${tSkills} навичок`,
                          },
                          {
                            num: 4,
                            title: 'Конспекти & Підручник',
                            sub: '5-блочний Zen Focus конспект',
                            stat: modsWithTheory > 0 ? `✓ ${modsWithTheory}/${totalMods}` : `${modsWithTheory}/${totalMods}`,
                          },
                          {
                            num: 5,
                            title: 'Банк адаптивних завдань',
                            sub: 'Симуляція BKT та завдання',
                            stat: `✓ ${tTasks} вправ`,
                          },
                        ].map((st) => {
                          const isCurrent = authorStep === st.num;
                          const isUnlocked = st.num <= maxUnlockedStep;
                          const isLocked = !isUnlocked;

                          return (
                            <button
                              key={st.num}
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleStepClick(st.num)}
                              className={`w-full p-2 text-left rounded-lg transition-colors flex items-start gap-2.5 ${
                                isCurrent
                                  ? 'bg-emerald-500/15 border-l-2 border-emerald-400 pl-2 text-emerald-300 font-semibold cursor-pointer'
                                  : isUnlocked
                                  ? 'hover:bg-slate-800/60 text-slate-300 cursor-pointer'
                                  : 'opacity-40 text-slate-500 cursor-not-allowed select-none'
                              }`}
                              title={
                                isLocked
                                  ? `Крок ${st.num} заблоковано. Завершіть попередні кроки, щоб відкрити цей етап.`
                                  : isCurrent
                                  ? `Поточний активний етап: ${st.title}`
                                  : `Перейти до кроку ${st.num}: ${st.title}`
                              }
                            >
                              <span
                                className={`font-mono text-[10px] font-bold px-1 py-0.5 rounded shrink-0 mt-0.5 ${
                                  isCurrent
                                    ? 'text-emerald-400 bg-emerald-500/20'
                                    : isUnlocked
                                    ? 'text-slate-300 bg-slate-800'
                                    : 'text-slate-600 bg-slate-900'
                                }`}
                              >
                                {isLocked ? '🔒' : st.num}
                              </span>
                              <div className="flex flex-col min-w-0 w-full">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`truncate ${isCurrent ? 'text-white' : isUnlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                                    {st.title}
                                  </span>
                                  <span
                                    className={`text-[10px] font-mono shrink-0 ${
                                      isCurrent
                                        ? 'text-emerald-400'
                                        : isUnlocked
                                        ? 'text-slate-400'
                                        : 'text-slate-600'
                                    }`}
                                  >
                                    {isLocked ? 'Недоступно' : isCurrent ? 'Зараз' : st.stat}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 truncate">{st.sub}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </DrawerSection>

                    {/* 2. Module Testing & Sandbox Runner */}
                    <DrawerSection
                      title="Тестування модуля"
                      icon={FlaskConical}
                      defaultOpen={true}
                    >
                      <div className="flex flex-col gap-2 pt-1 text-xs">
                        <p className="text-[11px] text-slate-400 leading-tight">
                          Симуляція адаптивного розв'язку учня та калібрування BKT:
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setStudioSubTab('CURRICULUM');
                            window.dispatchEvent(new CustomEvent('admin-studio-open-test-module'));
                          }}
                          className="w-full py-2 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors flex items-center justify-center gap-2 font-semibold cursor-pointer"
                        >
                          <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                          <span>🧪 Тестова пісочниця автора</span>
                        </button>

                        <div className="p-2 rounded bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 font-mono">
                          <span className="text-emerald-400 font-bold">BKT динаміка:</span> ~3–4 успішні відповіді підряд піднімуть P(L) до 0.85.
                        </div>
                      </div>
                    </DrawerSection>
                  </>
                );
              })()}

              {/* Course Actions & Settings */}
              <DrawerSection
                title="Дії та інструменти"
                icon={Settings}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1.5 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStudioSubTab('CURRICULUM');
                      window.dispatchEvent(new CustomEvent('admin-studio-open-create-module'));
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+ Додати модуль</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStudioSubTab('CURRICULUM');
                      window.dispatchEvent(new CustomEvent('admin-studio-open-create-skill'));
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    <span>+ Додати компетенцію</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudioSubTab('CURRICULUM')}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer ${
                      studioSubTab === 'CURRICULUM'
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>План & DAG</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {selectedStudioCourse.modules?.length || 0} тем
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudioSubTab('SETTINGS')}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer ${
                      studioSubTab === 'SETTINGS'
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Параметри & BKT</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                      P(L) ≥ {selectedStudioCourse.defaultMasteryThreshold ?? 0.85}
                    </span>
                  </button>
                </div>
              </DrawerSection>

              {/* Live Preview Links */}
              <DrawerSection
                title="Живий перегляд"
                icon={ExternalLink}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1.5 pt-1 text-xs">
                  <a
                    href={`${getAppBaseUrl('study')}/learn/${selectedStudioCourse.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white transition-colors flex items-center justify-between group cursor-pointer"
                    title="Відкрити конспекти уроків у Підручнику"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">Підручник (Теорія)</span>
                        <span className="text-[10px] font-mono text-slate-500 truncate">/learn/{selectedStudioCourse.slug}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                  </a>

                  <a
                    href={`${getAppBaseUrl('student')}/practice/${selectedStudioCourse.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white transition-colors flex items-center justify-between group cursor-pointer"
                    title="Спробувати інтерактивні завдання у Тренажері"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <Code className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">Тренажер (BKT)</span>
                        <span className="text-[10px] font-mono text-slate-500 truncate">/practice/{selectedStudioCourse.slug}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                  </a>
                </div>
              </DrawerSection>
            </>
          )}

          {/* Drawer: Course Create Mode */}
          {((activeTab === 'courses' && courseViewMode === 'CREATE') ||
            (activeTab === 'create_course' && (!selectedStudioCourse || courseViewMode === 'CREATE'))) && (
            <>
              {/* 1. Quick Didactic Templates / Presets */}
              <DrawerSection
                title="Дидактичні шаблони"
                icon={Sparkles}
                badge={`${COURSE_PRESETS.length}`}
                defaultOpen={true}
              >
                <div className="flex flex-col divide-y divide-slate-800/50 pt-1">
                  {COURSE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('admin-course-apply-preset', { detail: preset })
                        );
                      }}
                      className="w-full py-2.5 px-2 text-left transition-colors cursor-pointer flex flex-col gap-1 group rounded-md hover:bg-slate-800/60"
                      title={`Заповнити форму шаблоном: ${preset.presetTitle}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <preset.icon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              preset.color === 'emerald'
                                ? 'text-emerald-400'
                                : preset.color === 'amber'
                                ? 'text-amber-400'
                                : preset.color === 'purple'
                                ? 'text-purple-400'
                                : 'text-indigo-400'
                            }`}
                          />
                          <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                            {preset.presetTitle}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 pl-5.5">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </DrawerSection>

              {/* 2. Course Creation Lifecycle Roadmap */}
              <DrawerSection
                title="Маршрут автора курсу"
                icon={Layers}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1.5 pt-1 text-xs">
                  {/* Step 1: Active */}
                  <div className="p-2 rounded-lg bg-emerald-500/10 border-l-2 border-emerald-400 flex items-start gap-2.5">
                    <span className="font-mono text-[10px] font-bold text-emerald-400 px-1 py-0.5 rounded bg-emerald-500/20 shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex flex-col min-w-0 w-full">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-emerald-300">Базові метадані</span>
                        <span className="text-[10px] font-mono text-emerald-400">Поточний крок</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Назва, слаг, категорія та BKT-поріг</span>
                    </div>
                  </div>

                  {/* Steps 2-5: Locked Future Steps in Sequential Creation Wizard */}
                  {[
                    { num: 2, title: 'Модульна структура', sub: 'Тематичні розділи курсу' },
                    { num: 3, title: 'Граф компетенцій (Skill DAG)', sub: 'Навички та пререквізити BKT' },
                    { num: 4, title: 'Конспекти & Підручник', sub: '5-блочний Zen Focus конспект' },
                    { num: 5, title: 'Банк адаптивних завдань', sub: 'Завдання з оцінкою P(T), P(G), P(S)' },
                  ].map((st) => (
                    <div
                      key={st.num}
                      className="w-full p-2 text-left rounded-lg transition-colors flex items-start gap-2.5 opacity-40 bg-slate-900/30 text-slate-500 select-none cursor-not-allowed"
                      title={`Крок ${st.num} заблоковано. Завершіть базові метадані курсу, щоб перейти до цього етапу.`}
                    >
                      <span className="font-mono text-[10px] font-bold text-slate-600 px-1 py-0.5 rounded bg-slate-950 shrink-0 mt-0.5">
                        🔒
                      </span>
                      <div className="flex flex-col min-w-0 w-full">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-slate-400 truncate">
                            {st.num}. {st.title}
                          </span>
                          <span className="text-[9px] font-mono text-slate-600 shrink-0">
                            🔒 Заблоковано
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-600 truncate">{st.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </DrawerSection>
            </>
          )}

          {/* Drawer: Courses List Mode (Full Platform Courses Overview & Filtering) */}
          {activeTab === 'courses' && courseViewMode === 'LIST' && (
            <>
              {/* 1. Platform Courses Overview & Quick Switcher */}
              <DrawerSection
                title="Курси платформи"
                icon={BookOpen}
                badge={`${dynamicCourses.length}`}
                defaultOpen={true}
              >
                <div className="flex flex-col divide-y divide-slate-800/50 pt-1">
                  {dynamicCourses.length === 0 ? (
                    <div className="p-3 text-[11px] text-slate-500 italic text-center">
                      Завантаження курсів...
                    </div>
                  ) : (
                    dynamicCourses.map((c) => {
                      const isSelected = selectedCourseSlug === c.slug;
                      const modsCount = c.modules?.length || 0;
                      const isPublished = c.isPublished !== false;

                      return (
                        <div
                          key={c.id || c.slug}
                          className={`w-full py-1.5 px-2 text-left text-xs transition-colors flex items-center justify-between group rounded-md ${
                            isSelected
                              ? 'bg-emerald-500/15 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-2'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedCourseSlug(isSelected ? null : c.slug)}
                            className="flex items-center gap-2 min-w-0 pr-1 flex-1 text-left cursor-pointer"
                            title={isSelected ? `Скинути фільтр курсу: ${c.title}` : `Фільтрувати за курсом: ${c.title}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isPublished ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                              title={isPublished ? 'Опубліковано' : 'Чернетка'}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="truncate font-medium text-slate-200 group-hover:text-white">
                                {c.title}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 truncate">
                                /{c.slug} • {modsCount} {modsCount === 1 ? 'модуль' : modsCount < 5 ? 'модулі' : 'модулів'}
                              </span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenStudio(c)}
                            className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-slate-400 hover:text-emerald-300 hover:bg-slate-700/60 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                            title="Відкрити Студію курсу"
                          >
                            Студія →
                          </button>
                        </div>
                      );
                    })
                  )}

                  {selectedCourseSlug && (
                    <div className="pt-2 px-1">
                      <button
                        type="button"
                        onClick={() => setSelectedCourseSlug(null)}
                        className="w-full py-1 text-[11px] text-center text-slate-400 hover:text-white hover:bg-slate-800/60 rounded transition-colors cursor-pointer font-mono"
                      >
                        ✕ Скинути вибір курсу (показати всі)
                      </button>
                    </div>
                  )}
                </div>
              </DrawerSection>

              {/* 2. Subject Categories Filter */}
              <DrawerSection
                title="Предметні категорії"
                icon={Folder}
                badge={String(categories.length || 4)}
                defaultOpen={true}
              >
                <div className="flex flex-col divide-y divide-slate-800/50 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategorySlug(null);
                      setSelectedCourseSlug(null);
                    }}
                    className={`w-full py-1.5 pr-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between rounded-r ${
                      selectedCategorySlug === null
                        ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-2'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40 pl-2.5'
                    }`}
                  >
                    <span className="truncate">Всі напрями</span>
                    <span className="text-[10px] font-mono opacity-70 shrink-0">
                      {dynamicCourses.length || 4} курсів
                    </span>
                  </button>

                  {(categories.length > 0
                    ? categories
                    : [
                        { id: '1', slug: 'prog-it', title: 'Програмування & IT', icon: 'Code', coursesCount: 2 },
                        { id: '2', slug: 'languages', title: 'Іноземні Мови', icon: 'Languages', coursesCount: 1 },
                        { id: '3', slug: 'law-social', title: 'Право & Суспільствознавство', icon: 'Scale', coursesCount: 1 },
                        { id: '4', slug: 'exact-sciences', title: 'Точні Науки & Математика', icon: 'Binary', coursesCount: 0 },
                      ]
                  ).map((cat: any) => {
                    const isSelected = selectedCategorySlug === cat.slug;
                    return (
                      <button
                        key={cat.id || cat.slug}
                        type="button"
                        onClick={() => {
                          setSelectedCategorySlug(isSelected ? null : cat.slug);
                          setSelectedCourseSlug(null);
                        }}
                        className={`w-full py-2 pr-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between group rounded-r ${
                          isSelected
                            ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-2'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/40 pl-2.5'
                        }`}
                        title={cat.title}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <span className="shrink-0">
                            {cat.icon === 'Code' ? <Code className="w-3.5 h-3.5 text-emerald-400" /> :
                             cat.icon === 'Languages' ? <Languages className="w-3.5 h-3.5 text-indigo-400" /> :
                             cat.icon === 'Scale' ? <Scale className="w-3.5 h-3.5 text-purple-400" /> :
                             cat.icon === 'Binary' ? <Binary className="w-3.5 h-3.5 text-amber-400" /> :
                             <Folder className="w-3.5 h-3.5 text-slate-400" />}
                          </span>
                          <span className={`truncate ${isSelected ? 'font-semibold text-emerald-300' : 'font-medium group-hover:text-slate-200'}`}>
                            {cat.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono opacity-80 shrink-0 text-slate-500">
                          {cat.coursesCount ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </DrawerSection>

              <DrawerSection
                title="Статус публікації"
                icon={ShieldCheck}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setCourseStatusFilter('ALL')}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between ${
                      courseStatusFilter === 'ALL'
                        ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <span>Всі курси</span>
                    <span className="text-[10px] font-mono text-slate-500">{dynamicCourses.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseStatusFilter('PUBLISHED')}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between ${
                      courseStatusFilter === 'PUBLISHED'
                        ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Опубліковані</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {dynamicCourses.filter(c => c.isPublished !== false).length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourseStatusFilter('DRAFT')}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between ${
                      courseStatusFilter === 'DRAFT'
                        ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Чернетки</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400">
                      {dynamicCourses.filter(c => c.isPublished === false).length}
                    </span>
                  </button>
                </div>
              </DrawerSection>

              <DrawerSection
                title="Банк завдань"
                icon={Layers}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1.5 text-xs text-slate-400 pt-1">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Тестові завдання (Single/Multi)</span>
                    <span className="font-mono text-white font-bold">18</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Відкриті есе (Text Essay)</span>
                    <span className="font-mono text-white font-bold">8</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Практичні вправи з кодом</span>
                    <span className="font-mono text-white font-bold">12</span>
                  </div>
                </div>
              </DrawerSection>
            </>
          )}

          {/* Drawer: Users & RBAC */}
          {activeTab === 'users' && (
            <>
              <DrawerSection
                title="Google OAuth & Доступ"
                icon={ShieldCheck}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-2 pt-1 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                    <span className="font-semibold text-emerald-400">Вхід в 1 клік (Google)</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Учні авторизуються через Google акаунт. При першому вході система створює профіль учня автоматично.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                    <span className="font-semibold text-purple-400">Привілеї Викладача</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Роль TEACHER відкриває когортну аналітику, інспекцію аномалій та створення інвайт-кодів груп.
                    </p>
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection
                title="Дидактичні Режими"
                icon={BookOpen}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1.5 text-[11px] text-slate-400 pt-1">
                  <div className="flex flex-col gap-0.5 py-1 border-b border-slate-800/60">
                    <span className="text-indigo-300 font-semibold">FULL_CYCLE</span>
                    <span>Повний цикл: конспект у підручнику + тренажер з BKT.</span>
                  </div>
                  <div className="flex flex-col gap-0.5 py-1 border-b border-slate-800/60">
                    <span className="text-amber-300 font-semibold">TESTING_ONLY</span>
                    <span>Експрес-діагностика без обов'язкової теорії.</span>
                  </div>
                  <div className="flex flex-col gap-0.5 py-1">
                    <span className="text-purple-300 font-semibold">MODULAR</span>
                    <span>Вибірковий доступ до обраних модулів.</span>
                  </div>
                </div>
              </DrawerSection>
            </>
          )}

          {/* Drawer: Datasets & Audit Sidebar */}
          {activeTab === 'datasets' && (
            <>
              <DrawerSection
                title="Швидкий Експорт ШІ"
                icon={Download}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-2 pt-1">
                  <a
                    href={`${API_URL}/api/v1/bkt/activity-logs/export?format=jsonl`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">JSONL Датасет</span>
                      <span className="text-[10px] text-slate-400">Для DKT, SAKT, PyTorch</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300">
                      .jsonl
                    </span>
                  </a>

                  <a
                    href={`${API_URL}/api/v1/bkt/activity-logs/export?format=csv`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">CSV Таблиця</span>
                      <span className="text-[10px] text-slate-400">Для Pandas, Excel, R</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300">
                      .csv
                    </span>
                  </a>
                </div>
              </DrawerSection>

              <DrawerSection
                title="Фільтрація Подій"
                icon={Filter}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-2 pt-1 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Тип події</span>
                    <div className="grid grid-cols-2 gap-1 select-none">
                      {[
                        { key: 'ALL', label: 'Всі' },
                        { key: 'SUBMISSIONS', label: 'Спроби' },
                        { key: 'ANNULMENTS', label: 'Анулювання' },
                        { key: 'HINTS', label: 'Підказки' },
                        { key: 'THEORY', label: 'Теорія' },
                        { key: 'RESETS', label: 'Скидання' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setDatasetFilter(item.key as any)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer text-left ${
                            datasetFilter === item.key
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Користувач</span>
                      {datasetUserFilter && (
                        <button
                          type="button"
                          onClick={() => setDatasetUserFilter('')}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        >
                          Скинути
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Пошук за ім'ям чи email..."
                        value={datasetUserFilter}
                        onChange={(e) => setDatasetUserFilter(e.target.value)}
                        className="w-full pl-2.5 pr-6 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                      {datasetUserFilter && (
                        <button
                          type="button"
                          onClick={() => setDatasetUserFilter('')}
                          className="absolute right-2 top-1 text-slate-500 hover:text-white text-xs cursor-pointer"
                          title="Очистити фільтр"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Quick User List in Drawer */}
                    {datasetActiveUsers.length > 0 && (
                      <div className="flex flex-col divide-y divide-slate-800/50 mt-1 max-h-48 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => setDatasetUserFilter('')}
                          className={`w-full py-1.5 px-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between rounded ${
                            !datasetUserFilter
                              ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-1.5'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                          }`}
                        >
                          <span className="truncate">Всі користувачі</span>
                          <span className="text-[10px] font-mono opacity-70">
                            {datasetStats.total}
                          </span>
                        </button>
                        {datasetActiveUsers.slice(0, 8).map((u) => {
                          const isSelected = datasetUserFilter === u.userId || datasetUserFilter === u.name;
                          return (
                            <button
                              key={u.userId}
                              type="button"
                              onClick={() => setDatasetUserFilter(isSelected ? '' : u.userId)}
                              className={`w-full py-1.5 px-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between group rounded ${
                                isSelected
                                  ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-1.5'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                              }`}
                              title={u.email || u.userId}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-300 shrink-0">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate">{u.name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                {u.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection
                title="Метрики Аудиту"
                icon={Sparkles}
                badge={datasetStats.total}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1.5 text-xs text-slate-400 pt-1">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Спроб коду</span>
                    <span className="font-mono text-emerald-400 font-bold">{datasetStats.submissions}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Анулювань (Hard Neg)</span>
                    <span className="font-mono text-rose-400 font-bold">{datasetStats.annulled}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Підказок Сократа</span>
                    <span className="font-mono text-amber-400 font-bold">{datasetStats.hints}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Вивчення теорії</span>
                    <span className="font-mono text-blue-400 font-bold">{datasetStats.theory}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Скидань навичок</span>
                    <span className="font-mono text-purple-400 font-bold">{datasetStats.resets}</span>
                  </div>
                </div>
              </DrawerSection>
            </>
          )}

          {/* Drawer: BKT Verifier Sidebar */}
          {activeTab === 'verifier' && (
            <>
              <DrawerSection
                title="Регламент перевірки"
                icon={Activity}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-2 pt-1 text-xs text-slate-400">
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Автономна верифікація математичної коректності BKT: перевірка чисельників, знаменників та апостеріорних ймовірностей $P(L_t)$ за формулами Баєса з точністю до $10^{-6}$.
                  </p>
                  <div className="flex items-center justify-between py-1 border-t border-slate-800/60 text-[11px]">
                    <span>Стандарт тесту:</span>
                    <span className="font-mono text-emerald-400 font-bold">10 Інваріантів</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-t border-slate-800/60 text-[11px]">
                    <span>Журнал подій:</span>
                    <span className="font-mono text-indigo-400">event_stream.jsonl</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-t border-slate-800/60 text-[11px]">
                    <span>Ротація логів:</span>
                    <span className="font-mono text-emerald-400">20 МБ (Safe)</span>
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection
                title="Ключові формули BKT"
                icon={Sparkles}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-2 pt-1 text-[11px] font-mono text-slate-300">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Правильна відповідь:</span>
                    <span className="text-emerald-400 font-semibold">[P(L)*(1-S)] / Den</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Помилка:</span>
                    <span className="text-rose-400 font-semibold">[P(L)*S] / Den</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Транзит знань:</span>
                    <span className="text-indigo-400 font-semibold">P(L|Obs) + (1-P(L|Obs))*P(T)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Штраф Сократа:</span>
                    <span className="text-amber-400 font-semibold">ΔP * (1 - Penalty)</span>
                  </div>
                </div>
              </DrawerSection>
            </>
          )}

          {/* Drawer: System Sidebar */}
          {activeTab === 'system' && (
            <DrawerSection
              title="Web3 SBT Релейєр"
              icon={ShieldCheck}
              defaultOpen={true}
            >
              <div className="flex flex-col gap-2 pt-1 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Мережа:</span>
                  <span className="font-mono text-emerald-400">Hardhat Local (31337)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Релейєр:</span>
                  <span className="text-emerald-400 font-semibold">Активний (Gasless)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Контракт SBT:</span>
                  <span className="font-mono text-[10px] text-purple-300">0x5FbDB...7108</span>
                </div>
              </div>
            </DrawerSection>
          )}
        </div>
      ),
    };
  };

  return (
    <>
      <AppShellLayout
        currentApp="admin"
        header={{
          appName: 'Smart-BKT-Chain',
          badgeText: 'Admin',
          logoIcon: ShieldCheck,
          logoColor: 'bg-emerald-500/15 text-emerald-400',
          courseBadge: (
            <span
              className="text-xs sm:text-[13px] font-normal text-slate-300 select-none tracking-normal"
              title="Методичний центр управління платформою"
            >
              Методичний центр
            </span>
          ),
          breadcrumbs: (
            <Breadcrumbs
              className="text-[11px]"
              items={
                activeTab === 'create_course'
                  ? selectedStudioCourse && courseViewMode === 'STUDIO'
                    ? [
                        {
                          label: 'CMS Адміністрування',
                          onClick: handleBackToCoursesList,
                        },
                        {
                          label: 'Створення курсу',
                          onClick: () => {
                            setSelectedStudioCourse(null);
                            setCourseViewMode('CREATE');
                            setAuthorStep(1);
                            setMaxUnlockedStep(1);
                            updateBrowserUrl({ tab: 'create_course', mode: 'CREATE' });
                          },
                        },
                        {
                          label: selectedStudioCourse.title,
                          badge: `Крок ${authorStep} з 5`,
                          isCurrent: true,
                        },
                      ]
                    : courseViewMode === 'THEORY' && selectedStudioCourse && selectedTheoryModule
                    ? [
                        {
                          label: 'CMS Адміністрування',
                          onClick: handleBackToCoursesList,
                        },
                        {
                          label: 'Створення курсу',
                          onClick: handleBackToStudio,
                        },
                        {
                          label: selectedStudioCourse.title,
                          onClick: handleBackToStudio,
                        },
                        {
                          label: selectedTheoryModule.title,
                          badge: 'Конспект уроку',
                          isCurrent: true,
                        },
                      ]
                    : [
                        {
                          label: 'CMS Адміністрування',
                          onClick: handleBackToCoursesList,
                        },
                        {
                          label: 'Створення нового курсу',
                          badge: 'Крок 1 з 5',
                          isCurrent: true,
                        },
                      ]
                  : activeTab === 'courses'
                  ? courseViewMode === 'THEORY' && selectedStudioCourse && selectedTheoryModule
                    ? [
                        {
                          label: 'CMS Адміністрування',
                          onClick: handleBackToCoursesList,
                        },
                        {
                          label: 'Курси',
                          onClick: handleBackToCoursesList,
                        },
                        {
                          label: selectedStudioCourse.title,
                          onClick: handleBackToStudio,
                        },
                        {
                          label: selectedTheoryModule.title,
                          badge: `Модуль ${(selectedStudioCourse.modules || []).findIndex((m) => m.id === selectedTheoryModule.id) + 1 || 1}`,
                        },
                        {
                          label: 'Конструктор теорії',
                          isCurrent: true,
                        },
                      ]
                    : courseViewMode === 'STUDIO' && selectedStudioCourse
                    ? [
                        {
                          label: 'CMS Адміністрування',
                          onClick: handleBackToCoursesList,
                        },
                        {
                          label: 'Курси',
                          onClick: handleBackToCoursesList,
                        },
                        {
                          label: selectedStudioCourse.title,
                          badge: `${selectedStudioCourse.modules?.length || 0} мод.`,
                          isCurrent: true,
                        },
                      ]
                    : [
                        {
                          label: 'CMS Адміністрування',
                          onClick: handleBackToCoursesList,
                        },
                        {
                          label: 'Курси',
                          badge: `${dynamicCourses.length} курсів`,
                          isCurrent: true,
                        },
                      ]
                  : [
                      {
                        label: 'CMS Адміністрування',
                        onClick: () => {
                          setActiveTab('courses');
                          handleBackToCoursesList();
                        },
                      },
                      {
                        label:
                          activeTab === 'users'
                            ? 'Користувачі & Доступ'
                            : activeTab === 'datasets'
                            ? 'Датасети для ШІ'
                            : activeTab === 'verifier'
                            ? 'Математичний аудит BKT'
                            : 'Система',
                        isCurrent: true,
                      },
                    ]
              }
            />
          ),
          rightSlot: (
            <div className="flex items-center gap-2">
              <a
                href={getAppBaseUrl('teacher')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <span>Кабінет Викладача</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <div className="h-4 w-[1px] bg-slate-800" />

              {/* 👤 Кнопка профілю адміністратора */}
              <button
                type="button"
                onClick={() => setIsProfileDrawerOpen(true)}
                className="flex items-center gap-2 hover:bg-slate-800/60 px-2 py-1 rounded-lg transition-colors cursor-pointer select-none text-left group"
                title="Натисніть для відкриття профілю адміністратора"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  АД
                </div>
                <div className="hidden lg:flex flex-col leading-none">
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                    Адміністратор CMS
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 mt-0.5">
                    ADMIN
                  </span>
                </div>
              </button>
            </div>
          ),
        }}
        navigationRail={{
          tabs: [
            {
              id: 'courses',
              icon: BookOpen,
              title: 'Каталог курсів (Керування Курсами, Модулями & DAG)',
              activeColor: 'bg-emerald-600',
            },
            {
              id: 'create_course',
              icon: PlusCircle,
              title: 'Створення нового курсу',
              activeColor: 'bg-emerald-600',
            },
            {
              id: 'users',
              icon: Users,
              title: 'Керування Користувачами & Доступом',
              activeColor: 'bg-emerald-600',
            },
            {
              id: 'datasets',
              icon: Database,
              title: 'Експорт Датасетів для ШІ & Аудит-Логи',
              activeColor: 'bg-emerald-600',
            },
            {
              id: 'verifier',
              icon: Activity,
              title: 'Математичний Аудит BKT & Верифікатор',
              activeColor: 'bg-emerald-600',
            },
          ],
          activeTab:
            activeTab === 'create_course'
              ? 'create_course'
              : courseViewMode === 'CREATE'
              ? 'create_course'
              : activeTab,
          isDrawerOpen: isDrawerOpen,
          onTabClick: handleTabClick,
          onSettingsClick: () => handleTabClick('system'),
          isSettingsActive: activeTab === 'system',
        }}
        drawer={getDrawerConfig()}
        mainClassName="p-4 lg:p-6 overflow-y-auto flex flex-col gap-5 bg-slate-950"
      >
        <div className="flex flex-col gap-5 min-h-[400px]">
          {activeTab === 'create_course' && (
            <>
              {courseViewMode === 'CREATE' && (
                <CourseCreateView
                  categories={categories}
                  onCreated={(newCourse) => {
                    setDynamicCourses((prev) => {
                      const exists = prev.some((c) => c.id === newCourse.id || c.slug === newCourse.slug);
                      return exists ? prev.map((c) => (c.id === newCourse.id ? newCourse : c)) : [newCourse, ...prev];
                    });
                    handleOpenStudio(newCourse, 'CURRICULUM', 2, 'create_course');
                    loadCourses();
                  }}
                  onCancel={handleBackToCoursesList}
                />
              )}

              {courseViewMode === 'THEORY' && selectedStudioCourse && selectedTheoryModule && (
                <TheoryLessonBuilderView
                  course={selectedStudioCourse}
                  module={selectedTheoryModule}
                  apiUrl={API_URL}
                  onBack={handleBackToStudio}
                  onModuleUpdated={(updatedMod) => {
                    setSelectedTheoryModule(updatedMod);
                    setSelectedStudioCourse((prev) => {
                      if (!prev) return prev;
                      const newMods = (prev.modules || []).map((m) =>
                        m.id === updatedMod.id ? { ...m, ...updatedMod } : m
                      );
                      return { ...prev, modules: newMods };
                    });
                    loadCourses();
                  }}
                  onSelectOtherModule={(targetMod) => {
                    handleOpenTheory(selectedStudioCourse, targetMod, 'create_course');
                  }}
                />
              )}

              {courseViewMode === 'STUDIO' && selectedStudioCourse && (
                <CourseStudioView
                  course={selectedStudioCourse}
                  categories={categories}
                  activeSubTab={studioSubTab}
                  onSubTabChange={setStudioSubTab}
                  authorStep={authorStep}
                  maxUnlockedStep={maxUnlockedStep}
                  onStepChange={handleStepClick}
                  onAdvanceStep={handleAdvanceStep}
                  onBack={() => {
                    if (authorStep > 1) {
                      handleStepClick(authorStep - 1);
                    } else {
                      setSelectedStudioCourse(null);
                      setCourseViewMode('CREATE');
                      setAuthorStep(1);
                      setMaxUnlockedStep(1);
                      updateBrowserUrl({ tab: 'create_course', mode: 'CREATE' });
                    }
                  }}
                  onCourseLoaded={(fullCourse) => {
                    setSelectedStudioCourse(fullCourse);
                  }}
                  onCourseUpdated={(updated) => {
                    setSelectedStudioCourse(updated);
                    loadCourses();
                    if (updated.isPublished) {
                      setActiveTab('courses');
                      updateBrowserUrl({ tab: 'courses', mode: 'STUDIO', courseSlug: updated.slug });
                    }
                  }}
                  onCourseDeleted={() => {
                    handleBackToCoursesList();
                  }}
                  onOpenTheoryBuilder={(mod) => {
                    handleOpenTheory(selectedStudioCourse, mod, 'create_course');
                  }}
                />
              )}
            </>
          )}

          {activeTab === 'courses' && (
            <>
              {courseViewMode === 'CREATE' && (
                <CourseCreateView
                  categories={categories}
                  onCreated={(newCourse) => {
                    setDynamicCourses((prev) => {
                      const exists = prev.some((c) => c.id === newCourse.id || c.slug === newCourse.slug);
                      return exists ? prev.map((c) => (c.id === newCourse.id ? newCourse : c)) : [newCourse, ...prev];
                    });
                    handleOpenStudio(newCourse, 'CURRICULUM', 2);
                    loadCourses();
                  }}
                  onCancel={handleBackToCoursesList}
                />
              )}

              {courseViewMode === 'THEORY' && selectedStudioCourse && selectedTheoryModule && (
                <TheoryLessonBuilderView
                  course={selectedStudioCourse}
                  module={selectedTheoryModule}
                  apiUrl={API_URL}
                  onBack={handleBackToStudio}
                  onModuleUpdated={(updatedMod) => {
                    setSelectedTheoryModule(updatedMod);
                    setSelectedStudioCourse((prev) => {
                      if (!prev) return prev;
                      const newMods = (prev.modules || []).map((m) =>
                        m.id === updatedMod.id ? { ...m, ...updatedMod } : m
                      );
                      return { ...prev, modules: newMods };
                    });
                    loadCourses();
                  }}
                  onSelectOtherModule={(targetMod) => {
                    handleOpenTheory(selectedStudioCourse, targetMod);
                  }}
                />
              )}

              {courseViewMode === 'STUDIO' && selectedStudioCourse && (
                <CourseStudioView
                  course={selectedStudioCourse}
                  categories={categories}
                  activeSubTab={studioSubTab}
                  onSubTabChange={setStudioSubTab}
                  authorStep={authorStep}
                  maxUnlockedStep={maxUnlockedStep}
                  onStepChange={handleStepClick}
                  onAdvanceStep={handleAdvanceStep}
                  onBack={handleBackToCoursesList}
                  onCourseLoaded={(fullCourse) => {
                    setSelectedStudioCourse(fullCourse);
                  }}
                  onCourseUpdated={(updated) => {
                    setSelectedStudioCourse(updated);
                    loadCourses();
                  }}
                  onCourseDeleted={() => {
                    handleBackToCoursesList();
                  }}
                  onOpenTheoryBuilder={(mod) => {
                    handleOpenTheory(selectedStudioCourse, mod);
                  }}
                />
              )}

              {courseViewMode === 'LIST' && (
                <CourseManager
                  selectedCourseFilter={selectedCourseSlug}
                  onSelectCourseFilter={setSelectedCourseSlug}
                  selectedCategoryFilter={selectedCategorySlug}
                  onSelectCategoryFilter={setSelectedCategorySlug}
                  selectedStatusFilter={courseStatusFilter}
                  onSelectStatusFilter={setCourseStatusFilter}
                  categories={categories}
                  onCategoriesChanged={loadCategories}
                  onCoursesLoaded={setDynamicCourses}
                  onCreateCourseClick={() => {
                    setActiveTab('create_course');
                    setCourseViewMode('CREATE');
                    setSelectedStudioCourse(null);
                    setSelectedTheoryModule(null);
                    updateBrowserUrl({ tab: 'create_course', mode: 'CREATE' });
                  }}
                  onOpenCourseStudio={handleOpenStudio}
                />
              )}
            </>
          )}

          {activeTab === 'users' && <UserManagementCenter apiUrl={API_URL} />}

          {activeTab === 'datasets' && (
            <DatasetExportCenter
              apiUrl={API_URL}
              activeFilter={datasetFilter}
              onFilterChange={setDatasetFilter}
              userFilter={datasetUserFilter}
              onUserFilterChange={setDatasetUserFilter}
              onStatsChange={setDatasetStats}
              onUsersLoaded={setDatasetActiveUsers}
            />
          )}

          {activeTab === 'verifier' && <BktAuditVerifierCenter apiUrl={API_URL} />}

          {activeTab === 'system' && (
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-slate-800/80">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>Конфігурація Релейєра Web3 & Смарт-Контрактів</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Статус підключення Hardhat/Foundry, гаманців релейєра для Gasless SBT мінтингу.
                </p>
              </div>
            </div>
          )}
        </div>
      </AppShellLayout>

      {/* 👤 Спільний уніфікований Drawer профілю адміністратора */}
      <UserProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        user={{
          name: 'Адміністратор Системи',
          roleName: 'Методист CMS',
          roleBadge: 'ADMIN',
          subtitle: 'Root Governance · ID: sys-admin',
          initials: 'АД',
          avatarGradient: 'bg-gradient-to-tr from-emerald-600 to-teal-500',
        }}
        activeCourseSlug={selectedCourseSlug || undefined}
        courses={dynamicCourses.map((c) => ({
          slug: c.slug,
          title: c.title,
          category: (c.category as any)?.title,
          skillsCount: c.skills?.length || 0,
          totalSkillsCount: c.skills?.length || 10,
        }))}
        onSelectCourse={(courseSlug) => {
          setSelectedCourseSlug(courseSlug);
        }}
        stats={[
          {
            label: 'Всього курсів',
            value: `${dynamicCourses.length}`,
            valueColor: 'text-emerald-400',
          },
          {
            label: 'Всього модулів',
            value: `${dynamicCourses.reduce((acc, c) => acc + (c.modules?.length || 0), 0)}`,
            valueColor: 'text-indigo-400',
          },
          {
            label: 'Статус Релейєра',
            value: 'Online',
            valueColor: 'text-emerald-400',
          },
        ]}
        resetDemoLabel="Скинути всі фільтри"
        onResetDemoState={() => {
          setSelectedCourseSlug(null);
          setSelectedCategorySlug(null);
          setDatasetFilter('ALL');
          setDatasetUserFilter('');
        }}
      />
    </>
  );
}
