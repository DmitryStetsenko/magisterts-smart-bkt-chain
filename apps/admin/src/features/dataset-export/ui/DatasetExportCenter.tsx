'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  BrainCircuit,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  HelpCircle,
  BookOpen,
  Code2,
  RotateCcw,
  Sparkles,
  Search,
  X,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  User,
  Trash2
} from 'lucide-react';
import { StudentActivityLogDto } from '@sbc/types';

export interface DatasetStats {
  total: number;
  submissions: number;
  annulled: number;
  hints: number;
  theory: number;
  resets: number;
}

interface DatasetExportCenterProps {
  apiUrl?: string;
  activeFilter?: 'ALL' | 'SUBMISSIONS' | 'HINTS' | 'THEORY' | 'ANNULMENTS' | 'RESETS';
  onFilterChange?: (filter: 'ALL' | 'SUBMISSIONS' | 'HINTS' | 'THEORY' | 'ANNULMENTS' | 'RESETS') => void;
  userFilter?: string;
  onUserFilterChange?: (user: string) => void;
  onStatsChange?: (stats: DatasetStats) => void;
}

export const DatasetExportCenter: React.FC<DatasetExportCenterProps> = ({
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  activeFilter: controlledFilter,
  onFilterChange,
  userFilter: controlledUserFilter,
  onUserFilterChange,
  onStatsChange,
}) => {
  const [logs, setLogs] = useState<StudentActivityLogDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [internalFilter, setInternalFilter] = useState<'ALL' | 'SUBMISSIONS' | 'HINTS' | 'THEORY' | 'ANNULMENTS' | 'RESETS'>('ALL');
  const [internalUserFilter, setInternalUserFilter] = useState<string>('');
  const [inspectingLog, setInspectingLog] = useState<StudentActivityLogDto | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // 🗑️ State for Safe Log Deletion Modal
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [clearConfirmInput, setClearConfirmInput] = useState<string>('');
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const handleClearAllLogs = async () => {
    if (clearConfirmInput.trim() !== 'ОЧИСТИТИ') {
      return;
    }
    setIsClearing(true);
    setClearError(null);
    try {
      const res = await fetch(`${apiUrl}/api/v1/bkt/activity-logs?actorId=admin&actorRole=ADMIN`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setIsClearModalOpen(false);
        setClearConfirmInput('');
        await fetchRecentLogs();
      } else {
        const errData = await res.json().catch(() => ({}));
        setClearError(errData.message || 'Помилка при очищенні логів');
      }
    } catch (e: any) {
      setClearError(e?.message || 'Мережева помилка при видаленні логів');
    } finally {
      setIsClearing(false);
    }
  };

  const activeFilter = controlledFilter !== undefined ? controlledFilter : internalFilter;
  const userFilter = controlledUserFilter !== undefined ? controlledUserFilter : internalUserFilter;

  const handleFilterSelect = (filter: 'ALL' | 'SUBMISSIONS' | 'HINTS' | 'THEORY' | 'ANNULMENTS' | 'RESETS') => {
    if (onFilterChange) {
      onFilterChange(filter);
    } else {
      setInternalFilter(filter);
    }
  };

  const handleUserFilterChange = (val: string) => {
    if (onUserFilterChange) {
      onUserFilterChange(val);
    } else {
      setInternalUserFilter(val);
    }
  };

  const fetchRecentLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/bkt/activity-logs/recent?limit=150`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error('Failed to fetch recent audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentLogs();
  }, []);

  // Stats calculation
  const stats: DatasetStats = useMemo(() => {
    return {
      total: logs.length,
      submissions: logs.filter((l) => l.eventType.includes('SUBMIT')).length,
      annulled: logs.filter((l) => l.eventType.includes('ANNUL')).length,
      hints: logs.filter((l) => l.eventType.includes('HINT')).length,
      theory: logs.filter((l) => l.eventType.includes('THEORY')).length,
      resets: logs.filter((l) => l.eventType.includes('RESET') || l.eventType.includes('ABANDON') || l.eventType.includes('REVOKE')).length,
    };
  }, [logs]);

  useEffect(() => {
    if (onStatsChange) {
      onStatsChange(stats);
    }
  }, [stats, onStatsChange]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (userFilter.trim() && !log.userId.toLowerCase().includes(userFilter.toLowerCase())) {
        return false;
      }
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'SUBMISSIONS') return log.eventType.includes('SUBMIT') || log.eventType.includes('EVALUAT');
      if (activeFilter === 'HINTS') return log.eventType.includes('HINT');
      if (activeFilter === 'THEORY') return log.eventType.includes('THEORY');
      if (activeFilter === 'ANNULMENTS') return log.eventType.includes('ANNUL');
      if (activeFilter === 'RESETS') return log.eventType.includes('RESET') || log.eventType.includes('ABANDON') || log.eventType.includes('REVOKE');
      return true;
    });
  }, [logs, activeFilter, userFilter]);

  const getEventBadge = (eventType: string) => {
    if (eventType.includes('ANNUL')) {
      return {
        label: 'Анульовано викладачем',
        color: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        icon: AlertTriangle,
      };
    }
    if (eventType.includes('HINT')) {
      return {
        label: 'Підказка Сократа',
        color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: HelpCircle,
      };
    }
    if (eventType === 'THEORY_DRAWER_OPENED') {
      return {
        label: 'Відкриття теорії',
        color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        icon: BookOpen,
      };
    }
    if (eventType === 'THEORY_DRAWER_CLOSED') {
      return {
        label: 'Вивчення теорії',
        color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        icon: BookOpen,
      };
    }
    if (eventType.includes('RESET') || eventType.includes('REVOKE') || eventType.includes('ABANDON')) {
      return {
        label: 'Скидання / Відмова',
        color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        icon: RotateCcw,
      };
    }
    if (eventType.includes('SUBMIT') || eventType.includes('EVALUAT')) {
      return {
        label: 'Спроба розв\'язку',
        color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
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
        ' (' + d.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) + ')';
    } catch {
      return dateStr;
    }
  };

  const formatUserName = (userId: string) => {
    if (userId === 'demo-student') return 'Дмитро Стеценко (demo-student)';
    if (userId.length > 20) {
      return `Учень #${userId.slice(0, 6)}...${userId.slice(-4)}`;
    }
    return userId;
  };

  const formatCognitiveContext = (log: StudentActivityLogDto) => {
    const payload = log.payload || {};
    if (log.eventType === 'THEORY_DRAWER_CLOSED') {
      const secs = payload.dwellTimeSeconds !== undefined ? payload.dwellTimeSeconds : 0;
      return <span className="text-cyan-300 font-mono">⏱️ {secs} сек вивчення</span>;
    }
    if (log.eventType === 'THEORY_DRAWER_OPENED') {
      return <span className="text-slate-400">тригер: <span className="text-slate-200">{payload.trigger || 'ручний'}</span></span>;
    }
    if (log.eventType === 'HINT_REQUESTED') {
      return (
        <span className="text-amber-300 font-mono">
          💡 Підказка #{payload.level ?? 1} {payload.penaltyPct ? `(-${payload.penaltyPct}% BKT)` : ''}
        </span>
      );
    }
    if (log.eventType.includes('SUBMIT')) {
      const isPassed = payload.isPassed;
      const change = payload.pMasteryChange;
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={isPassed ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
            {isPassed ? '✅ Зараховано' : '❌ Не здано'}
          </span>
          {change !== undefined && (
            <span className={`font-mono text-[10px] ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ({change >= 0 ? `+${(change * 100).toFixed(1)}%` : `${(change * 100).toFixed(1)}%`} P(L))
            </span>
          )}
        </div>
      );
    }
    if (log.eventType.includes('ANNUL')) {
      return (
        <span className="text-rose-300 font-medium truncate" title={payload.comment}>
          ⚠️ {payload.reason || 'Академічна недоброчесність'}
        </span>
      );
    }
    if (log.eventType.includes('RESET') || log.eventType.includes('ABANDON') || log.eventType.includes('REVOKE')) {
      return <span className="text-purple-300">🔄 Скидання навички</span>;
    }
    return <span className="text-slate-500 font-mono text-[10px] truncate max-w-[200px]">{JSON.stringify(payload)}</span>;
  };

  const handleCopyPayload = () => {
    if (!inspectingLog) return;
    navigator.clipboard.writeText(JSON.stringify(inspectingLog.payload || {}, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 🚀 Sleek Minimalist Borderless Header & Action Bar */}
      <div className="pb-3 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <span>Центр Експорту Датасетів для ШІ & Незмінний Аудит-Лог</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Дискретні когнітивні події учнів та педагогічні інтервенції для моделей Deep Knowledge Tracing (DKT), SAKT та класифікаторів доброчесності
          </p>
        </div>

        {/* 1-Click Sleek Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`${apiUrl}/api/v1/bkt/activity-logs/export?format=jsonl`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Завантажити повний датасет у форматі JSONL для моделей DKT / PyTorch"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSONL (DKT/ШІ)</span>
            <span className="text-[10px] font-mono opacity-70">.jsonl</span>
          </a>

          <a
            href={`${apiUrl}/api/v1/bkt/activity-logs/export?format=csv`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Завантажити табличний датасет у форматі CSV для Pandas / Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV (Pandas)</span>
            <span className="text-[10px] font-mono opacity-70">.csv</span>
          </a>

          <button
            type="button"
            onClick={fetchRecentLogs}
            disabled={isLoading}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Оновити потік подій з сервера"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Оновити</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setClearConfirmInput('');
              setClearError(null);
              setIsClearModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Очистити всі записи аудит-логу з бази даних"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Очистити логи</span>
          </button>
        </div>
      </div>

      {/* 📊 Minimalist Borderless KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Всього подій</span>
          <span className="text-lg font-bold font-mono text-white mt-1">{stats.total}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Спроб коду</span>
          <span className="text-lg font-bold font-mono text-emerald-400 mt-1">{stats.submissions}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Анулювань (Hard Neg)</span>
          <span className="text-lg font-bold font-mono text-rose-400 mt-1">{stats.annulled}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Підказок Сократа</span>
          <span className="text-lg font-bold font-mono text-amber-400 mt-1">{stats.hints}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Вивчення теорії</span>
          <span className="text-lg font-bold font-mono text-blue-400 mt-1">{stats.theory}</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Скидань навичок</span>
          <span className="text-lg font-bold font-mono text-purple-400 mt-1">{stats.resets}</span>
        </div>
      </div>

      {/* 🔍 Interactive Filter Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs select-none">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3 h-3" />
            <span>Фільтр:</span>
          </span>
          {[
            { key: 'ALL', label: 'Всі події' },
            { key: 'SUBMISSIONS', label: 'Спроби' },
            { key: 'ANNULMENTS', label: 'Анулювання' },
            { key: 'HINTS', label: 'Підказки' },
            { key: 'THEORY', label: 'Теорія' },
            { key: 'RESETS', label: 'Скидання' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleFilterSelect(tab.key as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === tab.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Фільтр за userId..."
              value={userFilter}
              onChange={(e) => handleUserFilterChange(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500 shrink-0">
            Записів: {filteredLogs.length}
          </span>
        </div>
      </div>

      {/* 📋 Minimalist Borderless Data Table */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/60">
        <div className="max-h-[calc(100vh-290px)] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/80 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Час</th>
                <th className="py-2.5 px-3">Користувач / Роль</th>
                <th className="py-2.5 px-3">Тип події</th>
                <th className="py-2.5 px-3">Навичка / Модуль</th>
                <th className="py-2.5 px-3">Когнітивний контекст</th>
                <th className="py-2.5 px-3 text-right">JSON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
              {isLoading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-mono">
                    <RefreshCw className="w-4 h-4 animate-spin inline-block mr-2 text-emerald-400" />
                    Завантаження подій незмінного аудит-логу...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Жодних подій не знайдено за заданим критерієм фільтрації.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = getEventBadge(log.eventType);
                  const Icon = badge.icon;

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Timestamp */}
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {formatTimestamp(log.createdAt)}
                      </td>

                      {/* User & Role */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-200 font-medium text-xs" title={log.userId}>
                            {formatUserName(log.userId)}
                          </span>
                          {log.actorRole && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700/60">
                              {log.actorRole}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Event Type Badge */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Skill / Task */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {log.skillId ? (
                          <span className="text-purple-300 font-mono text-[11px]">
                            {log.skillId.length > 20 ? `/${log.skillId.slice(0, 8)}...` : `/${log.skillId}`}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Cognitive Context */}
                      <td className="py-2.5 px-3 text-xs leading-relaxed max-w-sm truncate">
                        {formatCognitiveContext(log)}
                      </td>

                      {/* Inspect JSON Button */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectingLog(log)}
                          className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
                          title="Переглянути повний незмінний JSON-пейлоад події"
                        >
                          {'{ }'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔍 Raw Payload Modal Inspector */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-5 shadow-2xl flex flex-col gap-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  JSON Пейлоад Події: <code className="text-emerald-400 text-xs font-mono">{inspectingLog.eventType}</code>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <div>ID: <span className="text-slate-200">{inspectingLog.id}</span></div>
              <div>Час: <span className="text-slate-200">{inspectingLog.createdAt}</span></div>
              <div>User: <span className="text-slate-200">{inspectingLog.userId}</span></div>
              <div>Роль: <span className="text-slate-200">{inspectingLog.actorRole || 'STUDENT'}</span></div>
            </div>

            <div className="relative">
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-emerald-300 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(inspectingLog.payload || {}, null, 2)}
              </pre>
              <button
                type="button"
                onClick={handleCopyPayload}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Скопійовано' : 'Копіювати'}</span>
              </button>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Clear Logs Safety Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-rose-400">
                <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Очищення бази аудит-логу</h3>
                  <span className="text-[11px] text-rose-400 font-mono">НЕЗВОРОТНА ОПЕРАЦІЯ</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 flex flex-col gap-2 leading-relaxed">
              <p>
                Ви збираєтеся видалити всі <strong className="text-white font-mono">{logs.length}</strong> збережених подій аудит-логу (спроби розв&apos;язання, підказки Сократа, анулювання, час вивчення теорії).
              </p>
              <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded-lg text-rose-300 text-[11px]">
                ⚠️ Це призведе до повного обнулення датасету для навчання ШІ-моделей та хроніки викладача.
              </div>
              <p className="mt-1 text-slate-400">
                Для підтвердження введіть слово <strong className="text-white font-mono selection:bg-rose-500">ОЧИСТИТИ</strong> у поле нижче:
              </p>
            </div>

            <input
              type="text"
              placeholder="Введіть ОЧИСТИТИ..."
              value={clearConfirmInput}
              onChange={(e) => setClearConfirmInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-lg text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none"
              autoFocus
            />

            {clearError && (
              <div className="text-xs text-rose-400 font-medium">
                {clearError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                disabled={isClearing}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Скасувати
              </button>

              <button
                type="button"
                onClick={handleClearAllLogs}
                disabled={clearConfirmInput.trim() !== 'ОЧИСТИТИ' || isClearing}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  clearConfirmInput.trim() === 'ОЧИСТИТИ' && !isClearing
                    ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-900/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearing ? 'Очищення...' : 'Підтвердити очищення'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
