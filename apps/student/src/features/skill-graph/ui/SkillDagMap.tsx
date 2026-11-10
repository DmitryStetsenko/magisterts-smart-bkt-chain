import React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { SkillGraphNode } from '../model/skill-graph.types';

interface SkillDagMapProps {
  nodes: SkillGraphNode[];
  activeSkillSlug?: string;
  onSelectSkill?: (slug: string) => void;
}

/**
 * 📐 SkillDagMap (Rule 7 Minimalist Borderless Standard)
 * Clean, borderless vertical competence sequence without nested container boxes ("матрьошки"),
 * heavy cards, or bulky floating arrow badges.
 */
export function SkillDagMap({ nodes, activeSkillSlug, onSelectSkill }: SkillDagMapProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Sub-header Info Bar (Borderless clean typography) */}
      <div className="flex items-center justify-between pb-1 text-[11px] select-none text-slate-400">
        <span className="font-medium text-slate-400">
          Оцінювання майстерності BKT
        </span>
        <span className="font-mono text-[10px] text-emerald-400 font-semibold">
          Поріг: P(L) ≥ 0.95
        </span>
      </div>

      {/* 2. Vertical Competence Sequence (Clean borderless list with subtle dividers) */}
      <div className="flex flex-col divide-y divide-slate-800/50 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 custom-scrollbar">
        {nodes.map((node, idx) => {
          const isMastered = node.pMastery >= 0.95;
          const isLocked = node.status === 'LOCKED';
          const isActive = node.slug === activeSkillSlug;

          return (
            <div
              key={node.id}
              onClick={() => !isLocked && onSelectSkill?.(node.slug)}
              className={`group py-2.5 px-2 rounded-lg transition-colors flex flex-col gap-1.5 select-none ${
                isLocked
                  ? 'opacity-40 cursor-not-allowed'
                  : isActive
                  ? 'bg-slate-800/60 ring-1 ring-indigo-500/30 cursor-pointer'
                  : 'hover:bg-slate-800/40 cursor-pointer'
              }`}
            >
              {/* Header: Module Label & Status Badge */}
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={`uppercase tracking-wider ${isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}>
                  Модуль {idx + 1}
                </span>

                {isMastered ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    Засвоєно
                  </span>
                ) : isLocked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500">
                    <Lock className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                    Заблоковано
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    В процесі
                  </span>
                )}
              </div>

              {/* Title & P(L) Percentage */}
              <div className="flex items-center justify-between gap-2">
                <h4 className={`text-xs truncate ${isActive ? 'text-white font-semibold' : 'text-slate-200 group-hover:text-white font-medium'}`}>
                  {node.title}
                </h4>
                <span
                  className={`text-[11px] font-mono font-bold shrink-0 ${
                    isMastered
                      ? 'text-emerald-400'
                      : isLocked
                      ? 'text-slate-500'
                      : 'text-amber-400'
                  }`}
                >
                  {(node.pMastery * 100).toFixed(1)}%
                </span>
              </div>

              {/* Minimalist Slim Progress Bar */}
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isMastered
                      ? 'bg-emerald-400'
                      : isLocked
                      ? 'bg-slate-700'
                      : 'bg-gradient-to-r from-amber-400 to-indigo-400'
                  }`}
                  style={{ width: `${Math.min(100, node.pMastery * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
