import type { ReactNode } from 'react';

/** A web address in a message: http(s), up to whitespace, without the punctuation that ends a sentence. */
const URL_PATTERN = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]!?])/g;

/** Longest shown address; the full one stays in the link and its tooltip. */
const MAX_SHOWN = 44;

/**
 * The address as people read it: no scheme, no "www.", no trailing slash, cut with an ellipsis past
 * 44 characters — "trycloudflare.com/marketplace/content/8a40…" rather than three lines of hash.
 */
function shortUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = `${parsed.pathname}${parsed.search}`.replace(/\/$/, '');
    const shown = `${parsed.host.replace(/^www\./, '')}${path}`;
    return shown.length > MAX_SHOWN ? `${shown.slice(0, MAX_SHOWN - 1)}…` : shown;
  } catch {
    return url;
  }
}

/**
 * A message's text with its web addresses as links (new tab), shown short. The bubble's own rule
 * (`.msg-bubble a`) underlines them in the bubble's ink, so they read on both bubble tones.
 */
export function LinkifiedText({ text }: { text: string }): ReactNode {
  const parts = text.split(URL_PATTERN);
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer" title={part}>
        {shortUrl(part)}
      </a>
    ) : (
      part
    )
  );
}
