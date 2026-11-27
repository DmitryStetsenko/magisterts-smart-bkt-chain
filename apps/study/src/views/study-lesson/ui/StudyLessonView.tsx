'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Code2,
  GraduationCap,
  Flame,
  Lightbulb,
  ShieldCheck,
  Settings,
  Lock,
} from 'lucide-react';
import { AppShellLayout, Breadcrumbs, UserProfileDrawer, AuthModal, Modal, Button, Badge } from '@sbc/ui';
import { ROUTES, buildStudyToPracticeUrl } from '@sbc/routes';
import type { ActiveStrictSessionDto } from '@sbc/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
import {
  SCHOOL_WEB_CURRICULUM,
  LessonUnit,
  CurriculumModule,
  CourseCurriculum,
} from '@/data/school-web-curriculum';
import { 
  ReaderFloatingToolbar, 
  ReaderSettings, 
  DEFAULT_READER_SETTINGS,
  ReadingTheme, 
  ReadingFont, 
  ReadingFontSize 
} from '@/features/zen-reader';
import { StudySidebarDrawer, type StudyTab } from '@/widgets/study-sidebar';
import { LessonContentCanvas } from '@/widgets/lesson-reader';

interface StudyAppClientProps {
  initialCourseSlug?: string;
  initialModuleSlug?: string;
  initialUnitSlug?: string;
  curriculum?: CourseCurriculum;
}

