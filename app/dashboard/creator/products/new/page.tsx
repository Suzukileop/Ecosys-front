import { redirect } from 'next/navigation';

export default function NewCreatorProductPage() {
  redirect('/dashboard/creator?tab=products&create=1');
}
