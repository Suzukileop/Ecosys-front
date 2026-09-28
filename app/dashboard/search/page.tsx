import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { GlobalSearchResultsView } from '@/components/search/GlobalSearchResultsView';

export default function DashboardSearchPage() {
  return (
    <DashboardHomeShell fullWidth>
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-0">
        <GlobalSearchResultsView />
      </div>
    </DashboardHomeShell>
  );
}
