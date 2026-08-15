'use client';

import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const GUIDE_ACTIONS = [
  'Manage your virtual shop',
  'Create listings for your services or creations',
  'Organize your work into themed catalogues',
  'Customize your shop name so people can find you easily',
  'Launch your own custom storefront',
];

function firstNameFrom(fullName: string | undefined) {
  const token = fullName?.trim().split(/\s+/)[0];
  return token || 'there';
}

function ChevronBullet() {
  return (
    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-orange-500/15 dark:text-orange-300 sm:mt-0 sm:h-8 sm:w-8">
      <svg
        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </span>
  );
}

type CreatorProductsEmptyGuideProps = {
  onCreate: () => void;
  createDisabled?: boolean;
};

export function CreatorProductsEmptyGuide({
  onCreate,
  createDisabled = false,
}: CreatorProductsEmptyGuideProps) {
  const { user } = useAuth();
  const firstName = firstNameFrom(user?.fullName);

  return (
    <section
      className="flex w-full min-h-0 flex-1 flex-col items-center justify-center px-2 py-6"
      aria-label="Getting started with your shop"
    >
      <h1 className="mb-8 shrink-0 text-center text-xl font-bold tracking-tight text-neutral-900 sm:mb-10 sm:text-2xl dark:text-white">
        Ready to make your products shine?
      </h1>

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-6 sm:flex-row sm:items-stretch lg:gap-10">
        <div className="flex h-auto min-w-0 w-full max-w-lg flex-col justify-center rounded-2xl bg-white px-7 py-8 sm:max-w-xl sm:px-9 sm:py-9 dark:bg-[#0F0F0F]">
          <h2 className="mb-8 text-lg font-bold tracking-tight text-neutral-900 sm:mb-10 sm:text-xl dark:text-white">
            Welcome <span className="text-orange-500">{firstName}</span> to your shop space
          </h2>

          <ul className="space-y-4 sm:space-y-5">
            {GUIDE_ACTIONS.map((action) => (
              <li key={action} className="flex items-start gap-3">
                <ChevronBullet />
                <p className="pt-0.5 text-sm font-medium leading-snug text-neutral-800 sm:text-base dark:text-neutral-100">
                  {action}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-3 sm:mt-12">
            <p className="text-sm font-medium text-neutral-700 sm:text-base dark:text-neutral-200">
              Let&apos;s create your first product
            </p>
            <button
              type="button"
              onClick={onCreate}
              disabled={createDisabled}
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Get started
            </button>
          </div>
        </div>

        <div className="relative flex min-h-[12rem] min-w-0 w-full flex-1 items-center justify-center sm:min-h-0">
          <Image
            src="/SVG/undraw_shopping-app_b80f.svg"
            alt=""
            width={888}
            height={741}
            unoptimized
            className="h-auto max-h-full w-full max-w-lg object-contain dark:hidden"
            priority
          />
          <Image
            src="/SVG/undraw_shopping-app_b80f-dark.svg"
            alt=""
            width={888}
            height={741}
            unoptimized
            className="hidden h-auto max-h-full w-full max-w-lg object-contain dark:block"
            priority
          />
        </div>
      </div>
    </section>
  );
}
