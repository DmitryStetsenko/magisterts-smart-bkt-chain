'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  BookOpen,
  Layers,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Target,
  FileCode,
  AlertCircle,
  ChevronRight,
  Minus,
} from 'lucide-react';
import type { CourseDto, CourseModuleDto, SkillNodeDto } from '@sbc/types';

interface ModuleManagerModalProps {
  course: CourseDto;
  isOpen: boolean;
  onClose: () => void;
  onModulesChanged: () => void;
}

export const ModuleManagerModal: React.FC<ModuleManagerModalProps> = ({
  course,
  isOpen,
  onClose,
  onModulesChanged,
}) => {
  const [modules, setModules] = useState<CourseModuleDto[]>([]);
  const [allCourseSkills, setAllCourseSkills] = useState<SkillNodeDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create module modal/form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newOrderIndex, setNewOrderIndex] = useState<number>(1);
  const [newTheoryUrl, setNewTheoryUrl] = useState('');
  const [newThreshold, setNewThreshold] = useState<number>(course.defaultMasteryThreshold ?? 0.85);

  // Edit module state
  const [editingModule, setEditingModule] = useState<CourseModuleDto | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTheoryUrl, setEditTheoryUrl] = useState('');
  const [editThreshold, setEditThreshold] = useState<number>(0.85);

  // Assign skills state
  const [assigningModuleId, setAssigningModuleId] = useState<string | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // Expanded modules state
  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchCourseData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/courses/${course.slug}`);
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules || []);
        setAllCourseSkills(data.skills || []);

        // Expand all modules by default
        const initialExpanded: Record<string, boolean> = {};
        (data.modules || []).forEach((m: CourseModuleDto) => {
          initialExpanded[m.id] = true;
        });
        setExpandedModuleIds(initialExpanded);

        // Prepopulate next order index
        setNewOrderIndex((data.modules?.length || 0) + 1);
      }
    } catch (err: any) {
      setErrorMessage('Не вдалося завантажити структуру курсу');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCourseData();
    }
  }, [isOpen, course.slug]);

  if (!isOpen) return null;

  const toggleExpand = (modId: string) => {
    setExpandedModuleIds((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/courses/${course.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug: newSlug.trim() || undefined,
          description: newDescription.trim() || undefined,
          orderIndex: Number(newOrderIndex),
          theoryUrl: newTheoryUrl.trim() || undefined,
          minMasteryThreshold: Number(newThreshold),
        }),
      });

      if (res.ok) {
        setMessage('Новий модуль успішно створено!');
        setIsCreateOpen(false);
        setNewTitle('');
        setNewSlug('');
        setNewDescription('');
        setNewTheoryUrl('');
        fetchCourseData();
        onModulesChanged();
      } else {
        const data = await res.json();
        setErrorMessage(data.message || 'Помилка створення модуля');
      }
    } catch (err: any) {
      setErrorMessage('Помилка мережі при створенні модуля');
    }
  };

  const handleStartEdit = (mod: CourseModuleDto) => {
    setEditingModule(mod);
    setEditTitle(mod.title);
    setEditTheoryUrl(mod.theoryUrl || '');
    setEditThreshold(mod.minMasteryThreshold ?? 0.85);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/courses/${course.id}/modules/${editingModule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          theoryUrl: editTheoryUrl.trim() || null,
          minMasteryThreshold: Number(editThreshold),
        }),
      });

      if (res.ok) {
        setMessage('Модуль успішно оновлено!');
        setEditingModule(null);
        fetchCourseData();
        onModulesChanged();
      } else {
        const data = await res.json();
        setErrorMessage(data.message || 'Помилка оновлення модуля');
      }
    } catch (err: any) {
      setErrorMessage('Помилка мережі при оновленні модуля');
    }
  };

  const handleDeleteModule = async (moduleId: string, title: string) => {
    if (!confirm(`Ви дійсно бажаєте видалити модуль "${title}"? Навички залишаться у курсі.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/courses/${course.id}/modules/${moduleId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage('Модуль видалено');
        fetchCourseData();
        onModulesChanged();
      } else {
        const data = await res.json();
        setErrorMessage(data.message || 'Помилка видалення модуля');
      }
    } catch (err: any) {
      setErrorMessage('Помилка мережі при видаленні');
    }
  };

  const handleOpenAssignSkills = (moduleId: string) => {
    setAssigningModuleId(moduleId);
    const mod = modules.find((m) => m.id === moduleId);
    setSelectedSkillIds(mod?.skills?.map((s) => s.id) || []);
  };

  const handleSaveAssignedSkills = async () => {
    if (!assigningModuleId) return;

    try {
      const res = await fetch(
        `${API_URL}/api/v1/courses/${course.id}/modules/${assigningModuleId}/skills`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillIds: selectedSkillIds }),
        }
      );

      if (res.ok) {
        setMessage('Навички успішно закріплено за модулем');
        setAssigningModuleId(null);
        fetchCourseData();
        onModulesChanged();
      } else {
        const data = await res.json();
        setErrorMessage(data.message || 'Помилка призначення навичок');
      }
    } catch (err: any) {
      setErrorMessage('Помилка мережі при призначенні');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Модульний Конструктор Курсу</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/60 text-indigo-400 border border-indigo-500/30">
                  {course.slug}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {course.title} • {modules.length} Модулів • {allCourseSkills.length} Компетенцій
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Додати Модуль</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div className="mx-6 mt-4 p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-purple-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs font-mono">
              Завантаження модулів курсу...
            </div>
          ) : modules.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-500">
              <Layers className="w-8 h-8 text-slate-600" />
              <p className="text-sm">У цьому курсі ще немає створених модулів.</p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                + Створити перший модуль
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((mod) => {
                const isExpanded = !!expandedModuleIds[mod.id];
                const modSkills = allCourseSkills.filter((s) => s.moduleId === mod.id);

                return (
                  <div
                    key={mod.id}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-xl overflow-hidden transition-all hover:border-slate-700/80"
                  >
                    {/* Module Header Bar */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-900/70 border-b border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleExpand(mod.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <Minus className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </button>

                        <span className="w-6 h-6 rounded-lg bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-[11px] font-mono font-bold text-indigo-300">
                          {mod.orderIndex}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{mod.title}</h4>
                            <span className="text-[10px] font-mono text-slate-500">
                              slug: {mod.slug}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1 font-mono text-emerald-400">
                              <Target className="w-3 h-3" />
                              <span>BKT Target: {mod.minMasteryThreshold ?? 0.85}</span>
                            </span>
                            {mod.theoryUrl && (
                              <span className="flex items-center gap-1 text-indigo-400 font-mono">
                                <BookOpen className="w-3 h-3" />
                                <span>{mod.theoryUrl}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenAssignSkills(mod.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          + Навички ({modSkills.length})
                        </button>
                        <button
                          onClick={() => handleStartEdit(mod)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Редагувати модуль"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(mod.id, mod.title)}
                          className="p-1.5 rounded-lg hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Видалити модуль"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Module Body: Skills List */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-900/30 animate-fadeIn">
                        {modSkills.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-500 font-mono">
                            До цього модуля ще не прив'язано жодної навички.{' '}
                            <button
                              onClick={() => handleOpenAssignSkills(mod.id)}
                              className="text-purple-400 hover:underline cursor-pointer"
                            >
                              Прив'язати навички зараз
                            </button>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-800/50">
                            {modSkills.map((skill) => (
                              <div
                                key={skill.id}
                                className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-800/30 rounded-lg transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                                  <div>
                                    <div className="text-xs font-bold text-slate-200">
                                      {skill.title}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500">
                                      {skill.slug} • {skill.category || 'Загальне'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700/60">
                                    {skill.difficulty || 'EASY'}
                                  </span>
                                  <span className="text-[11px] font-mono text-emerald-400">
                                    {skill.tasks?.length || 0} завдань
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Dialog: Create Module */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Створити Новий Модуль</span>
                </h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateModule} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Назва Модуля *</label>
                  <input
                    type="text"
                    required
                    placeholder="напр. Модуль 6: Регулярні вирази"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Порядковий Номер</label>
                    <input
                      type="number"
                      min="1"
                      value={newOrderIndex}
                      onChange={(e) => setNewOrderIndex(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">BKT Поріг P(L)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="0.99"
                      value={newThreshold}
                      onChange={(e) => setNewThreshold(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Підручника (apps/study)</label>
                  <input
                    type="text"
                    placeholder="/learn/js-dev/module-6"
                    value={newTheoryUrl}
                    onChange={(e) => setNewTheoryUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Опис Модуля</label>
                  <textarea
                    rows={2}
                    placeholder="Короткий зміст компетенцій модуля..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Створити Модуль
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Dialog: Edit Module */}
        {editingModule && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-purple-400" />
                  <span>Редагувати Модуль</span>
                </h3>
                <button onClick={() => setEditingModule(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Назва Модуля</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">BKT Поріг P(L) Target</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="0.99"
                    value={editThreshold}
                    onChange={(e) => setEditThreshold(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Підручника (theoryUrl)</label>
                  <input
                    type="text"
                    value={editTheoryUrl}
                    onChange={(e) => setEditTheoryUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingModule(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Зберегти Зміни
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Dialog: Assign Skills to Module */}
        {assigningModuleId && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Прив'язка Навичок до Модуля</span>
                </h3>
                <button onClick={() => setAssigningModuleId(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <p className="text-xs text-slate-400">
                Оберіть навички з курсу, які мають входити до складу цього дидактичного модуля:
              </p>

              <div className="max-h-60 overflow-y-auto space-y-1.5 p-2 bg-slate-950/70 border border-slate-800 rounded-xl custom-scrollbar">
                {allCourseSkills.map((skill) => {
                  const isChecked = selectedSkillIds.includes(skill.id);
                  return (
                    <label
                      key={skill.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'bg-indigo-950/40 border border-indigo-500/30' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSkillIds((prev) => [...prev, skill.id]);
                            } else {
                              setSelectedSkillIds((prev) => prev.filter((id) => id !== skill.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-200">{skill.title}</div>
                          <div className="text-[10px] font-mono text-slate-500">{skill.slug}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {skill.difficulty || 'EASY'}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-mono">
                  Вибрано: {selectedSkillIds.length} з {allCourseSkills.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAssigningModuleId(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Скасувати
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAssignedSkills}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Зберегти Прив'язку
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
