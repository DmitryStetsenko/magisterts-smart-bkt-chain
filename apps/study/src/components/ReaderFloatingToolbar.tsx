'use client';

import React from 'react';
import { 
  Eye, 
  Minimize2, 
  Maximize2, 
  Type, 
  Palette, 
  BookOpen, 
  Sun, 
  Moon, 
  Compass, 
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export type ReadingTheme = 'night' | 'sepia' | 'oled';
export type ReadingFont = 'sans' | 'serif';
export type ReadingFontSize = 'compact' | 'normal' | 'large' | 'xlarge';

export interface ReaderSettings {
  isFocusMode: boolean;
  theme: ReadingTheme;
  font: ReadingFont;
  fontSize: ReadingFontSize;
  maxWidth: 'narrow' | 'standard' | 'wide';
}

interface ReaderFloatingToolbarProps {
  settings: ReaderSettings;
  onUpdateSettings: (updater: (prev: ReaderSettings) => ReaderSettings) => void;
  scrollProgressPct: number;
  estimatedMinutesLeft: number;
}

export function ReaderFloatingToolbar({
  settings,
  onUpdateSettings,
  scrollProgressPct,
  estimatedMinutesLeft,
}: ReaderFloatingToolbarProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const toggleFocusMode = () => {
    onUpdateSettings((prev) => ({ ...prev, isFocusMode: !prev.isFocusMode }));
  };

  const setTheme = (theme: ReadingTheme) => {
    onUpdateSettings((prev) => ({ ...prev, theme }));
  };

  const setFont = (font: ReadingFont) => {
    onUpdateSettings((prev) => ({ ...prev, font }));
  };

  const setWidth = (maxWidth: 'narrow' | 'standard' | 'wide') => {
    onUpdateSettings((prev) => ({ ...prev, maxWidth }));
  };

  const increaseFontSize = () => {
    onUpdateSettings((prev) => {
      const order: ReadingFontSize[] = ['compact', 'normal', 'large', 'xlarge'];
      const idx = order.indexOf(prev.fontSize);
      if (idx < order.length - 1) {
        return { ...prev, fontSize: order[idx + 1] };
      }
      return prev;
    });
  };

  const decreaseFontSize = () => {
    onUpdateSettings((prev) => {
      const order: ReadingFontSize[] = ['compact', 'normal', 'large', 'xlarge'];
      const idx = order.indexOf(prev.fontSize);
      if (idx > 0) {
        return { ...prev, fontSize: order[idx - 1] };
      }
      return prev;
    });
  };

  return (
    <>
      {/* 1. Тонкий прогрес-бар скролу у верхній частині екрана */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400 transition-all duration-150 ease-out shadow-sm shadow-blue-500/50"
          style={{ width: `${Math.min(100, Math.max(0, scrollProgressPct))}%` }}
        />
      </div>

      {/* 2. Плаваючий віджет у правому нижньому кутку */}
      <aside 
        aria-label="Параметри зручного читання"
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 select-none"
      >
        {/* Розгорнуте меню налаштувань */}
        {isOpen && (
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col gap-4 w-72 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Параметри читання
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Закрити панель"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Блок 1: Фокусний повноекранний режим */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Фокус-режим:</span>
              <button
                onClick={toggleFocusMode}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  settings.isFocusMode
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title="Приховати сайдбари та меню (гаряча клавіша F)"
              >
                {settings.isFocusMode ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Увімкнено [F]</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Звичайний [F]</span>
                  </>
                )}
              </button>
            </div>

            {/* Блок 2: Розмір тексту A- / A+ */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Розмір тексту:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={decreaseFontSize}
                  disabled={settings.fontSize === 'compact'}
                  className="px-2 py-0.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                  title="Зменшити кегль"
                >
                  A-
                </button>
                <span className="px-1 text-[11px] font-mono text-blue-400 min-w-[50px] text-center font-bold">
                  {settings.fontSize === 'compact' && '15px'}
                  {settings.fontSize === 'normal' && '17px'}
                  {settings.fontSize === 'large' && '19px'}
                  {settings.fontSize === 'xlarge' && '21px'}
                </span>
                <button
                  onClick={increaseFontSize}
                  disabled={settings.fontSize === 'xlarge'}
                  className="px-2 py-0.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                  title="Збільшити кегль"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Блок 3: Кольорова тема читання */}
            <div className="flex flex-col gap-1.5">
              <span className="text-slate-300 font-medium">Колір фону:</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setTheme('night')}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 border text-[10px] font-semibold transition-all cursor-pointer ${
                    settings.theme === 'night'
                      ? 'bg-slate-950 border-blue-500 text-blue-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Глибока темна ніч (Slate)"
                >
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ніч</span>
                </button>

                <button
                  onClick={() => setTheme('sepia')}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 border text-[10px] font-semibold transition-all cursor-pointer ${
                    settings.theme === 'sepia'
                      ? 'bg-[#221c17] border-amber-500/80 text-amber-200 shadow-sm'
                      : 'bg-[#1a1512] border-slate-800 text-stone-400 hover:text-amber-200'
                  }`}
                  title="Тепла сепія (без синього спектра, для вечора)"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Сепія</span>
                </button>

                <button
                  onClick={() => setTheme('oled')}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 border text-[10px] font-semibold transition-all cursor-pointer ${
                    settings.theme === 'oled'
                      ? 'bg-black border-purple-500 text-purple-300 shadow-sm'
                      : 'bg-black/70 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Абсолютний чорний для OLED дисплеїв"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[8px] font-bold text-white">
                    0
                  </span>
                  <span>OLED</span>
                </button>
              </div>
            </div>

            {/* Блок 4: Гарнітура шрифту */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Шрифт:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setFont('sans')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    settings.font === 'sans'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Гротеск (Sans)
                </button>
                <button
                  onClick={() => setFont('serif')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-serif transition-all ${
                    settings.font === 'serif'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Книжковий (Serif)
                </button>
              </div>
            </div>

            {/* Блок 5: Ширина колонки */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Ширина:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setWidth('narrow')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all ${
                    settings.maxWidth === 'narrow' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="680px — золотий стандарт книг"
                >
                  680px
                </button>
                <button
                  onClick={() => setWidth('standard')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all ${
                    settings.maxWidth === 'standard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="768px — стандарт статей"
                >
                  768px
                </button>
                <button
                  onClick={() => setWidth('wide')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all ${
                    settings.maxWidth === 'wide' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="960px — широкий огляд"
                >
                  960px
                </button>
              </div>
            </div>

            {/* Індикатор залишкового часу */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Залишилося: ~{estimatedMinutesLeft} хв</span>
              <span className="font-mono text-blue-400 font-semibold">{Math.round(scrollProgressPct)}%</span>
            </div>
          </div>
        )}

        {/* Компактна плаваюча кнопка розгортання */}
        <div className="flex items-center gap-2">
          {/* Швидка кнопка фокус-режиму */}
          <button
            onClick={toggleFocusMode}
            className={`px-3 py-2.5 rounded-2xl border shadow-xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer backdrop-blur-md active:scale-95 ${
              settings.isFocusMode
                ? 'bg-blue-600 border-blue-400 text-white shadow-blue-600/40 ring-2 ring-blue-400/50'
                : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Перемкнути Режим Зручного Читання (F)"
          >
            {settings.isFocusMode ? (
              <>
                <Minimize2 className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Вийти з фокусу [F]</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Режим Читання [F]</span>
              </>
            )}
          </button>

          {/* Кнопка розгортання панелі налаштувань */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`p-2.5 rounded-2xl border shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md active:scale-95 ${
              isOpen
                ? 'bg-indigo-600 border-indigo-400 text-white'
                : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Налаштування шрифту та кольорів читання"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
