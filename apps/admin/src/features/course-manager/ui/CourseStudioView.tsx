'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ArrowLeft,
  Layers,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Target,
  Sparkles,
  Users,
  Folder,
  Network,
  ArrowRight,
  Shield,
  FileCode,
  FlaskConical,
  Sliders,
} from 'lucide-react';
import type { CourseDto, CourseModuleDto, SkillNodeDto, CourseCategoryDto, UpdateCourseDto } from '@sbc/types';
import { CreateSkillModal } from './CreateSkillModal';
import { CreateTaskModal } from './CreateTaskModal';
import { ModuleTestSandboxModal } from './ModuleTestSandboxModal';
import { TheoryLessonBuilderModal } from './TheoryLessonBuilderModal';
import { MASTERY_STANDARDS } from './CourseCreateView';

/**
 * Очищує назву навички від дублюючого префікса «Модуль N:» та запобігає повторенню назви батьківського модуля
 */
export const formatCleanSkillTitle = (skillTitle?: string | null, moduleTitle?: string | null): string => {
  if (!skillTitle) return 'Компетенція BKT';
  let clean = skillTitle.replace(/^(?:Модуль|Module)\s*\d+:\s*/i, '').trim();
  const cleanMod = (moduleTitle || '').replace(/^(?:Модуль|Module)\s*\d+:\s*/i, '').trim();
  if (!clean || (cleanMod && clean.toLowerCase() === cleanMod.toLowerCase())) {
    return clean || 'Базова навичка модуля';
  }
  return clean;
};

/**
 * Запобігає дублюванню однакового тексту опису модуля і навички
 */
export const getCleanSkillDescription = (skillDesc?: string | null, modDesc?: string | null, taskCount: number = 0): string | null => {
  if (!skillDesc || !skillDesc.trim()) {
    return taskCount > 0 ? `Атомарна BKT компетенція • ${taskCount} завд. у банку` : null;
  }
  const isDuplicate = modDesc && modDesc.trim().toLowerCase() === skillDesc.trim().toLowerCase();
  if (isDuplicate) {
    return taskCount > 0
      ? `Атомарна BKT компетенція • ${taskCount} завд. у банку`
      : 'Атомарна BKT компетенція модуля';
  }
  return skillDesc.trim();
};

interface CourseStudioViewProps {
  course: CourseDto;
  categories?: CourseCategoryDto[];
  activeSubTab?: 'CURRICULUM' | 'SETTINGS';
  onSubTabChange?: (tab: 'CURRICULUM' | 'SETTINGS') => void;
  authorStep?: number;
  maxUnlockedStep?: number;
  onStepChange?: (step: number) => void;
  onAdvanceStep?: (nextStep: number) => void;
  onBack: () => void;
  onCourseLoaded?: (course: CourseDto) => void;
  onCourseUpdated: (updatedCourse: CourseDto) => void;
  onCourseDeleted: (deletedCourseId: string) => void;
  onOpenTheoryBuilder?: (module: CourseModuleDto) => void;
}

