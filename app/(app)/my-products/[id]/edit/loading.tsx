import { CreatorStudioProductEditSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';

export default function CreatorProductEditLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <div className="space-y-3">
        <div className="h-4 w-28 animate-pulse bg-[#EFF3F4] dark:bg-[#202327]" />
        <div className="h-8 w-48 animate-pulse bg-[#EFF3F4] dark:bg-[#202327]" />
      </div>
      <CreatorStudioProductEditSkeleton />
    </div>
  );
}
