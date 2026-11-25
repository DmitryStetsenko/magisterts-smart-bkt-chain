'use client';

import React from 'react';
import {
  X,
  BookOpen,
  Code2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { DrawerSection, CodePlayground } from '@sbc/ui';
import type { MisconceptionDto, TheoryCapsuleDto } from '@sbc/types';

export interface JustInTimeTheoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  capsule: TheoryCapsuleDto | null;
  detectedMisconception?: MisconceptionDto | null;
  fullLessonUrl?: string | null;
  onRequestFullLesson?: (url: string) => void;
}

/**
 * 📘 JustInTimeTheoryDrawer
 * Мінімалістична безрамкова висувна панель експрес-теорії (Just-in-Time Theory Micro-Module)
 * на базі канонічних секцій `<DrawerSection>` з пакету `@sbc/ui`.
 */
export function JustInTimeTheoryDrawer({
  isOpen,
  onClose,
  capsule,
  detectedMisconception,
  fullLessonUrl,
  onRequestFullLesson,
}: JustInTimeTheoryDrawerProps) {
  if (!isOpen || !capsule) return null;

  const paragraphs = capsule.markdownContent
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <aside
        data-testid="jit-theory-drawer"
        className="fixed top-0 right-0 h-screen w-full max-w-md sm:w-[420px] bg-slate-900 border-l border-slate-800/80 z-50 flex flex-col shadow-2xl animate-fadeIn"
      >
        {/* Шапка панелі (h-[56px], уніфікована з AppShellLayout) */}
        <div className="h-[56px] px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white truncate">
                Експрес-теорія · Just-in-Time
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>~{capsule.estimatedReadMinutes ?? 2} хв читання без втрати коду</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            data-testid="close-jit-theory-btn"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Закрити теоретичну капсулу"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ізольований скрол-контейнер секцій */}
        <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-slate-800/80 flex flex-col gap-3">
          {/* Контекст виявленої когнітивної омани (якщо наявна) */}
          {detectedMisconception && (
            <DrawerSection
              title="Розбір вашої помилки"
              icon={AlertTriangle}
              iconColor="text-amber-400"
              titleColor="text-amber-400 group-hover:text-amber-300"
              defaultOpen={true}
            >
              <div className="pl-3 border-l-2 border-l-amber-400 py-1 flex flex-col gap-1">
                <span className="text-xs font-semibold text-white">
                  {detectedMisconception.title}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {detectedMisconception.explanation}
                </p>
              </div>
            </DrawerSection>
          )}

          {/* Секція 1: Теоретичне ядро теми */}
          <DrawerSection
            title="Ключова концепція"
            icon={BookOpen}
            iconColor="text-blue-400"
            titleColor="text-blue-400 group-hover:text-blue-300"
            defaultOpen={true}
            className={detectedMisconception ? 'pt-2.5' : ''}
          >
            <div className="flex flex-col gap-2.5 py-1">
              <h4 className="text-sm font-bold text-white leading-snug">
                {capsule.title}
              </h4>
              <p className="text-xs text-blue-200/90 leading-relaxed pl-2.5 border-l-2 border-l-blue-400/70">
                {capsule.summary}
              </p>
              <div className="flex flex-col gap-2 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {paragraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          </DrawerSection>

          {/* Секція 2: Зразки коду / моделей */}
          {capsule.codeExamples && capsule.codeExamples.length > 0 && (
            <DrawerSection
              title="Практичний зразок"
              icon={Code2}
              iconColor="text-indigo-400"
              titleColor="text-indigo-400 group-hover:text-indigo-300"
              badge={capsule.codeExamples.length}
              defaultOpen={true}
              className="pt-2.5"
            >
              <div className="flex flex-col divide-y divide-slate-800/50">
                {capsule.codeExamples.map((example, idx) => (
                  <div key={idx} className="py-2 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-200">{example.title}</span>
                      <span className="font-mono text-[10px] text-slate-500 uppercase">
                        {example.language}
                      </span>
                    </div>
                    <CodePlayground
                      initialCode={example.code}
                      language={example.language || 'javascript'}
                      title={example.title}
                      compact={true}
                      readOnly={false}
                      runnable={(example.language || 'javascript').toLowerCase().includes('js') || (example.language || 'javascript').toLowerCase() === 'javascript'}
                    />
                  </div>
                ))}
              </div>
            </DrawerSection>
          )}

          {/* Секція 3: Чек-лист головних висновків */}
          {capsule.keyTakeaways && capsule.keyTakeaways.length > 0 && (
            <DrawerSection
              title="Чек-лист самоперевірки"
              icon={CheckCircle2}
              iconColor="text-emerald-400"
              titleColor="text-emerald-400 group-hover:text-emerald-300"
              badge={capsule.keyTakeaways.length}
              defaultOpen={true}
              className="pt-2.5"
            >
              <div className="flex flex-col divide-y divide-slate-800/50">
                {capsule.keyTakeaways.map((point, idx) => (
                  <div key={idx} className="py-2 flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </DrawerSection>
          )}
        </div>

        {/* Нижня панель дій (без вкладених рамок) */}
        <div className="px-4 py-3 border-t border-slate-800/80 flex items-center justify-between gap-2 shrink-0 bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>До розв’язання</span>
          </button>

          {fullLessonUrl && (
            <button
              type="button"
              data-testid="jit-theory-open-full-lesson-btn"
              onClick={() => {
                if (onRequestFullLesson) {
                  onRequestFullLesson(fullLessonUrl);
                } else {
                  window.open(fullLessonUrl, '_blank');
                }
              }}
              className="px-3 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Відкрити повний інтерактивний урок у Zen-режимі (порт 3006)"
            >
              <span>Повний урок</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
