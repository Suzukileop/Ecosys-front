'use client';

import Link from 'next/link';
import type { NicheRequestResponse } from '@/types/ecosystem';

type Props = {
  request: NicheRequestResponse;
  variant: 'rejected' | 'cancelled';
};

export function RejectedSection({ request, variant }: Props) {
  const reason = request.rejectionReason?.trim();

  return (
    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center shadow-sm">
      <div className="mx-auto max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-3xl" aria-hidden>
          {variant === 'cancelled' ? '🚫' : '✋'}
        </div>
        <h2 className="mt-6 text-xl font-bold text-gray-900">
          {variant === 'cancelled'
            ? 'Votre demande a été annulée'
            : 'Votre demande n’a pas pu être poursuivie'}
        </h2>
        {reason && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Motif : </span>
            {reason}
          </p>
        )}
        <p className="mt-4 text-sm text-gray-600">
          Code dossier : <span className="font-mono font-medium">{request.uniqueCode}</span>
        </p>
        <Link
          href="/dashboard/ecosystem/new"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Créer une nouvelle demande
        </Link>
      </div>
    </section>
  );
}
