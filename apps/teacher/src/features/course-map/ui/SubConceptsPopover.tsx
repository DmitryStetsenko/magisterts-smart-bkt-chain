'use client';

import React, { useState } from 'react';
import { Tag, ChevronDown, X } from 'lucide-react';

export interface SubConceptsPopoverProps {
  subConcepts: string[];
  className?: string;
}

/**
 * Format Ukrainian plural noun for "підконцепт"
 */
function getPluralSubconcepts(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) {
    return `${count} підконцептів`;
  }
  if (mod10 === 1) {
    return `${count} підконцепт`;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return `${count} підконцепти`;
  }
  return `${count} підконцептів`;
}

/**
 * SubConceptsPopover: Minimalist compact trigger badge and absolute dropdown
 * to inspect BKT micro-concepts without stretching vertical list height.
 */
export function SubConceptsPopover({ subConcepts, className = '' }: SubConceptsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!subConcepts || subConcepts.length === 0) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Compact Trigger Badge */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer select-none border ${
          isOpen
            ? 'bg-purple-950/60 border-purple-500/60 text-purple-200 shadow-sm'
            : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
        }`}
        title="Показати повний список підконцептів BKT"
      >
        <Tag className="w-2.5 h-2.5 text-purple-400 shrink-0" />
        <span>{getPluralSubconcepts(subConcepts.length)}</span>
        <ChevronDown
          className={`w-2.5 h-2.5 text-slate-500 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-purple-400' : ''
          }`}
        />
      </button>

      {/* Absolute Dropdown Popover */}
      {isOpen && (
        <>
          {/* Invisible fixed backdrop for click-outside dismissal */}
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />

          {/* Floating Dropdown Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-full mt-1.5 w-64 sm:w-72 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl z-50 p-2.5 animate-fadeIn"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] font-mono font-semibold text-slate-300 uppercase tracking-wider">
                  Підконцепти BKT ({subConcepts.length})
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded hover:bg-slate-800/60 cursor-pointer transition-colors"
                title="Закрити"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Subconcepts List */}
            <div className="max-h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {subConcepts.map((sc) => (
                <div
                  key={sc}
                  className="px-2 py-1 rounded bg-slate-950/70 border border-slate-800/80 text-[10px] font-mono text-slate-300 hover:border-slate-700/80 transition-colors break-all select-all"
                >
                  {sc}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
