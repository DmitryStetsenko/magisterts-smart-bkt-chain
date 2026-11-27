'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Layers,
  BookOpen,
  Code2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  ChevronDown,
  ChevronUp,
  Key,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';
import type { CourseDto, AiCourseScaffoldRequestDto } from '@sbc/types';
import { Modal, Badge } from '@sbc/ui';
import {
  downloadParsedCourseWorkbook,
  type ParsedCourseImportDto,
} from '../services/courseWorkbookService';

interface AiCourseScaffolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (course: CourseDto) => void;
  apiUrl?: string;
}

const PROMPT_PRESETS = [
  {
    label: '🐍 Алгоритми на Python',
    prompt: 'Алгоритми та структури даних у Python: оцінка складності Big-O, лінійні списки, стеки, хеш-таблиці та динамічне програмування',
    category: 'Інформатика & IT',
  },
  {
    label: '⚛️ React & Веб-розробка',
    prompt: 'Сучасна веб-розробка: семантична розмітка HTML5, гнучка верстка CSS Flexbox/Grid, реактивні інтерфейси та керування подіями',
    category: 'Інформатика & IT',
  },
  {
    label: '🗄️ SQL & Бази даних',
    prompt: 'Реляційні бази даних та проектування схем: синтаксис SQL, нормалізація даних, операції JOIN, індекси та транзакції ACID',
    category: 'Інформатика & IT',
  },
  {
    label: '🛡️ Кібербезпека & OWASP',
    prompt: 'Основи кібергігієни та безпеки веб-систем: модель CIA, мережевий аналіз, топ вразливостей OWASP Top 10 та захист даних',
    category: 'Інформатика & IT',
  },
];

