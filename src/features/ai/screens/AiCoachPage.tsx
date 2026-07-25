import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { Card, Button, fieldControlStyle, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useScreenInsets } from '@/shared/hooks/useScreenInsets';
import { useAiChat } from '../hooks/useAiChat';

export function AiCoachPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { frame } = useScreenInsets();
  const { messages, send, isPending, isPremium, error, clearError } = useAiChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!isPremium) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.colors.background }}>
        <ProfileStackHeader screen="ai" subtitle="Premium feature" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', ...frame, paddingBottom: theme.spacing.xxl }}>
          <Card variant="elevated" style={{ textAlign: 'center', maxWidth: 320 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft, margin: '0 auto 16px' }}><span style={{ fontSize: 24 }}>✨</span></div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, color: theme.colors.text, margin: 0 }}>Unlock AI Coach</h3>
            <p style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 8, fontFamily: 'Inter, sans-serif', lineHeight: '20px' }}>Upgrade to Premium to get personalized AI-powered financial insights and guidance.</p>
            <div style={{ marginTop: 16 }}><Button title="Upgrade to Premium" onPress={() => navigate('/subscription')} size="lg" /></div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.colors.background }}>
      <ProfileStackHeader screen="ai" subtitle="Your personal finance assistant" />
      <div style={{ flex: 1, overflowY: 'auto', ...frame, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.md, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontSize: 14, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>Ask me anything about your finances. Try:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 12 }}>
              {['How am I spending?', 'Where can I save?', 'Budget advice', 'Investment tips'].map((q) => (
                <button key={q} onClick={() => send(q)} style={{ padding: '8px 14px', borderRadius: theme.radii.full, cursor: 'pointer', backgroundColor: theme.colors.primarySoft, color: theme.colors.primary, border: `1px solid ${theme.colors.primary}33`, fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: theme.radii.lg, backgroundColor: msg.role === 'user' ? theme.colors.primary : theme.colors.surfaceHover, color: msg.role === 'user' ? theme.colors.onPrimary : theme.colors.text, fontSize: 14, lineHeight: '20px', fontFamily: 'Inter, sans-serif', borderBottomRightRadius: msg.role === 'user' ? 4 : theme.radii.lg, borderBottomLeftRadius: msg.role === 'assistant' ? 4 : theme.radii.lg }}>{msg.content}</div>
          </div>
        ))}
        {isPending && <div style={{ display: 'flex', justifyContent: 'flex-start' }}><div style={{ padding: '12px 16px', borderRadius: theme.radii.lg, backgroundColor: theme.colors.surfaceHover, borderBottomLeftRadius: 4 }}><div style={{ display: 'flex', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.colors.textTertiary }} /><span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.colors.textTertiary }} /><span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.colors.textTertiary }} /></div></div></div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ ...frame, paddingTop: 12, paddingBottom: 24, borderTop: `1px solid ${theme.colors.borderSubtle}`, backgroundColor: theme.colors.background }}>
        {error ? (
          <div style={{ marginBottom: 8 }} onClick={clearError}>
            <FormErrorBanner message={error} />
          </div>
        ) : null}
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={input} onChange={(e) => { clearError(); setInput(e.target.value); }} onKeyDown={(e) => { if (e.key === 'Enter') { send(input); setInput(''); } }} placeholder="Ask about your finances..." style={fieldControlStyle(theme, { flex: 1, fontSize: 14 })} />
          <button onClick={() => { send(input); setInput(''); }} disabled={!input.trim() || isPending} style={{ width: 44, height: 44, borderRadius: theme.radii.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`, border: 'none', cursor: 'pointer', opacity: input.trim() ? 1 : 0.5 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.colors.onPrimary} strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg></button>
        </div>
      </div>
    </div>
  );
}
