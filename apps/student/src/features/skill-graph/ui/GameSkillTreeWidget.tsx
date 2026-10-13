'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Swords, 
  Trophy, 
  Target, 
  ChevronRight,
  Flame,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SkillGraphNode } from '../model/skill-graph.types';

interface GameSkillTreeWidgetProps {
  nodes: SkillGraphNode[];
  activeSkillSlug?: string;
  courseTitle?: string;
  selectedSkillSlug?: string;
  showInspector?: boolean;
  onSelectSkill?: (slug: string) => void;
  onInspectSkill?: (node: SkillGraphNode) => void;
  onClose?: () => void;
}

export function GameSkillTreeWidget({
  nodes,
  activeSkillSlug,
  courseTitle = 'Навчальний Курс',
  selectedSkillSlug,
  showInspector = true,
  onSelectSkill,
  onInspectSkill,
  onClose,
}: GameSkillTreeWidgetProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Compute stats
  const totalSkills = nodes.length;
  const masteredSkills = nodes.filter((n) => n.pMastery >= 0.95).length;
  const inProgressSkills = nodes.filter((n) => n.status === 'IN_PROGRESS' && n.pMastery < 0.95).length;
  const completionPercentage = totalSkills > 0 ? Math.round((masteredSkills / totalSkills) * 100) : 0;
  
  // Player Level RPG calculation
  const playerLevel = Math.max(1, Math.floor(masteredSkills * 2.5) + 1);
  const totalExp = Math.round(nodes.reduce((acc, n) => acc + n.pMastery * 1000, 0));

  const selectedNode = 
    (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null) || 
    (selectedSkillSlug ? nodes.find((n) => n.slug === selectedSkillSlug) : null) || 
    nodes.find((n) => n.slug === activeSkillSlug) || 
    nodes[0];

  // Visual layout helpers
  // Position nodes vertically in a branching RPG tree layout
  const getNodePosition = (idx: number, total: number) => {
    // Generate an organic zigzag / constellation branching layout
    const yOffset = 90 + idx * 160;
    // Zig-zag offset for branching feel: 0 -> center, 1 -> left, 2 -> right, 3 -> center, etc.
    const xOffsets = [300, 180, 420, 220, 380, 300];
    const xOffset = xOffsets[idx % xOffsets.length];
    return { x: xOffset, y: yOffset };
  };

  const nodePositions = nodes.map((_, idx) => getNodePosition(idx, nodes.length));
  const svgHeight = Math.max(650, (nodes.length + 1) * 170);

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 rounded-2xl overflow-hidden border border-indigo-500/30 shadow-2xl relative select-none">
      {/* 🌌 Background RPG Cyber Grid & Particle Glows */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.25) 0%, transparent 60%),
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      />

      {/* 🏆 RPG Top Status Bar (Player Level, EXP, Mastery % and Controls) */}
      <div className="h-16 bg-slate-900/90 border-b border-indigo-500/20 px-5 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Level Crest Badge */}
          <div className="relative group flex items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/40 shadow-lg shadow-indigo-500/20 flex items-center gap-1.5">
              <span className="text-[10px] font-black font-mono text-indigo-400 uppercase tracking-wider">LVL</span>
              <span className="text-base font-black font-mono text-white leading-none">{playerLevel}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {courseTitle}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  EXP {totalExp}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Прокачано <strong className="text-emerald-400">{masteredSkills}</strong> з {totalSkills} навичок
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="hidden sm:flex items-center gap-3 min-w-[220px]">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Прогрес Дерева Знань</span>
              <span className="text-indigo-400 font-bold">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer ml-2"
              title="Закрити дерево знань"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 🧭 Main Interactive Area: Canvas Skill Tree & Details Sidecard */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left: Scrollable Visual Tree Canvas */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative p-4 flex justify-center">
          <div className="relative w-[600px]" style={{ height: `${svgHeight}px` }}>
            {/* SVG Interactive Connection Lines (Power Rays) */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              style={{ zIndex: 1 }}
            >
              <defs>
                {/* Mastered Glowing Gradient */}
                <linearGradient id="masteredBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
                </linearGradient>
                {/* Active Beam Gradient */}
                <linearGradient id="activeBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                </linearGradient>
                {/* Locked Beam */}
                <linearGradient id="lockedBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#334155" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Render Connecting Lines between Sequential / Dependent Nodes */}
              {nodes.map((node, idx) => {
                if (idx === 0) return null;
                const startPos = nodePositions[idx - 1];
                const endPos = nodePositions[idx];
                const prevNode = nodes[idx - 1];
                const isMasteredConnection = prevNode.pMastery >= 0.95;
                const isActiveConnection = prevNode.pMastery >= 0.95 && node.status !== 'LOCKED';

                // Curving Bezier Path for Natural RPG Tree Branching
                const deltaY = endPos.y - startPos.y;
                const cp1x = startPos.x;
                const cp1y = startPos.y + deltaY * 0.5;
                const cp2x = endPos.x;
                const cp2y = startPos.y + deltaY * 0.5;
                const d = `M ${startPos.x} ${startPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPos.x} ${endPos.y}`;

                return (
                  <g key={`edge-${node.id}`}>
                    {/* Shadow / Outer Glow */}
                    <path
                      d={d}
                      fill="none"
                      stroke={isMasteredConnection ? '#059669' : isActiveConnection ? '#4f46e5' : '#1e293b'}
                      strokeWidth={isMasteredConnection || isActiveConnection ? '6' : '3'}
                      strokeOpacity={isMasteredConnection || isActiveConnection ? '0.4' : '0.3'}
                    />
                    {/* Inner Core Ray */}
                    <path
                      d={d}
                      fill="none"
                      stroke={
                        isMasteredConnection 
                          ? 'url(#masteredBeam)' 
                          : isActiveConnection 
                          ? 'url(#activeBeam)' 
                          : 'url(#lockedBeam)'
                      }
                      strokeWidth={isMasteredConnection || isActiveConnection ? '3' : '2'}
                      strokeDasharray={isMasteredConnection ? 'none' : isActiveConnection ? '6,6' : '3,3'}
                      className={isActiveConnection && !isMasteredConnection ? 'animate-pulse' : ''}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive Game Skill Nodes (Runes / Crystals) */}
            {nodes.map((node, idx) => {
              const pos = nodePositions[idx];
              const isMastered = node.pMastery >= 0.95;
              const isLocked = node.status === 'LOCKED';
              const isCurrentActive = node.slug === activeSkillSlug;
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    if (onInspectSkill) {
                      onInspectSkill(node);
                    }
                  }}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                  }}
                  className={`absolute group cursor-pointer transition-all duration-300 flex flex-col items-center ${
                    isLocked ? 'opacity-70 hover:opacity-100 hover:scale-105' : 'hover:scale-110'
                  }`}
                >
                  {/* Hexagon / Circular Crystal Node */}
                  <div className="relative">
                    {/* Outer Glowing Energy Halo for Mastered / Active */}
                    {isMastered && (
                      <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur-md animate-pulse" />
                    )}
                    {isCurrentActive && !isMastered && (
                      <div className="absolute -inset-2.5 bg-indigo-500/30 rounded-full blur-lg animate-pulse" />
                    )}

                    {/* Circular Rune Body */}
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 relative border-2 ${
                        isSelected
                          ? 'ring-4 ring-purple-500/60 scale-105'
                          : ''
                      } ${
                        isMastered
                          ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 border-emerald-400 shadow-lg shadow-emerald-500/30 text-emerald-300'
                          : isLocked
                          ? 'bg-slate-950 border-slate-800 text-slate-600 shadow-inner'
                          : isCurrentActive
                          ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-indigo-500 shadow-xl shadow-indigo-500/40 text-indigo-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {/* Inner Node Icon */}
                      {isMastered ? (
                        <CheckCircle2 className={`w-7 h-7 text-emerald-400 ${(isSelected || isCurrentActive) ? 'animate-bounce' : ''}`} />
                      ) : isLocked ? (
                        <Lock className="w-6 h-6 text-slate-500" />
                      ) : isCurrentActive ? (
                        <Swords className={`w-7 h-7 text-indigo-400 ${isSelected ? 'animate-bounce' : ''}`} />
                      ) : (
                        <Zap className={`w-6 h-6 text-amber-400 ${isSelected ? 'animate-bounce' : ''}`} />
                      )}

                      {/* Mastery percentage mini badge in corner */}
                      <div 
                        className={`absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border shadow-md ${
                          isMastered
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                            : isLocked
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-indigo-600 text-white border-indigo-400'
                        }`}
                      >
                        {(node.pMastery * 100).toFixed(0)}%
                      </div>

                      {/* Tier / Order number badge in top-left */}
                      <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-950 border border-slate-700 text-[9px] font-mono font-bold text-slate-400 flex items-center justify-center">
                        {idx + 1}
                      </div>
                    </div>
                  </div>

                  {/* Node Label Below */}
                  <div className="mt-2 text-center max-w-[130px]">
                    <span 
                      className={`text-[11px] font-bold block truncate transition-colors ${
                        isMastered
                          ? 'text-emerald-300'
                          : isLocked
                          ? 'text-slate-500'
                          : isCurrentActive
                          ? 'text-indigo-300 font-extrabold'
                          : 'text-slate-300'
                      }`}
                    >
                      {node.title}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">
                      {isMastered ? '★ Опановано' : isLocked ? 'Заблоковано' : 'У процесі'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: RPG Skill Inspector & Quest Card */}
        {showInspector && selectedNode && (
          <aside className="w-80 bg-slate-900/95 border-l border-indigo-500/20 p-5 flex flex-col justify-between shrink-0 shadow-2xl backdrop-blur-xl z-20">
            <div className="flex flex-col gap-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Модуль Графа BKT
                </span>
                <span 
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                    selectedNode.pMastery >= 0.95
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : selectedNode.status === 'LOCKED'
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  }`}
                >
                  {selectedNode.pMastery >= 0.95 ? 'Засвоєно' : selectedNode.status === 'LOCKED' ? 'Заблоковано' : 'Активно'}
                </span>
              </div>

              {/* Title & Lore/Description */}
              <div>
                <h3 className="text-base font-black text-white">{selectedNode.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {selectedNode.description || 'Опануйте ключові практичні компетенції для переходу на наступний рівень майстерності.'}
                </p>
              </div>

              {/* RPG BKT Mastery Metrics */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Рівень Майстерності $P(L)$:</span>
                  <span className="font-mono font-bold text-sm text-indigo-400">
                    {(selectedNode.pMastery * 100).toFixed(1)}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      selectedNode.pMastery >= 0.95
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                        : 'bg-gradient-to-r from-amber-500 to-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, selectedNode.pMastery * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Старт: 0%</span>
                  <span className="text-emerald-400">Поріг: ≥ 95.0%</span>
                </div>
              </div>

              {/* Quest Prerequisites */}
              <div className="flex flex-col gap-1.5 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  Вимоги до Розблокування:
                </span>
                <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  {selectedNode.parentSkillIds.length === 0
                    ? '🟢 Базовий вузол курсу. Доступний одразу.'
                    : selectedNode.status === 'LOCKED'
                    ? '🔒 Необхідно закрити попередні залежні модулі на рівень P(L) ≥ 0.95.'
                    : '✨ Усі пререквізити виконано! Вузол відкрито для проходження.'}
                </p>
              </div>
            </div>

            {/* Action Button: Start Quest / Solve Tasks */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
              <button
                disabled={selectedNode.status === 'LOCKED'}
                onClick={() => onSelectSkill && onSelectSkill(selectedNode.slug)}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  selectedNode.status === 'LOCKED'
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    : selectedNode.pMastery >= 0.95
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/40'
                }`}
              >
                <span>{selectedNode.pMastery >= 0.95 ? 'Тренувати знову' : 'Розпочати квест'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
