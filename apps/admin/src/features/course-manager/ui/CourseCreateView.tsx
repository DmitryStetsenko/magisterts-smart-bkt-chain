'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ArrowLeft,
  Sparkles,
  Layers,
  Target,
  Users,
  Folder,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import type { CourseDto, CreateCourseDto, CourseCategoryDto } from '@sbc/types';

interface CourseCreateViewProps {
  categories?: CourseCategoryDto[];
  onCreated: (newCourse: CourseDto) => void;
  onCancel: () => void;
}

export const CourseCreateView: React.FC<CourseCreateViewProps> = ({
  categories = [],
  onCreated,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetAudience, setTargetAudience] = useState('10-11 класи, Студенти коледжів');
  const [defaultMasteryThreshold, setDefaultMasteryThreshold] = useState<number>(0.85);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slug || slug === autoSlug(title)) {
      setSlug(autoSlug(newTitle));
    }
  };

  const autoSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Назва курсу обовʼязкова');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CreateCourseDto = {
        title: title.trim(),
        slug: slug.trim() || autoSlug(title),
        description: description.trim() || undefined,
        categoryId: categoryId || undefined,
        targetAudience: targetAudience.trim() || undefined,
        defaultMasteryThreshold: Number(defaultMasteryThreshold),
        isPublished,
      };

      const res = await fetch(`${API_URL}/api/v1/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdCourse = await res.json();
        onCreated(createdCourse);
      } else {
        const data = await res.json();
        setError(data.message || 'Помилка при створенні курсу');
      }
    } catch (err: any) {
      setError('Помилка мережі при збереженні курсу');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl animate-fadeIn">
      {/* Top action header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Повернутися до списку курсів"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Створення Нового Навчального Курсу</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Задайте назву, слаг, категорію, цільову аудиторію та поріг BKT для нової дисципліни
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          Скасувати
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Section 1: Core Parameters */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Основні метадані курсу</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">
                Назва курсу <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="наприклад, Основи кібербезпеки та криптографії"
                value={title}
                onChange={handleTitleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Ідентифікатор слага (URL-slug) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="cybersecurity-basics"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="text-[10px] text-slate-500">
                Використовується в URL: /learn/{slug || '...'} та /practice/{slug || '...'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Folder className="w-3 h-3 text-amber-400" />
                <span>Предметна галузь (Категорія)</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                <option value="">Без категорії (Загальна дисципліна)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-indigo-400" />
                <span>Цільова аудиторія</span>
              </label>
              <input
                type="text"
                placeholder="наприклад, 10-11 класи, ВНЗ"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Target className="w-3 h-3 text-emerald-400" />
                <span>Нормативний поріг BKT (Mastery Threshold)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="0.99"
                value={defaultMasteryThreshold}
                onChange={(e) => setDefaultMasteryThreshold(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="text-[10px] text-slate-500">
                Ймовірність P(L), необхідна для зарахування навичок (дефолт: 0.85)
              </span>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">
                Опис курсу & Методичні цілі
              </label>
              <textarea
                rows={3}
                placeholder="Короткий анотований зміст курсу, ключові компетентності та результати навчання..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Visibility & Publication */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">Опублікувати курс у каталозі</span>
            <span className="text-[11px] text-slate-400">
              {isPublished
                ? 'Курс буде доступний викладачам для створення навчальних груп та учням у підручнику'
                : 'Курс збережеться як чернетка (видимий лише адміністраторам)'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Скасувати
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-emerald-950/50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Збереження...' : 'Створити Навчальний Курс'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
