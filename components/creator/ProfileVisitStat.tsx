'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

type ProfileVisitStatProps = {
  value: number;
  label: string;
  href?: string;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  layout?: 'stack' | 'inline';
};

function StatContent({
  value,
  label,
  valueClassName,
  labelClassName,
  layout,
}: Omit<ProfileVisitStatProps, 'href' | 'className'>) {
  if (layout === 'inline') {
    return (
      <span>
        {value.toLocaleString()} {label.toLowerCase()}
      </span>
    );
  }

  return (
    <>
      <p className={valueClassName}>{value.toLocaleString()}</p>
      <p className={labelClassName}>{label}</p>
    </>
  );
}

function InteractiveWrapper({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  if (!href) return <>{children}</>;

  return (
    <Link
      href={href}
      className={`group rounded-lg transition hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 ${className ?? ''}`}
    >
      {children}
    </Link>
  );
}

export function ProfileVisitStat({
  value,
  label,
  href,
  className,
  valueClassName = 'text-lg font-bold text-neutral-900 dark:text-white',
  labelClassName = 'text-[10px] font-semibold uppercase tracking-wider text-neutral-500 group-hover:text-orange-600 dark:group-hover:text-orange-400',
  layout = 'stack',
}: ProfileVisitStatProps) {
  const inner = (
    <StatContent
      value={value}
      label={label}
      valueClassName={
        href
          ? `${valueClassName} group-hover:text-orange-600 dark:group-hover:text-orange-400`
          : valueClassName
      }
      labelClassName={labelClassName}
      layout={layout}
    />
  );

  if (layout === 'inline') {
    if (!href) return inner;
    return (
      <Link href={href} className="transition hover:text-orange-600 dark:hover:text-orange-400">
        {inner}
      </Link>
    );
  }

  return (
    <InteractiveWrapper href={href} className={className}>
      <div className={href ? 'px-1 py-0.5' : undefined}>{inner}</div>
    </InteractiveWrapper>
  );
}

export function ProfileVisitStatGridItem({
  value,
  label,
  href,
}: {
  value: number;
  label: string;
  href?: string;
}) {
  const card = (
    <>
      <p className="text-base font-bold text-neutral-900 dark:text-white">{value.toLocaleString()}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
    </>
  );

  if (!href) {
    return (
      <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/80 px-2 py-2 dark:border-neutral-800 dark:bg-neutral-900/60">
        {card}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group rounded-lg border border-neutral-200/80 bg-neutral-50/80 px-2 py-2 transition hover:border-orange-300 hover:bg-orange-50/50 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/5"
    >
      <p className="text-base font-bold text-neutral-900 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
        {value.toLocaleString()}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 group-hover:text-orange-600 dark:group-hover:text-orange-400">
        {label}
      </p>
    </Link>
  );
}
