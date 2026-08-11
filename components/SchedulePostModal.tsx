'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import type { SchedulePostCreateBody, SchedulerPlatform } from '@/types/scheduler';

const PLATFORMS: { value: SchedulerPlatform; label: string; color: string }[] = [
  { value: 'INSTAGRAM', label: 'Instagram', color: 'text-pink-600' },
  { value: 'TIKTOK', label: 'TikTok', color: 'text-gray-900' },
  { value: 'YOUTUBE', label: 'YouTube', color: 'text-red-600' },
  { value: 'FACEBOOK', label: 'Facebook', color: 'text-blue-600' },
];

function minLocalDatetimeValue(): string {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}

const schema = z
  .object({
    platform: z.enum(['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK']),
    sourceType: z.literal('EXTERNAL_URL'),
    externalUrl: z.string().url('URL invalide'),
    caption: z.string().min(1, 'Légende requise.').max(2200, '2200 caractères maximum.'),
    scheduledAt: z.string().min(1, 'Date requise.'),
    nicheRef: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const min = new Date(minLocalDatetimeValue());
    const chosen = new Date(val.scheduledAt);
    if (Number.isNaN(chosen.getTime()) || chosen < min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La date doit être au moins 5 minutes dans le futur.',
        path: ['scheduledAt'],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export type PrefillNiche = { nicheCode: string; nicheTheme: string };

type SchedulePostModalProps = {
  open: boolean;
  onClose: () => void;
  onScheduled: () => void;
  prefillNiche?: PrefillNiche;
};

export function SchedulePostModal({ open, onClose, onScheduled, prefillNiche }: SchedulePostModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const minDt = minLocalDatetimeValue();

  const defaultCaption = prefillNiche
    ? `Contenu pour ma niche : ${prefillNiche.nicheTheme}`
    : '';

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      platform: 'INSTAGRAM',
      sourceType: 'EXTERNAL_URL',
      externalUrl: '',
      caption: defaultCaption,
      scheduledAt: minDt,
      nicheRef: prefillNiche?.nicheCode ?? '',
    },
  });

  const captionLen = watch('caption')?.length ?? 0;

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      setSuccess(false);
      reset({
        platform: 'INSTAGRAM',
        sourceType: 'EXTERNAL_URL',
        externalUrl: '',
        caption: prefillNiche ? `Contenu pour ma niche : ${prefillNiche.nicheTheme}` : '',
        scheduledAt: minLocalDatetimeValue(),
        nicheRef: prefillNiche?.nicheCode ?? '',
      });
    }
  }, [open, prefillNiche, reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    const scheduledIso = new Date(data.scheduledAt).toISOString();
    const body: SchedulePostCreateBody = {
      platform: data.platform,
      sourceType: 'EXTERNAL_URL',
      externalUrl: data.externalUrl,
      caption: data.caption,
      scheduledAt: scheduledIso,
      ...(data.nicheRef?.trim() ? { nicheRef: data.nicheRef.trim() } : {}),
    };
    try {
      await api.post('/api/scheduler/posts', body);
      setSuccess(true);
      onScheduled();
      window.setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 600);
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Impossible de planifier la publication.'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
        className="relative z-[101] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="schedule-modal-title" className="text-lg font-semibold text-gray-900">
            Planifier une publication
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100">
            <span className="sr-only">Fermer</span>
            ✕
          </button>
        </div>

        {success && (
          <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
            Publication planifiée.
          </p>
        )}
        {submitError && (
          <div className="mt-4">
            <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <p className="text-sm font-medium text-gray-700">Plateforme</p>
            <Controller
              name="platform"
              control={control}
              render={({ field }) => (
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => field.onChange(p.value)}
                      className={`flex flex-col items-center rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                        field.value === p.value
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className={p.color}>{p.label}</span>
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.platform && (
              <p className="mt-1 text-xs text-red-600">{errors.platform.message}</p>
            )}
          </div>

          <fieldset className="space-y-3 rounded-xl border border-gray-200 p-4">
            <legend className="text-sm font-medium text-gray-900">Source du contenu</legend>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="radio" className="mt-1" defaultChecked readOnly />
              <span>
                <span className="font-medium text-gray-800">URL externe</span>
                <span className="block text-xs text-gray-500">
                  YouTube, TikTok déjà publié, Vimeo…
                </span>
              </span>
            </label>
            <div>
              <label htmlFor="externalUrl" className="text-sm text-gray-700">
                URL du média
              </label>
              <input
                id="externalUrl"
                type="url"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="https://..."
                {...register('externalUrl')}
              />
              {errors.externalUrl && (
                <p className="mt-1 text-xs text-red-600">{errors.externalUrl.message}</p>
              )}
            </div>

            <label className="flex cursor-not-allowed items-start gap-3 opacity-60">
              <input type="radio" className="mt-1" disabled />
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-gray-800">Upload fichier</span>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">Sprint 4</span>
              </span>
            </label>
          </fieldset>

          <div>
            <label htmlFor="caption" className="text-sm font-medium text-gray-700">
              Légende
            </label>
            <textarea
              id="caption"
              rows={4}
              maxLength={2200}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              {...register('caption')}
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>{errors.caption?.message}</span>
              <span aria-live="polite">
                {captionLen} / 2200
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="scheduledAt" className="text-sm font-medium text-gray-700">
              Date et heure
            </label>
            <input
              id="scheduledAt"
              type="datetime-local"
              min={minDt}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              {...register('scheduledAt')}
            />
            {errors.scheduledAt && (
              <p className="mt-1 text-xs text-red-600">{errors.scheduledAt.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="nicheRef" className="text-sm font-medium text-gray-700">
              Référence niche (optionnel)
            </label>
            <input
              id="nicheRef"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Code MCT ou référence interne"
              {...register('nicheRef')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Envoi…' : 'Planifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
