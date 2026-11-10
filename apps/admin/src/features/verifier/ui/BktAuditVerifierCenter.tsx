'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  Terminal,
  Sliders,
  Sparkles,
  Copy,
  Check,
  FileText,
  Clock,
  Layers,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';
import { BktVerificationResponse, InvariantTestRecord } from '../model/verifier.types';

interface BktAuditVerifierCenterProps {
  apiUrl: string;
}

export const BktAuditVerifierCenter: React.FC<BktAuditVerifierCenterProps> = ({ apiUrl }) => {
  const [data, setData] = useState<BktVerificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'live' | 'simulator' | 'console'>('tests');
  const [copiedConsole, setCopiedConsole] = useState<boolean>(false);

  // 🧮 Стан для інтерактивного локального симулятора
  const [simPrior, setSimPrior] = useState<number>(0.30);
  const [simTransit, setSimTransit] = useState<number>(0.20);
  const [simSlip, setSimSlip] = useState<number>(0.10);
  const [simGuess, setSimGuess] = useState<number>(0.20);
  const [simCorrect, setSimCorrect] = useState<boolean>(true);
  const [simPenalty, setSimPenalty] = useState<number>(0);

  const runVerification = async (mode: 'test-only' | 'full' = 'full') => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/v1/bkt/audit/verify?mode=${mode}`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
      }
      const json: BktVerificationResponse = await res.json();
      setData(json);
    } catch (err) {
      setError((err as Error).message || 'Помилка виконання верифікатора');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runVerification('test-only');
  }, [apiUrl]);

  // Розрахунок інтерактивного симулятора
  const simResult = React.useMemo(() => {
    const p_l = Math.max(0.0001, Math.min(0.9999, simPrior));
    const p_t = simTransit;
    const p_s = simSlip;
    const p_g = simGuess;

    let numerator = 0;
    let denominator = 0;
    let formulaObs = '';

    if (simCorrect) {
      numerator = p_l * (1.0 - p_s);
      denominator = p_l * (1.0 - p_s) + (1.0 - p_l) * p_g;
      formulaObs = `[${p_l.toFixed(4)} * (1 - ${p_s.toFixed(4)})] / [${p_l.toFixed(4)} * (1 - ${p_s.toFixed(4)}) + (1 - ${p_l.toFixed(4)}) * ${p_g.toFixed(4)}]`;
    } else {
      numerator = p_l * p_s;
      denominator = p_l * p_s + (1.0 - p_l) * (1.0 - p_g);
      formulaObs = `[${p_l.toFixed(4)} * ${p_s.toFixed(4)}] / [${p_l.toFixed(4)} * ${p_s.toFixed(4)}) + (1 - ${p_l.toFixed(4)}) * (1 - ${p_g.toFixed(4)})]`;
    }

    const p_obs = denominator > 0 ? numerator / denominator : p_l;
    const rawPosterior = p_obs + (1.0 - p_obs) * p_t;

    let finalPosterior = rawPosterior;
    if (simCorrect && simPenalty > 0 && rawPosterior > p_l) {
      const rawGain = rawPosterior - p_l;
      const penalizedGain = rawGain * (1.0 - simPenalty / 100.0);
      finalPosterior = p_l + penalizedGain;
    }

    const clamped = Math.max(0.0001, Math.min(0.9999, Number(finalPosterior.toFixed(4))));

    return {
      numerator: Number(numerator.toFixed(6)),
      denominator: Number(denominator.toFixed(6)),
      p_obs: Number(p_obs.toFixed(6)),
      rawPosterior: Number(rawPosterior.toFixed(6)),
      finalPosterior: clamped,
      formulaObs,
      delta: Number((clamped - p_l).toFixed(4)),
    };
  }, [simPrior, simTransit, simSlip, simGuess, simCorrect, simPenalty]);

  const handleCopyConsole = () => {
    if (data?.rawOutput) {
      navigator.clipboard.writeText(data.rawOutput);
      setCopiedConsole(true);
      setTimeout(() => setCopiedConsole(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Верхня панель дій та статус */}
      <div className="pb-4 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Математичний Аудит BKT & Автономний Верифікатор</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Пряме виконання Python-верифікатора (`scripts/verify_bkt_math.py`), математичний контроль 10 інваріантів та аудит журналу `logs/event_stream.jsonl`
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => runVerification('test-only')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Запустити 10 еталонних математичних інваріантних тестів BKT"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>10 Еталонних Тестів</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => runVerification('full')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer disabled:opacity-50"
            title="Повний аудит файлу logs/event_stream.jsonl"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>Аудит Журналу Подій</span>
          </button>
        </div>
      </div>

      {/* Помилка якщо виникла */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Метрики останнього аудиту */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Математичне Ядро
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            {data?.success ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm font-bold text-emerald-300">100% ТОЧНІСТЬ</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-sm font-bold text-rose-300">ВІДХИЛЕННЯ</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Інваріанти за Баєсом</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Еталонні Тести
          </span>
          <div className="flex items-baseline gap-1 mt-1 font-mono">
            <span className="text-lg font-bold text-emerald-400">
              {data?.invariant_summary.passed ?? 10}
            </span>
            <span className="text-xs text-slate-500">
              / {data?.invariant_summary.total ?? 10}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Усі 10 сценаріїв</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Журнал Подій (JSONL)
          </span>
          <div className="flex items-baseline gap-1 mt-1 font-mono">
            <span className="text-lg font-bold text-indigo-400">
              {data?.live_audit.total_events ?? 0}
            </span>
            <span className="text-xs text-slate-500">подій у лозі</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            {data?.live_audit.task_events ?? 0} перевірено
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Швидкодія Скрипта
          </span>
          <div className="flex items-baseline gap-1 mt-1 font-mono">
            <span className="text-lg font-bold text-slate-200">
              {data?.executionTimeMs ?? 0}
            </span>
            <span className="text-xs text-slate-500">мс</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 truncate" title={data?.timestamp}>
            {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Готово'}
          </span>
        </div>
      </div>

      {/* 3. Сегментований перемикач вкладок центру верифікації */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800/80 rounded-xl w-fit text-xs select-none">
        <button
          type="button"
          onClick={() => setActiveTab('tests')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'tests'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>10 Інваріантних Тестів ({data?.invariant_summary.passed ?? 10}/10)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('live')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'live'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Аудит Журналу Подій ({data?.live_audit.total_events ?? 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'simulator'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Live Калькулятор BKT</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('console')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'console'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Термінальний Вивід</span>
        </button>
      </div>

      {/* 4. Вміст вкладок */}

      {/* Вкладка 1: 10 Інваріантних тестів */}
      {activeTab === 'tests' && (
        <div className="flex flex-col divide-y divide-slate-800/60 border border-slate-800/60 rounded-xl overflow-hidden bg-slate-900/30">
          <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/60">
            <span className="col-span-1">#</span>
            <span className="col-span-5">Опис сценарію перевірки</span>
            <span className="col-span-2">Параметри (S / G / P(T))</span>
            <span className="col-span-2 text-right">Prior → Posterior</span>
            <span className="col-span-2 text-right">Статус</span>
          </div>

          {(data?.invariant_tests || []).map((t: InvariantTestRecord) => (
            <div
              key={t.id}
              className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-slate-850/40 transition-colors"
            >
              <span className="col-span-1 font-mono text-slate-500">{t.id}</span>
              <div className="col-span-5 flex flex-col">
                <span className="font-medium text-slate-200">{t.name}</span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5 truncate" title={t.formula_obs}>
                  {t.formula_obs}
                </span>
              </div>
              <div className="col-span-2 font-mono text-[11px] text-slate-400">
                S={t.slip.toFixed(2)} | G={t.guess.toFixed(2)}
                {t.hint_penalty_pct > 0 && (
                  <span className="ml-1 text-amber-400 text-[10px]">(-{t.hint_penalty_pct}%)</span>
                )}
              </div>
              <div className="col-span-2 text-right font-mono">
                <span className="text-slate-400">{t.prior.toFixed(4)}</span>
                <span className="text-slate-600 mx-1">→</span>
                <span className={t.posterior >= t.prior ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {t.posterior.toFixed(4)}
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    t.passed
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Вкладка 2: Живий аудит журналу подій */}
      {activeTab === 'live' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-300">
                Файл журналу: <code className="text-indigo-300 font-mono">{data?.live_audit.log_path || 'logs/event_stream.jsonl'}</code>
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">
              Всього подій: <strong className="text-white">{data?.live_audit.total_events ?? 0}</strong> | Оцінювань завдань: <strong className="text-white">{data?.live_audit.task_events ?? 0}</strong>
            </span>
          </div>

          {(data?.live_audit.records || []).length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800/80 rounded-xl text-slate-500 text-xs">
              <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
              <p>Подій TASK_SUBMITTED у журналі поки що немає.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Коли студенти відправлятимуть розв'язки завдань на перевірку, тут з'явиться покроковий аудит із перевіркою дельти розрахунку до 6 знаку.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-800/60 border border-slate-800/60 rounded-xl overflow-hidden bg-slate-900/30">
              <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-900/60">
                <span className="col-span-3">Час / Студент</span>
                <span className="col-span-3">Завдання</span>
                <span className="col-span-2">S / G Used</span>
                <span className="col-span-2 text-right">База → Еталон</span>
                <span className="col-span-2 text-right">Звірка</span>
              </div>

              {(data?.live_audit.records || []).map((r, i) => (
                <div key={i} className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-slate-850/40 transition-colors">
                  <div className="col-span-3 flex flex-col">
                    <span className="font-mono text-slate-300 text-[11px]">
                      {r.timestamp ? new Date(r.timestamp).toLocaleString() : 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate">{r.userId}</span>
                  </div>
                  <span className="col-span-3 font-mono text-indigo-300 truncate">{r.taskId}</span>
                  <span className="col-span-2 font-mono text-[11px] text-slate-400">
                    {r.p_slip.toFixed(2)} / {r.p_guess.toFixed(2)}
                  </span>
                  <div className="col-span-2 text-right font-mono">
                    <span className="text-slate-200 font-bold">{r.posterior_actual.toFixed(4)}</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-emerald-400 font-bold">{r.posterior_expected.toFixed(4)}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        r.is_match
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {r.is_match ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      <span>{r.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Вкладка 3: Інтерактивний Live-симулятор для методиста */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Контролери вводу */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Вхідні параметри BKT для тестування</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Real-time Sandbox</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Апріорна ймовірність P(L_{'{t-1}'}):</span>
                <span className="font-mono text-emerald-400 font-bold">{simPrior.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={simPrior}
                onChange={(e) => setSimPrior(parseFloat(e.target.value))}
                className="accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Транзит знання P(T):</span>
                <span className="font-mono text-emerald-400 font-bold">{simTransit.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.01"
                value={simTransit}
                onChange={(e) => setSimTransit(parseFloat(e.target.value))}
                className="accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Помилка Slip P(S):</span>
                  <span className="font-mono text-rose-400 font-bold">{simSlip.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.40"
                  step="0.01"
                  value={simSlip}
                  onChange={(e) => setSimSlip(parseFloat(e.target.value))}
                  className="accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Вгадування Guess P(G):</span>
                  <span className="font-mono text-indigo-400 font-bold">{simGuess.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  value={simGuess}
                  onChange={(e) => setSimGuess(parseFloat(e.target.value))}
                  className="accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span className="text-slate-400">Результат виконання завдання:</span>
              <div className="flex items-center gap-1 select-none">
                <button
                  type="button"
                  onClick={() => setSimCorrect(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    simCorrect
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  ✅ Правильно (1)
                </button>
                <button
                  type="button"
                  onClick={() => setSimCorrect(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    !simCorrect
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  ❌ Помилка (0)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span className="text-slate-400">Штраф за підказки Сократа:</span>
              <div className="flex items-center gap-1 select-none">
                {[
                  { label: '0%', val: 0 },
                  { label: 'Рівень 1 (-15%)', val: 15 },
                  { label: 'Рівень 2 (-30%)', val: 30 },
                  { label: 'Рівень 3 (-50%)', val: 50 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSimPenalty(item.val)}
                    className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                      simPenalty === item.val
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Результат розрахунку */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between gap-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Покрокова математична розгортка</span>
              </span>
              <span className="font-mono text-emerald-400 text-xs font-bold">
                P(L_t) = {simResult.finalPosterior.toFixed(4)}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1">
                <span className="text-slate-500 font-sans text-[10px]">1. Крок спостереження за Баєсом:</span>
                <span className="text-slate-300 truncate">{simResult.formulaObs}</span>
                <div className="flex justify-between text-slate-400 mt-1 pt-1 border-t border-slate-800/50 text-[10px]">
                  <span>Чисельник: <strong className="text-white">{simResult.numerator}</strong></span>
                  <span>Знаменник: <strong className="text-white">{simResult.denominator}</strong></span>
                  <span>P(L|Obs): <strong className="text-emerald-400">{simResult.p_obs}</strong></span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1">
                <span className="text-slate-500 font-sans text-[10px]">2. Крок переходу знання (Transit):</span>
                <span className="text-slate-300">
                  {simResult.p_obs} + (1 - {simResult.p_obs}) * {simTransit.toFixed(2)} = <strong className="text-indigo-300">{simResult.rawPosterior}</strong>
                </span>
              </div>

              {simPenalty > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-300 flex flex-col gap-0.5">
                  <span className="text-[10px] font-sans">3. Демпфування за Сократівські підказки:</span>
                  <span>Штраф: -{simPenalty}% до чистого приросту знання</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-400 font-sans font-medium">Кінцевий результат:</span>
                <span className="text-lg font-bold text-white font-mono">
                  {(simResult.finalPosterior * 100).toFixed(1)}% ({simResult.finalPosterior.toFixed(4)})
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-sm font-bold">
                {simResult.delta >= 0 ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="w-4 h-4" />
                    +{simResult.delta.toFixed(4)}
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-0.5">
                    <TrendingDown className="w-4 h-4" />
                    {simResult.delta.toFixed(4)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Вкладка 4: Термінальний лог */}
      {activeTab === 'console' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>STDOUT Python Верифікатора</span>
            </span>
            <button
              type="button"
              onClick={handleCopyConsole}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            >
              {copiedConsole ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedConsole ? 'Скопійовано!' : 'Копіювати вивід'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed select-text custom-scrollbar">
            {data?.rawOutput || 'Очікування запуску верифікації...'}
          </pre>
        </div>
      )}
    </div>
  );
};
