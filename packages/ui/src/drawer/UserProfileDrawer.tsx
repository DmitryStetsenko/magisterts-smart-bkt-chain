'use client';

import React from 'react';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw, 
  GraduationCap,
  ExternalLink,
  LucideIcon
} from 'lucide-react';
import { DrawerSection } from '../drawer/DrawerSection';

export interface UserProfileDrawerCourse {
  slug: string;
  title: string;
  category?: string;
  skillsCount?: number;
  totalSkillsCount?: number;
  completionPct?: number;
}

export interface UserProfileDrawerStat {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
}

export interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Інформація про користувача
  user: {
    name: string;
    roleName: string;
    roleBadge?: string;
    subtitle?: string;
    initials?: string;
    avatarGradient?: string;
  };
  // Список курсів та вибір активного
  courses?: UserProfileDrawerCourse[];
  activeCourseSlug?: string;
  onSelectCourse?: (slug: string) => void;
  // Додаткова секція статистики
  stats?: UserProfileDrawerStat[];
  statsTitle?: string;
  // Додаткові дії в секції дій
  onResetDemoState?: () => void;
  resetDemoLabel?: string;
  quickLinks?: Array<{
    label: string;
    href: string;
    icon?: LucideIcon;
    iconColor?: string;
  }>;
  // Кастомний контент (якщо потрібні специфічні секції для окремих ролей)
  children?: React.ReactNode;
  versionBadge?: string;
}

/**
 * 👤 UserProfileDrawer
 * Канонічний висувний Drawer профілю користувача для всіх веб-застосунків платформи
 * Smart-BKT-Chain (Study Portal, Student Portal, Teacher Portal, Admin Portal).
 */
export function UserProfileDrawer({
  isOpen,
  onClose,
  user,
  courses = [],
  activeCourseSlug,
  onSelectCourse,
  stats,
  statsTitle = 'Академічний Статус',
  onResetDemoState,
  resetDemoLabel = 'Скинути стан симуляції',
  quickLinks,
  children,
  versionBadge = 'Smart-BKT-Chain v2.0',
}: UserProfileDrawerProps) {
  if (!isOpen) return null;

  const initials = user.initials || user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      {/* Затемнений бекдроп */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Права панель Drawer */}
      <aside className="fixed top-0 right-0 h-screen w-80 sm:w-96 bg-slate-900 border-l border-slate-800 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* 1. Верхня шапка профілю (h-[62px]) */}
        <div className="h-[62px] px-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${user.avatarGradient || 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500'} flex items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-indigo-500/20`}>
              {initials}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
                <span>{user.name}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 uppercase">
                  {user.roleBadge || user.roleName}
                </span>
              </h3>
              {user.subtitle && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.subtitle}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Закрити панель профілю"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Контентна частина сайдбара зі скролом */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* СЕКЦІЯ 1: Курси (якщо передано) */}
          {courses.length > 0 && onSelectCourse && (
            <DrawerSection
              title="Навчальні Курси"
              icon={BookOpen}
              iconColor="text-indigo-400"
              titleColor="text-indigo-400 group-hover:text-indigo-300"
              badge={courses.length}
              badgeColor="bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
              defaultOpen={true}
            >
              <div className="space-y-2 mt-1">
                {courses.map((course) => {
                  const isActive = course.slug === activeCourseSlug;
                  return (
                    <button
                      key={course.slug}
                      onClick={() => onSelectCourse(course.slug)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isActive
                          ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-sm ring-1 ring-indigo-500/20'
                          : 'bg-slate-950/40 hover:bg-slate-800/60 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold flex items-center gap-1.5 truncate">
                          <span>📚</span>
                          <span className="truncate">{course.title}</span>
                        </span>
                        {isActive ? (
                          <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            АКТИВНИЙ
                          </span>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>{course.category || 'Напрям'}</span>
                        {isActive && course.skillsCount !== undefined && course.totalSkillsCount !== undefined && (
                          <span className="font-mono text-indigo-300">
                            {course.skillsCount}/{course.totalSkillsCount} навичок
                          </span>
                        )}
                      </div>

                      {isActive && course.completionPct !== undefined && (
                        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800/60">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                            style={{ width: `${course.completionPct}%` }}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </DrawerSection>
          )}

          {/* СЕКЦІЯ 2: Статистика або метрики (якщо передано) */}
          {stats && stats.length > 0 && (
            <DrawerSection
              title={statsTitle}
              defaultOpen={true}
            >
              <div className="grid grid-cols-2 gap-2 mt-1">
                {stats.map((stat, idx) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={idx} className="bg-slate-950/40 border border-slate-800 p-2.5 rounded-xl flex flex-col">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                        {StatIcon && <StatIcon className={`w-3 h-3 ${stat.iconColor || 'text-amber-400'} shrink-0`} />}
                        <span className="truncate">{stat.label}</span>
                      </span>
                      <span className={`text-sm font-bold font-mono mt-0.5 ${stat.valueColor || 'text-white'}`}>
                        {stat.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </DrawerSection>
          )}

          {/* Додатковий кастомний контент застосунка */}
          {children}

          {/* СЕКЦІЯ: Швидкі переходи та скидання стану */}
          {(onResetDemoState || (quickLinks && quickLinks.length > 0)) && (
            <DrawerSection
              title="Керування Сесією"
              defaultOpen={false}
            >
              <div className="space-y-1.5 mt-1">
                {onResetDemoState && (
                  <button
                    onClick={onResetDemoState}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950/40 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                      {resetDemoLabel}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">P(L)→0</span>
                  </button>
                )}

                {quickLinks && quickLinks.map((link, idx) => {
                  const LinkIcon = link.icon || GraduationCap;
                  return (
                    <a
                      key={idx}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950/40 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <LinkIcon className={`w-3.5 h-3.5 ${link.iconColor || 'text-blue-400'}`} />
                        {link.label}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  );
                })}
              </div>
            </DrawerSection>
          )}

        </div>

        {/* 3. Футер сайдбара */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>{versionBadge}</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Підключено (WS)
          </span>
        </div>

      </aside>
    </>
  );
}
