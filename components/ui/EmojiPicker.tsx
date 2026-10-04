'use client';

import { useEffect, useRef } from 'react';

type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
  autoFocus?: boolean;
  className?: string;
};

type EmojiMartSelection = { native?: string };

/** Self-hosted copy of emoji-datasource-twitter@15.0.1 `sheets-256/64.png` — must match the data set version. */
const TWEMOJI_SPRITESHEET_URL = '/emoji/twemoji-15.0.1-sheet-64.png';
const TWEMOJI_LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

const LIGHT_VARS: Record<string, string> = {
  '--rgb-accent': '17, 17, 17',
  '--rgb-background': '255, 255, 255',
  '--rgb-color': '17, 17, 17',
  '--rgb-input': '245, 245, 245',
  '--color-border': 'rgba(0, 0, 0, 0.08)',
  '--color-border-over': 'rgba(0, 0, 0, 0.16)',
};

const DARK_VARS: Record<string, string> = {
  '--rgb-accent': '255, 255, 255',
  '--rgb-background': '17, 17, 17',
  '--rgb-color': '240, 240, 240',
  '--rgb-input': '10, 10, 10',
  '--color-border': 'rgba(255, 255, 255, 0.1)',
  '--color-border-over': 'rgba(255, 255, 255, 0.2)',
};

/**
 * Full emoji catalogue with Twemoji artwork (the set X/Twitter uses): search, categories,
 * skin tones and "Frequently used". Twemoji graphics are CC-BY 4.0 (Twitter, Inc.).
 */
export function EmojiPicker({ onSelect, autoFocus = true, className = '' }: EmojiPickerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    let picker: HTMLElement | null = null;

    void (async () => {
      const [{ Picker }, { default: data }] = await Promise.all([
        import('emoji-mart'),
        import('@emoji-mart/data/sets/15/twitter.json'),
      ]);
      const host = hostRef.current;
      if (cancelled || !host) return;
      const dark = document.documentElement.classList.contains('dark');
      picker = new Picker({
        data,
        set: 'twitter',
        getSpritesheetURL: () => TWEMOJI_SPRITESHEET_URL,
        theme: dark ? 'dark' : 'light',
        locale: 'en',
        autoFocus,
        navPosition: 'top',
        searchPosition: 'sticky',
        previewPosition: 'none',
        skinTonePosition: 'search',
        perLine: 8,
        emojiSize: 22,
        emojiButtonSize: 38,
        emojiButtonRadius: '9999px',
        maxFrequentRows: 2,
        onEmojiSelect: (emoji: EmojiMartSelection) => {
          if (emoji.native) onSelectRef.current(emoji.native);
        },
      }) as unknown as HTMLElement;
      const vars = dark ? DARK_VARS : LIGHT_VARS;
      for (const [name, value] of Object.entries(vars)) picker.style.setProperty(name, value);
      picker.style.setProperty('--font-family', 'inherit');
      picker.style.setProperty('--border-radius', '12px');
      picker.style.setProperty('--shadow', 'none');
      picker.style.height = '380px';
      host.replaceChildren(picker);
    })();

    return () => {
      cancelled = true;
      picker?.remove();
    };
  }, [autoFocus]);

  return (
    <div className={className}>
      <div ref={hostRef} className="min-h-[380px]" />
      <p className="border-t border-black/[0.06] px-3 py-1.5 text-[11px] text-neutral-400 dark:border-white/[0.08] dark:text-neutral-500">
        Emoji graphics by{' '}
        <a
          href="https://github.com/jdecked/twemoji"
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:text-neutral-600 hover:underline dark:hover:text-neutral-300"
        >
          Twemoji
        </a>{' '}
        © Twitter, Inc. and contributors ·{' '}
        <a
          href={TWEMOJI_LICENSE_URL}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:text-neutral-600 hover:underline dark:hover:text-neutral-300"
        >
          CC-BY 4.0
        </a>
      </p>
    </div>
  );
}
