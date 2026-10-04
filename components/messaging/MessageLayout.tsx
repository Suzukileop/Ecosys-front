'use client';

import { useEffect, type ReactNode } from 'react';

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
 * Messages shell — the only place the mineral scope is opened.
 *
 * `msg-mineral` (globals.css) re-declares the section's `--msg-*` / `--cw-*` tokens,
 * so every descendant picks the charter up without knowing about it. Nothing below
 * this file hardcodes a grey.
 *
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
  const mobileFullscreen = mobileShowConversation || mobileShowDetails;

  useEffect(() => {
    const root = document.documentElement;
    if (mobileFullscreen) root.setAttribute('data-chat-fullscreen', '');
    else root.removeAttribute('data-chat-fullscreen');
    return () => root.removeAttribute('data-chat-fullscreen');
  }, [mobileFullscreen]);

  /*
   * One panel treatment, written once. The hairline is the *only* thing marking a
   * panel edge — at 4% black it reads as the boundary of the sheet rather than as
   * a drawn border, which is the whole point of putting the panels a single step
   * above the ground instead of making them white.
   */
  const panelClass =
    'bg-[var(--msg-panel)] lg:border lg:border-[var(--msg-hairline)] lg:rounded-[var(--msg-radius)]';
  /* Phones: an open thread (and its details) takes the whole screen, over the app bar. */
  const mobileFullscreenClass = 'max-lg:fixed max-lg:inset-0 max-lg:z-[70] max-lg:h-[100dvh]';

  return (
    <div className="msg-shell msg-mineral flex min-h-0 flex-1 flex-col bg-[var(--msg-ground)]">
      <div
        className={`mx-auto flex min-h-0 w-full flex-1 gap-4 px-0 pb-0 pt-0 transition-[max-width] lg:pb-6 lg:pt-4 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:gap-5 sm:px-0 ${
          detailsOpen ? 'max-w-[1600px]' : 'max-w-[1280px]'
        }`}
      >
        <aside
          className={`min-h-0 w-full shrink-0 flex-col overflow-hidden ${panelClass} lg:flex lg:w-[360px] xl:w-[380px] ${
            mobileShowInbox ? 'flex' : 'hidden'
          }`}
          aria-label="Inbox"
        >
          {inbox}
        </aside>

        <section
          className={`min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${panelClass} lg:flex ${
            mobileShowConversation ? `flex ${mobileFullscreenClass}` : 'hidden'
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
              className={`z-50 hidden shrink-0 flex-col overflow-hidden border-[var(--msg-hairline)] bg-[var(--msg-panel)] transition-[width,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex ${
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
              className={`min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden ${panelClass} lg:hidden ${
                mobileShowDetails ? `flex ${mobileFullscreenClass}` : 'hidden'
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
