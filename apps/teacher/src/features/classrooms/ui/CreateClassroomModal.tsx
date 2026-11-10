'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Check, AlertCircle, Key, BookOpen } from 'lucide-react';
import { CreateClassroomDto, EnrollmentMode } from '@sbc/types';

interface CourseOption {
  id: string;
  slug: string;
  title: string;
  description: string;
}

interface CreateClassroomModalProps {
  apiUrl: string;
  teacherId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({
  apiUrl,
  teacherId = 'teacher@example.com',
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [name, setName] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [mode, setMode] = useState<EnrollmentMode>('FULL_CYCLE');
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const res = await fetch(`${apiUrl}/api/v1/courses`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.courses || [];
        setCourses(list);
        if (list.length > 0 && !selectedCourseId) {
          setSelectedCourseId(list[0].id);
        }
      } catch {
        setError('Не вдалося завантажити курси');
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [isOpen, apiUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Введіть назву групи або класу');
      return;
    }
    if (!selectedCourseId) {
      setError('Оберіть курс для навчальної групи');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const payload: CreateClassroomDto & { teacherId: string } = {
        name: name.trim(),
        courseId: selectedCourseId,
        code: customCode.trim() ? customCode.trim().toUpperCase() : undefined,
        defaultMode: mode,
        teacherId,
      };

      const res = await fetch(`${apiUrl}/api/v1/classrooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Помилка створення групи');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Помилка збереження');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Створити навчальну групу (Клас)</h3>
              <p className="text-[11px] text-slate-400">
                Генерація інвайт-коду та вибір дидактичного режиму
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Назва групи / класу <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Наприклад: Група КН-21 або 10-А клас"
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Навчальний курс <span className="text-rose-400">*</span>
            </label>
            {isLoadingCourses ? (
              <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 text-xs">
                Завантаження курсів...
              </div>
            ) : (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500 text-xs cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.slug})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Інвайт-код (промокод для учнів)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Опційно</span>
            </div>
            <div className="relative">
              <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                placeholder="Залиште порожнім для автогенерації (наприклад: KOD-8421)"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 text-xs font-mono tracking-wider"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Дидактичний режим проходження за замовчуванням
            </label>

            <div className="flex flex-col gap-1.5">
              <label
                className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                  mode === 'FULL_CYCLE'
                    ? 'border-purple-500/60 bg-purple-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="modal-mode"
                    value="FULL_CYCLE"
                    checked={mode === 'FULL_CYCLE'}
                    onChange={() => setMode('FULL_CYCLE')}
                    className="text-purple-500"
                  />
                  <span className="font-semibold text-xs">Повний цикл (Теорія + BKT тренажер)</span>
                </div>
                <span className="text-[10px] font-mono text-purple-300">Стандарт</span>
              </label>

              <label
                className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                  mode === 'TESTING_ONLY'
                    ? 'border-amber-500/60 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="modal-mode"
                    value="TESTING_ONLY"
                    checked={mode === 'TESTING_ONLY'}
                    onChange={() => setMode('TESTING_ONLY')}
                    className="text-amber-500"
                  />
                  <span className="font-semibold text-xs">Чисте тестування (Діагностика без конспекту)</span>
                </div>
                <span className="text-[10px] font-mono text-amber-300">Іспит</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer text-xs"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Створення...' : 'Створити групу'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
