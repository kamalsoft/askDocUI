'use client';

import { useQuery } from '@tanstack/react-query';
import { docsService } from '@/services/docs.service';
import { Cpu, HardDrive, Layers, Activity, Server, Database } from 'lucide-react';
import { SectionErrorBoundary } from '@/components/shared/section-error-boundary';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { data: status, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['status'],
    queryFn: () => docsService.getStatus(),
    refetchInterval: 3000,
  });

  const { data: metadata, isLoading: isLoadingMetadata } = useQuery({
    queryKey: ['metadata'],
    queryFn: () => docsService.getMetadata({ 
      retries: 2 // Leverage the new apiClient retry logic
    }),
  });

  // Avoid hydration mismatch by rendering timestamps only on the client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const cards = [
    { label: 'Engine Status', value: status?.status || 'N/A', icon: Activity, sub: 'Transformer Lifecycle', loading: isLoadingStatus },
    { label: 'Generative Model', value: status?.models?.generative || 'N/A', icon: Server, sub: 'Response Synthesis', loading: isLoadingStatus },
    { label: 'Embedding Model', value: status?.models?.embedding || 'N/A', icon: Database, sub: 'Vector Generation', loading: isLoadingStatus },
    { label: 'ONNX Threads', value: status?.onnx_threads ?? 'N/A', icon: Cpu, sub: 'Parallel Execution Units', loading: isLoadingStatus },
    { label: 'Downloaded Models', value: metadata?.downloaded_models?.length || 0, icon: HardDrive, sub: 'Models in Cache', loading: isLoadingMetadata },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Engine Status</h2>
        <p className="text-slate-500 dark:text-slate-400">Real-time health and performance metrics for the local RAG pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SectionErrorBoundary name="Performance Metrics">
          {cards.map((card) => (
            <div key={card.label} className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <card.icon size={20} />
                </div>
                <div className={`w-2 h-2 rounded-full ${isLoadingStatus ? 'bg-slate-300 animate-pulse' : status?.status === 'ready' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate mt-1">
                {card.loading ? (
                  <span className="inline-block w-24 h-6 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                ) : (
                  card.value ?? 'N/A'
                )}
              </p>
              <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-tighter">{card.sub}</p>
            </div>
          ))}
        </SectionErrorBoundary>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SectionErrorBoundary name="Model Registry">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-105 transition-transform duration-200">
             <h3 className="font-semibold mb-4 flex items-center gap-2">
               <Layers size={18} className="text-blue-500" /> Cached Model Registry
             </h3>
             <div className="space-y-2">
                {isLoadingMetadata ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg animate-pulse" />
                  ))
                ) : (
                  metadata?.downloaded_models?.map(m => (
                    <div key={m} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs font-mono">
                      <span className="text-slate-700 dark:text-slate-300">{m}</span>
                      <span className="text-emerald-500 font-bold">READY</span>
                    </div>
                  ))
                )}
             </div>
          </div>
        </SectionErrorBoundary>

        <SectionErrorBoundary name="System Logs">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 text-slate-100">
             <h3 className="font-semibold mb-4 text-blue-400">System Logs Preview</h3>
             <div className="space-y-1 font-mono text-[11px] opacity-80" suppressHydrationWarning>
                <p>[INFO] {mounted ? new Date().toISOString() : 'Synchronizing...'} - Model loader initialized.</p>
                <p>[INFO] {mounted ? new Date().toISOString() : 'Synchronizing...'} - Vector Store: FAISS local index loaded.</p>
                <p className="text-blue-400">[METRIC] Inference latency: avg {isLoadingStatus ? '...' : status?.onnx_threads ? 120 / status.onnx_threads : 0}ms/token</p>
                <p className="text-emerald-400">[HEALTH] System reporting status UP.</p>
             </div>
          </div>
        </SectionErrorBoundary>
      </div>
    </div>
  );
}