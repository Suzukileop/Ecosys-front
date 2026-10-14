'use client';

import { useEffect, type ReactNode } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';

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
 * Messages shell — the only place the messaging token scope is opened.
 *
 * `msg-mineral` (globals.css, re-pointed to the News X palette in the MESSAGES block) declares the
 * section's `--msg-*` / `--cw-*` tokens, so every descendant picks the palette up without knowing it.
 * `x-messages` (app/(app)/messages/x-messages.css) adds the News tokens (`--gn-*`) and the
 * ground-dependent `--xm-*` tones on top, and `news-mono` brings News's Inter interface, the
 * `.gn-kicker` section lines and the `.gn-rail-box` frames — the same vocabulary as /feed.
 *
 * Desktop: 3 columns set 8px apart — the inbox and details as square blocks in the module tone
 * (#F7F9F9 / #16181C, via `msg-surface-scope`), the conversation on the page ground inside a 1px
 * frame (`--xm-frame`), News's outlined-box idiom: on the bare ground with no edge it read as
 * floating in the void. A real border, not an inset shadow — the thread paints its own ground over
 * its column. The frame is the navbar's — 1240px between its
 * 32 / 48 / 64px gutters — so the inbox starts under the wordmark and the last column ends under the
 * avatar, Details open or not.
 * Phones: successive full-screen views (inbox → conversation → details), all on the ground.
 */
export function MessageLayout({
  inbox,
  conversation,
  details,
  detailsOpen = false,
  showConversationMobile = false,
}: MessageLayoutProps) {
  const t = useT();
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
   * Phones: keep the full-screen thread exactly the size of the *visual* viewport, so when the
   * on-screen keyboard opens the composer rides on top of it instead of being covered (iOS never
   * shrinks the layout viewport, and Android Chrome only resizes the visual one by default).
   */
  useEffect(() => {
    if (!mobileFullscreen) return;
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    const root = document.documentElement;
    const apply = () => {
      root.style.setProperty('--msg-vv-height', `${Math.round(vv.height)}px`);
      root.style.setProperty('--msg-vv-top', `${Math.max(0, Math.round(vv.offsetTop))}px`);
    };
    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
      root.style.removeProperty('--msg-vv-height');
      root.style.removeProperty('--msg-vv-top');
    };
  }, [mobileFullscreen]);

  /* Square surface block on desktop, plain ground on phones (the scope only applies from lg). */
  const surfaceClass = 'msg-surface-scope bg-[var(--msg-panel)]';
  /* Phones: an open thread (and its details) takes the whole (visual) screen, over the app bar. */
  const mobileFullscreenClass =
    'max-lg:fixed max-lg:inset-x-0 max-lg:top-[var(--msg-vv-top,0px)] max-lg:z-[70] max-lg:h-[var(--msg-vv-height,100dvh)] max-lg:bg-[var(--msg-ground)]';

  return (
    <div className="msg-shell msg-mineral x-messages news-mono flex min-h-0 flex-1 flex-col bg-[var(--msg-ground)]">
      <div className="mx-auto flex min-h-0 w-full max-w-[1368px] flex-1 gap-2 px-0 pb-0 pt-0 lg:px-16 lg:pb-6 lg:pt-5">
        <aside
          /* Details open (desktop): the inbox folds to an 88px rail of avatars so the conversation keeps
             its width inside the frame; closing Details unfolds it. The column's children read the
             state through `group-data-[folded=true]/inbox` (InboxPanel, InboxConversationRow). */
          data-folded={detailsOpen ? 'true' : 'false'}
          className={`group/inbox min-h-0 w-full shrink-0 flex-col overflow-hidden ${surfaceClass} transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex ${
            detailsOpen ? 'lg:w-[88px]' : 'lg:w-[320px] xl:w-[360px]'
          } ${mobileShowInbox ? 'flex' : 'hidden'}`}
          aria-label={t('Inbox')}
        >
          {inbox}
        </aside>

        <section
          className={`min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--msg-ground)] lg:flex lg:border lg:border-[color:var(--xm-frame)] ${
            mobileShowConversation ? `flex ${mobileFullscreenClass}` : 'hidden'
          }`}
          aria-label={t('Conversation')}
        >
          {conversation}
        </section>

        {details ? (
          <>
            <aside
              aria-label={t('Conversation details')}
              aria-hidden={!detailsOpen}
              inert={!detailsOpen ? true : undefined}
              className={`${surfaceClass} z-50 hidden shrink-0 flex-col overflow-hidden transition-[width,opacity,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex ${
                detailsOpen
                  ? 'ml-0 w-[300px] opacity-100 xl:w-[320px]'
                  : 'pointer-events-none -ml-2 w-0 opacity-0'
              }`}
            >
              <div className="flex h-full w-[300px] min-w-[300px] flex-col xl:w-[320px] xl:min-w-[320px]">
                {details}
              </div>
            </aside>

            <aside
              aria-label={t('Conversation details')}
              aria-hidden={!mobileShowDetails}
              inert={!mobileShowDetails ? true : undefined}
              className={`min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--msg-ground)] lg:hidden ${
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
