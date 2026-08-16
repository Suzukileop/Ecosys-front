'use client';

import type { ReactNode } from 'react';

type MessageLayoutProps = {
  inbox: ReactNode;
  conversation: ReactNode;
  details?: ReactNode;
  detailsOpen?: boolean;
  onCloseDetails?: () => void;
  /** When true on small screens, show conversation instead of inbox. */
  showConversationMobile?: boolean;
};

/**
 * Messages shell with internal padding.
 * Inbox is detached from the main conversation panel with a visible gap.
 * Details open/close with a simple fluid width + slide transition.
 */
export function MessageLayout({
  inbox,
  conversation,
  details,
  detailsOpen = false,
  onCloseDetails,
  showConversationMobile = false,
}: MessageLayoutProps) {
  return (
    <div className="msg-shell flex min-h-0 flex-1 flex-col bg-neutral-100 dark:bg-neutral-950">
      <div
        className={`flex min-h-0 flex-1 gap-3 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-4 ${
          detailsOpen
            ? 'p-3 sm:p-4'
            : 'px-6 py-4 sm:px-10 sm:py-5 lg:px-14 lg:py-5 xl:px-20'
        }`}
      >
        <aside
          className={`flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-[var(--msg-radius)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:w-[320px] xl:w-[340px] ${
            showConversationMobile ? 'hidden lg:flex' : 'flex'
          }`}
          aria-label="Inbox"
        >
          {inbox}
        </aside>

        <section
          className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--msg-radius)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${
            showConversationMobile ? 'flex' : 'hidden lg:flex'
          }`}
          aria-label="Conversation"
        >
          {conversation}
        </section>

        {details ? (
          <>
            <button
              type="button"
              aria-label="Close details"
              tabIndex={detailsOpen ? 0 : -1}
              className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ease-out dark:bg-black/50 lg:hidden ${
                detailsOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
              }`}
              onClick={onCloseDetails}
            />
            <aside
              aria-label="Conversation details"
              aria-hidden={!detailsOpen}
              inert={!detailsOpen ? true : undefined}
              className={`z-50 flex shrink-0 flex-col overflow-hidden border-neutral-200 bg-white shadow-lg transition-[width,transform,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-black/40 max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:w-[min(100%,340px)] max-lg:border-l ${
                detailsOpen
                  ? 'max-lg:translate-x-0 max-lg:opacity-100 lg:ml-0 lg:w-[320px] lg:border lg:opacity-100 lg:shadow-none xl:w-[340px] lg:rounded-[var(--msg-radius)]'
                  : 'pointer-events-none max-lg:translate-x-full max-lg:opacity-0 lg:-ml-4 lg:w-0 lg:border-0 lg:opacity-0 lg:shadow-none'
              }`}
            >
              <div className="flex h-full w-[min(100vw,340px)] min-w-[min(100vw,340px)] flex-col lg:w-[320px] lg:min-w-[320px] xl:w-[340px] xl:min-w-[340px]">
                {details}
              </div>
            </aside>
          </>
        ) : null}
      </div>
    </div>
  );
}
