'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { docsService } from '@/services/docs.service';
import { Database, HardDrive, FileCode, Search, Server, Wrench, Loader2, ShieldCheck, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function DatabasePage() {
  const queryClient = useQueryClient();
  const { data: info, isLoading } = useQuery({
    queryKey: ['system-info'],
    queryFn: () => docsService.getSystemInfo(),
  });

  const maintenanceMutation = useMutation({
    mutationFn: (action?: 'vacuum' | 'integrity') => docsService.performMaintenance(action),
    onSuccess: (data, action) => {
      queryClient.invalidateQueries({ queryKey: ['system-info'] });
      const title = action === 'integrity' ? 'Integrity Check' : 'Database Optimized';
      const method = data.success ? toast.success : toast.error;
      
      method(title, { 
        description: data.message 
      });
    },
    onError: () => toast.error('Maintenance failed'),
  });

  // Automated Weekly Integrity Check (Client-side scheduled task)
  useEffect(() => {
    const LAST_CHECK_KEY = 'askdocs-last-integrity-check';
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
    const now = Date.now();

    if (!lastCheck || (now - Number(lastCheck)) > weekInMs) {
      maintenanceMutation.mutate('integrity', {
        onSuccess: (data) => {
          if (data.success) {
            localStorage.setItem(LAST_CHECK_KEY, now.toString());
          }
        }
      });
    }
  }, []); // Run once on component mount

  const stats = [
    { label: 'Database Type', value: 'SQLite 3', icon: Database, sub: 'Local Persistent Storage' },
    { label: 'File Size', value: info?.dbSize || '...', icon: HardDrive, sub: 'conversations.db' },
    { label: 'Storage Engine', value: 'better-sqlite3', icon: Server, sub: 'Synchronous I/O' },
    { label: 'Path', value: info?.dbPath || '...', icon: FileCode, sub: 'System Reference', isPath: true },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Database className="text-blue-600" /> Database Architecture
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Technical specifications for the local persistence layer.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => maintenanceMutation.mutate('integrity')}
            disabled={maintenanceMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all shadow-sm disabled:opacity-50"
          >
            {maintenanceMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            Check Integrity
          </button>

          <button
            onClick={() => maintenanceMutation.mutate('vacuum')}
            disabled={maintenanceMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all shadow-sm disabled:opacity-50"
          >
            {maintenanceMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Wrench size={14} />}
            Optimize Storage
          </button>

          <button
            onClick={() => window.open(docsService.getBackupUrl(), '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Download size={14} />
            Export Backup
          </button>
        </div>
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