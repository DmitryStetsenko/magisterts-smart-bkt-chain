'use client';

import React, { useState, useEffect } from 'react';
import { BookPlus, Check, AlertCircle } from 'lucide-react';
import { AuthUserDto, EnrollmentMode } from '@sbc/types';
import { Modal, Button } from '@sbc/ui';

interface CourseOption {
  id: string;
  slug: string;
  title: string;
  description: string;
}

interface EnrollCourseModalProps {
  user: AuthUserDto;
  apiUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EnrollCourseModal: React.FC<EnrollCourseModalProps> = ({
  user,
  apiUrl,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
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
      } catch (err: any) {
        setError('Не вдалося завантажити список курсів');
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [isOpen, apiUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setError('Оберіть курс для зарахування');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch(`${apiUrl}/api/v1/classrooms/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          courseId: selectedCourseId,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Помилка зарахування на курс');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Помилка виконання операції');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      icon={
        <div className="w-8 h-8 rounded-lg bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <BookPlus className="w-4 h-4" />
        </div>
      }
      title="Підключити курс учню"
      subtitle={
        user.profile?.firstName
          ? `${user.profile.firstName} ${user.profile.lastName || ''} (${user.email})`
          : user.email
      }
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Скасувати
          </Button>
          <Button
            type="submit"
            form="admin-enroll-course-form"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={!selectedCourseId}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? 'Зарахування...' : 'Підключити курс'}
          </Button>
        </div>
      }
    >
      <form id="admin-enroll-course-form" onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Оберіть курс
            </label>
            {isLoadingCourses ? (
              <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 text-xs">
                Завантаження курсів...
              </div>
            ) : (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 text-xs cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.slug})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Дидактичний режим проходження
            </label>

            <div className="flex flex-col gap-1.5">
              <label
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex flex-col gap-1 ${
                  mode === 'FULL_CYCLE'
                    ? 'border-indigo-500/60 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      value="FULL_CYCLE"
                      checked={mode === 'FULL_CYCLE'}
                      onChange={() => setMode('FULL_CYCLE')}
                      className="text-indigo-500 focus:ring-0"
                    />
                    <span className="font-semibold text-xs text-indigo-300">Повний Цикл (Full Cycle)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">
                    Рекомендовано
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-5">
                  Теорія в підручнику + Практичний тренажер із BKT-гейтингом ($P(L_n) \ge 0.85$).
                </p>
              </label>

              <label
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex flex-col gap-1 ${
                  mode === 'TESTING_ONLY'
                    ? 'border-amber-500/60 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      value="TESTING_ONLY"
                      checked={mode === 'TESTING_ONLY'}
                      onChange={() => setMode('TESTING_ONLY')}
                      className="text-amber-500 focus:ring-0"
                    />
                    <span className="font-semibold text-xs text-amber-300">Чисте Тестування (Testing Only)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">
                    Діагностика
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-5">
                  Експрес-зріз знань або іспит: завдання відкриваються одразу без обов'язкового вивчення конспекту.
                </p>
              </label>

              <label
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex flex-col gap-1 ${
                  mode === 'MODULAR'
                    ? 'border-purple-500/60 bg-purple-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      value="MODULAR"
                      checked={mode === 'MODULAR'}
                      onChange={() => setMode('MODULAR')}
                      className="text-purple-500 focus:ring-0"
                    />
                    <span className="font-semibold text-xs text-purple-300">Модульний Режим (Modular)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">
                    Вибірково
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-5">
                  Доступ до вибраних викладачем окремих модулів або тем.
                </p>
              </label>
            </div>
          </div>
        </form>
    </Modal>
  );
};
