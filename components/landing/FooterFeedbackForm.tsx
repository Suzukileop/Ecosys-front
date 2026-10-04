'use client';

import { FormEvent, useState } from 'react';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';

const FIELD =
  'w-full rounded-lg border border-white/[0.14] bg-white/[0.03] px-4 text-[15px] text-white outline-none transition-[border-color,box-shadow] placeholder:text-white/35 focus:border-[#FF5722] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.16)]';

export function FooterFeedbackForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setError(null);
    setSending(true);
    try {
      await api.post('/api/public/feedback', {
        email: email.trim(),
        message: message.trim(),
      });
      setDone(true);
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send feedback. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full">
      <h4 className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/40">Feedback</h4>
      {done ? (
        <p className="mt-5 text-[15px] text-white">Thanks — your message was sent.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            aria-label="Your email"
            className={`${FIELD} h-11`}
          />
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you think…"
            aria-label="Your feedback"
            rows={3}
            maxLength={2000}
            className={`${FIELD} resize-none py-3`}
          />
          {error ? <p className="text-[13px] text-[#FF8A65]">{error}</p> : null}
          <button
            type="submit"
            disabled={sending}
            className="inline-flex h-11 items-center justify-center self-start rounded-full bg-white px-6 text-[14px] font-medium text-[#111111] transition-colors hover:bg-neutral-200 disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send feedback'}
          </button>
        </form>
      )}
    </div>
  );
}
