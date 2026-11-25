'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * 🌓 ThemeToggle
 * Компактна кнопка швидкого перемикання теми (Світла / Темна) для хедера, рейки або профілю.
 */
export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
      className={`relative inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none ${
        isDark 
          ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/80 bg-zinc-900 border border-zinc-800' 
          : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/80 bg-zinc-100 border border-zinc-300'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-amber-400 stroke-[2.2] animate-fadeIn" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-zinc-700 stroke-[2.2] animate-fadeIn" />
      )}
      {showLabel && (
        <span className="text-[11px] font-mono tracking-wide">
          {isDark ? 'Темна (Графіт)' : 'Світла (Папір)'}
        </span>
      )}
    </button>
  );
}
