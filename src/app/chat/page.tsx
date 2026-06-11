'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { docsService } from '@/services/docs.service';
import { useChat } from '@/hooks/use-chat-stream';
import { ChatMessage } from '@/components/chat/chat-message';
import { Send, Terminal, Sparkles, GitCompare, Loader2, FileSearch, MessageSquare, Download, ChevronDown, Search, History as HistoryIcon, Clock, Plus, Trash2, Edit2, Check, X, AlertTriangle, Menu, PanelLeftClose, Maximize2, Minimize2, Settings2 } from 'lucide-react';
import { QueryMode, ChatHistoryItem } from '@/types/api';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { Tooltip } from '@/components/shared/tooltip';

interface ChatDetailResponse {
  messages: any[];
}

interface MetadataResponse {
  modes: QueryMode[];
}

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<QueryMode>('summarize');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [atBottom, setAtBottom] = useState(true);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { messages, sendMessage, isLoading, chatId, loadChat, startNewChat } = useChat();

  const { data: metadata, isLoading: isLoadingMetadata } = useQuery<MetadataResponse>({
    queryKey: ['metadata'],
    queryFn: () => docsService.getMetadata() as Promise<MetadataResponse>,
    staleTime: 300000, // Cache modes for 5 minutes
  });

  const { data: history = [], isLoading: isLoadingHistory } = useQuery<ChatHistoryItem[]>({
    queryKey: ['chat-history'],
    queryFn: () => docsService.getHistory() as Promise<ChatHistoryItem[]>,
  });




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

  // Filter history based on search keyword
  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  // Auto-collapse sidebar on smaller screens when a conversation is selected
  const handleAutoCollapse = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    startNewChat();
    handleAutoCollapse();
  };

  const loadHistoryItem = async (id: string, title: string) => {
    try {
      const data = await docsService.getHistoryItem(id) as ChatDetailResponse;
      loadChat(id, title, data.messages);
      handleAutoCollapse();
    } catch (err) {
      toast.error('Failed to load conversation');
    }
  };

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => docsService.deleteHistory(id) as Promise<void>,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      if (chatId === id) {
        startNewChat();
      }
      toast.success('Conversation deleted');
    },
    onError: () => toast.error('Failed to delete conversation'),
  });

  const updateTitleMutation = useMutation<void, Error, { id: string; title: string }>({
    mutationFn: ({ id, title }) => docsService.updateChatTitle(id, title) as Promise<void>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      setEditingId(null);
      toast.success('Title updated');
    },
    onError: () => toast.error('Failed to update title'),
  });

  const clearAllMutation = useMutation<void, Error, void>({
    mutationFn: () => docsService.clearAllHistory() as Promise<void>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      setShowClearConfirm(false);
      startNewChat();
      toast.success('All history purged');
    },
    onError: () => toast.error('Failed to clear history'),
  });

  return (
    <div className="flex h-full overflow-hidden bg-white dark:bg-slate-950">
      {/* Workspace Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 lg:relative border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col bg-slate-50 dark:bg-slate-900 lg:bg-slate-50/50 lg:dark:bg-slate-900/20 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:p-0 lg:border-none lg:opacity-0 lg:overflow-hidden"
      )}>
        {/* Search Bar */}
        <div className="relative mb-6 flex items-center gap-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            suppressHydrationWarning
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
          />
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar min-h-0">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 mb-4"
        >
          <Plus size={16} />
          NEW CHAT
        </button>

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

        <div>
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <HistoryIcon size={12} />
              Recent History
              <ChevronDown size={12} className={cn("transition-transform duration-200", isHistoryOpen && "rotate-180")} />
            </button>
            {isHistoryOpen && history.length > 0 && (
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="text-[9px] font-black text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Clear All
              </button>
            )}
          </div>
          {isHistoryOpen && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200 mb-4">
              {isLoadingHistory ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-full h-10 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
                ))
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left hover:bg-white dark:hover:bg-slate-800 transition-all group",
                      chatId === item.id && "bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900"
                    )}
                  >
                    {editingId === item.id ? (
                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 min-w-0"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateTitleMutation.mutate({ id: item.id, title: editTitle });
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => updateTitleMutation.mutate({ id: item.id, title: editTitle })} className="text-emerald-500 hover:text-emerald-600">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => loadHistoryItem(item.id, item.title)}
                          className="flex-1 flex flex-col items-start min-w-0"
                        >
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate w-full group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {item.title}
                          </span>
                          <div className="flex items-center gap-1 text-[9px] text-slate-400">
                            <Clock size={10} />
                            {new Date(item.timestamp).toLocaleDateString()}
                          </div>
                        </button>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          <button
                            onClick={() => { setEditingId(item.id); setEditTitle(item.title); }}
                            className="p-1 hover:text-blue-500 text-slate-400 transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="p-1 hover:text-red-500 text-slate-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 italic px-3">No matching history</p>
              )}
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

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-2xl mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">Purge All History?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
              This will permanently delete all local conversation history for this machine. This action is irreversible.
            </p>
            <div className="flex flex-col gap-3">
              <button
                disabled={clearAllMutation.isPending}
                onClick={() => clearAllMutation.mutate()}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-xl shadow-lg shadow-red-500/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {clearAllMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Purge'}
              </button>
              <button
                disabled={clearAllMutation.isPending}
                onClick={() => setShowClearConfirm(false)}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-black rounded-xl transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}