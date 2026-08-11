'use client';

type ProductPageErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductPageError({ error, reset }: ProductPageErrorProps) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        Unable to load this product
      </h1>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        {error.message || 'Something went wrong while rendering the product page.'}
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
