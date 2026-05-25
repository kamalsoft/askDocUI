import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600/80" />
          <div className="absolute h-10 w-10 rounded-full border-4 border-slate-100 dark:border-slate-800 opacity-20"></div>
        </div>
        <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">
          Synchronizing Engine...
        </p>
      </div>
    </div>
  );
}