'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ThemeMode, CustomThemeConfig, ThemeContextValue } from './theme.types';
import { DEFAULT_THEME_TOKENS } from './defaultTokens';

const THEME_MODE_STORAGE_KEY = 'sbc_theme_mode';
const THEME_MODE_UPDATED_AT_KEY = 'sbc_theme_mode_updated_at';
const THEME_LAST_RESOLVED_KEY = 'sbc_last_resolved_theme';
const THEME_TOKENS_STORAGE_KEY = 'sbc_custom_theme_tokens';

function getApiBaseUrl(): string {
  const envUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
  return (envUrl || 'http://localhost:3000/api/v1').replace(/\/+$/, '');
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeVariables(resolvedTheme: 'dark' | 'light', tokens: CustomThemeConfig) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const currentTokens = resolvedTheme === 'dark' ? tokens.dark : tokens.light;

  // Встановлюємо або знімаємо CSS клас dark для Tailwind dark: варіантів
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Інжектуємо наскрізні CSS змінні
  root.style.setProperty('--sbc-bg-root', currentTokens.bgRoot);
  root.style.setProperty('--sbc-bg-surface', currentTokens.bgSurface);
  root.style.setProperty('--sbc-bg-subtle', currentTokens.bgSubtle);
  root.style.setProperty('--sbc-border-subtle', currentTokens.borderSubtle);
  root.style.setProperty('--sbc-border-strong', currentTokens.borderStrong);
  root.style.setProperty('--sbc-text-primary', currentTokens.textPrimary);
  root.style.setProperty('--sbc-text-muted', currentTokens.textMuted);
  root.style.setProperty('--sbc-text-tertiary', currentTokens.textTertiary);

  // Також підтримуємо базові Shadcn/Tailwind змінні
  root.style.setProperty('--background', currentTokens.bgRoot);
  root.style.setProperty('--foreground', currentTokens.textPrimary);
  root.style.setProperty('--card', currentTokens.bgSurface);
  root.style.setProperty('--card-foreground', currentTokens.textPrimary);
  root.style.setProperty('--border', currentTokens.borderSubtle);

  // 🩶 Перевизначаємо Tailwind кольори slate через нециклічні змінні --sbc-slate-*
  const slateMap: Record<string, string> =
    resolvedTheme === 'dark'
      ? {
          '950': currentTokens.bgRoot,
          '900': currentTokens.bgSurface,
          '800': currentTokens.borderSubtle,
          '700': currentTokens.borderStrong,
          '600': currentTokens.textTertiary,
          '500': currentTokens.textTertiary,
          '400': currentTokens.textMuted,
          '300': currentTokens.textPrimary,
          '200': '#dcdcdc',
          '100': '#e8e8e8',
          '50': '#ffffff',
        }
      : {
          '950': currentTokens.bgRoot,
          '900': currentTokens.bgSurface,
          '800': currentTokens.bgSubtle,
          '700': currentTokens.borderSubtle,
          '600': currentTokens.borderStrong,
          '500': currentTokens.textTertiary,
          '400': currentTokens.textMuted,
          '300': currentTokens.textPrimary,
          '200': currentTokens.textPrimary,
          '100': currentTokens.textPrimary,
          '50': currentTokens.textPrimary,
        };

  Object.entries(slateMap).forEach(([shade, value]) => {
    root.style.setProperty(`--sbc-slate-${shade}`, value);
    root.style.setProperty(`--color-slate-${shade}`, value);
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [defaultTheme, setDefaultThemeState] = useState<ThemeMode>('dark');
  const [hasLocalThemeOverride, setHasLocalThemeOverride] = useState<boolean>(false);
  const [systemIsDark, setSystemIsDark] = useState<boolean>(true);
  const [customTokens, setCustomTokensState] = useState<CustomThemeConfig>(DEFAULT_THEME_TOKENS);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Ініціалізація з localStorage + завантаження глобальної теми за замовчуванням із бекенду
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Зчитування збереженого локального режиму або останньої активної теми (запобігає спалаху dark при навігації між модулями)
    const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY) as ThemeMode | null;
    const lastResolved = localStorage.getItem(THEME_LAST_RESOLVED_KEY) as 'dark' | 'light' | null;
    const hasLocal = Boolean(savedMode && (savedMode === 'dark' || savedMode === 'light' || savedMode === 'system'));
    if (hasLocal && savedMode) {
      setThemeState(savedMode);
      setHasLocalThemeOverride(true);
    } else if (lastResolved === 'light' || lastResolved === 'dark') {
      setThemeState(lastResolved);
    } else if (!document.documentElement.classList.contains('dark')) {
      setThemeState('light');
    }

    // 2. Зчитування локальних кастомних токенів
    const savedTokens = localStorage.getItem(THEME_TOKENS_STORAGE_KEY);
    if (savedTokens) {
      try {
        const parsed = JSON.parse(savedTokens);
        setCustomTokensState({
          dark: { ...DEFAULT_THEME_TOKENS.dark, ...parsed.dark },
          light: { ...DEFAULT_THEME_TOKENS.light, ...parsed.light },
        });
      } catch (e) {
        console.warn('Failed to parse saved theme tokens', e);
      }
    }

    // 3. Відстеження системної теми
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemIsDark(mediaQuery.matches);
    setIsInitialized(true);

    // 2.5 Завантаження глобального налаштування теми за замовчуванням з SystemConfig API
    let isMounted = true;
    fetch(`${getApiBaseUrl()}/system-config/theme`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        const remoteDefault = data.defaultTheme as ThemeMode | undefined;
        const remoteUpdatedAt = Number(data.updatedAt) || 0;
        const localMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
        const localUpdatedAt = Number(localStorage.getItem(THEME_MODE_UPDATED_AT_KEY)) || 0;

        if (remoteDefault === 'dark' || remoteDefault === 'light' || remoteDefault === 'system') {
          setDefaultThemeState(remoteDefault);
          // Застосовуємо глобальну тему за замовчуванням, якщо користувач не обрав локальне перевизначення
          // АБО якщо адміністратор оновив глобальну тему пізніше за локальний вибір користувача
          if (!localMode || (remoteUpdatedAt > 0 && remoteUpdatedAt > localUpdatedAt)) {
            setThemeState(remoteDefault);
            if (localMode && remoteUpdatedAt > localUpdatedAt) {
              localStorage.removeItem(THEME_MODE_STORAGE_KEY);
              localStorage.removeItem(THEME_MODE_UPDATED_AT_KEY);
              setHasLocalThemeOverride(false);
            }
          }
        }
        if (data.customTokens && !localStorage.getItem(THEME_TOKENS_STORAGE_KEY)) {
          setCustomTokensState({
            dark: { ...DEFAULT_THEME_TOKENS.dark, ...(data.customTokens.dark || {}) },
            light: { ...DEFAULT_THEME_TOKENS.light, ...(data.customTokens.light || {}) },
          });
        }
      })
      .catch(() => {
        // Silent fallback when API is offline
      });

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // 4. Слухач storage для міжвкладкової синхронізації вводу
    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_MODE_STORAGE_KEY) {
        if (e.newValue === 'dark' || e.newValue === 'light' || e.newValue === 'system') {
          setThemeState(e.newValue);
          setHasLocalThemeOverride(true);
        } else if (e.newValue === null) {
          setHasLocalThemeOverride(false);
        }
      }
      if (e.key === THEME_TOKENS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setCustomTokensState(parsed);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const resolvedTheme: 'dark' | 'light' = useMemo(() => {
    if (theme === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return theme;
  }, [theme, systemIsDark]);

  // Застосування змінних до DOM лише ПІСЛЯ ініціалізації (запобігає спалаху dark при навігації між роутами)
  useEffect(() => {
    if (!isInitialized) return;
    applyThemeVariables(resolvedTheme, customTokens);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_LAST_RESOLVED_KEY, resolvedTheme);
    }
  }, [isInitialized, resolvedTheme, customTokens]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    setHasLocalThemeOverride(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
      localStorage.setItem(THEME_MODE_UPDATED_AT_KEY, String(Date.now()));
      // Відправляємо кастомну подію для синхронізації в рамках одного вікна
      window.dispatchEvent(new Event('sbc-theme-change'));
    }
  }, []);

  const clearLocalThemeOverride = useCallback(() => {
    setHasLocalThemeOverride(false);
    setThemeState(defaultTheme);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(THEME_MODE_STORAGE_KEY);
      localStorage.removeItem(THEME_MODE_UPDATED_AT_KEY);
      window.dispatchEvent(new Event('sbc-theme-change'));
    }
  }, [defaultTheme]);

  const setDefaultTheme = useCallback(async (mode: ThemeMode) => {
    setDefaultThemeState(mode);
    setThemeState(mode);
    setHasLocalThemeOverride(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(THEME_MODE_STORAGE_KEY);
      localStorage.removeItem(THEME_MODE_UPDATED_AT_KEY);
    }
    const res = await fetch(`${getApiBaseUrl()}/system-config/theme`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultTheme: mode }),
    });
    if (!res.ok) {
      throw new Error(`Failed to persist default theme (${res.status})`);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextMode);
  }, [resolvedTheme, setTheme]);

  const updateCustomTokens = useCallback((
    updater: Partial<CustomThemeConfig> | ((prev: CustomThemeConfig) => CustomThemeConfig)
  ) => {
    setCustomTokensState((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : {
        dark: { ...prev.dark, ...(updater.dark || {}) },
        light: { ...prev.light, ...(updater.light || {}) },
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_TOKENS_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const resetCustomTokens = useCallback(() => {
    setCustomTokensState(DEFAULT_THEME_TOKENS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(THEME_TOKENS_STORAGE_KEY);
    }
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    defaultTheme,
    setDefaultTheme,
    hasLocalThemeOverride,
    clearLocalThemeOverride,
    customTokens,
    updateCustomTokens,
    resetCustomTokens,
  }), [
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    defaultTheme,
    setDefaultTheme,
    hasLocalThemeOverride,
    clearLocalThemeOverride,
    customTokens,
    updateCustomTokens,
    resetCustomTokens,
  ]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    // Безпечний fallback якщо контекст не обгорнуто (наприклад, для ізольованих компонентів)
    return {
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: () => {},
      toggleTheme: () => {},
      defaultTheme: 'dark',
      setDefaultTheme: async () => {},
      hasLocalThemeOverride: false,
      clearLocalThemeOverride: () => {},
      customTokens: DEFAULT_THEME_TOKENS,
      updateCustomTokens: () => {},
      resetCustomTokens: () => {},
    };
  }
  return context;
}
