'use client';

import React from 'react';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';
import { DrawerSection } from '../drawer/DrawerSection';
import { useTheme } from './ThemeContext';
import { ThemeMode } from './theme.types';

export interface ThemeSettingsSectionProps {
  /** 'drawer' wraps in collapsible DrawerSection (Rule 7); 'panel' renders as a standalone block */
  variant?: 'drawer' | 'panel';
  defaultOpen?: boolean;
  title?: string;
  className?: string;
}

const THEME_OPTIONS: Array<{
  mode: ThemeMode;
  label: string;
  shortLabel: string;
  icon: typeof Moon;
}> = [
  { mode: 'dark', label: 'Темна', shortLabel: 'Темна', icon: Moon },
  { mode: 'light', label: 'Світла', shortLabel: 'Світла', icon: Sun },
  { mode: 'system', label: 'Системна', shortLabel: 'Авто', icon: Monitor },
];

/**
 * 🎨 ThemeSettingsSection (Rule 6 & Rule 7 Standard)
 * Уніфікована секція вибору теми оформлення для вкладки «Налаштування»
 * в усіх порталах екосистеми Smart-BKT-Chain (Student, Study, Teacher, Admin).
 */
export function ThemeSettingsSection({
  variant = 'drawer',
  defaultOpen = true,
  title = 'Тема оформлення',
  className = '',
}: ThemeSettingsSectionProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const activePaletteLabel = isDark ? 'Antigravity Dark' : 'Clean Paper';

  const controls = (
    <div className="flex flex-col gap-2.5 py-1" data-testid="theme-settings-section">
      <div
        role="radiogroup"
        aria-label="Вибір теми оформлення"
        className="grid grid-cols-3 gap-1.5"
      >
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.mode;

          return (
            <button
              key={opt.mode}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-testid={`theme-mode-${opt.mode}`}
              onClick={() => setTheme(opt.mode)}
              className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer select-none border ${
                isSelected
                  ? 'bg-[var(--sbc-bg-subtle,#2a2d2e)] text-[var(--sbc-text-primary,#cccccc)] border-amber-500/50'
                  : 'bg-[var(--sbc-bg-root,#181818)] text-[var(--sbc-text-muted,#909090)] border-[var(--sbc-border-subtle,#2b2b2b)] hover:text-[var(--sbc-text-primary,#cccccc)] hover:bg-[var(--sbc-bg-subtle,#2a2d2e)]'
              }`}
              title={`Увімкнути режим: ${opt.label}`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isSelected
                    ? opt.mode === 'light'
                      ? 'text-amber-400'
                      : opt.mode === 'dark'
                      ? 'text-indigo-400'
                      : 'text-emerald-400'
                    : ''
                }`}
              />
              <span className="leading-none">{opt.shortLabel}</span>
              {isSelected && (
                <Check className="w-2.5 h-2.5 text-amber-400 absolute top-1 right-1" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-[var(--sbc-text-tertiary,#6b6b6b)] px-0.5">
        <span>Активна палітра:</span>
        <span className="font-mono text-[var(--sbc-text-muted,#909090)]">
          {activePaletteLabel}
        </span>
      </div>
    </div>
  );

  if (variant === 'panel') {
    return (
      <div className={`flex flex-col gap-2.5 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--sbc-text-muted,#909090)]">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span>{title}</span>
        </div>
        {controls}
      </div>
    );
  }

  return (
    <DrawerSection
      title={title}
      icon={Palette}
      iconColor="text-amber-400"
      titleColor="text-amber-400 group-hover:text-amber-300"
      badge={isDark ? 'Темна' : 'Світла'}
      defaultOpen={defaultOpen}
      className={className}
    >
      {controls}
    </DrawerSection>
  );
}
