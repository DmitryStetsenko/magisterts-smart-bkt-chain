'use client';

import React, { useState } from 'react';
import { CheckSquare, Code2, FileText, X, Check, AlertCircle, Plus, Trash2, HelpCircle } from 'lucide-react';
import { TaskType, TaskDifficulty } from '@sbc/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  courseId: string;
  skillId: string;
  skillTitle: string;
  onClose: () => void;
  onTaskCreated: (newTask: any) => void;
  apiUrl?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  courseId,
  skillId,
  skillTitle,
  onClose,
  onTaskCreated,
  apiUrl = 'http://localhost:3000',
}) => {
  const [taskType, setTaskType] = useState<TaskType>('SINGLE_CHOICE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('EASY');
  const [socraticHint, setSocraticHint] = useState('');
  const [studyUnitUrl, setStudyUnitUrl] = useState('');

  // MCQ state
  const [options, setOptions] = useState<Array<{ id: string; text: string }>>([
    { id: 'opt_1', text: '' },
    { id: 'opt_2', text: '' },
    { id: 'opt_3', text: '' },
    { id: 'opt_4', text: '' },
  ]);
  const [correctOptionId, setCorrectOptionId] = useState('opt_1');

  // CODE state
  const [starterCode, setStarterCode] = useState('function solution() {\n  // Ваш розвʼязок тут\n}');
  const [testCases, setTestCases] = useState<Array<{ input: string; expectedOutput: string; isSecret: boolean }>>([
    { input: '', expectedOutput: '', isSecret: false },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddOption = () => {
    const nextId = `opt_${options.length + 1}`;
    setOptions([...options, { id: nextId, text: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const next = [...options];
    next.splice(index, 1);
    setOptions(next);
    if (!next.some((o) => o.id === correctOptionId)) {
      setCorrectOptionId(next[0].id);
    }
  };

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isSecret: false }]);
  };

  const handleRemoveTestCase = (index: number) => {
    if (testCases.length <= 1) return;
    const next = [...testCases];
    next.splice(index, 1);
    setTestCases(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Вкажіть назву завдання');
      return;
    }
    if (!description.trim()) {
      setError('Вкажіть формулювання або умову завдання');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        taskType,
        difficulty,
        studyUnitUrl: studyUnitUrl.trim() || undefined,
        socraticHints: socraticHint.trim()
          ? [{ level: 1, hint: socraticHint.trim(), penaltyPct: 15 }]
          : undefined,
      };

      if (taskType === 'SINGLE_CHOICE' || taskType === 'MULTIPLE_CHOICE') {
        const validOptions = options.filter((o) => o.text.trim());
        if (validOptions.length < 2) {
          throw new Error('Для тесту необхідно вказати мінімум 2 варіанти відповіді');
        }
        payload.options = validOptions;
        payload.referenceAnswer = correctOptionId;
      } else if (taskType === 'CODE') {
        payload.starterCode = starterCode;
        payload.testCases = testCases.filter((tc) => tc.expectedOutput.trim());
      }

      const res = await fetch(`${apiUrl}/api/v1/courses/${courseId}/skills/${skillId}/tasks/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Не вдалося створити завдання');
      }

      const created = await res.json();
      onTaskCreated(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Помилка збереження');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 flex flex-col gap-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Додати Навчальне Завдання</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">{skillTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Modality Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 font-medium">Формат оцінювання (Тип завдання) *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTaskType('SINGLE_CHOICE')}
                className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  taskType === 'SINGLE_CHOICE'
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Тест (MCQ)</span>
                </div>
                <span className="text-[10px] opacity-75">Швидка перевірка понять</span>
              </button>

              <button
                type="button"
                onClick={() => setTaskType('CODE')}
                className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  taskType === 'CODE'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Практичний Код</span>
                </div>
                <span className="text-[10px] opacity-75">Monaco + автотести</span>
              </button>

              <button
                type="button"
                onClick={() => setTaskType('TEXT_ESSAY')}
                className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  taskType === 'TEXT_ESSAY'
                    ? 'border-purple-500 bg-purple-500/15 text-purple-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Аналітичне Есе</span>
                </div>
                <span className="text-[10px] opacity-75">Викладач або LLM</span>
              </button>
            </div>
          </div>

          {/* Title & Difficulty */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-slate-300 font-medium">Назва завдання *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="наприклад, Теорія: Незмінність посилання const"
                required
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-medium">Складність</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TaskDifficulty)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs cursor-pointer"
              >
                <option value="EASY">EASY (Базовий)</option>
                <option value="MEDIUM">MEDIUM (Середній)</option>
                <option value="HARD">HARD (Складний)</option>
              </select>
            </div>
          </div>

          {/* Prompt / Description */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-300 font-medium">Формулювання питання або умова задачі *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Вкажіть точне формулювання для учня..."
              required
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
            />
          </div>

          {/* MCQ Options */}
          {(taskType === 'SINGLE_CHOICE' || taskType === 'MULTIPLE_CHOICE') && (
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 text-xs">Варіанти відповідей (позначте правильну):</span>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Додати варіант</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={correctOptionId === opt.id}
                      onChange={() => setCorrectOptionId(opt.id)}
                      className="accent-indigo-500 cursor-pointer w-4 h-4"
                      title="Позначити як правильну відповідь"
                    />
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const next = [...options];
                        next[idx].text = e.target.value;
                        setOptions(next);
                      }}
                      placeholder={`Варіант ${idx + 1}`}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CODE Starter Code & Test Cases */}
          {taskType === 'CODE' && (
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-300 text-xs">Стартовий шаблон коду для Monaco Editor:</label>
                <textarea
                  rows={3}
                  value={starterCode}
                  onChange={(e) => setStarterCode(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-emerald-400 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 text-xs">Автоматичні тест-кейси:</span>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Додати тест</span>
                  </button>
                </div>

                {testCases.map((tc, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                    <input
                      type="text"
                      value={tc.input}
                      onChange={(e) => {
                        const next = [...testCases];
                        next[idx].input = e.target.value;
                        setTestCases(next);
                      }}
                      placeholder="Input (аргументи)"
                      className="col-span-2 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px]"
                    />
                    <input
                      type="text"
                      value={tc.expectedOutput}
                      onChange={(e) => {
                        const next = [...testCases];
                        next[idx].expectedOutput = e.target.value;
                        setTestCases(next);
                      }}
                      placeholder="Expected Output *"
                      className="col-span-2 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-emerald-300 font-mono text-[11px]"
                    />
                    <div className="flex items-center justify-end">
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Socratic Hint & Deep Link */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-amber-400" />
                <span>Сократівська підказка (Hint)</span>
              </label>
              <input
                type="text"
                value={socraticHint}
                onChange={(e) => setSocraticHint(e.target.value)}
                placeholder="Згадай: const забороняє переприсвоєння..."
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium text-[11px]">Шлях до підручника (Deep-link)</label>
              <input
                type="text"
                value={studyUnitUrl}
                onChange={(e) => setStudyUnitUrl(e.target.value)}
                placeholder="/learn/js-dev/module-1#const-mutability"
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-[11px] placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs cursor-pointer"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all text-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Збереження...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Зберегти завдання в банк</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
