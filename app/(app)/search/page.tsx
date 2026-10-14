import './x-search.css';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { GlobalSearchResultsView } from '@/components/search/GlobalSearchResultsView';

export default function DashboardSearchPage() {
  return (
    <DashboardHomeShell fullWidth>
      {/* The view lays itself on the navbar's frame (gutters, 1240px cap, sticky rail) like News and
          Providers, inside the News token scope. */}
      <GlobalSearchResultsView />
    </DashboardHomeShell>
  );
}
