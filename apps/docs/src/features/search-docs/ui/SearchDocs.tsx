'use client';

import React from 'react';

interface SearchDocsProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  isDarkMode: boolean;
}

export function SearchDocs({ searchQuery, onSearchChange, isDarkMode }: SearchDocsProps) {
  return (
    <div className="mt-4 relative">
      <input
        type="text"
        placeholder="Швидкий пошук у тексті..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
          isDarkMode 
            ? 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-500' 
            : 'bg-white border-zinc-200 text-zinc-800 placeholder-zinc-400'
        }`}
      />
      <svg 
        className={`w-4 h-4 absolute left-3 top-3 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}
