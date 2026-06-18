'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, LayoutDashboard, Settings, Cpu, Info, LogOut, LogIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from './tooltip';
import { AboutModal } from './about-modal';

const navItems = [
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface GlobalSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export function GlobalSidebar({ isCollapsed, setIsCollapsed }: GlobalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/admin/status')
      .then(res => res.json())
      .then(data => setIsAdmin(data.isAuthenticated));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAdmin(false);
    router.push('/');
    router.refresh();
  };

  return (
    <aside className={cn(
      "border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-screen transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-blue-600 rounded-full p-1 shadow-sm z-50 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <Tooltip content="Return to Home" side="right" disabled={!isCollapsed}>
        <Link 
          href="/" 
          className={cn(
            "p-6 flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer",
            isCollapsed && "justify-center px-0"
          )}
        >
          <div className="w-8 h-8 shrink-0 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Cpu size={20} />
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">
                askDocs
              </span>
              {isAdmin && (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-tighter">
                  Admin
                </span>
              )}
            </div>
          )}
        </Link>
      </Tooltip>

      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => {
          if (item.name === 'Settings' && !isAdmin) return null;
          
          const isActive = pathname.startsWith(item.href);
          return (
            <Tooltip key={item.name} content={item.name} side="right" disabled={!isCollapsed}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon size={18} className={cn("shrink-0 transition-transform", !isActive && "group-hover:scale-110")} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            </Tooltip>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/50 space-y-1">
          <Tooltip content="About askDocs" side="right" disabled={!isCollapsed}>
            <button
              onClick={() => setIsAboutOpen(true)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group",
                isCollapsed && "justify-center"
              )}
            >
              <Info size={18} className="shrink-0 group-hover:text-blue-500 transition-colors" />
              {!isCollapsed && <span className="truncate">About askDocs</span>}
            </button>
          </Tooltip>

          {!isAdmin && (
            <Tooltip content="Admin Login" side="right" disabled={!isCollapsed}>
              <Link
                href="/admin/login"
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group",
                  isCollapsed && "justify-center"
                )}
              >
                <LogIn size={18} className="shrink-0 group-hover:text-blue-500 transition-colors" />
                {!isCollapsed && <span className="truncate">Admin Login</span>}
              </Link>
            </Tooltip>
          )}

          {isAdmin && (
            <Tooltip content="Logout Admin" side="right" disabled={!isCollapsed}>
              <button
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group",
                  isCollapsed && "justify-center"
                )}
              >
                <LogOut size={18} className="shrink-0 group-hover:scale-110 transition-transform" />
                {!isCollapsed && <span className="truncate">Logout Admin</span>}
              </button>
            </Tooltip>
          )}
        </div>
      </nav>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </aside>
  );
}