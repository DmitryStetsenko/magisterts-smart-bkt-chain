'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  Users,
  Search,
  Target,
  CheckCircle2,
  AlertCircle,
  Shield,
  Folder,
} from 'lucide-react';
import type { CourseDto, CreateCourseDto, CourseCategoryDto } from '@sbc/types';
import { CourseEditModal } from './CourseEditModal';
import { ModuleManagerModal } from './ModuleManagerModal';
import { CategoryManagerModal } from './CategoryManagerModal';

export interface CourseManagerProps {
  selectedCourseFilter?: string | null;
  onSelectCourseFilter?: (slug: string | null) => void;
  selectedCategoryFilter?: string | null;
  onSelectCategoryFilter?: (slug: string | null) => void;
  categories?: CourseCategoryDto[];
  onCategoriesChanged?: () => void;
  onCoursesLoaded?: (courses: CourseDto[]) => void;
  externalEditingCourse?: CourseDto | null;
  onCloseExternalEditingCourse?: () => void;
  onCreateCourseClick?: () => void;
  onOpenCourseStudio?: (course: CourseDto) => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({
  selectedCourseFilter,
  onSelectCourseFilter,
  selectedCategoryFilter,
  onSelectCategoryFilter,
  categories = [],
  onCategoriesChanged,
  onCoursesLoaded,
  externalEditingCourse,
  onCloseExternalEditingCourse,
  onCreateCourseClick,
  onOpenCourseStudio,
}) => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Course edit modal state
  const [editingCourse, setEditingCourse] = useState<CourseDto | null>(null);

  // Module manager modal state
  const [selectedCourseForModules, setSelectedCourseForModules] = useState<CourseDto | null>(null);

