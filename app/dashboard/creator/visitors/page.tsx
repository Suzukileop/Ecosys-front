import { redirect } from 'next/navigation';

export default function CreatorVisitorsRedirect() {
  redirect('/dashboard/creator?tab=visitors');
}
