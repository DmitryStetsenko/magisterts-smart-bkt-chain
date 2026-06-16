'use client';

import React, { useState, useMemo, useEffect } from 'react';
import roadmapData from '../data/roadmap.json';
import techStackData from '../data/tech_stack.json';
import projectManagementData from '../data/project_management.json';

// Define TS Interfaces for the structured documentation JSON
interface CodeBlock {
  lang: string;
  content: string;
}

interface Item {
  type: string;
  key?: string;
  value?: string;
  raw_text: string;
  subitems: string[];
}

interface Subsection {
  title: string;
  level: number;
  paragraphs: string[];
  code_blocks: CodeBlock[];
  items: Item[];
}

interface Section {
  title: string;
  level: number;
  paragraphs: string[];
  code_blocks: CodeBlock[];
  items: Item[];
  subsections: Subsection[];
}

interface DocData {
  project_title: string;
  sections: Section[];
}

type Tab = 'roadmap' | 'tech' | 'pm';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Cast JSON data to types
  const roadmapDoc = roadmapData as DocData;
  const techDoc = techStackData as DocData;
  const pmDoc = projectManagementData as DocData;

  const currentDoc = useMemo(() => {
    if (activeTab === 'roadmap') return roadmapDoc;
    if (activeTab === 'tech') return techDoc;
    return pmDoc;
  }, [activeTab, roadmapDoc, techDoc, pmDoc]);

  // Toggle theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Intersection Observer for scroll synchronization
  useEffect(() => {
    if (searchQuery.trim()) return;

    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    const ids = currentDoc.sections.flatMap((section) => [
      getSlug(section.title),
      ...section.subsections.map((sub) => getSlug(sub.title)),
    ]);

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [currentDoc, activeTab, searchQuery]);

  // Handle Copy to Clipboard for code blocks
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Filtered document content based on search query
  const filteredDoc = useMemo(() => {
    if (!searchQuery.trim()) return currentDoc;

    const query = searchQuery.toLowerCase();
    const filteredSections = currentDoc.sections
      .map((section) => {
        // Search in section title/paragraphs/items/code blocks
        const matchesSectionTitle = section.title.toLowerCase().includes(query);
        const matchesSectionParagraphs = section.paragraphs.some((p) => p.toLowerCase().includes(query));
        const matchesSectionItems = section.items.some(
          (item) =>
            item.raw_text.toLowerCase().includes(query) ||
            (item.key && item.key.toLowerCase().includes(query)) ||
            (item.value && item.value.toLowerCase().includes(query))
        );

        // Filter subsections
        const filteredSubsections = section.subsections.filter((sub) => {
          const matchesSubTitle = sub.title.toLowerCase().includes(query);
          const matchesSubParagraphs = sub.paragraphs.some((p) => p.toLowerCase().includes(query));
          const matchesSubItems = sub.items.some(
            (item) =>
              item.raw_text.toLowerCase().includes(query) ||
              (item.key && item.key.toLowerCase().includes(query)) ||
              (item.value && item.value.toLowerCase().includes(query))
          );
          return matchesSubTitle || matchesSubParagraphs || matchesSubItems;
        });

        if (
          matchesSectionTitle ||
          matchesSectionParagraphs ||
          matchesSectionItems ||
          filteredSubsections.length > 0
        ) {
          return {
            ...section,
            subsections: filteredSubsections,
          };
        }
        return null;
      })
      .filter((s): s is Section => s !== null);

    return {
      ...currentDoc,
      sections: filteredSections,
    };
  }, [currentDoc, searchQuery]);

  // Helper to generate HTML-friendly element IDs from titles
  const getSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9а-яєіїґ\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  // Scroll to element smooth
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      
      {/* HEADER BAR */}
      <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md ${isDarkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Smart-BKT-Chain
            </h1>
            <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Централізована документація архітектури та Jira
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-700 hover:text-black hover:bg-zinc-50'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </a>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-zinc-800' : 'bg-white border-zinc-200 text-indigo-600 hover:bg-zinc-50'}`}
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
        </div>
      </header>

      <div className="flex flex-1 relative font-sans">
        
        {/* SIDEBAR */}
        <aside className={`w-80 flex-shrink-0 hidden md:flex flex-col sticky top-[73px] h-[calc(100vh-73px)] border-r ${isDarkMode ? 'bg-zinc-950/50 border-zinc-900' : 'bg-zinc-100/50 border-zinc-200'}`}>
          
          {/* Tab Switcher */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-900">
            <div className={`flex flex-col gap-1 p-1 rounded-xl ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
              <button
                onClick={() => { setActiveTab('roadmap'); setSearchQuery(''); }}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2.5 ${activeTab === 'roadmap' ? (isDarkMode ? 'bg-zinc-800 text-white shadow-md' : 'bg-white text-zinc-950 shadow-sm') : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900')}`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Дорожня карта</span>
              </button>
              <button
                onClick={() => { setActiveTab('tech'); setSearchQuery(''); }}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2.5 ${activeTab === 'tech' ? (isDarkMode ? 'bg-zinc-800 text-white shadow-md' : 'bg-white text-zinc-950 shadow-sm') : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900')}`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>Технічний стек</span>
              </button>
              <button
                onClick={() => { setActiveTab('pm'); setSearchQuery(''); }}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2.5 ${activeTab === 'pm' ? (isDarkMode ? 'bg-zinc-800 text-white shadow-md' : 'bg-white text-zinc-950 shadow-sm') : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900')}`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                <span>Управління & Jira</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Швидкий пошук у тексті..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-800 placeholder-zinc-400'}`}
              />
              <svg className={`w-4 h-4 absolute left-3 top-3 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredDoc.sections.map((section) => {
              const sectionSlug = getSlug(section.title);
              const isSectionActive = activeSection === sectionSlug;

              return (
                <div key={section.title} className="space-y-1">
                  <button
                    onClick={() => scrollTo(sectionSlug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-between group ${isSectionActive ? (isDarkMode ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500' : 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600') : (isDarkMode ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white' : 'text-zinc-700 hover:bg-zinc-200 hover:text-black')}`}
                  >
                    <span className="truncate">{section.title}</span>
                  </button>

                  {/* Subsections list */}
                  {section.subsections && section.subsections.length > 0 && (
                    <div className="pl-4 border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-0.5">
                      {section.subsections.map((sub) => {
                        const subSlug = getSlug(sub.title);
                        const isSubActive = activeSection === subSlug;

                        return (
                          <button
                            key={sub.title}
                            onClick={() => scrollTo(subSlug)}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-all block truncate ${isSubActive ? (isDarkMode ? 'text-indigo-400 font-medium' : 'text-indigo-700 font-medium') : (isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-900')}`}
                          >
                            {sub.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredDoc.sections.length === 0 && (
              <p className={`text-xs text-center py-6 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Нічого не знайдено за вашим запитом
              </p>
            )}
          </nav>
        </aside>

        {/* MAIN CONTENT PORTAL */}
        <main className="flex-1 overflow-y-auto px-6 py-10 md:px-16 lg:px-24">
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* Header section info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-800'}`}>
                  {activeTab === 'roadmap' ? 'Дорожня карта' : activeTab === 'tech' ? 'Технічна специфікація' : 'Управління розробкою'}
                </span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${isDarkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-200 text-zinc-600'}`}>
                  v1.0.0
                </span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                {currentDoc.project_title}
              </h2>
              <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            </div>

            {/* SECTIONS RENDER */}
            <div className="space-y-16">
              
              {/* ROADMAP TIMELINE CUSTOM VIEW */}
              {activeTab === 'roadmap' ? (
                <div className="space-y-12">
                  {filteredDoc.sections.map((section, secIdx) => {
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
                          {section.paragraphs.map((para, idx) => (
                            <p key={idx} className={`leading-relaxed text-base md:text-lg ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                              {para}
                            </p>
                          ))}

                          {/* Steps Horizontal Flow */}
                          {section.subsections && section.subsections.length > 0 && (
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                              {section.subsections.map((sub, idx) => {
                                const subSlug = getSlug(sub.title);
                                const isSubActive = activeSection === subSlug || (idx === 0 && !section.subsections.some(s => getSlug(s.title) === activeSection));
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
                                        ? (isDarkMode ? 'text-white' : 'text-zinc-950')
                                        : (isDarkMode ? 'text-zinc-400 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-950')
                                    }`}>
                                      {sub.title.split(':')[0]}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Vertical Timeline Phases */}
                        {section.subsections && section.subsections.length > 0 && (
                          <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-8 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:to-emerald-500 mt-12">
                            {section.subsections.map((sub, idx) => {
                              const subSlug = getSlug(sub.title);
                              const isFirst = idx === 0;
                              const isActive = activeSection === subSlug || (isFirst && !section.subsections.some(s => getSlug(s.title) === activeSection));

                              // Parse details
                              let description = '';
                              let epics: string[] = [];
                              let milestone = '';

                              sub.items.forEach((item) => {
                                const text = item.raw_text;
                                if (text.startsWith('Опис:')) {
                                  description = text.replace('Опис:', '').trim();
                                } else if (text.includes('Епіки') || text.includes('Jira Epics')) {
                                  const epicsText = text.split(':')[1] || '';
                                  epics = epicsText.split(',').map((e) => e.replace(/`/g, '').trim()).filter(Boolean);
                                } else if (text.startsWith('Результат:')) {
                                  milestone = text.replace('Результат:', '').trim();
                                }
                              });

                              return (
                                <div key={idx} id={subSlug} className="relative pl-16 group scroll-mt-24">
                                  {/* Pulsing indicator for active phase */}
                                  <div className={`absolute left-5 top-2 w-6 h-6 rounded-full border-4 ${isActive ? (isDarkMode ? 'bg-indigo-500 border-zinc-950 animate-ping' : 'bg-indigo-500 border-white animate-ping') : (isDarkMode ? 'bg-zinc-800 border-zinc-950' : 'bg-zinc-200 border-white')}`} />
                                  <div className={`absolute left-5 top-2 w-6 h-6 rounded-full border-4 flex items-center justify-center font-bold text-[9px] ${isActive ? (isDarkMode ? 'bg-indigo-500 border-zinc-950 text-white' : 'bg-indigo-500 border-white text-white') : (isDarkMode ? 'bg-zinc-800 border-zinc-950 text-zinc-400' : 'bg-zinc-200 border-white text-zinc-600')}`}>
                                    {idx + 1}
                                  </div>

                                  {/* Phase Card */}
                                  <div 
                                    onClick={() => setActiveSection(subSlug)}
                                    className={`rounded-2xl border p-6 shadow-md cursor-pointer transition-all duration-300 ${
                                      isActive 
                                        ? (isDarkMode ? 'bg-indigo-950/10 border-indigo-500 shadow-indigo-500/5 ring-2 ring-indigo-500/20' : 'bg-indigo-50/20 border-indigo-500 shadow-indigo-500/5 ring-2 ring-indigo-500/20')
                                        : (isDarkMode ? 'bg-zinc-900/60 backdrop-blur-md border-zinc-900 hover:border-zinc-850 hover:border-indigo-500/30' : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-lg')
                                    }`}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                      <h3 className={`text-xl font-bold tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-zinc-900'} group-hover:text-indigo-600 dark:group-hover:text-indigo-400`}>
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
                                      {description || sub.paragraphs[0] || 'Опис фази відсутній.'}
                                    </p>

                                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t ${isDarkMode ? 'border-zinc-800/80' : 'border-zinc-150'}`}>
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
                                                className={`px-2 py-0.5 rounded font-mono text-xs font-semibold ${isDarkMode ? 'bg-zinc-850 border border-zinc-800 text-zinc-300' : 'bg-zinc-100 border border-zinc-200 text-zinc-700'}`}
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
                                          <span>{milestone || 'Очікується визначення.'}</span>
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
              ) : (
                /* STANDARD TAB VIEW FOR TECH STACK AND PROJECT MANAGEMENT */
                filteredDoc.sections.map((section, secIdx) => {
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
                      {section.paragraphs.map((para, idx) => (
                        <p key={idx} className={`leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          {para}
                        </p>
                      ))}

                      {/* Section Code Blocks */}
                      {section.code_blocks.map((block, idx) => {
                        const id = `sec-${secIdx}-code-${idx}`;
                        return (
                          <div key={idx} className="relative rounded-xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-950 group">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800/80 text-xs font-mono text-zinc-400">
                              <span>{block.lang || 'code'}</span>
                              <button
                                onClick={() => handleCopy(block.content, id)}
                                className="px-2 py-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 hover:bg-zinc-700/80"
                              >
                                {copiedIndex === id ? 'Скопійовано!' : 'Копіювати'}
                              </button>
                            </div>
                            <pre className="p-5 overflow-x-auto text-sm font-mono text-zinc-300 leading-relaxed max-h-[400px]">
                              <code>{block.content}</code>
                            </pre>
                          </div>
                        );
                      })}

                      {/* Section Key-Value and Bullet list items */}
                      {section.items && section.items.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {section.items.map((item, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-xl border transition-all hover:shadow-md ${isDarkMode ? 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'}`}
                            >
                              {item.type === 'kv' ? (
                                <div className="space-y-2">
                                  <span className="inline-block px-2.5 py-1 text-xs font-bold font-mono rounded bg-indigo-500/10 text-indigo-400">
                                    {item.key}
                                  </span>
                                  <p className={`text-sm ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                    {item.value}
                                  </p>
                                </div>
                              ) : (
                                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                  {item.raw_text}
                                </p>
                              )}

                              {/* Render subitems */}
                              {item.subitems && item.subitems.length > 0 && (
                                <div className="mt-3 pl-3 border-l-2 border-zinc-700/80 dark:border-zinc-800 space-y-1">
                                  {item.subitems.map((sub, sidx) => (
                                    <div key={sidx} className="flex gap-2">
                                      <span className="text-zinc-500 text-xs flex-shrink-0">Чому:</span>
                                      <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                        {sub}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SUB-SECTIONS RENDER */}
                      {section.subsections && section.subsections.length > 0 && (
                        <div className="mt-8 space-y-8 pl-4 border-l border-zinc-200 dark:border-zinc-900 ml-1">
                          {section.subsections.map((sub, subIdx) => {
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
                                {sub.paragraphs.map((p, idx) => (
                                  <p key={idx} className={`leading-relaxed text-sm ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    {p}
                                  </p>
                                ))}

                                {/* Subsection Code Blocks */}
                                {sub.code_blocks.map((block, idx) => {
                                  const id = `sec-${secIdx}-sub-${subIdx}-code-${idx}`;
                                  return (
                                    <div key={idx} className="relative rounded-xl overflow-hidden shadow-xl border border-zinc-800 bg-zinc-950 group">
                                      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800/80 text-xs font-mono text-zinc-400">
                                        <span>{block.lang || 'code'}</span>
                                        <button
                                          onClick={() => handleCopy(block.content, id)}
                                          className="px-2 py-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 hover:bg-zinc-700/80"
                                        >
                                          {copiedIndex === id ? 'Скопійовано!' : 'Копіювати'}
                                        </button>
                                      </div>
                                      <pre className="p-4 overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed max-h-[350px]">
                                        <code>{block.content}</code>
                                      </pre>
                                    </div>
                                  );
                                })}

                                {/* Subsection Key-Value or Bullet items */}
                                {sub.items && sub.items.length > 0 && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sub.items.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className={`p-4 rounded-xl border transition-all hover:shadow-md ${isDarkMode ? 'bg-zinc-900/30 border-zinc-900 hover:border-zinc-800' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'}`}
                                      >
                                        {item.type === 'kv' ? (
                                          <div className="space-y-2">
                                            <span className="inline-block px-2.5 py-1 text-xs font-bold font-mono rounded bg-indigo-500/10 text-indigo-400">
                                              {item.key}
                                            </span>
                                            <p className={`text-sm ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                              {item.value}
                                            </p>
                                          </div>
                                        ) : (
                                          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                            {item.raw_text}
                                          </p>
                                        )}

                                        {/* Subitems */}
                                        {item.subitems && item.subitems.length > 0 && (
                                          <div className="mt-3 pl-3 border-l-2 border-zinc-700/80 dark:border-zinc-800 space-y-1">
                                            {item.subitems.map((subText, sidx) => (
                                              <div key={sidx} className="flex gap-2">
                                                <span className="text-zinc-500 text-xs flex-shrink-0">Чому:</span>
                                                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                                  {subText}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                              </div>
                            );
                          })}
                        </div>
                      )}

                    </section>
                  );
                })
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
