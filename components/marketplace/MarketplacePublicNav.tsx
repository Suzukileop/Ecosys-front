import Link from 'next/link';

export function MarketplacePublicNav({ transparent = false }: { transparent?: boolean }) {
  return (
    <header
      className={`border-b ${
        transparent
          ? 'border-gray-200/70 bg-transparent dark:border-neutral-800/70'
          : 'border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
              NP
            </div>
            <span className="hidden font-semibold text-gray-900 dark:text-white sm:inline">NoProbleme</span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Marketplace">
            <Link
              href="/marketplace/creators"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-neutral-900"
            >
              Content creators
            </Link>
            <Link
              href="/marketplace"
              className="rounded-lg px-3 py-2 text-sm font-medium text-orange-600"
            >
              Marketplace
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login?redirect=/marketplace"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-neutral-900"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
