'use client';

import { useEffect, useState } from 'react';

type MarketplaceSearchBarProps = {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
};

export function MarketplaceSearchBar({
  value,
  onSearch,
  placeholder = 'Search products…',
}: MarketplaceSearchBarProps) {
  const [localQ, setLocalQ] = useState(value);

  useEffect(() => {
    setLocalQ(value);
  }, [value]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localQ.trim());
  };

  return (
    <form onSubmit={submit} className="w-full">
      <label htmlFor="marketplace-search" className="sr-only">
        Search
      </label>
      <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm transition focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-800 dark:focus-within:border-orange-500/50 dark:focus-within:ring-orange-500/20">
        <svg
          className="h-5 w-5 shrink-0 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          id="marketplace-search"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
        {localQ && (
          <button
            type="button"
            onClick={() => {
              setLocalQ('');
              onSearch('');
            }}
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-700 dark:hover:text-gray-300"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}
