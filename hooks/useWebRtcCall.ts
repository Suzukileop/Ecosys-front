'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Client, StompSubscription } from '@stomp/stompjs';
import { answerCall, endCall } from '@/lib/messaging';
import { getApiErrorMessage } from '@/lib/api-error';
import { getIceServers } from '@/lib/webrtc-ice';
import type { CallSession, CallType } from '@/types/messaging';

type CallSignalMessage = {
  type: string;
  payload: string;
  fromUserId?: string;
};

type UseWebRtcCallOptions = {
  conversationId: string;
  callSession: CallSession | null;
  isInitiator: boolean;
  callType: CallType;
  currentUserId?: string;
  stompClient: Client | null;
  connected: boolean;
  onEnded: () => void;
};

export function useWebRtcCall({
  conversationId,
  callSession,
  isInitiator,
  callType,
  currentUserId,
  stompClient,
  connected,
  onEnded,
}: UseWebRtcCallOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(isInitiator ? 'Connecting…' : 'Incoming call…');
  const [callAccepted, setCallAccepted] = useState(isInitiator);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const signalSubRef = useRef<StompSubscription | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const remoteDescriptionSetRef = useRef(false);
  const pcReadyRef = useRef(false);
  const callSessionRef = useRef(callSession);
  const currentUserIdRef = useRef(currentUserId);
  const onEndedRef = useRef(onEnded);
  const isInitiatorRef = useRef(isInitiator);

  useEffect(() => {
    callSessionRef.current = callSession;
    currentUserIdRef.current = currentUserId;
    onEndedRef.current = onEnded;
    isInitiatorRef.current = isInitiator;
  }, [callSession, currentUserId, onEnded, isInitiator]);

  useEffect(() => {
    setCallAccepted(isInitiator);
    setStatus(isInitiator ? 'Connecting…' : 'Incoming call…');
    setError(null);
    pendingOfferRef.current = null;
    pcReadyRef.current = false;
  }, [callSession?.id, isInitiator]);

  const cleanup = useCallback(() => {
    signalSubRef.current?.unsubscribe();
    signalSubRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    pendingIceRef.current = [];
    pendingOfferRef.current = null;
    remoteDescriptionSetRef.current = false;
    pcReadyRef.current = false;
  }, []);

  const publishSignal = useCallback(
    (type: string, payload: unknown) => {
      const session = callSessionRef.current;
      if (!stompClient?.connected || !session) return;
      stompClient.publish({
        destination: `/app/conversations/${conversationId}/call/signal`,
        body: JSON.stringify({ type, payload: JSON.stringify(payload), fromUserId: '' }),
      });
    },
    [stompClient, conversationId]
  );

  const flushPendingIce = useCallback(async (pc: RTCPeerConnection) => {
    const pending = [...pendingIceRef.current];
    pendingIceRef.current = [];
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        /* ignore stale candidates */
      }
    }
  }, []);

  const addIceCandidateSafe = useCallback(
    async (pc: RTCPeerConnection, candidate: RTCIceCandidateInit) => {
      if (!remoteDescriptionSetRef.current) {
        pendingIceRef.current.push(candidate);
        return;
      }
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        /* ignore */
      }
    },
    []
  );

  const processRemoteOffer = useCallback(
    async (pc: RTCPeerConnection, offer: RTCSessionDescriptionInit) => {
      const session = callSessionRef.current;
      if (!session) return;

      await pc.setRemoteDescription(offer);
      remoteDescriptionSetRef.current = true;
      await flushPendingIce(pc);
      const sdpAnswer = await pc.createAnswer();
      await pc.setLocalDescription(sdpAnswer);
      publishSignal('answer', sdpAnswer);
      await answerCall(conversationId, session.id);
      setStatus('In call');
    },
    [conversationId, flushPendingIce, publishSignal]
  );

  const hangUp = useCallback(async () => {
    const session = callSessionRef.current;
    if (session) {
      try {
        await endCall(conversationId, session.id);
      } catch {
        /* ignore */
      }
    }
    cleanup();
    onEndedRef.current();
  }, [cleanup, conversationId]);

  const declineCall = useCallback(async () => {
    await hangUp();
  }, [hangUp]);

  const acceptCall = useCallback(() => {
    setCallAccepted(true);
    setStatus('Connecting…');
  }, []);

  const handleSignal = useCallback(
    async (signal: CallSignalMessage) => {
      if (
        signal.fromUserId &&
        currentUserIdRef.current &&
        signal.fromUserId === currentUserIdRef.current
      ) {
        return;
      }

      const activePc = peerRef.current;
      const data = JSON.parse(signal.payload) as RTCSessionDescriptionInit | RTCIceCandidateInit;

      if (signal.type === 'offer' && !isInitiatorRef.current) {
        if (!activePc || !pcReadyRef.current) {
          pendingOfferRef.current = data as RTCSessionDescriptionInit;
          return;
        }
        await processRemoteOffer(activePc, data as RTCSessionDescriptionInit);
      } else if (signal.type === 'answer' && isInitiatorRef.current && activePc) {
        await activePc.setRemoteDescription(data as RTCSessionDescriptionInit);
        remoteDescriptionSetRef.current = true;
        await flushPendingIce(activePc);
        setStatus('In call');
      } else if (signal.type === 'ice' && activePc) {
        await addIceCandidateSafe(activePc, data as RTCIceCandidateInit);
      }
    },
    [addIceCandidateSafe, flushPendingIce, processRemoteOffer]
  );

  useEffect(() => {
    if (!callSession || !connected || !stompClient?.connected || !callAccepted) return;

    if (!signalSubRef.current) {
      signalSubRef.current = stompClient.subscribe(
        `/topic/conversations/${conversationId}/call/signal`,
        (message) => {
          try {
            const signal = JSON.parse(message.body) as CallSignalMessage;
            void handleSignal(signal);
          } catch (e) {
            setError(getApiErrorMessage(e, 'Call signaling error.'));
          }
        }
      );
    }

    let cancelled = false;

    const setupPeer = async () => {
      if (peerRef.current) return;

      try {
        setStatus('Requesting microphone…');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'VIDEO',
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        const pc = new RTCPeerConnection({ iceServers: getIceServers() });
        peerRef.current = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          setRemoteStream(event.streams[0] ?? null);
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            publishSignal('ice', event.candidate.toJSON());
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            setStatus('In call');
          } else if (pc.iceConnectionState === 'failed') {
            setError('Connection failed.');
            void hangUp();
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'failed') {
            setError('Connection failed.');
            void hangUp();
          }
        };

        pcReadyRef.current = true;

        if (pendingOfferRef.current && !isInitiatorRef.current) {
          const offer = pendingOfferRef.current;
          pendingOfferRef.current = null;
          await processRemoteOffer(pc, offer);
        } else if (isInitiatorRef.current) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          publishSignal('offer', offer);
          setStatus('Ringing…');
        }
      } catch (e) {
        setError(getApiErrorMessage(e, 'Unable to access microphone/camera.'));
      }
    };

    void setupPeer();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [
    callAccepted,
    callSession,
    callType,
    cleanup,
    connected,
    conversationId,
    handleSignal,
    hangUp,
    processRemoteOffer,
    publishSignal,
    stompClient,
  ]);

  const isRinging = !isInitiator && !callAccepted;

  return {
    localStream,
    remoteStream,
    error,
    status,
    isRinging,
    acceptCall,
    declineCall,
    hangUp,
  };
}
