'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Cpu, Search, Database, Sparkles, ShieldCheck, Play } from 'lucide-react';
import { Joyride, EventData, STATUS, Step } from 'react-joyride';

export default function Home() {
  const [runTour, setRunTour] = useState(false);

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to askDocs! Let us take a quick tour of the interface.',
      placement: 'center',
    },
    {
      target: '.tour-system-status',
      content: 'Check the navigation bar at the top to see if your local RAG server is healthy and connected.',
      placement: 'bottom',
    },
    {
      target: '.tour-features',
      content: 'Here are the core capabilities of the local engine: Hybrid Search, Privacy, and Persistence.',
      placement: 'top',
    },
    {
      target: '.tour-workspace',
      content: 'When you are ready, enter the Chat Workspace to start exploring your documents!',
      placement: 'bottom',
    }
  ];

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        scrollToFirstStep
        onEvent={handleJoyrideCallback}
        options={{
          primaryColor: '#2563eb',
          textColor: '#0f172a',
          backgroundColor: '#ffffff',
          arrowColor: '#ffffff',
        }}
      />
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-5xl mx-auto space-y-12 py-32 relative z-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-[0.2em] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={14} className="text-amber-500" />
            v1.0.4 Local RAG Engine
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Intelligence for your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">
              Local Documents.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Secure, private, and high-performance Markdown RAG engine. Search, summarize, and extract insights from your documentation without leaving your machine.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link
            href="/chat"
            className="tour-workspace px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2 group hover:scale-[1.02]"
          >
            Enter Workspace
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => setRunTour(true)}
            className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm hover:scale-[1.02]"
          >
            <Play size={18} className="text-blue-500" />
            Interactive Tour
          </button>
        </div>

        {/* Features Grid */}
        <div className="tour-features grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
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
              className="p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl text-left space-y-4 hover:border-blue-300 dark:hover:border-blue-900/50 transition-all hover:shadow-lg hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <feature.icon size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="p-8 border-t border-slate-200/50 dark:border-slate-800/50 text-center relative z-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">askDocs Intelligence Interface</p>
      </footer>
    </div>
  );
}
