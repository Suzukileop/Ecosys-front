import { Suspense } from 'react';
import { CreatorStudioPage } from '@/components/creator/studio/CreatorStudioPage';
import { CreatorStudioHubSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';

export default function CreatorStudioRoute() {
  return (
    <Suspense fallback={<CreatorStudioHubSkeleton tab="content" />}>
      <CreatorStudioPage />
    </Suspense>
  );
}
