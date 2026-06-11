'use client';

import { useState } from 'react';
import { ChatMessage, QueryMode } from '@/types/api';
import { docsService } from '@/services/docs.service';
import { v4 as uuidv4 } from 'uuid';
import { getMachineId } from '@/lib/machine-id';
import { useQueryClient } from '@tanstack/react-query';

export function useChat() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string>('New Conversation');

  const sendMessage = async (question: string, mode: QueryMode = 'answer') => {
    if (!question.trim()) return;

    const currentChatId = chatId || uuidv4();
    if (!chatId) setChatId(currentChatId);

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Pass explicit timeout and retries for inference
      const response = await docsService.query({ question, mode }, { 
        timeout: 45000, 
        retries: 1 
      });
      
      const assistantMsg: ChatMessage = {
        id: response.correlationId || uuidv4(),
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        metadata: response.metadata,
        score: response.score,
        timestamp: Date.now(),
      };

      let updatedMessages: ChatMessage[] = [];
      
      setMessages((prev) => {
        // Ensure we don't duplicate the user message if already added
        const base = prev.some(m => m.id === userMsg.id) ? prev : [...prev, userMsg];
        updatedMessages = [...base, assistantMsg];
        return updatedMessages;
      });

      // Generate title if it's the first message
      let finalTitle = chatTitle;
      
      // If this is the start of a new thread, generate a summary title
      if (messages.length === 0 && !chatId) {
        // Store current machine ID in local storage for session tracking
        localStorage.setItem('askdocs_current_chat_id', currentChatId);
        
        const titleResponse = await docsService.query({
          question: `Summarize this question into a 3-5 word title: "${question}"`,
          mode: 'summarize'
        });
        finalTitle = titleResponse.answer.replace(/["']/g, '').trim() || question.slice(0, 30);
        setChatTitle(finalTitle);
      }

      // Persist to SQLite history
      if (updatedMessages.length > 0) {
        await docsService.saveConversation(currentChatId, finalTitle, updatedMessages);
      }
      
      // Invalidate history query to refresh the sidebar
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });

    } catch (error) {
      // Global error notifications (toasts) are handled by apiClient.
      // We catch here to ensure the loading state is resolved.
    } finally {
      setIsLoading(false);
    }
  };

  const loadChat = (id: string, title: string, history: ChatMessage[]) => {
    setChatId(id);
    setChatTitle(title);
    setMessages(history);
  };

  const startNewChat = () => {
    setChatId(null);
    setChatTitle('New Conversation');
    setMessages([]);
  };

  const clearMessages = () => setMessages([]);

  return { 
    messages, sendMessage, isLoading, clearMessages, 
    chatId, chatTitle, loadChat, startNewChat 
  };
}