export const AiCourseScaffolderModal: React.FC<AiCourseScaffolderModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [category, setCategory] = useState<string>('Інформатика & IT');
  const [targetAudience, setTargetAudience] = useState<string>('10-11 класи, Студенти коледжів');
  const [moduleCount, setModuleCount] = useState<number>(3);
  const [targetPl, setTargetPl] = useState<number>(0.85);
  const [apiKey, setApiKey] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(1);
  const [scaffoldResult, setScaffoldResult] = useState<ParsedCourseImportDto | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Скидання кроків прогресу генерації
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setGenerationStep(1);
      interval = setInterval(() => {
        setGenerationStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleApplyPreset = (preset: (typeof PROMPT_PRESETS)[0]) => {
    setPrompt(preset.prompt);
    setCategory(preset.category);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Введіть опис або тему курсу для генерації');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const payload: AiCourseScaffoldRequestDto = {
        prompt: prompt.trim(),
        category: category.trim(),
        targetAudience: targetAudience.trim(),
        moduleCount,
        targetPl,
        apiKey: apiKey.trim() || undefined,
      };

      const res = await fetch(`${apiUrl}/api/v1/courses/ai-scaffold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Помилка сервера (${res.status})`);
      }

      const data: ParsedCourseImportDto = await res.json();
      setScaffoldResult(data);
    } catch (err: any) {
      setError(err?.message || 'Не вдалося згенерувати каркас курсу');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadXlsx = () => {
    if (!scaffoldResult) return;
    try {
      downloadParsedCourseWorkbook(scaffoldResult);
    } catch (err: any) {
      setError(`Помилка експорту Excel: ${err?.message}`);
    }
  };

  const handleCommitCourse = async () => {
    if (!scaffoldResult) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...scaffoldResult,
        overwriteExisting,
      };

      const res = await fetch(`${apiUrl}/api/v1/courses/import-workbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Помилка створення курсу (${res.status})`);
      }

      const createdCourse: CourseDto = await res.json();
      onCourseCreated(createdCourse);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Не вдалося зберегти курс у базі даних');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setScaffoldResult(null);
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !(isGenerating || isSubmitting) && onClose()}
      size="2xl"
      closeOnOverlayClick={!(isGenerating || isSubmitting)}
      closeOnEscape={!(isGenerating || isSubmitting)}
      hideCloseButton={isGenerating || isSubmitting}
      icon={
        <div className="w-8 h-8 rounded-lg bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Sparkles className="w-4 h-4" />
        </div>
      }
      title={
        <span className="flex items-center gap-2 flex-wrap">
          <span>ШІ One-Shot Генератор курсу</span>
          <Badge variant="accent" size="xs" mono>Gemini 2.5 + Fallback</Badge>
        </span>
      }
      subtitle="Автоматична генерація паспорта, модулів, DAG-компетентностей, 5-блочної теорії та тест-кейсів"
    >
      <div className="space-y-4">
        {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Стан 1: Введення вимог (Input Form) */}
          {!scaffoldResult && !isGenerating && (
            <div className="space-y-4 animate-fadeIn">
              {/* Presets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Швидкі шаблони запиту (Presets)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-800 hover:text-white text-slate-300 border border-slate-700/50 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt textarea */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Тема або концепція курсу *
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Опишіть цілі курсу українською мовою: наприклад, «Основи алгоритмів та структур даних у Python: Big-O, списки, стеки, хеш-таблиці та задачі в Monaco Editor»..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 outline-none transition-colors"
                />
              </div>

              {/* Grid: Category, Audience, Modules, Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Освітня категорія
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Інформатика & IT"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Цільова аудиторія
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="10-11 класи, Студенти"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Кількість модулів
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {[2, 3, 4, 5].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setModuleCount(cnt)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          moduleCount === cnt
                            ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Поріг майстерності BKT P(L)
                  </label>
                  <select
                    value={targetPl}
                    onChange={(e) => setTargetPl(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-purple-500/50"
                  >
                    <option value={0.75}>0.75 (Базовий рівень)</option>
                    <option value={0.80}>0.80 (Середній рівень)</option>
                    <option value={0.85}>0.85 (Стандарт системи SBC)</option>
                    <option value={0.90}>0.90 (Поглиблений рівень)</option>
                  </select>
                </div>
              </div>

              {/* Advanced: Gemini API Key */}
              <div className="pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Розширені налаштування (Ключ Gemini API)</span>
                  {showAdvanced ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                </button>

                {showAdvanced && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-medium">Google Gemini API Key (Опціонально)</span>
                    </div>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none font-mono focus:border-purple-500/50"
                    />
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      💡 Якщо ключ не вказано або вичерпано квоту, система миттєво згенерує повноцінний курс через вбудований
                      детерміністичний <strong>Семантичний Евристичний Двигун</strong> з нульовою затримкою.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Стан 2: Генерація (Loading state) */}
          {isGenerating && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 animate-pulse">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="absolute -inset-1 rounded-2xl border border-purple-500/20 animate-spin -z-10" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-white">ШІ проектує структуру навчального курсу...</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {generationStep === 1 && '1/4: Семантичний аналіз теми та побудова модулів...'}
                  {generationStep === 2 && '2/4: Побудова ациклічного графу BKT-компетентностей (DAG)...'}
                  {generationStep === 3 && '3/4: Формування 5-блочних конспектів уроків Zen Focus...'}
                  {generationStep === 4 && '4/4: Генерація адаптивних задач та тест-кейсів Monaco Editor...'}
                </p>
              </div>

              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${generationStep * 25}%` }}
                />
              </div>
            </div>
          )}

          {/* Стан 3: Результат та Інспекція (Preview state) */}
          {scaffoldResult && !isGenerating && (
            <div className="space-y-4 animate-fadeIn">
              {/* Ready Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-purple-200">
                    Каркас успішно згенеровано ШІ
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Pre-flight OK • Граф DAG ациклічний
                </span>
              </div>

              {/* Course Passport Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{scaffoldResult.course.title}</h3>
                    <p className="text-[11px] font-mono text-purple-400 mt-0.5">/{scaffoldResult.course.slug}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {scaffoldResult.course.category || 'Загальна категорія'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {scaffoldResult.course.description}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>Цільова аудиторія: <strong className="text-slate-300">{scaffoldResult.course.targetAudience}</strong></span>
                  <span>Поріг BKT: <strong className="text-purple-300">{scaffoldResult.course.bktMasteryThreshold}</strong></span>
                </div>
              </div>

              {/* 4-Card Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-sky-400" /> Модулі
                  </span>
                  <span className="text-base font-bold text-white mt-1">{scaffoldResult.modules.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> Навички (DAG)
                  </span>
                  <span className="text-base font-bold text-white mt-1">{scaffoldResult.skills.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-400" /> Теорія Zen
                  </span>
                  <span className="text-base font-bold text-white mt-1">{scaffoldResult.theories?.length || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Code2 className="w-3 h-3 text-emerald-400" /> Задачі пісочниці
                  </span>
                  <span className="text-base font-bold text-white mt-1">{scaffoldResult.tasks?.length || 0}</span>
                </div>
              </div>

              {/* Modules breakdown preview */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Згенеровані модулі та звʼязки:
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {scaffoldResult.modules.map((m, idx) => {
                    const modSkills = scaffoldResult.skills.filter((s) => s.moduleSlug === m.slug);
                    return (
                      <div
                        key={m.slug}
                        className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-4 h-4 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-slate-200 font-medium truncate">{m.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {modSkills.length} навичок
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overwrite option */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500/40"
                />
                <span>Перезаписати існуючий чернетковий курс (якщо слаг збігається)</span>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800/80 bg-slate-900/50">
          {!scaffoldResult ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Скасувати
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-1.5 shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Згенерувати каркас курсу</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Згенерувати іншу тему</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadXlsx}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Завантажити Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCommitCourse}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Створення...</span>
                    </>
                  ) : (
                    <>
                      <span>Створити та відкрити в Студії</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
      </div>
    </Modal>
  );
};
