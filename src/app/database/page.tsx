'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { docsService } from '@/services/docs.service';
import { Database, HardDrive, FileCode, Server, Wrench, Loader2, ShieldCheck, Download, MessageSquare, Clock, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MaintenanceResponse {
  success: boolean;
  message: string;
}

interface SystemInfo {
  version: string;
  dbSize: string;
  dbPath: string;
  conversationCount: number;
  recentActivity: Array<{
    id: string;
    title: string;
    timestamp: string;
  }>;
}

function DatabasePage() {
  const queryClient = useQueryClient();
  const [lastMaintenance, setLastMaintenance] = useState<string | null>(null);
  const { data: info, isLoading } = useQuery<SystemInfo>({
    queryKey: ['system-info'],
    queryFn: () => docsService.getSystemInfo() as Promise<SystemInfo>,
  });

  const maintenanceMutation = useMutation<MaintenanceResponse, Error, 'vacuum' | 'integrity' | undefined>({
    mutationFn: (action) => docsService.performMaintenance(action) as Promise<MaintenanceResponse>,
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

    if (lastCheck) {
      setLastMaintenance(new Date(Number(lastCheck)).toLocaleString());
    }

    if (!lastCheck || (now - Number(lastCheck)) > weekInMs) {
      maintenanceMutation.mutate('integrity', {
        onSuccess: (data: MaintenanceResponse) => {
          if (data.success) {
            localStorage.setItem(LAST_CHECK_KEY, now.toString());
          }
        }
      });
    }
  }, []); // Run once on component mount to verify health

  const stats = [
    { label: 'Database Type', value: 'SQLite 3', icon: Database, sub: 'Local Persistent Storage' },
    { label: 'File Size', value: info?.dbSize || '...', icon: HardDrive, sub: 'conversations.db' },
    { label: 'Storage Engine', value: 'better-sqlite3', icon: Server, sub: 'Synchronous I/O' },
    { label: 'Conversations', value: info?.conversationCount ?? '...', icon: MessageSquare, sub: 'Total History Records' },
    { label: 'Path', value: info?.dbPath || '...', icon: FileCode, sub: 'System Reference', isPath: true },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 mb-20">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Clock size={16} /> Recent Activity
          </h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Title</th>
                  <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-300">Last Active</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {info?.recentActivity?.map((chat) => (
                  <tr key={chat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                      {chat.title}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(chat.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/chat?id=${chat.id}`} className="text-blue-600 hover:text-blue-700 font-bold text-xs inline-flex items-center gap-1">
                        Open <ArrowUpRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!info?.recentActivity || info.recentActivity.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">
                      No recent conversations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Maintenance Status</h3>
          <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white shadow-lg shadow-blue-500/20 space-y-4">
             <div>
               <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Last Health Check</p>
               <p className="text-lg font-bold">{lastMaintenance || 'Never'}</p>
             </div>
             <div className="pt-4 border-t border-white/10 text-xs text-blue-100">
               Scheduled tasks: Weekly integrity checks and manual vacuuming.
             </div>
          </div>
        </div>
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

// Explicit default export to ensure Next.js/Turbopack registers it correctly
export default DatabasePage;