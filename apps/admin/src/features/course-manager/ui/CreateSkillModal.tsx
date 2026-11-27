'use client';

import React, { useState } from 'react';
import { Target, Check, AlertCircle, Sliders, CheckCircle2 } from 'lucide-react';
import { TaskDifficulty } from '@sbc/types';
import { slugify, validateSlug } from '@sbc/routes';
import { Modal, Button } from '@sbc/ui';

interface CreateSkillModalProps {
  isOpen: boolean;
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  onClose: () => void;
  onSkillCreated: (newSkill: any) => void;
  apiUrl?: string;
}

export const CreateSkillModal: React.FC<CreateSkillModalProps> = ({
  isOpen,
  courseId,
  moduleId,
  moduleTitle,
  onClose,
  onSkillCreated,
  apiUrl = 'http://localhost:3000',
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('EASY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // BKT parameters
  const [pL0, setPL0] = useState(0.5);
  const [pT, setPT] = useState(0.1);
  const [pS, setPS] = useState(0.1);
  const [pG, setPG] = useState(0.2);

  const slugValidation = validateSlug(slug, { maxLength: 50 });

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = slugify(val, { maxLength: 50 });
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Вкажіть назву компетенції');
      return;
    }

    if (slug.trim()) {
      const validation = validateSlug(slug.trim(), { maxLength: 50 });
      if (!validation.isValid) {
        setError(validation.error || 'Невалідний слаг компетенції');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`${apiUrl}/api/v1/courses/${courseId}/modules/${moduleId}/skills/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || title.trim(),
          difficulty,
          pL0,
          pT,
          pS,
          pG,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Не вдалося створити компетенцію');
      }

      const created = await res.json();
      onSkillCreated(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Помилка збереження');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      icon={
        <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Target className="w-4 h-4" />
        </div>
      }
      title="Додати BKT-Компетенцію"
      subtitle={moduleTitle}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Скасувати
          </Button>
          <Button
            type="submit"
            form="admin-create-skill-form"
            variant="accent"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? 'Збереження...' : 'Створити компетенцію'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3.5">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form id="admin-create-skill-form" onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 font-medium">Назва компетенції (мікро-навички) *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="наприклад, Синтаксис let/const та базові типи"
              required
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Slug & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium">URL-ідентифікатор (Slug)</label>
                {slug && (
                  <button
                    type="button"
                    onClick={() => setSlug(slugify(title, { maxLength: 50 }))}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                  >
                    ↻ З назви
                  </button>
                )}
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="js-basics"
                className={`bg-slate-950 border rounded-lg px-3 py-2 text-slate-300 font-mono text-[11px] placeholder-slate-600 focus:outline-none ${
                  slug && !slugValidation.isValid
                    ? 'border-rose-500/80 focus:border-rose-500'
                    : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
              {slug && (
                slugValidation.isValid ? (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Коректний слаг</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>{slugValidation.error}</span>
                  </span>
                )
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-medium">Рівень складності</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TaskDifficulty)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs cursor-pointer"
              >
                <option value="EASY">EASY (Базовий)</option>
                <option value="MEDIUM">MEDIUM (Практичний)</option>
                <option value="HARD">HARD (Поглиблений)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 font-medium">Опис дидактичних цілей</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Оголошення змінних (var/let/const), примітиви, явне й неявне приведення типів..."
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs resize-none"
            />
          </div>

          {/* BKT Parameters Grid */}
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Параметри моделі BKT (Bayesian Knowledge Tracing)</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-mono">P(L₀)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="0.99"
                  value={pL0}
                  onChange={(e) => setPL0(parseFloat(e.target.value) || 0)}
                  className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-emerald-400 font-mono text-center text-xs"
                />
                <span className="text-[8px] text-slate-400">Початкове</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-mono">P(T)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="0.99"
                  value={pT}
                  onChange={(e) => setPT(parseFloat(e.target.value) || 0)}
                  className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-emerald-400 font-mono text-center text-xs"
                />
                <span className="text-[8px] text-slate-400">Перехід</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-mono">P(S)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="0.99"
                  value={pS}
                  onChange={(e) => setPS(parseFloat(e.target.value) || 0)}
                  className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-rose-400 font-mono text-center text-xs"
                />
                <span className="text-[8px] text-slate-400">Помилка</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-mono">P(G)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="0.99"
                  value={pG}
                  onChange={(e) => setPG(parseFloat(e.target.value) || 0)}
                  className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-blue-400 font-mono text-center text-xs"
                />
                <span className="text-[8px] text-slate-400">Вгадування</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
