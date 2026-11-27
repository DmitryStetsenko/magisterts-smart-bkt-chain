'use client';

import React from 'react';

export type BadgeVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';
export type BadgeSize = 'xs' | 'sm';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  mono?: boolean;
  dot?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral:
    'bg-[var(--sbc-bg-subtle,#262626)] text-[var(--sbc-text-primary,#cccccc)] border-[var(--sbc-border-strong,#333333)]',
  info: 'bg-blue-950/60 text-blue-300 border-blue-500/30',
  success: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
  danger: 'bg-rose-950/60 text-rose-300 border-rose-500/30',
  accent: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30',
};

const DOT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-[var(--sbc-text-muted,#909090)]',
  info: 'bg-blue-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  accent: 'bg-indigo-400',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-[10px] rounded-md gap-1',
  sm: 'px-2.5 py-1 text-[11px] rounded-lg gap-1.5',
};

/**
 * Семантичний статус-бейдж UI-Kit (BKT-відсотки, складність, режими проходження).
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'xs',
  mono = false,
  dot = false,
  icon,
  children,
  className = '',
  ...props
}) => {
  return (
    <span
      className={[
        'inline-flex items-center font-semibold border leading-none select-none whitespace-nowrap',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        mono ? 'font-mono' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_CLASSES[variant]}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0 inline-flex items-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
