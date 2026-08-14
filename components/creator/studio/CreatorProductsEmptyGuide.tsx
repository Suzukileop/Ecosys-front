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
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-orange-500 sm:mt-1 sm:h-5 sm:w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

type CreatorProductsEmptyGuideProps = {
  onCreate: () => void;
};

export function CreatorProductsEmptyGuide({ onCreate }: CreatorProductsEmptyGuideProps) {
  const { user } = useAuth();
  const firstName = firstNameFrom(user?.fullName);

  return (
    <section
      className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center px-4"
      aria-label="Getting started with your shop"
    >
      <h1 className="mb-6 shrink-0 text-center text-xl font-bold tracking-tight text-neutral-900 sm:mb-8 sm:text-2xl dark:text-white">
        Ready to make your services shine?
      </h1>

      <div className="flex min-h-0 h-[68%] w-full max-w-5xl items-center gap-6 lg:gap-10">
        <div className="flex h-auto max-h-full min-w-0 w-full max-w-lg flex-col justify-center rounded-2xl border border-neutral-200/80 bg-white px-7 py-8 sm:max-w-xl sm:px-9 sm:py-9 dark:border-neutral-800 dark:bg-[#0F0F0F]">
          <h2 className="mb-10 text-lg font-bold tracking-tight text-neutral-900 sm:mb-12 sm:text-xl dark:text-white">
            Welcome <span className="text-orange-500">{firstName}</span> to your shop space
          </h2>

          <ul className="space-y-4 sm:space-y-5">
            {GUIDE_ACTIONS.map((action) => (
              <li key={action} className="flex items-start gap-3">
                <ChevronBullet />
                <p className="text-sm font-medium leading-snug text-neutral-800 sm:text-base dark:text-neutral-100">
                  {action}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-wrap items-center gap-3 sm:mt-14">
            <p className="text-sm font-medium text-neutral-700 sm:text-base dark:text-neutral-200">
              Let&apos;s create your first product
            </p>
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Get started
            </button>
          </div>
        </div>

        <div className="relative hidden h-full min-w-0 flex-1 items-center justify-center sm:flex">
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
