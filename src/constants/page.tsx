'use client';

import { useQuery } from '@tanstack/react-query';
import { docsService } from '@/services/docs.service';
import { Database, HardDrive, FileCode, Search, Server } from 'lucide-react';

export default function DatabasePage() {
  const { data: info, isLoading } = useQuery({
    queryKey: ['system-info'],
    queryFn: () => docsService.getSystemInfo(),
  });

  const stats = [
    { label: 'Database Type', value: 'SQLite 3', icon: Database, sub: 'Local Persistent Storage' },
    { label: 'File Size', value: info?.dbSize || '...', icon: HardDrive, sub: 'conversations.db' },
    { label: 'Storage Engine', value: 'better-sqlite3', icon: Server, sub: 'Synchronous I/O' },
    { label: 'Path', value: info?.dbPath || '...', icon: FileCode, sub: 'System Reference', isPath: true },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Database className="text-blue-600" /> Database Architecture
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Technical specifications for the local persistence layer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Verified</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 ${stat.isPath ? 'text-xs font-mono break-all' : ''}`}>
                {isLoading ? '...' : stat.value}
              </p>
              <p className="text-[10px] text-slate-500 mt-2 font-medium uppercase tracking-tighter">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30">
        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 uppercase tracking-tight mb-2">Privacy Notice</h4>
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          Your database is stored exclusively at the path shown above. Conversations are indexed by your machine ID to ensure portability across local network interfaces while maintaining data isolation.
        </p>
      </div>
    </div>
  );
}