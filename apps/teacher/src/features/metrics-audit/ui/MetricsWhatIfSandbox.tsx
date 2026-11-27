'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Globe,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { DropdownSelect } from '@sbc/ui';
import { computeBktMath } from '../model/bktMath';

/**
 * Ізольована математична пісочниця "What-If" для моделювання кроку BKT без зміни БД.
 */
export const MetricsWhatIfSandbox: React.FC = () => {
  const [simPriorL, setSimPriorL] = useState<number>(0.5);
  const [simTransit, setSimTransit] = useState<number>(0.2);
  const [simSlip, setSimSlip] = useState<number>(0.1);
  const [simGuess, setSimGuess] = useState<number>(0.2);
  const [simIsCorrect, setSimIsCorrect] = useState<boolean>(true);
  const [simTaskType, setSimTaskType] = useState<string>('SINGLE_CHOICE');
  const [simReactionMs, setSimReactionMs] = useState<number>(1200);
  const [simPasteEvents, setSimPasteEvents] = useState<number>(0);
  const [simTypingWpm, setSimTypingWpm] = useState<number>(45);
  const [simHintsCount, setSimHintsCount] = useState<number>(0);

  const simResult = useMemo(
    () =>
      computeBktMath({
        priorL: simPriorL,
        pTransit: simTransit,
        pSlip: simSlip,
        pGuess: simGuess,
        isCorrect: simIsCorrect,
        taskType: simTaskType,
        reactionLatencyMs: simReactionMs,
        pasteEvents: simPasteEvents,
        typingWpm: simTypingWpm,
        socraticHintsCount: simHintsCount,
      }),
    [
      simPriorL,
      simTransit,
      simSlip,
      simGuess,
      simIsCorrect,
      simTaskType,
      simReactionMs,
      simPasteEvents,
      simTypingWpm,
      simHintsCount,
    ],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>ЗАГАЛЬНОСИСТЕМНИЙ ІНСТРУМЕНТ</span>
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300 font-medium">
            Пісочниця &quot;What-If&quot; не змінює базу даних і працює ізольовано як математичний тренажер
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Параметри Симуляції (Вхідні Дані)</span>
            </h3>
            <button
              onClick={() => {
                setSimPriorL(0.5);
                setSimTransit(0.2);
                setSimSlip(0.1);
                setSimGuess(0.2);
                setSimIsCorrect(true);
                setSimTaskType('SINGLE_CHOICE');
                setSimReactionMs(1200);
                setSimPasteEvents(0);
                setSimTypingWpm(45);
                setSimHintsCount(0);
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Скинути за замовчуванням</span>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Апріорна майстерність P(L_{`t-1`})</span>
              <span className="text-purple-400 font-mono font-bold">
                {(simPriorL * 100).toFixed(0)}% ({simPriorL.toFixed(2)})
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.99"
              step="0.01"
              value={simPriorL}
              onChange={(e) => setSimPriorL(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-400">P(T) Транзит</span>
                <span className="text-indigo-400 font-mono">{simTransit.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.50"
                step="0.01"
                value={simTransit}
                onChange={(e) => setSimTransit(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-400">P(S) Вислизання</span>
                <span className="text-amber-400 font-mono">{simSlip.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.40"
                step="0.01"
                value={simSlip}
                onChange={(e) => setSimSlip(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-400">P(G) Вгадування</span>
                <span className="text-cyan-400 font-mono">{simGuess.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.50"
                step="0.01"
                value={simGuess}
                onChange={(e) => setSimGuess(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Результат відповіді</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSimIsCorrect(true)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    simIsCorrect
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  ✓ ПРАВИЛЬНО
                </button>
                <button
                  onClick={() => setSimIsCorrect(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !simIsCorrect
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  ✗ ПОМИЛКА
                </button>
              </div>
            </div>

                <div className="flex flex-col gap-1.5">
                  <DropdownSelect
                    label="Тип завдання"
                    fullWidth
                    size="md"
                    value={simTaskType}
                    onChange={(val) => setSimTaskType(val)}
                    options={[
                      { value: 'SINGLE_CHOICE', label: 'SINGLE_CHOICE (Тест з 1 вибором)' },
                      { value: 'MULTIPLE_CHOICE', label: 'MULTIPLE_CHOICE (Кілька виборів)' },
                      { value: 'CODE', label: 'CODE (Інтерактивний код / Monaco)' },
                      { value: 'TEXT_ESSAY', label: 'TEXT_ESSAY (Відкрита відповідь)' },
                    ]}
                  />
                </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Поведінкова Телеметрія для цього завдання</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Час відповіді</span>
                  <strong className="text-amber-400 font-mono">{(simReactionMs / 1000).toFixed(1)} с</strong>
                </span>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="100"
                  value={simReactionMs}
                  onChange={(e) => setSimReactionMs(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[9px] text-slate-500">Поріг вгадування: &lt; 3.5 с</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Вставки з буфера (Paste)</span>
                  <strong className="text-rose-400 font-mono">{simPasteEvents}</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={simPasteEvents}
                  onChange={(e) => setSimPasteEvents(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className="text-[9px] text-slate-500">&gt; 0 викликає G↑ 0.90</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Підказки Сократа</span>
                  <strong className="text-purple-400 font-mono">{simHintsCount}</strong>
                </span>
                <div className="flex items-center gap-1 mt-1">
                  {[0, 1, 2].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setSimHintsCount(cnt)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        simHintsCount === cnt
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cnt === 0 ? 'Без' : `${cnt} (-${cnt === 1 ? 15 : 30}%)`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Результат Розрахунку BKT</span>
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  simResult.masteryStatus === 'GOLD_MASTERY'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : simResult.masteryStatus === 'PROFICIENT'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {simResult.masteryStatus}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Нова ймовірність знань P(L_t)
                </span>
                <div className="text-3xl font-black text-white font-mono flex items-baseline gap-2 mt-0.5">
                  <span className="text-emerald-400">{(simResult.posteriorL * 100).toFixed(1)}%</span>
                  <span className="text-xs font-semibold text-slate-400">({simResult.posteriorL})</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Динаміка ΔP(L)</span>
                <span className={`text-xl font-black font-mono ${simResult.deltaL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simResult.deltaL >= 0 ? `+${simResult.deltaL}` : simResult.deltaL}
                </span>
              </div>
            </div>

            {simResult.reasons.length > 0 ? (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Динамічні поведінкові прапорці:</span>
                </span>
                <div className="flex flex-col gap-1">
                  {simResult.reasons.map((r, ri) => (
                    <div key={ri} className="text-[11px] font-mono text-amber-200">
                      • {r}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Чиста відповідь без поведінкових аномалій (базові параметри).</span>
              </div>
            )}

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2 font-mono text-xs">
              <div className="text-[11px] text-purple-300 font-bold border-b border-slate-800 pb-1">
                Числова підстановка у формулу Баєса:
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Правдоподібність P(L|Obs):</span>
                <strong className="text-white">{simResult.pObs.toFixed(4)}</strong>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Транзит знань P(T):</span>
                <strong className="text-indigo-400">+{simResult.pTransit}</strong>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Ефективний Slip / Guess:</span>
                <strong className="text-amber-300">
                  S={simResult.pSlipEffective} | G={simResult.pGuessEffective}
                </strong>
              </div>

              {simResult.socraticHintPenaltyApplied ? (
                <div className="flex justify-between text-[11px] text-rose-300 border-t border-slate-800 pt-1">
                  <span>Штраф за підказки Сократа:</span>
                  <strong>-{simResult.socraticHintPenaltyApplied}%</strong>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3 text-xs text-purple-200 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Педагогічний висновок алгоритму:</strong>
              {simResult.masteryStatus === 'GOLD_MASTERY' &&
                'Студент повністю засвоїв навичку (>= 90%). Рекомендується перехід до викликів підвищеної складності або бліц-тесту.'}
              {simResult.masteryStatus === 'PROFICIENT' &&
                'Студент досяг порогу компетентності Блума (>= 75%). Залежні теми у графі знань успішно розблоковані.'}
              {simResult.masteryStatus === 'IN_PROGRESS' &&
                (simIsCorrect
                  ? 'Знання збільшились, але навичка потребує додаткового закріплення до досягнення 75%.'
                  : 'Помилка зафіксована. Наступне завдання буде згенеровано у менш складному або варіативному форматі.')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
