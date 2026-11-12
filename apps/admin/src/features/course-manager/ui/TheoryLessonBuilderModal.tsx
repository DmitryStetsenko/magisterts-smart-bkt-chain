'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { CourseModuleDto } from '@sbc/types';

interface TheoryLessonBuilderModalProps {
  isOpen: boolean;
  module: CourseModuleDto | null;
  courseTitle: string;
  courseSlug: string;
  courseId: string;
  onClose: () => void;
  onSaveSuccess: (updatedModule: CourseModuleDto) => void;
  apiUrl?: string;
}

interface LessonBlockState {
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

const DEFAULT_BLOCKS: LessonBlockState = {
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

  // Перевіримо, чи це структурований конспект чи вільний текст
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

  // Якщо це був вільний текст без наших маркерів — зберігаємо його в концепції
  if (!summaryMatch && !codeMatch && !wrongMatch) {
    state.conceptExplanation = md.trim();
  } else {
    // Витягуємо блок теоретичних понять
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

export const TheoryLessonBuilderModal: React.FC<TheoryLessonBuilderModalProps> = ({
  isOpen,
  module,
  courseTitle,
  courseSlug,
  courseId,
  onClose,
  onSaveSuccess,
  apiUrl = 'http://localhost:3000',
}) => {
  const [activeTab, setActiveTab] = useState<'BUILDER' | 'PREVIEW' | 'RAW_MARKDOWN'>('BUILDER');
  const [blocks, setBlocks] = useState<LessonBlockState>(DEFAULT_BLOCKS);
  const [rawMarkdown, setRawMarkdown] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ініціалізація даних при відкритті
  useEffect(() => {
    if (isOpen && module) {
      const initialText = module.description || '';
      setRawMarkdown(initialText);
      const parsed = parseMarkdownToBlocks(initialText, module.title);
      setBlocks(parsed);
      setError(null);
      setActiveTab('BUILDER');
    }
  }, [isOpen, module]);

  // Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !module) return null;

  // Оновлення Takeaway пунктів
  const handleUpdateTakeaway = (index: number, val: string) => {
    const next = [...blocks.takeaways];
    next[index] = val;
    setBlocks({ ...blocks, takeaways: next });
  };

  const handleAddTakeaway = () => {
    setBlocks({ ...blocks, takeaways: [...blocks.takeaways, ''] });
  };

  const handleRemoveTakeaway = (index: number) => {
    if (blocks.takeaways.length <= 1) {
      setBlocks({ ...blocks, takeaways: [''] });
      return;
    }
    const next = blocks.takeaways.filter((_, i) => i !== index);
    setBlocks({ ...blocks, takeaways: next });
  };

  // Перемикання на сирий Markdown: синхронізуємо зі структури
  const handleTabSwitch = (tab: 'BUILDER' | 'PREVIEW' | 'RAW_MARKDOWN') => {
    if (tab === 'RAW_MARKDOWN' || tab === 'PREVIEW') {
      const generated = serializeLessonBlocks(blocks, module.title);
      setRawMarkdown(generated);
    } else if (tab === 'BUILDER' && activeTab === 'RAW_MARKDOWN') {
      // Якщо повертаємось із сирого редактора — оновлюємо блоки
      const parsed = parseMarkdownToBlocks(rawMarkdown, module.title);
      setBlocks(parsed);
    }
    setActiveTab(tab);
  };

  // Пресет: Базовий HTML
  const handleApplyHtmlPreset = () => {
    setBlocks({
      summary:
        'Дізнайтеся, як влаштована базова анатомія HTML-документа, для чого потрібен <!DOCTYPE html> та чому кожен веб-сайт розділено на службовий <head> та видимий <body>.',
      conceptExplanation:
        'HTML (HyperText Markup Language) — це мова структурування даних у браузері.\nБудь-який коректний документ має трирівневу ієрархію:\n1. <!DOCTYPE html> — вказує браузеру на стандарт HTML5;\n2. <html> — кореневий контейнер усієї сторінки (із атрибутом lang="uk");\n3. <head> — містить метаінформацію, кодування UTF-8, назву вкладки <title> та підключення стилів;\n4. <body> — містить усе, що користувач бачить на екрані (заголовки, текст, зображення, форми).',
      hasCode: true,
      codeLang: 'html',
      codeSnippet: `<!DOCTYPE html>
<html lang="uk">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мій перший веб-сайт</title>
  </head>
  <body>
    <header>
      <h1>Привіт, світе!</h1>
    </header>
    <main>
      <p>Це базова семантична структура сучасної веб-сторінки.</p>
    </main>
  </body>
</html>`,
      codeExplanation:
        'Мінімальний стандартизований шаблон HTML5 сторінки. Всі видимі елементи повинні розташовуватися виключно всередині <body>.',
      hasMisconception: true,
      wrongBelief:
        '«Початківці часто вважають, що тег <head> відображається у верхній частині сторінки як заголовок або шапка сайту».',
      realityExplanation:
        'Тег <head> є виключно контейнером службових метаданих (кодування, скрипти, стилі, тайтл вкладки). Візуальна шапка створюється тегом <header> або <h1> всередині <body>.',
      fixTip:
        'Запамʼятайте анатомічну метафору: head — це «мозок» документа (невидимий для ока), а body — це «тіло» (все видиме на екрані).',
      takeaways: [
        'Кожен документ починається з директиви <!DOCTYPE html>.',
        'Елементи у <head> не відображаються на екрані напряму (крім назви вкладки <title>).',
        'Весь користувацький контент живе виключно у тілі <body>.',
      ],
    });
  };

  // Пресет: JavaScript / Програмування
  const handleApplyJsPreset = () => {
    setBlocks({
      summary:
        'Опануйте різницю між змінними let, константами const та примітивними типами даних у сучасній веб-розробці.',
      conceptExplanation:
        'Змінні — це іменовані комірки памʼяті, у яких програма зберігає проміжні обчислення та стан інтерфейсу.\nЗолоте правило сучасного JS: завжди за замовчуванням оголошуйте величину через const. Переходьте на let лише тоді, коли значення гарантовано буде переприсвоюватися далі по алгоритму.',
      hasCode: true,
      codeLang: 'javascript',
      codeSnippet: `// 1. Константа для стабільних величин:
const APP_TITLE = 'Smart-BKT-Chain';
const MAX_ATTEMPTS = 3;

// 2. Змінна для динамічного лічильника:
let currentAttempt = 1;
currentAttempt += 1; // Успішно оновлено!

console.log(\`Спроба \${currentAttempt} з \${MAX_ATTEMPTS}\`);`,
      codeExplanation:
        'Спроба переприсвоїти значення константі (APP_TITLE = "Інше") викличе помилку TypeError.',
      hasMisconception: true,
      wrongBelief:
        '«Можна всюди використовувати застарілий var або let, так простіше і не буде помилок незмінності».',
      realityExplanation:
        'Використання let для констант відкриває шлях до випадкового затирання важливих даних іншими функціями, що є головним джерелом важковиявних багів.',
      fixTip:
        'Використовуйте const у 90% випадків. Змінюйте на let тільки для лічильників циклів або змінних станів.',
      takeaways: [
        'const захищає посилання на змінну від випадкового переприсвоєння.',
        'let використовується виключно тоді, коли значення змінюється.',
        'var більше не використовується в сучасному ES6+ стандарті.',
      ],
    });
  };

  // Збереження
  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    const markdownToSave =
      activeTab === 'RAW_MARKDOWN' ? rawMarkdown : serializeLessonBlocks(blocks, module.title);

    try {
      const res = await fetch(`${apiUrl}/api/v1/courses/${courseId}/modules/${module.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: markdownToSave.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Не вдалося зберегти конспект');
      }

      const updated = await res.json();
      onSaveSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Помилка збереження конспекту');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Згенерований Markdown для Preview
  const previewMarkdown =
    activeTab === 'RAW_MARKDOWN' ? rawMarkdown : serializeLessonBlocks(blocks, module.title);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full flex flex-col max-h-[92vh] shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Візуальний Конструктор Теорії Уроку</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Block Builder
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md">
                {courseTitle} • {module.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => handleTabSwitch('BUILDER')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'BUILDER'
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Блоковий Конструктор</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('PREVIEW')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'PREVIEW'
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Превʼю для учня</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('RAW_MARKDOWN')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'RAW_MARKDOWN'
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Markdown</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col gap-5">
          {/* 1. BUILDER TAB */}
          {activeTab === 'BUILDER' && (
            <div className="flex flex-col gap-4">
              {/* Presets Toolbar */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium text-[11px]">Швидкі дидактичні шаблони:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyHtmlPreset}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 text-[10px] font-mono transition-colors cursor-pointer"
                  >
                    ⚡ Шаблон HTML розмітки
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyJsPreset}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 text-[10px] font-mono transition-colors cursor-pointer"
                  >
                    ⚡ Шаблон JS / Алгоритмів
                  </button>
                </div>
              </div>

              {/* Block 1: Summary */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-2 transition-all hover:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] flex items-center justify-center font-mono">
                      1
                    </span>
                    <span>Вступ та Короткий Огляд Теми (Summary & Hook)</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {blocks.summary.length} симв.
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Опишіть у 1-2 реченнях, про що цей урок і чому він важливий для учня (інтрига або практична мета).
                </p>
                <textarea
                  rows={2}
                  value={blocks.summary}
                  onChange={(e) => setBlocks({ ...blocks, summary: e.target.value })}
                  placeholder="Дізнайтеся, як влаштована базова анатомія документа та чому браузер вимагає..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              {/* Block 2: Concept Explanation */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-2 transition-all hover:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] flex items-center justify-center font-mono">
                      2
                    </span>
                    <span>Пояснення Фундаментальних Понять (Core Concepts)</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {blocks.conceptExplanation.length} симв.
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Основний навчальний текст. Формулюйте правила, терміни, принципи роботи та логічні кроки.
                </p>
                <textarea
                  rows={5}
                  value={blocks.conceptExplanation}
                  onChange={(e) => setBlocks({ ...blocks, conceptExplanation: e.target.value })}
                  placeholder="HTML — це стандартизована мова розмітки... Кожен документ будується за такою ієрархією..."
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-y leading-relaxed font-sans"
                />
              </div>

              {/* Block 3: Code Snippet */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-3 transition-all hover:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] flex items-center justify-center font-mono">
                      3
                    </span>
                    <span>Інтерактивний Приклад Коду (Code Snippet)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={blocks.codeLang}
                      onChange={(e) => setBlocks({ ...blocks, codeLang: e.target.value })}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-blue-400 focus:outline-none focus:border-blue-500"
                    >
                      <option value="html">HTML</option>
                      <option value="javascript">JavaScript</option>
                      <option value="css">CSS</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="sql">SQL</option>
                    </select>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={blocks.hasCode}
                        onChange={(e) => setBlocks({ ...blocks, hasCode: e.target.checked })}
                        className="rounded border-slate-800 text-blue-600 focus:ring-0"
                      />
                      <span>Увімкнено</span>
                    </label>
                  </div>
                </div>

                {blocks.hasCode && (
                  <div className="flex flex-col gap-2 animate-fadeIn">
                    <textarea
                      rows={6}
                      value={blocks.codeSnippet}
                      onChange={(e) => setBlocks({ ...blocks, codeSnippet: e.target.value })}
                      placeholder={`<!DOCTYPE html>\n<html>\n  <head><title>Заголовок</title></head>\n  <body>\n    <h1>Привіт, світе!</h1>\n  </body>\n</html>`}
                      className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300 focus:outline-none focus:border-blue-500 resize-y leading-relaxed"
                    />
                    <input
                      type="text"
                      value={blocks.codeExplanation}
                      onChange={(e) => setBlocks({ ...blocks, codeExplanation: e.target.value })}
                      placeholder="Пояснення до коду: наприклад, «Мінімальний робочий шаблон HTML5»"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Block 4: Misconception Alert */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-amber-500/20 flex flex-col gap-3 transition-all hover:border-amber-500/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] flex items-center justify-center font-mono">
                      4
                    </span>
                    <span>Картка Типової Омани Учня (Misconception Alert)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={blocks.hasMisconception}
                      onChange={(e) => setBlocks({ ...blocks, hasMisconception: e.target.checked })}
                      className="rounded border-slate-800 text-amber-600 focus:ring-0"
                    />
                    <span>Увімкнено</span>
                  </label>
                </div>

                {blocks.hasMisconception && (
                  <div className="flex flex-col gap-2.5 animate-fadeIn">
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Цей блок попереджає учня про типову помилку ще до того, як він зробить її на практиці у Тренажері.
                    </p>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                        <span>❌ Хибне уявлення учня (Wrong Belief):</span>
                      </span>
                      <input
                        type="text"
                        value={blocks.wrongBelief}
                        onChange={(e) => setBlocks({ ...blocks, wrongBelief: e.target.value })}
                        placeholder="«Початківці часто вважають, що тег <head> — це видима шапка сторінки»"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-rose-200 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <span>✅ Реальне наукове/технічне пояснення:</span>
                      </span>
                      <textarea
                        rows={2}
                        value={blocks.realityExplanation}
                        onChange={(e) => setBlocks({ ...blocks, realityExplanation: e.target.value })}
                        placeholder="Тег <head> містить службові метадані, а видима шапка розміщується у <body>..."
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                        <span>💡 Дидактична порада / Лайфхак для запамʼятовування:</span>
                      </span>
                      <input
                        type="text"
                        value={blocks.fixTip}
                        onChange={(e) => setBlocks({ ...blocks, fixTip: e.target.value })}
                        placeholder="head = невидимий мозок сторінки, body = видиме тіло"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-amber-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Block 5: Key Takeaways */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col gap-3 transition-all hover:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] flex items-center justify-center font-mono">
                      5
                    </span>
                    <span>Ключові Висновки та Тези (Key Takeaways)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTakeaway}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Додати тезу</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {blocks.takeaways.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateTakeaway(idx, e.target.value)}
                        placeholder={`Головний висновок #${idx + 1}`}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTakeaway(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Видалити пункт"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. PREVIEW TAB */}
          {activeTab === 'PREVIEW' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                <span>👁️ Живий попередній перегляд: ось так конспект побачить учень у Підручнику Zen Focus та у висувній шторці Тренажера</span>
                <span className="font-mono text-[10px]">Zen Focus v2.0 Standard</span>
              </div>

              {/* Rendered Preview Container */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-5 text-slate-200 leading-relaxed font-sans shadow-inner">
                {/* Header */}
                <div className="flex flex-col gap-1 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      Конспект Уроку
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/{module.slug}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{module.title}</h2>
                </div>

                {/* Summary Hook */}
                {blocks.summary && (
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border-l-4 border-emerald-500 text-xs text-slate-300 italic">
                    <span className="font-semibold text-emerald-400 not-italic block mb-1">
                      📌 Короткий огляд:
                    </span>
                    {blocks.summary}
                  </div>
                )}

                {/* Concept Explanation */}
                {blocks.conceptExplanation && (
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Теоретичні поняття</span>
                    </h4>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap pl-1">
                      {blocks.conceptExplanation}
                    </div>
                  </div>
                )}

                {/* Code Snippet */}
                {blocks.hasCode && blocks.codeSnippet && (
                  <div className="flex flex-col gap-2 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-850 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-blue-400" />
                        <span className="uppercase">{blocks.codeLang}</span>
                      </div>
                      <span>Interactive Snippet</span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                      <code>{blocks.codeSnippet}</code>
                    </pre>
                    {blocks.codeExplanation && (
                      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 text-[11px] text-slate-400 italic">
                        💡 {blocks.codeExplanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Misconception Alert */}
                {blocks.hasMisconception && (blocks.wrongBelief || blocks.realityExplanation) && (
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Картка типової омани (Misconception Alert)</span>
                    </div>

                    {blocks.wrongBelief && (
                      <div className="text-xs text-rose-300/90 pl-1">
                        <strong className="text-rose-400">❌ Хибне уявлення:</strong> {blocks.wrongBelief}
                      </div>
                    )}

                    {blocks.realityExplanation && (
                      <div className="text-xs text-slate-300 pl-1">
                        <strong className="text-emerald-400">✅ Реальність:</strong> {blocks.realityExplanation}
                      </div>
                    )}

                    {blocks.fixTip && (
                      <div className="text-xs text-amber-200/90 pl-1 pt-1 border-t border-amber-500/20">
                        <strong className="text-amber-400">💡 Порада:</strong> {blocks.fixTip}
                      </div>
                    )}
                  </div>
                )}

                {/* Takeaways */}
                {blocks.takeaways.filter((t) => t.trim().length > 0).length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ключові висновки</span>
                    </h4>
                    <ul className="flex flex-col gap-1 pl-2">
                      {blocks.takeaways
                        .filter((t) => t.trim().length > 0)
                        .map((t, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{t}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. RAW MARKDOWN TAB */}
          {activeTab === 'RAW_MARKDOWN' && (
            <div className="flex flex-col gap-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Прямий доступ до Markdown (синхронізується з Блоковим Конструктором):
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {rawMarkdown.length} символів
                </span>
              </div>
              <textarea
                rows={16}
                value={rawMarkdown}
                onChange={(e) => setRawMarkdown(e.target.value)}
                placeholder="Введіть вільний текст або Markdown..."
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Збережеться у модуль:</span>
            <code className="text-emerald-400 font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {module.title}
            </code>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Збереження...' : 'Зберегти конспект у модуль'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
