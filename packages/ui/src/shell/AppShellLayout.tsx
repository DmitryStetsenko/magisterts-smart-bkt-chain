'use client';

import React from 'react';
import { 
  LucideIcon, 
  GraduationCap, 
  User, 
  Code2, 
  BookOpen, 
  Settings,
  ChevronDown,
  X
} from 'lucide-react';
import { AppName, APP_PORTS, getAppBaseUrl, ROUTES } from '@sbc/routes';

export interface NavTabItem {
  id: string;
  icon: LucideIcon;
  title: string;
  badge?: string | number;
  activeColor?: string; // наприклад, 'bg-blue-600', 'bg-indigo-600'
}

export interface AppShellLayoutProps {
  currentApp: AppName;
  // Шапка (Header Bar)
  header: {
    logoIcon?: LucideIcon;
    logoColor?: string; // наприклад, 'bg-blue-600/20 text-blue-400 border-blue-500/30'
    appName: string; // наприклад, 'Smart-BKT-Chain'
    badgeText: string; // наприклад, 'Study Portal v2.0'
    badgeColor?: string;
    breadcrumbs?: React.ReactNode; // Єдині хлібні крихти, що відображаються зліва поруч із логотипом
    centerSlot?: React.ReactNode;
    rightSlot?: React.ReactNode;
    hideHeader?: boolean;
  };
  // Вертикальна рейка (Opera Rail)
  navigationRail: {
    tabs: NavTabItem[];
    activeTab: string;
    isDrawerOpen: boolean;
    onTabClick: (tabId: string) => void;
    // Налаштування (шестерня на дні)
    settingsTabId?: string;
    onSettingsClick?: () => void;
    isSettingsActive?: boolean;
    hideRail?: boolean;
  };
  // Висувний сайдбар (Drawer)
  drawer?: {
    isOpen: boolean;
    title: React.ReactNode;
    icon?: LucideIcon;
    iconColor?: string;
    headerBadge?: string;
    children: React.ReactNode;
    widthClass?: string; // за замовчуванням 'w-full sm:w-[340px] lg:w-[380px]'
    onClose?: () => void;
  };
  // Головний робочий простір (Canvas)
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
 * - Стандартизований верхній Header Bar (h-14).
 * - Ліва тонка рейка Opera Vertical Icon Rail (w-14) з авто-генерацією іконок інших порталів.
 * - Висувний Side Drawer для DrawerSection із незалежним скролом.
 * - Головний Main Content Canvas з окремим ізольованим скролом (ніколи не скролить навігацію).
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

  // Конфігурація швидких міжпортальних переходів для нижнього стеку Opera Rail
  const ecosystemPortals: { app: AppName; icon: LucideIcon; title: string; colorClasses: string }[] = [
    {
      app: 'study',
      icon: BookOpen,
      title: 'Підручник Теорії (Study Portal - 3006)',
      colorClasses: 'bg-blue-600/15 text-blue-400 border-blue-500/20 hover:bg-blue-600/30 hover:border-blue-500/40',
    },
    {
      app: 'student',
      icon: GraduationCap,
      title: 'Інтерактивний Тренажер BKT (Student Portal - 3002)',
      colorClasses: 'bg-indigo-600/15 text-indigo-400 border-indigo-500/20 hover:bg-indigo-600/30 hover:border-indigo-500/40',
    },
    {
      app: 'teacher',
      icon: User,
      title: 'Кабінет Викладача (Teacher Portal - 3003)',
      colorClasses: 'bg-purple-600/15 text-purple-400 border-purple-500/20 hover:bg-purple-600/30 hover:border-purple-500/40',
    },
    {
      app: 'admin',
      icon: Code2,
      title: 'Панель Адміністратора CMS (Admin Portal - 3004)',
      colorClasses: 'bg-emerald-600/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600/30 hover:border-emerald-500/40',
    },
    {
      app: 'docs',
      icon: BookOpen,
      title: 'Портал Системної Документації (Docs - 3005)',
      colorClasses: 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-white',
    },
  ];

