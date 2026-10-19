'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import {
  DANGER_BUTTON_CLASS,
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
  Spinner,
} from '@/components/settings/settingsUi';
import './profile-drawer.css';
import { useT } from '@/lib/i18n/I18nProvider';

const subscribeNoop = () => () => {};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const FOCUS_RING = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

function focusableIn(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (node) => node.getClientRects().length > 0
  );
}

type ProfileSectionDrawerProps = {
  open: boolean;
  /** Dialog title, e.g. "Edit stack". */
  title: string;
  /** One line under the title; also the dialog's accessible description. */
  description?: string;
  /** The section differs from what is saved: enables Save and guards closing. */
  dirty: boolean;
  saving: boolean;
  /** Inline save error, shown in the footer next to the buttons. */
  error?: string | null;
  saveLabel?: string;
  onSave: () => void;
  onClose: () => void;
  children: ReactNode;
};

/**
 * One section of My Profile, edited on its own (LinkedIn's model): a right-hand panel holding only that
 * section's fields, with its own Cancel / Save.
 *  - From sm it is a 520px panel over a dimmed page; on phones it is a full-screen sheet.
 *  - Portaled to <body>, so it re-applies the page's `news-theme news-feed news-mono` scope: the --gn-*
 *    tokens and the neutral-utility remaps then resolve exactly as they do on the profile page, and the
 *    reused field components look the same in the panel as they did inline.
 *  - Save stays disabled until the section is dirty and spins while saving; a failed save keeps the
 *    panel open with the message in the footer (role="alert"), next to the action that failed.
 *  - Escape, the backdrop, ✕ and Cancel all close — after a "Discard changes?" when there are edits.
 *  - A real modal: role="dialog" + aria-modal, labelled by its title, Tab trapped inside, the page
 *    scroll locked, focus moved to the first field on open and handed back to the opener on close.
 */
export function ProfileSectionDrawer({
  open,
  title,
  description,
  dirty,
  saving,
  error,
  saveLabel = 'Save',
  onSave,
  onClose,
  children,
}: ProfileSectionDrawerProps) {
  const t = useT();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const titleId = useId();
  const descriptionId = useId();
  const discardTitleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setConfirmDiscard(false);
  }

  /* Latest values for the document listeners without re-binding them on every keystroke. */
  const stateRef = useRef({ dirty, saving, confirmDiscard, onClose });
  useEffect(() => {
    stateRef.current = { dirty, saving, confirmDiscard, onClose };
  });

  /* Focus: first field on open (the panel itself when it has none), back to the opener on close. */
  useEffect(() => {
    if (!open || !mounted) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => {
      const target = focusableIn(bodyRef.current)[0] ?? panelRef.current;
      target?.focus({ preventScroll: true });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open, mounted]);

  /* Escape closes (asking first when dirty), Tab cycles inside the panel, the page does not scroll. */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const state = stateRef.current;
      if (event.key === 'Escape') {
        if (state.saving) return;
        event.preventDefault();
        if (state.confirmDiscard) setConfirmDiscard(false);
        else if (state.dirty) setConfirmDiscard(true);
        else state.onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const container = state.confirmDiscard ? confirmRef.current : panelRef.current;
      const nodes = focusableIn(container);
      if (!container || nodes.length === 0) {
        event.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (!container.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /* Leaving the page (reload, closing the tab) with unsaved edits asks the browser's own question. */
  useEffect(() => {
    if (!open || !dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [open, dirty]);

  if (!open || !mounted) return null;

  const requestClose = () => {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  return createPortal(
    <div className="news-theme news-feed news-mono fixed inset-0 z-[100]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[rgba(15,20,25,0.4)] dark:bg-[rgba(91,112,131,0.4)]"
        onMouseDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          requestClose();
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        style={STUDIO_FLOAT_IN_STYLE}
        /* The panel is the page's own white / black, so the --gn-surface fields read as fields on it.
           (`bg-[#fff]`, not `bg-white`: the news scope repaints `bg-white` as the card surface.) */
        className="absolute inset-y-0 right-0 flex h-full w-full flex-col bg-[#fff] text-[color:var(--gn-ink)] outline-hidden dark:bg-black sm:max-w-[520px] sm:shadow-[0_0_0_1px_var(--gn-line),0_16px_48px_-16px_rgba(15,20,25,0.3)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--gn-line)] px-4 py-4 sm:px-6">
          <div className="min-w-0 pt-1">
            <h2 id={titleId} className="text-[20px] font-extrabold leading-6 tracking-[-0.015em] text-[color:var(--gn-ink)]">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-[14px] leading-5 text-[color:var(--gn-ink2)]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            aria-label={t('Close')}
            className={`-mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[color:var(--gn-ink)] transition-colors hover:bg-[color:var(--gn-hover)] disabled:opacity-40 ${FOCUS_RING}`}
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={bodyRef}
          className="x-drawer-body min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 [scrollbar-color:rgba(0,0,0,0.18)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:rgba(255,255,255,0.16)_transparent] sm:px-6"
        >
          {children}
        </div>

        {/* The outcome lives here: an inline error on the left, Cancel / Save on the right. On phones
            the bar clears the home indicator. */}
        <div className="flex items-center gap-3 border-t border-[color:var(--gn-line)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
          <p role="alert" className="min-w-0 flex-1 text-[13px] font-medium leading-[18px] text-[#F4212E]">
            {error ?? null}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={requestClose} disabled={saving} className={SECONDARY_BUTTON_CLASS}>
              {t('Cancel')}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!dirty || saving}
              aria-busy={saving || undefined}
              className={PRIMARY_BUTTON_CLASS}
            >
              {saving ? <Spinner /> : null}
              {saving ? t('Saving…') : saveLabel}
            </button>
          </div>
        </div>

        {/* Unsaved edits: ask before throwing them away (backdrop, Escape, ✕, Cancel). */}
        {confirmDiscard ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(15,20,25,0.4)] p-6 dark:bg-[rgba(91,112,131,0.4)]">
            <div
              ref={confirmRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={discardTitleId}
              style={STUDIO_FLOAT_IN_STYLE}
              className="w-full max-w-sm rounded-2xl bg-[#fff] p-6 shadow-[0_0_0_1px_var(--gn-line),0_16px_40px_-16px_rgba(15,20,25,0.35)] dark:bg-black"
            >
              <h3 id={discardTitleId} className="text-[20px] font-extrabold tracking-[-0.015em] text-[color:var(--gn-ink)]">
                {t('Discard changes?')}
              </h3>
              <p className="mt-1.5 text-[15px] leading-5 text-[color:var(--gn-ink2)]">
                {t('Your edits to this section will be lost.')}
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button type="button" autoFocus onClick={() => setConfirmDiscard(false)} className={`${SECONDARY_BUTTON_CLASS} !h-11`}>
                  {t('Keep editing')}
                </button>
                <button type="button" onClick={onClose} className={`${DANGER_BUTTON_CLASS} !h-11`}>
                  {t('Discard')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
