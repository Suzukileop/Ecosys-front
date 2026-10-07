'use client';

/** Conteneur de page dashboard — l’auth est déjà gérée par `DashboardShell`. */
export function DashboardHomeShell({
  children,
  wide = false,
  fullWidth = false,
  fillViewport = false,
  newsTheme = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
  /** Pleine largeur utile (sans max-w centré) — listes / tableaux larges */
  fullWidth?: boolean;
  /** Remplit la zone utile du dashboard (pas de scroll page) */
  fillViewport?: boolean;
  /** Use the News palette (`.news-theme`: soft #1c1c1e cards, ink tokens, orange accent only). */
  newsTheme?: boolean;
}) {
  const widthClass = fullWidth
    ? 'w-full max-w-none'
    : wide
      ? 'mx-auto max-w-7xl'
      : 'mx-auto max-w-6xl';

  return (
    <main
      className={`relative z-10 ${newsTheme ? 'news-theme ' : ''}${widthClass} ${
        fillViewport ? 'flex min-h-0 flex-1 flex-col' : 'space-y-6'
      }`}
    >
      {children}
    </main>
  );
}
