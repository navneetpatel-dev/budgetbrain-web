import { useState, useRef, useEffect, type CSSProperties, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { Card, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { AiChatSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { useScreenInsets } from '@/shared/hooks/useScreenInsets';
import { useAiChat } from '../hooks/useAiChat';
import { maxLen } from '@/shared/validation/fieldLimits';

const SEND_SIZE = 36;
const SUGGESTIONS = ['How am I spending?', 'Where can I save?', 'Budget advice', 'Investment tips'];

export function AiCoachPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { frame } = useScreenInsets();
  const {
    messages,
    send,
    isPending,
    isPremium,
    error,
    clearError,
    historyLoading,
    startNewConversation,
  } = useAiChat();
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const canSend = input.trim().length > 0 && !isPending;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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

  if (!isPremium) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.colors.background }}>
        <ProfileStackHeader screen="ai" subtitle="Premium feature" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', ...frame, paddingBottom: theme.spacing.xxl }}>
          <Card variant="elevated" style={{ textAlign: 'center', maxWidth: 320 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.primarySoft,
              border: `1px solid ${theme.colors.primary}28`,
              margin: '0 auto 16px',
            }}>
              <AppIcon name="ai" size={26} color={theme.colors.primary} />
            </div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, color: theme.colors.text, margin: 0 }}>Unlock AI Coach</h3>
            <p style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 8, fontFamily: 'Inter, sans-serif', lineHeight: '20px' }}>
              Upgrade to Premium for personalized AI-powered financial insights and guidance.
            </p>
            <div style={{ marginTop: 16 }}><Button title="Upgrade to Premium" onPress={() => navigate('/subscription')} size="lg" /></div>
          </Card>
        </div>
      </div>
    );
  }

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
    transition: 'border-color 0.2s, background-color 0.2s',
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.colors.background }}>
      <ProfileStackHeader
        screen="ai"
        subtitle="Your personal finance assistant"
        actionIcon={messages.length > 0 ? 'add' : undefined}
        actionLabel="New conversation"
        onAction={messages.length > 0 ? startNewConversation : undefined}
      />
      <div style={{ flex: 1, overflowY: 'auto', ...frame, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.md, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {historyLoading && <AiChatSkeleton />}
        {!historyLoading && messages.length === 0 && (
          <Card variant="elevated" style={{ textAlign: 'center', padding: theme.spacing.xl }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.primarySoft,
              border: `1px solid ${theme.colors.primary}28`,
              margin: '0 auto 14px',
            }}>
              <AppIcon name="ai" size={24} color={theme.colors.primary} />
            </div>
            <h3 style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 700, color: theme.colors.text }}>
              Ask your AI Coach
            </h3>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif', lineHeight: '18px' }}>
              Get insights on spending, savings, and budgets.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: theme.radii.full,
                    cursor: 'pointer',
                    backgroundColor: theme.colors.primarySoft,
                    color: theme.colors.primary,
                    border: `1px solid ${theme.colors.primary}33`,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: theme.radii.lg,
              backgroundColor: msg.role === 'user' ? theme.colors.primary : theme.colors.surfaceHover,
              color: msg.role === 'user' ? theme.colors.onPrimary : theme.colors.text,
              fontSize: 14,
              lineHeight: '20px',
              fontFamily: 'Inter, sans-serif',
              borderBottomRightRadius: msg.role === 'user' ? 4 : theme.radii.lg,
              borderBottomLeftRadius: msg.role === 'assistant' ? 4 : theme.radii.lg,
            }}>{msg.content}</div>
          </div>
        ))}
        {isPending && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '12px 16px', borderRadius: theme.radii.lg, backgroundColor: theme.colors.surfaceHover, borderBottomLeftRadius: 4 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.colors.textTertiary }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.colors.textTertiary }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.colors.textTertiary }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ ...frame, paddingTop: 12, paddingBottom: 24, borderTop: `1px solid ${theme.colors.borderSubtle}`, backgroundColor: theme.colors.background }}>
        {error ? (
          <div style={{ marginBottom: 8 }} onClick={clearError}>
            <FormErrorBanner message={error} />
          </div>
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
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            style={sendBtnStyle}
          >
            <AppIcon name="chevronRight" size={18} color={canSend ? theme.colors.onPrimary : theme.colors.textSecondary} />
          </button>
        </div>
      </div>
    </div>
  );
}
