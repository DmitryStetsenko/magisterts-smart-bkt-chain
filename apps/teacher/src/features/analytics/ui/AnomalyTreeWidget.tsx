'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown,
  Clock, 
  Sparkles, 
  X, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Code2,
  BookOpen,
  Folder,
  FolderOpen,
  FolderTree,
  ShieldAlert,
  Search,
  Check,
  Network,
  Swords,
  Lock,
  GitBranch,
  Layers,
  Activity,
  Flame
} from 'lucide-react';
import { SkillGraphNode } from '../../skill-graph/model/skill-graph.types';

export interface AnomalyItem {
  id?: string;
  skillSlug: string;
  skillTitle: string;
  taskId?: string;
  taskTitle?: string;
  taskType?: string;
  taskDescription?: string;
  taskOptions?: any;
  pSlipUsed?: number | null;
  pGuessUsed?: number | null;
  adjustReasons: string[];
  isCorrect: boolean;
  createdAt: string;
}

export type AnomalyViewMode = 'module_tree' | 'tree' | 'graph' | 'rpg';

interface AnomalyTreeWidgetProps {
  adjustments: AnomalyItem[];
  nodes?: SkillGraphNode[];
  title?: string;
  subtitle?: string;
  onNavigateToTask?: (taskId: string, skillSlug?: string) => void;
  defaultMode?: AnomalyViewMode;
}

