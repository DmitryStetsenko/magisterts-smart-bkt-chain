'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileDown,
  X,
  RefreshCw,
  Layers,
  BookOpen,
  HelpCircle,
  Check,
  AlertTriangle,
} from 'lucide-react';
import type { CourseDto } from '@sbc/types';
import {
  parseCourseWorkbook,
  downloadCourseTemplate,
  CourseImportValidationResult,
} from '../services/courseWorkbookService';

interface CourseImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseImported: (course: CourseDto) => void;
  apiUrl?: string;
}

export const CourseImportModal: React.FC<CourseImportModalProps> = ({
  isOpen,
  onClose,
  onCourseImported,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<CourseImportValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showHowToExport, setShowHowToExport] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setServerError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = async (file: File) => {
    setServerError(null);
    setSelectedFile(file);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = parseCourseWorkbook(arrayBuffer);
      setValidationResult(result);
    } catch (err: any) {
      setServerError(`Помилка читання файлу: ${err?.message || 'Некоректний файл'}`);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleImportSubmit = async () => {
    if (!validationResult?.payload || !validationResult.isValid) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        ...validationResult.payload,
        overwriteExisting,
      };

      const res = await fetch(`${apiUrl}/api/v1/courses/import-workbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Помилка сервера (${res.status})`);
      }

      const importedCourse: CourseDto = await res.json();
      onCourseImported(importedCourse);
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Не вдалося імпортувати курс');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden my-auto border-t-emerald-500/30 border-t">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Імпорт навчального курсу з таблиці</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  .xlsx / Google Sheets
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Канонічний 5-аркушевий стандарт Smart-BKT-Chain з автоматичною перевіркою валідності
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[calc(85vh-120px)] overflow-y-auto pr-3">
          {serverError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-sans">{serverError}</div>
            </div>
          )}

          {!selectedFile ? (
            /* Upload Dropzone */
            <div className="flex flex-col gap-3">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-500/5 scale-[0.99]'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-slate-300 mb-3 group-hover:text-emerald-400">
                  <UploadCloud className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xs font-semibold text-white mb-1">
                  Перетягніть файл книги Excel (.xlsx) сюди або клацніть для вибору
                </h3>
                <p className="text-[11px] text-slate-500 max-w-sm mb-3">
                  Файл має містити 5 обовʼязкових аркушів: <code className="text-emerald-400/90 font-mono">Course</code>, <code className="text-emerald-400/90 font-mono">Modules</code>, <code className="text-emerald-400/90 font-mono">Skills</code>, <code className="text-emerald-400/90 font-mono">Theory</code>, <code className="text-emerald-400/90 font-mono">Tasks</code>
                </p>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm shadow-emerald-950/40">
                  Обрати файл на диску
                </span>
              </div>

              {/* Template & Helper Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => downloadCourseTemplate()}
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-medium"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Завантажити еталонний шаблон курсу (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHowToExport(!showHowToExport)}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-300 transition-colors cursor-pointer text-[11px]"
                >
                  <HelpCircle className="w-3 h-3 text-slate-500" />
                  <span>Як експортувати з Google Sheets?</span>
                </button>
              </div>

              {showHowToExport && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed flex flex-col gap-1.5 animate-fadeIn">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Синхронізація з Google Sheets:</span>
                  </span>
                  <p className="text-slate-400">
                    1. Завантажте шаблон вище та імпортуйте його в Google Таблиці (<em>Файл ➔ Імпорт</em>).
                  </p>
                  <p className="text-slate-400">
                    2. Заповніть ваші тематичні модулі, компетентності BKT, конспекти Zen Focus та банк завдань.
                  </p>
                  <p className="text-slate-400">
                    3. Експортуйте файл: <strong className="text-white">Файл ➔ Завантажити ➔ Microsoft Excel (.xlsx)</strong> та завантажте сюди.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Pre-flight Inspection Preview */
            <div className="flex flex-col gap-3.5 animate-fadeIn">
              {/* File details bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} КБ
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer transition-colors"
                >
                  Замінити файл
                </button>
              </div>

              {validationResult && (
                <>
                  {/* Status Indicator */}
                  {validationResult.isValid ? (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold">
                          Перевірка успішна: курс готовий до атомарного імпорту (100% валідність)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Pre-flight OK
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="font-semibold">
                          Виявлено блокуючі помилки ({validationResult.errors.length}): виправте таблицю перед імпортом
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                        Блоковано
                      </span>
                    </div>
                  )}

                  {/* Course Summary Card */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <div className="text-xs font-bold text-white">
                          {validationResult.stats.courseTitle || 'Назва курсу не вказана'}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-400/90">
                          /{validationResult.stats.courseSlug || 'без-слага'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                          {validationResult.stats.category || 'Загальна'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          Target P(L): {validationResult.stats.targetPl}
                        </span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Модулів</div>
                        <div className="text-sm font-bold text-white font-mono">
                          {validationResult.stats.moduleCount}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Навичок BKT</div>
                        <div className="text-sm font-bold text-emerald-400 font-mono">
                          {validationResult.stats.skillCount}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Конспектів</div>
                        <div className="text-sm font-bold text-purple-400 font-mono">
                          {validationResult.stats.theoryCount}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Завдань</div>
                        <div className="text-sm font-bold text-blue-400 font-mono">
                          {validationResult.stats.taskCount}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Errors List (if any) */}
                  {validationResult.errors.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Список помилок валідації:</span>
                      </span>
                      <div className="max-h-48 overflow-y-auto space-y-1 p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-[11px] text-rose-300 font-sans">
                        {validationResult.errors.map((err, i) => (
                          <div key={i} className="flex items-start gap-1.5 py-0.5">
                            <span className="text-rose-500 font-bold shrink-0">•</span>
                            <span>{err}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings List (if any) */}
                  {validationResult.warnings.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-amber-400/90 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Попередження (не блокують імпорт):</span>
                      </span>
                      <div className="max-h-24 overflow-y-auto space-y-0.5 p-2 rounded-xl bg-amber-950/20 border border-amber-900/30 text-[10px] text-amber-300 font-sans">
                        {validationResult.warnings.map((warn, i) => (
                          <div key={i} className="flex items-start gap-1">
                            <span className="text-amber-500 shrink-0">•</span>
                            <span>{warn}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Overwrite existing option */}
                  {validationResult.isValid && (
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:bg-slate-950/80 transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={overwriteExisting}
                        onChange={(e) => setOverwriteExisting(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>
                        Перезаписати курс, якщо чернетка зі слагом{' '}
                        <code className="text-emerald-400 font-mono font-semibold">
                          /{validationResult.stats.courseSlug}
                        </code>{' '}
                        вже існує в системі
                      </span>
                    </label>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800/80 bg-slate-900/80">
          <div className="text-[10px] text-slate-500 hidden sm:flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-600" />
            <span>Атомарна транзакція PostgreSQL: створення або відкат (Rollback)</span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Скасувати
            </button>

            {selectedFile && (
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={!validationResult?.isValid || isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all shadow-md shadow-emerald-950/40 cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Імпортуємо в базу даних...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Імпортувати в систему</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
