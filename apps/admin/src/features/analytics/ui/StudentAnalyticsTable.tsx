'use client';

import React, { useState } from 'react';
import { Users, Activity, Zap, AlertTriangle, RotateCcw } from 'lucide-react';
import { StudentAnalyticsItem } from '../model/analytics.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface StudentAnalyticsTableProps {
  students: StudentAnalyticsItem[];
  skillSlugs: string[];
  onResetStudent?: (studentId: string) => void;
}

export const StudentAnalyticsTable: React.FC<StudentAnalyticsTableProps> = ({
  students,
  skillSlugs,
  onResetStudent,
}) => {
  const [resettingId, setResettingId] = useState<string | null>(null);

  const getMasteryColor = (pMastery: number) => {
    if (pMastery >= 0.95) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (pMastery >= 0.5) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  const handleReset = async (studentId: string) => {
    if (!confirm('Ви дійсно бажаєте анулювати всі результати BKT та історію спроб для цього студента?')) return;
    setResettingId(studentId);
    try {
      const res = await fetch(`${API_URL}/api/v1/bkt/reset/${studentId}`, { method: 'POST' });
      if (res.ok) {
        if (onResetStudent) onResetStudent(studentId);
      }
    } catch (err) {
      console.error('Error resetting student BKT state:', err);
    } finally {
      setResettingId(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400">
          <Users className="w-5 h-5" />
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span>Аналітика Студентів & BKT Heatmap</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Експериментально
            </span>
          </h3>
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
              <th className="p-3 text-right">Дії</th>
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

                <td className="p-3 text-right">
                  <button
                    onClick={() => handleReset(student.studentId)}
                    disabled={resettingId === student.studentId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                    title="Анулювати всі результати BKT та історію спроб"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${resettingId === student.studentId ? 'animate-spin' : ''}`} />
                    <span>Анулювати</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
