'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Code2,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  Eye,
  FileText,
  Sliders,
  Check,
  RotateCcw,
  Lightbulb,
  ExternalLink,
  Save,
  Layers,
  ArrowRight,
  ArrowLeft,
  Clock,
  Type,
  FileCode,
  CheckCheck,
} from 'lucide-react';
import type { CourseDto, CourseModuleDto } from '@sbc/types';

export interface LessonBlockState {
  summary: string;
  conceptExplanation: string;
  hasCode: boolean;
  codeLang: string;
  codeSnippet: string;
  codeExplanation: string;
  hasMisconception: boolean;
  wrongBelief: string;
  realityExplanation: string;
  fixTip: string;
  takeaways: string[];
}

export const DEFAULT_BLOCKS: LessonBlockState = {
  summary: '',
  conceptExplanation: '',
  hasCode: true,
  codeLang: 'html',
  codeSnippet: '',
  codeExplanation: '',
  hasMisconception: true,
  wrongBelief: '',
  realityExplanation: '',
  fixTip: '',
  takeaways: [''],
};

export const HTML_PRESET: LessonBlockState = {
  summary: 'Опануйте базову структуру HTML-документа: призначення doctype, контейнерів <html>, <head> та <body>, а також семантику текстових блоків.',
  conceptExplanation: 'HTML (HyperText Markup Language) — це стандартизована мова розмітки веб-сторінок. Браузер інтерпретує теги як дерево DOM (Document Object Model). Головне правило: теги повинні коректно вкладатися і закриватися, а службові метадані завжди відокремлюються від видимого контенту.',
  hasCode: true,
  codeLang: 'html',
  codeSnippet: `<!DOCTYPE html>
<html lang="uk">
  <head>
    <meta charset="UTF-8">
    <title>Моя Перша Сторінка</title>
  </head>
  <body>
    <header>
      <h1>Привіт, Веб!</h1>
    </header>
    <main>
      <p>Це базовий абзац тексту з правильною структурою.</p>
    </main>
  </body>
</html>`,
  codeExplanation: 'Тег <!DOCTYPE html> повідомляє браузеру про стандарт HTML5. Всередині <head> розміщуються метадані та кодування utf-8, а видима частина знаходиться виключно в <body>.',
  hasMisconception: true,
  wrongBelief: '«<!DOCTYPE html> — це звичайний закриваючий HTML-тег, і його можна взагалі пропустити без наслідків».',
  realityExplanation: 'DOCTYPE — це директива для браузера, а не тег (у нього немає закриваючої пари). Якщо пропустити DOCTYPE, браузер перейде в режим quirks mode (режим сумісності), де верстка може рендеритися некоректно.',
  fixTip: 'Завжди починайте будь-який HTML-файл з першого рядка: <!DOCTYPE html>.',
  takeaways: [
    '<!DOCTYPE html> вмикає сучасний стандартний режим рендерингу HTML5.',
    'Усі метадані розміщуються в <head>, а видимий користувачу контент — у <body>.',
    'Коректне вкладення тегів формує валідне дерево DOM без помилок парсингу.',
  ],
};

