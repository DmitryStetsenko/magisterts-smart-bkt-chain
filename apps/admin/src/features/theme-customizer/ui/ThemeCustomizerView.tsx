'use client';

import React, { useState } from 'react';
import { 
  Palette, 
  Sun, 
  Moon, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Sliders, 
  Eye, 
  Info,
  Laptop
} from 'lucide-react';
import { useTheme, DEFAULT_THEME_TOKENS, CustomThemeConfig, ColorPaletteTokens } from '@sbc/ui';

interface ColorFieldProps {
  label: string;
  description: string;
  value: string;
  onChange: (val: string) => void;
}

function ColorField({ label, description, value, onChange }: ColorFieldProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--sbc-bg-subtle,#222226)] border border-[var(--sbc-border-subtle,#27272a)] transition-colors">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-[var(--sbc-text-primary,#f4f4f5)]">{label}</span>
        <span className="text-[11px] text-[var(--sbc-text-tertiary,#71717a)]">{description}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-md cursor-pointer border-0 bg-transparent p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1 text-xs font-mono rounded bg-[var(--sbc-bg-surface,#18181b)] border border-[var(--sbc-border-subtle,#27272a)] text-[var(--sbc-text-primary,#f4f4f5)] text-center uppercase"
        />
      </div>
    </div>
  );
}

/**
 * 🎨 ThemeCustomizerView
 * Повноцінний центр конфігурації палітри світлої та темної теми для всієї екосистеми Smart-BKT-Chain.
 */
export function ThemeCustomizerView() {
  const { 
    theme, 
    resolvedTheme, 
    setTheme, 
    customTokens, 
    updateCustomTokens, 
    resetCustomTokens 
  } = useTheme();

  const [activeEditingMode, setActiveEditingMode] = useState<'dark' | 'light'>('dark');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeTokens = activeEditingMode === 'dark' ? customTokens.dark : customTokens.light;

  const handleColorChange = (key: keyof ColorPaletteTokens, value: string) => {
    updateCustomTokens((prev) => ({
      ...prev,
      [activeEditingMode]: {
        ...prev[activeEditingMode],
        [key]: value,
      },
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleApplyPreset = (presetName: 'graphite' | 'deep_gray' | 'clean_light') => {
    if (presetName === 'graphite') {
      updateCustomTokens({
        dark: DEFAULT_THEME_TOKENS.dark,
      });
    } else if (presetName === 'deep_gray') {
      updateCustomTokens({
        dark: {
          bgRoot: '#0f0f11',
          bgSurface: '#161619',
          bgSubtle: '#1e1e23',
          borderSubtle: '#26262c',
          borderStrong: '#393942',
          textPrimary: '#fafafa',
          textMuted: '#9e9ea7',
          textTertiary: '#696973',
        },
      });
    } else if (presetName === 'clean_light') {
      updateCustomTokens({
        light: DEFAULT_THEME_TOKENS.light,
      });
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-2">
      {/* 1. Верхній банер заголовка */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--sbc-border-subtle,#27272a)]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--sbc-text-primary,#f4f4f5)] flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-400" />
            <span>Налаштування Наскрізної Палітри & Тем Оформлення</span>
          </h2>
          <p className="text-xs text-[var(--sbc-text-muted,#a1a1aa)] mt-1">
            Керування глобальними кольоровими токенами, що миттєво транслюються на всі веб-застосунки екосистеми (Study, Student, Teacher, Admin, Docs).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetCustomTokens();
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 2000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border border-rose-900/40 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Скинути до стандартних</span>
          </button>
        </div>
      </div>

      {/* 2. Швидке перемикання активного режиму перегляду */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div 
          onClick={() => setTheme('dark')}
          className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            theme === 'dark' 
              ? 'border-emerald-500/80 bg-emerald-500/10' 
              : 'border-[var(--sbc-border-subtle,#27272a)] hover:border-zinc-700 bg-[var(--sbc-bg-surface,#18181b)]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
              <Moon className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--sbc-text-primary,#f4f4f5)]">Темна Тема</div>
              <div className="text-[10px] text-[var(--sbc-text-muted,#a1a1aa)]">Нейтральний графіт/цинк</div>
            </div>
          </div>
          {theme === 'dark' && <Check className="w-4 h-4 text-emerald-400" />}
        </div>

        <div 
          onClick={() => setTheme('light')}
          className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            theme === 'light' 
              ? 'border-emerald-500/80 bg-emerald-500/10' 
              : 'border-[var(--sbc-border-subtle,#27272a)] hover:border-zinc-700 bg-[var(--sbc-bg-surface,#18181b)]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-900">
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--sbc-text-primary,#f4f4f5)]">Світла Тема</div>
              <div className="text-[10px] text-[var(--sbc-text-muted,#a1a1aa)]">М'який папір + білий</div>
            </div>
          </div>
          {theme === 'light' && <Check className="w-4 h-4 text-emerald-400" />}
        </div>

        <div 
          onClick={() => setTheme('system')}
          className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            theme === 'system' 
              ? 'border-emerald-500/80 bg-emerald-500/10' 
              : 'border-[var(--sbc-border-subtle,#27272a)] hover:border-zinc-700 bg-[var(--sbc-bg-surface,#18181b)]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800/60 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Laptop className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--sbc-text-primary,#f4f4f5)]">Системна</div>
              <div className="text-[10px] text-[var(--sbc-text-muted,#a1a1aa)]">Автовизначення ОС</div>
            </div>
          </div>
          {theme === 'system' && <Check className="w-4 h-4 text-emerald-400" />}
        </div>
      </div>

      {/* 3. Перемикач режиму редагування (Dark / Light) */}
      <div className="flex items-center justify-between bg-[var(--sbc-bg-surface,#18181b)] border border-[var(--sbc-border-subtle,#27272a)] p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-[var(--sbc-text-primary,#f4f4f5)]">Редагування палітри для:</span>
          <div className="inline-flex rounded-lg bg-[var(--sbc-bg-subtle,#222226)] p-0.5 border border-[var(--sbc-border-subtle,#27272a)]">
            <button
              onClick={() => setActiveEditingMode('dark')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeEditingMode === 'dark' 
                  ? 'bg-zinc-800 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Темна тема
            </button>
            <button
              onClick={() => setActiveEditingMode('light')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeEditingMode === 'light' 
                  ? 'bg-zinc-200 text-zinc-900 shadow-sm' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Світла тема
            </button>
          </div>
        </div>

        {/* Швидкі пресети */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[var(--sbc-text-muted,#a1a1aa)] mr-1">Пресети:</span>
          {activeEditingMode === 'dark' ? (
            <>
              <button
                onClick={() => handleApplyPreset('graphite')}
                className="px-2 py-1 text-[11px] rounded bg-[var(--sbc-bg-subtle,#222226)] text-zinc-300 hover:text-white border border-[var(--sbc-border-subtle,#27272a)]"
              >
                Graphite Neutral
              </button>
              <button
                onClick={() => handleApplyPreset('deep_gray')}
                className="px-2 py-1 text-[11px] rounded bg-[var(--sbc-bg-subtle,#222226)] text-zinc-300 hover:text-white border border-[var(--sbc-border-subtle,#27272a)]"
              >
                Deep Zinc
              </button>
            </>
          ) : (
            <button
              onClick={() => handleApplyPreset('clean_light')}
              className="px-2 py-1 text-[11px] rounded bg-[var(--sbc-bg-subtle,#222226)] text-zinc-300 hover:text-white border border-[var(--sbc-border-subtle,#27272a)]"
            >
              Clean Paper
            </button>
          )}
        </div>
      </div>

      {/* 4. Форма налаштування окремих кольорів */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ColorField
          label="Колір головного тла (Root Background)"
          description="Основний фон вікна додатків"
          value={activeTokens.bgRoot}
          onChange={(val) => handleColorChange('bgRoot', val)}
        />
        <ColorField
          label="Колір панелей (Surface / Card)"
          description="Фон сайдбарів, хедера та карток"
          value={activeTokens.bgSurface}
          onChange={(val) => handleColorChange('bgSurface', val)}
        />
        <ColorField
          label="Колір ховерів (Subtle Background)"
          description="Підсвітка активних кнопок та ховерів"
          value={activeTokens.bgSubtle}
          onChange={(val) => handleColorChange('bgSubtle', val)}
        />
        <ColorField
          label="Колір тонких розділювачів (Subtle Border)"
          description="Тонкі лінії між елементами списків"
          value={activeTokens.borderSubtle}
          onChange={(val) => handleColorChange('borderSubtle', val)}
        />
        <ColorField
          label="Колір контрастних рамок (Strong Border)"
          description="Межі інпутів, кнопок та бейджів"
          value={activeTokens.borderStrong}
          onChange={(val) => handleColorChange('borderStrong', val)}
        />
        <ColorField
          label="Колір головного тексту (Primary Text)"
          description="Заголовки та основний контент"
          value={activeTokens.textPrimary}
          onChange={(val) => handleColorChange('textPrimary', val)}
        />
        <ColorField
          label="Колір другорядного тексту (Muted Text)"
          description="Описи, підказки, другорядні підписи"
          value={activeTokens.textMuted}
          onChange={(val) => handleColorChange('textMuted', val)}
        />
        <ColorField
          label="Колір моноширинних підписів (Tertiary)"
          description="Версії, дати, бейджі та моно-код"
          value={activeTokens.textTertiary}
          onChange={(val) => handleColorChange('textTertiary', val)}
        />
      </div>

      {/* 5. Попередній перегляд (Live Preview Box) */}
      <div className="p-4 rounded-xl border border-[var(--sbc-border-subtle,#27272a)] bg-[var(--sbc-bg-surface,#18181b)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--sbc-text-primary,#f4f4f5)] flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Інтерактивне Прев'ю Картки (Live Preview)</span>
          </span>
          {saveSuccess && (
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 animate-fadeIn">
              <Check className="w-3 h-3" /> Токени синхронізовано
            </span>
          )}
        </div>

        <div className="p-4 rounded-lg bg-[var(--sbc-bg-root,#121215)] border border-[var(--sbc-border-subtle,#27272a)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--sbc-bg-subtle,#222226)] border border-[var(--sbc-border-strong,#3f3f46)] flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--sbc-text-primary,#f4f4f5)]">Тестова картка компетенції BKT</h4>
              <p className="text-[11px] text-[var(--sbc-text-muted,#a1a1aa)]">Приклад відображення тексту та рамок у реальному часі</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--sbc-bg-subtle,#222226)] text-[var(--sbc-text-tertiary,#71717a)] border border-[var(--sbc-border-subtle,#27272a)]">
              P(L)=0.88
            </span>
            <button className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer transition-colors">
              Перевірити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
