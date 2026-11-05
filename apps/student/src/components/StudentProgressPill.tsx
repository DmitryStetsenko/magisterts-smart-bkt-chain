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
      {/* 💊 Компактна безрамкова інтерактивна пігулка в хедері */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer select-none text-xs font-medium ${isOpen
            ? 'bg-slate-800 text-white'
            : 'bg-slate-800/50 hover:bg-slate-800/80 text-slate-200'
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
        <div className="absolute right-0 top-full mt-1.5 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-3.5 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-800/60">
          {/* Заголовок поповера */}
          <div className="flex items-center justify-between pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">Академічний Прогрес</h4>
                <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{courseTitle}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              ({masteredSkillsCount}/{totalSkillsCount})
            </span>
          </div>

          {/* Секція 1: Прогрес курсу */}
          <div className="py-2.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Опанування курсу
              </span>
              <span className="font-mono font-bold text-amber-400">{courseCompletionPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${courseCompletionPct}%` }}
              />
            </div>
          </div>

          {/* Секція 2: Поточний стан BKT активної навички */}
          <div className="py-2.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium truncate max-w-[180px]" title={activeSkillTitle}>
                {activeSkillTitle || 'Поточна навичка'}
              </span>
              <span
                className={`font-mono font-bold text-xs ${isMastered ? 'text-emerald-400' : 'text-indigo-400'
                  }`}
              >
                P(L) = {activeSkillMasteryPct}%
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isMastered
                    ? 'bg-emerald-400'
                    : 'bg-indigo-500'
                  }`}
                style={{ width: `${Math.min(100, activeSkillMasteryPct)}%` }}
              />
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              {isMastered ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300/90 text-[11px]">
                    Навичку засвоєно (≥ 85%)
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-slate-400 text-[11px]">
                    Ціль BKT: <strong className="text-slate-200">85%</strong> для розблокування
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Швидкі переходи до дерева або графу навичок */}
          <div className="pt-2.5 flex items-center justify-between gap-2">
            {onOpenSkillTree && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSkillTree();
                }}
                className="flex-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
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
                className="flex-1 text-[11px] font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
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

