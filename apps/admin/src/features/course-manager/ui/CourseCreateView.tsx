'use client';

import React, { useState, useEffect } from 'react';
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
import { slugify, validateSlug } from '@sbc/routes';

interface CourseCreateViewProps {
  categories?: CourseCategoryDto[];
  onCreated: (newCourse: CourseDto) => void;
  onCancel: () => void;
}

interface MasteryStandard {
  value: number;
  title: string;
  badge: string;
  tag: string;
  color: 'emerald' | 'amber' | 'indigo';
  description: string;
}

export const MASTERY_STANDARDS: MasteryStandard[] = [
  {
    value: 0.85,
    title: '0.85 — Золотий стандарт',
    badge: 'Рекомендовано',
    tag: 'За замовчуванням',
    color: 'emerald',
    description: 'Оптимум Corbett & Anderson. Забезпечує стабільне закріплення знань і формування стійких навичок без когнітивного перевантаження учня. Підходить для більшості навчальних дисциплін.',
  },
  {
    value: 0.90,
    title: '0.90 — Висока строгість',
    badge: 'Критичні навички',
    tag: 'STEM / Безпека',
    color: 'amber',
    description: 'Для точних наук, криптографії, алгоритміки та кібербезпеки. Практично виключає фактор випадкового вгадування (Guess) та вимагає від учня глибокого впевненого володіння темою.',
  },
  {
    value: 0.80,
    title: '0.80 — Оглядовий поріг',
    badge: 'Швидкий темп',
    tag: 'Факультативи',
    color: 'indigo',
    description: 'Для факультативів, гуманітарних або оглядових курсів. Спрямований на швидке знайомство з матеріалом, загальну ерудицію та мінімальні барʼєри при переході між розділами.',
  },
];

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
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedPresetName, setAppliedPresetName] = useState<string | null>(null);

  const selectedStandard = MASTERY_STANDARDS.find(
    (s) => Math.abs(defaultMasteryThreshold - s.value) < 0.001
  );

  useEffect(() => {
    const handleApplyPreset = (e: any) => {
      const preset = e.detail;
      if (!preset) return;
      if (preset.title) setTitle(preset.title);
      if (preset.slug) setSlug(preset.slug);
      if (preset.description) setDescription(preset.description);
      if (preset.targetAudience) setTargetAudience(preset.targetAudience);
      if (typeof preset.defaultMasteryThreshold === 'number') {
        setDefaultMasteryThreshold(preset.defaultMasteryThreshold);
      }
      if (preset.categoryId) {
        setCategoryId(preset.categoryId);
      } else if (preset.categorySlug && categories.length > 0) {
        const found = categories.find(
          (c) => c.slug === preset.categorySlug || c.title.toLowerCase().includes(preset.categorySlug.toLowerCase())
        );
        if (found) setCategoryId(found.id);
      }
      setAppliedPresetName(preset.presetTitle || preset.title);
      setError(null);
    };

    const handleSetThreshold = (e: any) => {
      if (typeof e.detail === 'number') {
        setDefaultMasteryThreshold(e.detail);
      }
    };

    window.addEventListener('admin-course-apply-preset', handleApplyPreset as EventListener);
    window.addEventListener('admin-course-set-threshold', handleSetThreshold as EventListener);
    return () => {
      window.removeEventListener('admin-course-apply-preset', handleApplyPreset as EventListener);
      window.removeEventListener('admin-course-set-threshold', handleSetThreshold as EventListener);
    };
  }, [categories]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Auto-generate slug from title with Ukrainian transliteration
  const autoSlug = (text: string) => {
    return slugify(text, { maxLength: 50 });
  };

  const slugValidation = validateSlug(slug, { maxLength: 50 });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slug || slug === autoSlug(title)) {
      setSlug(autoSlug(newTitle));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Назва курсу обовʼязкова');
      return;
    }

    const effectiveSlug = slug.trim() || autoSlug(title);
    const validation = validateSlug(effectiveSlug, { maxLength: 50 });
    if (!validation.isValid) {
      setError(validation.error || 'Невалідний слаг курсу');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CreateCourseDto = {
        title: title.trim(),
        slug: effectiveSlug,
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

      {/* 5-Step Guided Course Creation Wizard Stepper Header */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2.5 select-none shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Покроковий майстер курсу: Крок 1 з 5</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
            Базові метадані (Поточний)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-0.5">
          <div className="p-2 rounded-lg bg-emerald-500/15 border-l-2 border-emerald-400 flex items-center gap-2 text-[11px] font-semibold text-emerald-300">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono shrink-0">1</span>
            <span className="truncate">1. Метадані (Зараз)</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-500 opacity-60 cursor-not-allowed" title="Крок 2 заблоковано. Спочатку збережіть базові метадані.">
            <span className="text-[10px] shrink-0">🔒</span>
            <span className="truncate">2. Модулі</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-500 opacity-60 cursor-not-allowed" title="Крок 3 заблоковано. Доступно після створення модулів.">
            <span className="text-[10px] shrink-0">🔒</span>
            <span className="truncate">3. Компетенції</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-500 opacity-60 cursor-not-allowed" title="Крок 4 заблоковано. Доступно після налаштування графу.">
            <span className="text-[10px] shrink-0">🔒</span>
            <span className="truncate">4. Конспекти</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center gap-2 text-[11px] text-slate-500 opacity-60 cursor-not-allowed" title="Крок 5 заблоковано. Завдання та фінальне тестування.">
            <span className="text-[10px] shrink-0">🔒</span>
            <span className="truncate">5. Завдання & Тест</span>
          </div>
        </div>
      </div>

      {appliedPresetName && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Застосовано дидактичний шаблон: <strong>{appliedPresetName}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAppliedPresetName(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5 cursor-pointer"
            title="Приховати"
          >
            ✕
          </button>
        </div>
      )}

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
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Ідентифікатор слага (URL-slug) <span className="text-rose-400">*</span>
                </label>
                {slug && slug !== autoSlug(title) && (
                  <button
                    type="button"
                    onClick={() => setSlug(autoSlug(title))}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                  >
                    ↻ З назви
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="cybersecurity-basics"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-none transition-colors ${
                  slug && !slugValidation.isValid
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
              {slug ? (
                slugValidation.isValid ? (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Використовується в URL: <code className="font-mono text-emerald-300">/learn/{slug}</code> та <code className="font-mono text-emerald-300">/practice/{slug}</code></span>
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>{slugValidation.error}</span>
                  </span>
                )
              ) : (
                <span className="text-[10px] text-slate-500">
                  Використовується в URL: /learn/... та /practice/... (транслітерується автоматично)
                </span>
              )}
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

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-indigo-400" />
                <span>Цільова аудиторія</span>
              </label>
              <input
                type="text"
                placeholder="наприклад, 10-11 класи, ВНЗ, Профільні IT-ліцеї"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* BKT Mastery Calibration Standards & Interactive Switcher */}
            <div className="flex flex-col gap-3 md:col-span-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/60">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Нормативний поріг майстерності BKT (Mastery Threshold)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Ймовірність впевненості моделі P(L), необхідна для атестації компетенцій
                  </span>
                </div>

                {/* Direct Numeric Input with quick step */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-semibold text-slate-400">P(L) ≥</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="0.99"
                    value={defaultMasteryThreshold}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setDefaultMasteryThreshold(isNaN(val) ? 0.85 : val);
                    }}
                    className="w-20 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-emerald-400 text-center focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Segmented Preset Switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {MASTERY_STANDARDS.map((std) => {
                  const isSelected = selectedStandard?.value === std.value;
                  return (
                    <button
                      key={std.value}
                      type="button"
                      onClick={() => setDefaultMasteryThreshold(std.value)}
                      className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1.5 border relative ${
                        isSelected
                          ? std.color === 'emerald'
                            ? 'bg-emerald-500/15 border-emerald-500/80 text-white shadow-sm'
                            : std.color === 'amber'
                            ? 'bg-amber-500/15 border-amber-500/80 text-white shadow-sm'
                            : 'bg-indigo-500/15 border-indigo-500/80 text-white shadow-sm'
                          : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {std.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                            isSelected
                              ? std.color === 'emerald'
                                ? 'bg-emerald-500/25 text-emerald-300 font-semibold'
                                : std.color === 'amber'
                                ? 'bg-amber-500/25 text-amber-300 font-semibold'
                                : 'bg-indigo-500/25 text-indigo-300 font-semibold'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {std.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {std.tag}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Pedagogical Description Callout */}
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] leading-relaxed text-slate-300 flex items-start gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-200">
                    {selectedStandard
                      ? `${selectedStandard.title} (${selectedStandard.badge})`
                      : `Користувацький поріг: P(L) = ${defaultMasteryThreshold}`}
                  </span>
                  <span className="text-slate-400">
                    {selectedStandard
                      ? selectedStandard.description
                      : `Індивідуально заданий поріг впевненості моделі BKT. Компетенція зараховується учню при досягненні ймовірності ${Math.round(defaultMasteryThreshold * 100)}%.`}
                  </span>
                </div>
              </div>
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

        {/* Section 2: Visibility & Publication Status */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Статус курсу: Чернетка (в процесі створення)</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Курс зберігається як чернетка та не відображається у загальному каталозі курсів, поки не будуть створені модулі, конспекти та виконана фінальна публікація на Кроці 5.
            </span>
          </div>

          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-semibold shrink-0">
            ● Чернетка
          </span>
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
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-emerald-950/50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Створення курсу...' : 'Зберегти та перейти до Модулів (Крок 2) →'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
