'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { getStoredUser, isTokenValid, clearStoredUser, clearAuthCookie } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (!user || !isTokenValid(user)) {
      clearStoredUser();
      clearAuthCookie();
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
