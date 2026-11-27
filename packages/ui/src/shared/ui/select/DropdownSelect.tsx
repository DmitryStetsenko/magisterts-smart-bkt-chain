'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  badge?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownSelectProps<T extends string = string> {
  options: DropdownOption<T>[];
  value: T | '';
  onChange: (value: T) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

/**
 * Стилізований доступний випадаючий селектор UI-Kit на базі дизайн-токенів `--sbc-*`.
 */
export function DropdownSelect<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Оберіть значення...',
  label,
  disabled = false,
  size = 'md',
  fullWidth = false,
  className = '',
}: DropdownSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const triggerSizeClass =
    size === 'sm' ? 'h-8 px-2.5 text-xs rounded-lg' : 'h-9 px-3 text-xs sm:text-sm rounded-lg';

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? 'w-full' : 'inline-block min-w-[200px]'} ${className}`}
    >
      {label && (
        <span className="block mb-1 text-[11px] font-semibold text-[var(--sbc-text-muted,#909090)]">
          {label}
        </span>
      )}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={[
          'w-full flex items-center justify-between gap-2 border transition-colors text-left cursor-pointer',
          'bg-[var(--sbc-bg-surface,#1f1f1f)] hover:bg-[var(--sbc-bg-subtle,#262626)]',
          'border-[var(--sbc-border-strong,#333333)] text-[var(--sbc-text-primary,#cccccc)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60',
          'disabled:opacity-50 disabled:pointer-events-none',
          triggerSizeClass,
        ].join(' ')}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 inline-flex items-center">{selectedOption.icon}</span>
          )}
          <span className={selectedOption ? 'truncate font-medium' : 'truncate text-[var(--sbc-text-muted,#909090)]'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[var(--sbc-text-muted,#909090)] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className={[
            'absolute z-50 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl border shadow-2xl p-1',
            'bg-[var(--sbc-bg-surface,#1f1f1f)] border-[var(--sbc-border-strong,#333333)]',
            'animate-fadeIn',
          ].join(' ')}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={[
                    'w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-[var(--sbc-bg-subtle,#262626)] text-[var(--sbc-text-primary,#cccccc)] font-semibold'
                      : 'text-[var(--sbc-text-primary,#cccccc)] hover:bg-[var(--sbc-bg-subtle,#262626)]/70',
                    'disabled:opacity-40 disabled:pointer-events-none',
                  ].join(' ')}
                >
                  <span className="flex items-start gap-2 min-w-0">
                    {opt.icon && <span className="shrink-0 mt-0.5">{opt.icon}</span>}
                    <span className="min-w-0">
                      <span className="block truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="block text-[10px] text-[var(--sbc-text-muted,#909090)] truncate">
                          {opt.description}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {opt.badge && (
                      <span className="text-[10px] font-mono text-[var(--sbc-text-muted,#909090)]">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
