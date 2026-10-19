/**
 * Messaging's shared class vocabulary in the News X palette (black & white). Hard-coded hexes with
 * `dark:` variants so it also works in portals / dialogs that live outside the `.msg-mineral` scope
 * (ContentPostDialogShell renders to <body>). The values follow the Providers page's portalled
 * dialogs (ProviderDiscoverRail's "All specialties"): the same search pill, the same row hover.
 * Dialogs sit on white / pure black, where X's dark secondary #71767B still clears AA (4.6:1).
 */

/** Popover menu card — X's rounded menu with its soft ambient shadow, no border. */
export const X_MENU_PANEL =
  'overflow-hidden rounded-xl bg-white py-1 shadow-[0_0_15px_rgba(101,119,134,0.2),0_0_3px_1px_rgba(101,119,134,0.15)] dark:bg-black dark:shadow-[0_0_15px_rgba(255,255,255,0.2),0_0_3px_1px_rgba(255,255,255,0.15)]';

/** Menu item: 15px bold ink, hover tint, ≥ 44px tall. */
export const X_MENU_ITEM =
  'flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] font-bold text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] focus-visible:bg-[rgba(15,20,25,0.06)] focus-visible:outline-hidden disabled:opacity-50 dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)] dark:focus-visible:bg-[rgba(231,233,234,0.1)]';

/** Destructive menu item (X red). */
export const X_MENU_ITEM_DANGER =
  'flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] font-bold text-[#F4212E] transition-colors hover:bg-[rgba(244,33,46,0.08)] focus-visible:bg-[rgba(244,33,46,0.08)] focus-visible:outline-hidden disabled:opacity-50';

/**
 * Search pill on a dialog ground — News's: #EFF3F4 / #202327 at rest, the ground with a 2px inset
 * ink ring while typing. 44px tall; includes its own left room for `X_SEARCH_ICON`. 16px text on
 * phones so iOS does not zoom the page on focus.
 */
export const X_SEARCH_PILL =
  'h-11 w-full rounded-full border-0 bg-[#EFF3F4] pl-11 pr-4 text-[16px] text-[#0F1419] outline-hidden ring-0 transition-[background-color,box-shadow] placeholder:text-[#536471] focus:bg-white focus:shadow-[inset_0_0_0_2px_#0F1419] focus:ring-0 dark:bg-[#202327] dark:text-[#E7E9EA] dark:placeholder:text-[#71767B] dark:focus:bg-black dark:focus:shadow-[inset_0_0_0_2px_#E7E9EA] sm:text-[15px] [&::-webkit-search-cancel-button]:appearance-none';

/** Magnifier glyph positioned inside `X_SEARCH_PILL`. */
export const X_SEARCH_ICON =
  'pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#536471] dark:text-[#71767B]';

/** A person / conversation row in a dialog list: full-bleed, the fill tone under the pointer, ≥ 56px. */
export const X_LIST_ROW =
  'flex min-h-14 w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-[#F7F9F9] active:bg-[#EFF3F4] focus-visible:bg-[#EFF3F4] focus-visible:outline-hidden disabled:opacity-60 dark:hover:bg-[#16181C] dark:active:bg-[#202327] dark:focus-visible:bg-[#202327]';

export const X_ROW_NAME = 'truncate text-[15px] font-bold leading-5 text-[#0F1419] dark:text-[#E7E9EA]';
export const X_ROW_META = 'truncate text-[13px] leading-[18px] text-[#536471] dark:text-[#71767B]';

/** Tiny tracked section label (`.gn-kicker`), with room for the 6px square marker (`X_KICKER_MARK`). */
export const X_KICKER =
  'flex items-center gap-2.5 px-5 pb-1 pt-3 text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[#536471] dark:text-[#71767B]';

/** News's section marker: a 6px ink square in front of a kicker. */
export const X_KICKER_MARK = 'h-1.5 w-1.5 shrink-0 bg-[#0F1419] dark:bg-[#E7E9EA]';

/** Empty / hint line inside a dialog. */
export const X_EMPTY = 'px-5 py-10 text-center text-[15px] leading-5 text-[#536471] dark:text-[#71767B]';

/** Small pill action on a row ("Send", "Invite") — X's compact primary. */
export const X_ROW_ACTION =
  'inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-[#0F1419] px-4 text-[14px] font-bold text-white dark:bg-[#EFF3F4] dark:text-[#0F1419]';
