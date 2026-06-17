'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
