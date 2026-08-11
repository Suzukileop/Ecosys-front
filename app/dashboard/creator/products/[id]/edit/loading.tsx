import { CreatorStudioProductEditSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';

export default function CreatorProductEditLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <CreatorStudioProductEditSkeleton />
    </div>
  );
}
