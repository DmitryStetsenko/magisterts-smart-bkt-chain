'use client';

import React from 'react';
import { 
  LucideIcon, 
  GraduationCap, 
  User, 
  Code2, 
  BookOpen, 
  Settings,
  X
} from 'lucide-react';
import { AppName, getAppBaseUrl } from '@sbc/routes';

export interface NavTabItem {
  id: string;
  icon: LucideIcon;
  title: string;
  badge?: string | number;
  activeColor?: string;
}

export interface AppShellLayoutProps {
  currentApp: AppName;
  header: {
    logoIcon?: LucideIcon;
    logoColor?: string;
    appName: string;
    badgeText: string;
    badgeColor?: string;
    courseBadge?: React.ReactNode;
    breadcrumbs?: React.ReactNode;
    centerSlot?: React.ReactNode;
    rightSlot?: React.ReactNode;
    hideHeader?: boolean;
  };
  navigationRail: {
    tabs: NavTabItem[];
    activeTab: string;
    isDrawerOpen: boolean;
    onTabClick: (tabId: string) => void;
    settingsTabId?: string;
    onSettingsClick?: () => void;
    isSettingsActive?: boolean;
    hideRail?: boolean;
  };
  drawer?: {
    isOpen: boolean;
    title: React.ReactNode;
    icon?: LucideIcon;
    iconColor?: string;
    headerBadge?: string;
    children: React.ReactNode;
    widthClass?: string;
    onClose?: () => void;
  };
  children: React.ReactNode;
  mainScrollRef?: React.Ref<HTMLElement>;
  onMainScroll?: (e: React.UIEvent<HTMLElement>) => void;
  mainClassName?: string;
  className?: string;
  overlays?: React.ReactNode;
}

/**
 * 🏛️ AppShellLayout (Opera Shell v2.0 Standard)
 * Єдиний уніфікований лейаут для всіх застосунків екосистеми Smart-BKT-Chain:
 * - Фіксована висота екрану: h-screen w-screen overflow-hidden.
 * - Стандартизований верхній Header Bar (h-[62px]).
 * - Ліва тонка рейка Opera Vertical Icon Rail (w-12) у мінімалістичному безрамковому стилі.
 * - Висувний Side Drawer для DrawerSection із чистими розділювачами та власним скролом.
 * - Головний Main Content Canvas з окремим ізольованим скролом.
 */
