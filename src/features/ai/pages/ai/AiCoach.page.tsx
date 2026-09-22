'use client';

import { useState, useRef, useEffect, type CSSProperties, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ProfileStackHeader } from '@/features/settings';
import { FormErrorBanner } from '@/shared/components/ui/index';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { BrandMark } from '@/shared/components/brand/BrandMark';
import { AiChatSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { useScreenInsets } from '@/shared/hooks/useScreenInsets';
import { useAiChat } from '../../hooks/ai/useAiChat.hook';
import { AiSuggestionChips } from '../../components/ai/AiSuggestionChips.component';
import { AiRichReply } from '../../components/ai/AiRichReply.component';
import { AiInsightCard } from '../../components/ai/AiInsightCard.component';
import { AiAnomalyCard, AiAnomalyClear } from '../../components/ai/AiAnomalyCard.component';
import { formatCurrency } from '@/shared/utils/currency';
import { maxLen } from '@/shared/validation/fieldLimits';
import { aiCoachStyles } from '../../styles/ai/aiCoach.styles';

const SEND_SIZE = 36;

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
    insights,
    anomalies,
    currency,
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
      className={aiCoachStyles.screen}
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
        className={aiCoachStyles.transcript}
        style={{
          ...frame,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.md,
        }}
      >
        {historyLoading && <AiChatSkeleton />}
        {!historyLoading && messages.length === 0 && (
          <div
            className={aiCoachStyles.emptyHero}
            style={{
              backgroundColor: theme.colors.surfaceContainer ?? theme.colors.surface,
              background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.12), rgba(139, 92, 246, 0.08), transparent)',
            }}
          >
            <div className={aiCoachStyles.heroMark}>
              <BrandMark size={56} />
            </div>
            <h3 className={aiCoachStyles.heroTitle}>
              Autonomous Financial Intelligence
            </h3>
            <p className={aiCoachStyles.heroCopy}>
              Ask anything about your spending habits, cashflow trends, budget limits, or receive actionable wealth optimization tips.
            </p>

            <div className={aiCoachStyles.chipRow}>
              <div className={aiCoachStyles.chip}>
                <AppIcon name="shield" size={13} color={theme.colors.secondary} />
                <span>Budget Guard</span>
              </div>
              <div className={aiCoachStyles.chip}>
                <AppIcon name="trendingUp" size={13} color={theme.colors.primary} />
                <span>Run-rate Analysis</span>
              </div>
              <div className={aiCoachStyles.chip}>
                <AppIcon name="sparkles" size={13} color={theme.colors.violet} />
                <span>Smart Forecasts</span>
              </div>
            </div>
          </div>
        )}

        {!historyLoading && messages.length === 0 && (
          <div className={aiCoachStyles.stack}>
            {insights && insights.insights.length > 0 && (
              <div className={aiCoachStyles.stackTight}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: theme.colors.textSecondary,
                    paddingLeft: 4,
                  }}
                >
                  Spending Insights
                </span>
                <div className={aiCoachStyles.stackTight}>
                  {insights.insights.map((text, i) => (
                    <AiInsightCard key={i} text={text} />
                  ))}
                </div>
              </div>
            )}

            <div className={aiCoachStyles.stackTight}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: theme.colors.textSecondary,
                  paddingLeft: 4,
                }}
              >
                Anomaly Detection
              </span>
              {anomalies && anomalies.anomalies.length > 0 ? (
                <div className={aiCoachStyles.stackTight}>
                  {anomalies.anomalies.map((a, i) => {
                    const parts: string[] = [];
                    if (a.merchant) parts.push(a.merchant);
                    if (typeof a.amount === 'number') parts.push(formatCurrency(a.amount, currency));
                    return (
                      <AiAnomalyCard
                        key={a.transactionId ?? a.recurringSeriesId ?? i}
                        type={a.type}
                        reason={a.reason}
                        meta={parts.length > 0 ? parts.join(' · ') : undefined}
                      />
                    );
                  })}
                </div>
              ) : (
                <AiAnomalyClear />
              )}
            </div>
          </div>
        )}
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={i}
              className={isUser ? aiCoachStyles.userRow : aiCoachStyles.assistantRow}
            >
              <div
                className={isUser ? aiCoachStyles.userBubble : aiCoachStyles.assistantBubble}
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
          <div className={aiCoachStyles.pendingRow}>
            <div
              className={aiCoachStyles.pendingBubble}
              style={{ backgroundColor: theme.colors.surfaceHover }}
            >
              <div className={aiCoachStyles.pendingDots}>
                <span className={aiCoachStyles.pendingDot} style={{ backgroundColor: theme.colors.textTertiary }} />
                <span className={aiCoachStyles.pendingDot} style={{ backgroundColor: theme.colors.textTertiary }} />
                <span className={aiCoachStyles.pendingDot} style={{ backgroundColor: theme.colors.textTertiary }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div
        className={aiCoachStyles.composer}
        style={{
          ...frame,
          paddingTop: 12,
          paddingBottom: 24,
          borderColor: theme.colors.borderSubtle,
          backgroundColor: theme.colors.background,
        }}
      >
        {error ? (
          <div className={aiCoachStyles.errorRow} onClick={clearError}>
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
