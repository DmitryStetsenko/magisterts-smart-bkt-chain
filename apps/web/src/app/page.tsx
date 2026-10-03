'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { MonacoCodeEditor } from '../features/code-editor/ui/MonacoCodeEditor';
import { SkillDagMap } from '../features/skill-graph/ui/SkillDagMap';
import { SkillGraphNode } from '../features/skill-graph/model/skill-graph.types';

interface TaskDetail {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  difficulty: string;
  skill: {
    slug: string;
    title: string;
  };
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function StudentPortalPage() {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [graphNodes, setGraphNodes] = useState<SkillGraphNode[]>([]);

  // Default Mini-Course DAG Nodes fallback
  const defaultNodes: SkillGraphNode[] = [
    {
      id: '1',
      slug: 'js-basics',
      title: 'Основи JavaScript',
      description: 'Типи даних, змінне та оператори',
      pMastery: 0.5,
      status: 'IN_PROGRESS',
      parentSkillIds: [],
    },
    {
      id: '2',
      slug: 'js-arrays',
      title: 'Масиви та FP',
      description: 'Методи map, filter, reduce',
      pMastery: 0.0,
      status: 'LOCKED',
      parentSkillIds: ['js-basics'],
    },
    {
      id: '3',
      slug: 'js-async',
      title: 'Асинхронність',
      description: 'Promises та async/await',
      pMastery: 0.0,
      status: 'LOCKED',
      parentSkillIds: ['js-arrays'],
    },
  ];

  const fetchStudentState = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/bkt/state/demo-student`);
      if (res.ok) {
        const states: Array<{ skillSlug: string; pMastery: number }> = await res.json();
        const masteryMap: Record<string, number> = {};
        states.forEach((s) => {
          masteryMap[s.skillSlug] = s.pMastery;
        });

        const updated = defaultNodes.map((n) => {
          const p = masteryMap[n.slug] ?? n.pMastery;
          const isMastered = p >= 0.95;
          const parentMastered =
            n.parentSkillIds.length === 0 ||
            n.parentSkillIds.every((pid) => (masteryMap[pid] ?? 0) >= 0.95);

          return {
            ...n,
            pMastery: p,
            status: isMastered
              ? ('MASTERED' as const)
              : parentMastered
              ? ('IN_PROGRESS' as const)
              : ('LOCKED' as const),
          };
        });

        setGraphNodes(updated);
      } else {
        setGraphNodes(defaultNodes);
      }
    } catch {
      setGraphNodes(defaultNodes);
    }
  };

  const fetchRecommendedTask = async () => {
    setIsLoading(true);
    setEvalResult(null);
    try {
      await fetchStudentState();
      const res = await fetch(`${API_URL}/api/v1/tasks/recommended`);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setRecommendation(data.recommendation);
        setCode(data.task.starterCode || '');
      }
    } catch (err) {
      console.error('Error fetching recommended task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendedTask();
  }, []);

  const handleEvaluate = async () => {
    if (!task) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/bkt/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          code,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvalResult(data);
        await fetchStudentState();
      }
    } catch (err) {
      console.error('Error evaluating code:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>Smart-BKT-Chain Student Portal</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Адаптивне практичне завдання з поведінковою телеметрією та візуалізацією графа знань BKT
            </p>
          </div>
        </div>

        <button
          onClick={fetchRecommendedTask}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Оновити рекомендоване</span>
        </button>
      </header>

      {/* 🗺️ Interactive Skill DAG Map Component */}
      <SkillDagMap
        nodes={graphNodes.length ? graphNodes : defaultNodes}
        activeSkillSlug={task?.skill.slug}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Task & BKT Recommendation */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {isLoading ? (
            <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center text-slate-400 font-mono text-sm animate-pulse">
              Завантаження адаптивного завдання BKT...
            </div>
          ) : task ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                  {task.skill.title}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {task.difficulty}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-100">{task.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {task.description}
              </p>

              {/* BKT Recommendation Box */}
              {recommendation && (
                <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-xl flex flex-col gap-1 text-xs">
                  <span className="font-semibold text-indigo-300">
                    🎯 Причина рекомендації: {recommendation.reason}
                  </span>
                  <span className="text-slate-400">
                    Поточна ймовірність засвоєння P(L): {(recommendation.currentMastery * 100).toFixed(1)}%
                  </span>
                </div>
              )}

              {/* Public Test Cases */}
              <div className="flex flex-col gap-2 mt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Відкриті Тест-Кейси:
                </h4>
                <div className="flex flex-col gap-2">
                  {task.testCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs font-mono flex flex-col gap-1"
                    >
                      <div className="text-slate-400">
                        <span className="text-slate-500">Input:</span> {tc.input}
                      </div>
                      <div className="text-emerald-400">
                        <span className="text-slate-500">Expected:</span> {tc.expectedOutput}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400">
              Завдання відсутні
            </div>
          )}

          {/* Evaluation Result Feedback Banner */}
          {evalResult && (
            <div
              className={`p-6 rounded-2xl border flex flex-col gap-3 transition-all ${
                evalResult.status === 'ACCEPTED'
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 text-base font-bold">
                {evalResult.status === 'ACCEPTED' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                )}
                <span>
                  {evalResult.status === 'ACCEPTED' ? 'Рішення прийнято!' : 'Помилка виконання'}
                </span>
              </div>

              <p className="text-xs">
                Пройдено тестів: {evalResult.passedTestsCount} / {evalResult.totalTestsCount}
              </p>

              {/* BKT Score Update */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-mono flex flex-col gap-1">
                <span className="text-slate-300 font-semibold">Оновлення BKT P(L):</span>
                <span>
                  До: {evalResult.bktUpdate.pMasteryPrior} ➔ Після: {evalResult.bktUpdate.pMasteryPosterior}
                </span>
                {evalResult.bktUpdate.isMastered && (
                  <span className="text-emerald-400 font-bold mt-1">
                    🎉 Навичку повністю засвоєно (P(L) ≥ 0.95)!
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Right Panel: Monaco Editor with Live Telemetry */}
        <section className="lg:col-span-7 h-[600px] flex flex-col">
          {task ? (
            <MonacoCodeEditor
              userId="demo-student"
              taskId={task.id}
              initialCode={code}
              onChange={(val) => setCode(val)}
              onSubmit={handleEvaluate}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="h-full bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500">
              Завантаження редактора коду Monaco...
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
