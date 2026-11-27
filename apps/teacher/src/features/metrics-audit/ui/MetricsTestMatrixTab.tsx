'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Globe, ShieldCheck } from 'lucide-react';
import { Badge } from '@sbc/ui';
import type { GoldStandardTestItem } from '../model/bktMath';

export interface MetricsTestMatrixTabProps {
  testMatrix: GoldStandardTestItem[];
  totalPass: number;
}

/**
 * Автоматизована матриця верифікації 6 еталонних бізнес-правил BKT.
 */
export const MetricsTestMatrixTab: React.FC<MetricsTestMatrixTabProps> = ({ testMatrix, totalPass }) => {
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
            Автоматизована верифікація ядрових бізнес-правил моделі BKT (не прив&apos;язана до одного учня)
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Еталонні Тестові Сценарії (Automated Gold Standard Matrix)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Автоматичний набір із {testMatrix.length} критичних бізнес-правил моделі BKT. Перевіряє захист від
            вгадування, аномальний копіпаст, штрафи за підказки та пороги Блума.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white">Усі тести пройдені:</span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {totalPass} / {testMatrix.length}
          </span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Код</th>
                <th className="py-3 px-4">Назва тесту</th>
                <th className="py-3 px-4">Сценарій</th>
                <th className="py-3 px-4">Очікувана поведінка</th>
                <th className="py-3 px-4">Фактичний результат</th>
                <th className="py-3 px-4 text-center">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sbc-zebra-list">
              {testMatrix.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-purple-400">{item.id}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{item.title}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{item.scenario}</td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">{item.expected}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-300">{item.actual}</td>
                  <td className="py-3.5 px-4 text-center">
                    {item.pass ? (
                      <Badge variant="success" size="xs" mono icon={<CheckCircle2 className="w-3 h-3" />}>
                        PASS
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="xs" mono icon={<AlertTriangle className="w-3 h-3" />}>
                        FAIL
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
