'use client';

import React, { useState } from 'react';
import { Tag, ChevronDown, X, Check } from 'lucide-react';

export interface SubConceptsPopoverProps {
  subConcepts: string[];
  selectedSubConcepts: string[];
  onToggleSubConcept: (subConcept: string) => void;
  onSelectAllTopic?: (subConcepts: string[]) => void;
  onClearTopic?: (subConcepts: string[]) => void;
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
 * SubConceptsPopover: Checkbox-driven multi-select popover for BKT micro-concepts.
 * Keeps dropdown open on selection; closes ONLY on click outside, clicking trigger badge, or X.
 */
export function SubConceptsPopover({
  subConcepts,
  selectedSubConcepts = [],
  onToggleSubConcept,
  onSelectAllTopic,
  onClearTopic,
  className = '',
}: SubConceptsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!subConcepts || subConcepts.length === 0) {
    return null;
  }

  // Count how many subconcepts of this specific topic are currently selected
  const selectedInThisTopic = subConcepts.filter((sc) =>
    selectedSubConcepts.includes(sc)
  );
  const selectedCount = selectedInThisTopic.length;
  const hasSelection = selectedCount > 0;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Compact Trigger Badge: Closes / Opens on click */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer select-none border ${
          isOpen || hasSelection
            ? 'bg-purple-950/60 border-purple-500/60 text-purple-200 shadow-sm'
            : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
        }`}
        title="Фільтрація завдань за підконцептами BKT (мультивибір)"
      >
        <Tag
          className={`w-2.5 h-2.5 shrink-0 ${
            hasSelection ? 'text-purple-300' : 'text-purple-400'
          }`}
        />
        <span>
          {getPluralSubconcepts(subConcepts.length)}
          {hasSelection && ` (${selectedCount} обр.)`}
        </span>
        <ChevronDown
          className={`w-2.5 h-2.5 text-slate-500 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-purple-400' : ''
          }`}
        />
      </button>

      {/* Absolute Dropdown Popover */}
      {isOpen && (
        <>
          {/* Invisible fixed backdrop for click-outside dismissal ONLY */}
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
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/80">
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
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Actions Bar (Обрати всі / Скинути) */}
            <div className="flex items-center justify-between pb-1.5 mb-1 text-[10px] font-mono text-slate-500">
              <span>Чекбокси фільтрації:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAllTopic?.(subConcepts);
                  }}
                  className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
                >
                  Всі
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearTopic?.(subConcepts);
                  }}
                  className="text-slate-400 hover:text-rose-300 hover:underline cursor-pointer"
                >
                  Скинути
                </button>
              </div>
            </div>

            {/* Subconcepts Checkbox List (Does NOT close on click) */}
            <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5 divide-y divide-slate-800/40 scrollbar-thin scrollbar-thumb-slate-800">
              {subConcepts.map((sc) => {
                const isChecked = selectedSubConcepts.includes(sc);

                return (
                  <button
                    key={sc}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle selection WITHOUT closing the popover
                      onToggleSubConcept(sc);
                    }}
                    className={`w-full text-left py-1.5 px-2 rounded transition-colors flex items-center justify-between group cursor-pointer text-[11px] font-mono ${
                      isChecked
                        ? 'bg-purple-950/40 text-purple-200 font-medium'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                    title={
                      isChecked
                        ? `Зняти фільтр з ${sc}`
                        : `Додати ${sc} до фільтра`
                    }
                  >
                    <div className="flex items-center gap-2 truncate">
                      {/* Checkbox box */}
                      <span
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                          isChecked
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'border-slate-700 bg-slate-900 group-hover:border-slate-500'
                        }`}
                      >
                        {isChecked && (
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        )}
                      </span>
                      <span className="truncate">{sc}</span>
                    </div>

                    <span
                      className={`text-[9px] font-mono shrink-0 ml-1 ${
                        isChecked
                          ? 'text-purple-400'
                          : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    >
                      {isChecked ? 'обрано' : '+'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer Status */}
            <div className="pt-2 mt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>
                {hasSelection
                  ? `Обрано: ${selectedCount} з ${subConcepts.length}`
                  : 'Оберіть для множинної фільтрації'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
              >
                Готово
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
