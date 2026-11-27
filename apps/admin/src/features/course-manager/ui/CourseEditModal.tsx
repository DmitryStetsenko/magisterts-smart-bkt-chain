'use client';

import React, { useState } from 'react';
import { Target, Users, BookOpen, Folder } from 'lucide-react';
import type { CourseDto, UpdateCourseDto, CourseCategoryDto } from '@sbc/types';
import { Modal, Button } from '@sbc/ui';

interface CourseEditModalProps {
  course: CourseDto;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories?: CourseCategoryDto[];
}

export const CourseEditModal: React.FC<CourseEditModalProps> = ({
  course,
  isOpen,
  onClose,
  onSaved,
  categories = [],
}) => {
  const [title, setTitle] = useState(course.title);
  const [slug, setSlug] = useState(course.slug);
  const [description, setDescription] = useState(course.description || '');
  const [categoryId, setCategoryId] = useState<string | null>(
    course.categoryId || (typeof course.category === 'object' && course.category ? (course.category as any).id : null)
  );
  const [targetAudience, setTargetAudience] = useState(course.targetAudience || '10-11 класи, Студенти коледжів');
  const [defaultMasteryThreshold, setDefaultMasteryThreshold] = useState<number>(
    course.defaultMasteryThreshold ?? 0.85
  );
  const [isPublished, setIsPublished] = useState<boolean>(course.isPublished ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Назва курсу обовʼязкова');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: UpdateCourseDto = {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        categoryId: categoryId || null,
        targetAudience: targetAudience.trim() || undefined,
        defaultMasteryThreshold: Number(defaultMasteryThreshold),
        isPublished,
      };

      const res = await fetch(`${API_URL}/api/v1/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || 'Помилка при оновленні курсу');
      }
    } catch (err: any) {
      setError('Помилка мережі при оновленні курсу');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      icon={
        <div className="p-2 bg-purple-950/50 border border-purple-500/30 rounded-lg text-purple-400">
          <BookOpen className="w-5 h-5" />
        </div>
      }
      title="Редагування Курсу"
      subtitle={<span className="font-mono">ID: {course.id}</span>}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Скасувати
          </Button>
          <Button
            type="submit"
            form="admin-edit-course-form"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Збереження...' : 'Зберегти Зміни'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form id="admin-edit-course-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Назва Курсу *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span>Предметна Категорія / Галузь</span>
            </label>
            <select
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="">Без категорії (Загальний напрям)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title} ({cat.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Цільова Аудиторія</span>
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="10-11 кл, Коледж, ВНЗ"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Поріг BKT P(L) Target</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="0.99"
                value={defaultMasteryThreshold}
                onChange={(e) => setDefaultMasteryThreshold(parseFloat(e.target.value) || 0.85)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">Статус Публікації Курсу</span>
              <span className="text-[11px] text-slate-400">
                {isPublished ? 'Курс доступний у каталозі та для зарахування' : 'Чернетка (приховано)'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </form>
      </div>
    </Modal>
  );
};
