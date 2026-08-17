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
 * Desktop: 3 columns. Mobile: successive views (inbox → conversation → details).
 */
export function MessageLayout({
  inbox,
  conversation,
  details,
  detailsOpen = false,
  showConversationMobile = false,
}: MessageLayoutProps) {
  const mobileShowInbox = !showConversationMobile && !detailsOpen;
  const mobileShowConversation = showConversationMobile && !detailsOpen;
  const mobileShowDetails = Boolean(details) && detailsOpen;

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
          className={`min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-[var(--msg-radius)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:flex lg:w-[380px] xl:w-[400px] ${
            mobileShowInbox ? 'flex' : 'hidden'
          }`}
          aria-label="Inbox"
        >
          {inbox}
        </aside>

        <section
          className={`min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--msg-radius)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:flex ${
            mobileShowConversation ? 'flex' : 'hidden'
          }`}
          aria-label="Conversation"
        >
          {conversation}
        </section>

        {details ? (
          <>
            <aside
              aria-label="Conversation details"
              aria-hidden={!detailsOpen}
              inert={!detailsOpen ? true : undefined}
              className={`z-50 hidden shrink-0 flex-col overflow-hidden border-neutral-200 bg-white transition-[width,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-neutral-800 dark:bg-neutral-900 lg:flex ${
                detailsOpen
                  ? 'ml-0 w-[320px] border opacity-100 xl:w-[340px] lg:rounded-[var(--msg-radius)]'
                  : 'pointer-events-none -ml-4 w-0 border-0 opacity-0'
              }`}
            >
              <div className="flex h-full w-[320px] min-w-[320px] flex-col xl:w-[340px] xl:min-w-[340px]">
                {details}
              </div>
            </aside>

            <aside
              aria-label="Conversation details"
              aria-hidden={!mobileShowDetails}
              inert={!mobileShowDetails ? true : undefined}
              className={`min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--msg-radius)] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:hidden ${
                mobileShowDetails ? 'flex' : 'hidden'
              }`}
            >
              {details}
            </aside>
          </>
        ) : null}
      </div>
    </div>
  );
}