  // Category manager modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Form State for creating new course
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetAudience, setTargetAudience] = useState('10-11 класи, ВНЗ');
  const [defaultMasteryThreshold, setDefaultMasteryThreshold] = useState<number>(0.85);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/v1/courses`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCourses(data);
        onCoursesLoaded?.(data);
      } else if (data.courses) {
        setCourses(data.courses);
        onCoursesLoaded?.(data.courses);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setMessage('Помилка завантаження курсів з API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (externalEditingCourse) {
      setEditingCourse(externalEditingCourse);
    }
  }, [externalEditingCourse]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(autoSlug);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      alert('Будь ласка, вкажіть назву та slug курсу');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateCourseDto = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        targetAudience: targetAudience.trim() || undefined,
        defaultMasteryThreshold: Number(defaultMasteryThreshold),
        categoryId: categoryId || undefined,
      };

      const res = await fetch(`${API_URL}/api/v1/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage('Курс успішно створено!');
        setIsModalOpen(false);
        setTitle('');
        setSlug('');
        setDescription('');
        setCategoryId('');
        setTargetAudience('10-11 класи, ВНЗ');
        fetchCourses();
        onCategoriesChanged?.();
      } else {
        const errData = await res.json();
        setMessage(`Помилка: ${errData.message || 'Не вдалося створити курс'}`);
      }
    } catch (err) {
      setMessage('Помилка мережі при створенні курсу');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Ви дійсно бажаєте видалити курс "${courseTitle}"? Це може вплинути на пов'язані групи та модулі.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/courses/${courseId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Курс "${courseTitle}" успішно видалено`);
        fetchCourses();
      } else {
        setMessage(`Помилка: ${data.message || 'Не вдалося видалити курс'}`);
      }
    } catch (err) {
      setMessage('Помилка мережі при видаленні курсу');
    }
  };

  // Filter courses by search query, selectedCourseFilter, and selectedCategoryFilter
  const filteredCourses = courses.filter((c) => {
    if (selectedCourseFilter && c.slug !== selectedCourseFilter) {
      return false;
    }
    if (selectedCategoryFilter && selectedCategoryFilter !== 'ALL') {
      const catSlug = (c.category as any)?.slug;
      if (catSlug !== selectedCategoryFilter && c.categoryId !== selectedCategoryFilter) {
        return false;
      }
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      ((c.category as any)?.title && (c.category as any).title.toLowerCase().includes(q))
    );
  });

  // Summary Metrics
  const totalCoursesCount = courses.length;
  const publishedCoursesCount = courses.filter((c) => c.isPublished !== false).length;
  const totalModulesCount = courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0);
  const totalSkillsCount = courses.reduce((acc, c) => acc + (c.skills?.length || 0), 0);

  return (
    <div className="flex flex-col gap-5 font-sans">
      {/* 1. Header Toolbar (Minimalist Borderless Header) */}
      <div className="pb-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Управління Навчальними Курсами (Dynamic Course CMS)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Створення та реорганізація довільних предметів, модульних структур та Skill DAG специфікацій
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedCourseFilter && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <span className="text-[10px] text-slate-400">Курс:</span>
              <span className="font-semibold text-emerald-300 truncate max-w-[140px]">
                {courses.find((c) => c.slug === selectedCourseFilter)?.title || selectedCourseFilter}
              </span>
              <button
                type="button"
                onClick={() => onSelectCourseFilter?.(null)}
                className="hover:text-white text-slate-400 cursor-pointer ml-1 text-[11px]"
                title="Скинути фільтр курсу"
              >
                ✕
              </button>
            </div>
          )}

          {selectedCategoryFilter && selectedCategoryFilter !== 'ALL' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <span className="text-[10px] text-slate-400">Галузь:</span>
              <span className="font-semibold text-amber-300 truncate max-w-[140px]">
                {categories.find((cat) => cat.slug === selectedCategoryFilter)?.title || selectedCategoryFilter}
              </span>
              <button
                type="button"
                onClick={() => onSelectCategoryFilter?.(null)}
                className="hover:text-white text-slate-400 cursor-pointer ml-1 text-[11px]"
                title="Скинути фільтр галузі"
              >
                ✕
              </button>
            </div>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Пошук курсів..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs w-44 sm:w-56"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
            title="Керування предметними категоріями"
          >
            <Folder className="w-3.5 h-3.5 text-amber-400" />
            <span>Категорії ({categories.length})</span>
          </button>

          <button
            onClick={() => {
              if (onCreateCourseClick) {
                onCreateCourseClick();
              } else {
                setIsModalOpen(true);
              }
            }}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Створити Новий Курс</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="px-3.5 py-2.5 rounded-xl border border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Всього Курсів</span>
            <span className="text-base font-bold text-white font-mono">{totalCoursesCount}</span>
          </div>
          <BookOpen className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="px-3.5 py-2.5 rounded-xl border border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Опубліковано</span>
            <span className="text-base font-bold text-indigo-400 font-mono">{publishedCoursesCount}</span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
        </div>

        <div className="px-3.5 py-2.5 rounded-xl border border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Всього Модулів</span>
            <span className="text-base font-bold text-purple-400 font-mono">{totalModulesCount}</span>
          </div>
          <Layers className="w-4 h-4 text-purple-400" />
        </div>

        <div className="px-3.5 py-2.5 rounded-xl border border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Навичок у Програмі</span>
            <span className="text-base font-bold text-amber-400 font-mono">{totalSkillsCount}</span>
          </div>
          <Target className="w-4 h-4 text-amber-400" />
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 3. Course List (Minimalist Borderless Sequence with divide-y) */}
      <div className="flex flex-col divide-y divide-slate-800/50 border-t border-b border-slate-800/80">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            Завантаження переліку курсів...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            Курсів за вашим запитом не знайдено.
          </div>
        ) : (
          filteredCourses.map((course) => {
            const modulesCount = course.modules?.length || 0;
            const skillsCount = course.skills?.length || 0;

            return (
              <div
                key={course.id || course.slug}
                onClick={() => {
                  if (onOpenCourseStudio) {
                    onOpenCourseStudio(course);
                  } else {
                    setEditingCourse(course);
                  }
                }}
                className="py-3.5 px-2 -mx-2 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors group cursor-pointer"
                title="Натисніть для переходу до Студії курсу"
              >
                {/* Left: Course details */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                      <span>{course.title}</span>
                      <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-slate-400 bg-slate-800/60">
                      {course.slug}
                    </span>
                    {(course.category as any)?.title && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                        <Folder className="w-2.5 h-2.5 text-amber-400" />
                        <span>{(course.category as any).title}</span>
                      </span>
                    )}
                    {course.isPublished !== false ? (
                      <span className="text-[10px] font-mono text-emerald-400 font-medium">
                        ✓ Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 font-medium">
                        Чернетка
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {course.description || 'Немає опису'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-400">
                    {course.targetAudience && (
                      <span className="flex items-center gap-1 font-mono text-slate-400">
                        <Users className="w-3 h-3 text-indigo-400" />
                        <span>{course.targetAudience}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono text-emerald-400 font-semibold">
                      <Target className="w-3 h-3" />
                      <span>BKT P(L): {course.defaultMasteryThreshold ?? 0.85}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Metrics and actions */}
                <div 
                  className="flex items-center gap-4 shrink-0 justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/40"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{modulesCount} модулів</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{skillsCount} навичок</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (onOpenCourseStudio) {
                          onOpenCourseStudio(course);
                        } else {
                          setSelectedCourseForModules(course);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Модулі ({modulesCount})</span>
                    </button>
                    <button
                      onClick={() => {
                        if (onOpenCourseStudio) {
                          onOpenCourseStudio(course);
                        } else {
                          setEditingCourse(course);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Редагувати параметри курсу в Студії"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id || '', course.title)}
                      className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Видалити курс"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal dialog for creating new course */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Створення Нового Навчального Курсу</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Назва Курсу *
                </label>
                <input
                  type="text"
                  required
                  placeholder="напр. Вища Математика & Алгебра"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Унікальний Ключ (Slug) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="higher-math"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Опис Курсу
                </label>
                <textarea
                  rows={3}
                  placeholder="Короткий академічний опис компетенцій та модулів даного курсу..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-amber-400" />
                  <span>Предметна Категорія / Галузь</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">Без категорії (Загальний напрям)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title} ({cat.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Цільова Аудиторія
                  </label>
                  <input
                    type="text"
                    placeholder="10-11 кл, Коледж, ВНЗ"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    BKT Поріг P(L) Target
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="0.99"
                    value={defaultMasteryThreshold}
                    onChange={(e) => setDefaultMasteryThreshold(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Збереження...' : 'Зберегти Курс'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <CourseEditModal
          course={editingCourse}
          categories={categories}
          isOpen={true}
          onClose={() => {
            setEditingCourse(null);
            onCloseExternalEditingCourse?.();
          }}
          onSaved={() => {
            setMessage('Параметри курсу успішно оновлено!');
            setEditingCourse(null);
            onCloseExternalEditingCourse?.();
            fetchCourses();
            onCategoriesChanged?.();
          }}
        />
      )}

      {/* Module Manager Modal */}
      {selectedCourseForModules && (
        <ModuleManagerModal
          course={selectedCourseForModules}
          isOpen={true}
          onClose={() => setSelectedCourseForModules(null)}
          onModulesChanged={() => {
            fetchCourses();
          }}
        />
      )}

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCategoriesChanged={() => {
          onCategoriesChanged?.();
          fetchCourses();
        }}
      />
    </div>
  );
};
