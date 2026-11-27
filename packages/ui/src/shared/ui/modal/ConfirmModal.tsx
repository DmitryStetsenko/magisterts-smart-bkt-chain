'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { Modal, ModalSize } from './Modal';
import { Button, ButtonVariant } from '../button';

export type ConfirmModalVariant = 'info' | 'warning' | 'danger' | 'accent';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: React.ReactNode;
  description?: React.ReactNode;
  warnings?: string[];
  variant?: ConfirmModalVariant;
  icon?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  confirmDisabled?: boolean;
  hideCancelButton?: boolean;
  testId?: string;
  confirmTestId?: string;
  cancelTestId?: string;
  closeTestId?: string;
  size?: ModalSize;
  children?: React.ReactNode;
}

const VARIANT_CONFIG: Record<
  ConfirmModalVariant,
  {
    iconBg: string;
    defaultIcon: React.ReactNode;
    confirmButtonVariant: ButtonVariant;
    warningBoxClass: string;
  }
> = {
  info: {
    iconBg: 'bg-indigo-950/50 border-indigo-500/30 text-indigo-300',
    defaultIcon: <Info className="w-5 h-5" />,
    confirmButtonVariant: 'primary',
    warningBoxClass: 'bg-indigo-950/30 border-indigo-500/25 text-indigo-300',
  },
  accent: {
    iconBg: 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300',
    defaultIcon: <CheckCircle2 className="w-5 h-5" />,
    confirmButtonVariant: 'accent',
    warningBoxClass: 'bg-emerald-950/30 border-emerald-500/25 text-emerald-300',
  },
  warning: {
    iconBg: 'bg-amber-950/50 border-amber-500/30 text-amber-300',
    defaultIcon: <AlertTriangle className="w-5 h-5" />,
    confirmButtonVariant: 'primary',
    warningBoxClass: 'bg-amber-950/30 border-amber-500/25 text-amber-300',
  },
  danger: {
    iconBg: 'bg-rose-950/50 border-rose-500/30 text-rose-300',
    defaultIcon: <ShieldAlert className="w-5 h-5" />,
    confirmButtonVariant: 'danger',
    warningBoxClass: 'bg-rose-950/30 border-rose-500/25 text-rose-300',
  },
};

/**
 * Типовий діалог підтвердження критичної або незворотної дії.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  warnings,
  variant = 'info',
  icon,
  confirmLabel = 'Підтвердити',
  cancelLabel = 'Скасувати',
  isConfirming = false,
  confirmDisabled = false,
  hideCancelButton = false,
  testId,
  confirmTestId,
  cancelTestId,
  closeTestId,
  size = 'md',
  children,
}) => {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      dialogTestId={testId}
      closeTestId={closeTestId}
      closeOnOverlayClick={!isConfirming}
      closeOnEscape={!isConfirming}
      hideCloseButton={isConfirming}
      title={title}
      icon={
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${cfg.iconBg}`}
        >
          {icon ?? cfg.defaultIcon}
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5">
          {!hideCancelButton && (
            <Button
              variant="secondary"
              size="sm"
              data-testid={cancelTestId}
              onClick={onClose}
              disabled={isConfirming}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            variant={cfg.confirmButtonVariant}
            size="sm"
            data-testid={confirmTestId}
            onClick={onConfirm}
            isLoading={isConfirming}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {description && (
          <div className="text-xs sm:text-sm text-[var(--sbc-text-muted,#909090)] leading-relaxed">
            {description}
          </div>
        )}

        {warnings && warnings.length > 0 && (
          <ul
            className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1.5 ${cfg.warningBoxClass}`}
          >
            {warnings.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {children}
      </div>
    </Modal>
  );
};
