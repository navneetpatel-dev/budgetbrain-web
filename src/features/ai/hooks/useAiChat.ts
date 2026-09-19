import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { apiGet, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { useAppSelector } from '@/shared/store/hooks';
import type {
  AiAnomaly,
  AiChatMessage,
  AiChatResponse,
  AiConversation,
  AiConversationSummary,
  AiInsight,
} from '@/shared/types';

const AI_CHAT_TIMEOUT_MS = 60000;

function visibleMessages(messages: AiChatMessage[] | null | undefined): AiChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages.filter((m) => m.role === 'user' || m.role === 'assistant');
}

function apiErrorCode(err: unknown): string | undefined {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { error?: { code?: string } } | undefined)?.error?.code;
  }
  return undefined;
}

function asConversationList(data: unknown): AiConversationSummary[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { conversations?: unknown }).conversations)) {
    return (data as { conversations: AiConversationSummary[] }).conversations;
  }
  return [];
}

export function useAiChat() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const draftNewChat = useRef(false);
  const messagesCountRef = useRef(0);
  const user = useAppSelector((s) => s.auth.user);
  const currency = user?.currency ?? 'INR';
  const authenticated = !!user;

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => apiGet<AiInsight>('/ai/insights'),
    enabled: authenticated,
    retry: false,
  });

  const { data: anomalies, isLoading: anomaliesLoading } = useQuery({
    queryKey: ['ai-anomalies'],
    queryFn: () => apiGet<{ anomalies: AiAnomaly[] }>('/ai/anomalies'),
    enabled: authenticated,
    retry: false,
  });

  useEffect(() => {
    messagesCountRef.current = messages.length;
  }, [messages.length]);

  const loadLatestConversation = useCallback(async () => {
    if (!authenticated) {
      setHistoryLoading(false);
      return;
    }
    if (messagesCountRef.current === 0) setHistoryLoading(true);

    try {
      const list = asConversationList(
        await apiGet<AiConversationSummary[] | { conversations: AiConversationSummary[] }>('/ai/conversations'),
      );
      queryClient.setQueryData(['ai-conversations'], list);

      const latestId = list[0]?.id;
      if (!latestId) {
        if (!draftNewChat.current) {
          setConversationId(undefined);
          setMessages([]);
        }
        return;
      }

      const conversation = await apiGet<AiConversation>(`/ai/conversations/${latestId}`);
      queryClient.setQueryData(['ai-conversation', latestId], conversation);

      if (draftNewChat.current) return;

      setConversationId(conversation.id);
      setMessages(visibleMessages(conversation.messages));
    } catch (err) {
      if (messagesCountRef.current === 0) {
        setError(getApiErrorMessage(err, 'Could not load conversation'));
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [authenticated, queryClient]);

  // Reload whenever the AI route is entered
  useEffect(() => {
    if (pathname !== '/ai') return;
    draftNewChat.current = false;
    void loadLatestConversation();
  }, [pathname, loadLatestConversation]);

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
    draftNewChat.current = false;
    setMessages((prev) => [...prev, userMsg]);

    try {
      const data = await apiPost<AiChatResponse>(
        '/ai/chat',
        { message: content, conversationId },
        { timeout: AI_CHAT_TIMEOUT_MS },
      );
      const nextMessages = visibleMessages(data.messages);
      const now = new Date().toISOString();

      setConversationId(data.conversationId);
      setMessages(nextMessages);

      queryClient.setQueryData<AiConversation>(['ai-conversation', data.conversationId], (prev) => ({
        id: data.conversationId,
        title: prev?.title ?? 'Conversation',
        createdAt: prev?.createdAt ?? now,
        updatedAt: now,
        messages: nextMessages,
      }));
      queryClient.setQueryData<AiConversationSummary[]>(['ai-conversations'], (prev) => {
        const existing = (prev ?? []).find((c) => c.id === data.conversationId);
        const rest = (prev ?? []).filter((c) => c.id !== data.conversationId);
        return [
          {
            id: data.conversationId,
            title: existing?.title ?? 'Conversation',
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          },
          ...rest,
        ];
      });
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      if (apiErrorCode(err) === 'AI_QUOTA_EXCEEDED') {
        setError("You've used all your AI messages for this month. Upgrade for a higher monthly limit, or try again next month.");
      } else {
        setError(getApiErrorMessage(err, 'Could not send message'));
      }
    } finally {
      setIsPending(false);
    }
  }, [conversationId, isPending, queryClient]);

  const startNewConversation = useCallback(() => {
    draftNewChat.current = true;
    setConversationId(undefined);
    setMessages([]);
    setError(null);
    setHistoryLoading(false);
  }, []);

  return {
    messages,
    send,
    isPending,
    error,
    clearError,
    historyLoading,
    startNewConversation,
    insights,
    anomalies,
    insightsLoading,
    anomaliesLoading,
    currency,
  };
}
