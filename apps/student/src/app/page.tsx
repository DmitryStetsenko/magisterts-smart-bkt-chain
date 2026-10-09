'use client';

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Brain, Sparkles, CheckCircle, AlertCircle, RefreshCw, User, Code2, BookOpen, Scale, ChevronDown, ArrowRight, AlertTriangle, X, Settings } from 'lucide-react';
import { MonacoCodeEditor } from '../features/code-editor/ui/MonacoCodeEditor';
import { QuizTaskEditor } from '../features/quiz-editor/ui/QuizTaskEditor';
import { EssayTaskEditor } from '../features/essay-editor/ui/EssayTaskEditor';
import { SkillDagMap } from '../features/skill-graph/ui/SkillDagMap';
import { SkillGraphNode } from '../features/skill-graph/model/skill-graph.types';

interface TaskDetail {
  id: string;
  taskType: 'CODE' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT_ESSAY';
  title: string;
  description: string;
  starterCode?: string;
  options?: any;
  difficulty: string;
  skill: {
    id: string;
    slug: string;
    title: string;
  };
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

interface CourseItem {
  slug: string;
  title: string;
  description?: string;
  category?: string;
}

const DEFAULT_COURSES: CourseItem[] = [
  { slug: 'js-dev', title: 'JavaScript & Web Dev', category: 'Programming' },
  { slug: 'english-b2', title: 'Business & Tech English (B2)', category: 'Languages' },
  { slug: 'ukraine-law', title: 'Правознавство України', category: 'Jurisprudence' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function StudentPortalPage() {
  const [courses, setCourses] = useState<CourseItem[]>(DEFAULT_COURSES);
  const [activeCourseSlug, setActiveCourseSlug] = useState<string>('js-dev');
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [exhaustedModalData, setExhaustedModalData] = useState<{ skillId: string; skillTitle: string } | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/courses`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCourses(data);
            if (!data.some((c: any) => c.slug === activeCourseSlug)) {
              setActiveCourseSlug(data[0].slug);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching courses list:', err);
      }
    };
    fetchCourses();
  }, []);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [essayAnswer, setEssayAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [graphNodes, setGraphNodes] = useState<SkillGraphNode[]>([]);

  const fetchCourseStructureAndState = async (courseSlug: string) => {
    try {
      const courseRes = await fetch(`${API_URL}/api/v1/courses/${courseSlug}`);
      const bktRes = await fetch(`${API_URL}/api/v1/bkt/state/demo-student`);

      let bktMap: Record<string, number> = {};
      if (bktRes.ok) {
        const states: Array<{ skillId: string; pMastery: number }> = await bktRes.json();
        states.forEach((s) => {
          bktMap[s.skillId] = s.pMastery;
        });
      }

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        const mappedNodes: SkillGraphNode[] = courseData.skills.map((skill: any) => {
          const p = bktMap[skill.id] ?? 0.0;
          const isMastered = p >= 0.95;
          const parentIds = skill.parentDependencies.map((d: any) => d.parentSkillId);
          const parentMastered =
            parentIds.length === 0 || parentIds.every((pid: string) => (bktMap[pid] ?? 0) >= 0.95);

          return {
            id: skill.id,
            slug: skill.slug,
            title: skill.title,
            description: skill.description,
            pMastery: p,
            status: isMastered ? 'MASTERED' : parentMastered ? 'IN_PROGRESS' : 'LOCKED',
            parentSkillIds: parentIds,
          };
        });

        setGraphNodes(mappedNodes);
      }
    } catch (err) {
      console.error('Error fetching course structure:', err);
    }
  };

  const fetchRecommendedTask = async (courseSlug: string) => {
    setIsLoading(true);
    setEvalResult(null);
    try {
      await fetchCourseStructureAndState(courseSlug);
      const res = await fetch(`${API_URL}/api/v1/tasks/recommended?courseSlug=${courseSlug}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
        setRecommendation(data.recommendation);
        setCode(data.task.starterCode || '');
        setEssayAnswer('');

        if (data.recommendation?.isExhausted || data.recommendation?.reason === 'MODULE_TASKS_EXHAUSTED') {
          setExhaustedModalData({
            skillId: data.recommendation.recommendedSkill.id,
            skillTitle: data.recommendation.recommendedSkill.title,
          });
        }
      } else {
        setTask(null);
      }
    } catch (err) {
      console.error('Error fetching task:', err);
      setTask(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSkillReset = async () => {
    if (!exhaustedModalData) return;
    try {
      await fetch(`${API_URL}/api/v1/bkt/reset-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-student',
          skillId: exhaustedModalData.skillId,
        }),
      });
    } catch (err) {
      console.error('Error resetting skill progress:', err);
    } finally {
      setExhaustedModalData(null);
      await fetchRecommendedTask(activeCourseSlug);
    }
  };

  useEffect(() => {
    fetchRecommendedTask(activeCourseSlug);
  }, [activeCourseSlug]);

  useEffect(() => {
    const socket = io(`${API_URL}/telemetry`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    if (socket) {
      socket.on('connect', () => {
        socket.emit('join_session', { userId: 'demo-student', taskId: task?.id || 'default' });
      });

      socket.on('bkt_state_reset', (data: { userId: string; skillId?: string }) => {
        console.log('⚡ Received bkt_state_reset via WebSocket:', data);
        fetchRecommendedTask(activeCourseSlug);
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [activeCourseSlug, task?.id]);

  const handleEvaluate = async (customPayload?: any) => {
    if (!task) return;
    setIsSubmitting(true);
    try {
      const payload = customPayload || {
        taskId: task.id,
        code,
        essayAnswer,
      };

      const res = await fetch(`${API_URL}/api/v1/bkt/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          ...payload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvalResult(data);
        await fetchCourseStructureAndState(activeCourseSlug);
      }
    } catch (err) {
      console.error('Error evaluating task submission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opera-Style Sidebar Drawer State: null = closed, 'task' | 'bkt' | 'analytics' | 'settings'
  const [activeDrawer, setActiveDrawer] = useState<'task' | 'bkt' | 'analytics' | 'settings' | null>('task');

  const toggleDrawer = (tab: 'task' | 'bkt' | 'analytics' | 'settings') => {
    setActiveDrawer((prev) => (prev === tab ? null : tab));
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* 📌 Sticky Top Navigation Bar */}
      <header className="h-14 w-full bg-slate-900 border-b border-slate-800/90 px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Smart-BKT-Chain</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                v2.0 Shell
              </span>
            </h1>
          </div>
        </div>

        {/* Top Controls: Course Selector & User Profile */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <select
              id="student-course-select"
              value={activeCourseSlug}
              onChange={(e) => setActiveCourseSlug(e.target.value)}
              className="w-full appearance-none px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer pr-8 shadow-inner"
            >
              {courses.map((course) => (
                <option key={course.slug} value={course.slug} className="bg-slate-900 text-white py-1">
                  📚 {course.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-200">Дмитро Стеценко</span>
          </div>
        </div>
      </header>

      {/* 🧭 Main Workspace Area with Left Opera Icon Rail + Expandable Drawer */}
      <div className="flex-1 flex overflow-hidden">
        {/* 🎨 Opera-Style Vertical Icon Rail (Slim Left Bar) */}
        <nav className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-3 shrink-0 z-20 shadow-xl">
          {/* Main Action Tabs */}
          <button
            onClick={() => toggleDrawer('task')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeDrawer === 'task'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Умова Завдання та Критерії"
          >
            <BookOpen className="w-5 h-5" />
            {activeDrawer === 'task' && <span className="absolute -left-1 w-1 h-5 bg-indigo-400 rounded-r-full"></span>}
          </button>

          <button
            onClick={() => toggleDrawer('bkt')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeDrawer === 'bkt'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Карта Навичок BKT (DAG)"
          >
            <Sparkles className="w-5 h-5" />
            {activeDrawer === 'bkt' && <span className="absolute -left-1 w-1 h-5 bg-indigo-400 rounded-r-full"></span>}
          </button>

          {/* Bottom Area (External Apps & Settings at very bottom) */}
          <div className="mt-auto flex flex-col items-center gap-2.5">
            <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

            {/* External Apps Group */}
            <a
              href="http://localhost:3003"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-purple-600/15 text-purple-400 border border-purple-500/20 flex items-center justify-center hover:bg-purple-600/30 hover:border-purple-500/40 transition-all"
              title="Кабінет Викладача (Teacher Portal)"
            >
              <User className="w-4 h-4" />
            </a>

            <a
              href="http://localhost:3004"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-600/30 hover:border-emerald-500/40 transition-all"
              title="Панель Адміністратора (CMS DAG)"
            >
              <Code2 className="w-4 h-4" />
            </a>

            {/* Separator before Settings block */}
            <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

            {/* Workspace Settings Block (At the very bottom) */}
            <button
              onClick={() => toggleDrawer('settings')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeDrawer === 'settings'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Налаштування Workspace"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </nav>

        {/* 📂 Expandable Side Drawer Panel */}
        {activeDrawer && (
          <aside className="w-full sm:w-[380px] lg:w-[420px] bg-slate-900/95 border-r border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto shrink-0 shadow-2xl backdrop-blur-xl animate-fadeIn z-10">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {activeDrawer === 'task' && (
                  <>
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Умова та Контекст Завдання</span>
                  </>
                )}
                {activeDrawer === 'bkt' && (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Карта Навичок (Skill DAG)</span>
                  </>
                )}
                {activeDrawer === 'settings' && (
                  <>
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    <span>Налаштування Студента</span>
                  </>
                )}
              </h2>
              <button
                onClick={() => setActiveDrawer(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                title="Закрити панель"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Drawer 1: Task Condition */}
            {activeDrawer === 'task' && task && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {task.skill.title}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {task.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-2">{task.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
                </div>

                {recommendation && (
                  <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-indigo-200">
                      <span className="font-bold text-indigo-300 block mb-0.5">Рекомендація BKT Engine:</span>
                      {recommendation.reason || 'Завдання обрано відповідно до вашого рівня засвоєння.'}
                    </div>
                  </div>
                )}

                {task.taskType === 'CODE' && task.testCases.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Відкриті Тест-Кейси
                    </span>
                    {task.testCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs font-mono flex flex-col gap-0.5"
                      >
                        <span className="text-slate-400 text-[11px]">
                          Вхідні дані: <code className="text-indigo-300">{tc.input}</code>
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          Очікуваний вивід: <code className="text-emerald-300">{tc.expectedOutput}</code>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => fetchRecommendedTask(activeCourseSlug)}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer mt-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Оновити рекомендоване завдання</span>
                </button>
              </div>
            )}

            {/* Content Drawer 2: Skill DAG Map */}
            {activeDrawer === 'bkt' && (
              <div className="flex flex-col gap-4">
                <SkillDagMap nodes={graphNodes} activeSkillSlug={task?.skill?.slug} />
              </div>
            )}

            {/* Content Drawer 3: Settings */}
            {activeDrawer === 'settings' && (
              <div className="flex flex-col gap-4 text-xs text-slate-300">
                <p>Налаштування робочого середовища та відображення Monaco Editor.</p>
                <button
                  onClick={() => fetchRecommendedTask(activeCourseSlug)}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer hover:bg-indigo-500 transition-all"
                >
                  Перезавантажити стан BKT
                </button>
              </div>
            )}
          </aside>
        )}

        {/* 💻 Center Main Canvas: Editor & Evaluation Result */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto flex flex-col gap-4 bg-slate-950">
          {isLoading ? (
            <div className="p-12 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 text-slate-400 my-auto">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Завантаження адаптивного завдання з BKT графа...</p>
            </div>
          ) : task ? (
            <div className="flex flex-col gap-4 h-full">
              {task.taskType === 'SINGLE_CHOICE' || task.taskType === 'MULTIPLE_CHOICE' ? (
                <QuizTaskEditor
                  taskId={task.id}
                  taskType={task.taskType}
                  title={task.title}
                  description={task.description}
                  options={task.options || []}
                  onSubmit={(payload) => handleEvaluate(payload)}
                  isSubmitting={isSubmitting}
                  onNextTask={() => fetchRecommendedTask(activeCourseSlug)}
                  isPassed={Boolean(evalResult?.isPassed)}
                />
              ) : task.taskType === 'TEXT_ESSAY' ? (
                <EssayTaskEditor
                  userId="demo-student"
                  taskId={task.id}
                  onChange={setEssayAnswer}
                  onSubmit={() => handleEvaluate({ essayAnswer })}
                  isSubmitting={isSubmitting}
                  onNextTask={() => fetchRecommendedTask(activeCourseSlug)}
                  isPassed={Boolean(evalResult?.isPassed)}
                />
              ) : (
                <MonacoCodeEditor
                  userId="demo-student"
                  taskId={task.id}
                  initialCode={code}
                  onChange={setCode}
                  onSubmit={() => handleEvaluate({ code })}
                  isSubmitting={isSubmitting}
                  onNextTask={() => fetchRecommendedTask(activeCourseSlug)}
                  isPassed={Boolean(evalResult?.isPassed)}
                />
              )}

              {/* Evaluation Result Toast Panel */}
              {evalResult && (
                <div
                  className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all shadow-xl shrink-0 ${
                    evalResult.isPassed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {evalResult.isPassed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm">
                        {evalResult.isPassed ? 'Вітаємо! Перевірку пройдено' : 'Необхідне доопрацювання'}
                      </h4>
                      <p className="text-xs opacity-90">{evalResult.feedback}</p>
                    </div>
                  </div>

                  {evalResult.bktUpdate && (
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span>Оновлення BKT P(Lₜ) для "{evalResult.bktUpdate.skillTitle}":</span>
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-slate-400">{(evalResult.bktUpdate.pMasteryBefore * 100).toFixed(1)}%</span>
                        <span>➔</span>
                        <span className={evalResult.bktUpdate.pMasteryChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {(evalResult.bktUpdate.pMasteryAfter * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-center text-slate-400 text-sm my-auto">
              Завдань у даному курсі не знайдено.
            </div>
          )}
        </main>
      </div>

      {/* Exhausted Module Tasks Modal Popup */}
      {exhaustedModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col gap-5 text-center transform transition-all scale-100">
            <div className="mx-auto p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-white">Завдання модуля закінчилися</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Завдання даного модуля (<strong className="text-indigo-400">"{exhaustedModalData.skillTitle}"</strong>) закінчилися, і ви не набрали необхідну кількість балів (&ge;95%).
                Ваш прогрес на цьому модулі буде анульований для повторної спроби.
              </p>
            </div>
            <button
              onClick={handleConfirmSkillReset}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-indigo-400/30"
            >
              ОК, анулювати прогрес модуля
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
