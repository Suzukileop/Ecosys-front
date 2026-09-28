'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faGraduationCap,
  faHouse,
  faTruck,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  PROVIDER_FRAME_CLASS,
  PROVIDER_INK_CLASS,
  providerPillClass,
} from '@/components/marketplace/ProviderDirectoryPrimitives';
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
      title={`${subcategoryCount} more categories`}
      onClick={() => onOpenChange(!open)}
      className={providerPillClass(hasActiveCategory)}
    >
      More
      <FontAwesomeIcon
        icon={faChevronDown}
        className={`h-3 w-3 transition-transform duration-300 ease-out ${open ? 'rotate-180' : ''} ${
          hasActiveCategory ? '' : 'text-neutral-400'
        }`}
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
          <div className={`${PROVIDER_FRAME_CLASS} p-6 sm:p-8`}>
            <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICE_PROVIDER_CATEGORY_GROUPS.map((group) => (
                <div key={group.id} className="min-w-0">
                  <div className="flex items-center gap-2.5 border-b border-black/[0.06] pb-3 dark:border-white/[0.06]">
                    <FontAwesomeIcon
                      icon={ICON_MAP[group.icon]}
                      className="h-3.5 w-3.5 shrink-0 text-neutral-400 dark:text-neutral-500"
                      aria-hidden
                    />
                    <h3 className={`text-[15px] font-semibold ${PROVIDER_INK_CLASS}`}>{group.title}</h3>
                  </div>
                  <ul className="mt-4 space-y-3">
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
                            className={`inline-flex items-center gap-2 text-left text-[15px] transition-colors duration-200 hover:text-[#FF5722] focus-visible:text-[#FF5722] focus-visible:outline-none ${
                              active
                                ? `font-medium ${PROVIDER_INK_CLASS}`
                                : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            {item}
                            {active ? (
                              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5722]" />
                            ) : null}
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
