'use client';

import { Citation } from '@/types/api';
import { FileText, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export function SourceCitation({ citation }: { citation: Citation }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="group relative p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-900 transition-all cursor-help"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-2 mb-1">
        <FileText size={12} className="text-blue-500" />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{citation.source_title}</span>
      </div>
      <p className={`text-[11px] text-slate-500 dark:text-slate-400 leading-snug ${isExpanded ? '' : 'line-clamp-2'}`}>
        {citation.snippet}
      </p>
    </div>
  );
}