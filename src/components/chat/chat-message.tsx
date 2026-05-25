'use client';

import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/api';
import { User, Bot, Clock, BarChart3, Copy, Check, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { SourceCitation } from './source-citation';

const MermaidRenderer = memo(({ chart, isDark }: { chart: string; isDark: boolean }) => {
  const [svg, setSvg] = useState('');
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 11)}`);

  useEffect(() => {
    const renderChart = async () => {
      try {
        setSvg(''); // Reset SVG to force clean re-render on theme change
        mermaid.initialize({ 
          startOnLoad: false, 
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit'
        });
        const { svg: renderedSvg } = await mermaid.render(idRef.current, chart);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid error:', err);
      }
    };
    renderChart();
  }, [chart, isDark]);

  if (!svg) {
    return <div className="h-32 w-full animate-pulse bg-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-500 font-mono">Rendering Diagram...</div>;
  }

  return (
    <div 
      className="mermaid-chart flex justify-center py-4 bg-slate-900/50 rounded-lg border border-slate-800 my-4 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
});

const PreWithCopy = memo(({ children, isAssistant }: { children: React.ReactNode, isAssistant: boolean }) => {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const isMermaid = React.Children.toArray(children).some(
    (child: any) => child?.props?.className?.includes('language-mermaid')
  );

  if (isMermaid) return <>{children}</>;

  const handleCopy = () => {
    const text = preRef.current?.innerText || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {isAssistant && (
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 p-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:bg-slate-700 z-10"
          title="Copy code"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      )}
      <pre ref={preRef} className="!mt-0">
        {children}
      </pre>
    </div>
  );
});

export const ChatMessage = memo(({ message, isCompact }: { message: ChatMessageType; isCompact?: boolean }) => {
  const isAssistant = message.role === 'assistant';
  const { isDark } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const blob = new Blob([message.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-response-${message.id.slice(0, 8)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-scroll the message box as content is added
  useEffect(() => {
    if (isAssistant && scrollRef.current) {
      const container = scrollRef.current;
      // Use a small threshold to check if we should scroll
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      if (isAtBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [message.content, isAssistant]);

  return (
    <div className={cn(
      "flex transition-all",
      isCompact ? "gap-2 p-3" : "gap-4 p-6",
      isAssistant ? 'bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800' : ''
    )}>
      {!isCompact && (
        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isAssistant ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
          {isAssistant ? <Bot size={18} /> : <User size={18} />}
        </div>
      )}
      
      <div className={cn("max-w-none flex-1", isCompact ? "space-y-2" : "space-y-4")}>
        <div 
          ref={scrollRef}
          className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
        >
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed 
            prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-p:my-1
            prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/20 
            prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
            {useMemo(() => (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: ({ children }) => <PreWithCopy isAssistant={isAssistant}>{children}</PreWithCopy>,
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !className;

                    if (!isInline && match && match[1] === 'mermaid') {
                      return <MermaidRenderer chart={String(children).replace(/\n$/, '')} isDark={isDark} />;
                    }

                    if (!isInline && match) {
                      return (
                        <SyntaxHighlighter
                          style={(isDark ? vscDarkPlus : prism) as { [key: string]: React.CSSProperties }}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            padding: '1rem',
                            background: 'transparent',
                            fontSize: '0.875rem',
                          }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      );
                    }

                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            ), [message.content, isDark, isAssistant])}
          </div>
        </div>

        {isAssistant && message.citations && message.citations.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sources</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {message.citations.map((citation, idx) => (
                <SourceCitation key={idx} citation={citation} />
              ))}
            </div>
          </div>
        )}

        {isAssistant && message.metadata && (
           <div className="flex items-center gap-4 pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800/50 w-full justify-between">
              <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Clock size={10} className="text-slate-500" /> 
                {message.metadata.timings.total_inference_ms}ms
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="flex items-center gap-1.5">
                <BarChart3 size={10} className="text-slate-500" />
                Score: {(message.score ?? 0).toFixed(4)}
              </span>
              </div>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                title="Download as Markdown"
              >
                <Download size={12} />
                Export .md
              </button>
           </div>
        )}
      </div>
    </div>
  );
});