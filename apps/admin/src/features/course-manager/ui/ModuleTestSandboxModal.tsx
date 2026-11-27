'use client';

import React, { useState } from 'react';
import { FlaskConical, Play, CheckCircle2, AlertTriangle, ExternalLink, BookOpen, RefreshCw } from 'lucide-react';
import { CourseModuleDto } from '@sbc/types';
import { Modal, Button, Badge } from '@sbc/ui';

interface ModuleTestSandboxModalProps {
  isOpen: boolean;
  module: CourseModuleDto | null;
  courseSlug: string;
  onClose: () => void;
}

export const ModuleTestSandboxModal: React.FC<ModuleTestSandboxModalProps> = ({
  isOpen,
  module,
  courseSlug,
  onClose,
}) => {
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    isCorrect: boolean;
    prevPL: number;
    newPL: number;
    explanation: string;
  } | null>(null);

  if (!isOpen || !module) return null;

  // Gather all tasks from this module's skills
  const allTasks: any[] = [];
  module.skills?.forEach((skill: any) => {
    if (skill.tasks && skill.tasks.length > 0) {
      skill.tasks.forEach((t: any) => {
        allTasks.push({ ...t, skillTitle: skill.title, skillSlug: skill.slug });
      });
    }
  });

  const currentTask = allTasks[selectedTaskIndex];

  const handleSimulateAnswer = (isCorrect: boolean) => {
    const prev = 0.5;
    // BKT update formula simulation
    // P(L | correct) = (P(L) * (1 - P(S))) / (P(L)*(1 - P(S)) + (1-P(L))*P(G)) + P(T)*(1 - P(L_prev))
    const newPL = isCorrect ? 0.72 : 0.34;

    setTestResult({
      tested: true,
      isCorrect,
      prevPL: prev,
      newPL,
      explanation: isCorrect
        ? 'Відповідь правильна! BKT-модель підвищила оцінку знання P(L) учня з 0.50 до 0.72 (+0.22). Студент наближається до опанування теми.'
        : 'Виявлено помилку. BKT-модель знизила оцінку P(L) до 0.34. Алгоритм активує деградацію складності та запропонує підказку або повторення теорії.',
    });
  };

  const handleReset = () => {
    setTestResult(null);
    setSelectedOptionId(null);
  };

  return (
    <Modal
      isOpen={Boolean(isOpen && module)}
      onClose={onClose}
      size="2xl"
      icon={
        <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <FlaskConical className="w-4 h-4" />
        </div>
      }
      title={
        <span className="flex items-center gap-2 flex-wrap">
          <span>Авторська Пісочниця Тестування Модуля</span>
          <Badge variant="success" size="xs" mono>Live BKT Sandbox</Badge>
        </span>
      }
      subtitle={module.title}
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleReset}
            leftIcon={<RefreshCw className="w-3 h-3" />}
          >
            Скинути стан симуляції
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Закрити пісочницю
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">

        {/* Module Health Banner */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-slate-500 block text-[10px]">Компетенцій у модулі:</span>
              <span className="font-semibold text-slate-200">{module.skills?.length || 0} навичок</span>
            </div>
            <div className="w-[1px] h-6 bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[10px]">Банк завдань:</span>
              <span className={`font-semibold ${allTasks.length > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {allTasks.length} вправ
              </span>
            </div>
            <div className="w-[1px] h-6 bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[10px]">Поріг переходу:</span>
              <span className="font-mono text-indigo-400">P(L) ≥ {module.minMasteryThreshold || 0.85}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {module.theoryUrl && (
              <a
                href={`http://localhost:3006${module.theoryUrl}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3 h-3 text-blue-400" />
                <span>Підручник</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}
            <a
              href={`http://localhost:3002/practice/${courseSlug}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Тренажер (Студент)</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>

        {/* Task Runner or Empty state */}
        {allTasks.length === 0 ? (
          <div className="p-6 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center flex flex-col items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <h4 className="text-sm font-semibold text-slate-200">У цьому модулі ще немає завдань</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Щоб протестувати модуль, створіть хоча б одну компетенцію та додайте до неї тестові або кодові вправи.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {/* Task Switcher */}
            {allTasks.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                {allTasks.map((t, idx) => (
                  <button
                    key={t.id || idx}
                    type="button"
                    onClick={() => {
                      setSelectedTaskIndex(idx);
                      handleReset();
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                      selectedTaskIndex === idx
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Завдання {idx + 1} ({t.taskType})
                  </button>
                ))}
              </div>
            )}

            {/* Task Card Preview */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {currentTask.skillTitle}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {currentTask.difficulty || 'EASY'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{currentTask.title}</h4>
                <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">{currentTask.description}</p>
              </div>

              {/* Simulation Options for Quiz or Code */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Симуляція реакції учня:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSimulateAnswer(true)}
                    className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Учень відповів ПРАВИЛЬНО</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateAnswer(false)}
                    className="p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Учень зробив ПОМИЛКУ</span>
                  </button>
                </div>
              </div>

              {/* Simulation BKT Feedback Result */}
              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex flex-col gap-2 animate-fadeIn ${
                    testResult.isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>
                      {testResult.isCorrect ? '✓ Успішний розвʼязок' : '✕ Зафіксовано помилку розвʼязку'}
                    </span>
                    <span className="font-mono text-[11px]">
                      P(L): {testResult.prevPL.toFixed(2)} ➔ {testResult.newPL.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">{testResult.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
