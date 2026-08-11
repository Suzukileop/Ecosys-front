'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { confirmNicheAfterBot, getBotHistory, sendBotMessage } from '@/lib/ecosystem';
import { stripNicheConfirmedTag } from '@/lib/ecosystem-chat';
import type { EcosystemBotMessage, NicheRequestResponse } from '@/types/ecosystem';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { MarkdownBotContent } from '@/components/ecosystem/MarkdownBotContent';
import { brandSolidBg } from '@/components/landing/landingBrand';

function isBotMessage(m: EcosystemBotMessage): boolean {
  const t = (m.senderType ?? m.role ?? '').toUpperCase();
  if (t.includes('BOT')) return true;
  if (t.includes('HUMAN') || t.includes('USER')) return false;
  return false;
}

function lastBotMessage(messages: EcosystemBotMessage[]): EcosystemBotMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (isBotMessage(messages[i])) return messages[i];
  }
  return undefined;
}

function isBootstrapHandshake(m: EcosystemBotMessage): boolean {
  const t = (m.senderType ?? m.role ?? '').toUpperCase();
  const humanLike = t.includes('HUMAN') || t.includes('USER');
  return humanLike && m.content?.trim().toUpperCase() === 'START_CONVERSATION';
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
    </svg>
  );
}

function SendingSpinner() {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
      aria-hidden="true"
    />
  );
}

type Props = {
  request: NicheRequestResponse;
  onRefreshRequest: () => Promise<void>;
  actionsLocked?: boolean;
};

export function BotChatSection({ request, onRefreshRequest, actionsLocked = false }: Props) {
  const [messages, setMessages] = useState<EcosystemBotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      setError(null);
      let list = await getBotHistory(request.id);
      if (list.length === 0) {
        await sendBotMessage(request.id, 'START_CONVERSATION');
        list = await getBotHistory(request.id);
      }
      setMessages(list);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to load the conversation.'));
    } finally {
      setLoadingHistory(false);
    }
  }, [request.id]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const botConfirmed = request.botConfirmed;
  const visibleMessages = messages.filter((m) => !isBootstrapHandshake(m));
  const lastBot = lastBotMessage(messages);
  const assistantMarkedReady =
    lastBot != null && /\[NICHE_CONFIRMED\]/i.test(lastBot.content ?? '');

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || botConfirmed || sending || actionsLocked) return;
    setSending(true);
    setError(null);
    try {
      await sendBotMessage(request.id, trimmed);
      const synced = await getBotHistory(request.id);
      setMessages(synced);
      setInput('');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to send the message.'));
    } finally {
      setSending(false);
    }
  };

  const handleConfirmToTeam = async () => {
    if (botConfirmed || confirming || actionsLocked) return;
    setConfirming(true);
    setError(null);
    try {
      await confirmNicheAfterBot(request.id);
      await onRefreshRequest();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to confirm right now.'));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <section
      className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
      aria-label="Assistant conversation"
    >
      {error && (
        <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {botConfirmed && (
        <div
          className="border-b border-[#F97316]/20 bg-[#FFF7ED] px-4 py-2.5 text-center text-xs font-medium text-[#9A3412] dark:border-[#F97316]/25 dark:bg-[#F97316]/10 dark:text-[#FB923C]"
          role="status"
        >
          Niche confirmed — your file has been sent to the team.{' '}
          <button
            type="button"
            onClick={() => void onRefreshRequest()}
            className="font-semibold text-[#EA580C] underline-offset-2 hover:underline"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col bg-neutral-50 dark:bg-neutral-900/40">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {loadingHistory ? (
            <div className="flex h-full min-h-[16rem] items-center justify-center text-sm text-neutral-500">
              <span className="animate-pulse">Loading conversation…</span>
            </div>
          ) : (
            visibleMessages.map((m) => {
              const bot = isBotMessage(m);
              const displayText = bot ? stripNicheConfirmedTag(m.content) : m.content;
              return (
                <div key={m.id} className={`flex ${bot ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      bot
                        ? 'rounded-tl-md border border-neutral-200 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900'
                        : `rounded-tr-md text-white ${brandSolidBg}`
                    }`}
                  >
                    {bot && (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#EA580C]">
                        Assistant
                      </p>
                    )}
                    <div className={bot ? '' : 'whitespace-pre-wrap'}>
                      {bot ? <MarkdownBotContent text={displayText} /> : displayText}
                    </div>
                    <div className={`mt-2 text-[10px] ${bot ? 'text-neutral-400' : 'text-white/80'}`}>
                      {new Date(m.sentAt).toLocaleString('en-US', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {!botConfirmed && (
          <div className="border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 sm:p-5">
            <div className="relative flex items-end rounded-2xl border border-neutral-200 bg-white py-2 pl-4 pr-2 shadow-sm transition focus-within:border-[#F97316]/40 focus-within:ring-2 focus-within:ring-[#F97316]/15 dark:border-neutral-700 dark:bg-neutral-950">
              <label htmlFor="bot-input" className="sr-only">
                Your message
              </label>
              <textarea
                id="bot-input"
                rows={1}
                disabled={sending || actionsLocked}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write your message…"
                className="max-h-32 min-h-[2.5rem] flex-1 resize-none border-0 bg-transparent py-2 pr-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:opacity-60 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <button
                type="button"
                disabled={sending || actionsLocked || !input.trim()}
                onClick={() => void handleSend()}
                aria-label={sending ? 'Sending message' : 'Send message'}
                className={`mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none dark:disabled:bg-neutral-800 ${brandSolidBg}`}
              >
                {sending ? <SendingSpinner /> : <SendIcon className="h-5 w-5" />}
              </button>
            </div>

            <div className="mt-5 flex flex-col items-center gap-2">
              {assistantMarkedReady && (
                <p className="text-center text-xs font-medium text-[#EA580C]">
                  The assistant indicates your niche is ready.
                </p>
              )}
              <button
                type="button"
                disabled={confirming || actionsLocked}
                onClick={() => void handleConfirmToTeam()}
                className={`inline-flex min-w-[14rem] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 ${brandSolidBg}`}
              >
                {confirming ? 'Confirming…' : 'Confirm niche and continue'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
        <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-sm">
          {botConfirmed
            ? 'Your niche has been confirmed and sent to the team.'
            : 'When the niche looks right, confirm to send your file to the team (next step: dedicated agent).'}
        </p>
        <span className="shrink-0 self-end font-mono text-xs font-semibold text-[#EA580C] sm:self-auto sm:text-sm">
          {request.uniqueCode}
        </span>
      </div>
    </section>
  );
}
