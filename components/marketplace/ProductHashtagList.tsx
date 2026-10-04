import Link from 'next/link';
import { buildGlobalSearchPageUrl } from '@/lib/global-search';

export function ProductHashtagList({ tags, className = '' }: { tags: string[]; className?: string }) {
  const visible = tags.map((tag) => tag.replace(/^#+/, '').trim()).filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-x-3 gap-y-1.5 ${className}`} aria-label="Hashtags">
      {visible.map((tag) => (
        <li key={tag.toLowerCase()}>
          <Link
            href={buildGlobalSearchPageUrl(tag, 'products')}
            className="text-[14px] font-medium text-[#111111] underline-offset-4 transition-colors hover:text-[#FF5722] hover:underline dark:text-neutral-200 dark:hover:text-[#FF5722]"
          >
            <span className="text-neutral-400 dark:text-neutral-500">#</span>
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
