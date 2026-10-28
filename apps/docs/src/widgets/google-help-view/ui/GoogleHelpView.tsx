'use client';

import React, { useState } from 'react';
import { getSlug } from '../../../entities/document/lib/helpers';
import { renderParagraphs } from '../../../shared/ui/markdown';

interface GoogleHelpViewProps {
  isDarkMode: boolean;
  filteredDoc: any;
  scrollTo: (id: string) => void;
}

type UserRole = 'all' | 'student' | 'teacher' | 'admin' | 'dev';

export default function GoogleHelpView({ isDarkMode, filteredDoc, scrollTo }: GoogleHelpViewProps) {
  const [activeRole, setActiveRole] = useState<UserRole>('all');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'step-1': true,
    'step-2': true,
    'step-3': true,
    'faq': true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const roles = [
    { id: 'all' as UserRole, label: 'Усі платформи & Ролі', icon: '🌐' },
    { id: 'student' as UserRole, label: '👨‍🎓 Учень (10-11 класи)', icon: '🎓' },
    { id: 'teacher' as UserRole, label: '👩‍🏫 Викладач', icon: '📊' },
    { id: 'admin' as UserRole, label: '🛠️ Методист / Адмін', icon: '⚙️' },
    { id: 'dev' as UserRole, label: '💻 Розробник / API', icon: '🚀' },
  ];

  return (
    <div className="space-y-10 animate-fadeIn max-w-5xl mx-auto pb-16">
      
      {/* GOOGLE SUPPORT STYLE HEADER BANNER */}
      <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
        isDarkMode 
          ? 'bg-zinc-900/60 border-zinc-800 shadow-xl' 
          : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Центр Довідки та Підтримки (Google Support Style)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Як використовувати систему Smart-BKT-Chain
        </h1>
        <p className={`mt-2 text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Покрокове керівництво з адаптивного навчання, інтерактивної роботи з 5 застосунками платформи, режимом читання та децентралізованою верифікацією компетенцій.
        </p>

        {/* ROLE / PLATFORM SELECTOR TABS (Like Google's Desktop / Android / iOS tabs) */}
        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Оберіть платформу або режим роботи:
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRole(r.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeRole === r.id
                    ? isDarkMode
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-blue-600 text-white shadow-sm'
                    : isDarkMode
                      ? 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-750'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                }`}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK STATUS APP BADGES */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { name: 'Study Space', port: '3006', role: 'Учень 10-11', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
          { name: 'Student Trainer', port: '3002', role: 'Практика BKT', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5' },
          { name: 'Teacher CRM', port: '3003', role: 'Черга робіт', color: 'border-purple-500/30 text-purple-400 bg-purple-500/5' },
          { name: 'Admin DAG', port: '3004', role: 'Конструктор', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5' },
          { name: 'NestJS API', port: '3000', role: 'WS / LLM', color: 'border-sky-500/30 text-sky-400 bg-sky-500/5' },
        ].map((app) => (
          <div key={app.name} className={`p-3 rounded-xl border ${app.color} flex flex-col justify-between`}>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase opacity-80">порт {app.port}</span>
              <div className="text-xs font-bold mt-0.5">{app.name}</div>
            </div>
            <div className="text-[11px] opacity-70 mt-1">{app.role}</div>
          </div>
        ))}
      </div>

      {/* RENDER ALL SECTIONS WITH EXPANDABLE HEADERS & GOOGLE TIP CARDS */}
      {filteredDoc.sections.map((section: any, secIdx: number) => {
        const sectionSlug = getSlug(section.title);
        const isOpen = openSections[sectionSlug] !== false;

        return (
          <section
            key={section.title}
            id={sectionSlug}
            className={`scroll-mt-24 rounded-2xl border transition-all overflow-hidden ${
              isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
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
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  isDarkMode ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}>
                  {secIdx + 1}
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {section.title}
                </h2>
              </div>

              <div className={`p-1.5 rounded-lg border text-xs font-bold transition-transform ${
                isOpen ? 'rotate-180' : ''
              } ${isDarkMode ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-600'}`}>
                ▼
              </div>
            </div>

            {/* EXPANDABLE BODY */}
            {isOpen && (
              <div className={`p-5 sm:p-6 pt-0 border-t ${isDarkMode ? 'border-zinc-800/70' : 'border-zinc-100'}`}>
                {/* Paragraphs */}
                <div className="pt-4">
                  {renderParagraphs(section.paragraphs, isDarkMode, `leading-relaxed text-sm sm:text-base ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`)}
                </div>

                {/* Subsections as Google Sub-Steps */}
                {section.subsections && section.subsections.length > 0 && (
                  <div className="mt-6 space-y-6">
                    {section.subsections.map((sub: any, subIdx: number) => (
                      <div
                        key={sub.title}
                        className={`p-4 sm:p-5 rounded-xl border ${
                          isDarkMode ? 'bg-zinc-950/60 border-zinc-850' : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <h3 className="text-base font-bold text-blue-500 dark:text-blue-400 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                          {sub.title}
                        </h3>

                        <div className="mt-2 text-sm leading-relaxed">
                          {renderParagraphs(sub.paragraphs, isDarkMode, isDarkMode ? 'text-zinc-300' : 'text-zinc-700')}
                        </div>

                        {/* Subitems */}
                        {sub.items && sub.items.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {sub.items.map((item: any, itIdx: number) => (
                              <div key={itIdx} className="text-sm pl-4 border-l-2 border-blue-500/30">
                                <span className="font-semibold text-zinc-900 dark:text-zinc-200">{item.key || ''}: </span>
                                <span className={isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}>{item.value || item.raw_text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Items */}
                {section.items && section.items.length > 0 && (
                  <div className="mt-5 space-y-2.5">
                    {section.items.map((item: any, itIdx: number) => (
                      <div
                        key={itIdx}
                        className={`p-3.5 rounded-xl border text-sm flex items-start gap-3 ${
                          isDarkMode ? 'bg-zinc-950/50 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <span className="text-blue-500 font-bold mt-0.5">•</span>
                        <div>
                          {item.key && <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.key}: </span>}
                          <span className={isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}>{item.value || item.raw_text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}

      {/* GOOGLE FEEDBACK FOOTER (Was this helpful?) */}
      <div className={`p-6 rounded-2xl border text-center space-y-3 ${
        isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
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
