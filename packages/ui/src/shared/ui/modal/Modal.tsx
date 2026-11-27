'use client';

import React, { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  hideCloseButton?: boolean;
  usePortal?: boolean;
  className?: string;
  children: React.ReactNode;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

/**
 * Базове доступне модальне вікно UI-Kit із підтримкою Portal, Escape та `--sbc-*` токенів.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  headerRight,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  hideCloseButton = false,
  usePortal = true,
  className = '',
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const modalNode = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      onClick={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        className={[
          'w-full rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]',
          'bg-[var(--sbc-bg-surface,#1f1f1f)] border-[var(--sbc-border-strong,#333333)] text-[var(--sbc-text-primary,#cccccc)]',
          SIZE_CLASSES[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {(title || icon || headerRight || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--sbc-border-subtle,#2b2b2b)] shrink-0">
            <div className="flex items-start gap-3 min-w-0">
              {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
              <div className="min-w-0">
                {title && (
                  <h3
                    id={titleId}
                    className="text-base font-bold text-[var(--sbc-text-primary,#cccccc)] leading-snug"
                  >
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="mt-0.5 text-xs text-[var(--sbc-text-muted,#909090)] leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              {!hideCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Закрити"
                  className="p-1.5 rounded-lg text-[var(--sbc-text-muted,#909090)] hover:text-[var(--sbc-text-primary,#cccccc)] hover:bg-[var(--sbc-bg-subtle,#262626)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-5 py-3.5 border-t border-[var(--sbc-border-subtle,#2b2b2b)] bg-[var(--sbc-bg-subtle,#262626)]/40 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (usePortal && mounted && typeof document !== 'undefined') {
    return createPortal(modalNode, document.body);
  }

  return modalNode;
};
