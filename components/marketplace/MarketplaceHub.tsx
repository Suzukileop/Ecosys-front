'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ContentPostDialogShell } from '@/components/creator/ContentPostDialogShell';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { RailGlyph } from '@/components/home/NewsDiscoverRail';
import { BOX_TITLE, ProviderRefineBox, SpecialtyRow } from '@/components/marketplace/ProviderDiscoverRail';
import { FilterDropdown } from '@/components/marketplace/ServiceProviderFilterPills';
import { ProductsCatalog } from '@/components/marketplace/ProductsCatalog';
import { MarketplaceHubSkeleton } from '@/components/marketplace/MarketplaceSkeleton';
import {
  BOOKMARK_GLYPH,
  CloseIcon,
  GRID_GLYPH,
  parseView,
  RailToggleGlyph,
  railRoundButtonClass,
  SearchIcon,
  SlidersIcon,
  SortMenu,
  useRailFold,
  useStoredChoice,
  VIEW_GRID_CLASS,
  ViewSwitch,
} from '@/components/marketplace/CatalogRailKit';
import {
  BudgetFilter,
  customPriceLabel,
  detectPricePreset,
  filterChipClass,
  PRICE_PRESETS,
  PRODUCT_FORMAT_OPTIONS,
  PRODUCT_GENRES,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_TYPES,
  TrendGlyph,
  usePopularProductSearches,
} from '@/components/marketplace/MarketplaceProductFilters';
import {
  MARKETPLACE_DEFAULT_FORMAT,
  useMarketplaceCatalogParams,
  type MarketplaceProductFormat,
} from '@/components/marketplace/useMarketplaceCatalogParams';
import { BackToTopButton, useBackToTop } from '@/components/ui/ScrollUpStickyBar';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import { PRODUCT_TYPE_LABELS } from '@/lib/marketplace-api';
import { ListSectionHeading } from '@/components/ui/ListSectionHeading';
import { useT } from '@/lib/i18n/I18nProvider';

const SEARCH_DEBOUNCE_MS = 350;

