'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faChevronDown,
  faGraduationCap,
  faHouse,
  faTruck,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  countServiceProviderSubcategories,
  SERVICE_PROVIDER_CATEGORY_GROUPS,
  type ServiceProviderCategoryIcon,
} from '@/lib/service-provider-categories';

const ICON_MAP: Record<ServiceProviderCategoryIcon, IconDefinition> = {
  wrench: faWrench,
  house: faHouse,
  truck: faTruck,
  graduation: faGraduationCap,
};

type ServiceProviderCategoriesShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

/** Click-outside + Escape for the Popular / Categories block. */
export function ServiceProviderCategoriesShell({
  open,
  onOpenChange,
  children,
}: ServiceProviderCategoriesShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !rootRef.current?.contains(target)) {
        onOpenChange(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className="flex flex-col">
      {children}
    </div>
  );
}

type CategoriesButtonProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasActiveCategory: boolean;
  menuId: string;
};

export function ServiceProviderCategoriesButton({
  open,
  onOpenChange,
  hasActiveCategory,
  menuId,
}: CategoriesButtonProps) {
  const subcategoryCount = countServiceProviderSubcategories();

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={menuId}
      aria-haspopup="true"
      onClick={() => onOpenChange(!open)}
      className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition sm:text-sm ${
        open || hasActiveCategory
          ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:border-sky-400 dark:text-sky-300'
          : 'border-sky-500/80 text-sky-600 hover:bg-sky-500/10 dark:border-sky-400/80 dark:text-sky-300 dark:hover:bg-sky-400/10'
      }`}
    >
      <FontAwesomeIcon icon={faBars} className="h-3.5 w-3.5" aria-hidden />
      <span>
        Categories
        <span className="ml-1 tabular-nums opacity-80">+{subcategoryCount}</span>
      </span>
      <FontAwesomeIcon
        icon={faChevronDown}
        className={`h-3 w-3 transition-transform duration-300 ease-out ${open ? 'rotate-180' : ''}`}
        aria-hidden
      />
    </button>
  );
}

type CategoriesPanelProps = {
  open: boolean;
  menuId: string;
  selectedLabel: string | null;
  onSelect: (label: string) => void;
  onClose: () => void;
};

export function ServiceProviderCategoriesPanel({
  open,
  menuId,
  selectedLabel,
  onSelect,
  onClose,
}: CategoriesPanelProps) {
  const reduceMotion = useReducedMotion();
  const durationMs = reduceMotion ? 120 : 360;

  return (
    <div
      className="grid transition-[grid-template-rows,opacity] ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        gridTemplateRows: open ? '1fr' : '0fr',
        opacity: open ? 1 : 0,
        transitionDuration: `${durationMs}ms`,
      }}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          id={menuId}
          role="menu"
          className={`pt-4 transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? 'translate-y-0' : '-translate-y-2'
          } ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={{ transitionDuration: `${durationMs}ms` }}
        >
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-950 sm:p-5">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICE_PROVIDER_CATEGORY_GROUPS.map((group) => (
                <div key={group.id} className="min-w-0">
                  <div className="mb-3 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={ICON_MAP[group.icon]}
                      className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400"
                      aria-hidden
                    />
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {group.title}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {group.items.map((item) => {
                      const active = selectedLabel === item;
                      return (
                        <li key={item}>
                          <button
                            type="button"
                            role="menuitem"
                            tabIndex={open ? 0 : -1}
                            onClick={() => {
                              onSelect(item);
                              onClose();
                            }}
                            className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition sm:text-sm ${
                              active
                                ? 'bg-orange-500 text-white'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:text-neutral-200 dark:hover:bg-neutral-700'
                            }`}
                          >
                            {item}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useServiceProviderCategoriesMenuId() {
  return useId();
}
