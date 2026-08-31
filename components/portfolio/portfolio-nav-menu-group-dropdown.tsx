'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { PortfolioNavIcon } from '@/components/portfolio/portfolio-nav-icons';
import type { PortfolioNavMenuNavItem } from '@/components/portfolio/portfolio-nav-menu-groups';
import {
  DEFAULT_NAV_PALETTE,
  mergeNavPalette,
} from '@/components/portfolio/portfolio-nav-palette-settings';
import { formatNavLabel, portfolioNavInkOnAccentFill } from '@/components/portfolio/portfolio-nav-settings';
import { scrollToPortfolioSection } from '@/components/portfolio/portfolio-nav-top-clearance';
import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';

type PortfolioNavMenuGroupDropdownProps = {
  groupLabel: string;
  items: PortfolioNavMenuNavItem[];
  activeId: string;
  isControlled: boolean;
  settings: PortfolioNavSettings;
  contentMode: PortfolioNavSettings['contentMode'];
  vertical: boolean;
  triggerClassName: string;
  triggerStyle: CSSProperties;
  allowScroll: boolean;
  onNavigate: (id: string) => void;
  onInteract: () => void;
  renderItemIcon?: (item: PortfolioNavMenuNavItem, active: boolean) => ReactNode;
};

const PANEL_Z_INDEX = 300;
const PANEL_MIN_WIDTH = 176;
const PANEL_ESTIMATED_ITEM_HEIGHT = 40;
const PANEL_VERTICAL_PADDING = 10;

function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const scaled = channel / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function pickReadableInk(background: string, preferred?: string): string {
  const bg = parseHexColor(background) ?? { r: 255, g: 255, b: 255 };
  const bgLum = relativeLuminance(bg.r, bg.g, bg.b);
  const darkInk = '#171717';
  const lightInk = '#fafafa';

  if (preferred) {
    const pref = parseHexColor(preferred);
    if (pref) {
      const prefLum = relativeLuminance(pref.r, pref.g, pref.b);
      if (contrastRatio(bgLum, prefLum) >= 4.5) return preferred;
    }
  }

  return bgLum > 0.55 ? darkInk : lightInk;
}

export function PortfolioNavMenuGroupDropdown({
  groupLabel,
  items,
  activeId,
  isControlled,
  settings,
  contentMode,
  vertical,
  triggerClassName,
  triggerStyle,
  allowScroll,
  onNavigate,
  onInteract,
  renderItemIcon,
}: PortfolioNavMenuGroupDropdownProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelRect, setPanelRect] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const label = formatNavLabel(groupLabel, settings.labelCase);
  const groupActive = items.some((item) => item.id === activeId);
  const accent = settings.activeAccentColor ?? '#f97316';
  const navPalette = mergeNavPalette(DEFAULT_NAV_PALETTE, settings.navPalette);
  const panelBackground = settings.barBackgroundColor ?? '#ffffff';
  const panelInk = pickReadableInk(panelBackground, settings.itemTextColor);
  const activeInk = portfolioNavInkOnAccentFill(accent, navPalette);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePanelRect = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const panelWidth = Math.max(rect.width, PANEL_MIN_WIDTH);
    let left = rect.left;
    const maxLeft = window.innerWidth - panelWidth - 8;
    if (left > maxLeft) left = Math.max(8, maxLeft);

    const estimatedHeight =
      items.length * PANEL_ESTIMATED_ITEM_HEIGHT + PANEL_VERTICAL_PADDING;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
    const top = openUpward
      ? Math.max(8, rect.top - estimatedHeight - 6)
      : rect.bottom + 6;

    setPanelRect({
      top,
      left,
      minWidth: panelWidth,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPanelRect(null);
      return;
    }
    updatePanelRect();
    const onReposition = () => updatePanelRect();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, items.length, label]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest('[data-portfolio-nav-menu-panel="true"]')
      ) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const chevron = (
    <svg
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );

  const triggerContent =
    contentMode === 'icons' ? (
      <span className="inline-flex items-center gap-1">
        <PortfolioNavIcon variant={items[0]?.icon ?? 'grid'} className="h-4 w-4" />
        {chevron}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5">
        <span>{label}</span>
        {chevron}
      </span>
    );

  const panelSurfaceStyle: CSSProperties = {
    backgroundColor: panelBackground,
    borderColor: settings.barBorderColor ?? '#e5e5e5',
    color: panelInk,
  };

  const renderPanelItem = (item: PortfolioNavMenuNavItem) => {
    const active = activeId === item.id;
    const itemLabel = formatNavLabel(item.label, settings.labelCase);
    const body = (
      <>
        {contentMode !== 'text' ? (
          <span
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center opacity-90"
            style={{ color: active ? activeInk : panelInk }}
          >
            {renderItemIcon ? (
              renderItemIcon(item, active)
            ) : (
              <PortfolioNavIcon variant={item.icon} className="h-4 w-4" />
            )}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{itemLabel}</span>
      </>
    );

    const itemClass =
      'pointer-events-auto flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-normal transition';

    if (isControlled) {
      return (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          onClick={() => {
            setOpen(false);
            onInteract();
            onNavigate(item.id);
          }}
          aria-current={active ? 'page' : undefined}
          className={`${itemClass} ${active ? '' : 'hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'}`}
          style={
            active
              ? { backgroundColor: accent, color: activeInk }
              : { color: panelInk }
          }
        >
          {body}
        </button>
      );
    }

    return (
      <a
        key={item.id}
        href={`#${item.id}`}
        role="menuitem"
        onClick={(event) => {
          setOpen(false);
          onInteract();
          event.preventDefault();
          scrollToPortfolioSection(item.id);
        }}
        className={`${itemClass} no-underline ${active ? '' : 'hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'}`}
        style={
          active
            ? { backgroundColor: accent, color: activeInk }
            : { color: panelInk }
        }
      >
        {body}
      </a>
    );
  };

  if (vertical) {
    return (
      <div className="w-full">
        <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] opacity-50">
          {label}
        </p>
        <div className="flex flex-col gap-0.5">{items.map((item) => renderPanelItem(item))}</div>
      </div>
    );
  }

  const panel =
    open && panelRect && mounted ? (
      <div
        data-portfolio-nav-menu-panel="true"
        role="menu"
        aria-label={label}
        className="pointer-events-auto fixed rounded-xl border p-1 shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
        style={{
          ...panelSurfaceStyle,
          top: panelRect.top,
          left: panelRect.left,
          minWidth: panelRect.minWidth,
          zIndex: PANEL_Z_INDEX,
        }}
      >
        {items.map((item) => renderPanelItem(item))}
      </div>
    ) : null;

  return (
    <>
      <div ref={rootRef} className={`relative ${allowScroll ? 'shrink-0' : ''}`}>
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-current={groupActive ? 'true' : undefined}
          title={contentMode === 'icons' ? label : undefined}
          className={triggerClassName}
          style={triggerStyle}
          onClick={() => {
            setOpen((value) => {
              const next = !value;
              if (next) updatePanelRect();
              return next;
            });
          }}
        >
          {triggerContent}
        </button>
      </div>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
