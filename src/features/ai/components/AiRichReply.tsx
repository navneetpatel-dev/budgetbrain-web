import type { CSSProperties } from 'react';
import { useTheme } from '@/shared/theme';
import { parseCoachReply, renderInlineEmphasis } from '../utils/parseCoachReply';

function EmphasizedText({
  text,
  style,
}: {
  text: string;
  style: CSSProperties;
}) {
  return (
    <span style={style}>
      {renderInlineEmphasis(text).map((part, i) =>
        part.bold ? (
          <strong key={i} style={{ fontWeight: 700 }}>
            {part.text}
          </strong>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </span>
  );
}

export function AiRichReply({ content }: { content: string }) {
  const theme = useTheme();
  const blocks = parseCoachReply(content);

  if (!blocks.length) {
    return (
      <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: '21px', fontFamily: 'Inter, sans-serif' }}>
        {content}
      </div>
    );
  }

  const wrap: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <div style={wrap}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <div
              key={i}
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
                color: theme.colors.textTertiary,
              }}
            >
              {block.text}
            </div>
          );
        }

        if (block.type === 'list') {
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '10px 12px',
                borderRadius: 12,
                backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.background,
                border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
              }}
            >
              {block.items.map((item, j) => (
                <div
                  key={j}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, minWidth: 0 }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        marginTop: 7,
                        flexShrink: 0,
                        backgroundColor: theme.colors.primary,
                        opacity: 0.75,
                      }}
                    />
                    {item.label ? (
                      <span style={{ fontSize: 13, color: theme.colors.textSecondary, lineHeight: '20px' }}>
                        {item.label}
                      </span>
                    ) : (
                      <EmphasizedText
                        text={item.value}
                        style={{ fontSize: 13, color: theme.colors.text, lineHeight: '20px' }}
                      />
                    )}
                  </div>
                  {item.label ? (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: theme.colors.text,
                        lineHeight: '20px',
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {item.value}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          );
        }

        return (
          <EmphasizedText
            key={i}
            text={block.text}
            style={{ fontSize: 14, lineHeight: '21px', color: theme.colors.text }}
          />
        );
      })}
    </div>
  );
}
