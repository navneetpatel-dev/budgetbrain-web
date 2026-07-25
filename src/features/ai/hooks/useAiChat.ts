import { useState, useCallback, useEffect, useRef } from 'react';
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

function visibleMessages(messages: AiChatMessage[] | null | undefined): AiChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages.filter((m) => m.role === 'user' || m.role === 'assistant');
}

export function useAiChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seededFromId = useRef<string | null>(null);
  const user = useAppSelector((s) => s.auth.user);
  const isPremium = user?.role === 'premium' || user?.role === 'lifetime' || user?.role === 'admin';

  const {
    data: conversationSummaries,
    isLoading: conversationsLoading,
    isFetched: conversationsFetched,
  } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => apiGet<AiConversationSummary[]>('/ai/conversations'),
    enabled: isPremium,
    retry: false,
  });

  const latestConversationId = conversationSummaries?.[0]?.id;

  const {
    data: latestConversation,
    isLoading: conversationLoading,
    isFetched: conversationFetched,
    isError: conversationError,
  } = useQuery({
    queryKey: ['ai-conversation', latestConversationId],
    queryFn: () => apiGet<AiConversation>(`/ai/conversations/${latestConversationId}`),
    enabled: isPremium && !!latestConversationId,
    retry: false,
  });

  // Seed chat from the latest saved conversation once per conversation id
  useEffect(() => {
    if (!isPremium) {
      seededFromId.current = null;
      setConversationId(undefined);
      setMessages([]);
      return;
    }
    if (!latestConversation?.id) return;
    if (seededFromId.current === latestConversation.id) return;

    seededFromId.current = latestConversation.id;
    setConversationId(latestConversation.id);
    setMessages(visibleMessages(latestConversation.messages));
  }, [isPremium, latestConversation]);

  const historyLoading =
    isPremium &&
    (!conversationsFetched ||
      conversationsLoading ||
      (!!latestConversationId && !conversationFetched && conversationLoading) ||
      (!!latestConversationId && !conversationFetched && !conversationError && !latestConversation));

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
      seededFromId.current = data.conversationId;
      setMessages(visibleMessages(data.messages));
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError(getApiErrorMessage(err, 'Could not send message'));
    } finally {
      setIsPending(false);
    }
  }, [conversationId, isPending]);

  const startNewConversation = useCallback(() => {
    seededFromId.current = null;
    setConversationId(undefined);
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    send,
    isPending,
    isPremium,
    error,
    clearError,
    historyLoading,
    startNewConversation,
  };
}
