'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSlug } from '../../../entities/document/lib/helpers';

interface GoogleHelpViewProps {
  isDarkMode: boolean;
  filteredDoc: any;
  scrollTo: (id: string) => void;
}

export default function GoogleHelpView({ isDarkMode, filteredDoc, scrollTo }: GoogleHelpViewProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'step-1': true,
    'step-2': true,
    'step-3': true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key],
    }));
  };

  // Helper to render markdown text properly (bold, code, links) without raw asterisks
  const renderMarkdownText = (text: string) => {
    if (!text) return null;
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => <span {...props} />,
          strong: ({ node, ...props }) => (
            <strong className={`font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`} {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className={`italic ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`} {...props} />
          ),
          code: ({ node, ...props }) => (
            <code
              className={`px-1.5 py-0.5 mx-0.5 rounded border text-[11px] font-mono font-semibold ${
                isDarkMode
                  ? 'bg-zinc-900 border-zinc-800 text-pink-400'
                  : 'bg-zinc-100 border-zinc-200 text-pink-600'
              }`}
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-500 hover:underline font-medium" {...props} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto pb-16">
      
      {/* GOOGLE HELP CENTER CLEAN HEADER */}
      <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
        isDarkMode ? 'bg-zinc-900/60 border-zinc-800 shadow-xl' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2.5 text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Довідка користувача платформи
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Як використовувати систему Smart-BKT-Chain
        </h1>
        <p className={`mt-2 text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Офіційне керівництво з роботи з екосистемою 5 застосунків адаптивного навчання, режимом зручного читання Zen Focus, чергою перевірки викладача та блокчейн-сертифікацією.
        </p>

        {/* APPLICATION CARDS (Clean inline grid) */}
        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { name: 'Study Space', port: '3006', desc: 'Теорія та Zen-читання' },
            { name: 'Student Trainer', port: '3002', desc: 'Тренажер BKT' },
            { name: 'Teacher CRM', port: '3003', desc: 'Черга перевірки' },
            { name: 'Admin DAG', port: '3004', desc: 'Конструктор графу' },
            { name: 'NestJS API', port: '3000', desc: 'Бекенд та WebSocket' },
          ].map((app) => (
            <div
              key={app.name}
              className={`p-3 rounded-xl border text-left ${
                isDarkMode ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="text-[10px] font-mono text-blue-500 font-bold uppercase">порт {app.port}</div>
              <div className="text-xs font-bold mt-0.5 text-zinc-900 dark:text-zinc-100">{app.name}</div>
              <div className="text-[11px] text-zinc-500 mt-1">{app.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTIONS LIST */}
      {filteredDoc.sections.map((section: any, secIdx: number) => {
        const sectionSlug = getSlug(section.title);
        const isOpen = openSections[sectionSlug] !== false;

        return (
          <section
            key={section.title}
            id={sectionSlug}
            className={`scroll-mt-24 rounded-2xl border transition-all overflow-hidden ${
              isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
            }`}
          >
            {/* GOOGLE ACCORDION HEADER */}
            <div
              onClick={() => toggleSection(sectionSlug)}
              className={`p-5 sm:p-6 flex items-center justify-between cursor-pointer select-none transition-colors ${
                isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  isDarkMode ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}>
                  {secIdx + 1}
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {section.title}
                </h2>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-transform ${
                isDarkMode ? 'border-zinc-700 text-zinc-400 bg-zinc-800/50' : 'border-zinc-300 text-zinc-600 bg-zinc-100'
              }`}>
                {isOpen ? 'Згорнути −' : 'Розгорнути +'}
              </span>
            </div>

            {/* EXPANDABLE BODY */}
            {isOpen && (
              <div className={`p-5 sm:p-6 pt-0 border-t ${isDarkMode ? 'border-zinc-800/70' : 'border-zinc-100'} space-y-5`}>
                
                {/* Paragraphs with full markdown formatting */}
                {section.paragraphs && section.paragraphs.length > 0 && (
                  <div className="pt-4 space-y-3">
                    {section.paragraphs.map((p: string, pIdx: number) => {
                      // Tip box detection
                      const isTip = p.startsWith('> 💡') || p.startsWith('💡');
                      const isWarning = p.startsWith('> ⚠️') || p.startsWith('⚠️');

                      if (isTip || isWarning) {
                        return (
                          <div
                            key={pIdx}
                            className={`p-4 rounded-xl border text-sm leading-relaxed ${
                              isTip
                                ? isDarkMode
                                  ? 'bg-blue-950/20 border-blue-500/30 text-blue-200'
                                  : 'bg-blue-50 border-blue-200 text-blue-900'
                                : isDarkMode
                                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                                  : 'bg-amber-50 border-amber-200 text-amber-900'
                            }`}
                          >
                            {renderMarkdownText(p.replace(/^>\s*/, ''))}
                          </div>
                        );
                      }

                      return (
                        <p key={pIdx} className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          {renderMarkdownText(p)}
                        </p>
                      );
                    })}
                  </div>
                )}

                {/* Subsections (Formatted cleanly as sub-steps) */}
                {section.subsections && section.subsections.length > 0 && (
                  <div className="space-y-4 pt-2">
                    {section.subsections.map((sub: any) => (
                      <div
                        key={sub.title}
                        className={`p-4 sm:p-5 rounded-xl border ${
                          isDarkMode ? 'bg-zinc-950/50 border-zinc-850' : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          {sub.title}
                        </h3>

                        <div className="mt-2 text-sm leading-relaxed space-y-2">
                          {sub.paragraphs && sub.paragraphs.map((p: string, idx: number) => (
                            <p key={idx} className={isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}>
                              {renderMarkdownText(p)}
                            </p>
                          ))}
                        </div>

                        {/* Subitems */}
                        {sub.items && sub.items.length > 0 && (
                          <ul className="mt-3 space-y-2 pl-4 border-l-2 border-blue-500/40">
                            {sub.items.map((item: any, itIdx: number) => (
                              <li key={itIdx} className="text-sm leading-relaxed text-zinc-300">
                                {renderMarkdownText(item.raw_text || `${item.key}: ${item.value}`)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Bullet items (Rendered as a natural clean list, NOT isolated cards) */}
                {section.items && section.items.length > 0 && (
                  <ul className="space-y-2.5 pt-2 pl-2">
                    {section.items.map((item: any, itIdx: number) => {
                      const text = item.raw_text || (item.key ? `**${item.key}:** ${item.value}` : item.value);
                      if (text === '---') return null;

                      return (
                        <li key={itIdx} className="text-sm sm:text-base leading-relaxed flex items-start gap-2.5">
                          <span className="text-blue-500 font-bold mt-1 text-xs">●</span>
                          <div className={isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}>
                            {renderMarkdownText(text)}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </section>
        );
      })}

      {/* FEEDBACK FOOTER */}
      <div className={`p-6 rounded-2xl border text-center space-y-3 ${
        isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Чи була ця інструкція корисною для вас?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => alert('Дякуємо за відгук!')}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-800'
            }`}
          >
            👍 Так, інформація допомогла
          </button>
          <button
            onClick={() => alert('Ми врахуємо це та доповнимо довідковий центр!')}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-300 hover:bg-zinc-200 text-zinc-800'
            }`}
          >
            👎 Потрібні додаткові деталі
          </button>
        </div>
      </div>
    </div>
  );
}
