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
 * Conforms strictly to Rule 7 (Side Drawer Sections Standard) in .agents/AGENTS.md.
 */
export function DrawerSection({
  id,
  title,
  icon: Icon,
  iconColor = 'text-purple-400',
  titleColor = 'text-purple-400 group-hover:text-purple-300',
  badge,
  badgeColor = 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  defaultOpen = true,
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
    <div id={id} className={`flex flex-col gap-2 ${className}`}>
      {/* 📌 Header button matching Rule 7 */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between text-left px-0.5 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
      >
        <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${titleColor}`}>
          {Icon && <Icon className={`w-3.5 h-3.5 ${iconColor}`} />}
          <span>{title}</span>
          {badge !== undefined && (
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${badgeColor}`}>
              {badge}
            </span>
          )}
        </span>

        <div className="flex items-center gap-1.5">
          {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
          <span className="p-0.5 rounded text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-all flex items-center justify-center">
            {open ? <Minus className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
          </span>
        </div>
      </button>

      {/* 📜 Content with animated entrance */}
      {open && (
        <div className={`animate-fadeIn flex flex-col gap-2 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}
