'use client';

import React, { useId, useState } from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  position?: TooltipPosition;
  disabled?: boolean;
  maxWidthClassName?: string;
  className?: string;
  children: React.ReactNode;
}

const POSITION_CLASSES: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * Доступний спливаючий тултіп UI-Kit із підтримкою фокусу клавіатури та `--sbc-*` токенів.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  disabled = false,
  maxWidthClassName = 'max-w-xs',
  className = '',
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();

  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      aria-describedby={isOpen ? tooltipId : undefined}
    >
      {children}
      {isOpen && (
        <span
          id={tooltipId}
          role="tooltip"
          className={[
            'pointer-events-none absolute z-50 px-2.5 py-1.5 rounded-lg border shadow-xl',
            'text-[11px] leading-snug font-medium whitespace-normal w-max',
            'bg-[var(--sbc-bg-surface,#1f1f1f)] border-[var(--sbc-border-strong,#333333)] text-[var(--sbc-text-primary,#cccccc)]',
            'animate-fadeIn',
            maxWidthClassName,
            POSITION_CLASSES[position],
          ].join(' ')}
        >
          {content}
        </span>
      )}
    </span>
  );
};
