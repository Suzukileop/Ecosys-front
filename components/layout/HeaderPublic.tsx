import Link from 'next/link';

export function HeaderPublic() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            NP
          </div>
          <span className="font-semibold text-gray-900">NoProbleme</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 sm:gap-3" aria-label="Navigation principale">
          <Link
            href="/marketplace"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            Marketplace
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Inscription
          </Link>
        </nav>
      </div>
    </header>
  );
}
