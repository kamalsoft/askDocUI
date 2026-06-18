'use client';

import { useState, useEffect } from 'react';
import { ChatMessage, QueryMode } from '@/types/api';
import { docsService } from '@/services/docs.service';
import { chatService } from '@/services/chat.service';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

export function useChat(activeChatId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Load conversation on mount/id change
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const loadConversation = async () => {
      try {
        setIsLoading(true);
        const data = await chatService.getConversation(activeChatId);
        if (data && data.messages) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error('Failed to load conversation history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [activeChatId]);

  const sendMessage = async (question: string, mode: QueryMode = 'answer') => {
    if (!question.trim()) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    };

    // Determine target chatId
    const currentChatId = activeChatId || uuidv4();
    const isNewChat = !activeChatId;

    // Build the updated messages array
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
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
        content: response.answer || 'No response received from the model.',
        citations: response.citations || [],
        metadata: response.metadata || {},
        score: response.score ?? 0,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      // Save conversation in DB
      const title = isNewChat 
        ? (question.length > 30 ? question.slice(0, 30) + '...' : question)
        : undefined; 
        
      await chatService.saveConversation(currentChatId, title || 'Conversation', finalMessages);

      if (isNewChat) {
        // Redirect to the new chat page
        router.push(`/chat/${currentChatId}`);
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'System Error: Unable to connect to the inference engine. Please check if the backend service is running.',
        citations: [],
        metadata: { error: true } as any,
        score: 0,
        timestamp: Date.now(),
      };
      
      const finalMessagesWithErr = [...updatedMessages, errorMsg];
      setMessages(finalMessagesWithErr);
      
      // Save even the conversation with error to let user retry/view it
      await chatService.saveConversation(currentChatId, isNewChat ? question.slice(0, 30) + '...' : 'Conversation', finalMessagesWithErr);
      
      if (isNewChat) {
        router.push(`/chat/${currentChatId}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    router.push('/chat');
  };

  const clearMessages = () => setMessages([]);

  return { messages, sendMessage, isLoading, clearMessages, startNewChat };
}