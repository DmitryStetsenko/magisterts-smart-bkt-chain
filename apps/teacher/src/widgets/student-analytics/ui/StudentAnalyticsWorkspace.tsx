'use client';

import React from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Copy,
  GitBranch,
  Info,
  Keyboard,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AnomalyTreeWidget, GameSkillTreeWidget, type SkillGraphNode } from '@sbc/ui';
import type { StudentAnalyticsItem } from '@/features/analytics/model/analytics.types';
import { StudentActivityTimelineWidget } from '@/features/analytics/ui/StudentActivityTimelineWidget';
import type { CourseItem } from '@/entities/course';

export interface StudentAnalyticsWorkspaceProps {
  selectedStudent: StudentAnalyticsItem;
  activeCourse: CourseItem;
  studentGraphNodes: SkillGraphNode[];
  activeStudentView: 'metrics' | 'tree' | 'timeline';
  onChangeStudentView: (view: 'metrics' | 'tree' | 'timeline') => void;
  studentIntegrityPolicy: 'STUDENT_CHOICE' | 'FORCED_TRAINING' | 'FORCED_GRADED';
  isUpdatingStudentPolicy: boolean;
  onSetStudentIntegrityPolicy: (policy: 'STUDENT_CHOICE' | 'FORCED_TRAINING' | 'FORCED_GRADED') => void;
  onOpenResetConfirm: (student: StudentAnalyticsItem) => void;
  onOpenMetricModal: (metric: 'bkt' | 'wpm' | 'copypaste' | 'fatigue') => void;
  onNavigateToSkillTask: (skillSlug?: string, taskId?: string | null) => void;
  apiUrl: string;
  liveActivityLogs: any[];
}

/**
 * Основний екран детальної аналітики студента (метрики, BKT, RPG Дерево Знань, хроніка дій, індивідуальна політика режиму).
 */
