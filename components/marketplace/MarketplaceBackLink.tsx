'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { readMarketplaceReturnPoint, requestMarketplaceRestore } from '@/lib/marketplace-return';

const FALLBACK_HREF = '/marketplace';

export function MarketplaceBackLink({ className = '' }: { className?: string }) {
  const router = useRouter();
  const [href, setHref] = useState(FALLBACK_HREF);

  useEffect(() => {
    const point = readMarketplaceReturnPoint();
    if (point?.url) setHref(point.url);
  }, []);

  return (
    <Link
      href={href}
      scroll={false}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        requestMarketplaceRestore();
        router.push(href, { scroll: false });
      }}
      className={className}
    >
      <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-0.5">
        ←
      </span>
      Back to marketplace
    </Link>
  );
}
