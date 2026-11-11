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
  ExternalLink
} from 'lucide-react';
import { AppShellLayout, Breadcrumbs, UserProfileDrawer, DrawerSection } from '@sbc/ui';
import { getAppBaseUrl } from '@sbc/routes';
import type { CourseDto, CourseCategoryDto } from '@sbc/types';
import { CourseManager } from '../features/course-manager/ui/CourseManager';
import { CourseCreateView } from '../features/course-manager/ui/CourseCreateView';
import { CourseStudioView } from '../features/course-manager/ui/CourseStudioView';
import { DatasetExportCenter, DatasetStats } from '../features/dataset-export/ui/DatasetExportCenter';
import { BktAuditVerifierCenter } from '../features/verifier/ui/BktAuditVerifierCenter';
import { UserManagementCenter } from '../features/users/ui/UserManagementCenter';

export default function AdminCMSDashboard() {
  type AdminTab = 'courses' | 'users' | 'datasets' | 'verifier' | 'system';
  type CourseViewMode = 'LIST' | 'CREATE' | 'STUDIO';

  const [activeTab, setActiveTab] = useState<AdminTab>('courses');
  const [courseViewMode, setCourseViewMode] = useState<CourseViewMode>('LIST');
  const [selectedStudioCourse, setSelectedStudioCourse] = useState<CourseDto | null>(null);
  const [studioSubTab, setStudioSubTab] = useState<'CURRICULUM' | 'SETTINGS'>('CURRICULUM');

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);

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

  const loadCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/courses`);
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

  const handleTabClick = (tabId: string) => {
    const tab = tabId as AdminTab;
    if (activeTab === tab) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setActiveTab(tab);
      setIsDrawerOpen(true);
    }
  };

  const handleOpenStudio = (course: CourseDto, initialTab: 'CURRICULUM' | 'SETTINGS' = 'CURRICULUM') => {
    setSelectedStudioCourse(course);
    setStudioSubTab(initialTab);
    setCourseViewMode('STUDIO');
  };

  const handleBackToCoursesList = () => {
    setCourseViewMode('LIST');
    setSelectedStudioCourse(null);
    setStudioSubTab('CURRICULUM');
    loadCourses();
  };

  const getDrawerConfig = () => {
    let title: React.ReactNode = 'Навігація';
    let icon = BookOpen;
    let iconColor = 'text-emerald-400';

    if (activeTab === 'courses') {
      if (courseViewMode === 'STUDIO' && selectedStudioCourse) {
        title = 'Керування курсом';
        icon = BookOpen;
        iconColor = 'text-indigo-400';
      } else if (courseViewMode === 'CREATE') {
        title = 'Створення Курсу';
        icon = Plus;
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
          {/* Drawer: Course Studio Mode (Non-redundant, high-productivity navigation) */}
          {activeTab === 'courses' && courseViewMode === 'STUDIO' && selectedStudioCourse && (
            <>
              {/* Studio Workspace Sections */}
              <DrawerSection
                title="Розділи Студії"
                icon={Layers}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setStudioSubTab('CURRICULUM')}
                    className={`w-full py-2 px-2.5 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between group ${
                      studioSubTab === 'CURRICULUM'
                        ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className={`w-3.5 h-3.5 ${studioSubTab === 'CURRICULUM' ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>Навчальний план & DAG</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {selectedStudioCourse.modules?.length || 0} тем
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudioSubTab('SETTINGS')}
                    className={`w-full py-2 px-2.5 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between group ${
                      studioSubTab === 'SETTINGS'
                        ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className={`w-3.5 h-3.5 ${studioSubTab === 'SETTINGS' ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>Параметри курсу & BKT</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                      P(L) ≥ {selectedStudioCourse.defaultMasteryThreshold ?? 0.85}
                    </span>
                  </button>

                  <div className="pt-1.5 mt-1 border-t border-slate-800/60">
                    <button
                      type="button"
                      onClick={handleBackToCoursesList}
                      className="w-full py-1.5 px-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/60 transition-colors flex items-center gap-2 text-xs cursor-pointer border border-slate-800/60"
                      title="Повернутися до табличного каталогу курсів"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                      <span>До списку курсів (Каталог)</span>
                    </button>
                  </div>
                </div>
              </DrawerSection>

              {/* Course Switcher: Instant 1-click jump to another course */}
              <DrawerSection
                title="Курси платформи"
                icon={BookOpen}
                badge={dynamicCourses.length}
                defaultOpen={true}
              >
                <div className="flex flex-col divide-y divide-slate-800/50 pt-1">
                  {dynamicCourses.map((c) => {
                    const isCurrent = selectedStudioCourse.slug === c.slug || selectedStudioCourse.id === c.id;
                    const modsCount = c.modules?.length || 0;
                    return (
                      <button
                        key={c.id || c.slug}
                        type="button"
                        onClick={() => {
                          if (!isCurrent) {
                            handleOpenStudio(c, studioSubTab);
                          }
                        }}
                        className={`w-full py-2 pr-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between group rounded-r ${
                          isCurrent
                            ? 'bg-indigo-500/15 text-indigo-300 font-semibold border-l-2 border-indigo-400 pl-2'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/40 pl-2.5'
                        }`}
                        title={isCurrent ? `Поточний курс: ${c.title}` : `Перемкнути Студію на курс: ${c.title}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <span className="truncate">{c.title}</span>
                        </div>
                        <span className={`text-[10px] font-mono shrink-0 ${isCurrent ? 'text-indigo-300 font-bold' : 'text-slate-500'}`}>
                          {isCurrent ? 'Активний' : `${modsCount} мод.`}
                        </span>
                      </button>
                    );
                  })}
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

          {/* Drawer: Courses List Mode */}
          {activeTab === 'courses' && courseViewMode !== 'STUDIO' && (
            <>
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
                title="Доступні курси"
                icon={BookOpen}
                badge={dynamicCourses.length}
                defaultOpen={true}
              >
                <div className="flex flex-col divide-y divide-slate-800/50 pt-1">
                  {dynamicCourses.map((c) => {
                    const isSelected = selectedCourseSlug === c.slug;
                    const modsCount = c.modules?.length || 0;
                    return (
                      <button
                        key={c.id || c.slug}
                        type="button"
                        onClick={() => {
                          setSelectedCourseSlug(isSelected ? null : c.slug);
                        }}
                        className={`w-full py-2 pr-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between group rounded-r ${
                          isSelected
                            ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-2'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/40 pl-2.5'
                        }`}
                        title={`${c.title} (${modsCount} мод.)`}
                      >
                        <span className="truncate pr-1">{c.title}</span>
                        <span className="text-[10px] font-mono opacity-80 shrink-0 text-slate-500">
                          {modsCount} мод.
                        </span>
                      </button>
                    );
                  })}
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
                activeTab === 'courses'
                  ? courseViewMode === 'CREATE'
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
                          label: 'Створення нового курсу',
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
              title: 'Керування Курсами, Модулями & Графами Навичок',
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
          activeTab: activeTab,
          isDrawerOpen: isDrawerOpen,
          onTabClick: handleTabClick,
          onSettingsClick: () => handleTabClick('system'),
          isSettingsActive: activeTab === 'system',
        }}
        drawer={getDrawerConfig()}
        mainClassName="p-4 lg:p-6 overflow-y-auto flex flex-col gap-5 bg-slate-950"
      >
        <div className="flex flex-col gap-5 min-h-[400px]">
          {activeTab === 'courses' && (
            <>
              {courseViewMode === 'CREATE' && (
                <CourseCreateView
                  categories={categories}
                  onCreated={(newCourse) => {
                    loadCourses();
                    handleOpenStudio(newCourse);
                  }}
                  onCancel={handleBackToCoursesList}
                />
              )}

              {courseViewMode === 'STUDIO' && selectedStudioCourse && (
                <CourseStudioView
                  course={selectedStudioCourse}
                  categories={categories}
                  activeSubTab={studioSubTab}
                  onSubTabChange={setStudioSubTab}
                  onBack={handleBackToCoursesList}
                  onCourseUpdated={(updated) => {
                    setSelectedStudioCourse(updated);
                    loadCourses();
                  }}
                  onCourseDeleted={() => {
                    handleBackToCoursesList();
                  }}
                />
              )}

              {courseViewMode === 'LIST' && (
                <CourseManager
                  selectedCourseFilter={selectedCourseSlug}
                  onSelectCourseFilter={setSelectedCourseSlug}
                  selectedCategoryFilter={selectedCategorySlug}
                  onSelectCategoryFilter={setSelectedCategorySlug}
                  categories={categories}
                  onCategoriesChanged={loadCategories}
                  onCoursesLoaded={setDynamicCourses}
                  onCreateCourseClick={() => {
                    setCourseViewMode('CREATE');
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
