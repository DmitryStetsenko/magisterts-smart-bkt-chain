'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Compass,
  Globe,
  Minus,
  Network,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import { ThemeSettingsSection } from '@sbc/ui';
import type { TaskDto } from '@sbc/types';
import type { StudentAnalyticsItem } from '@/features/analytics/model/analytics.types';

export type TeacherTab = 'analytics' | 'coursemap' | 'reviews' | 'classrooms' | 'metrics-audit' | 'settings';
export type CohortFilter = 'all' | 'mastery' | 'proficient' | 'basic' | 'at_risk' | 'anomalies';
export type AuditSubTab = 'live-log' | 'what-if' | 'test-matrix' | 'mechanisms';

export interface TeacherSidebarDrawerProps {
  activeTab: TeacherTab;
  students: StudentAnalyticsItem[];
  filteredStudents: StudentAnalyticsItem[];
  cohortMasteryStudents: StudentAnalyticsItem[];
  cohortProficientStudents: StudentAnalyticsItem[];
  cohortBasicStudents: StudentAnalyticsItem[];
  cohortAtRiskStudents: StudentAnalyticsItem[];
  riskFeedStudents: StudentAnalyticsItem[];
  cohortFilter: CohortFilter;
  onSetCohortFilter: React.Dispatch<React.SetStateAction<CohortFilter>>;
  studentSearch: string;
  onSetStudentSearch: (val: string) => void;
  selectedStudentId: string | null;
  onSelectStudentId: (id: string) => void;
  courseDetails: any;
  allTasks: TaskDto[];
  selectedSkillSlug: string | null;
  onSelectTaskId: (taskId: string) => void;
  reviewFilterTab: 'pending' | 'reviewed';
  onSetReviewFilterTab: (tab: 'pending' | 'reviewed') => void;
  reviewQueue: any[];
  selectedReviewId: string | null;
  onSelectReviewId: (id: string) => void;
  auditSubTab: AuditSubTab;
  onSetAuditSubTab: (tab: AuditSubTab) => void;
}

/**
 * Бічна панель кабінету викладача (аналітика когорти, граф курсу, черга перевірки, класи, аудит BKT, налаштування).
 */
