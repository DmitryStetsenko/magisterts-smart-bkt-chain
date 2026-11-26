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
  ArrowRight,
  Keyboard,
  Copy,
  Activity,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  BarChart3,
  GitFork
} from 'lucide-react';
import { SkillGraphNode } from './skill-graph.types';
import { AnomalyTreeWidget, AnomalyItem } from '../analytics/AnomalyTreeWidget';

export interface GameSkillTreeWidgetProps {
  nodes: SkillGraphNode[];
  activeSkillSlug?: string;
  courseTitle?: string;
  studentName?: string;
  selectedSkillSlug?: string;
  showInspector?: boolean;
  role?: 'student' | 'teacher';
  adjustments?: AnomalyItem[];
  actionButtonLabel?: string;
  onSelectSkill?: (slug: string) => void;
  onInspectSkill?: (node: SkillGraphNode) => void;
  onClose?: () => void;
}

export function GameSkillTreeWidget({
  nodes,
  activeSkillSlug,
  courseTitle = 'Навчальний Курс',
  studentName,
  selectedSkillSlug,
  showInspector = true,
  role = 'student',
  adjustments = [],
  actionButtonLabel,
  onSelectSkill,
  onInspectSkill,
  onClose,
}: GameSkillTreeWidgetProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [treeDisplayMode, setTreeDisplayMode] = useState<'skills' | 'anomalies'>('skills');
  const [showTeacherMetrics, setShowTeacherMetrics] = useState<boolean>(false);

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

  // Visual layout helpers: either RPG pathway OR true topological Skill DAG
  const canvasWidth = 600;
  const hasRealDependencies = nodes.some((n) => (n.parentSkillIds?.length ?? 0) > 0);

  const dagLayout = (() => {
    const nodeById = new Map(nodes.map((n) => [n.id, n]));
    const layerMemo = new Map<string, number>();

    const getLayer = (id: string, visiting = new Set<string>()): number => {
      if (layerMemo.has(id)) return layerMemo.get(id)!;
      if (visiting.has(id)) return 0; // cycle guard
      visiting.add(id);
      const node = nodeById.get(id);
      const validParents = (node?.parentSkillIds || []).filter((pid) => nodeById.has(pid));
      const layer =
        validParents.length === 0
          ? 0
          : 1 + Math.max(...validParents.map((pid) => getLayer(pid, new Set(visiting))));
      layerMemo.set(id, layer);
      return layer;
    };

    const layersMap = new Map<number, SkillGraphNode[]>();
    nodes.forEach((node, idx) => {
      const layer = hasRealDependencies ? getLayer(node.id) : idx;
      const list = layersMap.get(layer) || [];
      list.push(node);
      layersMap.set(layer, list);
    });

    const positionsById = new Map<string, { x: number; y: number }>();
    const maxLayer = Math.max(0, ...Array.from(layersMap.keys()));
    const isTeacherMetricsVisible = role === 'teacher' && showTeacherMetrics;
    const layerStep = isTeacherMetricsVisible ? 245 : 175;

    layersMap.forEach((layerNodes, layerIdx) => {
      const count = layerNodes.length;
      const y = 85 + layerIdx * layerStep;
      layerNodes.forEach((n, posIdx) => {
        const x =
          count === 1
            ? canvasWidth / 2
            : 150 + (posIdx * (canvasWidth - 300)) / (count - 1);
        positionsById.set(n.id, { x, y });
      });
    });

    return {
      positions: nodes.map((n) => positionsById.get(n.id) || { x: canvasWidth / 2, y: 85 }),
      height: Math.max(550, (maxLayer + 1) * layerStep + 140),
    };
  })();

  const pathPositions = nodes.map((_, index) => {
    const y = 80 + index * 125;
    const pattern = [250, 150, 350, 200, 300, 180, 320];
    const x = pattern[index % pattern.length];
    return { x, y };
  });

  // Завжди використовуємо реальну топологію розгалужень (dagLayout), коли курс має пререквізити;
  // чекбокс «Граф DAG» додає інженерне оформлення (спрямовані стрілки пререквізитів та підписи шарів)
  const nodePositions = hasRealDependencies ? dagLayout.positions : pathPositions;
  const svgHeight = hasRealDependencies ? dagLayout.height : Math.max(550, nodes.length * 135 + 100);

  // Ребра завжди відповідають реальним залежностям parentSkillIds (без фіктивних лінійних зв'язків 3->4->5)
  const graphEdges: Array<{
    id: string;
    fromNode: SkillGraphNode;
    toNode: SkillGraphNode;
    fromPos: { x: number; y: number };
    toPos: { x: number; y: number };
    requiredMastery: number;
  }> = [];
  if (hasRealDependencies) {
    const indexById = new Map(nodes.map((n, i) => [n.id, i]));
    nodes.forEach((child, childIdx) => {
      (child.parentSkillIds || []).forEach((pid) => {
        const parentIdx = indexById.get(pid);
        if (parentIdx !== undefined) {
          graphEdges.push({
            id: `${pid}->${child.id}`,
            fromNode: nodes[parentIdx],
            toNode: child,
            fromPos: nodePositions[parentIdx],
            toPos: nodePositions[childIdx],
            requiredMastery: child.parentThresholds?.[pid] ?? 0.85,
          });
        }
      });
    });
  } else {
    nodes.forEach((node, idx) => {
      if (idx === 0) return;
      graphEdges.push({
        id: `seq-${nodes[idx - 1].id}->${node.id}`,
        fromNode: nodes[idx - 1],
        toNode: node,
        fromPos: nodePositions[idx - 1],
        toPos: nodePositions[idx],
        requiredMastery: 0.85,
      });
    });
  }

  // Derive real anomalies only (exclude normal baseline submissions with G <= 0.3, S <= 0.2 and empty adjustReasons)
  const rawAdjustments = adjustments.length > 0 
    ? adjustments 
    : nodes.flatMap((n) => (n.recentAdjustments || []).map((ra) => ({
        ...ra,
        skillSlug: n.slug,
        skillTitle: n.title,
      })));

  const activeAdjustments = rawAdjustments.filter((item) => {
    const hasReason = Array.isArray(item.adjustReasons) && item.adjustReasons.length > 0;
    const highGuess = typeof item.pGuessUsed === 'number' && item.pGuessUsed > 0.3;
    const highSlip = typeof item.pSlipUsed === 'number' && item.pSlipUsed > 0.2;
    return hasReason || highGuess || highSlip;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative select-none">
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
      <div className="h-14 bg-slate-950/80 border-b border-slate-800/80 px-5 flex items-center justify-between shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Level Crest Badge */}
          <div className="relative group flex items-center gap-2.5">
            <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 flex items-center gap-1.5">
              <span className="text-[10px] font-black font-mono text-indigo-400 uppercase tracking-wider">LVL</span>
              <span className="text-base font-black font-mono text-white leading-none">{playerLevel}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {studentName ? `${studentName} • ${courseTitle}` : courseTitle}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                  EXP {totalExp}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Прокачано <strong className="text-emerald-400">{masteredSkills}</strong> з {totalSkills} навичок
              </div>
            </div>
          </div>
        </div>

        {/* Mode Switcher: Knowledge Tree vs Anomaly Tree */}
        <div className="flex items-center gap-1 bg-slate-900/70 p-0.5 rounded-lg">
          <button
            onClick={() => setTreeDisplayMode('skills')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              treeDisplayMode === 'skills'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Дерево Знань</span>
          </button>

          <button
            onClick={() => setTreeDisplayMode('anomalies')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              treeDisplayMode === 'anomalies'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Дерево Аномалій</span>
            {activeAdjustments.length > 0 && (
              <span className={`text-[10px] font-mono font-bold ${
                treeDisplayMode === 'anomalies'
                  ? 'text-white/90'
                  : 'text-amber-400'
              }`}>
                ({activeAdjustments.length})
              </span>
            )}
          </button>

          {treeDisplayMode === 'skills' && role === 'teacher' && (
            <label
              className="ml-2 pl-2 border-l border-slate-700/70 flex items-center gap-1.5 px-2 py-1 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
              title="Показати пороги допуску (≥ 0.85) та телеметрію (WPM, копіпаст) прямо на вузлах і ребрах графа"
            >
              <input
                type="checkbox"
                checked={showTeacherMetrics}
                onChange={(e) => setShowTeacherMetrics(e.target.checked)}
                className="accent-indigo-500 rounded cursor-pointer"
              />
              <GitFork className="w-3.5 h-3.5 text-indigo-400" />
              <span>Метрики графа</span>
            </label>
          )}
        </div>

        {/* Global Progress Bar */}
        <div className="hidden sm:flex items-center gap-3 min-w-[220px]">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Прогрес Дерева Знань</span>
              <span className="text-indigo-400 font-bold">{completionPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
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

      {/* 🧭 Main Interactive Area: Either Anomaly Tree Radar OR RPG Canvas Skill Tree */}
      {treeDisplayMode === 'anomalies' ? (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-950/70 z-10">
          <AnomalyTreeWidget
            adjustments={activeAdjustments}
            nodes={nodes}
            role={role}
            title={studentName ? `Аномалії студента: ${studentName}` : `Аномалії курсу: ${courseTitle}`}
            subtitle="Повний зріз поведінкових інцидентів, швидких вгадувань та описок за всіма модулями даного курсу"
          />
        </div>
      ) : (
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
                {/* Directed DAG Arrowheads */}
                <marker id="dagArrowMastered" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M 0 1 L 7 4 L 0 7 z" fill="#10b981" />
                </marker>
                <marker id="dagArrowActive" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M 0 1 L 7 4 L 0 7 z" fill="#6366f1" />
                </marker>
                <marker id="dagArrowLocked" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M 0 1 L 7 4 L 0 7 z" fill="#64748b" />
                </marker>
              </defs>

              {/* Render Connecting Lines between Sequential / Dependent Nodes */}
              {graphEdges.map(({ id, fromNode, toNode, fromPos, toPos, requiredMastery }) => {
                const isMasteredConnection = fromNode.pMastery >= requiredMastery;
                const isActiveConnection = fromNode.pMastery >= requiredMastery && toNode.status !== 'LOCKED';

                const yOffset = hasRealDependencies ? 36 : 0;
                const sy = fromPos.y + yOffset;
                const ey = toPos.y - yOffset;
                const deltaY = ey - sy;
                const cp1x = fromPos.x;
                const cp1y = sy + deltaY * 0.5;
                const cp2x = toPos.x;
                const cp2y = sy + deltaY * 0.5;
                const d = `M ${fromPos.x} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPos.x} ${ey}`;
                const markerEnd = hasRealDependencies
                  ? isMasteredConnection
                    ? 'url(#dagArrowMastered)'
                    : isActiveConnection
                    ? 'url(#dagArrowActive)'
                    : 'url(#dagArrowLocked)'
                  : undefined;

                const isVerticalEdge = Math.abs(fromPos.x - toPos.x) < 20;
                const midX = (fromPos.x + toPos.x) / 2;
                const midY = isVerticalEdge ? sy + deltaY * 0.72 : (sy + ey) / 2;

                return (
                  <g key={`edge-${id}`}>
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
                          : hasRealDependencies
                          ? '#64748b'
                          : 'url(#lockedBeam)'
                      }
                      strokeWidth={isMasteredConnection || isActiveConnection ? '3' : hasRealDependencies ? '2' : '1.5'}
                      strokeDasharray={isMasteredConnection ? 'none' : isActiveConnection ? '6 4' : '4 4'}
                      markerEnd={markerEnd}
                      className={isActiveConnection ? 'animate-pulse' : ''}
                    />
                    {/* Пороговий підпис на ребрі для викладача */}
                    {role === 'teacher' && showTeacherMetrics && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x="-22"
                          y="-9"
                          width="44"
                          height="18"
                          rx="6"
                          fill={isMasteredConnection ? '#059669' : '#334155'}
                          fillOpacity="0.9"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="700"
                          fill="#ffffff"
                        >
                          ≥{requiredMastery.toFixed(2)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Nodes Render Loop */}
            {nodes.map((node, idx) => {
              const pos = nodePositions[idx];
              const isSelected = selectedNode?.id === node.id || selectedNode?.slug === node.slug;
              const isCurrentActive = node.slug === activeSkillSlug;
              const isMastered = node.pMastery >= 0.90;
              const isLocked = node.status === 'LOCKED';



              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    if (onInspectSkill) onInspectSkill(node);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isSelected ? 30 : 10,
                  }}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  {/* Hexagon / Circular Crystal Node */}
                  <div className="relative">
                    {/* Outer Glowing Energy Halo for Mastered / Active */}
                    {isMastered && (
                      <div className="absolute -inset-1 bg-emerald-500/20 rounded-2xl blur-sm animate-pulse pointer-events-none" />
                    )}
                    {isCurrentActive && !isMastered && (
                      <div className="absolute -inset-1 bg-indigo-500/25 rounded-2xl blur-sm animate-pulse pointer-events-none" />
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

                      {/* Anomaly Indicator Badge on Rune (Guessing or Copypaste) */}
                      {(node.hasGuessAnomaly || node.hasCopyPasteAnomaly) && (
                        <div 
                          title={node.hasGuessAnomaly ? 'Аномалія вгадування' : 'Аномалія копіпасту'}
                          className={`absolute -top-2.5 -right-2.5 px-1 py-0.5 rounded-full border shadow-lg flex items-center gap-0.5 text-[8px] font-bold animate-pulse z-20 ${
                            node.hasGuessAnomaly 
                              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/50' 
                              : 'bg-red-500 text-white border-red-300 shadow-red-500/50'
                          }`}
                        >
                          {node.hasGuessAnomaly ? (
                            <Zap className="w-2.5 h-2.5 fill-slate-950" />
                          ) : (
                            <AlertTriangle className="w-2.5 h-2.5" />
                          )}
                          <span>!</span>
                        </div>
                      )}
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
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">
                      {isMastered ? '★ Опановано' : isLocked ? 'Заблоковано' : 'У процесі'}
                    </span>
                    {role === 'teacher' && showTeacherMetrics && (
                      <div className="mt-1 flex flex-wrap items-center justify-center gap-1 text-[9px] font-mono">
                        <span className="px-1 py-0.2 rounded bg-slate-800/80 text-indigo-300">
                          P(L)={node.pMastery.toFixed(2)}
                        </span>
                        {node.telemetry && (
                          <span className="px-1 py-0.2 rounded bg-slate-800/80 text-slate-300">
                            {Math.round(node.telemetry.wpm)} WPM
                          </span>
                        )}
                        {node.telemetry && node.telemetry.copyPasteRatio > 0 && (
                          <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                            Paste {Math.round(node.telemetry.copyPasteRatio * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: RPG Skill Inspector & Node Card */}
        {showInspector && selectedNode && (
          <aside className="w-88 bg-slate-950/90 border-l border-slate-800/80 p-5 flex flex-col justify-between shrink-0 z-20 overflow-y-auto">
            <div className="flex flex-col gap-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Модуль Графа BKT
                </span>
                <span 
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md ${
                    selectedNode.pMastery >= 0.95
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : selectedNode.status === 'LOCKED'
                      ? 'bg-slate-800/60 text-slate-400'
                      : 'bg-indigo-500/10 text-indigo-300'
                  }`}
                >
                  {selectedNode.pMastery >= 0.95 ? 'Засвоєно' : selectedNode.status === 'LOCKED' ? 'Заблоковано' : 'Активно'}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-black text-white">{selectedNode.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {selectedNode.description || 'Опануйте ключові практичні компетенції для переходу на наступний рівень майстерності.'}
                </p>
              </div>

              {/* RPG BKT Mastery Metrics */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Майстерність P(L):</span>
                  </span>
                  <span className="font-mono font-bold text-sm text-indigo-400">
                    {(selectedNode.pMastery * 100).toFixed(1)}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      selectedNode.pMastery >= 0.90
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-amber-500 to-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, selectedNode.pMastery * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Старт: 0%</span>
                  <span className="text-emerald-400">
                    Поріг допуску: ≥ {Math.round((Object.values(selectedNode.parentThresholds || {}).length > 0 ? Math.max(...Object.values(selectedNode.parentThresholds || {})) : 0.85) * 100)}% (P(L) ≥ {(Object.values(selectedNode.parentThresholds || {}).length > 0 ? Math.max(...Object.values(selectedNode.parentThresholds || {})) : 0.85).toFixed(2)})
                  </span>
                </div>
              </div>

              {/* 📊 Модульна Телеметрія Студента (Тільки для Викладача або якщо доступна) */}
              {role === 'teacher' && (
                <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Телеметрія Модуля</span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      Live Session
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    {/* WPM */}
                    <div className="bg-slate-900/50 p-2 rounded-lg flex flex-col items-center">
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold mb-0.5">
                        <Keyboard className="w-3 h-3 text-blue-400" />
                        <span>WPM</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {selectedNode.telemetry?.wpm ?? 0}
                      </span>
                    </div>

                    {/* Copy-Paste Ratio */}
                    <div className={`p-2 rounded-lg flex flex-col items-center ${
                      (selectedNode.telemetry?.copyPasteRatio ?? 0) >= 0.60
                        ? 'bg-red-950/30'
                        : 'bg-slate-900/50'
                    }`}>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold mb-0.5">
                        <Copy className="w-3 h-3 text-amber-400" />
                        <span>Копіпаст</span>
                      </div>
                      <span className={`text-xs font-mono font-bold ${
                        (selectedNode.telemetry?.copyPasteRatio ?? 0) >= 0.60
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`}>
                        {selectedNode.telemetry ? `${(selectedNode.telemetry.copyPasteRatio * 100).toFixed(0)}%` : '0%'}
                      </span>
                    </div>

                    {/* Fatigue Index */}
                    <div className="bg-slate-900/50 p-2 rounded-lg flex flex-col items-center">
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold mb-0.5">
                        <Activity className="w-3 h-3 text-purple-400" />
                        <span>Втома</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-purple-400">
                        {selectedNode.telemetry?.fatigueIndex ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Anomaly banner if copy-paste ratio >= 60% */}
                  {(selectedNode.hasCopyPasteAnomaly || (selectedNode.telemetry?.copyPasteRatio ?? 0) >= 0.60) && (
                    <div className="p-2.5 rounded-lg bg-red-950/30 flex items-start gap-2 text-[11px] text-red-200">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-red-300 block font-semibold">Аномалія Копіпасту (&ge; 60%):</strong>
                        Зафіксовано високу частку прямої вставки коду/тексту. Можливе списування або використання зовнішніх генераторів.
                      </div>
                    </div>
                  )}

                  {/* Anomaly banner if Guessing was detected (P(Guess) > 0.3) */}
                  {selectedNode.hasGuessAnomaly && (
                    <div className="p-2.5 rounded-lg bg-amber-950/30 flex items-start gap-2 text-[11px] text-amber-200 animate-pulse">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 block font-semibold">Аномалія Вгадування (P(Guess) &gt; 0.3):</strong>
                        Телеметрія зафіксувала аномально швидку відповідь на тест. Застосовано коригувальний штраф BKT для запобігання штучному завищенню майстерності.
                      </div>
                    </div>
                  )}

                  {/* Recent Skill-Specific Behavioral Adjustments Log */}
                  {selectedNode.recentAdjustments && selectedNode.recentAdjustments.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Останні телеметричні коригування:</span>
                      </span>
                      <div className="flex flex-col divide-y divide-slate-800/50">
                        {selectedNode.recentAdjustments.map((adj, aIdx) => (
                          <div
                            key={aIdx}
                            onClick={() => {
                              if (adj.taskId && onSelectSkill) {
                                onSelectSkill(selectedNode.slug);
                              }
                            }}
                            className={`py-2 px-1 text-[10px] font-mono flex items-center justify-between gap-2 transition-colors ${
                              adj.taskId ? 'cursor-pointer hover:bg-slate-800/40' : ''
                            } ${
                              adj.pGuessUsed && adj.pGuessUsed > 0.3
                                ? 'text-amber-300'
                                : adj.pSlipUsed && adj.pSlipUsed > 0.2
                                ? 'text-indigo-300'
                                : 'text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${adj.isCorrect ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                              <span className="truncate">{adj.taskTitle || new Date(adj.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {adj.pGuessUsed !== undefined && adj.pGuessUsed !== null && (
                                <span className="font-bold">G={adj.pGuessUsed}</span>
                              )}
                              {adj.pSlipUsed !== undefined && adj.pSlipUsed !== null && (
                                <span className="font-bold">S={adj.pSlipUsed}</span>
                              )}
                              {adj.taskId && (
                                <ExternalLink className="w-2.5 h-2.5 text-slate-500 hover:text-amber-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Prerequisites & Requirements */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    Вимоги до Розблокування:
                  </span>
                  {selectedNode.tasksCount !== undefined && (
                    <span className="text-[10px] font-mono text-slate-400">
                      Завдань: <strong className="text-white">{selectedNode.tasksCount}</strong>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed flex items-center gap-1.5">
                  {selectedNode.parentSkillIds.length === 0 ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Базовий вузол курсу. Доступний одразу.</span>
                    </>
                  ) : selectedNode.status === 'LOCKED' ? (
                    <>
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>
                        Необхідно закрити попередні залежні модулі на рівень P(L) ≥ {(Object.values(selectedNode.parentThresholds || {}).length > 0 ? Math.max(...Object.values(selectedNode.parentThresholds || {})) : 0.85).toFixed(2)}.
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Усі пререквізити виконано! Вузол відкрито.</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Action / Navigation Buttons depending on Role */}
            {onSelectSkill && (
              <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2 mt-4">
                {role === 'teacher' ? (
                  <button
                    onClick={() => onSelectSkill(selectedNode.slug)}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30"
                    title="Перейти до детального опису та списку завдань модуля"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{actionButtonLabel || 'Детальний опис та завдання модуля'}</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </button>
                ) : (
                  <button
                    disabled={selectedNode.status === 'LOCKED'}
                    onClick={() => onSelectSkill(selectedNode.slug)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                      selectedNode.status === 'LOCKED'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                        : selectedNode.pMastery >= 0.90
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/40'
                    }`}
                  >
                    <span>{actionButtonLabel || (selectedNode.pMastery >= 0.90 ? 'Тренувати знову' : 'Розпочати квест')}</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </button>
                )}
              </div>
            )}
          </aside>
        )}
      </div>
      )}
    </div>
  );
}
