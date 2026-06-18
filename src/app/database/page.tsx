'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { docsService } from '@/services/docs.service';
import { Database, Cpu, HardDrive, Server, Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSystemStatus } from '@/hooks/use-system-status';

function DatabasePage() {
  const { systemInfo: info, isLoading } = useSystemStatus();

  const stats = [
    { label: 'Engine Status', value: info?.status || '...', icon: Activity, sub: 'Transformer Lifecycle' },
    { label: 'Embedding Model', value: info?.models?.embedding || '...', icon: Database, sub: 'Vector Generation' },
    { label: 'Generative Model', value: info?.models?.generative || '...', icon: Server, sub: 'Response Synthesis' },
    { label: 'ONNX Threads', value: info?.onnx_threads ?? '...', icon: Cpu, sub: 'Parallel Execution Units' },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Database className="text-blue-600" /> System Architecture
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Live configuration and transformer engine status.</p>
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
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {isLoading ? '...' : stat.value}
              </p>
              <p className="text-[10px] text-slate-500 mt-2 font-medium uppercase tracking-tighter">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Explicit default export to ensure Next.js/Turbopack registers it correctly
export default DatabasePage;