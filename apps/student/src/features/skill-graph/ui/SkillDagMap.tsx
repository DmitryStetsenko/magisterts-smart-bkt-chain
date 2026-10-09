import React from 'react';
import { CheckCircle2, Lock, Sparkles, ArrowDown } from 'lucide-react';
import { SkillGraphNode } from '../model/skill-graph.types';

interface SkillDagMapProps {
  nodes: SkillGraphNode[];
  activeSkillSlug?: string;
  onSelectSkill?: (slug: string) => void;
}

export function SkillDagMap({ nodes, activeSkillSlug, onSelectSkill }: SkillDagMapProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
      {/* Sub-header info bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 px-1">
        <span className="text-[11px] text-slate-400 font-semibold">
          Оцінювання майстерності BKT
        </span>
        <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Поріг: P(L) ≥ 0.95
        </span>
      </div>

      {/* Vertical Compact DAG Nodes Flow Container with Overlapping Arrow Badges */}
      <div className="flex flex-col items-stretch py-1 relative">
        {nodes.map((node, idx) => {
          const isMastered = node.pMastery >= 0.95;
          const isLocked = node.status === 'LOCKED';
          const isActive = node.slug === activeSkillSlug;

          return (
            <React.Fragment key={node.id}>
              {/* Vertical Compact Node Card */}
              <div
                onClick={() => !isLocked && onSelectSkill?.(node.slug)}
                className={`p-3 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 relative z-10 ${
                  isLocked
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                    : isActive
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/50 ring-1.5 ring-indigo-500/50 cursor-pointer'
                    : isMastered
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-950/40 cursor-pointer hover:border-emerald-400'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 cursor-pointer'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                    Модуль {idx + 1}
                  </span>
                  {isMastered ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Засвоєно
                    </span>
                  ) : isLocked ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700">
                      <Lock className="w-2.5 h-2.5" />
                      Заблоковано
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      В процесі
                    </span>
                  )}
                </div>

                {/* Node Title & P(L) Percentage */}
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-100 truncate">{node.title}</h4>
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

                {/* P(L) Progress Bar */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isMastered
                        ? 'bg-emerald-400'
                        : isLocked
                        ? 'bg-slate-700'
                        : 'bg-gradient-to-r from-amber-500 to-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, node.pMastery * 100)}%` }}
                  />
                </div>
              </div>

              {/* Overlapping Arrow Badge Connector between nodes */}
              {idx < nodes.length - 1 && (
                <div className="relative z-20 -my-2.5 flex items-center justify-center pointer-events-none">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 shadow-md flex items-center justify-center text-slate-400">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
