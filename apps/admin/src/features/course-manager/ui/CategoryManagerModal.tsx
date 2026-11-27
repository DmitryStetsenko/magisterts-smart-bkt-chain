'use client';

import React, { useState } from 'react';
import {
  Folder,
  Plus,
  Trash2,
  CheckCircle2,
  Code,
  Languages,
  Scale,
  Binary,
} from 'lucide-react';
import type { CourseCategoryDto, CreateCourseCategoryDto } from '@sbc/types';
import { Modal, Button } from '@sbc/ui';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CourseCategoryDto[];
  onCategoriesChanged: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCategoriesChanged,
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Code');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Вкажіть назву категорії');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload: CreateCourseCategoryDto = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        icon,
      };

      const res = await fetch(`${API_URL}/api/v1/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setTitle('');
        setSlug('');
        setDescription('');
        setSuccessMessage('Категорію успішно створено!');
        onCategoriesChanged();
      } else {
        const data = await res.json();
        setError(data.message || 'Помилка при створенні категорії');
      }
    } catch (err) {
      setError('Помилка мережі при створенні категорії');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, catTitle: string) => {
    if (!confirm(`Видалити категорію "${catTitle}"? Курси не видаляться, але втратять прив'язку.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccessMessage(`Категорію "${catTitle}" видалено`);
        onCategoriesChanged();
      }
    } catch (err) {
      setError('Помилка при видаленні категорії');
    }
  };

  const getCategoryIconComponent = (iconName?: string | null) => {
    switch (iconName?.toLowerCase()) {
      case 'code':
        return <Code className="w-3.5 h-3.5 text-emerald-400" />;
      case 'languages':
        return <Languages className="w-3.5 h-3.5 text-indigo-400" />;
      case 'scale':
        return <Scale className="w-3.5 h-3.5 text-purple-400" />;
      case 'binary':
        return <Binary className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Folder className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      icon={
        <div className="p-2 bg-emerald-950/50 border border-emerald-500/30 rounded-lg text-emerald-400">
          <Folder className="w-5 h-5" />
        </div>
      }
      title="Керування Предметними Категоріями"
      subtitle="Наскрізна класифікація курсів за галузями знань"
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Закрити
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">

        {error && (
          <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-300 text-xs">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content body: 2 columns (Form on left / List on right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto pr-1">
          {/* Left: Create form */}
          <form onSubmit={handleCreateCategory} className="flex flex-col gap-3 p-4 rounded-xl border border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-semibold text-slate-200">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Додати Нову Категорію</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Назва Категорії *
              </label>
              <input
                type="text"
                required
                placeholder="напр. Комп'ютерні Науки"
                value={title}
                onChange={handleTitleChange}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Slug (Унікальний ідентифікатор)
              </label>
              <input
                type="text"
                placeholder="cs-algorithms"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Іконка Напряму
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Code">💻 Програмування (Code)</option>
                <option value="Languages">🌍 Мови (Languages)</option>
                <option value="Scale">⚖️ Право (Scale)</option>
                <option value="Binary">🔬 Точні науки (Binary)</option>
                <option value="BookOpen">📖 Гуманітарні науки (BookOpen)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Опис Категорії
              </label>
              <textarea
                rows={2}
                placeholder="Стислий опис дисципліни..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Створення...' : 'Зберегти Категорію'}</span>
            </button>
          </form>

          {/* Right: Existing categories list */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center justify-between pb-1 border-b border-slate-800">
              <span>Активні Категорії ({categories.length})</span>
            </span>

            <div className="flex flex-col divide-y divide-slate-800/60 max-h-[360px] overflow-y-auto pr-1">
              {categories.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Немає створених категорій
                </div>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="py-2.5 flex items-center justify-between gap-2 group hover:bg-slate-800/20 px-1 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded bg-slate-800/80 shrink-0">
                        {getCategoryIconComponent(cat.icon)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-white truncate">
                          {cat.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>{cat.slug}</span>
                          <span>•</span>
                          <span className="text-indigo-400">
                            {cat.coursesCount ?? 0} курсів
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.title)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Видалити категорію"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
