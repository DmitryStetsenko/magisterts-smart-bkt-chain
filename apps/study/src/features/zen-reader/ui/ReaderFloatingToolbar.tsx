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

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  isFocusMode: false,
  theme: 'night',
  font: 'sans',
  fontSize: 'normal',
  maxWidth: 'wide',
};

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

  // Автоматично закривати панель налаштувань, якщо фокус-режим вимикається
  React.useEffect(() => {
    if (!settings.isFocusMode) {
      setIsOpen(false);
    }
  }, [settings.isFocusMode]);

  const toggleFocusMode = () => {
    onUpdateSettings((prev) => {
      if (prev.isFocusMode) {
        // Вихід із режиму читання: скидання до стандартних стилів системи
        return {
          ...DEFAULT_READER_SETTINGS,
          isFocusMode: false,
        };
      } else {
        // Вхід у режим читання: активація фокусного режиму з «Теплою Сепією» за замовчуванням
        return {
          ...prev,
          isFocusMode: true,
          theme: 'sepia', // Науково найзручніший режим для зору (теплий спектр без синього)
          font: 'sans',
          fontSize: 'normal',
          maxWidth: 'standard',
        };
      }
    });
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
        {/* Розгорнуте меню налаштувань - ДОСТУПНЕ ВИКЛЮЧНО В РЕЖИМІ ЧИТАННЯ */}
        {settings.isFocusMode && isOpen && (
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
                  {settings.fontSize === 'large' && '18px'}
                  {settings.fontSize === 'xlarge' && '20px'}
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

            {/* Блок 3: Гарнітура шрифту */}
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

            {/* Блок 4: Ширина колонки */}
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

        {/* Компактна плаваюча панель управління читанням */}
        <div className="flex items-center gap-2">
          {/* ⚡ Швидкі кнопки перемикання колірних режимів читання (Сепія / Ніч / OLED) - активні у режимі фокусу */}
          {settings.isFocusMode && (
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-2xl shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-right-2 duration-150">
              {/* Кнопка 1: Тепла Сепія (Default читання - без синього спектра) */}
              <button
                onClick={() => setTheme('sepia')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'sepia'
                    ? 'bg-amber-600/90 text-amber-100 border border-amber-400/80 shadow-md shadow-amber-600/30'
                    : 'text-stone-400 hover:text-amber-200 hover:bg-slate-800/80'
                }`}
                title="Тепла Сепія: м'який теплий тон без синього спектра (ідеально для зору)"
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Сепія</span>
              </button>

              {/* Кнопка 2: Ніч (Slate) */}
              <button
                onClick={() => setTheme('night')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'night'
                    ? 'bg-blue-600 text-white border border-blue-400/80 shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-blue-300 hover:bg-slate-800/80'
                }`}
                title="Ніч: глибока темно-синя палітра (Slate)"
              >
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px]">Ніч</span>
              </button>

              {/* Кнопка 3: OLED (Чорний) */}
              <button
                onClick={() => setTheme('oled')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'oled'
                    ? 'bg-neutral-800 text-purple-200 border border-purple-400/80 shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="OLED: абсолютний чорний фон"
              >
                <span className="w-3 h-3 rounded-full bg-black border border-purple-400/80 flex items-center justify-center text-[7px] font-bold text-white">
                  0
                </span>
                <span className="text-[11px]">OLED</span>
              </button>
            </div>
          )}

          {/* Головна кнопка Фокус-Режиму */}
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
                <span className="hidden sm:inline">Вийти [F]</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Режим Читання [F]</span>
              </>
            )}
          </button>

          {/* Додаткові параметри типографіки (кегль, гарнітура, ширина) */}
          {settings.isFocusMode && (
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className={`p-2.5 rounded-2xl border shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md active:scale-95 animate-in fade-in duration-150 ${
                isOpen
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Налаштування кеглю, шрифту та ширини"
            >
              <Type className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
