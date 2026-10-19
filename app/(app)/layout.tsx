/* Families portfolios can pick by name — not needed on the landing / sign-in pages. */
import '@/lib/fonts/portfolio-fonts';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
