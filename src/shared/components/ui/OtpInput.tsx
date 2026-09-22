'use client';

import { useEffect, useMemo, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { useTheme } from '@/shared/theme';
import type { CSSProperties } from 'react';

const OTP_LENGTH = 6;

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function OtpInput({
  label = 'Verification code',
  value,
  onChange,
  onComplete,
  error,
  disabled,
  autoFocus,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const theme = useTheme();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(() => {
    const chars = onlyDigits(value).slice(0, OTP_LENGTH).split('');
    while (chars.length < OTP_LENGTH) chars.push('');
    return chars;
  }, [value]);

  useEffect(() => {
    if (!autoFocus || disabled) return;
    inputsRef.current[0]?.focus();
  }, [autoFocus, disabled]);

  const setDigit = (index: number, digit: string) => {
    const next = [...digits];
    next[index] = digit;
    const code = next.join('').slice(0, OTP_LENGTH);
    onChange(code);
    if (digit && code.length === OTP_LENGTH && onComplete) {
      onComplete(code);
    }
  };

  const focusAt = (index: number) => {
    const el = inputsRef.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))];
    el?.focus();
    el?.select();
  };

  const applyBulk = (raw: string, startIndex = 0) => {
    const incoming = onlyDigits(raw);
    if (!incoming) return;
    const next = [...digits];
    let cursor = startIndex;
    for (const ch of incoming) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = ch;
      cursor += 1;
    }
    const code = next.join('').slice(0, OTP_LENGTH);
    onChange(code);
    focusAt(Math.min(cursor, OTP_LENGTH - 1));
    if (code.length === OTP_LENGTH && onComplete) {
      onComplete(code);
    }
  };

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        // Current block has a digit: clear it and step back
        next[index] = '';
        onChange(next.join('').slice(0, OTP_LENGTH));
        if (index > 0) {
          focusAt(index - 1);
        }
      } else if (index > 0) {
        // Current block is already empty: delete previous block and focus it
        next[index - 1] = '';
        onChange(next.join('').slice(0, OTP_LENGTH));
        focusAt(index - 1);
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusAt(index - 1);
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusAt(index + 1);
      return;
    }

    if (e.key === 'Home') {
      e.preventDefault();
      focusAt(0);
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      focusAt(OTP_LENGTH - 1);
      return;
    }

    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      setDigit(index, e.key);
      if (index < OTP_LENGTH - 1) focusAt(index + 1);
    }
  };

  const onPaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    applyBulk(e.clipboardData.getData('text'), index);
  };

  const boxStyle = (): CSSProperties => ({
    width: '100%',
    aspectRatio: '1',
    maxWidth: 52,
    height: 52,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    color: theme.colors.text,
    borderRadius: theme.radii.lg,
    border: `1.5px solid ${
      error
        ? theme.colors.danger
        : (theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle)
    }`,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.inputBg,
    outline: 'none',
    caretColor: theme.colors.primary,
    opacity: disabled ? 0.55 : 1,
    boxSizing: 'border-box',
  });

  return (
    <div style={{ marginBottom: theme.spacing.lg, opacity: disabled ? 0.9 : 1 }}>
      {label ? (
        <label style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.sm,
          fontFamily: 'Inter, sans-serif',
        }}>
          {label}
        </label>
      ) : null}
      <div
        role="group"
        aria-label={label}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${OTP_LENGTH}, minmax(0, 1fr))`,
          gap: 8,
          maxWidth: 360,
        }}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el; }}
            value={digit}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            pattern="[0-9]*"
            maxLength={1}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
            aria-invalid={!!error}
            onChange={(e) => applyBulk(e.target.value, index)}
            onKeyDown={(e) => onKeyDown(index, e)}
            onPaste={(e) => onPaste(index, e)}
            style={boxStyle()}
            onFocus={(e) => {
              e.target.select();
              e.currentTarget.style.borderColor = error
                ? theme.colors.danger
                : theme.colors.primary + '88';
              e.currentTarget.style.backgroundColor = theme.colors.primarySoft;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error
                ? theme.colors.danger
                : (theme.isDark ? 'rgba(255,255,255,0.1)' : theme.colors.borderSubtle);
              e.currentTarget.style.backgroundColor = theme.isDark
                ? 'rgba(255,255,255,0.04)'
                : theme.colors.inputBg;
            }}
          />
        ))}
      </div>
      {error ? (
        <p style={{
          color: theme.colors.danger,
          fontSize: 12,
          marginTop: theme.spacing.xs,
          fontWeight: 500,
          fontFamily: 'Inter, sans-serif',
        }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}