export function AppShellLayout({
  currentApp,
  header,
  navigationRail,
  drawer,
  children,
  mainScrollRef,
  onMainScroll,
  mainClassName,
  className = '',
  overlays,
}: AppShellLayoutProps) {
  const HeaderLogo = header.logoIcon || BookOpen;

  const ecosystemPortals: { app: AppName; icon: LucideIcon; title: string; hoverColor: string }[] = [
    {
      app: 'study',
      icon: BookOpen,
      title: 'Підручник Теорії (Study Portal - 3006)',
      hoverColor: 'hover:text-blue-400 hover:bg-slate-800/60',
    },
    {
      app: 'student',
      icon: GraduationCap,
      title: 'Інтерактивний Тренажер BKT (Student Portal - 3002)',
      hoverColor: 'hover:text-indigo-400 hover:bg-slate-800/60',
    },
    {
      app: 'teacher',
      icon: User,
      title: 'Кабінет Викладача (Teacher Portal - 3003)',
      hoverColor: 'hover:text-purple-400 hover:bg-slate-800/60',
    },
    {
      app: 'admin',
      icon: Code2,
      title: 'Панель Адміністратора CMS (Admin Portal - 3004)',
      hoverColor: 'hover:text-emerald-400 hover:bg-slate-800/60',
    },
    {
      app: 'docs',
      icon: BookOpen,
      title: 'Портал Системної Документації (Docs - 3005)',
      hoverColor: 'hover:text-slate-200 hover:bg-slate-800/60',
    },
  ];

  return (
    <div className={`h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden relative ${className}`}>
      
      {/* 📌 1. STICKY TOP NAVIGATION BAR (Minimalist Borderless Header h-[56px]) */}
      {!header.hideHeader && (
        <header className="h-[56px] w-full bg-slate-900 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${header.logoColor || 'bg-blue-500/15 text-blue-400'}`}>
              <HeaderLogo className="w-4 h-4" />
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-[13px] font-bold text-white flex items-center gap-1.5 leading-none">
                  <span>{header.appName}</span>
                  <span className="text-[10px] font-mono font-normal text-slate-500">
                    {header.badgeText}
                  </span>
                </h1>

                {header.courseBadge && (
                  <>
                    <div className="h-3 w-[1px] bg-slate-800 ml-1 hidden sm:block" />
                    <div className="hidden sm:flex items-center pl-1 leading-none">
                      {header.courseBadge}
                    </div>
                  </>
                )}
              </div>

              {header.breadcrumbs && (
                <div className="flex items-center mt-1.5">
                  {header.breadcrumbs}
                </div>
              )}
            </div>
          </div>

          {header.centerSlot && (
            <div className="hidden md:flex items-center gap-2">
              {header.centerSlot}
            </div>
          )}

          {header.rightSlot && (
            <div className="flex items-center gap-2.5">
              {header.rightSlot}
            </div>
          )}
        </header>
      )}

      {/* 🚀 2. ГОЛОВНИЙ РОБОЧИЙ ПРОСТІР (Opera Rail + Side Drawer + Main Canvas) */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* 📑 2.1 ВЕРТИКАЛЬНА РЕЙКА НАВІГАЦІЇ (Minimalist Borderless Icon Rail w-12) */}
        {!navigationRail.hideRail && (
          <nav className="w-12 bg-slate-900 border-r border-slate-800/80 flex flex-col items-center py-2.5 justify-between shrink-0 z-20 select-none">
            {/* Верхній блок: Таби поточного застосунку */}
            <div className="flex flex-col items-center gap-1.5">
              {navigationRail.tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = navigationRail.activeTab === tab.id;
                const isDrawerOpen = navigationRail.isDrawerOpen;

                return (
                  <button
                    key={tab.id}
                    onClick={() => navigationRail.onTabClick(tab.id)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer relative ${
                      isActive
                        ? 'bg-slate-800/90 text-white'
                        : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                    title={tab.title}
                  >
                    <TabIcon className="w-[18px] h-[18px]" />
                    {tab.badge !== undefined && tab.badge !== 0 && (
                      <span className="absolute -top-0.5 -right-0.5 px-1 py-0.1 rounded-full text-[8px] font-bold bg-amber-500 text-slate-950 font-mono">
                        {tab.badge}
                      </span>
                    )}
                    {isActive && (
                      <span
                        className={`absolute -left-1.5 w-0.5 rounded-r-full transition-all ${
                          isDrawerOpen ? 'h-5 bg-purple-400' : 'h-2.5 bg-purple-400/60'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Нижній блок: Міжпортальні переходи монорепозиторію + Налаштування */}
            <div className="flex flex-col items-center gap-1 mt-auto">
              <div className="w-6 h-[1px] bg-slate-800/80 my-1"></div>

              {ecosystemPortals
                .filter((p) => p.app !== currentApp)
                .map((portal) => {
                  const PortalIcon = portal.icon;
                  const portalUrl = getAppBaseUrl(portal.app);

                  return (
                    <a
                      key={portal.app}
                      href={portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 transition-colors cursor-pointer ${portal.hoverColor}`}
                      title={portal.title}
                    >
                      <PortalIcon className="w-4 h-4" />
                    </a>
                  );
                })}

              {navigationRail.onSettingsClick && (
                <>
                  <div className="w-6 h-[1px] bg-slate-800/80 my-1"></div>
                  <button
                    onClick={navigationRail.onSettingsClick}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer relative ${
                      navigationRail.isSettingsActive
                        ? 'bg-slate-800/90 text-amber-400'
                        : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                    title="Налаштування"
                  >
                    <Settings className="w-[18px] h-[18px]" />
                    {navigationRail.isSettingsActive && (
                      <span className="absolute -left-1.5 w-0.5 h-5 bg-amber-400 rounded-r-full" />
                    )}
                  </button>
                </>
              )}
            </div>
          </nav>
        )}

        {/* 📂 2.2 ВИСУВНИЙ САЙДБАР (Clean Side Drawer Shell) */}
        {drawer && drawer.isOpen && (
          <aside className={`${drawer.widthClass || 'w-72 sm:w-80'} bg-slate-900 border-r border-slate-800/80 flex flex-col shrink-0 animate-fadeIn z-10 overflow-hidden`}>
            {/* Шапка сайдбара */}
            <div className="px-3.5 py-2.5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
              <h2 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                {drawer.icon && <drawer.icon className={`w-3.5 h-3.5 ${drawer.iconColor || 'text-purple-400'}`} />}
                <span>{drawer.title}</span>
              </h2>
              <div className="flex items-center gap-1.5">
                {drawer.headerBadge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-800/60">
                    {drawer.headerBadge}
                  </span>
                )}
                {drawer.onClose && (
                  <button
                    onClick={drawer.onClose}
                    className="p-1 text-slate-500 hover:text-white hover:bg-slate-800/60 rounded transition-colors cursor-pointer"
                    title="Згорнути бічну панель"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Вміст сайдбара з власним ізольованим скролом */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-3">
              {drawer.children}
            </div>
          </aside>
        )}

        {/* 📖 2.3 ГОЛОВНИЙ РОБОЧИЙ ПРОСТІР */}
        <main
          ref={mainScrollRef as any}
          onScroll={onMainScroll}
          className={`flex-1 relative h-full overflow-y-auto flex flex-col ${mainClassName || 'items-center'}`}
        >
          {children}
        </main>
      </div>

      {/* 🧩 3. OVERLAYS */}
      {overlays}
    </div>
  );
}
