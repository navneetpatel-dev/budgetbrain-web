'use client';

import { useState, useRef, useEffect, type CSSProperties, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { FormErrorBanner } from '@/shared/components/ui/index';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { BrandMark } from '@/shared/components/brand/BrandMark';
import { AiChatSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { useScreenInsets } from '@/shared/hooks/useScreenInsets';
import { useAiChat } from '../hooks/useAiChat';
import { AiSuggestionChips } from '../components/AiSuggestionChips';
import { AiRichReply } from '../components/AiRichReply';
import { maxLen } from '@/shared/validation/fieldLimits';

const SEND_SIZE = 36;

const BUBBLE_STYLES = {
  user: 'max-w-[80%] px-4 py-3 rounded-2xl rounded-br-[4px] bg-primary text-white text-sm leading-5',
  assistant: 'max-w-[88%] px-4 py-3.5 rounded-2xl rounded-bl-[4px] bg-surfaceHover text-text border border-borderSubtle dark:border-white/10 text-sm leading-5',
} as const;

export function AiCoachPage() {
  const theme = useTheme();
  const { frame } = useScreenInsets();
  const {
    messages,
    send,
    isPending,
    error,
    clearError,
    historyLoading,
    startNewConversation,
  } = useAiChat();
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const canSend = input.trim().length > 0 && !isPending;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = () => {
    if (!canSend) return;
    const value = input;
    setInput('');
    void send(value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const composerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    minHeight: 48,
    padding: '6px 6px 6px 16px',
    borderRadius: 24,
    border: `1px solid ${focused ? theme.colors.primary + '66' : theme.isDark ? 'rgba(255,255,255,0.12)' : theme.colors.border}`,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.inputBg,
    boxSizing: 'border-box',
    transition: `border-color ${theme.motion.duration.base}ms, background-color ${theme.motion.duration.base}ms`,
  };

  const inputStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    resize: 'none',
    background: 'transparent',
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: '22px',
    fontFamily: 'Inter, sans-serif',
    padding: '8px 0',
    maxHeight: 120,
    minHeight: 22,
  };

  const sendBtnStyle: CSSProperties = {
    width: SEND_SIZE,
    height: SEND_SIZE,
    flexShrink: 0,
    borderRadius: SEND_SIZE / 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: canSend ? 'none' : `1px solid ${theme.isDark ? 'rgba(255,255,255,0.14)' : theme.colors.borderSubtle}`,
    background: canSend
      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`
      : theme.isDark
        ? 'rgba(255,255,255,0.12)'
        : theme.colors.surfaceHover,
    cursor: canSend ? 'pointer' : 'default',
    opacity: isPending ? 0.7 : 1,
    padding: 0,
  };

  return (
    <div
      className="h-full flex flex-col bg-background"
      style={{ backgroundColor: theme.colors.background }}
    >
      <ProfileStackHeader
        screen="ai"
        subtitle="Your personal finance assistant"
        actionIcon={messages.length > 0 ? 'add' : undefined}
        actionLabel="New conversation"
        onAction={messages.length > 0 ? startNewConversation : undefined}
      />
      <div
        className="flex-1 overflow-y-auto flex flex-col gap-3"
        style={{
          ...frame,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.md,
        }}
      >
        {historyLoading && <AiChatSkeleton />}
        {!historyLoading && messages.length === 0 && (
          <div
            className="relative rounded-2xl p-6 sm:p-9 text-center overflow-hidden my-auto border border-borderSubtle dark:border-white/10"
            style={{
              backgroundColor: theme.colors.surfaceContainer ?? theme.colors.surface,
              background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.12), rgba(139, 92, 246, 0.08), transparent)',
            }}
          >
            <div className="flex justify-center mb-4">
              <BrandMark size={56} />
            </div>
            <h3 className="m-0 font-sans text-lg font-extrabold text-text tracking-tight">
              Autonomous Financial Intelligence
            </h3>
            <p className="my-2 mx-auto mb-5 text-[13px] text-textSecondary font-sans leading-5 max-w-[360px]">
              Ask anything about your spending habits, cashflow trends, budget limits, or receive actionable wealth optimization tips.
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 bg-black/5 dark:bg-white/5 py-1 px-3 rounded-full text-[11px] font-semibold text-textSecondary">
                <AppIcon name="shield" size={13} color={theme.colors.secondary} />
                <span>Budget Guard</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-black/5 dark:bg-white/5 py-1 px-3 rounded-full text-[11px] font-semibold text-textSecondary">
                <AppIcon name="trendingUp" size={13} color={theme.colors.primary} />
                <span>Run-rate Analysis</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-black/5 dark:bg-white/5 py-1 px-3 rounded-full text-[11px] font-semibold text-textSecondary">
                <AppIcon name="sparkles" size={13} color={theme.colors.violet} />
                <span>Smart Forecasts</span>
              </div>
            </div>
          </div>
        )}
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={i}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={isUser ? BUBBLE_STYLES.user : BUBBLE_STYLES.assistant}
                style={{
                  backgroundColor: isUser ? theme.colors.primary : theme.colors.surfaceHover,
                  color: isUser ? theme.colors.onPrimary : theme.colors.text,
                }}
              >
                {msg.role === 'assistant' ? (
                  <AiRichReply content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          );
        })}
        {isPending && (
          <div className="flex justify-start">
            <div
              className="p-3 px-4 rounded-2xl rounded-bl-[4px] bg-surfaceHover"
              style={{ backgroundColor: theme.colors.surfaceHover }}
            >
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-textTertiary" style={{ backgroundColor: theme.colors.textTertiary }} />
                <span className="w-1.5 h-1.5 rounded-full bg-textTertiary" style={{ backgroundColor: theme.colors.textTertiary }} />
                <span className="w-1.5 h-1.5 rounded-full bg-textTertiary" style={{ backgroundColor: theme.colors.textTertiary }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div
        className="border-t border-borderSubtle bg-background"
        style={{
          ...frame,
          paddingTop: 12,
          paddingBottom: 24,
          borderColor: theme.colors.borderSubtle,
          backgroundColor: theme.colors.background,
        }}
      >
        {error ? (
          <div className="mb-2 cursor-pointer" onClick={clearError}>
            <FormErrorBanner message={error} />
          </div>
        ) : null}
        {!historyLoading ? (
          <AiSuggestionChips
            mode={messages.length === 0 ? 'starter' : 'followup'}
            disabled={isPending}
            onSelect={(prompt) => {
              clearError();
              void send(prompt);
            }}
          />
        ) : null}
        <div style={composerStyle}>
          <textarea
            value={input}
            onChange={(e) => {
              clearError();
              setInput(e.target.value);
              e.currentTarget.style.height = '22px';
              e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 120)}px`;
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onKeyDown}
            placeholder="Ask about your finances..."
            rows={1}
            maxLength={maxLen('aiMessage')}
            disabled={isPending}
            aria-label="Chat message"
            style={inputStyle}
          />
          <motion.button
            type="button"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            whileHover={canSend ? { scale: 1.05 } : undefined}
            whileTap={canSend ? { scale: 0.95 } : undefined}
            transition={{ duration: theme.motion.duration.fast / 1000, ease: theme.motion.easing }}
            style={sendBtnStyle}
          >
            <AppIcon name="chevronRight" size={18} color={canSend ? theme.colors.onPrimary : theme.colors.textSecondary} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
