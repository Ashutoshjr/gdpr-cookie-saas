'use client';
import { useRouter } from 'next/navigation';
import { LogOut, User, ChevronDown } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { clearStoredUser, clearAuthCookie, getStoredUser, getUserInitials } from '@/lib/auth';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const router = useRouter();
  const user = getStoredUser();

  const handleLogout = () => {
    clearStoredUser();
    clearAuthCookie();
    router.push('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
      {title && (
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
      )}
      <div className="flex-1" />

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 hover:bg-slate-50 rounded-xl px-3 py-1.5 transition-colors">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {user ? getUserInitials(user.fullName) : 'U'}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">
              {user?.fullName ?? 'Account'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/profile')}>
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