function MarketplaceHubContent() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasRole, user, isLoading: authLoading } = useAuth();
  const { q, genre, type, format, minPrice, maxPrice, sort, pushParams, resetFilters } = useMarketplaceCatalogParams();

  const favorites = searchParams.get('tab') === 'favorites';
  const canFavorite = Boolean(user && hasRole('ROLE_CREATOR'));
  const needsAuth = favorites && !user;
  const digital = format === 'virtual';

  const [localQ, setLocalQ] = useState(q);
  const [total, setTotal] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const backToTop = useBackToTop(headerRef);
  const trending = usePopularProductSearches(format);
  const [view, setView] = useStoredChoice('products.view', parseView, 'compact');
  const [rail, setRail] = useRailFold('products.rail');
  const folded = rail === 'folded';
  /* Unfolds the rail, then (search) puts the caret in its field once the rail has rendered. */
  const focusSearchRef = useRef(false);
  const openRail = (focusSearch = false) => {
    focusSearchRef.current = focusSearch;
    setRail('open');
  };
  useEffect(() => {
    if (rail !== 'open' || !focusSearchRef.current) return;
    focusSearchRef.current = false;
    document.getElementById('mq-side')?.focus();
  }, [rail]);
  const pushRef = useRef(pushParams);
  useEffect(() => {
    pushRef.current = pushParams;
  });

  /* `?tab=purchases` was retired: drop it quietly. */
  useEffect(() => {
    if (searchParams.get('tab') !== 'purchases') return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tab');
    const qs = params.toString();
    router.replace(qs ? `/marketplace?${qs}` : '/marketplace');
  }, [router, searchParams]);

  /* The URL's query wins whenever it changes (Back, a trending pick, Clear). */
  const [syncedQ, setSyncedQ] = useState(q);
  if (q !== syncedQ) {
    setSyncedQ(q);
    setLocalQ(q);
  }

  /* Typing searches on its own after a short pause; Enter searches at once. */
  useEffect(() => {
    const trimmed = localQ.trim();
    if (trimmed === q.trim()) return;
    const timer = window.setTimeout(() => pushRef.current({ q: trimmed || undefined, page: '0' }), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [localQ, q]);

  const onTotalChange = useCallback((next: number | null) => setTotal(next), []);

  const setFavorites = (next: boolean) => {
    if (next === favorites) return;
    pushParams({ tab: next ? 'favorites' : undefined, page: '0' });
  };

  const setFormat = (next: MarketplaceProductFormat) => {
    if (next === format) return;
    pushParams({
      format: next === MARKETPLACE_DEFAULT_FORMAT ? undefined : next,
      ...(next === 'physical' ? { type: undefined, genre: undefined } : {}),
      page: '0',
    });
  };

  const applyPrice = (min: string, max: string) =>
    pushParams({ minPrice: min || undefined, maxPrice: max || undefined, page: '0' });

  const searchFor = (term: string) => {
    setLocalQ(term);
    pushParams({ q: term || undefined, page: '0' });
  };

  const clearAll = () => {
    setLocalQ('');
    resetFilters();
  };

  /* Every active filter, for the "Filtered by" line and the Filters badge. The order (Sort) is not
     a filter, as on Providers. */
  const pricePreset = detectPricePreset(minPrice, maxPrice);
  const priceLabel =
    pricePreset === 'all'
      ? null
      : pricePreset === 'custom'
        ? customPriceLabel(minPrice, maxPrice)
        : PRICE_PRESETS.find((preset) => preset.id === pricePreset)?.label ?? null;
  const activeFilters = [
    digital && type ? PRODUCT_TYPE_LABELS[type] ?? type : '',
    digital && genre ? genre : '',
    priceLabel ?? '',
  ].filter(Boolean);
  const filtered = activeFilters.length > 0 || Boolean(q.trim());
  const filteredBy = [q.trim() ? `“${q.trim()}”` : '', ...activeFilters].filter(Boolean).join(' · ');
  const formatLabel = PRODUCT_FORMAT_OPTIONS.find((option) => option.id === format)?.label ?? t('Material');
  const noun = favorites ? 'favorite' : 'product';

  const typeOptions = [
    { value: '', label: t('All types') },
    ...PRODUCT_TYPES.map((item) => ({ value: item, label: PRODUCT_TYPE_LABELS[item] ?? item })),
  ];
  const genreOptions = [{ value: '', label: t('All genres') }, ...PRODUCT_GENRES.map((item) => ({ value: item, label: item }))];
  const priceOptions = [
    { value: '', label: t('Any price') },
    ...PRICE_PRESETS.filter((preset) => preset.id !== 'all' && preset.id !== 'custom').map((preset) => ({
      value: preset.id,
      label: preset.label,
    })),
    ...(pricePreset === 'custom' ? [{ value: 'custom', label: customPriceLabel(minPrice, maxPrice) }] : []),
  ];

  /* The search: a pill on the card tone, an ink ring when focused — News / Providers' rail pill. */
  const searchField = (id: string) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        searchFor(localQ.trim());
      }}
      className="min-w-0 flex-1"
    >
      <div className="relative h-11 w-full min-w-0 rounded-full bg-[color:var(--gn-surface)] transition-[background-color,box-shadow] focus-within:bg-[color:var(--gn-inset)] focus-within:shadow-[inset_0_0_0_2px_var(--gn-ink)]">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[color:var(--gn-ink2)]" />
        <label htmlFor={id} className="sr-only">
          {t('Search products')}
        </label>
        <input
          id={id}
          type="search"
          value={localQ}
          onChange={(event) => setLocalQ(event.target.value)}
          enterKeyHint="search"
          autoComplete="off"
          placeholder={t('Search title, shop or author')}
          className="h-full w-full rounded-full border-0 bg-transparent p-0 pl-11 pr-12 text-[16px] text-[color:var(--gn-ink)] placeholder:text-[color:var(--gn-ink2)] focus:outline-none focus:ring-0 sm:text-[15px] [&::-webkit-search-cancel-button]:hidden"
        />
        {localQ.trim() || q ? (
          <button
            type="button"
            onClick={() => searchFor('')}
            title={t('Clear search')}
            aria-label={t('Clear search')}
            className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)]"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </form>
  );

  const clearAllButton = (
    <button
      type="button"
      onClick={clearAll}
      className="font-semibold text-[color:var(--gn-ink)] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
    >
      {t('Clear all filters')}
    </button>
  );

  /* Heading line above the grid — set like News's "Latest" and Providers' heading: the list's name in
     17px bold with its count and format, the sort at the right; while filters narrow the list, a
     plain "Filtered by: … · Clear" line follows. */
  const sectionLine = ({ total: shown }: { total: number | null }) => (
    <header ref={headerRef} className="flex scroll-mt-24 flex-col gap-1 px-5 pt-3 sm:px-1 lg:pt-0">
      <div className="flex min-h-8 items-center justify-between gap-4">
        <ListSectionHeading
          id="products-heading"
          live
          title={favorites ? t('Favorites') : t('Products')}
          count={shown}
          details={[formatLabel]}
        />
        <div className="flex shrink-0 items-center gap-3">
          <SortMenu value={sort} options={PRODUCT_SORT_OPTIONS} menuLabel={t('Sort products')} onChange={(next) => pushParams({ sort: next === 'popular' ? undefined : next, page: '0' })} />
          <span aria-hidden className="h-4 w-px bg-[color:var(--gn-line)]" />
          <ViewSwitch value={view} rail={rail} onChange={setView} />
        </div>
      </div>
      {filtered ? (
        <p className="flex min-w-0 items-center gap-1.5 text-[14px] leading-5 text-[color:var(--gn-ink2)]">
          <span className="shrink-0">{t('Filtered by:')}</span>
          <span className="truncate font-semibold text-[color:var(--gn-ink)]">{filteredBy}</span>
          <span aria-hidden className="shrink-0 text-[color:var(--gn-ink3)]">
            ·
          </span>
          <button
            type="button"
            onClick={clearAll}
            className="shrink-0 font-medium text-[color:var(--gn-ink)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
          >
            {t('Clear')}
          </button>
        </p>
      ) : null}
    </header>
  );

  /* The favorites switch: News's "Build your portfolio" row in the rail — an outlined circle glyph,
     a title over one line, a chevron. In the favorites view it leads back to the catalogue. */
  const favoritesRow = (
    <button
      type="button"
      onClick={() => setFavorites(!favorites)}
      aria-pressed={favorites}
      className="gn-rail-box group flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_var(--gn-line)]">
        <RailGlyph>{favorites ? GRID_GLYPH : BOOKMARK_GLYPH}</RailGlyph>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">
          {favorites ? t('All products') : t('Your favorites')}
        </span>
        <span className="mt-0.5 block truncate text-[14px] leading-5 text-[color:var(--gn-ink2)]">
          {favorites ? t('Back to the catalogue') : t('The products you saved')}
        </span>
      </span>
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[color:var(--gn-ink2)] transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  );

  const catalog = needsAuth ? (
    <div className="flex flex-col items-center bg-[color:var(--gn-surface)] px-6 py-16 text-center" style={STUDIO_FLOAT_IN_STYLE}>
      <p className="text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">{t('Sign in to view your favorites')}</p>
      <p className="mt-1.5 text-[15px] leading-5 text-[color:var(--gn-ink2)]">{t('Your saved products are kept with your account.')}</p>
      <a
        href={`/login?redirect=${encodeURIComponent('/marketplace?tab=favorites')}`}
        className="mt-6 inline-flex h-10 items-center rounded-full bg-[color:var(--gn-primary)] px-6 text-[15px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)]"
      >
        {t('Sign in')}
      </a>
    </div>
  ) : (
    <div className="flex flex-col gap-3 sm:gap-4">
      <ProductsCatalog
        embedded
        favoritesOnly={favorites}
        layout={view === 'list' ? 'list' : 'grid'}
        gridClassName={view === 'list' ? undefined : VIEW_GRID_CLASS[rail][view]}
        header={sectionLine}
        onTotalChange={onTotalChange}
      />
    </div>
  );

  if (authLoading) return <MarketplaceHubSkeleton />;

  return (
    /*
     * Layout — the News / Providers frame (32 / 48 / 64px gutters, 1240px cap, on the navbar's edges):
     * below lg the grid alone, a search + Filters row and the format chips above it; from lg the grid
     * fills the frame from the wordmark's edge, then a sticky 340px rail (400px from xl) whose right
     * edge sits under the avatar. Cards are filled blocks; the rail's tools are outlined boxes.
     */
    <div
      className="news-theme news-feed news-mono w-full pb-24 pt-2 sm:px-8 sm:pt-4 md:px-12 lg:px-16 lg:pt-3"
      style={STUDIO_FLOAT_IN_STYLE}
    >
      <h1 className="sr-only">{favorites ? t('Favorite products') : t('Products')}</h1>

      {/* Phones / tablets: every filter in one bottom sheet (portalled to <body>, so it re-opens the
          News scope). Choices apply at once; the footer says what that gives and closes the sheet. */}
      <ContentPostDialogShell open={sheetOpen} title={t('Filters')} onClose={() => setSheetOpen(false)}>
        <div className="news-theme news-feed news-mono">
          <div className="space-y-7 px-5 pb-4 pt-1">
            <section>
              <p className="gn-kicker pb-3">{t('Format')}</p>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_FORMAT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={format === option.id}
                    onClick={() => setFormat(option.id)}
                    className={filterChipClass(format === option.id)}
                  >
                    {t(option.label)}
                  </button>
                ))}
              </div>
            </section>
            {digital ? (
              <>
                <section>
                  <p className="gn-kicker pb-3">{t('Product type')}</p>
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map((option) => (
                      <button
                        key={option.value || 'all'}
                        type="button"
                        aria-pressed={type === option.value}
                        onClick={() => pushParams({ type: option.value || undefined, page: '0' })}
                        className={filterChipClass(type === option.value)}
                      >
                        {option.value ? option.label : t('All')}
                      </button>
                    ))}
                  </div>
                </section>
                <section>
                  <p className="gn-kicker pb-3">{t('Genre')}</p>
                  <div className="flex flex-wrap gap-2">
                    {genreOptions.map((option) => (
                      <button
                        key={option.value || 'all'}
                        type="button"
                        aria-pressed={genre === option.value}
                        onClick={() => pushParams({ genre: option.value || undefined, page: '0' })}
                        className={filterChipClass(genre === option.value)}
                      >
                        {option.value ? option.label : t('All')}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            ) : null}
            <section>
              <p className="gn-kicker pb-3">{t('Budget')}</p>
              <BudgetFilter minPrice={minPrice} maxPrice={maxPrice} onApply={applyPrice} />
            </section>
            {trending.length > 0 ? (
              <section>
                <p className="gn-kicker pb-3">{t('Trending searches')}</p>
                <div className="flex flex-wrap gap-2">
                  {trending.map((term) => {
                    const active = q.trim().toLowerCase() === term.toLowerCase();
                    return (
                      <button
                        key={term}
                        type="button"
                        aria-pressed={active}
                        onClick={() => searchFor(active ? '' : term)}
                        className={filterChipClass(active)}
                      >
                        {term}
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>
          <div className="sticky bottom-0 flex items-center justify-between gap-4 bg-white px-5 pb-5 pt-3 dark:bg-black">
            {filtered ? <span className="text-[14px]">{clearAllButton}</span> : <span />}
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--gn-primary)] px-6 text-[15px] font-semibold text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
            >
              {total != null ? `Show ${total} ${total === 1 ? noun : `${noun}s`}` : t('Show products')}
            </button>
          </div>
        </div>
      </ContentPostDialogShell>

      {/* Folding the rail (lg+) leaves a 44px strip of round buttons — News's quick bar — and gives
          the grid the frame's full width: one more card per row. The columns switch at once (the strip
          is pinned where its column sits when it mounts); useRailFold animates the change as a view
          transition. */}
      <div
        className={`mx-auto grid w-full max-w-[1240px] items-start gap-8 ${
          folded
            ? 'lg:grid-cols-[minmax(0,1fr)_44px] lg:gap-6'
            : 'lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12'
        }`}
      >
        <main className="flex min-w-0 flex-col gap-3" aria-labelledby="products-heading">
          {/* Below lg (no rail): the search, Saved (creators) and one Filters button, then the
              format as News interest chips. */}
          <div className="flex items-center gap-2 px-5 pt-1 sm:px-0 lg:hidden">
            {searchField('mq')}
            {canFavorite ? (
              <button
                type="button"
                onClick={() => setFavorites(!favorites)}
                aria-pressed={favorites}
                aria-label={favorites ? t('Back to all products') : t('Your favorites')}
                title={favorites ? t('Back to all products') : t('Your favorites')}
                className={`${railRoundButtonClass} ${
                  favorites
                    ? 'bg-[color:var(--gn-ink)] text-[color:var(--gn-surface)]'
                    : 'bg-[color:var(--gn-surface)] hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]'
                }`}
              >
                <RailGlyph active={favorites}>{BOOKMARK_GLYPH}</RailGlyph>
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label={activeFilters.length > 0 ? t('Filters ({activeFiltersLength} active)', { activeFiltersLength: activeFilters.length }) : t('Filters')}
              className={`${railRoundButtonClass} bg-[color:var(--gn-surface)] hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]`}
            >
              <SlidersIcon className="h-[18px] w-[18px]" />
              {activeFilters.length > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[color:var(--gn-ink)] px-1 text-[10px] font-bold tabular-nums text-[color:var(--gn-surface)] ring-2 ring-[#FFFFFF] dark:ring-[#000000]">
                  {activeFilters.length}
                </span>
              ) : null}
            </button>
          </div>
          <nav aria-label={t('Product format')} className="flex gap-2 px-5 sm:px-0 lg:hidden">
            {PRODUCT_FORMAT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={format === option.id}
                title={t(option.hint)}
                onClick={() => setFormat(option.id)}
                className={filterChipClass(format === option.id)}
              >
                {t(option.label)}
              </button>
            ))}
          </nav>

          {needsAuth ? sectionLine({ total: null }) : null}
          {catalog}
        </main>

        {/* The rail (from lg), sticky under the navbar like News's: the search pill on the page, then
            outlined boxes — the favorites row, Format, Refine, Trending. */}
        <div className="hidden self-start lg:block" data-rail-fold="rail">
          {folded ? (
            <ProfileSectionStickyAside key="folded" className="w-11" surfaceClassName="flex w-11 flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => openRail()}
                aria-label={t('Show filters')}
                title={t('Show filters')}
                className={`${railRoundButtonClass} hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]`}
              >
                <RailGlyph>
                  <RailToggleGlyph folded />
                </RailGlyph>
              </button>
              <span aria-hidden className="my-1 h-px w-6 bg-[#d6dee3] dark:bg-[#2f3336]" />
              <button
                type="button"
                onClick={() => openRail(true)}
                aria-label={t('Search products')}
                title={t('Search products')}
                className={`${railRoundButtonClass} ${q ? 'bg-[color:var(--gn-surface)]' : ''} hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]`}
              >
                <SearchIcon className="h-5 w-5" />
              </button>
              {canFavorite ? (
                <button
                  type="button"
                  onClick={() => setFavorites(!favorites)}
                  aria-pressed={favorites}
                  aria-label={favorites ? t('Back to all products') : t('Your favorites')}
                  title={favorites ? t('Back to all products') : t('Your favorites')}
                  className={`${railRoundButtonClass} ${
                    favorites ? 'bg-[color:var(--gn-hover-strong,var(--gn-hover))]' : 'hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]'
                  }`}
                >
                  <RailGlyph active={favorites}>{BOOKMARK_GLYPH}</RailGlyph>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => openRail()}
                aria-label={activeFilters.length > 0 ? t('Filters ({activeFiltersLength} active)', { activeFiltersLength: activeFilters.length }) : t('Filters')}
                title={t('Filters')}
                className={`${railRoundButtonClass} hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]`}
              >
                <SlidersIcon className="h-[18px] w-[18px]" />
                {activeFilters.length > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[color:var(--gn-ink)] px-1 text-[10px] font-bold tabular-nums text-[color:var(--gn-surface)] ring-2 ring-[#FFFFFF] dark:ring-[#000000]">
                    {activeFilters.length}
                  </span>
                ) : null}
              </button>
            </ProfileSectionStickyAside>
          ) : (
          <ProfileSectionStickyAside key="open" scrollable className="w-full" surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-6 pb-6">
            <div className="flex items-center gap-2">
              {searchField('mq-side')}
              <button
                type="button"
                onClick={() => setRail('folded')}
                aria-label={t('Hide filters')}
                title={t('Hide filters')}
                className={`${railRoundButtonClass} hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))]`}
              >
                <RailGlyph>
                  <RailToggleGlyph folded={false} />
                </RailGlyph>
              </button>
            </div>
            {canFavorite ? favoritesRow : null}

            <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="products-format-title">
              <h2 id="products-format-title" className={BOX_TITLE}>
                {t('Format')}
              </h2>
              <nav aria-label={t('Product format')} className="flex w-full flex-col">
                {PRODUCT_FORMAT_OPTIONS.map((option) => (
                  <SpecialtyRow
                    key={option.id}
                    label={t(option.label)}
                    icon={option.icon}
                    active={format === option.id}
                    onClick={() => setFormat(option.id)}
                  />
                ))}
              </nav>
            </section>

            <ProviderRefineBox
              footer={filtered ? <div className="px-6 pb-2 pt-3 text-[14px]">{clearAllButton}</div> : null}
            >
              {digital ? (
                <>
                  <FilterDropdown
                    id="products-type"
                    label={t('Type')}
                    variant="rail"
                    value={type}
                    options={typeOptions}
                    onChange={(next) => pushParams({ type: next || undefined, page: '0' })}
                  />
                  <FilterDropdown
                    id="products-genre"
                    label={t('Genre')}
                    variant="rail"
                    value={genre}
                    options={genreOptions}
                    onChange={(next) => pushParams({ genre: next || undefined, page: '0' })}
                  />
                </>
              ) : null}
              <FilterDropdown
                id="products-price"
                label={t('Price')}
                variant="rail"
                value={pricePreset === 'all' ? '' : pricePreset}
                options={priceOptions}
                onChange={(next) => {
                  if (next === 'custom') return;
                  const preset = PRICE_PRESETS.find((item) => item.id === next);
                  applyPrice(preset?.min ?? '', preset?.max ?? '');
                }}
              />
            </ProviderRefineBox>

            {trending.length > 0 ? (
              <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="products-trending-title">
                <h2 id="products-trending-title" className={BOX_TITLE}>
                  {t('Trending')}
                </h2>
                <nav aria-label={t('Trending searches')} className="flex w-full flex-col">
                  {trending.slice(0, 4).map((term) => {
                    const active = q.trim().toLowerCase() === term.toLowerCase();
                    return (
                      <SpecialtyRow
                        key={term}
                        label={term}
                        icon={<TrendGlyph />}
                        active={active}
                        onClick={() => searchFor(active ? '' : term)}
                      />
                    );
                  })}
                </nav>
              </section>
            ) : null}
          </ProfileSectionStickyAside>
          )}
        </div>
      </div>

      <BackToTopButton visible={backToTop.visible} onClick={backToTop.backToTop} />
    </div>
  );
}

export function MarketplaceHub() {
  return (
    <Suspense fallback={<MarketplaceHubSkeleton />}>
      <MarketplaceHubContent />
    </Suspense>
  );
}
