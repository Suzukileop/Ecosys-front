'use client';

import { FormEvent, useState } from 'react';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { brandCtaClass } from '@/components/landing/landingBrand';

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
    <div className="w-full max-w-sm md:justify-self-end">
      <h4 className="mb-3 text-sm font-semibold lp-text">Feedback</h4>
      {done ? (
        <p className="rounded-xl border border-teal-200/80 bg-teal-50/80 px-3 py-3 text-sm text-teal-800 dark:border-teal-800/50 dark:bg-teal-950/40 dark:text-teal-200">
          Thanks — your message was sent.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm lp-text outline-none transition placeholder:text-neutral-400 focus:border-[#F97316]/50 dark:border-white/10 dark:bg-neutral-900 dark:placeholder:text-neutral-500"
          />
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your feedback..."
            rows={3}
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm lp-text outline-none transition placeholder:text-neutral-400 focus:border-[#F97316]/50 dark:border-white/10 dark:bg-neutral-900 dark:placeholder:text-neutral-500"
          />
          {error ? <p className="text-xs text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={sending}
            className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-xs font-bold uppercase tracking-wide disabled:opacity-60 ${brandCtaClass}`}
          >
            {sending ? 'Sending…' : 'Send feedback'}
          </button>
        </form>
      )}
    </div>
  );
}
