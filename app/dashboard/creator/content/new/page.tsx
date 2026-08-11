import { redirect } from 'next/navigation';

export default function NewCreatorContentPage() {
  redirect('/dashboard/creator?tab=content&publish=1');
}
