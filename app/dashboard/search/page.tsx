import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { GlobalSearchResultsView } from '@/components/search/GlobalSearchResultsView';

export default function DashboardSearchPage() {
  return (
    <DashboardHomeShell fullWidth>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
        <GlobalSearchResultsView />
      </div>
    </DashboardHomeShell>
  );
}
