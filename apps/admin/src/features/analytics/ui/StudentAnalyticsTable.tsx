'use client';

import React from 'react';
import { Users, Activity, Zap, AlertTriangle } from 'lucide-react';
import { StudentAnalyticsItem } from '../model/analytics.types';

interface StudentAnalyticsTableProps {
  students: StudentAnalyticsItem[];
  skillSlugs: string[];
}

export const StudentAnalyticsTable: React.FC<StudentAnalyticsTableProps> = ({
  students,
  skillSlugs,
}) => {
  const getMasteryColor = (pMastery: number) => {
    if (pMastery >= 0.95) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (pMastery >= 0.5) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400">
          <Users className="w-5 h-5" />
          <h3 className="font-bold text-white text-lg">Аналітика Студентів & BKT Heatmap</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Всього студентів: {students.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-800">
            <tr>
              <th className="p-3">Студент</th>
              {skillSlugs.map((slug) => (
                <th key={slug} className="p-3 text-center">
                  {slug} P(L)
                </th>
              ))}
              <th className="p-3 text-center">Середній WPM</th>
              <th className="p-3 text-center">Copy-Paste Ratio</th>
              <th className="p-3 text-center">Індекс Втоми</th>
              <th className="p-3 text-right">Останній вхід</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {students.map((student) => (
              <tr key={student.studentId} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3 font-sans">
                  <div className="font-bold text-white">{student.name}</div>
                  <div className="text-[11px] text-slate-400">{student.email}</div>
                </td>

                {/* Skill Mastery Heatmap Cells */}
                {skillSlugs.map((slug) => {
                  const p = student.skillMastery[slug] ?? 0;
                  return (
                    <td key={slug} className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-bold ${getMasteryColor(
                          p
                        )}`}
                      >
                        {(p * 100).toFixed(0)}%
                      </span>
                    </td>
                  );
                })}

                <td className="p-3 text-center font-bold text-indigo-300">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{student.avgWpm} WPM</span>
                  </div>
                </td>

                <td className="p-3 text-center font-bold">
                  <span
                    className={
                      student.copyPasteRatio > 0.3 ? 'text-rose-400 font-bold' : 'text-slate-300'
                    }
                  >
                    {(student.copyPasteRatio * 100).toFixed(0)}%
                  </span>
                </td>

                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {student.fatigueIndex > 0.6 ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span
                      className={
                        student.fatigueIndex > 0.6 ? 'text-amber-400 font-bold' : 'text-emerald-400'
                      }
                    >
                      {(student.fatigueIndex * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>

                <td className="p-3 text-right text-slate-500 text-[11px]">
                  {student.lastActive}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
