'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, LayoutDashboard, Settings, Cpu, ExternalLink, Database, Info } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming standard shadcn-like util
import { docsService } from '@/services/docs.service';
import { Tooltip } from './tooltip';
import { AboutModal } from './about-modal';

const navItems = [
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Database', href: '/database', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function GlobalSidebar() {
  const pathname = usePathname();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

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
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">
            askDocs
          </span>
        </Link>
      </Tooltip>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
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

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <a
            href={docsService.getSwaggerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <ExternalLink size={18} />
            API Docs
          </a>
        </div>

        <button
          onClick={() => setIsAboutOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          <Info size={18} />
          About askDocs
        </button>
      </nav>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </aside>
  );
}