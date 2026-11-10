'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Sparkles,
  CheckCircle2,
  Layers,
  Edit2,
  Trash2,
  Target,
  Users,
  Search,
} from 'lucide-react';
import type { CourseDto } from '@sbc/types';
import { CourseEditModal } from './CourseEditModal';
import { ModuleManagerModal } from './ModuleManagerModal';

export type CourseData = CourseDto;

export const CourseManager: React.FC = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Course modal for editing & module manager
  const [editingCourse, setEditingCourse] = useState<CourseDto | null>(null);
  const [selectedCourseForModules, setSelectedCourseForModules] = useState<CourseDto | null>(null);

  // Form fields for new course
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('10-11 класи, Студенти коледжів');
  const [defaultMasteryThreshold, setDefaultMasteryThreshold] = useState<number>(0.85);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/courses`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCourses(data);
        }
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          description: description.trim(),
          targetAudience: targetAudience.trim() || undefined,
          defaultMasteryThreshold: Number(defaultMasteryThreshold),
          icon: 'BookOpen',
        }),
      });

      if (res.ok) {
        setMessage('Курс успішно створено!');
        setTitle('');
        setSlug('');
        setDescription('');
        setIsModalOpen(false);
        fetchCourses();
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

      if (res.ok) {
        setMessage(`Курс "${courseTitle}" успішно видалено`);
        fetchCourses();
      } else {
        const data = await res.json();
        setMessage(`Помилка: ${data.message || 'Не вдалося видалити курс'}`);
      }
    } catch (err) {
      setMessage('Помилка мережі при видаленні курсу');
    }
  };

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Управління Навчальними Курсами (Dynamic Course CMS)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Створення та реорганізація довільних предметів, модульних структур та Skill DAG специфікацій
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Пошук курсів..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-48 sm:w-64"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Створити Новий Курс</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Course List Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-mono">
          Завантаження переліку курсів...
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs font-mono bg-slate-900 border border-slate-800 rounded-2xl">
          Курсів за вашим запитом не знайдено.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const modulesCount = course.modules?.length || 0;
            const skillsCount = course.skills?.length || 0;

            return (
              <div
                key={course.id || course.slug}
                className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between gap-5 shadow-xl hover:border-slate-700 transition-all group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        {course.slug}
                      </span>
                      {course.isPublished !== false && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {course.description || 'Немає опису'}
                    </p>
                  </div>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                    {course.targetAudience && (
                      <span className="flex items-center gap-1 font-mono text-indigo-400">
                        <Users className="w-3 h-3" />
                        <span>{course.targetAudience}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono text-emerald-400">
                      <Target className="w-3 h-3" />
                      <span>BKT P(L): {course.defaultMasteryThreshold ?? 0.85}</span>
                    </span>
                  </div>
                </div>

                {/* Bottom stats & action buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{modulesCount} Модулів</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{skillsCount} Навичок</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedCourseForModules(course)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Модулі ({modulesCount})</span>
                    </button>
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Редагувати параметри курсу"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id || '', course.title)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Видалити курс"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal dialog for creating new course */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
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
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Цільова Аудиторія
                  </label>
                  <input
                    type="text"
                    placeholder="10-11 кл, Коледж, ВНЗ"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
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
          isOpen={true}
          onClose={() => setEditingCourse(null)}
          onSaved={() => {
            setMessage('Параметри курсу успішно оновлено!');
            fetchCourses();
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
    </div>
  );
};
