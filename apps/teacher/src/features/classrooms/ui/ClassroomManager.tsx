'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Sparkles,
  Trash2,
  ChevronRight,
  Key,
  ShieldCheck,
  Lock,
  Clock,
} from 'lucide-react';
import { ClassroomDto, IntegrityPolicy } from '@sbc/types';
import { CreateClassroomModal } from './CreateClassroomModal';
import { getAppBaseUrl } from '@sbc/routes';

interface ClassroomManagerProps {
  apiUrl: string;
  teacherId?: string;
}

export const ClassroomManager: React.FC<ClassroomManagerProps> = ({
  apiUrl,
  teacherId = 'teacher@example.com',
}) => {
  const [classrooms, setClassrooms] = useState<ClassroomDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [expandedClassroomId, setExpandedClassroomId] = useState<string | null>(null);
  const [updatingPolicyId, setUpdatingPolicyId] = useState<string | null>(null);

  const handleUpdateClassroomPolicy = async (
    classroomId: string,
    integrityPolicy: IntegrityPolicy,
    strictModeMinutes?: number | null,
  ) => {
    setUpdatingPolicyId(classroomId);
    try {
      const res = await fetch(`${apiUrl}/api/v1/classrooms/${classroomId}/policy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrityPolicy,
          strictModeMinutes: strictModeMinutes ?? null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.classroom) {
          setClassrooms((prev) =>
            prev.map((c) => (c.id === classroomId ? { ...c, ...data.classroom } : c)),
          );
        } else {
          await fetchClassrooms();
        }
      }
    } catch {
      alert('Не вдалося оновити політику режиму групи');
    } finally {
      setUpdatingPolicyId(null);
    }
  };

  const fetchClassrooms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${apiUrl}/api/v1/classrooms`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Не вдалося завантажити класи');
      setClassrooms(data.classrooms || []);
    } catch (err: any) {
      setError(err?.message || 'Помилка мережі');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyLink = (code: string) => {
    const studyUrl = getAppBaseUrl('study') || 'http://localhost:3006';
    const link = `${studyUrl}/join/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleDeleteClassroom = async (id: string, name: string) => {
    if (!confirm(`Ви дійсно бажаєте розформувати групу "${name}"?`)) return;
    try {
      const res = await fetch(`${apiUrl}/api/v1/classrooms/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchClassrooms();
      }
    } catch {
      alert('Помилка видалення класу');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner */}
      <div className="pb-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Навчальні Групи & Інвайт-Коди (Classrooms)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Створення навчальних груп за принципом Google Classroom: надішліть код або посилання учням для автоматичного зарахування на курс
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-xs self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Створити групу</span>
        </button>
      </div>

      {/* Classrooms List */}
      <div className="flex flex-col divide-y divide-slate-800/50 border-t border-b border-slate-800/80">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">Завантаження навчальних груп...</div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-rose-400">{error}</div>
        ) : classrooms.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <span>У вас ще немає створених груп. Натисніть «Створити групу», щоб згенерувати перший інвайт-код.</span>
          </div>
        ) : (
          classrooms.map((cls) => {
            const isExpanded = expandedClassroomId === cls.id;
            const isCodeCopied = copiedCode === cls.code;
            const isLinkCopied = copiedLink === cls.code;

            return (
              <div key={cls.id} className="py-3.5 px-1 flex flex-col gap-3 hover:bg-slate-900/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Info */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5 sm:mt-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white">{cls.name}</span>
                        {cls.course && (
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                            {cls.course.title}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {cls.defaultMode === 'FULL_CYCLE' ? 'Повний цикл BKT' : 'Тестування'}
                        </span>
                        <span
                          data-testid={`classroom-policy-badge-${cls.id}`}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                            cls.integrityPolicy === 'FORCED_GRADED'
                              ? 'text-amber-300 bg-amber-950/60 border-amber-700/50'
                              : cls.integrityPolicy === 'FORCED_TRAINING'
                              ? 'text-blue-300 bg-blue-950/60 border-blue-700/50'
                              : 'text-emerald-300 bg-emerald-950/40 border-emerald-800/40'
                          }`}
                        >
                          {cls.integrityPolicy === 'FORCED_GRADED' ? (
                            <>
                              <Lock className="w-2.5 h-2.5" />
                              <span>Суворий (Зафіксовано)</span>
                            </>
                          ) : cls.integrityPolicy === 'FORCED_TRAINING' ? (
                            <>
                              <Lock className="w-2.5 h-2.5" />
                              <span>Тренування (Зафіксовано)</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Вибір студента</span>
                            </>
                          )}
                        </span>
                        {cls.allowedModules && cls.allowedModules.length > 0 ? (
                          <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                            {cls.allowedModules.length} {cls.allowedModules.length === 1 ? 'модуль' : cls.allowedModules.length < 5 ? 'модулі' : 'модулів'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                            Всі модулі
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <Users className="w-3 h-3 text-slate-500" />
                          {cls.studentsCount || 0} учнів
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-500 text-[10px]">
                          Створено {new Date(cls.createdAt).toLocaleDateString('uk-UA')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Invite Code & Actions */}
                  <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                    {/* Invite Code Pill */}
                    <div className="flex items-center bg-slate-950 border border-purple-500/30 rounded-lg p-0.5 pr-1.5 gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono font-bold text-xs tracking-wider">
                        {cls.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(cls.code)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Скопіювати інвайт-код"
                      >
                        {isCodeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Copy Join Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(cls.code)}
                      className="px-2.5 py-1 rounded-lg border border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-300 transition-colors cursor-pointer text-[11px] flex items-center gap-1.5"
                      title="Скопіювати пряме посилання для учнів"
                    >
                      {isLinkCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Скопійовано!</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3 h-3" />
                          <span>Посилання /join</span>
                        </>
                      )}
                    </button>

                    {/* Expand Students Details */}
                    <button
                      type="button"
                      onClick={() => setExpandedClassroomId(isExpanded ? null : cls.id)}
                      className="px-2 py-1 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                    >
                      <span>Учні</span>
                      <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteClassroom(cls.id, cls.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Видалити групу"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Integrity Policy Governance Bar */}
                <div className="pl-12 pr-1 flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800/40">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Режим проходження:
                    </span>
                    <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-950/70 border border-slate-800/70">
                      {(
                        [
                          { id: 'STUDENT_CHOICE', label: 'Вибір студента' },
                          { id: 'FORCED_TRAINING', label: 'Тільки тренування' },
                          { id: 'FORCED_GRADED', label: 'Суворий (На оцінку)' },
                        ] as const
                      ).map((opt) => {
                        const isActive = (cls.integrityPolicy || 'STUDENT_CHOICE') === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={updatingPolicyId === cls.id}
                            data-testid={`policy-btn-${cls.id}-${opt.id}`}
                            onClick={() => handleUpdateClassroomPolicy(cls.id, opt.id, null)}
                            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                              isActive
                                ? opt.id === 'FORCED_GRADED'
                                  ? 'bg-amber-600 text-white'
                                  : opt.id === 'FORCED_TRAINING'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-800 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {cls.integrityPolicy === 'FORCED_GRADED' && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                      <Clock className="w-3 h-3" />
                      {cls.strictModeUntil ? (
                        <span className="font-mono text-[10px]">
                          до {new Date(cls.strictModeUntil).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-slate-400">без таймера</span>
                      )}
                      <button
                        type="button"
                        disabled={updatingPolicyId === cls.id}
                        onClick={() => handleUpdateClassroomPolicy(cls.id, 'FORCED_GRADED', 45)}
                        className="px-1.5 py-0.5 rounded border border-amber-500/30 hover:bg-amber-500/15 text-[10px] font-mono cursor-pointer"
                      >
                        +45 хв
                      </button>
                      <button
                        type="button"
                        disabled={updatingPolicyId === cls.id}
                        onClick={() => handleUpdateClassroomPolicy(cls.id, 'FORCED_GRADED', 90)}
                        className="px-1.5 py-0.5 rounded border border-amber-500/30 hover:bg-amber-500/15 text-[10px] font-mono cursor-pointer"
                      >
                        +90 хв
                      </button>
                    </div>
                  )}
                </div>

                {/* Expanded Students List */}
                {isExpanded && (
                  <div className="mt-2 pl-12 pr-4 py-2 border-t border-slate-800/40 flex flex-col gap-2 animate-fadeIn">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                      Зараховані учні ({cls.students?.length || 0})
                    </span>
                    {!cls.students || cls.students.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">
                        Поки що жоден учень не приєднався за кодом {cls.code}.
                      </span>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cls.students.map((st) => (
                          <div
                            key={st.id}
                            className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">
                                {st.profile?.firstName
                                  ? `${st.profile.firstName} ${st.profile.lastName || ''}`.trim()
                                  : st.email.split('@')[0]}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">{st.email}</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">
                              АКТИВНИЙ
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Classroom Modal */}
      <CreateClassroomModal
        apiUrl={apiUrl}
        teacherId={teacherId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchClassrooms();
        }}
      />
    </div>
  );
};