  return (
    <div className={`h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden relative ${className}`}>
      
      {/* 📌 1. STICKY TOP NAVIGATION BAR (Header Bar h-14) */}
      {!header.hideHeader && (
        <header className="h-14 w-full bg-slate-900 border-b border-slate-800/90 px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
          {/* Ліва зона: Логотип, бейдж та хлібні крихти зліва */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`p-1.5 rounded-lg border ${header.logoColor || 'bg-blue-600/20 border-blue-500/30 text-blue-400'}`}>
              <HeaderLogo className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{header.appName}</span>
                <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${header.badgeColor || 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                  {header.badgeText}
                </span>
              </h1>
            </div>

            {header.breadcrumbs && (
              <>
                <div className="h-5 w-[1px] bg-slate-800 mx-1 hidden sm:block" />
                <div className="hidden sm:flex items-center">
                  {header.breadcrumbs}
                </div>
              </>
            )}
          </div>

          {/* Центральна зона: Контекстна плашка (хлібні крихти / прогрес) */}
          {header.centerSlot && (
            <div className="hidden md:flex items-center gap-2">
              {header.centerSlot}
            </div>
          )}

          {/* Права зона: Селектор курсу та профіль */}
          {header.rightSlot && (
            <div className="flex items-center gap-3">
              {header.rightSlot}
            </div>
          )}
        </header>
      )}

      {/* 🚀 2. ГОЛОВНИЙ РОБОЧИЙ ПРОСТІР (Opera Rail + Side Drawer + Main Canvas) */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* 📑 2.1 ВЕРТИКАЛЬНА РЕЙКА НАВІГАЦІЇ (Opera Vertical Icon Rail w-14) */}
        {!navigationRail.hideRail && (
          <nav className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 justify-between shrink-0 z-20 shadow-xl select-none">
            {/* Верхній блок: Таби поточного застосунку */}
            <div className="flex flex-col items-center gap-2">
              {navigationRail.tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = navigationRail.activeTab === tab.id;
                const isDrawerOpen = navigationRail.isDrawerOpen;

                return (
                  <button
                    key={tab.id}
                    onClick={() => navigationRail.onTabClick(tab.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                      isActive
                        ? isDrawerOpen
                          ? `${tab.activeColor || 'bg-blue-600'} text-white shadow-lg shadow-blue-600/40 ring-1 ring-blue-400/50`
                          : 'bg-blue-950/80 text-blue-300 border border-blue-500/30 hover:bg-blue-900/90 hover:text-white'
                        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={tab.title}
                  >
                    <TabIcon className="w-5 h-5" />
                    {tab.badge !== undefined && tab.badge !== 0 && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 font-mono shadow-sm">
                        {tab.badge}
                      </span>
                    )}
                    {isActive && isDrawerOpen && (
                      <span className="absolute -left-1 w-1 h-5 bg-blue-400 rounded-r-full shadow-sm shadow-blue-400"></span>
                    )}
                    {isActive && !isDrawerOpen && (
                      <span className="absolute -left-1 w-1 h-2 bg-blue-400/70 rounded-r-full"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Нижній блок: Міжпортальні переходи монорепозиторію + Налаштування */}
            <div className="flex flex-col items-center gap-2 mt-auto">
              <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

              {/* Автоматична генерація іконок екосистеми (крім поточного застосунку) */}
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
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${portal.colorClasses}`}
                      title={portal.title}
                    >
                      <PortalIcon className="w-4 h-4" />
                    </a>
                  );
                })}

              {/* Розділювач перед налаштуваннями */}
              <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

              {/* Кнопка налаштувань */}
              {navigationRail.onSettingsClick && (
                <button
                  onClick={navigationRail.onSettingsClick}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                    navigationRail.isSettingsActive
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40 ring-1 ring-amber-400/50'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="Налаштування"
                >
                  <Settings className="w-5 h-5" />
                  {navigationRail.isSettingsActive && (
                    <span className="absolute -left-1 w-1 h-5 bg-amber-400 rounded-r-full shadow-sm shadow-amber-400"></span>
                  )}
                </button>
              )}
            </div>
          </nav>
        )}

        {/* 📂 2.2 ВИСУВНИЙ САЙДБАР (Side Drawer Shell) */}
        {drawer && drawer.isOpen && (
          <aside className={`${drawer.widthClass || 'w-full sm:w-[340px] lg:w-[380px]'} bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0 shadow-2xl backdrop-blur-xl animate-fadeIn z-10 overflow-hidden`}>
            {/* Шапка сайдбара */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur-md">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {drawer.icon && <drawer.icon className={`w-4 h-4 ${drawer.iconColor || 'text-blue-400'}`} />}
                <span>{drawer.title}</span>
              </h2>
              <div className="flex items-center gap-2">
                {drawer.headerBadge && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                    {drawer.headerBadge}
                  </span>
                )}
                {drawer.onClose && (
                  <button
                    onClick={drawer.onClose}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                    title="Згорнути бічну панель"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Вміст сайдбара з власним ізольованим скролом */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {drawer.children}
            </div>
          </aside>
        )}

        {/* 📖 2.3 ГОЛОВНИЙ РОБОЧИЙ ПРОСТІР (Main Content Canvas з гарантованим ізольованим скролом) */}
        <main
          ref={mainScrollRef as any}
          onScroll={onMainScroll}
          className={`flex-1 relative h-full overflow-y-auto flex flex-col ${mainClassName || 'items-center'}`}
        >
          {children}
        </main>
      </div>

      {/* 🧩 3. OVERLAYS ТА ПЛАВАЮЧІ МОДАЛЬНІ ВІКНА / TOASTS */}
      {overlays}
    </div>
  );
}
