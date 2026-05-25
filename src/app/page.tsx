'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Cpu, Search, Database, Sparkles, ShieldCheck, Play, X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOUR_STEPS = [
  {
    title: "Verify System Health",
    description: "Check the navigation bar at the top. A green 'Engine Online' indicator means your local RAG server is healthy and connected.",
    icon: ShieldCheck,
  },
  {
    title: "Configure Retrieval",
    description: "Navigate to Settings to tune your search weights. Balance between BM25 (keyword matching) and Semantic (meaning-based) search for best results.",
    icon: Cpu,
  },
  {
    title: "Monitor Performance",
    description: "Use the Dashboard to track CPU threads, model loading states, and inference latency in real-time.",
    icon: Database,
  },
  {
    title: "Launch Workspace",
    description: "Enter the Chat workspace, select an Inference Mode (Summarize is default), and start exploring your local documentation.",
    icon: Sparkles,
  }
];

export default function Home() {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-5xl mx-auto space-y-12 py-24">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Sparkles size={14} />
            v1.0.4 Local RAG Engine
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
            Intelligence for your <br />
            <span className="text-blue-600">Local Documents.</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Secure, private, and high-performance Markdown RAG engine. Search, summarize, and extract insights from your documentation without leaving your machine.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/chat"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 group"
          >
            Enter Workspace
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => { setIsTourOpen(true); setCurrentStep(0); }}
            className="px-8 py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold rounded-2xl border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center gap-2"
          >
            <Play size={18} />
            Getting Started Tour
          </button>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
          >
            System Status
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12">
          {[
            {
              icon: Search,
              title: "Hybrid Search",
              desc: "Combines BM25 and Semantic Vector search for elite retrieval accuracy."
            },
            {
              icon: ShieldCheck,
              title: "Privacy First",
              desc: "Processing happens 100% locally. Your documents never touch the cloud."
            },
            {
              icon: Database,
              title: "SQLite Persistence",
              desc: "Conversation history is keyed to your machine and stored in a local SQLite DB."
            }
          ].map((feature, i) => (
            <div 
              key={i} 
              className="p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl text-left space-y-4 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors"
            >
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                <feature.icon size={24} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="p-8 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">askDocs Intelligence Interface</p>
      </footer>

      {/* Getting Started Tour Modal */}
      {isTourOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setIsTourOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                {(() => {
                  const Icon = TOUR_STEPS[currentStep].icon;
                  return <Icon size={32} />;
                })()}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {TOUR_STEPS[currentStep].title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {TOUR_STEPS[currentStep].description}
                </p>
              </div>

              {/* Progress Dots */}
              <div className="flex gap-2">
                {TOUR_STEPS.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === currentStep ? "w-6 bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                    )} 
                  />
                ))}
              </div>

              <div className="flex w-full gap-3">
                {currentStep > 0 ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-black rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                ) : (
                  <button
                    onClick={() => setIsTourOpen(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-black rounded-xl transition-all uppercase tracking-widest"
                  >
                    Skip
                  </button>
                )}
                
                {currentStep < TOUR_STEPS.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <Link
                    href="/chat"
                    onClick={() => setIsTourOpen(false)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    Get Started
                    <CheckCircle2 size={16} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
