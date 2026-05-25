'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { docsService } from '@/services/docs.service';
import { SystemConfig } from '@/types/api';
import { Save, RotateCcw, Sliders, Cpu, Brain, Shield, Activity, Zap, FileText, Settings2, Search, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type TabType = 'engine' | 'retrieval' | 'inference' | 'registry';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: () => docsService.getConfig(),
  });

  const [activeTab, setActiveTab] = useState<TabType>('engine');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<SystemConfig | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<SystemConfig>();

  const qaMode = watch('inference_settings.qa_mode');

  useEffect(() => {
    if (config) reset(config);
  }, [config, reset]);

  const onPreSubmit = (data: SystemConfig) => {
    setPendingData(data);
    setShowConfirm(true);
  };

  const mutation = useMutation({
    mutationFn: (data: Partial<SystemConfig>) => docsService.patchConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast.success('Configuration updated', {
        description: 'System settings have been successfully applied to the local engine.'
      });
    },
  });

  if (isLoading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Sliders className="text-blue-600" /> Engine Configuration
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Fine-tune your RAG pipeline and retrieval metrics.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        {[
          { id: 'engine', label: 'Engine', icon: Settings2 },
          { id: 'retrieval', label: 'Retrieval', icon: Search },
          { id: 'inference', label: 'Inference', icon: Cpu },
          { id: 'registry', label: 'Registry', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-tighter transition-all rounded-lg",
              activeTab === tab.id 
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onPreSubmit)} className="space-y-8 min-h-[400px]">
        {activeTab === 'engine' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Active Models */}
            <section className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Brain size={16} /> Active Models
              </h3>
              <div className="space-y-3">
                {Object.entries(config?.models || {}).map(([key]) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{key.replace('_', ' ')}</label>
                    <input 
                      {...register(`models.${key as keyof SystemConfig['models']}`)}
                      readOnly
                      className="w-full bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-md p-2 text-xs font-mono cursor-not-allowed" 
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* ONNX Engine Settings */}
            <section className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Zap size={16} /> ONNX Quantization
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <label className="text-xs font-semibold">Inference Threads</label>
                  <input 
                    type="number" 
                    {...register('onnx_settings.onnx_threads', { valueAsNumber: true })} 
                    className="w-16 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded p-1 text-xs text-center" 
                  />
                </div>
                {[
                  { id: 'transformer_quantized', label: 'Transformer Quantization' },
                  { id: 'embedding_quantized', label: 'Embedding Quantization' },
                  { id: 'rerank_quantized', label: 'Rerank Quantization' },
                  { id: 'generative_quantized', label: 'Generative Quantization' },
                ].map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <label className="text-xs font-semibold">{opt.label}</label>
                    <input 
                      type="checkbox" 
                      {...register(`onnx_settings.${opt.id as keyof SystemConfig['onnx_settings']}`)} 
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'retrieval' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Search Optimization */}
            <section className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Activity size={16} /> Search Metrics
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">BM25 Threshold</label>
                  <input {...register('search_optimization.bm25_threshold', { valueAsNumber: true })} step="0.05" type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md p-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">BM25 Weight</label>
                    <input {...register('search_optimization.bm25_weight', { valueAsNumber: true })} step="0.1" type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Semantic Weight</label>
                    <input {...register('search_optimization.semantic_weight', { valueAsNumber: true })} step="0.1" type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md p-2 text-sm" />
                  </div>
                </div>
              </div>
            </section>

            {/* Rerank Settings */}
            <section className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Shield size={16} /> Reranking & RRF
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">RRF Constant (K)</label>
                  <input {...register('search_optimization.rrf_k', { valueAsNumber: true })} type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Rerank Top N</label>
                  <input {...register('reranking.rerank_top_n', { valueAsNumber: true })} type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md p-2 text-sm" />
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'inference' && (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* QA Mode Switcher */}
            <section className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={16} className="text-blue-500" /> QA Strategy
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Toggle between generative synthesis and extractive span retrieval.</p>
                </div>
                <div className="flex bg-white dark:bg-slate-950 p-1 rounded-xl border border-blue-200 dark:border-blue-900">
                  <button
                    type="button"
                    onClick={() => setValue('inference_settings.qa_mode', 'extractive')}
                    className={cn(
                      "px-4 py-2 text-[10px] font-bold rounded-lg transition-all",
                      qaMode === 'extractive' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    EXTRACTIVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('inference_settings.qa_mode', 'generative')}
                    className={cn(
                      "px-4 py-2 text-[10px] font-bold rounded-lg transition-all",
                      qaMode === 'generative' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    GENERATIVE
                  </button>
                </div>
              </div>
            </section>

            {/* Inference Settings */}
            <section className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Cpu size={16} /> Inference Limits
              </h3>
              <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Max Chunks</label>
                    <input {...register('inference_settings.max_inference_chunks', { valueAsNumber: true })} type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Timeout (ms)</label>
                    <input {...register('inference_settings.model_init_timeout', { valueAsNumber: true })} type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md p-2 text-sm" />
                  </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'registry' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Model Registry View */}
            <section className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FileText size={16} /> Available Models Registry
              </h3>
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-bold">
                    <tr>
                      <th className="p-3">Model ID</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {config?.available_models.registry.map((model) => (
                      <tr key={model.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono text-blue-600 dark:text-blue-400">{model.id}</td>
                        <td className="p-3 text-slate-500">{model.size}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 italic">{model.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          {!showConfirm ? (
            <>
              <button 
                type="button" 
                onClick={() => reset()} 
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={16} /> Reset
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <Save size={16} /> Save Configuration
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/10 p-2 pl-4 rounded-xl border border-amber-200 dark:border-amber-900/30 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 text-xs font-bold">
                <AlertTriangle size={16} />
                Apply changes to the engine?
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowConfirm(false)} 
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  disabled={mutation.isPending}
                  onClick={() => {
                    if (pendingData) {
                      mutation.mutate(pendingData);
                      setShowConfirm(false);
                    }
                  }} 
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  {mutation.isPending ? <RotateCcw size={14} className="animate-spin" /> : <Check size={14} />}
                  Confirm Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}