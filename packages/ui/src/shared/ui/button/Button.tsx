'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional text label (supported alongside children for backward compatibility). */
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/40 shadow-sm',
  secondary:
    'bg-[var(--sbc-bg-subtle,#262626)] hover:bg-[var(--sbc-border-strong,#333333)] text-[var(--sbc-text-primary,#cccccc)] border border-[var(--sbc-border-strong,#333333)]',
  accent:
    'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40 shadow-sm',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/40 shadow-sm',
  outline:
    'bg-transparent hover:bg-[var(--sbc-bg-subtle,#262626)] text-[var(--sbc-text-primary,#cccccc)] border border-[var(--sbc-border-strong,#333333)]',
  ghost:
    'bg-transparent hover:bg-[var(--sbc-bg-subtle,#262626)] text-[var(--sbc-text-muted,#909090)] hover:text-[var(--sbc-text-primary,#cccccc)] border border-transparent',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-[11px] rounded-md gap-1.5',
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-9 px-4 text-xs sm:text-sm rounded-lg gap-2',
  lg: 'h-11 px-5 text-sm rounded-xl gap-2',
};

/**
 * Канонічна кнопка UI-Kit (`@sbc/ui/shared/ui`) на семантичних дизайн-токенах `--sbc-*`.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      label,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = Boolean(disabled || isLoading);
    const content = children ?? label;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-semibold transition-all select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60',
          'disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0 inline-flex items-center">{leftIcon}</span>
        )}
        {content}
        {!isLoading && rightIcon && (
          <span className="shrink-0 inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
