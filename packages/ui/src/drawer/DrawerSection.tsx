'use client';

import React, { useState } from 'react';
import { Plus, Minus, LucideIcon } from 'lucide-react';

export interface DrawerSectionProps {
  id?: string;
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  titleColor?: string;
  badge?: string | number;
  badgeColor?: string;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * 📐 DrawerSection (Rule 7 Standard)
 * Reusable, borderless, collapsible accordion section for Side Drawers across Teacher, Student, and Admin portals.
 */
export function DrawerSection({
  id,
  title,
  icon: Icon,
  iconColor = 'text-slate-400',
  titleColor = 'text-slate-400 group-hover:text-slate-200',
  badge,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  action,
  children,
  className = '',
  contentClassName = '',
}: DrawerSectionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    const nextState = !open;
    if (!isControlled) {
      setInternalIsOpen(nextState);
    }
    if (onToggle) {
      onToggle(nextState);
    }
  };

  return (
    <div id={id} className={`flex flex-col gap-1.5 ${className}`}>
      <div className="w-full flex items-center justify-between px-0.5 py-1 text-slate-400">
        <button
          type="button"
          onClick={handleToggle}
          className="flex-1 flex items-center text-left hover:text-white transition-colors cursor-pointer group select-none min-w-0"
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors truncate ${titleColor}`}>
            {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} />}
            <span className="truncate">{title}</span>
            {badge !== undefined && (
              <span className="text-[10px] font-mono text-slate-500 font-normal shrink-0">
                ({badge})
              </span>
            )}
          </span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
          {action && <div className="flex items-center">{action}</div>}
          <button
            type="button"
            onClick={handleToggle}
            className="p-0.5 rounded text-slate-500 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            title={open ? "Згорнути секцію" : "Розгорнути секцію"}
          >
            {open ? <Minus className="w-3.5 h-3.5 stroke-[2]" /> : <Plus className="w-3.5 h-3.5 stroke-[2]" />}
          </button>
        </div>
      </div>

      {open && (
        <div className={`animate-fadeIn flex flex-col gap-1.5 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}
