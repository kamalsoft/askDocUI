'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Keep Link for navigation
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, LayoutDashboard, Settings, Cpu, Info, LogOut, LogIn } from 'lucide-react'; // Removed ExternalLink
import { cn } from '@/lib/utils'; // Assuming standard shadcn-like util
import { docsService } from '@/services/docs.service';
import { Tooltip } from './tooltip';
import { AboutModal } from './about-modal';

const navItems = [
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function GlobalSidebar() {
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
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-screen">
      <Tooltip content="Return to Home" side="right">
        <Link 
          href="/" 
          className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Cpu size={20} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">
              askDocs
            </span>
            {isAdmin && (
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-tighter animate-in fade-in zoom-in duration-300">
                Admin
              </span>
            )}
          </div>
        </Link>
      </Tooltip>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          // Restrict Settings visibility to Admins only
          if (item.name === 'Settings' && !isAdmin) return null;
          
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" 
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}

        <button
          onClick={() => setIsAboutOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          <Info size={18} />
          About askDocs
        </button>

        {!isAdmin && (
          <Link
            href="/admin/login"
            className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <LogIn size={18} />
            Admin Login
          </Link>
        )}

        {isAdmin && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut size={18} />
            Logout Admin
          </button>
        )}
      </nav>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </aside>
  );
}