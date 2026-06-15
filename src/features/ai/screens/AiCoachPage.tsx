import { useState, useRef, useEffect } from 'react';
import { FeatureHeader } from '@/shared/components/ui/feature-screen';
import { Card, Button } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useAiChat } from '../hooks/useAiChat';

export function AiCoachPage() {
  const theme = useTheme();
  const { messages, send, isPending, isPremium } = useAiChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!isPremium) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.colors.background }}>
        <FeatureHeader title="AI Coach" subtitle="Premium feature" icon="sparkles" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Card variant="elevated" style={{ textAlign: 'center', maxWidth: 320 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft, margin: '0 auto 16px' }}><span style={{ fontSize: 24 }}>✨</span></div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, color: theme.colors.text, margin: 0 }}>Unlock AI Coach</h3>
            <p style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 8, fontFamily: 'Inter, sans-serif', lineHeight: '20px' }}>Upgrade to Premium to get personalized AI-powered financial insights and guidance.</p>
            <div style={{ marginTop: 16 }}><Button title="Upgrade to Premium" onPress={() => {}} size="lg" /></div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.colors.background }}>
      <FeatureHeader title="AI Coach" subtitle="Your personal finance assistant" icon="sparkles" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720, margin: '0 auto', width: '100%' }}>
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
      <div style={{ padding: '12px 16px 24px', borderTop: `1px solid ${theme.colors.borderSubtle}`, backgroundColor: theme.colors.background, maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { send(input); setInput(''); } }} placeholder="Ask about your finances..." style={{ flex: 1, padding: '12px 16px', borderRadius: theme.radii.lg, border: `1.5px solid ${theme.colors.borderSubtle}`, backgroundColor: theme.colors.inputBg, color: theme.colors.text, fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
          <button onClick={() => { send(input); setInput(''); }} disabled={!input.trim() || isPending} style={{ width: 44, height: 44, borderRadius: theme.radii.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`, border: 'none', cursor: 'pointer', opacity: input.trim() ? 1 : 0.5 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.colors.onPrimary} strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg></button>
        </div>
      </div>
    </div>
  );
}
