'use client';

import { useEffect, useRef } from 'react';
import type { Client } from '@stomp/stompjs';
import { useWebRtcCall } from '@/hooks/useWebRtcCall';
import type { CallSession, CallType } from '@/types/messaging';

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
    <div className="mb-3 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/30">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-green-900 dark:text-green-200">
            {callType === 'VIDEO' ? 'Video call' : 'Voice call'} — {status}
          </p>
          <p className="text-xs text-green-700 dark:text-green-400">{callSession.initiatorName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isRinging ? (
            <>
              <button
                type="button"
                onClick={() => acceptCall()}
                className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => void declineCall()}
                className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Decline
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void hangUp()}
              className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              End
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
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
