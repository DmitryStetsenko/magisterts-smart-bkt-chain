'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Code2, 
  Clock, 
  GraduationCap, 
  ArrowRight,
  ExternalLink,
  Flame,
  Lightbulb
} from 'lucide-react';
import { SCHOOL_WEB_CURRICULUM, LessonUnit, LessonSection } from '../data/school-web-curriculum';
import { CodePlayground } from '../components/CodePlayground';

export default function StudyPortalHomePage() {
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('school-alg-basics');
  const [selectedUnitSlug, setSelectedUnitSlug] = useState<string>('variables-and-types');

  const currentModule = SCHOOL_WEB_CURRICULUM.modules.find(m => m.moduleSlug === selectedModuleSlug) || SCHOOL_WEB_CURRICULUM.modules[0];
  const currentUnit = currentModule.units.find(u => u.slug === selectedUnitSlug) || currentModule.units[0];

  return (
    <div className="flex h-screen bg-[#070a13] text-slate-100 overflow-hidden font-sans">
      {/* 1. БІЧНИЙ НАВІГАЦІЙНИЙ САЙДБАР (Зміст курсу) */}
      <aside className="w-80 border-r border-slate-800/80 bg-slate-950/70 flex flex-col shrink-0">
        {/* Шапка сайдбара */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-white tracking-wide">SMART-BKT STUDY</h1>
              <p className="text-[10px] text-blue-400 font-medium">Інтерактивний Підручник</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            v1.0
          </span>
        </div>

        {/* Інформація про активний курс */}
        <div className="p-3.5 mx-3 my-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>{SCHOOL_WEB_CURRICULUM.courseTitle}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            {SCHOOL_WEB_CURRICULUM.gradeLevel}
          </p>
        </div>

        {/* Список модулів та уроків */}
        <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-3">
          {SCHOOL_WEB_CURRICULUM.modules.map((mod) => {
            const isModuleActive = mod.moduleSlug === selectedModuleSlug;
            return (
              <div key={mod.moduleSlug} className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setSelectedModuleSlug(mod.moduleSlug);
                    if (mod.units.length > 0) {
                      setSelectedUnitSlug(mod.units[0].slug);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isModuleActive
                      ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <span className="truncate pr-2">{mod.title}</span>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isModuleActive ? 'rotate-90 text-blue-400' : 'text-slate-600'}`} />
                </button>

                {/* Уроки всередині обраного модуля */}
                {isModuleActive && (
                  <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-blue-500/20 ml-3 my-1">
                    {mod.units.map((unit) => {
                      const isUnitActive = unit.slug === selectedUnitSlug;
                      return (
                        <button
                          key={unit.slug}
                          onClick={() => setSelectedUnitSlug(unit.slug)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all flex items-center justify-between cursor-pointer ${
                            isUnitActive
                              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                          }`}
                        >
                          <span className="truncate">{unit.title}</span>
                          <span className="text-[9px] font-mono opacity-80 shrink-0 ml-1">{unit.estimatedMinutes} хв</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Футер сайдбара з лінком на Студентський Тренажер */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950">
          <a
            href="http://localhost:3002"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <span>Перейти до Тренажера</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>

      {/* 2. ГОЛОВНА ОБЛАСТЬ КОНТЕНТУ (Підручник та Інтерактивні Секції) */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Верхній навігаційний бар (Breadcrumbs) */}
        <header className="px-8 py-4 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>{currentModule.title}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-blue-400 font-bold">{currentUnit.title}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Час на опрацювання: ~{currentUnit.estimatedMinutes} хв</span>
            </div>
          </div>
        </header>

        {/* Тіло уроку */}
        <div className="max-w-4xl mx-auto w-full px-8 py-8 flex flex-col gap-8">
          {/* Заголовок уроку та вступ */}
          <div className="flex flex-col gap-3 border-b border-slate-800/80 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentUnit.gradeLevel} • Модуль {currentUnit.moduleNumber}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">{currentUnit.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
              {currentUnit.summary}
            </p>
          </div>

          {/* Секції уроку з теорією, кодом та оманами */}
          <div className="flex flex-col gap-10">
            {currentUnit.sections.map((sec, idx) => (
              <section key={sec.id} id={sec.id} className="flex flex-col gap-4 scroll-mt-20">
                {/* Заголовок секції */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-wide">{sec.title}</h3>
                  </div>
                  {sec.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {sec.badge}
                    </span>
                  )}
                </div>

                {/* Теоретичне пояснення */}
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                  {sec.conceptExplanation}
                </div>

                {/* Інтерактивна пісочниця коду */}
                {sec.codeSnippet && (
                  <CodePlayground
                    title={`Живий приклад: ${sec.title}`}
                    initialCode={sec.codeSnippet.code}
                  />
                )}

                {/* Блок попередження про типову когнітивну оману (Misconception Alert) */}
                {sec.misconceptionAlert && (
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>💡 УВАГА! ТИПОВА КОГНІТИВНА ОМАНА УЧНІВ:</span>
                    </div>
                    <div className="text-xs text-amber-200/90 italic pl-6">
                      {sec.misconceptionAlert.wrongBelief}
                    </div>
                    <div className="text-xs text-slate-300 pl-6 leading-relaxed">
                      <strong className="text-amber-300 font-semibold">Чому це хибно: </strong>
                      {sec.misconceptionAlert.realityExplanation}
                    </div>
                    <div className="text-xs text-emerald-300 pl-6 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span>{sec.misconceptionAlert.fixTip}</span>
                    </div>
                  </div>
                )}

                {/* Ключові висновки (Key Takeaways) */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                    <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                    <span>Головні тези для запам'ятовування:</span>
                  </div>
                  <ul className="flex flex-col gap-1 pl-4 list-disc text-xs text-slate-400 leading-relaxed">
                    {sec.keyTakeaways.map((item, tIdx) => (
                      <li key={tIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>

          {/* Блок переходу до практики у Студентському Тренажері */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-purple-950/40 border border-blue-500/30 flex items-center justify-between gap-4 mt-6">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Теорію опановано! Час закріпити навичку на практиці</span>
              </h4>
              <p className="text-xs text-slate-300">
                Перейдіть до Студентського Кабінету Smart-BKT-Chain для проходження адаптивних завдань та оцінки знань BKT.
              </p>
            </div>
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
            >
              <span>Почати тренування</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
