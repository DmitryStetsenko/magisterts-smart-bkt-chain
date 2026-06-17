'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import roadmapData from '../data/roadmap.json';
import techStackData from '../data/tech_stack.json';
import projectManagementData from '../data/project_management.json';

// Define TS Interfaces
export interface CodeBlock {
  lang: string;
  content: string;
}

export interface Item {
  type: string;
  key?: string;
  value?: string;
  raw_text: string;
  subitems: string[];
}

export interface Subsection {
  title: string;
  level: number;
  paragraphs: string[];
  code_blocks: CodeBlock[];
  items: Item[];
}

export interface Section {
  title: string;
  level: number;
  paragraphs: string[];
  code_blocks: CodeBlock[];
  items: Item[];
  subsections: Subsection[];
}

export interface DocData {
  project_title: string;
  sections: Section[];
}

export type Tab = 'roadmap' | 'tech' | 'pm';

// Helper to format basic markdown (**bold**, *italic*, `code`) into JSX
export const formatMarkdown = (text: string, isDarkMode: boolean): React.ReactNode => {
  if (!text) return '';

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      allowedElements={['strong', 'em', 'code', 'a', 'p']}
      unwrapDisallowed
      components={{
        a: ({ node, ...props }) => <a className="text-indigo-400 hover:underline" {...props} />,
        code: ({ node, ...props }) => (
          <code 
            className={`px-1.5 py-0.5 mx-0.5 rounded border text-[11px] font-mono font-semibold whitespace-nowrap ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 text-pink-400' 
                : 'bg-zinc-100 border-zinc-200 text-pink-600'
            }`}
            {...props}
          />
        ),
        strong: ({ node, ...props }) => <strong className={`font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`} {...props} />,
        em: ({ node, ...props }) => <em className={`italic ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`} {...props} />,
        p: ({ node, ...props }) => <span {...props} />
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

// Helper to render lists of paragraphs, automatically detecting and formatting Markdown Tables
export const renderParagraphs = (paragraphs: string[], isDarkMode: boolean, pClassName: string) => {
  if (!paragraphs || paragraphs.length === 0) return null;

  const groupedParagraphs: string[] = [];
  let currentTable: string[] = [];

  paragraphs.forEach((para) => {
    const trimmed = para.trim();
    const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|');

    if (isTableRow) {
      currentTable.push(para);
    } else {
      if (currentTable.length > 0) {
        groupedParagraphs.push(currentTable.join('\n'));
        currentTable = [];
      }
      groupedParagraphs.push(para);
    }
  });

  if (currentTable.length > 0) {
    groupedParagraphs.push(currentTable.join('\n'));
  }

  return (
    <div className="space-y-4">
      {groupedParagraphs.map((para, idx) => (
        <div key={idx} className={pClassName}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => <span {...props} />,
              a: ({ node, ...props }) => <a className="text-indigo-400 hover:underline" {...props} />,
              code: ({ node, ...props }) => (
                <code 
                  className={`px-1.5 py-0.5 mx-0.5 rounded border text-[11px] font-mono font-semibold whitespace-nowrap ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-zinc-800 text-pink-400' 
                      : 'bg-zinc-100 border-zinc-200 text-pink-600'
                  }`}
                  {...props}
                />
              ),
              strong: ({ node, ...props }) => <strong className={`font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`} {...props} />,
              em: ({ node, ...props }) => <em className={`italic ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`} {...props} />,
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-6 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                  <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => <thead className={isDarkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'} {...props} />,
              tbody: ({ node, ...props }) => <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60 bg-zinc-950/20' : 'divide-zinc-100 bg-white'}`} {...props} />,
              tr: ({ node, ...props }) => <tr className={isDarkMode ? 'hover:bg-zinc-900/20' : 'hover:bg-zinc-50/50'} {...props} />,
              th: ({ node, ...props }) => <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400 border-zinc-800' : 'text-zinc-500 border-zinc-200'} border-b`} {...props} />,
              td: ({ node, ...props }) => <td className={`px-4 py-3 text-xs md:text-sm font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`} {...props} />
            }}
          >
            {para}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
};

// Helper to get beautiful SVG icons based on card titles
export const getCardIcon = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes('бази даних') || t.includes('database') || t.includes('postgresql')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" />
      </svg>
    );
  }
  if (t.includes('api') || t.includes('types') || t.includes('типізація') || t.includes('інтерфейси') || t.includes('swagger')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (t.includes('контракт') || t.includes('contracts') || t.includes('solidity') || t.includes('web3') || t.includes('безпека') || t.includes('security')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  }
  if (t.includes('frontend') || t.includes('фронтенд') || t.includes('ui') || t.includes('стилізація') || t.includes('візуалізація') || t.includes('введення коду')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  if (t.includes('backend') || t.includes('бекенд') || t.includes('сервер') || t.includes('орм') || t.includes('orm') || t.includes('джерела')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    );
  }
  if (t.includes('docker') || t.includes('devops') || t.includes('ci/cd') || t.includes('github') || t.includes('контейнер') || t.includes('тест') || t.includes('fuzzing')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1H9L8 4zm.5 12h7a1.5 1.5 0 001.5-1.5v-7A1.5 1.5 0 0015.5 4h-7A1.5 1.5 0 007 5.5v7A1.5 1.5 0 008.5 16z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
};

// Helper to generate HTML-friendly element IDs from titles
export const getSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9а-яєіїґ\s-]/g, '')
    .replace(/\s+/g, '-');
};

// Helper to check if item is a valid displayable card
export const isValidItem = (item: any) => {
  if (item.type === 'kv') {
    return item.key && item.key.trim() !== '';
  }
  return item.raw_text && item.raw_text.trim() !== '' && item.raw_text.trim() !== '---';
};

interface DocsShellContentProps {
  children: (props: { isDarkMode: boolean; filteredDoc: DocData; activeSection: string; scrollTo: (id: string) => void }) => React.ReactNode;
}

function DocsShellContent({ children }: DocsShellContentProps) {
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
          
          {/* Tab Switcher (using Links now) */}
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

            {/* Search Input */}
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Швидкий пошук у тексті..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
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

export default function DocsShell({ children }: DocsShellContentProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Завантаження...</div>}>
      <DocsShellContent>{children}</DocsShellContent>
    </Suspense>
  );
}
