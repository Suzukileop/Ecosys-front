import { redirect } from 'next/navigation';

export default function CreatorContentRedirect() {
  redirect('/dashboard/creator?tab=content');
}
