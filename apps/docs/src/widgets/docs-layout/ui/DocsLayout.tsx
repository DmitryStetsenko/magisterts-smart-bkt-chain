'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import roadmapData from '../../../data/roadmap.json';
import techStackData from '../../../data/tech_stack.json';
import projectManagementData from '../../../data/project_management.json';
import { DocData, Section, Tab } from '../../../entities/document/model/types';
import { getSlug } from '../../../entities/document/lib/helpers';
import { ThemeSwitcher } from '../../../features/theme-switcher/ui/ThemeSwitcher';
import { SearchDocs } from '../../../features/search-docs/ui/SearchDocs';

interface DocsLayoutContentProps {
  children: (props: { isDarkMode: boolean; filteredDoc: DocData; activeSection: string; scrollTo: (id: string) => void }) => React.ReactNode;
}

function DocsLayoutContent({ children }: DocsLayoutContentProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('q') || '';

  const [activeSection, setActiveSection] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Cast JSON data
  const roadmapDoc = roadmapData as DocData;
  const techDoc = techStackData as DocData;
  const pmDoc = projectManagementData as DocData;

  // Detect active tab from URL path
  const activeTab = useMemo<Tab>(() => {
    if (pathname.includes('/tech')) return 'tech';
    if (pathname.includes('/pm')) return 'pm';
    return 'roadmap';
  }, [pathname]);

  const currentDoc = useMemo(() => {
    if (activeTab === 'roadmap') return roadmapDoc;
    if (activeTab === 'tech') return techDoc;
    return pmDoc;
  }, [activeTab, roadmapDoc, techDoc, pmDoc]);

  // Toggle dark/light class on HTML element
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

  // Handle search query updates (push parameters to router)
  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (val) {
      params.set('q', val);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Scroll to element smoothly
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setIsSidebarOpen(false);
    }
  };

  // Filtered document content based on search query
  const filteredDoc = useMemo(() => {
    if (!searchQuery.trim()) return currentDoc;

    const query = searchQuery.toLowerCase();
    const filteredSections = currentDoc.sections
      .map((section) => {
        const matchesSectionTitle = section.title.toLowerCase().includes(query);
        const matchesSectionParagraphs = section.paragraphs.some((p) => p.toLowerCase().includes(query));
        const matchesSectionItems = section.items.some(
          (item) =>
              item.raw_text.toLowerCase().includes(query) ||
              (item.key && item.key.toLowerCase().includes(query)) ||
              (item.value && item.value.toLowerCase().includes(query))
        );

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

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      
      {/* HEADER BAR */}
      <header className={`sticky top-0 z-50 h-[73px] flex items-center justify-between px-6 border-b backdrop-blur-md ${isDarkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`md:hidden p-2 rounded-lg border flex-shrink-0 transition-all ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
            aria-label="Toggle Navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          <Link href="/" className="flex items-center gap-3 min-w-0 hover:opacity-90 transition-all">
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
              S
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
                Smart-BKT-Chain
              </h1>
              <p className={`text-xs hidden sm:block ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'} truncate`}>
                Централізована документація архітектури та Jira
              </p>
            </div>
          </Link>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href="https://github.com/DmitryStetsenko/magisterts-smart-bkt-chain"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-700 hover:text-black hover:bg-zinc-50'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <ThemeSwitcher isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
        </div>
      </header>

      <div className="flex flex-1 relative font-sans">
        
        {/* MOBILE SIDEBAR OVERLAY/BACKDROP */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 top-[73px] z-30 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}

        {/* SIDEBAR */}
        <aside className={`
          w-80 max-w-[85vw] flex-shrink-0 flex flex-col fixed md:sticky top-[73px] bottom-0 left-0 z-40 border-r transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isDarkMode ? 'bg-zinc-950/95 md:bg-zinc-955/50 border-zinc-900' : 'bg-zinc-50 md:bg-zinc-100/50 border-zinc-200'}
          md:flex md:w-96 md:h-[calc(100vh-73px)]
        `}>
          
          {/* Tab Switcher */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-900">
            <div className={`flex flex-col gap-1 p-1 rounded-xl ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
              <Link
                href="/roadmap/"
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2.5 ${activeTab === 'roadmap' ? (isDarkMode ? 'bg-zinc-800 text-white shadow-md' : 'bg-white text-zinc-955 shadow-sm') : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900')}`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Дорожня карта</span>
              </Link>
              <Link
                href="/tech/"
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2.5 ${activeTab === 'tech' ? (isDarkMode ? 'bg-zinc-800 text-white shadow-md' : 'bg-white text-zinc-955 shadow-sm') : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900')}`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>Технічний стек</span>
              </Link>
              <Link
                href="/pm/"
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2.5 ${activeTab === 'pm' ? (isDarkMode ? 'bg-zinc-800 text-white shadow-md' : 'bg-white text-zinc-955 shadow-sm') : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900')}`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                <span>Управління & Jira</span>
              </Link>
            </div>

            <SearchDocs searchQuery={searchQuery} onSearchChange={handleSearchChange} isDarkMode={isDarkMode} />
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
        <main className="flex-1 overflow-y-auto pl-3 pr-4 sm:px-6 py-10 md:px-16 lg:px-24">
          <div className="max-w-none w-full space-y-16">
            
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

            {/* Render children/pages */}
            {children({ isDarkMode, filteredDoc, activeSection, scrollTo })}

          </div>
        </main>
      </div>
    </div>
  );
}

export default function DocsLayout({ children }: DocsLayoutContentProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Завантаження...</div>}>
      <DocsLayoutContent>{children}</DocsLayoutContent>
    </Suspense>
  );
}
