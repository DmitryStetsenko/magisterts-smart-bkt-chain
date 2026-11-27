'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  Network,
  BookOpen,
  Settings,
  ArrowRight,
  Database,
  Sparkles,
  Layers,
  Activity,
  Users,
  Edit2,
  PlusCircle,
} from 'lucide-react';
import { AppShellLayout, Breadcrumbs, UserProfileDrawer } from '@sbc/ui';
import { getAppBaseUrl } from '@sbc/routes';
import type { CourseDto, CourseCategoryDto, CourseModuleDto } from '@sbc/types';
import { COURSE_PRESETS } from '@/shared/config/coursePresets';
import {
  AdminSidebarDrawer,
  type AdminTab,
  type CourseViewMode,
  type DatasetFilterType,
} from '@/widgets/admin-sidebar';
import { CourseManager } from '@/features/course-manager/ui/CourseManager';
import { CourseCreateView } from '@/features/course-manager/ui/CourseCreateView';
import { CourseStudioView } from '@/features/course-manager/ui/CourseStudioView';
import { TheoryLessonBuilderView } from '@/features/course-manager/ui/TheoryLessonBuilderView';
import { CourseImportModal } from '@/features/course-manager/ui/CourseImportModal';
import { AiCourseScaffolderModal } from '@/features/course-manager/ui/AiCourseScaffolderModal';
import { DatasetExportCenter, DatasetStats } from '@/features/dataset-export/ui/DatasetExportCenter';
import { BktAuditVerifierCenter } from '@/features/verifier/ui/BktAuditVerifierCenter';
import { UserManagementCenter } from '@/features/users/ui/UserManagementCenter';
import { ThemeCustomizerView } from '@/features/theme-customizer/ui/ThemeCustomizerView';

export default function AdminCMSDashboard() {

  const [activeTab, setActiveTab] = useState<AdminTab>('courses');
  const [courseViewMode, setCourseViewMode] = useState<CourseViewMode>('LIST');
  const [selectedStudioCourse, setSelectedStudioCourse] = useState<CourseDto | null>(null);
  const [selectedTheoryModule, setSelectedTheoryModule] = useState<CourseModuleDto | null>(null);
  const [studioSubTab, setStudioSubTab] = useState<'CURRICULUM' | 'SETTINGS'>('CURRICULUM');

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);

  const [authorStep, setAuthorStep] = useState<number>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isAiScaffoldModalOpen, setIsAiScaffoldModalOpen] = useState<boolean>(false);

  // Search & Filter state for Drawer Sections
  const [datasetFilter, setDatasetFilter] = useState<DatasetFilterType>('ALL');
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
              const hasModules = (matchCourse.modules?.length ?? 0) > 0;
              setMaxUnlockedStep(hasModules ? 5 : 2);
              setAuthorStep(2);
              return matchCourse;
            }
            fetch(`${API_URL}/api/v1/courses/${courseParam}`)
              .then((res) => (res.ok ? res.json() : null))
              .then((fetched) => {
                if (fetched) {
                  setSelectedStudioCourse(fetched);
                  setSelectedTheoryModule(null);
                  setCourseViewMode('STUDIO');
                  const hasModules = (fetched.modules?.length ?? 0) > 0;
                  setMaxUnlockedStep(hasModules ? 5 : 2);
                  setAuthorStep(2);
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
            const hasModules = (matchCourse.modules?.length ?? 0) > 0;
            setMaxUnlockedStep(hasModules ? 5 : 2);
            setAuthorStep(2);
            return matchCourse;
          }
          fetch(`${API_URL}/api/v1/courses/${courseParam}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((fetched) => {
              if (fetched) {
                setSelectedStudioCourse(fetched);
                setSelectedTheoryModule(null);
                setCourseViewMode('STUDIO');
                const hasModules = (fetched.modules?.length ?? 0) > 0;
                setMaxUnlockedStep(hasModules ? 5 : 2);
                setAuthorStep(2);
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
        <AdminSidebarDrawer
          apiUrl={API_URL}
          activeTab={activeTab}
          courseViewMode={courseViewMode}
          selectedStudioCourse={selectedStudioCourse}
          onSetSelectedStudioCourse={setSelectedStudioCourse}
          selectedTheoryModule={selectedTheoryModule}
          onBackToStudio={handleBackToStudio}
          onOpenTheory={handleOpenTheory}
          onOpenStudio={handleOpenStudio}
          onLoadCourses={loadCourses}
          studioSubTab={studioSubTab}
          onSetStudioSubTab={setStudioSubTab}
          authorStep={authorStep}
          maxUnlockedStep={maxUnlockedStep}
          onStepClick={handleStepClick}
          onOpenAiScaffoldModal={() => setIsAiScaffoldModalOpen(true)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          dynamicCourses={dynamicCourses}
          categories={categories}
          selectedCourseSlug={selectedCourseSlug}
          onSelectCourseSlug={setSelectedCourseSlug}
          selectedCategorySlug={selectedCategorySlug}
          onSelectCategorySlug={setSelectedCategorySlug}
          courseStatusFilter={courseStatusFilter}
          onSetCourseStatusFilter={setCourseStatusFilter}
          datasetFilter={datasetFilter}
          onSetDatasetFilter={setDatasetFilter}
          datasetUserFilter={datasetUserFilter}
          onSetDatasetUserFilter={setDatasetUserFilter}
          datasetActiveUsers={datasetActiveUsers}
          datasetStats={datasetStats}
        />
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
        mainClassName="p-4 lg:p-6 overflow-y-auto flex flex-col gap-5 bg-[var(--sbc-bg-root,#181818)]"
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
            <div className="flex flex-col gap-6">
              {/* 🎨 1. Повноцінний центр налаштування палітри та тем */}
              <ThemeCustomizerView />

              {/* ⚙️ 2. Конфігурація Web3 & Релейєра */}
              <div className="flex flex-col gap-4 pt-6 border-t border-[var(--sbc-border-subtle,#27272a)] max-w-4xl mx-auto w-full">
                <div className="pb-3 border-b border-[var(--sbc-border-subtle,#27272a)]">
                  <h3 className="text-sm font-bold text-[var(--sbc-text-primary,#f4f4f5)] flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-400" />
                    <span>Конфігурація Релейєра Web3 & Смарт-Контрактів</span>
                  </h3>
                  <p className="text-xs text-[var(--sbc-text-muted,#a1a1aa)] mt-0.5">
                    Статус підключення Hardhat/Foundry, гаманців релейєра для Gasless SBT мінтингу.
                  </p>
                </div>
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

      {/* Global Course Import Modal */}
      <CourseImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onCourseImported={(importedCourse) => {
          setSelectedStudioCourse(importedCourse);
          setActiveTab('create_course');
          setCourseViewMode('STUDIO');
          setAuthorStep(2);
          setMaxUnlockedStep(5);
          loadCourses();
        }}
      />

      {/* Global AI Course Scaffolder Modal */}
      <AiCourseScaffolderModal
        isOpen={isAiScaffoldModalOpen}
        onClose={() => setIsAiScaffoldModalOpen(false)}
        onCourseCreated={(createdCourse) => {
          setSelectedStudioCourse(createdCourse);
          setActiveTab('create_course');
          setCourseViewMode('STUDIO');
          setAuthorStep(2);
          setMaxUnlockedStep(5);
          loadCourses();
        }}
      />
    </>
  );
}
