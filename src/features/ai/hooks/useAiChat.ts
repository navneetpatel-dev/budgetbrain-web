import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/shared/services/api';
import { useAppSelector } from '@/shared/store/hooks';
import type { AiChatMessage, AiChatResponse } from '@/shared/types';

export function useAiChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const user = useAppSelector((s) => s.auth.user);
  const isPremium = user?.role === 'premium' || user?.role === 'lifetime' || user?.role === 'admin';

  const mutation = useMutation({
    mutationFn: (data: { message: string; conversationId?: string }) =>
      apiPost<AiChatResponse>('/ai/chat', data),
    onSuccess: (data) => {
      if (!conversationId && data.conversationId) setConversationId(data.conversationId);
      setMessages((prev) => [...prev, data.message]);
    },
  });

  const send = useCallback((input: string) => {
    if (!input.trim()) return;
    const userMsg: AiChatMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    mutation.mutate({ message: input, conversationId });
  }, [conversationId, mutation]);

  return { messages, send, isPending: mutation.isPending, isPremium };
}