export const JS_PRESET: LessonBlockState = {
  summary: 'Дізнайтеся різницю між оголошенням змінних через const та let, область видимості блоку (block scope) та роботу з примітивними типами.',
  conceptExplanation: 'У сучасному стандарті ECMAScript ключове слово var вважається застарілим через випливання (hoisting) та відсутність блокової видимості. Для значень, які не змінюють посилання, завжди використовуйте const. Якщо змінна перепризначається в циклі чи логіці — використовуйте let.',
  hasCode: true,
  codeLang: 'javascript',
  codeSnippet: `// 1. Незмінне посилання
const maxScore = 100;

// 2. Змінна, що змінюватиметься під час виконання
let currentScore = 0;
currentScore += 25;

console.log(\`Поточний бал: \${currentScore} із \${maxScore}\`);`,
  codeExplanation: 'Використання const захищає змінну від випадкового перепризначення в іншому місці коду та оптимізує компіляцію рушієм V8.',
  hasMisconception: true,
  wrongBelief: '«Якщо масив або об\'єкт оголошено через const, то його елементи і властивості не можна змінювати».',
  realityExplanation: 'const фіксує лише саме посилання на об\'єкт у пам\'яті. Мутувати властивості об\'єкта (наприклад, user.age = 20) або додавати елементи в масив (arr.push(1)) дозволено.',
  fixTip: 'Якщо вам потрібна повна незмінність структури об\'єкта — використовуйте Object.freeze(obj).',
  takeaways: [
    'За замовчуванням завжди використовуйте const для всіх змінних.',
    'let застосовується виключно тоді, коли значення дійсно перепризначається.',
    'const захищає від перепризначення посилання, але не забороняє мутацію полів об\'єкта.',
  ],
};

export const CSS_PRESET: LessonBlockState = {
  summary: 'Вивчіть основи одновимірної розкладки CSS Flexbox: головну та поперечну осі, вирівнювання justify-content та align-items.',
  conceptExplanation: 'Flexbox — це сучасний модульний підхід до проектування адаптивних компонентів. Контейнер із display: flex керує розміщенням дочірніх елементів уздовж головної осі (flex-direction: row або column). Це усуває потребу у використанні float або складних абсолютних координат.',
  hasCode: true,
  codeLang: 'css',
  codeSnippet: `.navbar-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #0f172a;
}`,
  codeExplanation: 'justify-content: space-between розтягує перший елемент ліворуч, а останній праворуч, align-items: center вирівнює їх по вертикальному центру.',
  hasMisconception: true,
  wrongBelief: '«justify-content завжди вирівнює по горизонталі, а align-items завжди по вертикалі».',
  realityExplanation: 'justify-content вирівнює вздовж головної осі (Main Axis). Якщо flex-direction змінено на column, головною віссю стає вертикаль, і justify-content починає керувати вертикальним розміщенням!',
  fixTip: 'Завжди перевіряйте поточний flex-direction перед налаштуванням осей вирівнювання.',
  takeaways: [
    'display: flex перетворює контейнер на гнучкий флекс-бокс.',
    'justify-content керує вирівнюванням вздовж головної осі.',
    'align-items вирівнює елементи вздовж перпендикулярної (поперечної) осі.',
  ],
};

export const PYTHON_PRESET: LessonBlockState = {
  summary: 'Опануйте базовий синтаксис мови Python: відступи (indentation), динамічну типізацію та оголошення функцій через def.',
  conceptExplanation: 'Python вирізняється чистим синтаксисом, де замість фігурних дужок { } використовується строгий відступ у 4 пробіли. Функції оголошуються ключовим словом def, повертають значення за допомогою return, а типи аргументів можна документувати за допомогою Type Hints.',
  hasCode: true,
  codeLang: 'python',
  codeSnippet: `def calculate_mastery(correct_answers: int, total_tasks: int) -> float:
    """Обчислює коефіцієнт успішності учня."""
    if total_tasks == 0:
        return 0.0
    return round(correct_answers / total_tasks, 2)

score = calculate_mastery(9, 10)
print(f"Коефіцієнт засвоєння: {score}")`,
  codeExplanation: 'Type Hints (int, float) слугують для статичного аналізу і роблять код самодокументованим.',
  hasMisconception: true,
  wrongBelief: '«У Python можна змішувати табуляцію (Tab) та 4 пробіли для оформлення відступів у межах одного файлу».',
  realityExplanation: 'Python 3 суворо забороняє змішування символів Tab і пробілів для відступів і викидає виняток TabError.',
  fixTip: 'Налаштуйте редактор так, щоб клавіша Tab автоматично вставляла рівно 4 пробіли (Spaces).',
  takeaways: [
    'Відступи в Python є частиною синтаксису мови, а не просто оформленням.',
    'Функції оголошуються за допомогою ключового слова def.',
    'Type Hints полегшують налагодження коду та роботу команди.',
  ],
};

