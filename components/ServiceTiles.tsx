import Link from 'next/link';

type ServiceTile = {
  title: string;
  description: string;
  href: string;
  className: string;
  comingSoonBadge?: boolean;
  disabled?: boolean;
};

const tiles: ServiceTile[] = [
  {
    title: 'Marketplace',
    description: 'Découvrir créateurs et produits.',
    href: '/marketplace',
    className: 'from-indigo-600 to-violet-800 hover:from-indigo-500 hover:to-violet-700',
  },
  {
    title: 'Discussions',
    description: 'Messagerie et appels avec votre réseau.',
    href: '/dashboard/discussions',
    className: 'from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700',
  },
  {
    title: 'Crédits',
    description: 'Gérez votre solde.',
    href: '/dashboard/credits',
    className: 'from-emerald-600 to-emerald-800',
  },
];

export function ServiceTiles() {
  return (
    <section aria-labelledby="services-heading" className="grid gap-4 sm:grid-cols-2">
      <h2 id="services-heading" className="sr-only">
        Services
      </h2>
      {tiles.map((tile) => {
        const disabledClasses = tile.disabled
          ? 'opacity-50 cursor-not-allowed pointer-events-none'
          : 'transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-900';

        const inner = (
          <>
            {tile.comingSoonBadge && (
              <span className="absolute right-2 top-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                Bientôt
              </span>
            )}
            <h3 className="text-lg font-semibold text-white">{tile.title}</h3>
            <p className="mt-2 text-sm text-white/90">{tile.description}</p>
            {!tile.disabled && (
              <span className="mt-4 inline-flex items-center text-sm font-medium text-white/95">
                Ouvrir
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
            {tile.disabled && !tile.comingSoonBadge && (
              <span className="mt-4 inline-block text-xs font-medium uppercase tracking-wide text-white/70">
                À venir
              </span>
            )}
          </>
        );

        if (tile.disabled || !tile.href) {
          return (
            <div
              key={tile.title}
              className={`relative rounded-2xl bg-gradient-to-br p-6 shadow-md ${disabledClasses} ${tile.className}`}
            >
              {inner}
            </div>
          );
        }

        return (
          <Link
            key={tile.title}
            href={tile.href}
            className={`relative rounded-2xl bg-gradient-to-br p-6 shadow-md ${disabledClasses} ${tile.className}`}
          >
            {inner}
          </Link>
        );
      })}
    </section>
  );
}
