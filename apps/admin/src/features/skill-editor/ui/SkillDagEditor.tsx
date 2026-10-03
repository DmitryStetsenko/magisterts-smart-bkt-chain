'use client';

import React, { useState } from 'react';
import { Network, Plus, Trash2, Edit3, ArrowRight, Save, Layers } from 'lucide-react';
import { AdminSkillNode } from '../model/skill-editor.types';

interface SkillDagEditorProps {
  nodes: AdminSkillNode[];
  onSaveNode: (node: AdminSkillNode) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const SkillDagEditor: React.FC<SkillDagEditorProps> = ({
  nodes,
  onSaveNode,
  onDeleteNode,
}) => {
  const [selectedNode, setSelectedNode] = useState<AdminSkillNode | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [formData, setFormData] = useState<AdminSkillNode>({
    id: '',
    slug: '',
    title: '',
    description: '',
    category: 'Programming',
    difficulty: 'EASY',
    parentSkillIds: [],
    pInit: 0.5,
    pTransit: 0.1,
    pSlip: 0.1,
    pGuess: 0.2,
  });

  const handleCreateNew = () => {
    const newNode: AdminSkillNode = {
      id: `skill-${Date.now()}`,
      slug: 'new-skill',
      title: 'Нова навичка',
      description: 'Опис нової навички графа BKT',
      category: 'Programming',
      difficulty: 'EASY',
      parentSkillIds: [],
      pInit: 0.5,
      pTransit: 0.1,
      pSlip: 0.1,
      pGuess: 0.2,
    };
    setSelectedNode(newNode);
    setFormData(newNode);
    setIsEditing(true);
  };

  const handleSelectNode = (node: AdminSkillNode) => {
    setSelectedNode(node);
    setFormData(node);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNode(formData);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* DAG Visualizer Column */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Network className="w-5 h-5" />
            <h3 className="font-bold text-white text-lg">Візуальний DAG Конструктор BKT</h3>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Додати Вузол</span>
          </button>
        </div>

        {/* Nodes Canvas Grid */}
        <div className="flex flex-col gap-4">
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <div
                key={node.id}
                onClick={() => handleSelectNode(node)}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                      {node.slug}
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm">{node.title}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                    {node.difficulty}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{node.description}</p>

                {/* BKT Parameters Badge Grid */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex flex-col items-center">
                    <span className="text-slate-500">P(L₀)</span>
                    <span className="text-indigo-400 font-bold">{node.pInit}</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex flex-col items-center">
                    <span className="text-slate-500">P(T)</span>
                    <span className="text-emerald-400 font-bold">{node.pTransit}</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex flex-col items-center">
                    <span className="text-slate-500">P(S)</span>
                    <span className="text-rose-400 font-bold">{node.pSlip}</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex flex-col items-center">
                    <span className="text-slate-500">P(G)</span>
                    <span className="text-amber-400 font-bold">{node.pGuess}</span>
                  </div>
                </div>

                {/* Parents indication */}
                {node.parentSkillIds.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                    <span>Базові навички: {node.parentSkillIds.join(', ')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor & Parameter Tuning Form Column */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
        <div className="flex items-center gap-2 text-purple-400">
          <Edit3 className="w-5 h-5" />
          <h3 className="font-bold text-white text-lg">
            {isEditing ? 'Редагування Навички & BKT' : 'Оберіть навичку для редагування'}
          </h3>
        </div>

        {isEditing && selectedNode ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Назва Навички</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Slug ID</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Складність</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Опис</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 min-h-[80px]"
              />
            </div>

            {/* BKT Math Parameters Editor */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Параметри Bayesian Knowledge Tracing
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-400">P(L₀) Початкові знання</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.pInit}
                    onChange={(e) => setFormData({ ...formData, pInit: parseFloat(e.target.value) })}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-400">P(T) Ймовірність навчання</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.pTransit}
                    onChange={(e) => setFormData({ ...formData, pTransit: parseFloat(e.target.value) })}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-400">P(S) Ймовірність помилки</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.pSlip}
                    onChange={(e) => setFormData({ ...formData, pSlip: parseFloat(e.target.value) })}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-rose-300"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-400">P(G) Ймовірність вгадування</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.pGuess}
                    onChange={(e) => setFormData({ ...formData, pGuess: parseFloat(e.target.value) })}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-amber-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => onDeleteNode(formData.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Видалити</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Зберегти зміни</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-sm">
            Оберіть вузол у графі ліворуч або натисніть «Додати Вузол»
          </div>
        )}
      </div>
    </div>
  );
};
