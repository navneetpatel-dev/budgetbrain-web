import { apiGet, apiPost, apiDelete } from '@/shared/services/api';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/browser';
import type { AuthSession } from '../types/auth.types';

export interface WebauthnCredentialSummary {
  id: string;
  deviceLabel: string | null;
  createdAt: string;
}

export function fetchRegistrationOptions() {
  return apiPost<PublicKeyCredentialCreationOptionsJSON>('/auth/webauthn/register/options', {});
}

export function verifyRegistration(response: unknown, deviceLabel?: string) {
  return apiPost<WebauthnCredentialSummary>('/auth/webauthn/register/verify', {
    response,
    deviceLabel,
  });
}

export function fetchLoginOptions(email: string) {
  return apiPost<PublicKeyCredentialRequestOptionsJSON>('/auth/webauthn/login/options', { email });
}

export function verifyLogin(email: string, response: unknown) {
  return apiPost<AuthSession>('/auth/webauthn/login/verify', { email, response });
}

export function listPasskeys() {
  return apiGet<{ credentials: WebauthnCredentialSummary[] }>('/auth/webauthn/credentials');
}

export function removePasskey(id: string) {
  return apiDelete<{ message: string }>(`/auth/webauthn/credentials/${id}`);
}
