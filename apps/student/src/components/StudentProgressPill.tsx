'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Trophy, Target, Sparkles, ChevronDown, CheckCircle2, ArrowRight, Award, Zap } from 'lucide-react';

export interface StudentProgressPillProps {
  courseTitle: string;
  courseCompletionPct: number;
  masteredSkillsCount: number;
  totalSkillsCount: number;
  activeSkillTitle?: string;
  activeSkillMasteryPct?: number;
  onOpenSkillTree?: () => void;
  onOpenSkillDag?: () => void;
}

export const StudentProgressPill: React.FC<StudentProgressPillProps> = ({
  courseTitle,
  courseCompletionPct,
  masteredSkillsCount,
  totalSkillsCount,
  activeSkillTitle,
  activeSkillMasteryPct = 0,
  onOpenSkillTree,
  onOpenSkillDag,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Закриття поповера при кліку поза ним або натисканні Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isMastered = activeSkillMasteryPct >= 85;

  return (
    <div className="relative" ref={popoverRef}>
      {/* 💊 Компактна інтерактивна пігулка в хедері */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none text-xs font-semibold shadow-inner ${isOpen
            ? 'bg-slate-900 border-indigo-500/80 text-white ring-2 ring-indigo-500/20'
            : 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-200'
          }`}
        title="Натисніть для перегляду аналітики прогресу та стану BKT"
        aria-expanded={isOpen}
      >
        {/* Курсовий показник */}
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono font-bold text-amber-400">{courseCompletionPct}%</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-800" />

        {/* Показник BKT поточної навички */}
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] text-slate-400 font-normal">BKT:</span>
          <span className={`font-mono font-bold ${isMastered ? 'text-emerald-400' : 'text-indigo-400'}`}>
            {activeSkillMasteryPct}%
          </span>
        </div>

        <ChevronDown
          className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : ''
            }`}
        />
      </button>

      {/* 🪟 Випадаючий поповер із розширеною аналітикою */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Заголовок поповера */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">Академічний Прогрес</h4>
                <p className="text-[10px] text-slate-400 truncate max-w-[190px]">{courseTitle}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300">
              {masteredSkillsCount}/{totalSkillsCount} модулів
            </span>
          </div>

          {/* Секція 1: Прогрес курсу */}
          <div className="mt-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Опанування курсу
              </span>
              <span className="font-mono font-bold text-amber-400">{courseCompletionPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${courseCompletionPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-mono">
              <span>Старт</span>
              <span>Сертифікація (100%)</span>
            </div>
          </div>

          {/* Секція 2: Поточний стан BKT активної навички */}
          <div className="mt-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold truncate max-w-[170px]" title={activeSkillTitle}>
                {activeSkillTitle || 'Поточна навичка'}
              </span>
              <span
                className={`font-mono font-bold text-xs ${isMastered ? 'text-emerald-400' : 'text-indigo-400'
                  }`}
              >
                P(L) = {activeSkillMasteryPct}%
              </span>
            </div>

            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isMastered
                    ? 'bg-emerald-400'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  }`}
                style={{ width: `${Math.min(100, activeSkillMasteryPct)}%` }}
              />
            </div>

            <div className="flex items-center gap-1.5 mt-2.5 text-[11px]">
              {isMastered ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300/90 text-[11px] font-medium">
                    Навичку засвоєно (вище порогу 85%)
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-slate-400 text-[11px]">
                    Ціль BKT: досягти <strong className="text-slate-200">85%</strong> для розблокування
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Швидкі переходи до дерева або графу навичок */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
            {onOpenSkillTree && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSkillTree();
                }}
                className="flex-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                Дерево вмінь
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
            )}
            {onOpenSkillDag && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSkillDag();
                }}
                className="flex-1 text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                Граф DAG
                <ArrowRight className="w-3 h-3 text-indigo-400" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

