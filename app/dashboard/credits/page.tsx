import Link from 'next/link';

export default function CreditsPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Crédits</h1>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        L&apos;achat de crédits en ligne sera bientôt disponible.
      </p>
      <Link
        href="/#pricing"
        className="mt-6 inline-flex rounded-full bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#EA580C]"
      >
        Voir les offres
      </Link>
    </div>
  );
}
