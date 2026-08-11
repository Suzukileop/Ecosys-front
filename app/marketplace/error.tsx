'use client';

type MarketplaceErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function MarketplaceError({ error, reset }: MarketplaceErrorProps) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Unable to load the marketplace
      </h1>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        {error.message || 'Something went wrong while rendering this page.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
      >
        Try again
      </button>
    </main>
  );
}
