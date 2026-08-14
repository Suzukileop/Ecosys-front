import { redirect } from 'next/navigation';

/** Former profile settings page — the sidebar card now opens My Profile. */
export default function UserSettingsRedirect() {
  redirect('/dashboard/creator');
}
