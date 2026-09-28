'use client';

import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const GUIDE_ACTIONS = [
  'Showcase clear offers with pricing and delivery times',
  'Link each service to one of your specialties',
  'Use a strong title and a short, client-focused description',
  'Add a cover image so your offer stands out in search',
  'Keep status Active so clients can find and contact you',
];

function firstNameFrom(fullName: string | undefined) {
  const token = fullName?.trim().split(/\s+/)[0];
  return token || 'there';
}

function CheckBullet() {
  return (
    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/[0.08] text-[#FF5722] dark:border-white/[0.1]">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

type CreatorServicesEmptyGuideProps = {
  onCreate: () => void;
  createDisabled?: boolean;
};

export function CreatorServicesEmptyGuide({
  onCreate,
  createDisabled = false,
}: CreatorServicesEmptyGuideProps) {
  const { user } = useAuth();
  const firstName = firstNameFrom(user?.fullName);

  return (
    <section
      className="flex w-full min-h-0 flex-1 flex-col justify-center py-4"
      aria-label="Getting started with your services"
    >
      <div className="grid w-full items-center gap-10 rounded-lg border border-black/[0.06] bg-white p-7 dark:border-white/[0.08] dark:bg-[#111111] sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-14">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-white sm:text-3xl">
            Ready to publish your first service?
          </h2>
          <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
            Welcome {firstName} — a few tips to make your offers stand out.
          </p>

          <ul className="mt-8 space-y-4">
            {GUIDE_ACTIONS.map((action) => (
              <li key={action} className="flex items-start gap-3">
                <CheckBullet />
                <p className="pt-0.5 text-[15px] leading-snug text-neutral-700 dark:text-neutral-300">
                  {action}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <button
              type="button"
              onClick={onCreate}
              disabled={createDisabled}
              className="inline-flex items-center justify-center rounded-lg bg-[#111111] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-[#111111]"
            >
              Create your first service
            </button>
          </div>
        </div>

        <div className="relative flex min-h-[12rem] min-w-0 items-center justify-center">
          <Image
            src="/SVG/undraw_web-devices_i15y.svg"
            alt=""
            width={860}
            height={552}
            unoptimized
            className="h-auto max-h-full w-full max-w-md object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
