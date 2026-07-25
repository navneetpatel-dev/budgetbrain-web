import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

function conversationFingerprint(messages: AiChatMessage[]): string {
  if (!messages.length) return '0';
  const last = messages[messages.length - 1];
  return `${messages.length}:${last.timestamp}:${last.content.length}`;
}

export function useAiChat() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seededFingerprint = useRef<string | null>(null);
  const skipAutoSeed = useRef(false);
  const user = useAppSelector((s) => s.auth.user);
  const authenticated = !!user;

  const {
    data: conversationSummaries,
    isLoading: conversationsLoading,
    isFetched: conversationsFetched,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => apiGet<AiConversationSummary[]>('/ai/conversations'),
    enabled: authenticated,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
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
    enabled: authenticated && !!latestConversationId,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Reload latest conversation whenever this screen mounts (leave → return)
  useEffect(() => {
    if (!authenticated) return;
    skipAutoSeed.current = false;
    void (async () => {
      const list = await refetchConversations();
      const id = list.data?.[0]?.id;
      if (!id) return;
      await queryClient.fetchQuery({
        queryKey: ['ai-conversation', id],
        queryFn: () => apiGet<AiConversation>(`/ai/conversations/${id}`),
      });
    })();
  }, [authenticated, queryClient, refetchConversations]);

  useEffect(() => {
    if (skipAutoSeed.current) return;
    if (!latestConversation?.id) return;

    const incoming = visibleMessages(latestConversation.messages);
    const fingerprint = `${latestConversation.id}:${conversationFingerprint(incoming)}`;
    if (seededFingerprint.current === fingerprint) return;

    seededFingerprint.current = fingerprint;
    setConversationId(latestConversation.id);
    setMessages(incoming);
  }, [latestConversation]);

  const historyLoading =
    authenticated &&
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
    skipAutoSeed.current = false;
    setMessages((prev) => [...prev, userMsg]);

    try {
      const data = await apiPost<AiChatResponse>(
        '/ai/chat',
        { message: content, conversationId },
        { timeout: AI_CHAT_TIMEOUT_MS }
      );
      const nextMessages = visibleMessages(data.messages);
      const now = new Date().toISOString();

      setConversationId(data.conversationId);
      setMessages(nextMessages);
      seededFingerprint.current = `${data.conversationId}:${conversationFingerprint(nextMessages)}`;

      queryClient.setQueryData<AiConversation>(['ai-conversation', data.conversationId], (prev) => ({
        id: data.conversationId,
        title: prev?.title ?? 'Conversation',
        createdAt: prev?.createdAt ?? now,
        updatedAt: now,
        messages: nextMessages,
      }));
      await queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError(getApiErrorMessage(err, 'Could not send message'));
    } finally {
      setIsPending(false);
    }
  }, [conversationId, isPending, queryClient]);

  const startNewConversation = useCallback(() => {
    skipAutoSeed.current = true;
    seededFingerprint.current = null;
    setConversationId(undefined);
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    send,
    isPending,
    error,
    clearError,
    historyLoading,
    startNewConversation,
  };
}
