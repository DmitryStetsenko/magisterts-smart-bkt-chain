'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  HelpCircle,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Download,
  Filter,
  RefreshCw,
  Code2,
  Brain,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { StudentActivityLogDto } from '@sbc/types';

interface StudentActivityTimelineWidgetProps {
  studentId: string;
  studentName: string;
  apiUrl?: string;
  incomingLogs?: StudentActivityLogDto[];
}

export const StudentActivityTimelineWidget: React.FC<StudentActivityTimelineWidgetProps> = ({
  studentId,
  studentName,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  incomingLogs = [],
}) => {
  const [logs, setLogs] = useState<StudentActivityLogDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HINTS' | 'THEORY' | 'SUBMISSIONS' | 'ANNULMENTS' | 'RESETS'>('ALL');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/bkt/activity-logs/student/${studentId}?limit=150`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error('Failed to fetch activity logs for student:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [studentId]);

  // Merge any real-time incoming logs for this student
  useEffect(() => {
    if (incomingLogs.length > 0) {
      setLogs((prev) => {
        const existingIds = new Set(prev.map((l) => l.id));
        const newItems = incomingLogs.filter(
          (l) => l.userId === studentId && !existingIds.has(l.id)
        );
        if (newItems.length === 0) return prev;
        return [...newItems, ...prev];
      });
    }
  }, [incomingLogs, studentId]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'HINTS') return log.eventType.includes('HINT');
      if (activeFilter === 'THEORY') return log.eventType.includes('THEORY');
      if (activeFilter === 'SUBMISSIONS') return log.eventType.includes('SUBMIT') || log.eventType.includes('EVALUAT');
      if (activeFilter === 'ANNULMENTS') return log.eventType.includes('ANNUL');
      if (activeFilter === 'RESETS') return log.eventType.includes('RESET') || log.eventType.includes('ABANDON') || log.eventType.includes('REVOKE');
      return true;
    });
  }, [logs, activeFilter]);

  const getEventBadge = (eventType: string) => {
    if (eventType.includes('ANNUL')) {
      return {
        label: 'Анульовано викладачем',
        color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        icon: AlertTriangle,
      };
    }
    if (eventType.includes('HINT')) {
      return {
        label: 'Підказка Сократа',
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        icon: HelpCircle,
      };
    }
    if (eventType === 'THEORY_DRAWER_OPENED') {
      return {
        label: 'Відкриття теорії',
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        icon: BookOpen,
      };
    }
    if (eventType === 'THEORY_DRAWER_CLOSED') {
      return {
        label: 'Вивчення теорії',
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        icon: BookOpen,
      };
    }
    if (eventType.includes('RESET') || eventType.includes('REVOKE') || eventType.includes('ABANDON')) {
      return {
        label: 'Скидання / Ремедіація',
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        icon: RotateCcw,
      };
    }
    if (eventType.includes('SUBMIT') || eventType.includes('EVALUAT')) {
      return {
        label: 'Спроба розв\'язку',
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        icon: Code2,
      };
    }
    return {
      label: eventType,
      color: 'bg-slate-800 text-slate-300 border-slate-700',
      icon: Clock,
    };
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' ' + d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Хроніка дій студента (Event Stream)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Повний дискретний аудит-лог когнітивних рішень учня <strong>{studentName}</strong> у реальному часі
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={isLoading}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Оновити журнал дій"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Оновити</span>
          </button>

          <a
            href={`${apiUrl}/api/v1/bkt/activity-logs/export?userId=${studentId}&format=jsonl`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Завантажити датасет по студенту у форматі JSONL для навчання нейромережі"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Експорт JSONL</span>
          </a>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs select-none">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" />
          <span>Фільтр:</span>
        </span>
        {[
          { key: 'ALL', label: 'Всі події' },
          { key: 'HINTS', label: 'Підказки Сократа' },
          { key: 'THEORY', label: 'Експрес-теорія' },
          { key: 'SUBMISSIONS', label: 'Спроби завдань' },
          { key: 'ANNULMENTS', label: 'Анулювання' },
          { key: 'RESETS', label: 'Скидання' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key as any)}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-[11px] font-mono text-slate-500">
          Записів: {filteredLogs.length}
        </span>
      </div>

      {/* Timeline Stream */}
      {isLoading && logs.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          <span>Завантаження часового ряду дій студента...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-8 bg-slate-900/40 border border-slate-800/80 rounded-xl text-center text-slate-400 text-xs">
          Жодних подій за обраним фільтром не знайдено.
        </div>
      ) : (
        <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
          {filteredLogs.map((log) => {
            const badge = getEventBadge(log.eventType);
            const IconComponent = badge.icon;
            const payload = log.payload || {};

            return (
              <div
                key={log.id}
                className="relative bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3 flex flex-col gap-2 transition-all"
              >
                {/* Timeline Node Point */}
                <div className="absolute -left-[27px] top-3.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-purple-500 shadow-sm shadow-purple-500/50" />

                {/* Header: Event Badge, Actor & Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}>
                      <IconComponent className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>

                    {log.actorRole && log.actorRole !== 'STUDENT' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {log.actorRole}
                      </span>
                    )}

                    {log.skillId && (
                      <span className="text-[10px] font-mono text-slate-400">
                        /{log.skillId}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(log.createdAt)}</span>
                  </span>
                </div>

                {/* Content Payload Preview */}
                <div className="text-xs text-slate-300 leading-relaxed">
                  {/* Socratic Hint */}
                  {log.eventType === 'HINT_REQUESTED' && (
                    <div className="flex items-center gap-2 text-amber-200">
                      <span>Запитано підказку рівня: <strong className="font-mono text-amber-300">{payload.level ?? 1}</strong></span>
                      {payload.penaltyPct && (
                        <span className="text-amber-400 font-mono text-[11px]">(-{payload.penaltyPct}% штрафу BKT)</span>
                      )}
                    </div>
                  )}

                  {/* Theory Drawer Closed with Dwell Time */}
                  {log.eventType === 'THEORY_DRAWER_CLOSED' && (
                    <div className="flex items-center gap-2 text-cyan-200">
                      <span>Час вивчення теоретичної капсули:</span>
                      <strong className="font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                        {payload.dwellTimeSeconds !== undefined ? `${payload.dwellTimeSeconds} сек` : 'декілька секунд'}
                      </strong>
                    </div>
                  )}

                  {/* Theory Drawer Opened */}
                  {log.eventType === 'THEORY_DRAWER_OPENED' && (
                    <div className="text-slate-400 text-[11px]">
                      Тригер відкриття теорії: <span className="font-mono text-slate-300">{payload.trigger || 'користувач'}</span>
                    </div>
                  )}

                  {/* Task Submissions */}
                  {(log.eventType === 'TASK_SUBMITTED' || log.eventType === 'STUDENT_SUBMISSION') && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-200">{payload.taskTitle || log.taskId || 'Завдання'}</span>
                        {payload.isPassed !== undefined && (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${payload.isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {payload.isPassed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{payload.isPassed ? 'Зараховано' : 'Не зараховано'}</span>
                          </span>
                        )}
                        {payload.pMasteryChange !== undefined && (
                          <span className={`font-mono text-[11px] font-bold ${payload.pMasteryChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {payload.pMasteryChange >= 0 ? `+${(payload.pMasteryChange * 100).toFixed(1)}%` : `${(payload.pMasteryChange * 100).toFixed(1)}%`} P(L)
                          </span>
                        )}
                      </div>
                      {payload.detectedMisconception && (
                        <div className="text-[11px] text-amber-300 bg-amber-950/30 px-2 py-1 rounded border border-amber-800/40 flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>Омана: <strong>{typeof payload.detectedMisconception === 'string' ? payload.detectedMisconception : (payload.detectedMisconception.title || payload.detectedMisconception.key)}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Annulment by Teacher */}
                  {log.eventType === 'TEACHER_SUBMISSION_ANNULLED' && (
                    <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-rose-300 font-semibold text-[11px]">
                        <span>Причина: {payload.reason || 'Академічна недоброчесність'}</span>
                        {payload.pMasteryAfter !== undefined && (
                          <span className="font-mono text-rose-400">P(L) перераховано до: {(payload.pMasteryAfter * 100).toFixed(1)}%</span>
                        )}
                      </div>
                      {payload.comment && (
                        <p className="text-slate-300 text-xs italic">
                          "{payload.comment}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Task Abandon & Reset */}
                  {(log.eventType === 'TASK_ABANDON_PROMPTED' || log.eventType === 'STUDENT_SKILL_RESET' || log.eventType === 'TEACHER_MODULE_REVOKED') && (
                    <div className="text-slate-300 text-[11px] flex flex-col gap-0.5">
                      <span>Дія: <strong>{log.eventType === 'STUDENT_SKILL_RESET' ? 'Учень скинув прогрес для ремедіації в підручнику' : log.eventType === 'TEACHER_MODULE_REVOKED' ? 'Викладач анулював весь модуль' : 'Студент відкрив модальне вікно відмови від завдання'}</strong></span>
                      {payload.destinationUrl && (
                        <span className="text-slate-400">Цільовий Zen-урок: <code className="text-indigo-300 font-mono text-[10px]">{payload.destinationUrl}</code></span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
