'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

const subscribeNoop = () => () => {};

export type ContentPostActionItem = {
  id: string;
  label: string;
  /** Second line under the label. */
  description?: string;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  /** Draws a hairline above the item to group the destructive ones. */
  separated?: boolean;
};

const MENU_WIDTH = 272;
const VIEWPORT_PAD = 8;
const GAP = 6;

/**
 * The "..." menu of a post: a portal-mounted popover that flips above the trigger when there is no
 * room below and closes on scroll / resize / outside press / Escape (a fixed menu would otherwise
 * be left stranded while the feed moves under it).
 */
export function ContentPostActionsMenu({
  items,
  label = 'Post options',
  className = '',
}: {
  items: ContentPostActionItem[];
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setCoords(null);
  }, []);

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 220;
    const width = Math.min(MENU_WIDTH, window.innerWidth - VIEWPORT_PAD * 2);
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;
    const openUp = spaceBelow < menuHeight && rect.top > spaceBelow;
    const top = openUp ? rect.top - GAP - menuHeight : rect.bottom + GAP;
    const left = rect.right - width;
    setCoords({
      top: Math.min(Math.max(VIEWPORT_PAD, top), window.innerHeight - menuHeight - VIEWPORT_PAD),
      left: Math.min(Math.max(VIEWPORT_PAD, left), window.innerWidth - width - VIEWPORT_PAD),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    /* Second pass once the menu has been measured. */
    const frame = requestAnimationFrame(place);
    return () => cancelAnimationFrame(frame);
  }, [open, place, items.length]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open, close]);

  const run = (item: ContentPostActionItem) => {
    if (item.disabled) return;
    close();
    /* Let the menu unmount first so a dialog opened by the action takes focus cleanly. */
    window.setTimeout(item.onSelect, 0);
  };

  const panel =
    open && mounted
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-labelledby={`${menuId}-trigger`}
            data-pf-no-color-transition
            className="fixed z-[200] w-[min(17rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-black/[0.08] bg-white py-1.5 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.3)] dark:border-white/[0.1] dark:bg-[#161616]"
            style={{
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              visibility: coords ? 'visible' : 'hidden',
              pointerEvents: coords ? 'auto' : 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item) => (
              <div key={item.id}>
                {item.separated ? (
                  <div className="mx-3 my-1.5 h-px bg-black/[0.08] dark:bg-white/[0.1]" aria-hidden />
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => run(item)}
                  className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.04] focus-visible:bg-black/[0.04] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 dark:hover:bg-white/[0.06] dark:focus-visible:bg-white/[0.06] ${
                    item.tone === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-[#111111] dark:text-white'
                  }`}
                >
                  {item.icon ? (
                    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center" aria-hidden>
                      {item.icon}
                    </span>
                  ) : null}
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium leading-snug">{item.label}</span>
                    {item.description ? (
                      <span
                        className={`mt-0.5 block text-[13px] leading-snug ${
                          item.tone === 'danger' ? 'text-red-500/80 dark:text-red-400/80' : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                </button>
              </div>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <div className={`relative isolate ${className}`}>
      <button
        ref={triggerRef}
        id={`${menuId}-trigger`}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open) close();
          else setOpen(true);
        }}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        data-pf-no-color-transition
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white dark:focus-visible:ring-white/30"
      >
        <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      </button>
      {panel}
    </div>
  );
}

const iconProps = {
  className: 'h-[18px] w-[18px]',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const PostMenuIcons = {
  link: (
    <svg {...iconProps}>
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
    </svg>
  ),
  hide: (
    <svg {...iconProps}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A9.6 9.6 0 0 1 12 5c5 0 8.5 4.2 9.5 7a11.7 11.7 0 0 1-2.6 3.8M6.3 6.4A11.6 11.6 0 0 0 2.5 12c1 2.8 4.5 7 9.5 7 1.5 0 2.8-.4 4-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  ),
  flag: (
    <svg {...iconProps}>
      <path d="M5 21V4M5 4h11l-1.8 3.5L16 11H5" />
    </svg>
  ),
  comments: (
    <svg {...iconProps}>
      <path d="M20.5 11.6c0 4.2-3.8 7.6-8.5 7.6a9.6 9.6 0 0 1-3.6-.7L3.5 20l1.4-3.6a7.1 7.1 0 0 1-1.4-4.8C3.5 7.4 7.3 4 12 4s8.5 3.4 8.5 7.6Z" />
    </svg>
  ),
  lock: (
    <svg {...iconProps}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  trash: (
    <svg {...iconProps}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 19l1-12M9 7V4.5h6V7" />
    </svg>
  ),
  repost: (
    <svg {...iconProps}>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  ),
};
