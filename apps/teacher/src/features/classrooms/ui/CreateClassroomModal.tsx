'use client';

import React, { useState, useEffect } from 'react';
import { Users, Check, AlertCircle, Key, Layers } from 'lucide-react';
import { CreateClassroomDto, EnrollmentMode, CourseModuleDto } from '@sbc/types';
import { Modal, Button } from '@sbc/ui';

interface CourseOption {
  id: string;
  slug: string;
  title: string;
  description: string;
  modules?: CourseModuleDto[];
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

  // Modular selection state
  const [isAllModules, setIsAllModules] = useState<boolean>(true);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const res = await fetch(`${apiUrl}/api/v1/courses?status=PUBLISHED`);
        const data = await res.json();
        const list: CourseOption[] = Array.isArray(data) ? data : data.courses || [];
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

  // When selected course changes, update available modules
  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const availableModules = currentCourse?.modules || [];

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

    if (!isAllModules && selectedModuleIds.length === 0) {
      setError('Оберіть щонайменше один модуль або перемкніться на режим «Весь курс»');
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
        allowedModules: isAllModules ? [] : selectedModuleIds,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      icon={
        <div className="w-8 h-8 rounded-lg bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Users className="w-4 h-4" />
        </div>
      }
      title="Створити навчальну групу (Клас)"
      subtitle="Генерація інвайт-коду, вибір курсу та модулів"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Скасувати
          </Button>
          <Button
            type="submit"
            form="create-classroom-form"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={!name.trim()}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? 'Створення...' : 'Створити групу'}
          </Button>
        </div>
      }
    >
      <form id="create-classroom-form" onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
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
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setIsAllModules(true);
                  setSelectedModuleIds([]);
                }}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500 text-xs cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.slug}) — {c.modules?.length || 0} модулів
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Modular Enrollment Selection */}
          <div className="flex flex-col gap-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Доступ до Модулів Курсу</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {availableModules.length} доступно
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAllModules(true);
                  setSelectedModuleIds([]);
                }}
                className={`py-2 px-3 rounded-lg border text-left flex flex-col gap-0.5 transition-colors cursor-pointer ${
                  isAllModules
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400'
                }`}
              >
                <span className="font-bold text-xs">Весь курс цілком</span>
                <span className="text-[10px] text-slate-500">Усі поточні та майбутні модулі</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAllModules(false);
                  if (selectedModuleIds.length === 0 && availableModules.length > 0) {
                    setSelectedModuleIds(availableModules.slice(0, 2).map((m) => m.id));
                  }
                }}
                className={`py-2 px-3 rounded-lg border text-left flex flex-col gap-0.5 transition-colors cursor-pointer ${
                  !isAllModules
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400'
                }`}
              >
                <span className="font-bold text-xs">Обрані модулі</span>
                <span className="text-[10px] text-slate-500">Селективний доступ до тем</span>
              </button>
            </div>

            {/* Checkbox list of modules when selective access chosen */}
            {!isAllModules && (
              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar p-1.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                {availableModules.length === 0 ? (
                  <div className="text-center py-2 text-slate-500 text-[11px] font-mono">
                    У цьому курсі немає попередньо створених модулів
                  </div>
                ) : (
                  availableModules.map((m) => {
                    const isChecked = selectedModuleIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-950/40 border border-indigo-500/30' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedModuleIds((prev) => [...prev, m.id]);
                              } else {
                                setSelectedModuleIds((prev) => prev.filter((id) => id !== m.id));
                              }
                            }}
                            className="w-3.5 h-3.5 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-0"
                          />
                          <span className="text-xs font-medium text-slate-200">
                            {m.orderIndex}. {m.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {m.skills?.length || 0} навичок
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
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
        </form>
    </Modal>
  );
};