export const TeacherSidebarDrawer: React.FC<TeacherSidebarDrawerProps> = ({
  activeTab,
  students,
  filteredStudents,
  cohortMasteryStudents,
  cohortProficientStudents,
  cohortBasicStudents,
  cohortAtRiskStudents,
  riskFeedStudents,
  cohortFilter,
  onSetCohortFilter,
  studentSearch,
  onSetStudentSearch,
  selectedStudentId,
  onSelectStudentId,
  courseDetails,
  allTasks,
  selectedSkillSlug,
  onSelectTaskId,
  reviewFilterTab,
  onSetReviewFilterTab,
  reviewQueue,
  selectedReviewId,
  onSelectReviewId,
  auditSubTab,
  onSetAuditSubTab,
}) => {
  const [isCohortDistributionOpen, setIsCohortDistributionOpen] = useState(false);
  const [isRiskFeedOpen, setIsRiskFeedOpen] = useState(false);
  const [isFilteredRosterOpen, setIsFilteredRosterOpen] = useState(true);
  const [isTriadAuditOpen, setIsTriadAuditOpen] = useState(true);
  const [isCognitiveTrapsOpen, setIsCognitiveTrapsOpen] = useState(false);
  const [isAdaptiveParamsOpen, setIsAdaptiveParamsOpen] = useState(false);
  const [isGeneralToolsOpen, setIsGeneralToolsOpen] = useState(false);
  const [isStudentsListOpen, setIsStudentsListOpen] = useState(true);

  if (activeTab === 'analytics') {
    return (
      <div className="flex flex-col divide-y divide-slate-800/70">
        {/* 📊 Section 1: Cohort Mastery Distribution */}
        <div className="pb-3 flex flex-col gap-2">
          <button
            onClick={() => setIsCohortDistributionOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              <span>Розподіл Групи</span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">({students.length})</span>
            </span>
            <span className="text-slate-500 group-hover:text-white">
              {isCohortDistributionOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </span>
          </button>

          {isCohortDistributionOpen && (
            <div className="flex flex-col gap-2 animate-fadeIn">
              <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden flex">
                <div
                  style={{ width: `${students.length ? (cohortMasteryStudents.length / students.length) * 100 : 0}%` }}
                  className="bg-amber-400 transition-all"
                  title={`Mastery: ${cohortMasteryStudents.length}`}
                />
                <div
                  style={{ width: `${students.length ? (cohortProficientStudents.length / students.length) * 100 : 0}%` }}
                  className="bg-emerald-500 transition-all"
                  title={`Proficient: ${cohortProficientStudents.length}`}
                />
                <div
                  style={{ width: `${students.length ? (cohortBasicStudents.length / students.length) * 100 : 0}%` }}
                  className="bg-blue-500 transition-all"
                  title={`Basic: ${cohortBasicStudents.length}`}
                />
                <div
                  style={{ width: `${students.length ? (cohortAtRiskStudents.length / students.length) * 100 : 0}%` }}
                  className="bg-rose-500 transition-all"
                  title={`At Risk: ${cohortAtRiskStudents.length}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onSetCohortFilter((prev) => (prev === 'mastery' ? 'all' : 'mastery'))}
                  className={`py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between text-xs select-none ${
                    cohortFilter === 'mastery'
                      ? 'bg-amber-500/15 text-amber-300 font-medium'
                      : 'hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <span className="text-[11px] text-amber-400 inline-flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 shrink-0" />
                    <span>Mastery</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-200">{cohortMasteryStudents.length}</span>
                </button>

                <button
                  onClick={() => onSetCohortFilter((prev) => (prev === 'proficient' ? 'all' : 'proficient'))}
                  className={`py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between text-xs select-none ${
                    cohortFilter === 'proficient'
                      ? 'bg-emerald-500/15 text-emerald-300 font-medium'
                      : 'hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <span className="text-[11px] text-emerald-400 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Proficient</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-200">{cohortProficientStudents.length}</span>
                </button>

                <button
                  onClick={() => onSetCohortFilter((prev) => (prev === 'basic' ? 'all' : 'basic'))}
                  className={`py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between text-xs select-none ${
                    cohortFilter === 'basic'
                      ? 'bg-blue-500/15 text-blue-300 font-medium'
                      : 'hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <span className="text-[11px] text-blue-400 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span>Basic</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-200">{cohortBasicStudents.length}</span>
                </button>

                <button
                  onClick={() => onSetCohortFilter((prev) => (prev === 'at_risk' ? 'all' : 'at_risk'))}
                  className={`py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between text-xs select-none ${
                    cohortFilter === 'at_risk'
                      ? 'bg-rose-500/15 text-rose-300 font-medium'
                      : 'hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <span className="text-[11px] text-rose-400 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>At Risk</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-200">{cohortAtRiskStudents.length}</span>
                </button>
              </div>

              {cohortFilter !== 'all' && (
                <button
                  onClick={() => onSetCohortFilter('all')}
                  className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors text-right cursor-pointer"
                >
                  ✕ Скинути фільтр
                </button>
              )}
            </div>
          )}
        </div>

        {/* 🚨 Section 2: Live Risk Feed */}
        <div className="py-3 flex flex-col gap-2">
          <button
            onClick={() => setIsRiskFeedOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Радар Ризиків</span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">({riskFeedStudents.length})</span>
            </span>
            <span className="text-slate-500 group-hover:text-white">
              {isRiskFeedOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </span>
          </button>

          {isRiskFeedOpen && (
            <div className="flex flex-col divide-y divide-slate-800/50 animate-fadeIn">
              {riskFeedStudents.length === 0 ? (
                <div className="py-2 text-xs text-slate-500">✓ Аномалій не зафіксовано</div>
              ) : (
                riskFeedStudents.slice(0, 3).map((st) => {
                  const stId = st.id || st.studentId || st.email;
                  const isCopyPaste = (st.copyPasteRatio ?? 0) >= 0.6;
                  const isGuess =
                    st.hasGuessAlert || (st.recentAdjustments?.some((a) => (a.pGuessUsed ?? 0) > 0.3) ?? false);
                  const isFatigue = (st.fatigueIndex ?? 0) >= 5;

                  return (
                    <div
                      key={`risk-${stId}`}
                      onClick={() => onSelectStudentId(stId)}
                      className="py-2 px-1.5 hover:bg-slate-800/40 rounded transition-colors cursor-pointer flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200 truncate max-w-[170px]">{st.name}</span>
                        <span className="text-[10px] font-mono text-amber-400">
                          {((st.averageMastery ?? 0) * 100).toFixed(0)}% P(L)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                        {isCopyPaste && (
                          <span className="text-rose-400">Copy {((st.copyPasteRatio ?? 0) * 100).toFixed(0)}%</span>
                        )}
                        {isGuess && <span className="text-amber-400">P(G) Вгадування</span>}
                        {isFatigue && <span className="text-purple-400">Втома F={st.fatigueIndex}</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 🔍 Section 3: Filtered Students Roster */}
        <div className="pt-3 flex flex-col gap-2">
          <button
            onClick={() => setIsFilteredRosterOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Список Учнів</span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">({filteredStudents.length})</span>
            </span>
            <span className="text-slate-500 group-hover:text-white">
              {isFilteredRosterOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </span>
          </button>

          {isFilteredRosterOpen && (
            <div className="flex flex-col gap-2 animate-fadeIn">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Пошук серед учнів..."
                  value={studentSearch}
                  onChange={(e) => onSetStudentSearch(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col divide-y divide-slate-800/50 max-h-60 overflow-y-auto pr-0.5">
                {filteredStudents.length === 0 ? (
                  <div className="py-3 text-center text-xs text-slate-500">Учнів не знайдено</div>
                ) : (
                  filteredStudents.map((st) => {
                    const stId = st.id || st.studentId || st.email;
                    const isSelected = selectedStudentId === stId;
                    const avgMastery = st.averageMastery !== undefined ? (st.averageMastery * 100).toFixed(0) : '0';

                    return (
                      <div
                        key={stId}
                        onClick={() => onSelectStudentId(stId)}
                        className={`py-2 px-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-2 select-none ${
                          isSelected ? 'bg-slate-800/60 ring-1 ring-purple-500/30 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="text-xs font-medium truncate flex items-center gap-1.5">
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />}
                            <span className="truncate">{st.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-mono">{st.email}</div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 font-mono">
                          <span className="text-xs font-bold text-emerald-400">{avgMastery}%</span>
                          <span className="text-[9px] text-slate-500">{st.wpm ?? st.avgWpm ?? 0} WPM</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'coursemap') {
    if (!courseDetails) return null;
    const currentSkill =
      courseDetails.skills?.find((s: any) => s.slug === (selectedSkillSlug || courseDetails.skills[0]?.slug)) ||
      courseDetails.skills[0];
    const skillTasks = allTasks.filter((t) => t.skillId === currentSkill?.id || t.skill?.id === currentSkill?.id);

    const topicsMap: Record<string, { easy: number; medium: number; hard: number; total: number }> = {};
    let codeTasks = 0;
    let quizTasks = 0;
    let secretTestsCount = 0;

    skillTasks.forEach((tk) => {
      const top = tk.topic || 'general';
      if (!topicsMap[top]) topicsMap[top] = { easy: 0, medium: 0, hard: 0, total: 0 };
      topicsMap[top].total++;
      if (tk.difficulty === 'EASY') topicsMap[top].easy++;
      if (tk.difficulty === 'MEDIUM') topicsMap[top].medium++;
      if (tk.difficulty === 'HARD') topicsMap[top].hard++;

      if (tk.taskType === 'CODE') codeTasks++;
      else quizTasks++;

      if (tk.testCases && tk.testCases.some((tc: any) => tc.isSecret)) secretTestsCount++;
    });

    const totalTopics = Object.keys(topicsMap).length;
    const completeTriads = Object.values(topicsMap).filter((t) => t.easy > 0 && t.medium > 0 && t.hard > 0).length;
    const completePercent = totalTopics > 0 ? Math.round((completeTriads / totalTopics) * 100) : 0;

    return (
      <div className="flex flex-col divide-y divide-slate-800/70">
        <div className="pb-3 flex flex-col gap-2">
          <button
            onClick={() => setIsTriadAuditOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Баланс Тріад</span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">({currentSkill?.slug || 'all'})</span>
            </span>
            <span className="text-slate-500 group-hover:text-white">
              {isTriadAuditOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </span>
          </button>

          {isTriadAuditOpen && (
            <div className="flex flex-col gap-2 animate-fadeIn">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Повнота Тріад (3/3):</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {completeTriads}/{totalTopics} ({completePercent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div className="h-full bg-emerald-400 transition-all" style={{ width: `${completePercent}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                <div className="py-1.5 px-2 rounded bg-slate-950/40 flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">Код:</span>
                  <span className="text-emerald-400 font-bold">{codeTasks}</span>
                </div>
                <div className="py-1.5 px-2 rounded bg-slate-950/40 flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">Тести:</span>
                  <span className="text-blue-400 font-bold">{quizTasks}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-0.5 text-slate-400">
                <span>Приховані тести (Secret):</span>
                <span className="text-rose-400 font-bold">{secretTestsCount} задач</span>
              </div>
            </div>
          )}
        </div>

        <div className="py-3 flex flex-col gap-2">
          <button
            onClick={() => setIsCognitiveTrapsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Когнітивні Пастки</span>
            </span>
            <span className="text-slate-500 group-hover:text-white">
              {isCognitiveTrapsOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </span>
          </button>

          {isCognitiveTrapsOpen && (
            <div className="flex flex-col divide-y divide-slate-800/50 animate-fadeIn">
              <div
                onClick={() => {
                  const found = allTasks.find((t) => t.subConcept?.includes('dead-zone') || t.title.includes('Temporal Dead Zone'));
                  if (found) onSelectTaskId(found.id);
                }}
                className="py-2 px-1.5 hover:bg-slate-800/40 rounded transition-colors cursor-pointer flex flex-col gap-0.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200 truncate">Temporal Dead Zone (TDZ)</span>
                  <span className="text-[10px] font-mono text-rose-400">42% пом.</span>
                </div>
                <span className="text-[10px] text-slate-500">Часте перемикання на EASY (70%)</span>
              </div>

              <div
                onClick={() => {
                  const found = allTasks.find((t) => t.subConcept?.includes('coercion') || t.title.includes('приведення'));
                  if (found) onSelectTaskId(found.id);
                }}
                className="py-2 px-1.5 hover:bg-slate-800/40 rounded transition-colors cursor-pointer flex flex-col gap-0.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200 truncate">Strict Equality & Coercion</span>
                  <span className="text-[10px] font-mono text-amber-400">35% пом.</span>
                </div>
                <span className="text-[10px] text-slate-500">Плутанина між == та ===</span>
              </div>

              <div
                onClick={() => {
                  const found = allTasks.find((t) => t.subConcept?.includes('closure') || t.title.includes('замикан'));
                  if (found) onSelectTaskId(found.id);
                }}
                className="py-2 px-1.5 hover:bg-slate-800/40 rounded transition-colors cursor-pointer flex flex-col gap-0.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200 truncate">Lexical Scope & Closures</span>
                  <span className="text-[10px] font-mono text-amber-400">28% пом.</span>
                </div>
                <span className="text-[10px] text-slate-500">Збереження стану при викликах</span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 flex flex-col gap-2">
          <button
            onClick={() => setIsAdaptiveParamsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-indigo-400" />
              <span>Пороги Адаптації</span>
            </span>
            <span className="text-slate-500 group-hover:text-white">
              {isAdaptiveParamsOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </span>
          </button>

          {isAdaptiveParamsOpen && (
            <div className="flex flex-col divide-y divide-slate-800/50 font-mono text-[11px] animate-fadeIn">
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Proficient (DAG):</span>
                <span className="text-indigo-400 font-bold">P(L) ≥ 0.75</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Gold Mastery:</span>
                <span className="text-emerald-400 font-bold">P(L) ≥ 0.90</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Ліміт EASY:</span>
                <span className="text-amber-400 font-bold">Max 70%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'reviews') {
    return (
      <div className="flex flex-col divide-y divide-slate-800/70">
        <div className="pb-3 flex flex-col gap-2">
          <div className="bg-slate-950/60 p-1 rounded-lg border border-slate-800/80 flex items-center gap-1">
            <button
              onClick={() => onSetReviewFilterTab('pending')}
              className={`flex-1 py-1 px-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                reviewFilterTab === 'pending' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>В черзі</span>
            </button>
            <button
              onClick={() => onSetReviewFilterTab('reviewed')}
              className={`flex-1 py-1 px-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                reviewFilterTab === 'reviewed' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Перевірені</span>
            </button>
          </div>
        </div>

        <div className="pt-3 flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Роботи Студентів</span>
            <span className="font-mono text-[10px] text-slate-500">({reviewQueue.length})</span>
          </span>

          {reviewQueue.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              {reviewFilterTab === 'pending' ? 'Черга перевірки порожня' : 'Немає перевірених робіт'}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-800/50">
              {reviewQueue.map((item) => {
                const isSelected = selectedReviewId === item.submissionId;
                const isApproved = item.teacherReviewStatus === 'APPROVED';
                const isRejected = item.teacherReviewStatus === 'REJECTED';

                return (
                  <div
                    key={item.submissionId}
                    onClick={() => onSelectReviewId(item.submissionId)}
                    className={`py-2.5 px-2 rounded-md transition-colors cursor-pointer flex flex-col gap-1 ${
                      isSelected ? 'bg-purple-500/15 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white truncate">{item.studentName}</span>
                      <span
                        className={`text-[10px] font-mono ${
                          isApproved ? 'text-emerald-400' : isRejected ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {isApproved ? '✓ Затверджено' : isRejected ? '✕ Відхилено' : 'В черзі'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{item.taskTitle}</div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                      <span>{item.skillTitle}</span>
                      <span>{new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'classrooms') {
    return (
      <div className="flex flex-col gap-3 p-1">
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex flex-col gap-1.5">
          <span className="font-semibold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Швидке Зарахування</span>
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Згенеруйте інвайт-код або надішліть учням посилання /join. Вони авторизуються в 1 клік через Google та автоматично підключаться до вашого курсу.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col gap-1.5">
          <span className="font-semibold text-slate-300">Дидактичні Режими</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            • <strong className="text-purple-300">FULL_CYCLE:</strong> обов&apos;язкова теорія в підручнику + адаптивний тренажер BKT ($P(L_n) \ge 0.85$).<br />
            • <strong className="text-amber-300">TESTING_ONLY:</strong> експрес-зріз або екзамен без блокування на конспекті.
          </p>
        </div>
      </div>
    );
  }

  if (activeTab === 'metrics-audit') {
    return (
      <div className="flex flex-col divide-y divide-slate-800/70">
        <div className="pb-3 flex flex-col gap-1.5">
          <button
            onClick={() => setIsGeneralToolsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Інструменти Системи</span>
            </span>
            <span className="text-slate-500 group-hover:text-white">
              {isGeneralToolsOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </span>
          </button>

          {isGeneralToolsOpen && (
            <div className="flex flex-col divide-y divide-slate-800/50 animate-fadeIn">
              <button
                onClick={() => onSetAuditSubTab('mechanisms')}
                className={`w-full py-2 px-2 rounded-md text-left flex items-center justify-between transition-colors cursor-pointer ${
                  auditSubTab === 'mechanisms' ? 'bg-purple-500/15 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs font-medium truncate">Реєстр Механізмів (4-in-1)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">➔</span>
              </button>

              <button
                onClick={() => onSetAuditSubTab('test-matrix')}
                className={`w-full py-2 px-2 rounded-md text-left flex items-center justify-between transition-colors cursor-pointer ${
                  auditSubTab === 'test-matrix' ? 'bg-purple-500/15 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium truncate">Еталонна Матриця</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">6/6</span>
              </button>

              <button
                onClick={() => onSetAuditSubTab('what-if')}
                className={`w-full py-2 px-2 rounded-md text-left flex items-center justify-between transition-colors cursor-pointer ${
                  auditSubTab === 'what-if' ? 'bg-purple-500/15 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-xs font-medium truncate">Пісочниця &quot;What-If&quot;</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">➔</span>
              </button>
            </div>
          )}
        </div>

        <div className="pt-3 flex flex-col gap-2">
          <button
            onClick={() => setIsStudentsListOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>Студенти для Аудиту</span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">({students.length})</span>
            </span>
            <span className="text-slate-500 group-hover:text-white">
              {isStudentsListOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </span>
          </button>

          {isStudentsListOpen && (
            <div className="flex flex-col divide-y divide-slate-800/50 max-h-[calc(100vh-340px)] overflow-y-auto pr-0.5 animate-fadeIn">
              {students.map((st) => {
                const stId = st.id || st.studentId || st.email;
                const isSelected = selectedStudentId === stId;
                const avgMastery = st.averageMastery !== undefined ? (st.averageMastery * 100).toFixed(0) : '0';

                return (
                  <div
                    key={stId}
                    onClick={() => {
                      onSelectStudentId(stId);
                      onSetAuditSubTab('live-log');
                    }}
                    className={`py-2 px-2 rounded-md transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected && auditSubTab === 'live-log' ? 'bg-purple-500/15 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="text-xs font-medium truncate flex items-center gap-1.5">
                        {isSelected && auditSubTab === 'live-log' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />}
                        <span className="truncate">{st.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-mono">{st.email}</div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 font-mono">
                      <span className="text-xs font-bold text-emerald-400">{avgMastery}%</span>
                      <span className="text-[9px] text-slate-500">Спроб: {st.recentAdjustments?.length || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'settings') {
    return (
      <div className="flex flex-col divide-y divide-slate-800/70 text-xs text-slate-300">
        <div className="pb-3">
          <ThemeSettingsSection />
        </div>

        <div className="py-3 flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Поріг Майстерності BKT
          </span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            P(L) ≥ 0.95 відкриває залежні вершини графа навичок.
          </p>
        </div>

        <div className="pt-3 flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Штраф за Вгадування P(G)
          </span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            При швидкості відповіді &lt; 3.5 сек активується захист від випадкового вгадування.
          </p>
        </div>
      </div>
    );
  }

  return null;
};
