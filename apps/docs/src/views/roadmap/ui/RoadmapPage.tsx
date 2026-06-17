'use client';

import React from 'react';
import DocsLayout from '../../../widgets/docs-layout/ui/DocsLayout';
import { getSlug } from '../../../entities/document/lib/helpers';
import { formatMarkdown, renderParagraphs } from '../../../shared/ui/markdown';

export function RoadmapPage() {
  return (
    <DocsLayout>
      {({ isDarkMode, filteredDoc, activeSection, scrollTo }) => (
        <RoadmapContent 
          isDarkMode={isDarkMode} 
          filteredDoc={filteredDoc} 
          activeSection={activeSection} 
          scrollTo={scrollTo} 
        />
      )}
    </DocsLayout>
  );
}

interface RoadmapContentProps {
  isDarkMode: boolean;
  filteredDoc: any;
  activeSection: string;
  scrollTo: (id: string) => void;
}

function RoadmapContent({ isDarkMode, filteredDoc, activeSection, scrollTo }: RoadmapContentProps) {
  return (
    <div className="space-y-12 animate-fadeIn">
      {filteredDoc.sections.map((section: any) => {
        const sectionSlug = getSlug(section.title);

        return (
          <div key={section.title} id={sectionSlug} className="scroll-mt-24 space-y-8">
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

            {/* Summary Header */}
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-100/80 border-zinc-200'} shadow-lg`}>
              {renderParagraphs(section.paragraphs, isDarkMode, `leading-relaxed text-base md:text-lg ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`)}

              {/* Steps Horizontal Flow */}
              {section.subsections && section.subsections.length > 0 && (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                  {section.subsections.map((sub: any, idx: number) => {
                    const subSlug = getSlug(sub.title);
                    const isSubActive = activeSection === subSlug || (idx === 0 && !section.subsections.some((s: any) => getSlug(s.title) === activeSection));
                    return (
                      <button
                        key={idx}
                        onClick={() => scrollTo(subSlug)}
                        className={`relative rounded-xl border p-4 transition-all duration-300 flex flex-col items-center text-center shadow-md group ${
                          isSubActive 
                            ? (isDarkMode ? 'bg-indigo-950/20 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-indigo-50/50 border-indigo-500 ring-2 ring-indigo-500/20') 
                            : (isDarkMode ? 'bg-zinc-950/80 border-zinc-850 hover:border-indigo-500/50' : 'bg-white border-zinc-200 hover:border-indigo-600/50')
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all duration-300 ${
                          isSubActive 
                            ? 'bg-indigo-600 text-white' 
                            : (isDarkMode ? 'bg-indigo-600/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white')
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={`font-semibold text-[11px] uppercase tracking-wider ${
                          isSubActive
                            ? (isDarkMode ? 'text-white' : 'text-zinc-955')
                            : (isDarkMode ? 'text-zinc-400 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-800')
                        }`}>
                          {sub.title.split(':')[0]}
                        </span>
                        {sub.title.split(':')[1] && (
                          <span className={`text-[10px] mt-1 line-clamp-2 leading-tight transition-colors ${
                            isSubActive
                              ? (isDarkMode ? 'text-indigo-300' : 'text-indigo-600 font-medium')
                              : (isDarkMode ? 'text-zinc-500 group-hover:text-zinc-450' : 'text-zinc-450 group-hover:text-zinc-500')
                          }`}>
                            {sub.title.split(':')[1].trim()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vertical Timeline Phases */}
            {section.subsections && section.subsections.length > 0 && (
              <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-3 sm:before:left-8 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:to-emerald-500 mt-12">
                {section.subsections.map((sub: any, idx: number) => {
                  const subSlug = getSlug(sub.title);
                  const isFirst = idx === 0;
                  const isActive = activeSection === subSlug || (isFirst && !section.subsections.some((s: any) => getSlug(s.title) === activeSection));

                  // Parse details
                  let description = '';
                  let epics: string[] = [];
                  let milestone = '';

                  sub.items.forEach((item: any) => {
                    const text = item.raw_text;
                    const match = text.match(/^\s*\**([^*:]+)(?::\*\*|\*\*:\s*)\s*(.*)$/);
                    if (match) {
                      const key = match[1].trim();
                      const value = match[2].trim();
                      if (key === 'Опис') {
                        description = value;
                      } else if (key.includes('Епіки') || key.includes('Jira Epics')) {
                        epics = value.split(',').map((e: string) => e.replace(/`/g, '').trim()).filter(Boolean);
                      } else if (key === 'Результат') {
                        milestone = value;
                      }
                    }
                  });

                  return (
                    <div key={idx} id={subSlug} className="relative pl-9 sm:pl-16 group scroll-mt-24">
                      {/* Pulsing indicator for active phase */}
                      <div className={`absolute left-0 sm:left-5 top-2 w-6 h-6 rounded-full border-4 ${isActive ? (isDarkMode ? 'bg-indigo-500 border-zinc-955 animate-ping' : 'bg-indigo-500 border-white animate-ping') : (isDarkMode ? 'bg-zinc-800 border-zinc-955' : 'bg-zinc-200 border-white')}`} />
                      <div className={`absolute left-0 sm:left-5 top-2 w-6 h-6 rounded-full border-4 flex items-center justify-center font-bold text-[9px] ${isActive ? (isDarkMode ? 'bg-indigo-500 border-zinc-955 text-white' : 'bg-indigo-500 border-white text-white') : (isDarkMode ? 'bg-zinc-800 border-zinc-955 text-zinc-400' : 'bg-zinc-200 border-white text-zinc-600')}`}>
                        {idx + 1}
                      </div>

                      {/* Phase Card */}
                      <div 
                        onClick={() => scrollTo(subSlug)}
                        className={`rounded-2xl border p-6 shadow-md cursor-pointer transition-all duration-300 ${
                          isActive 
                            ? (isDarkMode ? 'bg-indigo-950/10 border-indigo-500 shadow-indigo-500/5 ring-2 ring-indigo-500/20' : 'bg-indigo-50/20 border-indigo-500 shadow-indigo-500/5 ring-2 ring-indigo-500/20')
                            : (isDarkMode ? 'bg-zinc-900/60 backdrop-blur-md border-zinc-900 hover:border-zinc-850 hover:border-indigo-500/30' : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-lg')
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <h3 className={`text-xl font-bold tracking-tight transition-colors duration-305 ${isDarkMode ? 'text-white' : 'text-zinc-900'} group-hover:text-indigo-600 dark:group-hover:text-indigo-400`}>
                            {sub.title}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                            isActive 
                              ? (isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse' : 'bg-indigo-50 text-indigo-600 border-indigo-200 animate-pulse') 
                              : (isDarkMode ? 'bg-zinc-800 text-zinc-500 border-zinc-700' : 'bg-zinc-100 text-zinc-500 border-zinc-200')
                          }`}>
                            {isActive ? (
                              <>
                                <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Поточна фаза</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 3V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Заплановано</span>
                              </>
                            )}
                          </span>
                        </div>

                        <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          {formatMarkdown(description || sub.paragraphs[0] || 'Опис фази відсутній.', isDarkMode)}
                        </p>

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t ${isDarkMode ? 'border-zinc-800/80' : 'border-zinc-200'}`}>
                          {/* Jira Epics list */}
                          <div>
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              Jira Epics
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {epics.length > 0 ? (
                                epics.map((epic, eIdx) => (
                                  <span
                                    key={eIdx}
                                    className={`px-2 py-0.5 rounded font-mono text-xs font-semibold ${isDarkMode ? 'bg-zinc-800 border border-zinc-800 text-zinc-300' : 'bg-zinc-100 border border-zinc-200 text-zinc-700'}`}
                                  >
                                    {epic}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-zinc-500">Немає закріплених епіків</span>
                              )}
                            </div>
                          </div>

                          {/* Phase Milestone */}
                          <div>
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              Ціль фази (Milestone)
                            </h4>
                            <p className="text-emerald-500 dark:text-emerald-400 text-sm font-semibold flex items-start gap-1.5">
                              <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-450 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{formatMarkdown(milestone || 'Очікується визначення.', isDarkMode)}</span>
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
