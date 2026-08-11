export function getIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL?.trim();
  if (turnUrl) {
    const turn: RTCIceServer = { urls: turnUrl };
    const username = process.env.NEXT_PUBLIC_TURN_USERNAME?.trim();
    const credential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL?.trim();
    if (username) turn.username = username;
    if (credential) turn.credential = credential;
    servers.push(turn);
  }

  return servers;
}
