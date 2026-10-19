'use client';
import { useT } from '@/lib/i18n/I18nProvider';

type EmptyConversationProps = {
  onNewMessage?: () => void;
};

/**
 * The resting state of the conversation column (desktop — phones show the inbox instead): one bold
 * 24px line, one sentence, and the action that resolves it as the ink pill.
 * Left-aligned in a narrow measure, like the head of a News card.
 */
export function EmptyConversation({ onNewMessage }: EmptyConversationProps) {
  const t = useT();
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center px-6 py-16" role="status">
      <div className="flex w-full max-w-sm flex-col items-start text-left">
        <h2 className="text-[24px] font-extrabold leading-8 tracking-[-0.02em] text-[color:var(--gn-ink)]">
          {t('Select a conversation')}
        </h2>
        <p className="mt-2 text-[15px] leading-5 text-[color:var(--gn-ink2)]">
          {t('Pick one from your inbox, or start a new one with a provider or a client.')}
        </p>
        {onNewMessage ? (
          <button
            type="button"
            onClick={onNewMessage}
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-[color:var(--gn-primary)] px-6 text-[15px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors duration-200 hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
          >
            {t('New message')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
