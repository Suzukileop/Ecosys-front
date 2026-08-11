'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api, { getAccessToken } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { stripNicheConfirmedTag } from '@/lib/ecosystem-chat';
import { getSockJsEndpoint } from '@/lib/ws-url';
import { ChatMessageDto } from '@/types/ecosystem';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

interface StompChatPanelProps {
  roomId: string;
  title?: string;
  /** Si false : lecture seule (pas de champ ni bouton d’envoi). */
  showComposer?: boolean;
}

function sortBySentAt(a: ChatMessageDto, b: ChatMessageDto): number {
  return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
}

function isBotLike(m: ChatMessageDto): boolean {
  const t = (m.senderType ?? '').toUpperCase();
  if (t === 'BOT') return true;
  if (m.senderName?.toLowerCase() === 'bot') return true;
  return false;
}

export function StompChatPanel({ roomId, title = 'Discussion', showComposer = true }: StompChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadHistory = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoadingHistory(true);
      setError(null);
      const res = await api.get<PagedHistory>('/api/chat/' + encodeURIComponent(roomId) + '/history', {
        params: { page: 0, size: 100 },
      });
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : raw?.content ?? [];
      setMessages([...list].sort(sortBySentAt));
    } catch (e) {
      setError(getApiErrorMessage(e, 'Impossible de charger les messages.'));
    } finally {
      setLoadingHistory(false);
    }
  }, [roomId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingHistory]);

  useEffect(() => {
    if (!roomId) return;

    const token = getAccessToken();
    setNoToken(!token);

    const stomp = new Client({
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      webSocketFactory: () => new SockJS(getSockJsEndpoint()) as unknown as WebSocket,
      onConnect: () => {
        setConnected(true);
        setError(null);
        stomp.subscribe(`/topic/chat/${roomId}`, (message: IMessage) => {
          try {
            const parsed = JSON.parse(message.body) as ChatMessageDto;
            setSending(false);
            if (sendFallbackTimerRef.current) {
              clearTimeout(sendFallbackTimerRef.current);
              sendFallbackTimerRef.current = null;
            }
            setMessages((prev) => {
              const next = [...prev.filter((m) => m.id !== parsed.id), parsed];
              return next.sort(sortBySentAt);
            });
          } catch {
            setError('Message reçu invalide.');
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        setError(frame.headers['message'] ?? 'Erreur de connexion temps réel.');
      },
      onWebSocketError: () => {
        setError('Connexion WebSocket interrompue.');
      },
    });

    clientRef.current = stomp;
    if (token) {
      stomp.activate();
    }

    return () => {
      if (sendFallbackTimerRef.current) {
        clearTimeout(sendFallbackTimerRef.current);
      }
      stomp.deactivate();
      clientRef.current = null;
    };
  }, [roomId]);

  const send = () => {
    const text = input.trim();
    const client = clientRef.current;
    if (!text || !client?.connected || sending) return;
    try {
      setSending(true);
      client.publish({
        destination: `/app/chat/${roomId}/send`,
        body: JSON.stringify({ content: text }),
      });
      setInput('');
      if (sendFallbackTimerRef.current) clearTimeout(sendFallbackTimerRef.current);
      sendFallbackTimerRef.current = setTimeout(() => {
        setSending(false);
        void loadHistory();
        sendFallbackTimerRef.current = null;
      }, 1200);
    } catch (e) {
      setSending(false);
      setError(getApiErrorMessage(e, 'Envoi impossible.'));
    }
  };

  const showWsHint = noToken && !connected;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm" aria-labelledby="chat-heading">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 id="chat-heading" className="text-sm font-semibold text-gray-900">
          {title}
        </h3>
        <span
          className={`text-xs font-medium ${
            connected ? 'text-green-600' : showWsHint ? 'text-red-600' : 'text-amber-600'
          }`}
          aria-live="polite"
        >
          {connected ? 'Temps réel connecté' : showWsHint ? 'Session expirée ?' : 'Connexion…'}
        </span>
      </div>

      {showWsHint && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Impossible de joindre le chat temps réel sans jeton d&apos;accès. Rechargez la page ou reconnectez-vous pour
          envoyer des messages.
        </p>
      )}

      {error && (
        <div className="mb-3">
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}
      <div
        className="mb-3 max-h-72 space-y-3 overflow-y-auto rounded-lg bg-gray-50 p-3 text-sm"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {loadingHistory ? (
          <LoadingSpinner />
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">Aucun message pour le moment.</p>
        ) : (
          messages.map((m) => {
            const botLike = isBotLike(m);
            const mine =
              !botLike && user?.id != null && m.senderId != null && m.senderId === user.id;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? 'justify-end' : botLike ? 'justify-start' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 shadow-sm ring-1 ring-black/5 ${
                    mine
                      ? 'rounded-tr-none bg-indigo-600 text-white'
                      : botLike
                        ? 'rounded-tl-none bg-teal-50 text-gray-900'
                        : 'rounded-tl-none bg-white text-gray-900'
                  }`}
                >
                  <div
                    className={`flex justify-between gap-2 text-[10px] ${
                      mine ? 'text-indigo-100' : 'text-gray-500'
                    }`}
                  >
                    <span className={`font-medium ${mine ? 'text-white' : 'text-gray-800'}`}>
                      {botLike && <span aria-hidden>🤖 </span>}
                      {m.senderName}
                    </span>
                    <time dateTime={m.sentAt}>{new Date(m.sentAt).toLocaleString('fr-FR')}</time>
                  </div>
                  <p className={`mt-1 whitespace-pre-wrap ${mine ? 'text-white' : 'text-gray-800'}`}>
                    {botLike ? stripNicheConfirmedTag(m.content) : m.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      {showComposer ? (
        <div className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Votre message
          </label>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={connected ? 'Écrire un message…' : 'Connexion en cours ou session à renouveler…'}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled={!connected || sending}
          />
          <button
            type="button"
            onClick={send}
            disabled={!connected || sending || !input.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          Messagerie en lecture seule à cette étape. Vous serez notifié lorsque votre agent répondra.
        </p>
      )}
    </section>
  );
}

/** Réponse paginée ou tableau brut selon implémentation backend */
interface PagedHistory {
  content?: ChatMessageDto[];
}