export const CourseStudioView: React.FC<CourseStudioViewProps> = ({
  course: initialCourse,
  categories = [],
  activeSubTab: externalSubTab,
  onSubTabChange,
  authorStep: externalStep,
  maxUnlockedStep = 5,
  onStepChange,
  onAdvanceStep,
  onBack,
  onCourseLoaded,
  onCourseUpdated,
  onCourseDeleted,
  onOpenTheoryBuilder,
}) => {
  const [course, setCourse] = useState<CourseDto>(initialCourse);
  const [localSubTab, setLocalSubTab] = useState<'CURRICULUM' | 'SETTINGS'>('CURRICULUM');
  const activeSubTab = externalSubTab ?? localSubTab;
  const setActiveSubTab = (tab: 'CURRICULUM' | 'SETTINGS') => {
    setLocalSubTab(tab);
    onSubTabChange?.(tab);
  };
  const [localStep, setLocalStep] = useState<number>(1);
  const effectiveStep = externalStep ?? (activeSubTab === 'SETTINGS' ? 1 : localStep);

  const handleStepSelect = (step: number) => {
    if (step > maxUnlockedStep) return;
    setLocalStep(step);
    onStepChange?.(step);
    if (step === 1) {
      setActiveSubTab('SETTINGS');
    } else {
      setActiveSubTab('CURRICULUM');
      if (step === 3) {
        setTimeout(() => window.dispatchEvent(new CustomEvent('admin-studio-focus-skills')), 50);
      } else if (step === 4 && modules.length > 0 && onOpenTheoryBuilder) {
        onOpenTheoryBuilder(modules[0]);
      } else if (step === 5) {
        setTimeout(() => window.dispatchEvent(new CustomEvent('admin-studio-open-test-module')), 50);
      }
    }
  };
  const [modules, setModules] = useState<CourseModuleDto[]>([]);
  const [allCourseSkills, setAllCourseSkills] = useState<SkillNodeDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Expanded modules
  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>({});

  // Expanded theory sections per module
  const [expandedTheoryModuleIds, setExpandedTheoryModuleIds] = useState<Record<string, boolean>>({});

  // Expanded skill tasks per skill
  const [expandedSkillTaskIds, setExpandedSkillTaskIds] = useState<Record<string, boolean>>({});

  // Turnkey Authoring Modals State
  const [skillCreationModule, setSkillCreationModule] = useState<{ id: string; title: string } | null>(null);
  const [taskCreationSkill, setTaskCreationSkill] = useState<{ id: string; title: string } | null>(null);
  const [testingSandboxModule, setTestingSandboxModule] = useState<CourseModuleDto | null>(null);
  const [theoryBuilderModule, setTheoryBuilderModule] = useState<CourseModuleDto | null>(null);

  // Inline Task creation state per skill
  const [addingTaskSkillId, setAddingTaskSkillId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<'CODE' | 'MULTIPLE_CHOICE' | 'ESSAY'>('CODE');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');

  // Module creation / editing state (inline, no popups)
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [newModTitle, setNewModTitle] = useState('');
  const [newModSlug, setNewModSlug] = useState('');
  const [newModDesc, setNewModDesc] = useState('');
  const [newModOrder, setNewModOrder] = useState<number>(1);
  const [newModTheoryUrl, setNewModTheoryUrl] = useState('');
  const [newModThreshold, setNewModThreshold] = useState<number>(course.defaultMasteryThreshold ?? 0.85);

  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModTitle, setEditModTitle] = useState('');
  const [editModTheoryUrl, setEditModTheoryUrl] = useState('');
  const [editModThreshold, setEditModThreshold] = useState<number>(0.85);

  // Theory editing state per module
  const [editingTheoryModuleId, setEditingTheoryModuleId] = useState<string | null>(null);
  const [editingTheoryContent, setEditingTheoryContent] = useState<string>('');

  // Skill assignment state
  const [assigningModuleId, setAssigningModuleId] = useState<string | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // Skill BKT tuning state (inline editor)
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillPInit, setSkillPInit] = useState<number>(0.5);
  const [skillPTransit, setSkillPTransit] = useState<number>(0.1);
  const [skillPSlip, setSkillPSlip] = useState<number>(0.1);
  const [skillPGuess, setSkillPGuess] = useState<number>(0.2);

  // Settings tab form state
  const [settingsTitle, setSettingsTitle] = useState(course.title);
  const [settingsSlug, setSettingsSlug] = useState(course.slug);
  const [settingsDescription, setSettingsDescription] = useState(course.description || '');
  const [settingsCategoryId, setSettingsCategoryId] = useState<string | null>(
    course.categoryId || (typeof course.category === 'object' && course.category ? (course.category as any).id : null)
  );
  const [settingsAudience, setSettingsAudience] = useState(course.targetAudience || '10-11 класи, Студенти коледжів');
  const [settingsThreshold, setSettingsThreshold] = useState<number>(course.defaultMasteryThreshold ?? 0.85);
  const [settingsPublished, setSettingsPublished] = useState<boolean>(course.isPublished ?? true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchFullCourseData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/courses/${course.slug}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
        onCourseLoaded?.(data);
        setModules(data.modules || []);
        setAllCourseSkills(data.skills || []);

        // Expand all modules by default
        const initialExpanded: Record<string, boolean> = {};
        (data.modules || []).forEach((m: CourseModuleDto) => {
          initialExpanded[m.id] = true;
        });
        setExpandedModuleIds(initialExpanded);
        setNewModOrder((data.modules?.length || 0) + 1);
      }
    } catch (err) {
      setError('Не вдалося завантажити структуру курсу');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenCreate = () => {
      setIsCreatingModule(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleOpenCreateSkill = () => {
      if (modules.length > 0) {
        setSkillCreationModule({ id: modules[0].id, title: modules[0].title });
      }
    };
    const handleOpenTestModule = () => {
      if (modules.length > 0) {
        setTestingSandboxModule(modules[0]);
      }
    };
    window.addEventListener('admin-studio-open-create-module', handleOpenCreate);
    window.addEventListener('admin-studio-open-create-skill', handleOpenCreateSkill);
    window.addEventListener('admin-studio-open-test-module', handleOpenTestModule);
    return () => {
      window.removeEventListener('admin-studio-open-create-module', handleOpenCreate);
      window.removeEventListener('admin-studio-open-create-skill', handleOpenCreateSkill);
      window.removeEventListener('admin-studio-open-test-module', handleOpenTestModule);
    };
  }, [modules]);

  useEffect(() => {
    setCourse(initialCourse);
    setSettingsTitle(initialCourse.title);
    setSettingsSlug(initialCourse.slug);
    setSettingsDescription(initialCourse.description || '');
    setSettingsCategoryId(
      initialCourse.categoryId || (typeof initialCourse.category === 'object' && initialCourse.category ? (initialCourse.category as any).id : null)
    );
    setSettingsAudience(initialCourse.targetAudience || '10-11 класи, Студенти коледжів');
    setSettingsThreshold(initialCourse.defaultMasteryThreshold ?? 0.85);
    setSettingsPublished(initialCourse.isPublished ?? true);
  }, [initialCourse.id, initialCourse.slug]);

  useEffect(() => {
    fetchFullCourseData();
  }, [course.slug, course.id]);

  const toggleExpand = (modId: string) => {
    setExpandedModuleIds((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Create Module
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModTitle.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/courses/${course.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newModTitle.trim(),
          slug: newModSlug.trim() || undefined,
          description: newModDesc.trim() || undefined,
          orderIndex: Number(newModOrder),
          theoryUrl: newModTheoryUrl.trim() || undefined,
          minMasteryThreshold: Number(newModThreshold),
        }),
      });

      if (res.ok) {
        setMessage('Модуль успішно створено');
        setIsCreatingModule(false);
        setNewModTitle('');
        setNewModSlug('');
        setNewModDesc('');
        setNewModTheoryUrl('');
        await fetchFullCourseData();
      } else {
        const errData = await res.json();
        setError(errData.message || 'Помилка створення модуля');
      }
    } catch (err) {
      setError('Помилка мережі при створенні модуля');
    }
  };

  // Update Module
  const handleUpdateModule = async (modId: string) => {
    if (!editModTitle.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/courses/${course.id}/modules/${modId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editModTitle.trim(),
          theoryUrl: editModTheoryUrl.trim() || undefined,
          minMasteryThreshold: Number(editModThreshold),
        }),
      });

      if (res.ok) {
        setMessage('Модуль оновлено');
        setEditingModuleId(null);
        await fetchFullCourseData();
      } else {
        const errData = await res.json();
        setError(errData.message || 'Помилка оновлення модуля');
      }
    } catch (err) {
      setError('Помилка мережі при оновленні модуля');
    }
  };

  // Delete Module
  const handleDeleteModule = async (modId: string, modTitle: string) => {
    if (!window.confirm(`Видалити модуль «${modTitle}»? Компетенції залишаться у курсі, але будуть відвʼязані від теми.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/courses/${course.id}/modules/${modId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage('Модуль видалено');
        await fetchFullCourseData();
      } else {
        setError('Помилка при видаленні модуля');
      }
    } catch (err) {
      setError('Помилка мережі');
    }
  };

  // Open Skill Assign panel
  const handleOpenAssignSkills = (mod: CourseModuleDto) => {
    setAssigningModuleId(mod.id);
    const assignedIds = (mod.skills || []).map((s) => s.id);
    setSelectedSkillIds(assignedIds);
  };

  // Save Skill Assignment
  const handleSaveSkillAssignment = async () => {
    if (!assigningModuleId) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/courses/${course.id}/modules/${assigningModuleId}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillIds: selectedSkillIds }),
      });

      if (res.ok) {
        setMessage('Компетенції успішно привʼязано до модуля');
        setAssigningModuleId(null);
        await fetchFullCourseData();
      } else {
        setError('Помилка при призначенні компетенцій');
      }
    } catch (err) {
      setError('Помилка мережі');
    }
  };

  // Save Course Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setError(null);
    try {
      const payload: UpdateCourseDto = {
        title: settingsTitle.trim(),
        slug: settingsSlug.trim(),
        description: settingsDescription.trim(),
        categoryId: settingsCategoryId || null,
        targetAudience: settingsAudience.trim() || undefined,
        defaultMasteryThreshold: Number(settingsThreshold),
        isPublished: settingsPublished,
      };

      const res = await fetch(`${API_URL}/api/v1/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setCourse(updated);
        onCourseUpdated(updated);
        setMessage('Параметри курсу успішно збережено');
      } else {
        const data = await res.json();
        setError(data.message || 'Помилка оновлення курсу');
      }
    } catch (err) {
      setError('Помилка мережі при оновленні курсу');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async () => {
    try {
      const nextStatus = !course.isPublished;
      const res = await fetch(`${API_URL}/api/v1/courses/${course.id || course.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: nextStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCourse(updated);
        setSettingsPublished(nextStatus);
        onCourseUpdated(updated);
        setMessage(nextStatus ? '🎉 Курс успішно опубліковано у каталозі!' : 'Курс переведено у статус чернетки.');
      } else {
        setError('Помилка зміни статусу публікації');
      }
    } catch {
      setError('Помилка мережі при зміні статусу публікації');
    }
  };

  // Delete Entire Course
  const handleDeleteCourse = async () => {
    if (!window.confirm(`Ви дійсно бажаєте видалити курс «${course.title}»? Ця дія незворотна.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/courses/${course.id || course.slug}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onCourseDeleted(course.id || course.slug);
        onBack();
      } else {
        setError('Помилка видалення курсу');
      }
    } catch (err) {
      setError('Помилка мережі при видаленні курсу');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-12">
      {/* Top Course Studio Banner */}
      <div className="flex flex-col gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Повернутися до списку курсів"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-white truncate">
                  {course.title}
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                  /{course.slug}
                </span>
                {course.category && typeof course.category === 'object' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {(course.category as any).title}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleTogglePublish}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border ${
                    course.isPublished
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                  title={course.isPublished ? 'Натисніть, щоб перевести в чернетки' : 'Натисніть, щоб опублікувати курс у каталозі'}
                >
                  {course.isPublished ? '✓ Опубліковано' : '● Чернетка'}
                </button>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-2xl mt-0.5">
                {course.description || 'Анотація та методичні цілі курсу не вказані'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
              Target P(L): <strong>{course.defaultMasteryThreshold ?? 0.85}</strong>
            </div>

            <button
              type="button"
              onClick={handleDeleteCourse}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Видалити курс"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 border-b border-slate-800/80 -mb-4 pt-1">
          <button
            type="button"
            onClick={() => handleStepSelect(2)}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'CURRICULUM'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Модульна структура & Граф Навичок (DAG)</span>
            <span className="text-[10px] font-mono opacity-80">({modules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleStepSelect(1)}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'SETTINGS'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Загальні параметри курсу</span>
          </button>
        </div>
      </div>

      {/* 5-Step Guided Course Authoring Stepper Header */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2.5 select-none shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Маршрут автора курсу: Крок {effectiveStep} з 5</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
            {effectiveStep === 1
              ? '1. Базові метадані'
              : effectiveStep === 2
              ? '2. Модульна структура'
              : effectiveStep === 3
              ? '3. Граф компетенцій (DAG)'
              : effectiveStep === 4
              ? '4. Конспекти & Підручник'
              : '5. Банк завдань & Тест'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-0.5">
          {[
            { num: 1, title: '1. Метадані', stat: `P(L) ≥ ${course.defaultMasteryThreshold ?? 0.85}` },
            { num: 2, title: '2. Модулі', stat: `${modules.length} тем` },
            { num: 3, title: '3. Компетенції', stat: `${allCourseSkills.length} навичок` },
            {
              num: 4,
              title: '4. Конспекти',
              stat: `${modules.filter((m) => Boolean(m.description?.trim())).length}/${modules.length || 1}`,
            },
            {
              num: 5,
              title: '5. Завдання & Тест',
              stat: `${allCourseSkills.reduce((acc, s) => acc + ((s as any).tasks?.length || 0), 0)} вправ`,
            },
          ].map((st) => {
            const isCurrent = effectiveStep === st.num;
            const isUnlocked = st.num <= maxUnlockedStep;
            const isLocked = !isUnlocked;

            return (
              <button
                key={st.num}
                type="button"
                disabled={isLocked}
                onClick={() => handleStepSelect(st.num)}
                className={`p-2 rounded-lg text-left transition-colors flex items-center justify-between gap-1.5 ${
                  isCurrent
                    ? 'bg-emerald-500/15 border-l-2 border-emerald-400 text-emerald-300 font-semibold cursor-pointer'
                    : isUnlocked
                    ? 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 cursor-pointer border border-slate-800/60'
                    : 'bg-slate-950/40 text-slate-600 opacity-50 cursor-not-allowed border border-slate-800/40 select-none'
                }`}
                title={
                  isLocked
                    ? `Крок ${st.num} заблоковано. Завершіть попередній крок, щоб відкрити.`
                    : isCurrent
                    ? `Поточний крок ${st.num}: ${st.title}`
                    : `Повернутися до кроку ${st.num}: ${st.title}`
                }
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-mono flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isUnlocked
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    {isLocked ? '🔒' : isCurrent ? st.num : '✓'}
                  </span>
                  <span className="text-[11px] truncate">{st.title}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500 shrink-0 hidden sm:inline">
                  {isLocked ? 'Блок' : isCurrent ? 'Зараз' : st.stat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: CURRICULUM & SKILL DAG                                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'CURRICULUM' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                Тематичні Розділи & Компетенції BKT
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                ({modules.length} тем, {allCourseSkills.length} навичок)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCreatingModule(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-emerald-950/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Додати Модуль</span>
            </button>
          </div>

          {/* Inline Create Module Panel */}
          {isCreatingModule && (
            <form onSubmit={handleCreateModule} className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Новий тематичний модуль
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingModule(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300">Назва модуля *</label>
                  <input
                    type="text"
                    placeholder="Модуль 6: Інтерактивні форми та валідація"
                    value={newModTitle}
                    onChange={(e) => {
                      setNewModTitle(e.target.value);
                      if (!newModSlug) setNewModSlug(e.target.value.toLowerCase().replace(/[\s\W-]+/g, '-').slice(0, 40));
                    }}
                    required
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Порядок (№)</label>
                  <input
                    type="number"
                    min={1}
                    value={newModOrder}
                    onChange={(e) => setNewModOrder(parseInt(e.target.value))}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300">Посилання на підручник (theoryUrl)</label>
                  <input
                    type="text"
                    placeholder={`/learn/${course.slug}/module-6`}
                    value={newModTheoryUrl}
                    onChange={(e) => setNewModTheoryUrl(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-300">Поріг BKT P(L)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="0.99"
                    value={newModThreshold}
                    onChange={(e) => setNewModThreshold(parseFloat(e.target.value))}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-3">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Теоретичний конспект / Опис теми (Markdown)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Введіть теоретичний матеріал, правила, теги або зразки коду для цього модуля..."
                    value={newModDesc}
                    onChange={(e) => setNewModDesc(e.target.value)}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 resize-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingModule(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Зберегти модуль
                </button>
              </div>
            </form>
          )}

          {/* Modules List */}
          {modules.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs">
              У цьому курсі ще немає створених модулів. Натисніть «Додати Модуль» вище.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-800/60 border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/30">
              {modules.map((mod, idx) => {
                const isExpanded = expandedModuleIds[mod.id] ?? true;
                const isEditing = editingModuleId === mod.id;
                const isAssigning = assigningModuleId === mod.id;
                const modSkills = mod.skills || [];

                return (
                  <div key={mod.id} id={`module-card-${mod.id}`} className="flex flex-col transition-all scroll-mt-6">
                    {/* Module Header Row */}
                    <div className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-900/60">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleExpand(mod.id)}
                          className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                          title={isExpanded ? 'Згорнути модуль' : 'Розгорнути модуль'}
                        >
                          {isExpanded ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                        </button>

                        <div className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                          {mod.orderIndex || idx + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{mod.title}</span>
                            <span className="text-[10px] font-mono text-slate-500">/{mod.slug}</span>
                          </div>
                          {mod.theoryUrl && (
                            <a
                              href={mod.theoryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-emerald-400 hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
                            >
                              <span>{mod.theoryUrl}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-slate-900 select-none">
                          BKT ≥ {mod.minMasteryThreshold ?? 0.85}
                        </div>

                        <button
                          type="button"
                          onClick={() => setTestingSandboxModule(mod)}
                          className="px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Протестувати модуль у пісочниці автора"
                        >
                          <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Тестувати</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedTheoryModuleIds(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                            expandedTheoryModuleIds[mod.id]
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                          }`}
                          title="Переглянути та налаштувати теоретичний конспект модуля"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Теорія</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSkillCreationModule({ id: mod.id, title: mod.title })}
                          className="px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                          title="Створити нову BKT-компетенцію в цьому модулі"
                        >
                          <Plus className="w-3 h-3 text-emerald-400" />
                          <span>Компетенція</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenAssignSkills(mod)}
                          className="px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-slate-800 text-indigo-300 text-xs font-medium transition-colors cursor-pointer"
                          title="Прив'язати навички (SkillNodes)"
                        >
                          Навички ({modSkills.length})
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (isEditing) {
                              setEditingModuleId(null);
                            } else {
                              setEditingModuleId(mod.id);
                              setEditModTitle(mod.title);
                              setEditModTheoryUrl(mod.theoryUrl || '');
                              setEditModThreshold(mod.minMasteryThreshold ?? 0.85);
                            }
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Редагувати модуль"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteModule(mod.id, mod.title)}
                          className="p-1.5 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Видалити модуль"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Theory Content Unit for this module */}
                    {expandedTheoryModuleIds[mod.id] && (
                      <div className="p-4 bg-slate-950/70 border-t border-slate-800/60 flex flex-col gap-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              Теоретичний Конспект Модуля
                            </span>
                            {mod.description && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-400 bg-emerald-500/10">
                                {mod.description.length} симв.
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenTheoryBuilder) onOpenTheoryBuilder(mod);
                                else setTheoryBuilderModule(mod);
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                              title="Відкрити повноцінний конструктор уроку з блоками коду та оманами"
                            >
                              <Sliders className="w-3 h-3" />
                              <span>Блоковий Конструктор</span>
                            </button>
                            {editingTheoryModuleId !== mod.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTheoryModuleId(mod.id);
                                  setEditingTheoryContent(mod.description || '');
                                }}
                                className="px-2 py-1 rounded-md text-[10px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                                title="Швидке редагування сирого тексту"
                              >
                                <Edit2 className="w-3 h-3 text-slate-400" />
                                <span>Markdown</span>
                              </button>
                            )}
                            {mod.theoryUrl && (
                              <a
                                href={mod.theoryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono inline-flex items-center gap-1 underline ml-1"
                              >
                                <span>Zen Focus</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        {editingTheoryModuleId === mod.id ? (
                          <div className="flex flex-col gap-2 pt-1 animate-fadeIn">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>Введіть або відредагуйте теоретичний матеріал модуля у форматі Markdown:</span>
                              <span className="font-mono text-[10px] text-slate-500">{editingTheoryContent.length} символів</span>
                            </div>
                            <textarea
                              rows={9}
                              value={editingTheoryContent}
                              onChange={(e) => setEditingTheoryContent(e.target.value)}
                              placeholder={`# Тема: ${mod.title}\n\n## 1. Теоретичні поняття\nОпишіть фундаментальні концепції, термінологію та правила...\n\n## 2. Приклад коду\n\`\`\`html\n<!DOCTYPE html>\n<html>\n  <head><title>Моя сторінка</title></head>\n  <body><h1>Привіт, світ!</h1></body>\n</html>\n\`\`\`\n\n## 3. Типові омани учнів (Misconceptions)\n- На що звернути увагу перед практикою...`}
                              className="w-full p-3 bg-slate-900 border border-emerald-500/50 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingTheoryModuleId(null)}
                                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                Скасувати
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`${API_URL}/api/v1/courses/${course.id}/modules/${mod.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ description: editingTheoryContent.trim() || null }),
                                    });
                                    if (res.ok) {
                                      setMessage('Теоретичний конспект модуля успішно збережено!');
                                      setEditingTheoryModuleId(null);
                                      await fetchFullCourseData();
                                    } else {
                                      const err = await res.json();
                                      setError(err.message || 'Помилка збереження конспекту');
                                    }
                                  } catch {
                                    setError('Помилка мережі при збереженні конспекту');
                                  }
                                }}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Зберегти конспект</span>
                              </button>
                            </div>
                          </div>
                        ) : mod.description ? (
                          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/50 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-72 overflow-y-auto">
                            {mod.description}
                          </div>
                        ) : (
                          <div className="p-6 rounded-xl bg-slate-900/30 text-center flex flex-col items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="max-w-md">
                              <h4 className="text-xs font-bold text-white">Теоретичний конспект ще не заповнено</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                Створіть структурований урок у візуальному конструкторі: заповніть вступ, теоретичні поняття, зразки коду та картки оман для учнів без потреби ручного введення синтаксису Markdown.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onOpenTheoryBuilder) onOpenTheoryBuilder(mod);
                                  else setTheoryBuilderModule(mod);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/40"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                                <span>Відкрити Блоковий Конструктор</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTheoryModuleId(mod.id);
                                  setEditingTheoryContent('');
                                }}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                              >
                                <span>Швидкий текст</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                          <span>Маршрут підручника: <code className="text-emerald-400 font-mono">{mod.theoryUrl || `/learn/${course.slug}/${mod.slug}`}</code></span>
                          <span className="text-slate-400 font-mono text-[10px]">Zen Focus Reading Engine v2.0</span>
                        </div>
                      </div>
                    )}

                    {/* Inline Edit Form for this module */}
                    {isEditing && (
                      <div className="p-3 bg-slate-950/80 border-t border-b border-slate-800 flex items-center justify-between gap-3 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                          <input
                            type="text"
                            value={editModTitle}
                            onChange={(e) => setEditModTitle(e.target.value)}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                            placeholder="Назва модуля"
                          />
                          <input
                            type="text"
                            value={editModTheoryUrl}
                            onChange={(e) => setEditModTheoryUrl(e.target.value)}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-emerald-300"
                            placeholder="/learn/.../module-N"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={editModThreshold}
                            onChange={(e) => setEditModThreshold(parseFloat(e.target.value))}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-emerald-400"
                            placeholder="0.85"
                          />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateModule(mod.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded cursor-pointer"
                          >
                            Зберегти
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingModuleId(null)}
                            className="text-xs text-slate-400 hover:text-white cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Assign Skills Panel for this module */}
                    {isAssigning && (
                      <div className="p-4 bg-slate-950/90 border-t border-b border-indigo-500/30 flex flex-col gap-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-300 uppercase">
                            Призначення компетенцій до модуля: {mod.title}
                          </span>
                          <button onClick={() => setAssigningModuleId(null)} className="text-xs text-slate-400 hover:text-white">✕</button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {allCourseSkills.map((skill) => {
                            const isChecked = selectedSkillIds.includes(skill.id);
                            return (
                              <label
                                key={skill.id}
                                className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedSkillIds([...selectedSkillIds, skill.id]);
                                      } else {
                                        setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skill.id));
                                      }
                                    }}
                                    className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                                  />
                                  <span className="truncate">{formatCleanSkillTitle(skill.title, mod.title)}</span>
                                </div>
                                <span className="text-[9px] font-mono uppercase opacity-70">
                                  {skill.difficulty}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => setAssigningModuleId(null)}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                          >
                            Скасувати
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveSkillAssignment}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                          >
                            Зберегти привʼязку ({selectedSkillIds.length})
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expanded Skills & DAG list */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 bg-slate-950/40 border-t border-slate-800/40 flex flex-col gap-2">
                        {modSkills.length === 0 ? (
                          <div className="text-[11px] text-slate-500 italic py-1">
                            До цього модуля ще не привʼязано жодної навички. Натисніть «Навички (0)» вище.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {modSkills.map((skill) => {
                              const cleanTitle = formatCleanSkillTitle(skill.title, mod.title);
                              const cleanDesc = getCleanSkillDescription(skill.description, mod.description, skill.tasks?.length || 0);
                              const diff = (skill.difficulty || 'EASY').toUpperCase();
                              const diffBadgeColor = 
                                diff === 'HARD' ? 'bg-rose-950/60 text-rose-400 border-rose-800/40' :
                                diff === 'MEDIUM' ? 'bg-amber-950/60 text-amber-400 border-amber-800/40' :
                                'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';

                              return (
                                <div key={skill.id} className="flex flex-col gap-1">
                                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                            BKT Компетенція
                                          </span>
                                          <span className="font-semibold text-slate-200 truncate">{cleanTitle}</span>
                                          <span className="text-[10px] font-mono text-slate-500">/{skill.slug}</span>
                                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase border ${diffBadgeColor}`}>
                                            {diff}
                                          </span>
                                          {skill.tasks && skill.tasks.length > 0 && (
                                            <button
                                              type="button"
                                              onClick={() => setExpandedSkillTaskIds(prev => ({ ...prev, [skill.id]: !prev[skill.id] }))}
                                              className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 hover:bg-slate-700 text-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
                                              title="Переглянути завдання цієї компетенції"
                                            >
                                              <span>{skill.tasks.length} {skill.tasks.length === 1 ? 'завдання' : skill.tasks.length < 5 ? 'завдання' : 'завдань'}</span>
                                              <span className="text-[8px]">{expandedSkillTaskIds[skill.id] ? '▲' : '▼'}</span>
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => setTaskCreationSkill({ id: skill.id, title: cleanTitle })}
                                            className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer flex items-center gap-0.5"
                                            title="Додати нове завдання до цієї компетенції"
                                          >
                                            <Plus className="w-2.5 h-2.5" />
                                            <span>Завдання</span>
                                          </button>
                                        </div>
                                        {cleanDesc && (
                                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                            {cleanDesc}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono shrink-0">
                                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400" title="Початковий рівень знань P(L₀)">
                                        P(L₀): <span className="text-emerald-400 font-bold">{skill.pInit ?? '0.50'}</span>
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400" title="Ймовірність навчання P(T)">
                                        P(T): <span className="text-emerald-400 font-bold">{skill.pTransit ?? '0.10'}</span>
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400" title="Ймовірність помилки P(S)">
                                        P(S): <span className="text-rose-400 font-bold">{skill.pSlip ?? '0.10'}</span>
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400" title="Ймовірність вгадування P(G)">
                                        P(G): <span className="text-indigo-400 font-bold">{skill.pGuess ?? '0.20'}</span>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Expanded Skill Tasks Inspector */}
                                  {expandedSkillTaskIds[skill.id] && (
                                    <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col gap-2 animate-fadeIn">
                                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                                        <div className="flex items-center gap-2">
                                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                          <span className="text-[11px] font-bold text-slate-200">
                                            Банк завдань компетенції: {cleanTitle}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-mono text-slate-400">
                                            Всього: {skill.tasks?.length || 0} завдань
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setTaskCreationSkill({ id: skill.id, title: cleanTitle })}
                                            className="px-2 py-0.5 rounded bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Додати</span>
                                          </button>
                                        </div>
                                      </div>

                                      <div className="flex flex-col divide-y divide-slate-800/50 max-h-48 overflow-y-auto pr-1">
                                        {(skill.tasks || []).map((t: any, tIdx: number) => {
                                          const typeBadge =
                                            t.taskType === 'CODE' ? 'bg-indigo-950 text-indigo-300 border-indigo-800/40' :
                                            t.taskType === 'ESSAY' ? 'bg-purple-950 text-purple-300 border-purple-800/40' :
                                            'bg-emerald-950 text-emerald-300 border-emerald-800/40';
                                          return (
                                            <div key={t.id || tIdx} className="py-1.5 flex items-center justify-between text-xs hover:bg-slate-900/40 px-1 rounded">
                                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 ${typeBadge}`}>
                                                  {t.taskType || 'CODE'}
                                                </span>
                                                <span className="truncate text-slate-300 font-medium">{t.title}</span>
                                              </div>
                                              <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[9px] font-mono uppercase text-slate-400">
                                                  {t.difficulty || 'EASY'}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Step Navigation Bar for Curriculum & DAG */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800/80 mt-4">
            <button
              type="button"
              onClick={() => handleStepSelect(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>← Назад: Базові метадані (Крок 1)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onAdvanceStep) onAdvanceStep(3);
                  else handleStepSelect(3);
                  window.dispatchEvent(new CustomEvent('admin-studio-focus-skills'));
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer border border-slate-700"
              >
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Граф компетенцій (Крок 3) →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onAdvanceStep) onAdvanceStep(4);
                  else handleStepSelect(4);
                  if (modules.length > 0 && onOpenTheoryBuilder) {
                    onOpenTheoryBuilder(modules[0]);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-emerald-950/40"
              >
                <span>Далі: Конспекти уроків (Крок 4) →</span>
              </button>

              {!course.isPublished && (
                <button
                  type="button"
                  onClick={handleTogglePublish}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-emerald-600 hover:text-white border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  title="Опублікувати курс після завершення всіх етапів"
                >
                  <span>🚀 Опублікувати курс</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: GENERAL COURSE SETTINGS                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'SETTINGS' && (
        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Назва курсу *</label>
              <input
                type="text"
                value={settingsTitle}
                onChange={(e) => setSettingsTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Slug ID (URL-адреса) *</label>
              <input
                type="text"
                value={settingsSlug}
                onChange={(e) => setSettingsSlug(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Предметна галузь (Категорія)</label>
              <select
                value={settingsCategoryId || ''}
                onChange={(e) => setSettingsCategoryId(e.target.value || null)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">Без категорії</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Цільова аудиторія</label>
              <input
                type="text"
                value={settingsAudience}
                onChange={(e) => setSettingsAudience(e.target.value)}
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
                      onClick={() => setSettingsThreshold(std.value)}
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
                        <span className="text-[10px] font-mono text-slate-500">
                          {std.badge}
                        </span>
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
                  onChange={(e) => setSettingsThreshold(parseFloat(e.target.value) || 0.85)}
                  className="w-24 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Опис курсу & Методичні цілі</label>
              <textarea
                rows={3}
                value={settingsDescription}
                onChange={(e) => setSettingsDescription(e.target.value)}
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
                onChange={(e) => setSettingsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Step 1 Actions: Save + Continue to Step 2 */}
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
              onClick={() => {
                if (onAdvanceStep) onAdvanceStep(2);
                else handleStepSelect(2);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-emerald-950/50"
            >
              <span>Продовжити: Модульна структура (Крок 2) →</span>
            </button>
          </div>
        </form>
      )}

      {/* Turnkey Authoring Modals */}
      {skillCreationModule && (
        <CreateSkillModal
          isOpen={Boolean(skillCreationModule)}
          courseId={course.id || ''}
          moduleId={skillCreationModule.id}
          moduleTitle={skillCreationModule.title}
          onClose={() => setSkillCreationModule(null)}
          onSkillCreated={async () => {
            await fetchFullCourseData();
          }}
        />
      )}

      {taskCreationSkill && (
        <CreateTaskModal
          isOpen={Boolean(taskCreationSkill)}
          courseId={course.id || ''}
          skillId={taskCreationSkill.id}
          skillTitle={taskCreationSkill.title}
          onClose={() => setTaskCreationSkill(null)}
          onTaskCreated={async () => {
            await fetchFullCourseData();
          }}
        />
      )}

      {testingSandboxModule && (
        <ModuleTestSandboxModal
          isOpen={Boolean(testingSandboxModule)}
          module={testingSandboxModule}
          courseSlug={course.slug}
          onClose={() => setTestingSandboxModule(null)}
        />
      )}

      {theoryBuilderModule && (
        <TheoryLessonBuilderModal
          isOpen={Boolean(theoryBuilderModule)}
          module={theoryBuilderModule}
          courseTitle={course.title}
          courseSlug={course.slug}
          courseId={course.id || ''}
          onClose={() => setTheoryBuilderModule(null)}
          onSaveSuccess={async () => {
            setMessage('Теоретичний конспект успішно збережено!');
            await fetchFullCourseData();
          }}
        />
      )}
    </div>
  );
};
