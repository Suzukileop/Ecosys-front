import { HeaderAuth } from '@/components/layout/HeaderAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderAuth />
      {children}
    </div>
  );
}
