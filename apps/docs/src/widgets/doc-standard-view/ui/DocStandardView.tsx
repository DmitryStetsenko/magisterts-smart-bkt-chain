'use client';

import React, { useState } from 'react';
import { getSlug, isValidItem } from '../../../entities/document/lib/helpers';
import { formatMarkdown, renderParagraphs } from '../../../shared/ui/markdown';
import { getCardIcon } from '../../../shared/ui/icons';

interface DocStandardViewProps {
  isDarkMode: boolean;
  filteredDoc: any;
  scrollTo: (id: string) => void;
}

export default function DocStandardView({ isDarkMode, filteredDoc, scrollTo }: DocStandardViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-16 animate-fadeIn">
      {filteredDoc.sections.map((section: any, secIdx: number) => {
        const sectionSlug = getSlug(section.title);

        return (
          <section
            key={section.title}
            id={sectionSlug}
            className={`scroll-mt-24 space-y-6 pb-12 border-b last:border-b-0 ${isDarkMode ? 'border-zinc-900' : 'border-zinc-200'}`}
          >
            {/* H2 Title */}
            <div className="group flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-indigo-500 dark:text-indigo-400">
                {section.title}
              </h2>
              <a
                href={`#${sectionSlug}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(sectionSlug);
                }}
                className={`opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </a>
            </div>

            {/* Section Paragraphs */}
            {renderParagraphs(section.paragraphs, isDarkMode, `leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`)}

            {/* Section Code Blocks */}
            {section.code_blocks && section.code_blocks.map((block: any, idx: number) => {
              const id = `sec-${secIdx}-code-${idx}`;
              return (
                <div key={idx} className="relative rounded-xl overflow-hidden shadow-xl border border-zinc-805 bg-zinc-950 group">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800/80 text-xs font-mono text-zinc-400">
                    <span>{block.lang || 'code'}</span>
                    <button
                      onClick={() => handleCopy(block.content, id)}
                      className="px-2 py-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 hover:bg-zinc-700/80"
                    >
                      {copiedIndex === id ? 'Скопійовано!' : 'Копіювати'}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-xs font-mono text-zinc-350 leading-relaxed max-h-[350px]">
                    <code>{block.content}</code>
                  </pre>
                </div>
              );
            })}

            {/* Section Key-Value and Bullet list items */}
            {section.items && section.items.some(isValidItem) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items
                  .filter(isValidItem)
                  .map((item: any, idx: number) => {
                    const icon = getCardIcon(item.type === 'kv' ? (item.key || '') : (item.raw_text || ''));
                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                          isDarkMode 
                            ? 'bg-zinc-900/40 backdrop-blur-sm border-zinc-900 hover:border-zinc-800' 
                            : 'bg-white border-zinc-200 hover:border-zinc-300/80 hover:shadow-zinc-200/50'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-xl flex-shrink-0 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            {item.type === 'kv' ? (
                              <span className={`inline-block px-2.5 py-0.5 text-xs font-bold font-mono rounded ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                {item.key}
                              </span>
                            ) : (
                              <div className={`text-sm font-semibold leading-relaxed ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                                {formatMarkdown(item.raw_text, isDarkMode)}
                              </div>
                            )}
                          </div>
                        </div>

                        {item.type === 'kv' && (
                          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-650'}`}>
                            {formatMarkdown(item.value || '', isDarkMode)}
                          </p>
                        )}

                        {/* Render subitems */}
                        {item.subitems && item.subitems.length > 0 && (
                          <div className="mt-4 pt-3.5 border-t border-zinc-200/50 dark:border-zinc-800/60 space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400/90 mb-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Обґрунтування рішення:</span>
                            </div>
                            <ul className="space-y-2">
                              {item.subitems.map((sub: string, sidx: number) => (
                                <li key={sidx} className="flex items-start gap-2">
                                  <svg className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                  </svg>
                                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-650'}`}>
                                    {formatMarkdown(sub, isDarkMode)}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* SUB-SECTIONS RENDER */}
            {section.subsections && section.subsections.length > 0 && (
              <div className="mt-8 space-y-8 pl-4 border-l border-zinc-200 dark:border-zinc-900 ml-1">
                {section.subsections.map((sub: any, subIdx: number) => {
                  const subSlug = getSlug(sub.title);

                  return (
                    <div key={sub.title} id={subSlug} className="scroll-mt-24 space-y-4">
                      {/* H3 title */}
                      <div className="group flex items-center gap-3">
                        <h3 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                          {sub.title}
                        </h3>
                        <a
                          href={`#${subSlug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollTo(subSlug);
                          }}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-zinc-700 hover:text-zinc-500' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </a>
                      </div>

                      {/* Subsection Paragraphs */}
                      {renderParagraphs(sub.paragraphs, isDarkMode, `leading-relaxed text-sm ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`)}

                      {/* Subsection Code Blocks */}
                      {sub.code_blocks && sub.code_blocks.map((block: any, idx: number) => {
                        const id = `sec-${secIdx}-sub-${subIdx}-code-${idx}`;
                        return (
                          <div key={idx} className="relative rounded-xl overflow-hidden shadow-xl border border-zinc-850 bg-zinc-950 group">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800/80 text-xs font-mono text-zinc-400">
                              <span>{block.lang || 'code'}</span>
                              <button
                                onClick={() => handleCopy(block.content, id)}
                                className="px-2 py-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 hover:bg-zinc-700/80"
                              >
                                {copiedIndex === id ? 'Скопійовано!' : 'Копіювати'}
                              </button>
                            </div>
                            <pre className="p-4 overflow-x-auto text-xs font-mono text-zinc-350 leading-relaxed max-h-[350px]">
                              <code>{block.content}</code>
                            </pre>
                          </div>
                        );
                      })}

                      {/* Subsection Key-Value or Bullet items */}
                      {sub.items && sub.items.some(isValidItem) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {sub.items
                            .filter(isValidItem)
                            .map((item: any, idx: number) => {
                              const icon = getCardIcon(item.type === 'kv' ? (item.key || '') : (item.raw_text || ''));
                              return (
                                <div
                                  key={idx}
                                  className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                                    isDarkMode 
                                      ? 'bg-zinc-900/40 backdrop-blur-sm border-zinc-900 hover:border-zinc-800' 
                                      : 'bg-white border-zinc-200 hover:border-zinc-300/80 hover:shadow-zinc-200/50'
                                  }`}
                                >
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className={`p-2 rounded-xl flex-shrink-0 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                      {icon}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                      {item.type === 'kv' ? (
                                        <span className={`inline-block px-2.5 py-0.5 text-xs font-bold font-mono rounded ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                          {item.key}
                                        </span>
                                      ) : (
                                        <div className={`text-sm font-semibold leading-relaxed ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                                          {formatMarkdown(item.raw_text, isDarkMode)}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {item.type === 'kv' && (
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-650'}`}>
                                      {formatMarkdown(item.value || '', isDarkMode)}
                                    </p>
                                  )}

                                  {/* Subitems */}
                                  {item.subitems && item.subitems.length > 0 && (
                                    <div className="mt-4 pt-3.5 border-t border-zinc-200/50 dark:border-zinc-800/60 space-y-2">
                                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400/90 mb-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Обґрунтування рішення:</span>
                                      </div>
                                      <ul className="space-y-2">
                                        {item.subitems.map((subText: string, sidx: number) => (
                                          <li key={sidx} className="flex items-start gap-2">
                                            <svg className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                            </svg>
                                            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-650'}`}>
                                              {formatMarkdown(subText, isDarkMode)}
                                            </p>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
