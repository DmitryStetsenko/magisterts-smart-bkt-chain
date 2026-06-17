'use client';

import React from 'react';

interface ThemeSwitcherProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export function ThemeSwitcher({ isDarkMode, onToggle }: ThemeSwitcherProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg border transition-all ${
        isDarkMode 
          ? 'bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-zinc-850' 
          : 'bg-white border-zinc-200 text-indigo-600 hover:bg-zinc-50'
      }`}
      title="Змінити тему"
    >
      {isDarkMode ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-3.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
