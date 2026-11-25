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
  LucideIcon,
  LogIn,
  LogOut,
  Palette
} from 'lucide-react';
import { DrawerSection } from '../drawer/DrawerSection';
import { useTheme } from '../theme/ThemeContext';
import { ThemeToggle } from '../theme/ThemeToggle';

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
  user: {
    name: string;
    roleName: string;
    roleBadge?: string;
    subtitle?: string;
    initials?: string;
    avatarGradient?: string;
  };
  courses?: UserProfileDrawerCourse[];
  activeCourseSlug?: string;
  onSelectCourse?: (slug: string) => void;
  stats?: UserProfileDrawerStat[];
  statsTitle?: string;
  onResetDemoState?: () => void;
  resetDemoLabel?: string;
  quickLinks?: Array<{
    label: string;
    href: string;
    icon?: LucideIcon;
    iconColor?: string;
  }>;
  children?: React.ReactNode;
  versionBadge?: string;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

/**
 * 👤 UserProfileDrawer
 * Канонічний висувний Drawer профілю користувача для всіх веб-застосунків платформи
 * Smart-BKT-Chain у чистому безрамковому стилі.
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
  onOpenAuthModal,
  onLogout,
}: UserProfileDrawerProps) {
  if (!isOpen) return null;

  const initials = user.initials || user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <aside className="fixed top-0 right-0 h-screen w-80 sm:w-[340px] bg-slate-900 border-l border-slate-800/80 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* 1. Верхня шапка профілю (h-[62px]) */}
        <div className="h-[62px] px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full ${user.avatarGradient || 'bg-gradient-to-tr from-indigo-600 to-purple-600'} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
              {initials}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
                <span>{user.name}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-300 uppercase">
                  {user.roleBadge || user.roleName}
                </span>
              </h3>
              {user.subtitle && (
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[200px]">{user.subtitle}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-white rounded hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Закрити панель профілю"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Контентна частина зі скролом */}
        <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-slate-800/70 flex flex-col gap-3">
          
          {/* СЕКЦІЯ 1: Курси */}
          {courses.length > 0 && onSelectCourse && (
            <DrawerSection
              title="Навчальні Курси"
              icon={BookOpen}
              iconColor="text-purple-400"
              badge={courses.length}
              defaultOpen={true}
            >
              <div className="divide-y divide-slate-800/50">
                {courses.map((course) => {
                  const isActive = course.slug === activeCourseSlug;
                  const categoryLabel = typeof course.category === 'object' && course.category !== null
                    ? (course.category as any).title
                    : course.category;
                  return (
                    <button
                      key={course.slug}
                      onClick={() => onSelectCourse(course.slug)}
                      className={`w-full text-left py-2.5 px-2 transition-colors cursor-pointer flex flex-col gap-1 rounded-md ${
                        isActive
                          ? 'bg-purple-500/10 text-white'
                          : 'hover:bg-slate-800/40 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium truncate">
                          {course.title}
                        </span>
                        {isActive ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                      </div>

                      {(categoryLabel || (isActive && course.skillsCount !== undefined)) && (
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{categoryLabel || 'Напрям'}</span>
                          {isActive && course.skillsCount !== undefined && course.totalSkillsCount !== undefined && (
                            <span className="font-mono text-purple-300">
                              {course.skillsCount}/{course.totalSkillsCount} навичок
                            </span>
                          )}
                        </div>
                      )}

                      {isActive && course.completionPct !== undefined && (
                        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all duration-300"
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

          {/* СЕКЦІЯ 2: Статистика */}
          {stats && stats.length > 0 && (
            <div className="pt-3">
              <DrawerSection
                title={statsTitle}
                defaultOpen={true}
              >
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {stats.map((stat, idx) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={idx} className="py-2 px-2.5 bg-slate-950/40 rounded-lg flex flex-col">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                          {StatIcon && <StatIcon className={`w-3 h-3 ${stat.iconColor || 'text-slate-400'} shrink-0`} />}
                          <span className="truncate">{stat.label}</span>
                        </span>
                        <span className={`text-xs font-bold font-mono mt-0.5 ${stat.valueColor || 'text-white'}`}>
                          {stat.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </DrawerSection>
            </div>
          )}

          {children}

          {/* СЕКЦІЯ ТЕМИ ТА СТИЛЮ */}
          <div className="pt-3">
            <DrawerSection
              title="Тема Оформлення"
              icon={Palette}
              defaultOpen={true}
            >
              <div className="py-2 px-1 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Режим інтерфейсу</span>
                <ThemeToggle showLabel={true} />
              </div>
            </DrawerSection>
          </div>

          {/* СЕКЦІЯ 3: Швидкі переходи та керування сесією */}
          {(onResetDemoState || onOpenAuthModal || onLogout || (quickLinks && quickLinks.length > 0)) && (
            <div className="pt-3">
              <DrawerSection
                title="Керування Сесією"
                defaultOpen={true}
              >
                <div className="divide-y divide-slate-800/50">
                  {onOpenAuthModal && (
                    <button
                      onClick={onOpenAuthModal}
                      className="w-full flex items-center justify-between py-2 px-1.5 hover:bg-slate-800/40 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer rounded"
                    >
                      <span className="flex items-center gap-2">
                        <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                        Авторизація / Зміна акаунта
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                    </button>
                  )}

                  {onResetDemoState && (
                    <button
                      onClick={onResetDemoState}
                      className="w-full flex items-center justify-between py-2 px-1.5 hover:bg-rose-950/20 text-slate-400 hover:text-rose-300 text-xs transition-colors cursor-pointer rounded"
                    >
                      <span className="flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                        {resetDemoLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">P(L)→0</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center justify-between py-2 px-1.5 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 text-xs transition-colors cursor-pointer rounded"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        Вийти з акаунта
                      </span>
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
                        className="w-full flex items-center justify-between py-2 px-1.5 hover:bg-slate-800/40 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer rounded"
                      >
                        <span className="flex items-center gap-2">
                          <LinkIcon className={`w-3.5 h-3.5 ${link.iconColor || 'text-slate-400'}`} />
                          {link.label}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-600" />
                      </a>
                    );
                  })}
                </div>
              </DrawerSection>
            </div>
          )}

        </div>

        {/* 3. Футер */}
        <div className="px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>{versionBadge}</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            WS Online
          </span>
        </div>

      </aside>
    </>
  );
}
