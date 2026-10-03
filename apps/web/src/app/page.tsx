import Link from 'next/link';
import { Brain, Code2, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Крок 5: Фронтенд кабінету студента</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-4">
          Smart-BKT-Chain Student Portal
        </h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Вітаємо у кабінеті студента! Тут інтегрується Monaco Editor з перехопленням телеметрії та адаптивним вибором завдань BKT.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <Code2 className="w-6 h-6 text-emerald-400 mb-2" />
            <h3 className="font-semibold text-slate-200">Monaco Editor</h3>
            <p className="text-xs text-slate-400 mt-1">Редактор коду у браузері з вимірюванням темпу WPM та пауз.</p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <Brain className="w-6 h-6 text-indigo-400 mb-2" />
            <h3 className="font-semibold text-slate-200">BKT Graph DAG</h3>
            <p className="text-xs text-slate-400 mt-1">Візуалізація картки знань P(L) та просування по модулях.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