/**
 * Серіалізує структуровані блоки уроку у вивірений семантичний Markdown
 */
export const serializeLessonBlocks = (b: LessonBlockState, moduleTitle: string): string => {
  const parts: string[] = [];

  // Summary / Вступ
  if (b.summary.trim()) {
    parts.push(`> 📌 **Короткий огляд теми:**\n> ${b.summary.trim().replace(/\n/g, '\n> ')}`);
  }

  // Теоретичні концепції
  if (b.conceptExplanation.trim()) {
    parts.push(`### 📖 Теоретичні поняття\n\n${b.conceptExplanation.trim()}`);
  }

  // Блок коду
  if (b.hasCode && b.codeSnippet.trim()) {
    const lang = b.codeLang || 'html';
    let codeBlock = `### 💻 Приклад коду (${lang.toUpperCase()})\n\n\`\`\`${lang}\n${b.codeSnippet.trim()}\n\`\`\``;
    if (b.codeExplanation.trim()) {
      codeBlock += `\n\n*${b.codeExplanation.trim()}*`;
    }
    parts.push(codeBlock);
  }

  // Картка типової омани (Misconception Alert)
  if (b.hasMisconception && (b.wrongBelief.trim() || b.realityExplanation.trim())) {
    let misc = `### ⚠️ Типова омана учнів (Misconception Alert)\n`;
    if (b.wrongBelief.trim()) {
      misc += `> ❌ **Хибне уявлення:** ${b.wrongBelief.trim()}\n>\n`;
    }
    if (b.realityExplanation.trim()) {
      misc += `> ✅ **Реальність:** ${b.realityExplanation.trim()}\n`;
    }
    if (b.fixTip.trim()) {
      misc += `>\n> 💡 **Порада/Лайфхак:** ${b.fixTip.trim()}`;
    }
    parts.push(misc);
  }

  // Ключові висновки
  const validTakeaways = b.takeaways.filter((t) => t.trim().length > 0);
  if (validTakeaways.length > 0) {
    const list = validTakeaways.map((t) => `- ${t.trim()}`).join('\n');
    parts.push(`### 🎯 Ключові висновки (Takeaways)\n\n${list}`);
  }

  return parts.join('\n\n');
};

/**
 * Парсер простого Markdown у блоки або фолбек до conceptExplanation
 */
