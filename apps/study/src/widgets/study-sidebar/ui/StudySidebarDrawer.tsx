'use client';

import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  Code2,
  GraduationCap,
  Layers,
  Lock,
  Sparkles,
  Unlock,
} from 'lucide-react';
import { CodePlayground, DrawerSection, ThemeSettingsSection } from '@sbc/ui';
import type { CourseCurriculum, CurriculumModule, LessonUnit } from '@/data/school-web-curriculum';

export type StudyTab = 'curriculum' | 'playground' | 'glossary' | 'settings';

export interface StudySidebarDrawerProps {
  activeTab: StudyTab;
  activeCurriculum: CourseCurriculum;
  currentModule: CurriculumModule;
  currentUnit: LessonUnit;
  selectedModuleSlug: string;
  selectedUnitSlug: string;
  unlockedModules: Record<string, boolean>;
  moduleMasteryScores: Record<string, number>;
  onSelectModule: (moduleSlug: string) => void;
  onSelectUnit: (moduleSlug: string, unitSlug: string) => void;
}

/**
 * Вміст бічної панелі підручника (зміст, пісочниця коду, атлас оман, налаштування).
 */
export const StudySidebarDrawer: React.FC<StudySidebarDrawerProps> = ({
  activeTab,
  activeCurriculum,
  currentModule,
  currentUnit,
  selectedModuleSlug,
  selectedUnitSlug,
  unlockedModules,
  moduleMasteryScores,
  onSelectModule,
  onSelectUnit,
}) => {
  if (activeTab === 'curriculum') {
    return (
      <>
        <DrawerSection
          title="Навчальна дисципліна"
          icon={GraduationCap}
          iconColor="text-blue-400"
          badge={activeCurriculum.gradeLevel || '10-11 кл'}
          badgeColor="blue"
          defaultOpen={false}
        >
          <div className="flex flex-col gap-1.5 p-1">
            <div className="text-xs font-semibold text-white">{activeCurriculum.courseTitle}</div>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              {activeCurriculum.description}
            </div>
          </div>
        </DrawerSection>

        <DrawerSection
          title="Тематичні модулі"
          icon={Layers}
          iconColor="text-indigo-400"
          badge={`${activeCurriculum.modules.length}`}
          badgeColor="indigo"
          defaultOpen={true}
        >
          <div className="flex flex-col divide-y divide-slate-800/50">
            {activeCurriculum.modules.map((mod, modIdx) => {
              const isUnlocked = unlockedModules[mod.moduleSlug] ?? modIdx === 0;
              const masteryScore = moduleMasteryScores[mod.moduleSlug] ?? 0;
              const isCurrent = mod.moduleSlug === selectedModuleSlug;

              return (
                <button
                  key={mod.moduleSlug}
                  onClick={() => {
                    onSelectModule(mod.moduleSlug);
                    if (mod.units && mod.units.length > 0) {
                      onSelectUnit(mod.moduleSlug, mod.units[0].slug);
                    }
                  }}
                  className={`w-full text-left py-2.5 px-2 rounded-lg text-xs transition-colors flex flex-col gap-1 cursor-pointer relative ${
                    isCurrent
                      ? 'bg-blue-500/10 text-blue-200'
                      : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-500">
                      Модуль {mod.moduleNumber}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                          <Unlock className="w-2.5 h-2.5" />
                          <span>{masteryScore}%</span>
                        </span>
                      ) : (
                        <span
                          className="flex items-center gap-1 text-[10px] font-mono text-amber-400/90"
                          title="Потрібно опанувати попередній модуль у тренажері (BKT ≥ 85%)"
                        >
                          <Lock className="w-2.5 h-2.5" />
                          <span>Заблоковано</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-medium text-xs leading-snug line-clamp-1">
                    {mod.title.replace(/^Модуль \d+:\s*/, '')}
                  </span>
                </button>
              );
            })}
          </div>
        </DrawerSection>

        <DrawerSection
          title={`Уроки: Модуль ${currentModule.moduleNumber}`}
          icon={BookOpen}
          iconColor="text-emerald-400"
          badge={`${currentModule.units.length}`}
          badgeColor="emerald"
          defaultOpen={false}
        >
          <div className="flex flex-col divide-y divide-slate-800/50">
            {currentModule.units.map((unit, idx) => {
              const isCurrentUnit = unit.slug === selectedUnitSlug;
              return (
                <button
                  key={unit.slug}
                  onClick={() => onSelectUnit(currentModule.moduleSlug, unit.slug)}
                  className={`w-full text-left py-2 px-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isCurrentUnit
                      ? 'bg-emerald-500/10 text-emerald-200 font-semibold'
                      : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <span className="w-4 text-[10px] font-mono text-slate-500 shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="truncate">{unit.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {unit.estimatedMinutes} хв
                  </span>
                </button>
              );
            })}
          </div>
        </DrawerSection>
      </>
    );
  }

  if (activeTab === 'playground') {
    return (
      <DrawerSection
        title="Інтерактивний редактор JS"
        icon={Code2}
        iconColor="text-emerald-400"
        titleColor="text-emerald-400 group-hover:text-emerald-300"
        defaultOpen={true}
      >
        <div className="flex flex-col gap-2.5 pt-1">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Експериментуйте з кодом у вбудованому редакторі Monaco (VS Code). Натисніть{' '}
            <kbd className="px-1 py-0.5 rounded bg-[var(--sbc-bg-subtle,#262626)] border border-[var(--sbc-border-subtle,#2b2b2b)] font-mono text-[10px]">
              Ctrl+Enter
            </kbd>{' '}
            для запуску.
          </p>
          <CodePlayground
            compact={true}
            initialCode={`// Спробуйте змінити значення:
const greeting = "Привіт, 10 клас!";
let counter = 1;
counter = counter + 1;
console.log(greeting, "Номер спроби:", counter);`}
            autoRun={true}
          />
        </div>
      </DrawerSection>
    );
  }

  if (activeTab === 'glossary') {
    return (
      <div className="flex flex-col gap-2 p-1">
        <div className="text-xs text-slate-400 mb-1">
          Каталог типових оман та алгоритмічних підказок поточного розділу:
        </div>
        {currentUnit.sections
          .filter((s) => s.misconceptionAlert)
          .map((s, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex flex-col gap-1.5"
            >
              <span className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{s.title}</span>
              </span>
              <p className="text-[11px] text-amber-200/90 italic">
                {s.misconceptionAlert?.wrongBelief}
              </p>
              <p className="text-[11px] text-slate-300">{s.misconceptionAlert?.fixTip}</p>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-slate-800/70 text-xs text-slate-300">
      <div className="pb-3">
        <ThemeSettingsSection />
      </div>

      <div className="pt-3">
        <DrawerSection
          title="Режим фокусного читання"
          icon={Sparkles}
          iconColor="text-amber-400"
          titleColor="text-amber-400 group-hover:text-amber-300"
          defaultOpen={false}
        >
          <p className="text-[11px] text-slate-400 leading-relaxed py-1">
            Натисніть клавішу{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded font-mono border border-slate-700">
              F
            </kbd>{' '}
            на клавіатурі або скористайтеся плаваючою панеллю інструментів унизу екрана для приховування меню та вибору стилю читання.
          </p>
        </DrawerSection>
      </div>
    </div>
  );
};
