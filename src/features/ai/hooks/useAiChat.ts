import { useState, useCallback } from 'react';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { useAppSelector } from '@/shared/store/hooks';
import type { AiChatMessage, AiChatResponse } from '@/shared/types';

const AI_CHAT_TIMEOUT_MS = 60000;

export function useAiChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAppSelector((s) => s.auth.user);
  const isPremium = user?.role === 'premium' || user?.role === 'lifetime' || user?.role === 'admin';

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
      if (!conversationId && data.conversationId) setConversationId(data.conversationId);
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError(getApiErrorMessage(err, 'Could not send message'));
    } finally {
      setIsPending(false);
    }
  }, [conversationId, isPending]);

  return { messages, send, isPending, isPremium, error, clearError };
}
