'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Globe, BarChart2, ClipboardList,
  User, LogOut, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearStoredUser, clearAuthCookie, getStoredUser, getUserInitials } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/websites',  icon: Globe,           label: 'Websites' },
  { href: '/analytics', icon: BarChart2,        label: 'Analytics' },
  { href: '/consents',  icon: ClipboardList,    label: 'Consent Logs' },
  { href: '/profile',   icon: User,             label: 'Profile' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  const handleLogout = () => {
    clearStoredUser();
    clearAuthCookie();
    router.push('/login');
  };

  return (
    <aside className="flex flex-col w-64 bg-[#0F172A] text-slate-300 h-screen flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-base">CookieConsent</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500 pl-[10px]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-indigo-400' : 'text-slate-500')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="px-4 py-4 border-t border-slate-800 space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-1">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getUserInitials(user.fullName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
