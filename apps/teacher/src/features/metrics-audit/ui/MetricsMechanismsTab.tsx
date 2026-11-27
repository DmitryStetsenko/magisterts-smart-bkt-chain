'use client';

import React from 'react';
import { Compass, Globe, Lightbulb, ShieldCheck, Sliders, Zap } from 'lucide-react';

/**
 * Централізований нормативний довідник усіх 14 адаптивних, поведінкових та педагогічних механізмів платформи.
 */
export const MetricsMechanismsTab: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>ЗАГАЛЬНОСИСТЕМНИЙ ІНСТРУМЕНТ</span>
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300 font-medium">
            Централізований нормативний довідник усіх 14 правил, коефіцієнтів та алгоритмічних захистів платформи
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
              <span>Реєстр Адаптивних, Поведінкових та Педагогічних Механізмів</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Standard v3.0
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Повний систематизований каталог усіх математичних інваріантів, фільтрів поведінкової телеметрії,
              сократівських підказок та захистів від зациклення платформи Smart-BKT-Chain.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold text-slate-200">14 Активних Механізмів у Системі</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">1. Адаптивне Спрощення &amp; Ремедіація</h3>
                <span className="text-[10px] text-slate-400 font-mono">Graceful Degradation Core</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
              3 правила
            </span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">
                  1.1 Пропозиція допоміжного рівня (Degradation Prompt)
                </strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Max: 70%
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                При помилках на рівні <code className="text-purple-300">MEDIUM/HARD</code> з&apos;являється інтерактивна плашка
                переходу на допоміжне завдання <code className="text-amber-300">EASY</code>. Завдання отримує стелю оцінки
                70% для збереження мотивації та балансу знань.
              </p>
              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                <span>Тригер:</span>
                <span className="text-slate-300">consecutiveFailures ≥ 1 або REJECTED</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">
                  1.2 Захист від зациклення (excludeTaskId)
                </strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Anti-Loop
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                При переході на легший рівень секвенсор примусово виключає поточне завдання, на якому студент щойно
                помилився, унеможливлюючи повторну видачу тієї самої умови.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">1.3 Триступенева ієрархія підбору бліців</strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Fallback Hierarchy
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Секвенсор шукає: 1) інший <code className="text-indigo-300">EASY</code> тієї ж теми -&gt; 2) інший{' '}
                <code className="text-indigo-300">EASY</code> активного модуля -&gt; 3) ремедіаційне повторення
                (Remediation Review Drill).
              </p>
            </div>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">2. Підказки Сократа &amp; Just-in-Time Теорія</h3>
                <span className="text-[10px] text-slate-400 font-mono">Pedagogical Scaffolding</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              4 правила
            </span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">
                  2.1 Умовне розкриття (Conditional Scaffolding)
                </strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Clean Start
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                На чистій першій спробі підказки та deep-link приховані від студента (захист від спойлерів). З&apos;являються
                м&apos;яко <span className="text-white font-semibold">виключно у момент першої помилки</span> як рятувальне
                коло.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">
                  2.2 Двохетапні підказки Сократа (Socratic Hints)
                </strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  -15% / -30%
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Навідні запитання без готових відповідей. Рівень 1 (концептуальний вектор) знижує бал на{' '}
                <code className="text-amber-300 font-bold">-15%</code>, Рівень 2 (конкретизація правила) — на{' '}
                <code className="text-amber-300 font-bold">-30%</code>.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">
                  2.3 Study App Deep-Linking (Just-in-Time Theory)
                </strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Micro-Theory
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Пряме посилання на інтерактивний урок/параграф у Навчальному Застосунку (
                <code className="text-indigo-300 font-mono">/learn/js-dev/...</code>), щоб студент міг опрацювати тему перед
                повторним розв&apos;язанням.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">2.4 Ізоморфні бліци та життєві метафори</strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  3 варіанти/тему
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Кожен мікро-концепт має: 1) академічний тест, 2) життєву метафору (опломбований контейнер, ксерокопія,
                запобіжник), 3) синтаксичний патерн «Що якщо?».
              </p>
            </div>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">3. Поведінкова Телеметрія &amp; Adjuster</h3>
                <span className="text-[10px] text-slate-400 font-mono">Dynamic Slip &amp; Guess</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              4 фільтри
            </span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">
                  3.1 Захист від швидкого вгадування (Rapid Guessing)
                </strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  G↑ 0.85
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Якщо в тестах з вибором правильна відповідь надана швидше ніж за{' '}
                <code className="text-amber-300">3.5 с</code>, параметр P(G) підвищується до{' '}
                <code className="text-amber-300 font-bold">0.85</code>, що демпфує зростання рейтингу знань ΔP(L).
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">
                  3.2 Захист від описки сильного студента (Careless Slip)
                </strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  S↑ 0.30
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                При P(L) ≥ 0.70 та чистій швидкості без видалень помилка трактується як випадкова механічна похибка.
                P(S) підвищується до <code className="text-emerald-300 font-bold">0.30</code>, пом&apos;якшуючи падіння знань.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">
                  3.3 Детекція копіпасту у відкритих відповідях (Paste Guard)
                </strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  G↑ 0.90
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                У завданнях <code className="text-rose-300">TEXT_ESSAY/OPEN_TEXT</code> події вставки тексту (
                <code className="text-rose-300 font-mono">pasteEvents &gt; 0</code>) або аномальний темп (&gt; 120 WPM)
                піднімають P(G) до <code className="text-rose-300 font-bold">0.90</code>.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">
                  3.4 Детекція хаотичного набору (Chaotic Editing)
                </strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  S↓ 0.05
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Велика частка видалень (&gt; 40%) або численні довгі паузи при низькому P(L) ≤ 0.30 знижують P(S) до{' '}
                <code className="text-cyan-300 font-bold">0.05</code>, фіксуючи реальну прогалину в знаннях.
              </p>
            </div>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">4. Математика BKT &amp; Пороги Блума</h3>
                <span className="text-[10px] text-slate-400 font-mono">Mastery Learning Thresholds</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              3 стандарти
            </span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">
                  4.1 Крок навчання навіть при помилці (P(T) = 0.20)
                </strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Learning Step
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                У формулі транзиту <code className="text-indigo-300 font-mono">P(Lt) = P(L|Obs) + (1 - P(L|Obs)) * P(T)</code>{' '}
                фактор P(T) = 0.20 гарантує, що студент отримує приріст знань за рахунок опрацювання помилки та
                вивчення зворотного зв&apos;язку.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">
                  4.2 Поріг розблокування вершин графа (Bloom Proficient)
                </strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  P(L) ≥ 75%
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Досягнення рівня P(L) ≥ 0.75 свідчить про впевнену компетентність (рівень «Застосування» Блума) та
                відкриває доступ до залежних тем у DAG графа знань.
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-white text-[12px] font-bold">4.3 Золота майстерність теми (Gold Mastery)</strong>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  P(L) ≥ 90%
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Повний тріумф над навичкою. Тема отримує статус засвоєної, студент допускається до фінального
                бліц-тесту модуля, а система переводить фокус на нові незвідані вузли.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