export function StudyAppClient({
  initialCourseSlug = 'web-algorithms-school',
  initialModuleSlug,
  initialUnitSlug,
  curriculum,
}: StudyAppClientProps) {
  const router = useRouter();
  const activeCurriculum: CourseCurriculum = curriculum || SCHOOL_WEB_CURRICULUM;

  const defaultModuleSlug =
    initialModuleSlug || activeCurriculum.modules[0]?.moduleSlug || 'school-alg-basics';
  const defaultUnitSlug =
    initialUnitSlug || activeCurriculum.modules[0]?.units[0]?.slug || 'variables-and-types';

  const [activeCourseSlug, setActiveCourseSlug] = useState<string>(
    initialCourseSlug || activeCurriculum.courseSlug
  );
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>(defaultModuleSlug);
  const [selectedUnitSlug, setSelectedUnitSlug] = useState<string>(defaultUnitSlug);
  const [publishedCourses, setPublishedCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchPublishedCourses = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/courses?status=PUBLISHED`);
        if (res.ok) {
          const list = await res.json();
          setPublishedCourses(Array.isArray(list) ? list : list.courses || []);
        }
      } catch (err) {
        console.warn('Failed to fetch published courses in study app:', err);
      }
    };
    fetchPublishedCourses();
  }, []);

  // Оновлюємо стан, якщо змінилися вхідні параметри маршруту
  useEffect(() => {
    if (initialCourseSlug) setActiveCourseSlug(initialCourseSlug);
    if (initialModuleSlug) setSelectedModuleSlug(initialModuleSlug);
    if (initialUnitSlug) setSelectedUnitSlug(initialUnitSlug);
  }, [initialCourseSlug, initialModuleSlug, initialUnitSlug]);

  // 🔒 Mastery-Gated Progression State (реальні дані BKT із API, без хардкоду)
  const [unlockedModules, setUnlockedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    activeCurriculum.modules.forEach((mod, idx) => {
      initial[mod.moduleSlug] = idx === 0;
    });
    return initial;
  });

  const [moduleMasteryScores, setModuleMasteryScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    activeCurriculum.modules.forEach((mod) => {
      initial[mod.moduleSlug] = 0;
    });
    return initial;
  });

  // Navigation Rail state
  const [activeTab, setActiveTab] = useState<StudyTab>('curriculum');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);

  // 🔐 Авторизація користувача та системний тестовий режим
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [testModeEnabled, setTestModeEnabled] = useState<boolean>(true);
  const [googleClientId, setGoogleClientId] = useState<string | undefined>(undefined);

  const currentUserId = currentUser?.id || 'demo-student';
  const currentUserName = currentUser?.profile?.firstName
    ? `${currentUser.profile.firstName} ${currentUser.profile.lastName || ''}`.trim()
    : currentUser?.email || 'Дмитро Стеценко';
  const currentUserRole = currentUser?.role || 'УЧЕНЬ';

  // 🔄 Синхронізація реального BKT-стану та гейтингу модулів із бекендом (для всіх курсів)
  useEffect(() => {
    let isCancelled = false;

    const syncLiveBktState = async () => {
      // Базовий стан для будь-якого курсу: відкритий лише 1-й модуль, усі інші заблоковані, 0%
      const nextUnlocked: Record<string, boolean> = {};
      const nextScores: Record<string, number> = {};
      activeCurriculum.modules.forEach((mod, idx) => {
        nextUnlocked[mod.moduleSlug] = idx === 0;
        nextScores[mod.moduleSlug] = 0;
      });

      try {
        const [courseRes, bktRes] = await Promise.all([
          fetch(`http://localhost:3000/api/v1/courses/${activeCourseSlug}`),
          fetch(`http://localhost:3000/api/v1/bkt/state/${currentUserId}`),
        ]);

        const bktMap: Record<string, number> = {};
        if (bktRes.ok) {
          const states: Array<{ skillId: string; pMastery: number }> = await bktRes.json();
          states.forEach((s) => {
            bktMap[s.skillId] = s.pMastery;
          });
        }

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          const dbModules = [...(courseData.modules || [])].sort(
            (a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0)
          );
          const dbSkills = courseData.skills || [];
          const defaultThreshold = courseData.defaultMasteryThreshold ?? 0.85;

          if (dbModules.length > 0) {
            const dbMasteryById: Record<string, number> = {};
            dbModules.forEach((mod: any) => {
              const modSkills = dbSkills.filter((s: any) => s.moduleId === mod.id);
              const avg =
                modSkills.length === 0
                  ? 0
                  : modSkills.reduce((acc: number, s: any) => acc + (bktMap[s.id] ?? 0), 0) /
                    modSkills.length;
              dbMasteryById[mod.id] = avg;
              nextScores[mod.slug] = Math.round(avg * 100);
            });

            // Послідовний BKT-гейтинг: кожен наступний модуль відкривається лише після опанування попереднього
            let chainUnlocked = true;
            dbModules.forEach((mod: any, idx: number) => {
              if (idx === 0) {
                nextUnlocked[mod.slug] = true;
              } else {
                const prevMod = dbModules[idx - 1];
                const prevMastery = dbMasteryById[prevMod.id] ?? 0;
                const prevThreshold = prevMod.minMasteryThreshold ?? defaultThreshold;
                chainUnlocked = chainUnlocked && prevMastery >= prevThreshold;
                nextUnlocked[mod.slug] = chainUnlocked;
              }
            });
          } else if (dbSkills.length > 0) {
            // Курси на базі прямого Skill DAG без окремих CourseModule (зокрема web-algorithms-school)
            dbSkills.forEach((skill: any, idx: number) => {
              const mastery = bktMap[skill.id] ?? 0;
              nextScores[skill.slug] = Math.round(mastery * 100);

              const deps: Array<{ parentSkillId: string; requiredMastery?: number }> =
                skill.parentDependencies || [];
              if (deps.length === 0) {
                nextUnlocked[skill.slug] = idx === 0 || true;
              } else {
                nextUnlocked[skill.slug] = deps.every(
                  (dep) => (bktMap[dep.parentSkillId] ?? 0) >= (dep.requiredMastery ?? defaultThreshold)
                );
              }
            });
          }
        }
      } catch (err) {
        console.warn('Failed to sync live BKT state in study app:', err);
      }

      if (!isCancelled) {
        setUnlockedModules(nextUnlocked);
        setModuleMasteryScores(nextScores);
      }
    };

    syncLiveBktState();
    window.addEventListener('focus', syncLiveBktState);
    return () => {
      isCancelled = true;
      window.removeEventListener('focus', syncLiveBktState);
    };
  }, [activeCourseSlug, currentUserId, activeCurriculum]);

  // 🛡️ Крос-портальне блокування підручника під час активної сесії «На оцінку» (GRADED) у тренажері
  const [activeStrictSession, setActiveStrictSession] = useState<ActiveStrictSessionDto | null>(null);
  const [isUnlockingStudy, setIsUnlockingStudy] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    const checkActiveStrictSession = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/v1/bkt/active-session/${currentUserId}?_t=${Date.now()}`,
          { cache: 'no-store' },
        );
        if (!res.ok) return;
        const data: ActiveStrictSessionDto = await res.json();
        if (!isCancelled) {
          setActiveStrictSession(data?.active && data?.mode === 'GRADED' ? data : null);
        }
      } catch {
        // Non-blocking check
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkActiveStrictSession();
      }
    };

    const handlePageShow = () => {
      // Гарантована перевірка при відновленні сторінки з bfcache (стрілки браузера Назад/Вперед)
      checkActiveStrictSession();
    };

    checkActiveStrictSession();
    window.addEventListener('focus', checkActiveStrictSession);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', checkActiveStrictSession);
    document.addEventListener('visibilitychange', handleVisibility);
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkActiveStrictSession();
      }
    }, 2000);

    return () => {
      isCancelled = true;
      window.removeEventListener('focus', checkActiveStrictSession);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', checkActiveStrictSession);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.clearInterval(intervalId);
    };
  }, [currentUserId]);

  const handleAbandonStrictSessionAndUnlock = async () => {
    if (!activeStrictSession) return;
    setIsUnlockingStudy(true);
    try {
      if (activeStrictSession.skillId) {
        await fetch(`${API_URL}/api/v1/bkt/reset-skill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUserId,
            skillId: activeStrictSession.skillId,
          }),
        });
      } else {
        await fetch(`${API_URL}/api/v1/bkt/active-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUserId,
            mode: 'TRAINING',
            active: false,
          }),
        });
      }
      setActiveStrictSession(null);
    } catch (err) {
      console.error('Failed to abandon strict session from study app:', err);
    } finally {
      setIsUnlockingStudy(false);
    }
  };
  const currentUserInitials = currentUserName
    .split(' ')
    .filter(Boolean)
    .map((s: string) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ДС';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('sbc_auth_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse saved user in study app:', e);
        }
      }
    }

    const fetchAuthConfig = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/auth/config`);
        if (res.ok) {
          const data = await res.json();
          setTestModeEnabled(!!data.testModeEnabled);
          setGoogleClientId(data.googleClientId);
        }
      } catch (err) {
        console.warn('Failed to load auth config in study app:', err);
      }
    };
    fetchAuthConfig();
  }, []);

  const handleGoogleLogin = async (credential: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sbc_auth_token', data.token);
          localStorage.setItem('sbc_auth_user', JSON.stringify(data.user));
        }
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Google login failed in study app:', err);
    }
  };

  const handleMockLogin = async (roleKey: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/auth/mock-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdOrEmail: roleKey }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sbc_auth_token', data.token);
          localStorage.setItem('sbc_auth_user', JSON.stringify(data.user));
        }
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Mock login failed in study app:', err);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sbc_auth_token');
      localStorage.removeItem('sbc_auth_user');
    }
    setCurrentUser(null);
  };

  // 📖 Zen Reading Mode State: початково стандартні налаштування
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Клавіатурна гаряча клавіша F для входу/виходу з режиму фокусного читання
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setReaderSettings((prev) => {
          if (prev.isFocusMode) {
            return {
              ...DEFAULT_READER_SETTINGS,
              isFocusMode: false,
            };
          } else {
            return {
              ...prev,
              isFocusMode: true,
              theme: 'sepia',
              font: 'sans',
              fontSize: 'normal',
              maxWidth: 'standard',
            };
          }
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Слухач скролу головного контенту для розрахунку прогресу
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const totalScroll = target.scrollHeight - target.clientHeight;
    if (totalScroll > 0) {
      const progress = (target.scrollTop / totalScroll) * 100;
      setScrollProgress(progress);
    } else {
      setScrollProgress(0);
    }
  };

  const handleTabClick = (tab: StudyTab) => {
    if (activeTab === tab) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setActiveTab(tab);
      setIsDrawerOpen(true);
    }
  };

  const handleSelectUnit = (moduleSlug: string, unitSlug: string) => {
    setSelectedModuleSlug(moduleSlug);
    setSelectedUnitSlug(unitSlug);
    // Клієнтська навігація за канонічним роутом без перезавантаження
    router.push(ROUTES.study.unit(activeCourseSlug, moduleSlug, unitSlug));
  };

  const currentModule: CurriculumModule =
    activeCurriculum.modules.find((m) => m.moduleSlug === selectedModuleSlug) ||
    activeCurriculum.modules[0] || {
      moduleNumber: 1,
      moduleSlug: 'module-1',
      title: 'Модуль 1',
      description: '',
      units: [],
    };
  const currentUnit: LessonUnit =
    currentModule.units?.find((u) => u.slug === selectedUnitSlug) ||
    currentModule.units?.[0] || {
      slug: 'unit-1',
      moduleSlug: currentModule.moduleSlug,
      moduleNumber: currentModule.moduleNumber || 1,
      title: currentModule.title || 'Вступний урок',
      gradeLevel: activeCurriculum.gradeLevel || '10–11 класи',
      estimatedMinutes: 10,
      summary: currentModule.description || '',
      sections: [],
    };

  const activeTheme = readerSettings.isFocusMode ? readerSettings.theme : 'night';
  const activeFont = readerSettings.isFocusMode ? readerSettings.font : 'sans';
  const activeFontSize = readerSettings.isFocusMode ? readerSettings.fontSize : 'normal';
  const activeMaxWidth = readerSettings.isFocusMode ? readerSettings.maxWidth : 'wide';

  const themeClasses: Record<ReadingTheme, string> = {
    night: 'bg-slate-950 text-slate-100',
    sepia: 'bg-[#f4ecd8] text-[#5b4636] border-[#e3d7be] selection:bg-[#e4d3b2] selection:text-[#3d2e22]',
    oled: 'bg-black text-neutral-100 selection:bg-neutral-800',
  };

  const fontClasses: Record<ReadingFont, string> = {
    sans: 'font-sans',
    serif: 'font-serif',
  };

  const fontSizeClasses: Record<ReadingFontSize, string> = {
    compact: 'text-[13px] leading-relaxed',
    normal: 'text-[15px] leading-relaxed',
    large: 'text-[17px] leading-loose',
    xlarge: 'text-[19px] leading-loose',
  };

  const maxWidthClasses: Record<string, string> = {
    narrow: 'max-w-2xl',
    standard: 'max-w-3xl',
    wide: 'max-w-5xl',
  };

  const contentBgClasses = 
    activeTheme === 'sepia' 
      ? 'bg-[#ede2cb] text-[#4a392b] border-[#decfae]' 
      : activeTheme === 'oled' 
        ? 'bg-neutral-900/90 text-neutral-100 border-neutral-800' 
        : 'bg-slate-900/60 text-slate-100 border-slate-800/80';

  const practiceUrl = buildStudyToPracticeUrl(
    activeCourseSlug,
    currentModule.moduleSlug,
    currentUnit.slug,
    currentModule.moduleSlug
  );

  // Конфігурація для уніфікованого Drawer
  const drawerConfig = {
    curriculum: {
      title: 'Зміст розділу та уроки',
      icon: BookOpen,
      iconColor: 'text-blue-400',
    },
    playground: {
      title: 'Пісочниця коду',
      icon: Code2,
      iconColor: 'text-emerald-400',
    },
    glossary: {
      title: 'Атлас оман і понять',
      icon: Lightbulb,
      iconColor: 'text-purple-400',
    },
    settings: {
      title: 'Налаштування середовища',
      icon: Settings,
      iconColor: 'text-amber-400',
    },
  }[activeTab];

  return (
    <AppShellLayout
        currentApp="study"
        className={`${themeClasses[activeTheme]} ${fontClasses[activeFont]} antialiased transition-colors duration-200 selection:bg-blue-500/20`}
      header={{
        appName: 'Smart-BKT-Chain',
        badgeText: 'Study',
        logoColor: 'bg-blue-500/15 text-blue-400',
        hideHeader: readerSettings.isFocusMode,
        courseBadge: (
          <span
            className="text-xs sm:text-[13px] font-normal text-slate-300 select-none tracking-normal"
            title={`Активний курс: ${activeCurriculum.courseTitle}`}
          >
            {activeCurriculum.courseTitle}
          </span>
        ),
        breadcrumbs: (
          <Breadcrumbs
            className="text-[11px]"
            items={[
              {
                label: `Модуль ${currentModule.moduleNumber}`,
                onClick: () =>
                  currentModule.units?.[0] &&
                  handleSelectUnit(currentModule.moduleSlug, currentModule.units[0].slug),
              },
              {
                label: currentUnit.title,
                badge: currentUnit.gradeLevel,
                isCurrent: true,
              },
            ]}
          />
        ),
        rightSlot: (
          <div className="flex items-center gap-2">
            {/* Кнопка профілю учня */}
            <button
              type="button"
              onClick={() => setIsProfileDrawerOpen(true)}
              className="flex items-center gap-2 hover:bg-slate-800/60 px-2 py-1 rounded-lg transition-colors cursor-pointer select-none text-left group"
              title="Натисніть для відкриття профілю, входу або вибору курсів"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {currentUserInitials}
              </div>
              <div className="hidden lg:flex flex-col leading-none">
                <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors truncate max-w-[120px]">
                  {currentUserName}
                </span>
                <span className="text-[9px] font-mono text-blue-400 mt-0.5">
                  {currentUserRole}
                </span>
              </div>
            </button>
          </div>
        ),
      }}
      navigationRail={{
        hideRail: readerSettings.isFocusMode,
        activeTab,
        isDrawerOpen,
        onTabClick: (tabId) => handleTabClick(tabId as StudyTab),
        onSettingsClick: () => handleTabClick('settings'),
        isSettingsActive: activeTab === 'settings',
        tabs: [
          {
            id: 'curriculum',
            icon: BookOpen,
            title: 'Зміст курсу та уроки',
            activeColor: 'bg-blue-600',
          },
          {
            id: 'playground',
            icon: Code2,
            title: 'Інтерактивна пісочниця коду',
            activeColor: 'bg-emerald-600',
          },
          {
            id: 'glossary',
            icon: Lightbulb,
            title: 'Атлас типових оман та помилок',
            activeColor: 'bg-purple-600',
          },
        ],
      }}
      drawer={
        !readerSettings.isFocusMode
          ? {
              isOpen: isDrawerOpen,
              widthClass: activeTab === 'playground' ? 'w-96 sm:w-[440px]' : undefined,
              title: drawerConfig.title,
              icon: drawerConfig.icon,
              iconColor: drawerConfig.iconColor,
              headerBadge: `Модуль ${currentModule.moduleNumber}`,
              children: (
                <StudySidebarDrawer
                  activeTab={activeTab}
                  activeCurriculum={activeCurriculum}
                  currentModule={currentModule}
                  currentUnit={currentUnit}
                  selectedModuleSlug={selectedModuleSlug}
                  selectedUnitSlug={selectedUnitSlug}
                  unlockedModules={unlockedModules}
                  moduleMasteryScores={moduleMasteryScores}
                  onSelectModule={setSelectedModuleSlug}
                  onSelectUnit={handleSelectUnit}
                />
              ),
            }
          : undefined
      }
      overlays={
        <>
          {/* 👤 Спільний уніфікований Drawer профілю користувача */}
          <UserProfileDrawer
            isOpen={isProfileDrawerOpen}
            onClose={() => setIsProfileDrawerOpen(false)}
            user={{
              name: currentUserName,
              roleName:
                currentUserRole === 'TEACHER'
                  ? 'Викладач'
                  : currentUserRole === 'ADMIN'
                  ? 'Адміністратор'
                  : 'Учень',
              roleBadge: currentUserRole,
              subtitle: currentUser
                ? `${currentUser.email} · ${currentUser.authProvider || 'LOCAL'}`
                : '10–11 класи · Профільний рівень',
              initials: currentUserInitials,
              avatarGradient: 'bg-gradient-to-tr from-blue-600 to-indigo-500',
            }}
            courses={[
              {
                slug: 'web-algorithms-school',
                title: SCHOOL_WEB_CURRICULUM.courseTitle,
                category: 'Інформатика 10-11',
                skillsCount: Object.values(unlockedModules).filter(Boolean).length,
                totalSkillsCount: SCHOOL_WEB_CURRICULUM.modules.length,
                completionPct: Math.round(
                  (Object.values(unlockedModules).filter(Boolean).length /
                    Math.max(1, SCHOOL_WEB_CURRICULUM.modules.length)) *
                    100
                ),
              },
              ...publishedCourses
                .filter((c) => c.slug !== 'web-algorithms-school')
                .map((c) => ({
                  slug: c.slug,
                  title: c.title,
                  category: c.category?.title || 'Програмування & IT',
                  skillsCount: (c.modules || []).length > 0 ? 1 : 0,
                  totalSkillsCount: Math.max(1, (c.modules || []).length),
                  completionPct: 0,
                })),
            ]}
            activeCourseSlug={activeCourseSlug}
            onSelectCourse={(slug) => {
              setActiveCourseSlug(slug);
              setIsProfileDrawerOpen(false);
              router.push(`/courses/${slug}`);
            }}
            stats={[
              {
                label: 'Ударний стрік',
                value: '4 дні',
                icon: Flame,
                iconColor: 'text-amber-400',
                valueColor: 'text-white',
              },
              {
                label: 'Опановано модулів',
                value: `${Object.values(unlockedModules).filter(Boolean).length}/${Math.max(
                  1,
                  activeCurriculum.modules.length
                )}`,
                icon: ShieldCheck,
                iconColor: 'text-blue-400',
                valueColor: 'text-blue-400',
              },
            ]}
            onOpenAuthModal={() => {
              setIsProfileDrawerOpen(false);
              setIsAuthModalOpen(true);
            }}
            onLogout={handleLogout}
            quickLinks={[
              {
                label: 'Перейти до Тренажера BKT',
                href: practiceUrl,
                icon: GraduationCap,
                iconColor: 'text-indigo-400',
              },
            ]}
          />

          {/* 🔐 Модальне вікно авторизації */}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            currentUser={
              currentUser
                ? {
                    id: currentUser.id,
                    email: currentUser.email,
                    name: currentUserName,
                    role: currentUserRole,
                    authProvider: currentUser.authProvider,
                  }
                : null
            }
            testModeEnabled={testModeEnabled}
            googleClientId={googleClientId}
            onGoogleLogin={handleGoogleLogin}
            onMockLogin={handleMockLogin}
            onLogout={handleLogout}
            onJoinCode={(joinCode) => {
              window.location.href = `/join/${joinCode}`;
            }}
          />
        </>
      }
      onMainScroll={handleScroll}
      mainClassName={`px-4 py-8 sm:px-8 lg:px-12 items-center transition-all ${
        readerSettings.isFocusMode ? 'focus-mode' : ''
      }`}
    >
      <LessonContentCanvas
        currentUnit={currentUnit}
        maxWidthClass={maxWidthClasses[activeMaxWidth]}
        fontSizeClass={fontSizeClasses[activeFontSize]}
        contentBgClass={contentBgClasses}
        practiceUrl={practiceUrl}
      />

          {/* 🛠️ ПЛАВАЮЧА ПАНЕЛЬ ЗРУЧНОГО ЧИТАННЯ (Zen Reading Floating Toolbar) */}
          <ReaderFloatingToolbar
            settings={readerSettings}
            onUpdateSettings={setReaderSettings}
            scrollProgressPct={scrollProgress}
            estimatedMinutesLeft={currentUnit.estimatedMinutes}
          />

          {/* 🔒 Оверлей серверного блокування підручника під час активної сесії «На оцінку» (GRADED) */}
          <Modal
            isOpen={Boolean(activeStrictSession?.active)}
            onClose={() => {}}
            hideCloseButton
            closeOnOverlayClick={false}
            closeOnEscape={false}
            overlayTestId="study-lock-overlay"
            size="md"
            icon={
              <div className="w-10 h-10 rounded-xl bg-amber-950/50 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
            }
            title="Підручник тимчасово заблоковано"
            subtitle={
              <Badge variant="warning" size="xs" mono className="mt-1">
                Суворий режим «На оцінку» активний
              </Badge>
            }
          >
            <div className="flex flex-col gap-4">
              <p className="text-xs text-[var(--sbc-text-muted,#909090)] leading-relaxed">
                У вашому кабінеті тренажера зараз відкрито завдання у{' '}
                <strong className="text-[var(--sbc-text-primary,#cccccc)]">Суворому режимі (На оцінку)</strong>
                {activeStrictSession?.skillTitle ? (
                  <> з теми <strong className="text-amber-300">«{activeStrictSession.skillTitle}»</strong></>
                ) : null}.
                Для чесної діагностики знань доступ до підручника в усіх вкладках обмежено до завершення спроби.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={practiceUrl}
                  className="w-full h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Повернутися до тренажера</span>
                </a>

                <Button
                  variant="danger"
                  size="md"
                  fullWidth
                  isLoading={isUnlockingStudy}
                  data-testid="study-lock-abandon-btn"
                  onClick={handleAbandonStrictSessionAndUnlock}
                >
                  {isUnlockingStudy
                    ? 'Скидання спроби...'
                    : 'Перервати спробу (скинути прогрес навички) і відкрити урок'}
                </Button>
              </div>
            </div>
          </Modal>
      </AppShellLayout>
  );
}