export const StudentAnalyticsWorkspace: React.FC<StudentAnalyticsWorkspaceProps> = ({
  selectedStudent,
  activeCourse,
  studentGraphNodes,
  activeStudentView,
  onChangeStudentView,
  studentIntegrityPolicy,
  isUpdatingStudentPolicy,
  onSetStudentIntegrityPolicy,
  onOpenResetConfirm,
  onOpenMetricModal,
  onNavigateToSkillTask,
  apiUrl,
  liveActivityLogs,
}) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Clean Borderless Student Toolbar */}
      <div className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-sm font-bold shrink-0">
            {selectedStudent.name ? selectedStudent.name.charAt(0) : 'S'}
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-bold text-white">{selectedStudent.name}</h2>
            <span className="text-xs font-mono text-slate-400">{selectedStudent.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle: Metrics Heatmap vs RPG Skill Tree vs Activity Timeline */}
          <div className="bg-slate-950/60 p-0.5 rounded-lg border border-slate-800/60 flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onChangeStudentView('metrics')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                activeStudentView === 'metrics'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              <span>Аналітика</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeStudentView('tree')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                activeStudentView === 'tree'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              <span>Дерево Знань</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeStudentView('timeline')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                activeStudentView === 'timeline'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Хроніка дій</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenResetConfirm(selectedStudent)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-slate-700/60 hover:border-rose-500/40 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer select-none"
            title="Анулювати всі BKT-оцінки та історію спроб для цього студента"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Скинути прогрес</span>
          </button>
        </div>
      </div>

      {/* 🛡️ Індивідуальна політика режиму проходження для обраного студента */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Режим проходження для <strong className="text-white">{selectedStudent.name}</strong>:
          </span>
        </div>
        <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-950/70 border border-slate-800/70">
          {(
            [
              { id: 'STUDENT_CHOICE', label: 'Вибір студента' },
              { id: 'FORCED_TRAINING', label: 'Тільки тренування' },
              { id: 'FORCED_GRADED', label: 'Суворий (На оцінку)' },
            ] as const
          ).map((opt) => {
            const isActive = studentIntegrityPolicy === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isUpdatingStudentPolicy}
                data-testid={`student-policy-btn-${opt.id}`}
                onClick={() => onSetStudentIntegrityPolicy(opt.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                  isActive
                    ? opt.id === 'FORCED_GRADED'
                      ? 'bg-amber-600 text-white'
                      : opt.id === 'FORCED_TRAINING'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 Dynamic View Mode */}
      {activeStudentView === 'tree' ? (
        <div className="w-full h-[680px] overflow-hidden">
          <GameSkillTreeWidget
            nodes={studentGraphNodes}
            courseTitle={activeCourse.title}
            studentName={selectedStudent.name}
            role="teacher"
            adjustments={selectedStudent.recentAdjustments || []}
            showInspector={true}
            onSelectSkill={(slug) => onNavigateToSkillTask(slug, null)}
          />
        </div>
      ) : activeStudentView === 'timeline' ? (
        <StudentActivityTimelineWidget
          studentId={selectedStudent.id || 'demo-student'}
          studentName={selectedStudent.name}
          apiUrl={apiUrl}
          incomingLogs={liveActivityLogs}
        />
      ) : (
        <>
          {/* Clean Student Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-medium uppercase text-slate-400">
                  Середня Майстерність P(L)
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <div className="flex items-baseline justify-between mt-0.5">
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  {selectedStudent.averageMastery !== undefined
                    ? `${(selectedStudent.averageMastery * 100).toFixed(1)}%`
                    : '0.0%'}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenMetricModal('bkt')}
                  className="text-[10px] text-slate-400 hover:text-indigo-300 cursor-pointer flex items-center gap-0.5"
                >
                  <Info className="w-3 h-3" />
                  <span>Формула</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-medium uppercase text-slate-400">Медіана WPM (Курс)</span>
                <Keyboard className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              </div>
              <div className="flex items-baseline justify-between mt-0.5">
                <div className="text-xl font-bold text-indigo-400 font-mono">
                  {selectedStudent.wpm ?? selectedStudent.avgWpm ?? 0}{' '}
                  <span className="text-[10px] font-normal text-slate-400">WPM</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenMetricModal('wpm')}
                  className="text-[10px] text-slate-400 hover:text-indigo-300 cursor-pointer flex items-center gap-0.5"
                >
                  <Info className="w-3 h-3" />
                  <span>Розрахунок</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between gap-1.5">
              <div className="flex items-start justify-between gap-1">
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium uppercase text-slate-400">Медіана Copy-Paste</span>
                  {selectedStudent.peakAnomaly?.hasAnomaly && (
                    <span className="text-[9px] text-red-400 mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                      <span>
                        Пік: {selectedStudent.peakAnomaly.peakSkillTitle || selectedStudent.peakAnomaly.peakSkillSlug} (
                        {(selectedStudent.peakAnomaly.copyPasteRatio * 100).toFixed(0)}%)
                      </span>
                    </span>
                  )}
                </div>
                <Copy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </div>
              <div className="flex items-baseline justify-between mt-0.5">
                <div className="text-xl font-bold text-amber-400 font-mono">
                  {selectedStudent.copyPasteRatio !== undefined
                    ? `${(selectedStudent.copyPasteRatio * 100).toFixed(0)}%`
                    : '0%'}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenMetricModal('copypaste')}
                  className="text-[10px] text-slate-400 hover:text-indigo-300 cursor-pointer flex items-center gap-0.5"
                >
                  <Info className="w-3 h-3" />
                  <span>Аналіз</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-medium uppercase text-slate-400">Медіана Втоми</span>
                <Activity className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              </div>
              <div className="flex items-baseline justify-between mt-0.5">
                <div className="text-xl font-bold text-purple-400 font-mono">
                  {selectedStudent.fatigueIndex ?? 0}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenMetricModal('fatigue')}
                  className="text-[10px] text-slate-400 hover:text-indigo-300 cursor-pointer flex items-center gap-0.5"
                >
                  <Info className="w-3 h-3" />
                  <span>Пояснення</span>
                </button>
              </div>
            </div>
          </div>

          {selectedStudent.recentAdjustments && selectedStudent.recentAdjustments.length > 0 && (
            <AnomalyTreeWidget
              adjustments={selectedStudent.recentAdjustments}
              nodes={studentGraphNodes}
              title="Дерево Аномалій та Когнітивних Відхилень"
              subtitle="Ієрархічний огляд інцидентів студента за категоріями, навичками та запитаннями"
              onNavigateToTask={(taskId, skillSlug) => onNavigateToSkillTask(skillSlug, taskId)}
            />
          )}

          <div className="flex flex-col gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <span>BKT Mastery Breakdown & Модульна Телеметрія</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Per-Module Telemetry Level</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {activeCourse.skillSlugs.map((slug) => {
                const masteryMap = selectedStudent.bktBySkill || selectedStudent.skillMastery || {};
                const p = masteryMap[slug] ?? 0;
                const isMastered = p >= 0.95;
                const skillTelemetry = selectedStudent.telemetryBySkill?.[slug];
                const isPeakAnomaly = skillTelemetry && skillTelemetry.copyPasteRatio >= 0.6;

                return (
                  <div
                    key={slug}
                    className={`p-3 bg-slate-900/40 border rounded-lg flex flex-col gap-1.5 transition-all ${
                      isPeakAnomaly ? 'border-red-500/50 bg-red-950/15' : 'border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-200 font-semibold truncate flex items-center gap-1.5">
                        <span>{slug}</span>
                        {isPeakAnomaly && <span className="text-[9px] font-medium text-red-400">⚠️ Списування</span>}
                      </span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          isMastered ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {(p * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isMastered ? 'bg-emerald-400' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(100, p * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                      <span>
                        WPM: <strong className="text-slate-200">{skillTelemetry ? skillTelemetry.wpm : 0}</strong>
                      </span>
                      <span>
                        Copy-Paste:{' '}
                        <strong className={isPeakAnomaly ? 'text-red-400 font-bold' : 'text-slate-200'}>
                          {skillTelemetry ? `${(skillTelemetry.copyPasteRatio * 100).toFixed(0)}%` : '0%'}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