export function AnomalyTreeWidget({
  adjustments,
  nodes = [],
  title = 'Дерево Аномалій та Когнітивних Відхилень',
  subtitle = 'Багатовимірний радар: Дерево Модулів Аномалій | Дерево за Категоріями | Топологічний Граф DAG | RPG Матриця',
  onNavigateToTask,
  defaultMode = 'module_tree',
}: AnomalyTreeWidgetProps) {
  const [viewMode, setViewMode] = useState<AnomalyViewMode>(defaultMode);
  const [selectedItem, setSelectedItem] = useState<AnomalyItem | null>(null);
  const [selectedNodeSlug, setSelectedNodeSlug] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Track open/collapsed tree nodes in 'tree' and 'module_tree' mode
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'category-guess': true,
    'category-slip': true,
  });

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeKey]: !(prev[nodeKey] ?? true),
    }));
  };

  // Group items by Anomaly Category -> Skill Slug -> Items
  const guessItems = adjustments.filter((a) => Boolean(a.pGuessUsed && a.pGuessUsed > 0.3));
  const slipItems = adjustments.filter((a) => Boolean(a.pSlipUsed && a.pSlipUsed > 0.2));

  const groupBySkill = (items: AnomalyItem[]) => {
    const groups: Record<string, { skillTitle: string; skillSlug: string; items: AnomalyItem[] }> = {};
    items.forEach((item) => {
      const slug = item.skillSlug || 'other';
      if (!groups[slug]) {
        groups[slug] = {
          skillSlug: slug,
          skillTitle: item.skillTitle || slug,
          items: [],
        };
      }
      groups[slug].items.push(item);
    });
    return Object.values(groups);
  };

  const guessGrouped = groupBySkill(guessItems);
  const slipGrouped = groupBySkill(slipItems);
  const totalAnomalies = guessItems.length + slipItems.length;

  // Active skill node selected in Graph / RPG view
  const activeSkillItems = adjustments.filter(
    (a) => a.skillSlug === selectedNodeSlug
  );

  // Group all anomalies by module/skill slug
  const allAnomalyItems = adjustments.filter(
    (a) => Boolean((a.pGuessUsed && a.pGuessUsed > 0.3) || (a.pSlipUsed && a.pSlipUsed > 0.2))
  );

  // Group anomalies by module
  const anomaliesByModule: Record<string, AnomalyItem[]> = {};
  allAnomalyItems.forEach((item) => {
    const slug = item.skillSlug || 'other';
    if (!anomaliesByModule[slug]) {
      anomaliesByModule[slug] = [];
    }
    anomaliesByModule[slug].push(item);
  });

  // Determine module hierarchy based on DAG nodes or chronological order
  // If nodes are passed, we find root modules (those with no parent among affected modules)
  // and construct the hierarchical branch tree: Parent Module -> Child Module (or siblings if at same level)
  interface ModuleTreeNode {
    slug: string;
    title: string;
    node?: SkillGraphNode;
    items: AnomalyItem[];
    children: ModuleTreeNode[];
    level: number;
  }

  const buildModuleTree = (): ModuleTreeNode[] => {
    const affectedSlugs = Object.keys(anomaliesByModule);
    if (affectedSlugs.length === 0) return [];

    // Map of nodes
    const nodeMap = new Map<string, SkillGraphNode>();
    nodes.forEach((n) => {
      nodeMap.set(n.slug, n);
      nodeMap.set(n.id, n);
    });

    // Helper to find parent slugs within affectedSlugs
    const getParentSlugsInAffected = (slug: string): string[] => {
      const n = nodeMap.get(slug);
      if (!n || !n.parentSkillIds) return [];
      const parents: string[] = [];
      n.parentSkillIds.forEach((pid) => {
        const pNode = nodeMap.get(pid);
        if (pNode && affectedSlugs.includes(pNode.slug)) {
          parents.push(pNode.slug);
        }
      });
      return parents;
    };

    // Identify roots among affected modules (those that have 0 parents in affectedSlugs)
    const rootSlugs = affectedSlugs.filter((slug) => getParentSlugsInAffected(slug).length === 0);

    // If no explicit roots found (or no nodes data), treat all as top-level roots/siblings
    const rootsToUse = rootSlugs.length > 0 ? rootSlugs : affectedSlugs;

    const visited = new Set<string>();

    const createTreeNode = (slug: string, level: number): ModuleTreeNode => {
      visited.add(slug);
      const n = nodeMap.get(slug);
      const items = anomaliesByModule[slug] || [];

      // Find children: any affected slug whose parent is this slug
      const childrenSlugs = affectedSlugs.filter((otherSlug) => {
        if (visited.has(otherSlug)) return false;
        const otherParents = getParentSlugsInAffected(otherSlug);
        return otherParents.includes(slug);
      });

      const children = childrenSlugs.map((cSlug) => createTreeNode(cSlug, level + 1));

      return {
        slug,
        title: n?.title || items[0]?.skillTitle || slug,
        node: n,
        items,
        children,
        level,
      };
    };

    const tree = rootsToUse.map((rSlug) => createTreeNode(rSlug, 0));

    // Add any remaining unvisited affected modules (disconnected sub-trees)
    affectedSlugs.forEach((slug) => {
      if (!visited.has(slug)) {
        tree.push(createTreeNode(slug, 0));
      }
    });

    return tree;
  };

  const moduleTreeRoots = buildModuleTree();

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5 text-slate-100">
      {/* 🌲 Header Bar with View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            {viewMode === 'tree' ? (
              <FolderTree className="w-5 h-5" />
            ) : viewMode === 'graph' ? (
              <Network className="w-5 h-5 text-indigo-400" />
            ) : (
              <Swords className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{title}</span>
              {totalAnomalies > 0 ? (
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 animate-pulse">
                  {totalAnomalies} інцидентів
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  Аномалій 0
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* View Mode Controls & Search */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs font-bold font-mono">
            <button
              onClick={() => setViewMode('module_tree')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'module_tree'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Дерево Модулів</span>
            </button>

            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>За Категоріями</span>
            </button>

            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'graph'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Топологічний Граф DAG</span>
            </button>

            <button
              onClick={() => setViewMode('rpg')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'rpg'
                  ? 'bg-gradient-to-r from-amber-600 to-purple-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>RPG Матриця Рун</span>
            </button>
          </div>

          {/* Search box for tree and module_tree views */}
          {(viewMode === 'module_tree' || viewMode === 'tree') && (
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Пошук інциденту..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 🌿 РЕЖИМ 0: Дерево Модулів Аномалій (DAG Module Hierarchy)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewMode === 'module_tree' && (
        <div className="flex flex-col gap-3 font-mono text-xs">
          {totalAnomalies === 0 ? (
            <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center text-slate-500 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500/60" />
              <p className="text-xs text-slate-400">Усі поточні відповіді пройшли в межах нормальної поведінкової телеметрії.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
                <span>Ієрархія курсів: кореневі та дочірні модулі з аномаліями</span>
                <span className="text-slate-500">Сусіди одного рівня розташовані поруч</span>
              </div>

              {/* Recursive renderer for ModuleTreeNode */}
              {(() => {
                const renderTreeNode = (mNode: ModuleTreeNode) => {
                  const nodeKey = `module-${mNode.slug}`;
                  const isExpanded = expandedNodes[nodeKey] ?? true;

                  const filteredItems = mNode.items.filter((item) =>
                    !searchTerm ||
                    (item.taskTitle && item.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    mNode.title.toLowerCase().includes(searchTerm.toLowerCase())
                  );

                  const guessCount = mNode.items.filter((a) => Boolean(a.pGuessUsed && a.pGuessUsed > 0.3)).length;
                  const slipCount = mNode.items.filter((a) => Boolean(a.pSlipUsed && a.pSlipUsed > 0.2)).length;

                  return (
                    <div key={mNode.slug} className="flex flex-col gap-2">
                      {/* Module Box */}
                      <div className="bg-slate-950/80 border border-purple-500/30 rounded-xl overflow-hidden shadow-lg shadow-purple-950/10">
                        <div
                          onClick={() => toggleNode(nodeKey)}
                          className="px-4 py-3 bg-purple-950/20 hover:bg-purple-950/30 flex items-center justify-between cursor-pointer border-b border-purple-500/20 transition-all select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-purple-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-purple-400" />
                            )}
                            <FolderOpen className="w-4 h-4 text-purple-400" />
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm">{mNode.title}</span>
                              <span className="text-[10px] text-purple-300 font-mono px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                                {mNode.slug}
                              </span>
                              {mNode.level > 0 && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  (Рівень DAG: {mNode.level})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {guessCount > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {guessCount} вгадувань
                              </span>
                            )}
                            {slipCount > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {slipCount} описок
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Questions list inside module */}
                        {isExpanded && (
                          <div className="p-3 pl-6 flex flex-col gap-2 border-l-2 border-purple-500/40 ml-4 my-2">
                            {filteredItems.length === 0 ? (
                              <div className="text-slate-500 py-1 text-xs">Немає запитань, що відповідають пошуку.</div>
                            ) : (
                              filteredItems.map((item, idx) => {
                                const isGuess = Boolean(item.pGuessUsed && item.pGuessUsed > 0.3);
                                return (
                                  <div
                                    key={item.id || idx}
                                    onClick={() => setSelectedItem(item)}
                                    className="p-2.5 rounded-lg bg-slate-900/70 hover:bg-purple-950/40 border border-slate-800/80 hover:border-purple-500/40 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <div className={`w-2 h-2 rounded-full shrink-0 ${isGuess ? 'bg-amber-400 animate-ping' : 'bg-indigo-400'}`} />
                                      <span className="text-white font-medium group-hover:text-purple-300 truncate">
                                        {item.taskTitle || 'Тестове Запитання'}
                                      </span>
                                      {item.taskType && (
                                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                          {item.taskType}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 text-[10px]">
                                      <span className="text-slate-500">
                                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                      </span>
                                      {isGuess && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                          G={item.pGuessUsed}
                                        </span>
                                      )}
                                      {item.pSlipUsed !== undefined && item.pSlipUsed !== null && item.pSlipUsed > 0.2 && (
                                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                                          S={item.pSlipUsed}
                                        </span>
                                      )}
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400" />
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>

                      {/* Nested Children Modules (Branching deeper in DAG) */}
                      {mNode.children && mNode.children.length > 0 && (
                        <div className="pl-6 border-l-2 border-dashed border-purple-500/30 ml-4 flex flex-col gap-3 my-1">
                          <div className="text-[10px] uppercase font-bold text-purple-400/80 tracking-wider flex items-center gap-1.5 pt-1">
                            <GitBranch className="w-3 h-3" />
                            <span>Дочірні модулі в ланцюгу BKT:</span>
                          </div>
                          {mNode.children.map((child) => renderTreeNode(child))}
                        </div>
                      )}
                    </div>
                  );
                };

                return (
                  <div className="flex flex-col gap-4">
                    {moduleTreeRoots.map((rootNode) => renderTreeNode(rootNode))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 🌳 РЕЖИМ 1: Ієрархічне Дерево за Категоріями                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewMode === 'tree' && (
        <div className="flex flex-col gap-3 font-mono text-xs">
          {totalAnomalies === 0 && (
            <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center text-slate-500 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500/60" />
              <p className="text-xs text-slate-400">Усі поточні відповіді пройшли в межах нормальної поведінкової телеметрії.</p>
            </div>
          )}

          {/* Branch 1: Аномалії Вгадування */}
          {guessItems.length > 0 && (
            <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl overflow-hidden shadow-lg shadow-amber-950/10">
              <div
                onClick={() => toggleNode('category-guess')}
                className="px-4 py-3 bg-amber-950/20 hover:bg-amber-950/30 flex items-center justify-between cursor-pointer border-b border-amber-500/20 transition-all select-none"
              >
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  {expandedNodes['category-guess'] ? (
                    <ChevronDown className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  )}
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Гілка: Аномалії Вгадування (Швидка відповідь &lt; 3.5с, P(Guess)=0.85)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {guessItems.length} {guessItems.length === 1 ? 'інцидент' : 'інциденти'}
                </span>
              </div>

              {expandedNodes['category-guess'] && (
                <div className="p-3 pl-6 flex flex-col gap-2.5 border-l-2 border-amber-500/40 ml-4 my-2">
                  {guessGrouped.map((grp) => {
                    const skillKey = `guess-skill-${grp.skillSlug}`;
                    const isSkillExpanded = expandedNodes[skillKey] ?? true;

                    const filteredItems = grp.items.filter((item) =>
                      !searchTerm ||
                      (item.taskTitle && item.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      grp.skillTitle.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (filteredItems.length === 0) return null;

                    return (
                      <div key={grp.skillSlug} className="flex flex-col gap-1.5">
                        <div
                          onClick={() => toggleNode(skillKey)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-900 border border-slate-800 cursor-pointer text-slate-300 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            {isSkillExpanded ? (
                              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Folder className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span className="font-bold text-white text-xs">{grp.skillTitle}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-mono">({grp.skillSlug})</span>
                          </div>
                          <span className="text-[10px] text-amber-400 font-bold">
                            {filteredItems.length} {filteredItems.length === 1 ? 'питання' : 'питань'}
                          </span>
                        </div>

                        {isSkillExpanded && (
                          <div className="flex flex-col gap-1.5 pl-6 border-l border-slate-800 ml-3 py-1">
                            {filteredItems.map((item, qIdx) => (
                              <div
                                key={item.id || qIdx}
                                onClick={() => setSelectedItem(item)}
                                className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-amber-950/30 border border-slate-800/80 hover:border-amber-500/40 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-ping" />
                                  <span className="text-white font-medium group-hover:text-amber-300 truncate">
                                    {item.taskTitle || 'Тестове Запитання'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 text-[10px]">
                                  <span className="text-slate-500">
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                    G={item.pGuessUsed}
                                  </span>
                                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Branch 2: Описки Сильних Студентів */}
          {slipItems.length > 0 && (
            <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl overflow-hidden shadow-lg shadow-indigo-950/10">
              <div
                onClick={() => toggleNode('category-slip')}
                className="px-4 py-3 bg-indigo-950/20 hover:bg-indigo-950/30 flex items-center justify-between cursor-pointer border-b border-indigo-500/20 transition-all select-none"
              >
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  {expandedNodes['category-slip'] ? (
                    <ChevronDown className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                  )}
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  <span>Гілка: Випадкові Описки Сильних Студентів (Захист P(Slip) &gt; 0.2)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {slipItems.length} {slipItems.length === 1 ? 'інцидент' : 'інциденти'}
                </span>
              </div>

              {expandedNodes['category-slip'] && (
                <div className="p-3 pl-6 flex flex-col gap-2.5 border-l-2 border-indigo-500/40 ml-4 my-2">
                  {slipGrouped.map((grp) => {
                    const skillKey = `slip-skill-${grp.skillSlug}`;
                    const isSkillExpanded = expandedNodes[skillKey] ?? true;

                    const filteredItems = grp.items.filter((item) =>
                      !searchTerm ||
                      (item.taskTitle && item.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      grp.skillTitle.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (filteredItems.length === 0) return null;

                    return (
                      <div key={grp.skillSlug} className="flex flex-col gap-1.5">
                        <div
                          onClick={() => toggleNode(skillKey)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-900 border border-slate-800 cursor-pointer text-slate-300 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            {isSkillExpanded ? (
                              <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                            ) : (
                              <Folder className="w-3.5 h-3.5 text-indigo-400" />
                            )}
                            <span className="font-bold text-white text-xs">{grp.skillTitle}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-mono">({grp.skillSlug})</span>
                          </div>
                          <span className="text-[10px] text-indigo-400 font-bold">
                            {filteredItems.length} {filteredItems.length === 1 ? 'питання' : 'питань'}
                          </span>
                        </div>

                        {isSkillExpanded && (
                          <div className="flex flex-col gap-1.5 pl-6 border-l border-slate-800 ml-3 py-1">
                            {filteredItems.map((item, qIdx) => (
                              <div
                                key={item.id || qIdx}
                                onClick={() => setSelectedItem(item)}
                                className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-indigo-950/30 border border-slate-800/80 hover:border-indigo-500/40 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                  <span className="text-white font-medium group-hover:text-indigo-300 truncate">
                                    {item.taskTitle || 'Тестове Запитання'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 text-[10px]">
                                  <span className="text-slate-500">
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                                    S={item.pSlipUsed}
                                  </span>
                                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 🕸️ РЕЖИМ 2: Топологічний Граф Аномалій (DAG Network Topology) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewMode === 'graph' && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Visual Topology Canvas */}
          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 relative min-h-[360px] flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between z-10 text-[11px] font-mono text-slate-400 border-b border-slate-800/60 pb-2">
              <span className="flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-indigo-400" />
                <span>Топологічна карта навичок та фокус аномалій</span>
              </span>
              <span className="text-slate-500">Клікніть на модуль для перегляду інцидентів</span>
            </div>

            {/* SVG Connecting Rails between nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-auto py-4 z-10">
              {nodes.map((node, idx) => {
                const nodeAnomalies = adjustments.filter((a) => a.skillSlug === node.slug);
                const hasGuess = nodeAnomalies.some((a) => a.pGuessUsed && a.pGuessUsed > 0.3);
                const hasSlip = nodeAnomalies.some((a) => a.pSlipUsed && a.pSlipUsed > 0.2);
                const isSelected = selectedNodeSlug === node.slug;

                return (
                  <div
                    key={node.id || idx}
                    onClick={() => setSelectedNodeSlug(node.slug)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                      isSelected
                        ? 'ring-2 ring-purple-500 bg-purple-950/30 border-purple-400 shadow-xl shadow-purple-950/50'
                        : hasGuess
                        ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400 shadow-md shadow-amber-950/20'
                        : hasSlip
                        ? 'bg-indigo-950/20 border-indigo-500/40 hover:border-indigo-400'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono font-bold flex items-center justify-center text-slate-400">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-white text-xs truncate max-w-[140px]">{node.title}</h4>
                      </div>

                      {/* Anomaly Badge on node */}
                      {nodeAnomalies.length > 0 ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                          hasGuess 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        }`}>
                          <Zap className="w-3 h-3" />
                          <span>{nodeAnomalies.length}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400">0 аномалій</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400">Майстерність P(L):</span>
                      <strong className={node.pMastery >= 0.95 ? 'text-emerald-400' : 'text-slate-200'}>
                        {(node.pMastery * 100).toFixed(1)}%
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[10px] font-mono text-slate-500 text-center border-t border-slate-800/60 pt-2">
              ⚡ Бурштиновий: Підозра на вгадування (G=0.85) • 🛡️ Індиго: Описка сильного студента
            </div>
          </div>

          {/* Module Deep Dive Panel for selected node in Graph */}
          <div className="w-full lg:w-80 bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Деталізація Модуля: {selectedNodeSlug || 'Оберіть модуль'}</span>
            </h4>

            {selectedNodeSlug && activeSkillItems.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {activeSkillItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedItem(item)}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500 cursor-pointer flex flex-col gap-1 transition-all"
                  >
                    <span className="text-white text-xs font-medium truncate">{item.taskTitle || 'Питання'}</span>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-amber-300 font-bold">G={item.pGuessUsed ?? 0.2}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedNodeSlug ? (
              <p className="text-xs text-slate-500 text-center my-auto">У цьому модулі не зафіксовано аномалій.</p>
            ) : (
              <p className="text-xs text-slate-500 text-center my-auto">Клікніть по будь-якому модулю графу зліва для інспекції його інцидентів.</p>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 🎮 РЕЖИМ 3: RPG Матриця Рун (Cyber-Rune Mastery & Anomaly View) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewMode === 'rpg' && (
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 uppercase">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Рунічна матриця когнітивної стійкості (Anti-Cheat Rune Integrity)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Рівень чистоти навичок: 100%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 py-2">
            {nodes.map((node, idx) => {
              const nodeAnomalies = adjustments.filter((a) => a.skillSlug === node.slug);
              const hasGuess = nodeAnomalies.some((a) => a.pGuessUsed && a.pGuessUsed > 0.3);

              return (
                <div
                  key={node.id || idx}
                  onClick={() => {
                    const firstAnomaly = nodeAnomalies[0];
                    if (firstAnomaly) setSelectedItem(firstAnomaly);
                  }}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2.5 transition-all text-center relative select-none ${
                    hasGuess
                      ? 'bg-gradient-to-b from-amber-950/40 to-slate-950 border-amber-500 shadow-lg shadow-amber-500/20 cursor-pointer hover:scale-105'
                      : node.pMastery >= 0.95
                      ? 'bg-gradient-to-b from-emerald-950/30 to-slate-950 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  {/* Floating Anomaly Icon */}
                  {hasGuess && (
                    <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center gap-0.5 shadow-md animate-bounce">
                      <Zap className="w-2.5 h-2.5 fill-slate-950" />
                      <span>{nodeAnomalies.length}</span>
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold border ${
                    hasGuess
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : node.pMastery >= 0.95
                      ? 'bg-emerald-500/15 border-emerald-400 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}>
                    {hasGuess ? '⚡' : node.pMastery >= 0.95 ? '✨' : '🔒'}
                  </div>

                  <div>
                    <h5 className="font-bold text-white text-xs truncate max-w-[110px]">{node.title}</h5>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      P(L)={(node.pMastery * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🔍 Interactive Deep Dive Modal: Question, Options & Telemetry Reason */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-xl w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${
                  selectedItem.pGuessUsed && selectedItem.pGuessUsed > 0.3
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                }`}>
                  {selectedItem.pGuessUsed && selectedItem.pGuessUsed > 0.3 ? (
                    <Zap className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    {selectedItem.pGuessUsed && selectedItem.pGuessUsed > 0.3
                      ? 'Аудит Аномалії: Підозра на Вгадування'
                      : 'Аудит Аномалії: Випадковий Промах'}
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    Модуль: <strong className="text-purple-300">{selectedItem.skillTitle}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task Question & Description */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Запитання, що викликало аномалію:</span>
              </span>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
                <h5 className="font-bold text-white text-sm">
                  {selectedItem.taskTitle || 'Тестове Запитання'}
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {selectedItem.taskDescription || 'Опис завдання відсутній.'}
                </p>
              </div>
            </div>

            {/* Options display if choice task */}
            {selectedItem.taskOptions && Array.isArray(selectedItem.taskOptions) && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Варіанти відповідей завдання:
                </span>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto">
                  {selectedItem.taskOptions.map((opt: any, oIdx: number) => (
                    <div
                      key={oIdx}
                      className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-300">{opt.text || opt}</span>
                      <span className="text-[10px] font-mono text-slate-500">{opt.id || `Варіант ${oIdx + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Telemetry Verdict & Adjusted BKT Values */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Діагноз Телеметрії та Реакція Рушія BKT:
              </span>
              <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-300 font-bold">
                    {selectedItem.pGuessUsed && selectedItem.pGuessUsed > 0.3
                      ? '⚡ Латентність < 3.5с: Ймовірність вгадування підвищено до 0.85'
                      : '🛡️ Високий prior P(L): Студент знає матеріал, зрізання балів пом\'якшено'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      P(Guess) = {selectedItem.pGuessUsed ?? 0.2}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                      P(Slip) = {selectedItem.pSlipUsed ?? 0.1}
                    </span>
                  </div>
                </div>

                {selectedItem.adjustReasons && selectedItem.adjustReasons.length > 0 && (
                  <div className="pt-2 border-t border-amber-500/20 flex flex-col gap-1">
                    {selectedItem.adjustReasons.map((reason, rIdx) => (
                      <div key={rIdx} className="text-xs text-amber-200 flex items-center gap-2 font-mono">
                        <span>💡</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-all"
              >
                Закрити
              </button>
              {onNavigateToTask && selectedItem.taskId && (
                <button
                  onClick={() => {
                    const tid = selectedItem.taskId!;
                    const sslug = selectedItem.skillSlug;
                    setSelectedItem(null);
                    onNavigateToTask(tid, sslug);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Перейти до редактора цього завдання</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
