'use client';

import React, { useState } from 'react';
import { Tag, ChevronDown, X, Search, Check } from 'lucide-react';

export interface SubConceptsPopoverProps {
  subConcepts: string[];
  activeSubConcept?: string;
  onSelectSubConcept?: (subConcept: string) => void;
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
 * SubConceptsPopover: Minimalist compact trigger badge and interactive dropdown
 * to filter tasks by BKT micro-concepts without stretching vertical list height.
 */
export function SubConceptsPopover({
  subConcepts,
  activeSubConcept = '',
  onSelectSubConcept,
  className = '',
}: SubConceptsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!subConcepts || subConcepts.length === 0) {
    return null;
  }

  const hasActiveFilter = Boolean(
    activeSubConcept &&
      subConcepts.some(
        (sc) => sc.toLowerCase() === activeSubConcept.toLowerCase()
      )
  );

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
          isOpen || hasActiveFilter
            ? 'bg-purple-950/60 border-purple-500/60 text-purple-200 shadow-sm'
            : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
        }`}
        title="Переглянути та відфільтрувати завдання за підконцептами BKT"
      >
        <Tag className={`w-2.5 h-2.5 shrink-0 ${hasActiveFilter ? 'text-purple-300' : 'text-purple-400'}`} />
        <span>{getPluralSubconcepts(subConcepts.length)}</span>
        {hasActiveFilter && (
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
        )}
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

            {/* Subconcepts Clean Borderless List */}
            <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5 divide-y divide-slate-800/40 scrollbar-thin scrollbar-thumb-slate-800">
              {subConcepts.map((sc) => {
                const isSelected =
                  activeSubConcept?.toLowerCase() === sc.toLowerCase();

                return (
                  <button
                    key={sc}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectSubConcept) {
                        onSelectSubConcept(isSelected ? '' : sc);
                      }
                      setIsOpen(false);
                    }}
                    className={`w-full text-left py-1.5 px-2 rounded transition-colors flex items-center justify-between group cursor-pointer text-[11px] font-mono ${
                      isSelected
                        ? 'bg-purple-950/60 text-purple-200 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                    title={
                      isSelected
                        ? 'Скинути фільтр за цим підконцептом'
                        : `Фільтрувати завдання за ${sc}`
                    }
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-purple-400'
                            : 'bg-slate-600 group-hover:bg-purple-400'
                        }`}
                      />
                      <span className="truncate">{sc}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] shrink-0 font-sans">
                      {isSelected ? (
                        <span className="text-purple-400 flex items-center gap-0.5">
                          <Check className="w-3 h-3" />
                          <span>Фільтр</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 group-hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <span>Фільтр</span>
                          <Search className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer with Hint & Quick Reset */}
            <div className="pt-2 mt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Клікніть для фільтрації завдань</span>
              {hasActiveFilter && onSelectSubConcept && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSubConcept('');
                    setIsOpen(false);
                  }}
                  className="text-purple-400 hover:text-purple-300 underline cursor-pointer"
                >
                  Скинути
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
