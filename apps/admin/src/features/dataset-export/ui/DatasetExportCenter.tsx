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
  ExternalLink
} from 'lucide-react';
import { StudentActivityLogDto } from '@sbc/types';

interface DatasetExportCenterProps {
  apiUrl?: string;
}

export const DatasetExportCenter: React.FC<DatasetExportCenterProps> = ({
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
}) => {
  const [logs, setLogs] = useState<StudentActivityLogDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'SUBMISSIONS' | 'HINTS' | 'THEORY' | 'ANNULMENTS' | 'RESETS'>('ALL');
  const [userFilter, setUserFilter] = useState<string>('');

  const fetchRecentLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/bkt/activity-logs/recent?limit=100`);
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

  // Statistics calculation
  const totalLogsCount = logs.length;
  const submissionsCount = logs.filter((l) => l.eventType.includes('SUBMIT')).length;
  const annulledCount = logs.filter((l) => l.eventType.includes('ANNUL')).length;
  const hintsCount = logs.filter((l) => l.eventType.includes('HINT')).length;
  const theoryDwellCount = logs.filter((l) => l.eventType.includes('THEORY')).length;
  const resetsCount = logs.filter((l) => l.eventType.includes('RESET') || l.eventType.includes('ABANDON')).length;

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
    if (eventType.includes('THEORY')) {
      return {
        label: 'Експрес-теорія',
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        icon: BookOpen,
      };
    }
    if (eventType.includes('RESET') || eventType.includes('REVOKE') || eventType.includes('ABANDON')) {
      return {
        label: 'Скидання / Відмова',
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
    <div className="flex flex-col gap-6">
      {/* 🚀 Header & Subtitle */}
      <div className="pb-3 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-emerald-400" />
            <span>Центр Експорту Датасетів для ШІ & Незмінний Аудит-Лог</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Автоматизований збір дискретних когнітивних подій учнів та експертних педагогічних інтервенцій для навчання моделей Deep Knowledge Tracing (DKT), SAKT та класифікаторів академічної доброчесності.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRecentLogs}
          disabled={isLoading}
          className="self-start md:self-auto px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Оновити потік</span>
        </button>
      </div>

      {/* 📦 1-Click ML Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: JSONL Export */}
        <div className="bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">JSONL Формат (Lines of JSON)</h3>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Для DKT, PyTorch & TensorFlow</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
              .jsonl
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Порядковий часовий ряд, де кожен рядок є самостійним JSON-об'єктом. Ідеально підходить для потокового завантаження в Python-даталоадери (`torch.utils.data.IterableDataset`) без вичерпання RAM.
          </p>

          <a
            href={`${apiUrl}/api/v1/bkt/activity-logs/export?format=jsonl`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
          >
            <Download className="w-4 h-4" />
            <span>Завантажити повний датасет JSONL</span>
          </a>
        </div>

        {/* Card 2: CSV Export */}
        <div className="bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/40 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">CSV Формат (Tabular Data)</h3>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">Для Pandas, Excel & PowerBI</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/50">
              .csv
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Класична таблична структура з розділювачами-комами та екрануванням JSON-пейлоадів. Оптимальна для статистичного регресійного аналізу, візуалізацій в Jupyter Notebook та імпорту в реляційні СУБД.
          </p>

          <a
            href={`${apiUrl}/api/v1/bkt/activity-logs/export?format=csv`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-950/50"
          >
            <Download className="w-4 h-4" />
            <span>Завантажити повний датасет CSV</span>
          </a>
        </div>
      </div>

      {/* 📊 KPI Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between gap-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Всього подій</span>
          <span className="text-xl font-bold font-mono text-white">{totalLogsCount}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between gap-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Спроб коду</span>
          <span className="text-xl font-bold font-mono text-emerald-400">{submissionsCount}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between gap-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Анулювань</span>
          <span className="text-xl font-bold font-mono text-rose-400">{annulledCount}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between gap-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Підказок Сократа</span>
          <span className="text-xl font-bold font-mono text-amber-400">{hintsCount}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between gap-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Сесій теорії</span>
          <span className="text-xl font-bold font-mono text-blue-400">{theoryDwellCount}</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between gap-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Скидань навичок</span>
          <span className="text-xl font-bold font-mono text-purple-400">{resetsCount}</span>
        </div>
      </div>

      {/* 🔍 Filters & Live Table Stream */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs select-none">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
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
                onClick={() => setActiveFilter(tab.key as any)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
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
            <input
              type="text"
              placeholder="Фільтр за userId..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 w-full sm:w-44"
            />
            <span className="text-[11px] font-mono text-slate-500 shrink-0">
              Показано: {filteredLogs.length}
            </span>
          </div>
        </div>

        {/* Table view */}
        <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-950/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Час</th>
                <th className="py-2.5 px-3">Користувач / Роль</th>
                <th className="py-2.5 px-3">Тип події</th>
                <th className="py-2.5 px-3">Навичка / Завдання</th>
                <th className="py-2.5 px-3">Когнітивний Пейлоад</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono text-[11px]">
              {isLoading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                    <RefreshCw className="w-4 h-4 animate-spin inline-block mr-2 text-emerald-400" />
                    Завантаження подій аудиту...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                    Жодних подій не знайдено за заданим фільтром.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = getEventBadge(log.eventType);
                  const Icon = badge.icon;
                  const payloadStr = JSON.stringify(log.payload || {});

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {formatTimestamp(log.createdAt)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-slate-200 font-medium">{log.userId}</span>
                        {log.actorRole && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400">
                            {log.actorRole}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {log.skillId ? (
                          <span className="text-purple-300">/{log.skillId}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 max-w-xs truncate text-slate-400 font-mono text-[10px]" title={payloadStr}>
                        {payloadStr}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
