'use client';

import { useEffect, useRef } from 'react';
import type { Client } from '@stomp/stompjs';
import { useWebRtcCall } from '@/hooks/useWebRtcCall';
import type { CallSession, CallType } from '@/types/messaging';
import { useT } from '@/lib/i18n/I18nProvider';

type DiscussionCallPanelProps = {
  conversationId: string;
  callSession: CallSession | null;
  isInitiator: boolean;
  callType: CallType;
  currentUserId?: string;
  stompClient: Client | null;
  connected: boolean;
  onEnded: () => void;
};

export function DiscussionCallPanel({
  conversationId,
  callSession,
  isInitiator,
  callType,
  currentUserId,
  stompClient,
  connected,
  onEnded,
}: DiscussionCallPanelProps) {
  const t = useT();
  const {
    localStream,
    remoteStream,
    error,
    status,
    isRinging,
    acceptCall,
    declineCall,
    hangUp,
  } = useWebRtcCall({
    conversationId,
    callSession,
    isInitiator,
    callType,
    currentUserId,
    stompClient,
    connected,
    onEnded,
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!callSession) return null;

  return (
    <div className="mx-4 mb-2 bg-[var(--msg-surface)] px-4 py-3 sm:mx-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[15px] font-bold text-[var(--msg-ink)]">
            {callType === 'VIDEO' ? t('Video call') : t('Voice call')} — {status}
          </p>
          <p className="text-[13px] text-[var(--msg-ink-faint)]">{callSession.initiatorName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isRinging ? (
            <>
              <button
                type="button"
                onClick={() => acceptCall()}
                className="inline-flex h-9 items-center rounded-full bg-[var(--msg-primary)] px-4 text-[14px] font-bold text-[var(--msg-primary-ink)] hover:bg-[var(--msg-primary-hover)]"
              >
                {t('Accept')}
              </button>
              <button
                type="button"
                onClick={() => void declineCall()}
                className="inline-flex h-9 items-center rounded-full bg-[#F4212E] px-4 text-[14px] font-bold text-white hover:bg-[#DC1D29]"
              >
                {t('Decline')}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void hangUp()}
              className="inline-flex h-9 items-center rounded-full bg-[#F4212E] px-4 text-[14px] font-bold text-white hover:bg-[#DC1D29]"
            >
              {t('End')}
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-[13px] text-[#F4212E]">{error}</p>}
      {callType === 'VIDEO' && !isRinging && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <video ref={localVideoRef} autoPlay muted playsInline className="aspect-video rounded-lg bg-black" />
          <video ref={remoteVideoRef} autoPlay playsInline className="aspect-video rounded-lg bg-black" />
        </div>
      )}
      {callType === 'VOICE' && !isRinging && (
        <audio ref={remoteAudioRef} autoPlay playsInline className="sr-only" aria-hidden />
      )}
    </div>
  );
}
