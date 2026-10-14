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
            className="text-[15px] font-medium text-[#0F1419] underline-offset-4 hover:underline dark:text-[#E7E9EA]"
          >
            <span className="text-[#536471] dark:text-[#71767B]">#</span>
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
