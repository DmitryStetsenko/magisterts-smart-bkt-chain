'use client';

import React from 'react';
import { CheckCircle2, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { SkillGraphNode } from '../model/skill-graph.types';

interface SkillDagMapProps {
  nodes: SkillGraphNode[];
  activeSkillSlug?: string;
  onSelectSkill?: (slug: string) => void;
}

export function SkillDagMap({ nodes, activeSkillSlug, onSelectSkill }: SkillDagMapProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Карта Навичок (Skill DAG Graph)</span>
        </h3>
        <span className="text-xs font-mono text-slate-400">
          Поріг засвоєння: P(L) ≥ 0.95
        </span>
      </div>

      {/* DAG Nodes Flow Container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-2">
        {nodes.map((node, idx) => {
          const isMastered = node.pMastery >= 0.95;
          const isLocked = node.status === 'LOCKED';
          const isActive = node.slug === activeSkillSlug;

          return (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div
                onClick={() => !isLocked && onSelectSkill?.(node.slug)}
                className={`flex-1 p-4 rounded-xl border transition-all duration-300 flex flex-col gap-2 relative ${
                  isLocked
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                    : isMastered
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-950/40 cursor-pointer hover:border-emerald-400'
                    : isActive
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/50 cursor-pointer'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 cursor-pointer'
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
                    Модуль {idx + 1}
                  </span>
                  {isMastered ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Засвоєно
                    </span>
                  ) : isLocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700">
                      <Lock className="w-3 h-3" />
                      Заблоковано
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      В процесі
                    </span>
                  )}
                </div>

                {/* Node Title */}
                <h4 className="text-sm font-bold text-slate-100 line-clamp-1">{node.title}</h4>

                {/* P(L) Progress Bar */}
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">P(L) Mastery:</span>
                    <span
                      className={`font-bold ${
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
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
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
              </div>

              {/* Arrow Connector between nodes */}
              {idx < nodes.length - 1 && (
                <div className="hidden sm:flex items-center justify-center text-slate-600">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
