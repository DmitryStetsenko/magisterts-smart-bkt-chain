'use client';

import React from 'react';
import { Save, Target } from 'lucide-react';
import { DropdownSelect } from '@sbc/ui';
import type { CourseCategoryDto } from '@sbc/types';
import { MASTERY_STANDARDS } from './CourseCreateView';

export interface CourseStudioSettingsTabProps {
  categories: CourseCategoryDto[];
  settingsTitle: string;
  onChangeTitle: (val: string) => void;
  settingsSlug: string;
  onChangeSlug: (val: string) => void;
  settingsCategoryId: string | null;
  onChangeCategoryId: (val: string | null) => void;
  settingsAudience: string;
  onChangeAudience: (val: string) => void;
  settingsThreshold: number;
  onChangeThreshold: (val: number) => void;
  settingsDescription: string;
  onChangeDescription: (val: string) => void;
  settingsPublished: boolean;
  onChangePublished: (val: boolean) => void;
  isSavingSettings: boolean;
  onSaveSettings: (e: React.FormEvent) => void;
  onAdvanceToModules: () => void;
}

/**
 * Вкладка налаштувань паспорта курсу, BKT-порогів та статусу публікації у Course Studio.
 */
export const CourseStudioSettingsTab: React.FC<CourseStudioSettingsTabProps> = ({
  categories,
  settingsTitle,
  onChangeTitle,
  settingsSlug,
  onChangeSlug,
  settingsCategoryId,
  onChangeCategoryId,
  settingsAudience,
  onChangeAudience,
  settingsThreshold,
  onChangeThreshold,
  settingsDescription,
  onChangeDescription,
  settingsPublished,
  onChangePublished,
  isSavingSettings,
  onSaveSettings,
  onAdvanceToModules,
}) => {
  return (
    <form onSubmit={onSaveSettings} className="flex flex-col gap-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-slate-300">Назва курсу *</label>
          <input
            type="text"
            value={settingsTitle}
            onChange={(e) => onChangeTitle(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Slug ID (URL-адреса) *</label>
          <input
            type="text"
            value={settingsSlug}
            onChange={(e) => onChangeSlug(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <DropdownSelect
            label="Предметна галузь (Категорія)"
            fullWidth
            size="md"
            value={settingsCategoryId || ''}
            onChange={(val) => onChangeCategoryId(val || null)}
            options={[
              { value: '', label: 'Без категорії' },
              ...categories.map((c) => ({ value: c.id, label: c.title })),
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Цільова аудиторія</label>
          <input
            type="text"
            value={settingsAudience}
            onChange={(e) => onChangeAudience(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* In-Form BKT Mastery Threshold Standards Switcher in Studio Settings */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Нормативний BKT-поріг майстерності</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {MASTERY_STANDARDS.map((std) => {
              const isSelected = Math.abs(settingsThreshold - std.value) < 0.001;
              return (
                <button
                  key={std.value}
                  type="button"
                  onClick={() => onChangeThreshold(std.value)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm shadow-emerald-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>
                      {std.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{std.badge}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{std.tag}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">Точне числове значення:</span>
            <input
              type="number"
              step="0.01"
              min="0.5"
              max="0.99"
              value={settingsThreshold}
              onChange={(e) => onChangeThreshold(parseFloat(e.target.value) || 0.85)}
              className="w-24 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-slate-300">Опис курсу &amp; Методичні цілі</label>
          <textarea
            rows={3}
            value={settingsDescription}
            onChange={(e) => onChangeDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-200">Опублікувати курс у каталозі</span>
          <span className="text-[11px] text-slate-400">
            {settingsPublished
              ? 'Курс доступний усім студентам та викладачам платформи'
              : 'Курс збережено як чернетку'}
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settingsPublished}
            onChange={(e) => onChangePublished(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <button
          type="submit"
          disabled={isSavingSettings}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSavingSettings ? 'Збереження...' : 'Зберегти зміни метаданих'}</span>
        </button>

        <button
          type="button"
          onClick={onAdvanceToModules}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-emerald-950/50"
        >
          <span>Продовжити: Модульна структура (Крок 2) →</span>
        </button>
      </div>
    </form>
  );
};
