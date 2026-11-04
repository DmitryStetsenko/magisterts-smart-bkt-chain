'use client';

import React from 'react';
import { ChevronRight, Home, LucideIcon } from 'lucide-react';

export interface BreadcrumbItem {
  label: string | React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  badge?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  onHomeClick?: () => void;
  homeHref?: string;
  separator?: React.ReactNode;
}

/**
 * 🧭 Breadcrumbs (Єдині компактні хлібні крихти платформи Smart-BKT-Chain)
 * - Розміщуються зліва над заголовком контенту
 * - Зменшений, акуратний та високочитабельний шрифт (text-[11px] / text-xs)
 * - Тонкі розділювачі (ChevronRight або '/')
 * - Підтримка іконок, клікабельних посилань або дій
 * - Не перевантажують інтерфейс
 */
export function Breadcrumbs({
  items,
  className = '',
  showHome = false,
  onHomeClick,
  homeHref,
  separator,
}: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const defaultSeparator = (
    <span className="text-slate-400 text-[11px] select-none font-normal px-0.5">/</span>
  );
  const activeSeparator = separator !== undefined ? separator : defaultSeparator;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-1 text-[11px] leading-none font-normal text-slate-400 select-none ${className}`}
    >
      {showHome && (
        <>
          {homeHref ? (
            <a
              href={homeHref}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded hover:bg-slate-800/40"
              title="Головна"
            >
              <Home className="w-3 h-3 text-slate-400" />
            </a>
          ) : (
            <button
              type="button"
              onClick={onHomeClick}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded hover:bg-slate-800/40 cursor-pointer"
              title="Головна"
            >
              <Home className="w-3 h-3 text-slate-400" />
            </button>
          )}
          {activeSeparator}
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1 || item.isCurrent;
        const ItemIcon = item.icon;

        return (
          <React.Fragment key={index}>
            {index > 0 && activeSeparator}

            {isLast ? (
              <span
                className="flex items-center gap-1 text-slate-400 font-normal truncate max-w-[280px] sm:max-w-[380px]"
                aria-current="page"
                title={typeof item.label === 'string' ? item.label : undefined}
              >
                {ItemIcon && <ItemIcon className="w-3 h-3 text-slate-500 shrink-0" />}
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-normal bg-slate-800/80 text-slate-400 border border-slate-700/50">
                    {item.badge}
                  </span>
                )}
              </span>
            ) : item.href ? (
              <a
                href={item.href}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 font-normal transition-colors truncate max-w-[220px] sm:max-w-[300px]"
                title={typeof item.label === 'string' ? item.label : undefined}
              >
                {ItemIcon && <ItemIcon className="w-3 h-3 text-slate-500 shrink-0" />}
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-normal bg-slate-800/80 text-slate-400 border border-slate-700/50">
                    {item.badge}
                  </span>
                )}
              </a>
            ) : item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 font-normal transition-colors cursor-pointer truncate max-w-[220px] sm:max-w-[300px]"
                title={typeof item.label === 'string' ? item.label : undefined}
              >
                {ItemIcon && <ItemIcon className="w-3 h-3 text-slate-500 shrink-0" />}
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-normal bg-slate-800/80 text-slate-400 border border-slate-700/50">
                    {item.badge}
                  </span>
                )}
              </button>
            ) : (
              <span
                className="flex items-center gap-1 text-slate-400 font-normal truncate max-w-[220px] sm:max-w-[300px]"
                title={typeof item.label === 'string' ? item.label : undefined}
              >
                {ItemIcon && <ItemIcon className="w-3 h-3 text-slate-500 shrink-0" />}
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-normal bg-slate-800/80 text-slate-400 border border-slate-700/50">
                    {item.badge}
                  </span>
                )}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
