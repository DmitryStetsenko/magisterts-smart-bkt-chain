'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  GraduationCap,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { Badge, CodePlayground } from '@sbc/ui';
import type { LessonUnit } from '@/data/school-web-curriculum';

export interface LessonContentCanvasProps {
  currentUnit: LessonUnit;
  maxWidthClass: string;
  fontSizeClass: string;
  contentBgClass: string;
  practiceUrl: string;
}

/**
 * Основне полотно навчального параграфа з інтерактивним кодом, картками оман та переходом до BKT-тренажера.
 */
export const LessonContentCanvas: React.FC<LessonContentCanvasProps> = ({
  currentUnit,
  maxWidthClass,
  fontSizeClass,
  contentBgClass,
  practiceUrl,
}) => {
  return (
    <div className={`w-full ${maxWidthClass} flex flex-col gap-8`}>
      {/* Заголовок та метаінформація уроку */}
      <div className="flex flex-col gap-2 border-b border-slate-800/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{currentUnit.title}</h1>

        <div className="flex items-center gap-4 text-xs opacity-75 mt-1 font-mono">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Час опрацювання: ~{currentUnit.estimatedMinutes} хв</span>
          </span>
          <span>•</span>
          <span>{currentUnit.sections.length} тематичні блоки</span>
        </div>
      </div>

      {/* Коротке дидактичне резюме параграфа */}
      <div className={`p-4 sm:p-5 rounded-2xl ${contentBgClass} border leading-relaxed text-sm`}>
        <div className="font-bold text-xs uppercase tracking-wider mb-1.5 opacity-70 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Дидактичний фокус уроку:</span>
        </div>
        <p className="opacity-95">{currentUnit.summary}</p>
      </div>

      {/* Секції навчального матеріалу */}
      <div className="flex flex-col gap-10">
        {currentUnit.sections.map((sec) => (
          <section key={sec.id} id={sec.id} className="flex flex-col gap-4 scroll-mt-20">
            <div className="flex items-center gap-2">
              <Badge variant="info" size="xs" mono className="uppercase tracking-wider">
                {sec.badge}
              </Badge>
              <h3 className="text-lg font-bold tracking-tight">{sec.title}</h3>
            </div>

            <p className="text-xs font-medium opacity-80 italic pl-1 border-l-2 border-blue-500/40">
              {sec.summary}
            </p>

            <div className={`${fontSizeClass} whitespace-pre-line leading-relaxed opacity-95`}>
              {sec.conceptExplanation}
            </div>

            {sec.codeSnippet && (
              <div className="flex flex-col gap-2 my-2">
                <CodePlayground
                  initialCode={sec.codeSnippet.code}
                  language={sec.codeSnippet.language || 'javascript'}
                  title="Інтерактивний приклад коду"
                  autoRun={true}
                />
                {sec.codeSnippet.explanation && (
                  <span className="text-[11px] opacity-70 italic px-2">
                    💡 {sec.codeSnippet.explanation}
                  </span>
                )}
              </div>
            )}

            {sec.misconceptionAlert && (
              <div
                id={`misconception-${sec.id}`}
                className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2.5"
              >
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>💡 УВАГА! ТИПОВА КОГНІТИВНА ОМАНА УЧНІВ:</span>
                </div>
                <div className="text-xs text-amber-200/90 italic pl-6">
                  {sec.misconceptionAlert.wrongBelief}
                </div>
                <div className="text-xs pl-6 leading-relaxed opacity-90">
                  <strong className="text-amber-300 font-semibold">Чому це хибно: </strong>
                  {sec.misconceptionAlert.realityExplanation}
                </div>
                <div className="text-xs text-emerald-300 pl-6 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>{sec.misconceptionAlert.fixTip}</span>
                </div>
              </div>
            )}

            <div className={`p-4 rounded-xl ${contentBgClass} border flex flex-col gap-2`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                <span>Головні тези для запам'ятовування:</span>
              </div>
              <ul className="flex flex-col gap-1 pl-4 list-disc text-xs opacity-80 leading-relaxed">
                {sec.keyTakeaways.map((item, tIdx) => (
                  <li key={tIdx}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      {/* 🚀 ШЛЮЗ ПІДТВЕРДЖЕННЯ КОМПЕТЕНЦІЇ ТА ВІДКРИТТЯ НАСТУПНИХ ТЕМ */}
      <div className="p-6 rounded-2xl bg-[var(--sbc-bg-surface,#1f1f1f)] border border-[var(--sbc-border-subtle,#2b2b2b)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mt-6 transition-colors">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[var(--sbc-bg-subtle,#2a2d2e)] text-emerald-500 border border-[var(--sbc-border-subtle,#2b2b2b)] shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success" size="xs" mono className="uppercase tracking-wider">
                Теоретичний блок опрацьовано
              </Badge>
              <span className="text-[10px] font-mono text-[var(--sbc-text-tertiary,#6b6b6b)]">
                BKT-поріг для розблокування: ≥ 85%
              </span>
            </div>
            <h4 className="text-sm font-bold text-[var(--sbc-text-primary,#cccccc)]">
              Відкрито практичний модуль підтвердження компетенції
            </h4>
            <p className="text-xs text-[var(--sbc-text-muted,#909090)] max-w-xl leading-relaxed">
              Щоб розблокувати наступний модуль курсу, підтвердіть засвоєння навички в Тренажері.
              Після успішного розв'язання практичних задач BKT-секвенсор автоматично відкриє доступ
              до наступної теми.
            </p>
          </div>
        </div>

        <a
          href={practiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <span>Підтвердити компетенцію в Тренажері</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
