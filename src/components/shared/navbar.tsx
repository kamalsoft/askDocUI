'use client';

import { useQuery } from '@tanstack/react-query';
import { docsService } from '@/services/docs.service';
import Link from 'next/link';
import { Activity, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { Tooltip } from './tooltip';

export function Navbar() {
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: () => docsService.getHealth(),
    refetchInterval: 5000, // Live polling every 5 seconds
  });

  const getStatusDisplay = () => {
    if (isLoading) return { color: 'text-slate-400', label: 'Connecting', Icon: Activity };
    if (health?.status === 'UP') return { color: 'text-emerald-500', label: 'Engine Online', Icon: ShieldCheck };
    if (health?.status === 'DEGRADED') return { color: 'text-amber-500', label: 'Degraded', Icon: ShieldAlert };
    return { color: 'text-red-500', label: 'Offline', Icon: ShieldX };
  };

  const status = getStatusDisplay();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-2">
        <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          askDocs System <span className="text-slate-200 mx-2">/</span>
          <Tooltip content="Return to Home" side="bottom">
            <Link href="/" className="text-slate-900 dark:text-slate-100 italic hover:text-blue-600 transition-colors">
              v1.0.4-local
            </Link>
          </Tooltip>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-current bg-opacity-5 ${status.color.replace('text', 'bg')} ${status.color}`}>
          <status.Icon size={14} className={isLoading ? 'animate-spin' : ''} />
          <span className="text-[10px] font-black uppercase tracking-tighter">
            {status.label}
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6">
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Vector Store</span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    {health?.vector_store || 'None'}
                </span>
            </div>
            <Tooltip content="Transformers Loaded">
              <div className={`w-2 h-2 rounded-full ${health?.transformers_loaded ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-300'}`} />
            </Tooltip>
        </div>
      </div>
    </header>
  );
}