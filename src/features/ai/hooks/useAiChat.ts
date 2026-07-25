import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { useAppSelector } from '@/shared/store/hooks';
import type {
  AiChatMessage,
  AiChatResponse,
  AiConversation,
  AiConversationSummary,
} from '@/shared/types';

const AI_CHAT_TIMEOUT_MS = 60000;

function visibleMessages(messages: AiChatMessage[]): AiChatMessage[] {
  return messages.filter((m) => m.role === 'user' || m.role === 'assistant');
}

export function useAiChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const isPremium = user?.role === 'premium' || user?.role === 'lifetime' || user?.role === 'admin';

  const { data: conversationSummaries, isLoading: conversationsLoading } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => apiGet<AiConversationSummary[]>('/ai/conversations'),
    enabled: isPremium,
    retry: false,
  });

  const latestConversationId = conversationSummaries?.[0]?.id;

  const { data: latestConversation, isLoading: conversationLoading } = useQuery({
    queryKey: ['ai-conversation', latestConversationId],
    queryFn: () => apiGet<AiConversation>(`/ai/conversations/${latestConversationId}`),
    enabled: isPremium && !!latestConversationId && !historyLoaded,
    retry: false,
  });

  useEffect(() => {
    if (!isPremium || conversationsLoading) return;
    if (!latestConversationId) {
      setHistoryLoaded(true);
    }
  }, [isPremium, conversationsLoading, latestConversationId]);

  useEffect(() => {
    if (!latestConversationId || historyLoaded) return;
    if (latestConversation) {
      setConversationId(latestConversation.id);
      setMessages(visibleMessages(latestConversation.messages));
      setHistoryLoaded(true);
      return;
    }
    if (!conversationLoading) {
      setHistoryLoaded(true);
    }
  }, [latestConversationId, latestConversation, conversationLoading, historyLoaded]);

  useEffect(() => {
    if (!isPremium) {
      setHistoryLoaded(false);
      setConversationId(undefined);
      setMessages([]);
    }
  }, [isPremium]);

  const clearError = useCallback(() => setError(null), []);

  const send = useCallback(async (input: string) => {
    if (!input.trim() || isPending) return;
    const content = input.trim();
    const userMsg: AiChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setError(null);
    setIsPending(true);
    setMessages((prev) => [...prev, userMsg]);

    try {
      const data = await apiPost<AiChatResponse>(
        '/ai/chat',
        { message: content, conversationId },
        { timeout: AI_CHAT_TIMEOUT_MS }
      );
      setConversationId(data.conversationId);
      setMessages(visibleMessages(data.messages));
      setHistoryLoaded(true);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError(getApiErrorMessage(err, 'Could not send message'));
    } finally {
      setIsPending(false);
    }
  }, [conversationId, isPending]);

  return {
    messages,
    send,
    isPending,
    isPremium,
    error,
    clearError,
    historyLoading: isPremium && !historyLoaded,
  };
}