export const parseMarkdownToBlocks = (md: string, defaultTitle: string): LessonBlockState => {
  if (!md || !md.trim()) {
    return { ...DEFAULT_BLOCKS, takeaways: [''] };
  }

  const state: LessonBlockState = {
    summary: '',
    conceptExplanation: '',
    hasCode: false,
    codeLang: 'html',
    codeSnippet: '',
    codeExplanation: '',
    hasMisconception: false,
    wrongBelief: '',
    realityExplanation: '',
    fixTip: '',
    takeaways: [],
  };

  const summaryMatch = md.match(/> 📌 \*\*Короткий огляд теми:\*\*\s*\n((?:> .*\n?)+)/);
  if (summaryMatch) {
    state.summary = summaryMatch[1].replace(/^> /gm, '').trim();
  }

  const codeMatch = md.match(/```([a-z0-9_-]+)?\n([\s\S]*?)```/);
  if (codeMatch) {
    state.hasCode = true;
    state.codeLang = codeMatch[1] || 'html';
    state.codeSnippet = codeMatch[2].trim();
  }

  const wrongMatch = md.match(/> ❌ \*\*Хибне уявлення:\*\*\s*(.*)/);
  const realityMatch = md.match(/> ✅ \*\*Реальність:\*\*\s*(.*)/);
  const tipMatch = md.match(/> 💡 \*\*Порада\/Лайфхак:\*\*\s*(.*)/);
  if (wrongMatch || realityMatch) {
    state.hasMisconception = true;
    if (wrongMatch) state.wrongBelief = wrongMatch[1].trim();
    if (realityMatch) state.realityExplanation = realityMatch[1].trim();
    if (tipMatch) state.fixTip = tipMatch[1].trim();
  }

  const takeawaysMatch = md.match(/### 🎯 Ключові висновки(?: \(Takeaways\))?\s*\n([\s\S]*?)(?:$|###)/);
  if (takeawaysMatch) {
    const lines = takeawaysMatch[1]
      .split('\n')
      .map((l) => l.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
    if (lines.length > 0) state.takeaways = lines;
  }

  if (!summaryMatch && !codeMatch && !wrongMatch) {
    state.conceptExplanation = md.trim();
  } else {
    const conceptMatch = md.match(/### 📖 Теоретичні поняття\s*\n\n([\s\S]*?)(?:$|###)/);
    if (conceptMatch) {
      state.conceptExplanation = conceptMatch[1].trim();
    }
  }

  if (state.takeaways.length === 0) {
    state.takeaways = [''];
  }

  return state;
};

export interface TheoryLessonBuilderViewProps {
  course: CourseDto;
  module: CourseModuleDto;
  apiUrl?: string;
  onBack: () => void;
  onModuleUpdated: (updatedModule: CourseModuleDto) => void;
  onSelectOtherModule?: (targetModule: CourseModuleDto) => void;
}

export const TheoryLessonBuilderView: React.FC<TheoryLessonBuilderViewProps> = ({
  course,
  module,
  apiUrl = 'http://localhost:3000',
  onBack,
  onModuleUpdated,
  onSelectOtherModule,
}) => {
  const [activeTab, setActiveTab] = useState<'BUILDER' | 'PREVIEW' | 'RAW_MARKDOWN'>('BUILDER');
  const [blocks, setBlocks] = useState<LessonBlockState>(DEFAULT_BLOCKS);
  const [rawMarkdown, setRawMarkdown] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or re-parse when module changes
  useEffect(() => {
    if (module?.description) {
      const parsed = parseMarkdownToBlocks(module.description, module.title);
      setBlocks(parsed);
      setRawMarkdown(module.description);
    } else {
      setBlocks({ ...DEFAULT_BLOCKS, takeaways: [''] });
      setRawMarkdown('');
    }
    setSaveSuccess(false);
    setError(null);
  }, [module?.id, module?.description, module?.title]);

  // Synchronize when switching to raw markdown tab
  const handleSwitchTab = (tab: 'BUILDER' | 'PREVIEW' | 'RAW_MARKDOWN') => {
    if (tab === 'RAW_MARKDOWN' && activeTab === 'BUILDER') {
      const serialized = serializeLessonBlocks(blocks, module.title);
      setRawMarkdown(serialized);
    } else if (tab === 'BUILDER' && activeTab === 'RAW_MARKDOWN') {
      const parsed = parseMarkdownToBlocks(rawMarkdown, module.title);
      setBlocks(parsed);
    }
    setActiveTab(tab);
  };

  // Listen to preset and scroll events from the sidebar drawer
  useEffect(() => {
    const handlePresetEvent = (e: any) => {
      const presetKey = e.detail?.preset;
      if (presetKey === 'html') applyPreset(HTML_PRESET);
      else if (presetKey === 'js') applyPreset(JS_PRESET);
      else if (presetKey === 'css') applyPreset(CSS_PRESET);
      else if (presetKey === 'python') applyPreset(PYTHON_PRESET);
    };

    const handleScrollEvent = (e: any) => {
      const cardId = e.detail?.cardId;
      if (cardId) {
        if (activeTab !== 'BUILDER') setActiveTab('BUILDER');
        setTimeout(() => {
          const el = document.getElementById(cardId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            el.classList.add('bg-slate-900/40');
            setTimeout(() => el.classList.remove('bg-slate-900/40'), 1500);
          }
        }, 50);
      }
    };

    window.addEventListener('admin-theory-apply-preset', handlePresetEvent);
    window.addEventListener('admin-theory-scroll-to-card', handleScrollEvent);
    return () => {
      window.removeEventListener('admin-theory-apply-preset', handlePresetEvent);
      window.removeEventListener('admin-theory-scroll-to-card', handleScrollEvent);
    };
  }, [activeTab, blocks, module?.title]);

  const applyPreset = (preset: LessonBlockState) => {
    setBlocks({ ...preset });
    setSaveSuccess(false);
  };

  // Add / remove takeaway bullets
  const handleAddTakeaway = () => {
    setBlocks((prev) => ({ ...prev, takeaways: [...prev.takeaways, ''] }));
  };

  const handleUpdateTakeaway = (index: number, val: string) => {
    setBlocks((prev) => {
      const next = [...prev.takeaways];
      next[index] = val;
      return { ...prev, takeaways: next };
    });
  };

  const handleRemoveTakeaway = (index: number) => {
    setBlocks((prev) => {
      const next = prev.takeaways.filter((_, i) => i !== index);
      return { ...prev, takeaways: next.length > 0 ? next : [''] };
    });
  };

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      let finalDescription = '';
      if (activeTab === 'RAW_MARKDOWN') {
        finalDescription = rawMarkdown;
      } else {
        finalDescription = serializeLessonBlocks(blocks, module.title);
      }

      const res = await fetch(`${apiUrl}/api/v1/courses/${course.id}/modules/${module.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: finalDescription,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Помилка при збереженні конспекту');
      }

      const updated = await res.json();
      setSaveSuccess(true);
      onModuleUpdated(updated);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save theory error:', err);
      setError(err.message || 'Не вдалося зберегти конспект');
    } finally {
      setIsSaving(false);
    }
  };

  // Reading time and text metrics
  const textMetrics = useMemo(() => {
    const textToMeasure = activeTab === 'RAW_MARKDOWN'
      ? rawMarkdown
      : `${blocks.summary} ${blocks.conceptExplanation} ${blocks.codeExplanation} ${blocks.realityExplanation} ${blocks.takeaways.join(' ')}`;
    const words = textToMeasure.trim() ? textToMeasure.trim().split(/\s+/).length : 0;
    const chars = textToMeasure.length;
    const minutes = Math.max(1, Math.ceil(words / 130));
    return { words, chars, minutes };
  }, [blocks, rawMarkdown, activeTab]);

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-fadeIn select-text">
      {/* 🧭 Minimalist Borderless Top Action Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Повернутися до Студії курсу"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Модуль {(course.modules || []).findIndex((m) => m.id === module.id) + 1 || 1}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-500 truncate">/{module.slug}</span>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold animate-fadeIn ml-2">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Збережено</span>
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white truncate mt-0.5" title={module.title}>
              {module.title}
            </h1>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-between md:justify-end">
          {/* Borderless Subtabs switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900/90 text-xs">
            <button
              type="button"
              onClick={() => handleSwitchTab('BUILDER')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'BUILDER'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Конструктор</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('PREVIEW')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'PREVIEW'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Перегляд Учня</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('RAW_MARKDOWN')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'RAW_MARKDOWN'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Markdown</span>
            </button>
          </div>

          {/* Reading time metric */}
          <div className="hidden xl:flex items-center gap-2 text-slate-400 text-xs font-mono select-none">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>~{textMetrics.minutes} хв</span>
            <span className="text-slate-700">•</span>
            <span>{textMetrics.words} слів</span>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isSaving
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Збереження...' : 'Зберегти'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border-l-2 border-rose-500 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 🧩 TAB 1: MINIMALIST BORDERLESS BLOCK BUILDER */}
      {activeTab === 'BUILDER' && (
        <div className="flex flex-col divide-y divide-slate-800/60 w-full">
          {/* Quick Presets Ribbon */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-5 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Дидактичні шаблони:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => applyPreset(HTML_PRESET)}
                className="px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-emerald-300 hover:text-white transition-colors font-medium cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡ HTML</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset(JS_PRESET)}
                className="px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-indigo-300 hover:text-white transition-colors font-medium cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡ JS</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset(CSS_PRESET)}
                className="px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-teal-300 hover:text-white transition-colors font-medium cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡ CSS</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset(PYTHON_PRESET)}
                className="px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-amber-300 hover:text-white transition-colors font-medium cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡ Python</span>
              </button>
              <button
                type="button"
                onClick={() => setBlocks({ ...DEFAULT_BLOCKS, takeaways: [''] })}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title="Очистити всі поля"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SECTION 1: Вступ & Мета теми */}
          <section id="theory-card-summary" className="py-6 flex flex-col gap-3 transition-colors rounded-xl px-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>📌 Вступ & Мета теми (Summary & Hook)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Короткий мотиваційний вступ: навіщо учневі ця тема і який головний результат уроку.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{blocks.summary.length} симв.</span>
            </div>

            <textarea
              rows={3}
              value={blocks.summary}
              onChange={(e) => setBlocks({ ...blocks, summary: e.target.value })}
              placeholder="Наприклад: Опануйте фундаментальні правила роботи з розміткою HTML-документа, структуру тегів <head> і <body> та уникнення помилок відображення..."
              className="w-full p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/60 hover:border-slate-700 focus:border-blue-500/50 focus:bg-slate-950 text-slate-200 placeholder-slate-500 text-xs focus:outline-none leading-relaxed font-sans transition-colors"
            />
          </section>

          {/* SECTION 2: Теоретичні поняття (Core Concepts) */}
          <section id="theory-card-concepts" className="py-6 flex flex-col gap-3 transition-colors rounded-xl px-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>📖 Теоретичні поняття (Core Concepts)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Фундаментальні визначення, правила, моделі та концепції, що розкривають тему уроку.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{blocks.conceptExplanation.length} симв.</span>
            </div>

            <textarea
              rows={7}
              value={blocks.conceptExplanation}
              onChange={(e) => setBlocks({ ...blocks, conceptExplanation: e.target.value })}
              placeholder="Детально опишіть теоретичний матеріал: термінологію, принципи роботи технології, правила синтаксису чи математичні закономірності..."
              className="w-full p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/60 hover:border-slate-700 focus:border-emerald-500/50 focus:bg-slate-950 text-slate-200 placeholder-slate-500 text-xs focus:outline-none leading-relaxed font-sans transition-colors"
            />
          </section>

          {/* SECTION 3: Інтерактивний приклад коду (Interactive Code Snippet) */}
          <section id="theory-card-code" className="py-6 flex flex-col gap-3.5 transition-colors rounded-xl px-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>💻 Інтерактивний приклад коду (Code Snippet)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Зразковий виконуваний фрагмент коду з вибором мови програмування та поясненням.
                  </p>
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-400">Мова:</label>
                <select
                  value={blocks.codeLang}
                  onChange={(e) => setBlocks({ ...blocks, codeLang: e.target.value })}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-850 text-indigo-300 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
                >
                  <option value="html">HTML</option>
                  <option value="javascript">JavaScript</option>
                  <option value="css">CSS</option>
                  <option value="python">Python</option>
                  <option value="sql">SQL</option>
                  <option value="typescript">TypeScript</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Фрагмент коду:</label>
              <textarea
                rows={8}
                value={blocks.codeSnippet}
                onChange={(e) => setBlocks({ ...blocks, codeSnippet: e.target.value })}
                placeholder={`// Вставте чистий зразок коду для демонстрації учням...`}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 focus:border-indigo-500/60 text-indigo-200 placeholder-slate-600 text-xs font-mono leading-relaxed focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Пояснення роботи цього коду (на що звернути увагу):
              </label>
              <textarea
                rows={2}
                value={blocks.codeExplanation}
                onChange={(e) => setBlocks({ ...blocks, codeExplanation: e.target.value })}
                placeholder="Опишіть, що відбувається у ключових рядках коду і які стандарти тут проілюстровано..."
                className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800/60 hover:border-slate-700 focus:border-indigo-500/60 focus:bg-slate-950 text-slate-300 placeholder-slate-500 text-xs leading-relaxed focus:outline-none transition-colors"
              />
            </div>
          </section>

          {/* SECTION 4: Картка типової омани учнів (Misconception Alert) */}
          <section id="theory-card-misconception" className="py-6 flex flex-col gap-3.5 transition-colors rounded-xl px-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-amber-300">⚠️ Картка типової омани учнів (Misconception Alert)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Дидактичний інструмент запобігання поширеним помилкам перед переходом до практики в Тренажері.
                  </p>
                </div>
              </div>
            </div>

            {/* Clean borderless callout with a subtle left accent line */}
            <div className="pl-4 border-l-2 border-amber-500/60 flex flex-col gap-4 py-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                    <span>❌ Хибне уявлення (помилка учнів):</span>
                  </label>
                  <textarea
                    rows={3}
                    value={blocks.wrongBelief}
                    onChange={(e) => setBlocks({ ...blocks, wrongBelief: e.target.value })}
                    placeholder="Що новачки часто помилково думають або роблять неправильно..."
                    className="w-full p-3 rounded-xl bg-slate-900/80 border border-rose-500/20 hover:border-rose-500/40 focus:border-rose-500/70 focus:bg-slate-950 text-rose-200 placeholder-slate-600 text-xs leading-relaxed focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                    <span>✅ Як насправді (наукове роз'яснення):</span>
                  </label>
                  <textarea
                    rows={3}
                    value={blocks.realityExplanation}
                    onChange={(e) => setBlocks({ ...blocks, realityExplanation: e.target.value })}
                    placeholder="Чому це працює інакше з точки зору архітектури чи стандарту..."
                    className="w-full p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 hover:border-emerald-500/40 focus:border-emerald-500/70 focus:bg-slate-950 text-emerald-200 placeholder-slate-600 text-xs leading-relaxed focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>💡 Порада для самоперевірки (Tip / Rule of Thumb):</span>
                </label>
                <input
                  type="text"
                  value={blocks.fixTip}
                  onChange={(e) => setBlocks({ ...blocks, fixTip: e.target.value })}
                  placeholder="Коротке мнемонічне правило або лайфхак..."
                  className="w-full p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/20 hover:border-amber-500/40 focus:border-amber-400/70 focus:bg-slate-950 text-amber-200 placeholder-slate-600 text-xs focus:outline-none transition-colors"
                />
              </div>
            </div>
          </section>

          {/* SECTION 5: Ключові висновки (Key Takeaways) */}
          <section id="theory-card-takeaways" className="py-6 flex flex-col gap-3 transition-colors rounded-xl px-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-xs">
                  5
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🎯 Ключові висновки (Takeaways)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    3–5 підсумкових тез, які учень повинен надійно зафіксувати у пам'яті після уроку.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddTakeaway}
                className="px-2.5 py-1 rounded-md hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Додати тезу</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {blocks.takeaways.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-purple-400 font-bold shrink-0 w-5 text-right">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateTakeaway(idx, e.target.value)}
                    placeholder={`Підсумок ${idx + 1}...`}
                    className="flex-1 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/60 hover:border-slate-700 focus:border-purple-500/60 focus:bg-slate-950 text-slate-200 placeholder-slate-600 text-xs focus:outline-none transition-colors"
                  />
                  {blocks.takeaways.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTakeaway(idx)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Видалити цю тезу"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 👁️ TAB 2: MINIMALIST STUDENT LIVE PREVIEW */}
      {activeTab === 'PREVIEW' && (
        <div className="py-4 flex flex-col gap-6 max-w-4xl mx-auto w-full animate-fadeIn">
          <div className="pb-4 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                Підручник Теорії • Zen Focus Reading Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{module.title}</h2>
            </div>
            <span className="text-xs font-mono text-slate-400 select-none">
              ~{textMetrics.minutes} хв читання
            </span>
          </div>

          {/* Rendered Summary */}
          {blocks.summary && (
            <div className="p-4 rounded-xl bg-blue-500/10 border-l-2 border-blue-500 text-slate-200 text-xs sm:text-sm leading-relaxed">
              <span className="font-bold text-blue-400 block mb-1">📌 Короткий огляд:</span>
              <p className="whitespace-pre-wrap">{blocks.summary}</p>
            </div>
          )}

          {/* Rendered Concepts */}
          {blocks.conceptExplanation && (
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📖 Теоретичні поняття</span>
              </h3>
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans p-4 rounded-xl bg-slate-900/60 border border-slate-800/50">
                {blocks.conceptExplanation}
              </div>
            </div>
          )}

          {/* Rendered Code Snippet */}
          {blocks.hasCode && blocks.codeSnippet && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>Приклад коду ({blocks.codeLang.toUpperCase()})</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">read-only syntax</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/60 font-mono text-xs text-indigo-200 overflow-x-auto whitespace-pre">
                {blocks.codeSnippet}
              </div>
              {blocks.codeExplanation && (
                <p className="text-xs text-slate-400 italic px-1">{blocks.codeExplanation}</p>
              )}
            </div>
          )}

          {/* Rendered Misconception Alert */}
          {blocks.hasMisconception && (blocks.wrongBelief || blocks.realityExplanation) && (
            <div className="p-5 rounded-xl bg-amber-500/5 border-l-2 border-amber-500/60 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Типова омана учнів (Misconception Alert)</span>
              </h4>

              {blocks.wrongBelief && (
                <div className="p-3 rounded-lg bg-rose-500/10 text-xs text-rose-200 leading-relaxed border-l-2 border-rose-500/60">
                  <span className="font-bold text-rose-400 block mb-0.5">❌ Хибне уявлення:</span>
                  {blocks.wrongBelief}
                </div>
              )}

              {blocks.realityExplanation && (
                <div className="p-3 rounded-lg bg-emerald-500/10 text-xs text-emerald-200 leading-relaxed border-l-2 border-emerald-500/60">
                  <span className="font-bold text-emerald-400 block mb-0.5">✅ Як насправді:</span>
                  {blocks.realityExplanation}
                </div>
              )}

              {blocks.fixTip && (
                <div className="text-xs text-amber-300/90 font-medium flex items-center gap-1.5 pt-1">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{blocks.fixTip}</span>
                </div>
              )}
            </div>
          )}

          {/* Rendered Takeaways */}
          {blocks.takeaways.filter((t) => t.trim().length > 0).length > 0 && (
            <div className="flex flex-col gap-2 pt-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Ключові висновки</span>
              </h3>
              <ul className="flex flex-col gap-2">
                {blocks.takeaways
                  .filter((t) => t.trim().length > 0)
                  .map((point, i) => (
                    <li
                      key={i}
                      className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/40"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 📝 TAB 3: MINIMALIST RAW MARKDOWN */}
      {activeTab === 'RAW_MARKDOWN' && (
        <div className="py-2 flex flex-col gap-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Двостороння синхронізація з Markdown</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Ви можете вільно редагувати сирий конспект тут або копіювати його в інші системи — блоки оновляться автоматично.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">{rawMarkdown.length} символів</span>
          </div>

          <textarea
            rows={18}
            value={rawMarkdown}
            onChange={(e) => setRawMarkdown(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800/80 focus:border-emerald-500/60 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none transition-colors"
          />
        </div>
      )}
    </div>
  );
};
