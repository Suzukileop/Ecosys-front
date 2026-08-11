'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import AgentQueuePage from './AgentQueuePage';

export default function AgentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <AgentQueuePage />
    </Suspense>
  );
}
