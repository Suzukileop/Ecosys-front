'use client';

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { AUTH_FIELD_CLASSES } from '@/components/auth/AuthFields';
import { useT } from '@/lib/i18n/I18nProvider';

/** The server's e-mailed one-time codes (sign-up, password set-up and reset) are 6 digits. */
export const VERIFICATION_CODE_LENGTH = 6;
export const EMPTY_VERIFICATION_CODE: string[] = Array.from({ length: VERIFICATION_CODE_LENGTH }, () => '');

const CODE_LENGTH = VERIFICATION_CODE_LENGTH;

/** The auth pages' box: their field skin, tall, one large digit. */
const AUTH_BOX = (invalid: boolean) =>
  `${AUTH_FIELD_CLASSES.base} ${invalid ? AUTH_FIELD_CLASSES.error : AUTH_FIELD_CLASSES.ok} h-14 text-[22px] font-medium`;

/** Seconds left before "Resend code" is allowed, ticking once a second. */
export function useResendCooldown(availableAt: number) {
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((availableAt - now) / 1000));
  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [remaining]);
  return remaining;
}

/**
 * Six one-digit boxes that behave like one field: typing moves forward, Backspace on an empty box
 * goes back, arrows move, and a paste or the OS's one-time-code autofill (`autocomplete=
 * "one-time-code"` on the first box — iOS / Android offer the code from the e-mail) fills them all.
 */
export function VerificationCodeInput({
  digits,
  onChange,
  invalid,
  disabled,
  autoFocus = true,
  boxClassName = AUTH_BOX,
}: {
  digits: string[];
  /* Updaters, not values: fast typing or autofill fires several changes before React re-renders,
     and each must build on the previous one rather than on this render's `digits`. */
  onChange: (update: (previous: string[]) => string[]) => void;
  invalid: boolean;
  disabled: boolean;
  autoFocus?: boolean;
  /** Skin of one box (border, height, type size); layout and digit alignment are set here. */
  boxClassName?: (invalid: boolean) => string;
}) {
  const t = useT();
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focusBox = (index: number) => {
    const box = refs.current[Math.max(0, Math.min(CODE_LENGTH - 1, index))];
    box?.focus();
    box?.select();
  };

  /* Writes `text` from box `start` on; returns the index of the box after the last digit written. */
  const fill = (start: number, text: string) => {
    const incoming = text.replace(/\D/g, '').slice(0, CODE_LENGTH - start).split('');
    if (incoming.length === 0) return start;
    onChange((previous) => {
      const next = [...previous];
      incoming.forEach((digit, offset) => {
        next[start + offset] = digit;
      });
      return next;
    });
    return start + incoming.length;
  };

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      onChange((previous) => previous.map((digit, i) => (i === index - 1 ? '' : digit)));
      focusBox(index - 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    focusBox(fill(index, event.clipboardData.getData('text')));
  };

  return (
    <div role="group" aria-label={t('Verification code')} className="flex justify-between gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={autoFocus && index === 0}
          maxLength={index === 0 ? CODE_LENGTH : 1}
          value={digit}
          disabled={disabled}
          aria-label={t('Digit {n} of {total}', { n: index + 1, total: CODE_LENGTH })}
          aria-invalid={invalid}
          onFocus={(event) => event.target.select()}
          onKeyDown={handleKeyDown(index)}
          onPaste={handlePaste(index)}
          onChange={(event) => {
            const value = event.target.value;
            if (value === '') {
              onChange((previous) => previous.map((digit, i) => (i === index ? '' : digit)));
              return;
            }
            /* One typed digit, or several at once from autofill. */
            focusBox(fill(index, value.length > 1 ? value : value.slice(-1)));
          }}
          className={`${boxClassName(invalid)} min-w-0 flex-1 px-0 text-center tabular-nums disabled:opacity-60`}
        />
      ))}
    </div>
  );
}

