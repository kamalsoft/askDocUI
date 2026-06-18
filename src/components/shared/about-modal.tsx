'use client';

import { useQuery } from '@tanstack/react-query';
import { docsService } from '@/services/docs.service';
import { X, Cpu, Server, Database } from 'lucide-react';
import { SystemInfo } from '@/hooks/use-system-status';

export function AboutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: info, isLoading } = useQuery<SystemInfo>({
    queryKey: ['system-info'],
    queryFn: () => docsService.getStatus(),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Cpu size={32} />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">About askDocs</h3>
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">Status: {info?.status || '...'}</p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                <Server size={14} className="text-blue-500" /> Generative Model
              </div>
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">{isLoading ? 'Loading...' : info?.models?.generative || 'N/A'}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                <Database size={14} className="text-emerald-500" /> Embedding Model
              </div>
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">{isLoading ? 'Loading...' : info?.models?.embedding || 'N/A'}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed pt-4">
            askDocs is a local-first documentation intelligence platform. 
            Data processing and conversation history remain 100% on your machine.
          </p>

          <button onClick={onClose} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-black rounded-xl transition-all uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}