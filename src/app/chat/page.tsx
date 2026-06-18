'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { docsService } from '@/services/docs.service';
import { chatService } from '@/services/chat.service';
import { useChat } from '@/hooks/use-chat-stream';
import { ChatMessage } from '@/components/chat/chat-message';
import { Send, Terminal, Sparkles, GitCompare, Loader2, FileSearch, MessageSquare, Download, ChevronDown, Search, Plus, X, Menu, Maximize2, Minimize2, Settings2, RefreshCw, Trash2, Pencil, Check } from 'lucide-react';
import { QueryMode } from '@/types/api';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/shared/tooltip';
import { useSystemStatus } from '@/hooks/use-system-status';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ChatDetailResponse {
  messages: any[];
}
interface MetadataResponse {
  modes: QueryMode[];
}

function SystemStatusIndicator({ isLoading, isError, engineStatus }: { isLoading: boolean; isError: boolean; engineStatus?: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className={cn(
        "w-2 h-2 rounded-full transition-all duration-500",
        isLoading ? "bg-slate-300 animate-pulse" : isError ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
      )} />
      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
        {isLoading ? 'Checking connection...' : isError ? 'Offline' : `Online • ${engineStatus || 'unknown'}`}
      </span>
    </div>
  );
}

export default function ChatPage() {
  const params = useParams();
  const activeChatId = params?.chatId as string | undefined;
  const router = useRouter();

  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<QueryMode>('summarize');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [atBottom, setAtBottom] = useState(true);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCompactView, setIsCompactView] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Search/edit state for history
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const { messages, sendMessage, isLoading, startNewChat } = useChat(activeChatId);

  // Fetch history list
  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['chat-history'],
    queryFn: () => chatService.getHistory(),
  });

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await chatService.deleteConversation(id);
        queryClient.invalidateQueries({ queryKey: ['chat-history'] });
        toast.success('Conversation deleted');
        if (id === activeChatId) {
          startNewChat();
        }
      } catch (err) {
        toast.error('Failed to delete conversation');
      }
    }
  };

  const handleClearAll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to clear ALL conversation history?')) {
      try {
        await chatService.clearAllHistory();
        queryClient.invalidateQueries({ queryKey: ['chat-history'] });
        toast.success('All history cleared');
        startNewChat();
      } catch (err) {
        toast.error('Failed to clear history');
      }
    }
  };

  const handleStartRename = (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(title);
  };

  const handleSaveRename = async (id: string) => {
    if (!editingTitle.trim()) return;
    try {
      await chatService.updateTitle(id, editingTitle.trim());
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      setEditingId(null);
      toast.success('Conversation renamed');
    } catch (err) {
      toast.error('Failed to rename conversation');
    }
  };

  const filteredHistory = history?.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const { data: metadata, isLoading: isLoadingMetadata } = useQuery<MetadataResponse>({
    queryKey: ['metadata'],
    queryFn: () => docsService.getMetadata() as Promise<MetadataResponse>,
    staleTime: 300000, // Cache modes for 5 minutes
  });

  const { 
    systemInfo, 
    isLoading: isLoadingSystemInfo, 
    isError: isSystemInfoError, 
    isOnline, 
    refetch: refetchStatus,
    engineStatus
  } = useSystemStatus();

  // Automatically set the selectedMode to the first available item if 'answer' is missing
  useEffect(() => {
    if (metadata?.modes && metadata.modes.length > 0) {
      if (!metadata.modes.includes(selectedMode)) {
        setSelectedMode(metadata.modes[0]);
      }
    }
  }, [metadata, selectedMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Log the payload to the console to inspect the structure sent to the query endpoint
    console.log('🚀 [Query Payload]:', {
      query: input.trim(),
      mode: selectedMode
    });

    sendMessage(input, selectedMode);
    setInput('');
  };

  const modeConfig: Record<string, { label: string; icon: any; desc: string }> = {
    answer: { label: 'Answer', icon: Sparkles, desc: 'Direct RAG response' },
    summarize: { label: 'Summarize', icon: Terminal, desc: 'Condense documents' },
    compare: { label: 'Compare', icon: GitCompare, desc: 'Analyze differences' },
    extract: { label: 'Extract', icon: FileSearch, desc: 'Pull structured data' },
  };

  // Fallback to core modes if metadata is unavailable or empty to ensure the UI remains functional
  const modesList = metadata?.modes && metadata.modes.length > 0 
    ? metadata.modes 
    : (Object.keys(modeConfig) as QueryMode[]);

  const activeModes = modesList.map((mode) => ({
    id: mode,
    ...(modeConfig[mode] || { 
      label: mode.charAt(0).toUpperCase() + mode.slice(1), 
      icon: MessageSquare, 
      desc: 'Engine defined mode' 
    }),
  }));

  const handleExportHistory = () => {
    if (messages.length === 0) return;

    const content = messages.map(msg => {
      const role = msg.role === 'user' ? '### 👤 User' : '### 🤖 Assistant';
      const timestamp = new Date(msg.timestamp).toLocaleString();
      let body = msg.content;
      
      if (msg.citations && msg.citations.length > 0) {
        body += '\n\n**Sources:**\n' + msg.citations.map(c => `- ${c.source_title} (${c.source_file})`).join('\n');
      }
      
      return `${role} (${timestamp})\n\n${body}\n\n---`;
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full overflow-hidden bg-white dark:bg-slate-950">
      {/* Workspace Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 lg:relative border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col bg-slate-50 dark:bg-slate-900 lg:bg-slate-50/50 lg:dark:bg-slate-900/20 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:p-0 lg:border-none lg:opacity-0 lg:overflow-hidden"
      )}>
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-black tracking-widest text-blue-600">ASKDOCS</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar min-h-0">
        <button
          onClick={() => startNewChat()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 mb-4"
        >
          <Plus size={16} />
          NEW CHAT
        </button>

        {/* Chat History Section */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex justify-between items-center">
            <span>Chat History</span>
            {history && history.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-[9px] text-red-500 hover:text-red-700 hover:underline normal-case font-bold uppercase tracking-widest"
              >
                Clear All
              </button>
            )}
          </h3>
          
          <div className="relative mb-3">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-8 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all text-slate-900 dark:text-slate-100"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1 mb-4">
            {isLoadingHistory ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-9 w-full bg-slate-100 dark:bg-slate-900/50 rounded-lg animate-pulse" />
              ))
            ) : filteredHistory.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic text-center py-4">No conversations found</p>
            ) : (
              filteredHistory.map((chat) => {
                const isActive = chat.id === activeChatId;
                const isEditing = chat.id === editingId;

                return (
                  <div
                    key={chat.id}
                    className={cn(
                      "group flex items-center justify-between px-3 py-2 rounded-xl text-left border transition-all text-xs relative",
                      isActive
                        ? "bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900 shadow-sm text-blue-600 dark:text-blue-400 font-bold"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                    )}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(chat.id)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-900 dark:text-slate-100 font-normal outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(chat.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Link
                          href={`/chat/${chat.id}`}
                          className="flex-1 truncate pr-8 flex items-center gap-2"
                        >
                          <MessageSquare size={13} className="shrink-0 opacity-70" />
                          <span className="truncate">{chat.title}</span>
                        </Link>
                        
                        <div className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 pl-2 transition-opacity duration-150 rounded-lg",
                          isActive ? "bg-white dark:bg-slate-800" : "bg-slate-100 dark:bg-slate-900"
                        )}>
                          <button
                            onClick={(e) => handleStartRename(chat.id, chat.title, e)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                            title="Rename"
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Inference Mode</h3>
          <div className="space-y-2">
            {isLoadingMetadata ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-full h-14 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse border border-transparent" 
                />
              ))
            ) : (
              activeModes.map((mode) => (
                <Tooltip key={mode.id} content={mode.desc} side="right">
                  <button
                    onClick={() => setSelectedMode(mode.id as QueryMode)}
                    className={`w-full flex flex-col items-start gap-1 px-3 py-2.5 rounded-xl text-left transition-all border ${
                      selectedMode === mode.id
                        ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900 shadow-sm text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      <mode.icon size={14} />
                      {mode.label}
                    </div>
                    <span className="text-[10px] opacity-70 font-medium leading-none">{mode.desc}</span>
                  </button>
                </Tooltip>
              ))
            )}
          </div>
        </div>

        <div>
          <button 
            onClick={() => setIsPreferencesOpen(!isPreferencesOpen)}
            className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Settings2 size={12} />
              Preferences
            </span>
            <ChevronDown size={12} className={cn("transition-transform duration-200", isPreferencesOpen && "rotate-180")} />
          </button>
          
          {isPreferencesOpen && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200 mb-4">
              <button
                onClick={() => setIsCompactView(!isCompactView)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all border",
                  isCompactView 
                    ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                )}
              >
                {isCompactView ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span className="text-[10px] font-bold uppercase tracking-tighter">Compact View</span>
              </button>
            </div>
          )}
        </div>
        </div>

        {messages.length > 0 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleExportHistory}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all uppercase tracking-tighter"
            >
              <Download size={14} />
              Export History (.md)
            </button>
          </div>
        )}

        {/* System Status Indicator */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Status</span>
            <button
              onClick={() => refetchStatus()}
              disabled={isLoadingSystemInfo}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-blue-500 transition-all disabled:opacity-50"
              title="Refresh connection status"
            >
              <RefreshCw size={12} className={cn(isLoadingSystemInfo && "animate-spin")} />
            </button>
          </div>
          <SystemStatusIndicator 
            isLoading={isLoadingSystemInfo} 
            isError={isSystemInfoError || (!isLoadingSystemInfo && !isOnline)}
            engineStatus={engineStatus}
          />
        </div>
      </div>

      {/* Main Chat View */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-white dark:bg-slate-950 transition-all duration-300">
        {/* Sidebar Toggle for Collapsed View */}
        {!isSidebarOpen && (
          <div className="absolute top-4 left-4 z-30 animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl text-slate-500 hover:text-blue-600 transition-all"
              title="Open History"
            >
              <Menu size={20} />
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-blue-500/20 rotate-3">
              <Sparkles size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Ask your documentation</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
              Select a mode and type a query. The engine will search through your local FAISS index and generate a grounded response.
            </p>
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            followOutput="smooth"
            atBottomStateChange={setAtBottom}
            itemContent={(_, msg) => <ChatMessage message={msg} isCompact={isCompactView} />}
            components={{
              Footer: () => isLoading ? (
                <div className="p-8 flex gap-4 animate-pulse border-y border-slate-50 dark:border-slate-900">
                  <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
              ) : <div className="h-8" />
            }}
          />
        )}

        {/* Query Input Zone */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
          {/* Floating Scroll to Bottom Button */}
          {!atBottom && messages.length > 0 && (
            <button
              onClick={() => virtuosoRef.current?.scrollToIndex({ index: messages.length - 1, align: 'end', behavior: 'smooth' })}
              className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-xl text-xs font-bold text-blue-600 dark:text-blue-400 animate-in fade-in slide-in-from-bottom-4 duration-300 hover:scale-105 transition-transform"
            >
              <ChevronDown size={14} className="animate-bounce" />
              Latest Messages
            </button>
          )}

          {isLoading && elapsedTime >= 10 && (
            <div className="max-w-4xl mx-auto mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest animate-pulse">
                  Processing complex query...
                </span>
                <span className="text-[10px] font-mono text-slate-400">{elapsedTime}s elapsed</span>
              </div>
              <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${Math.min((elapsedTime / 45) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                {isLoading ? <Loader2 size={18} className="text-blue-500 animate-spin" /> : <Sparkles size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />}
            </div>
            <input
              type="text"
              suppressHydrationWarning
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask a question in ${selectedMode} mode...`}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-14 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-blue-500/20"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="flex items-center justify-center gap-4 mt-4">
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">askDocs Engine v1.0.4</span>
             <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">RAG Optimized</span>
          </div>
        </div>
      </div>
    </div>
  );
}