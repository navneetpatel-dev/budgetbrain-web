import type { User } from '@/shared/types';

export interface AcceptInviteResponse {
  accessToken: string;
  refreshToken: string;
  membership: { id: string; groupId: string; role: string };
  isNewUser: boolean;
}

export type AcceptInviteResult =
  | { ok: true; user: User }
  | { ok: false; message: string };

export interface AcceptInviteDeps {
  apiPost: <T>(url: string, body?: unknown) => Promise<T>;
  apiGet: <T>(url: string) => Promise<T>;
  persistAuthSession: (session: { accessToken: string; refreshToken: string }) => Promise<void>;
  getErrorMessage: (err: unknown, fallback?: string) => string;
}

/**
 * Pure(ish), dependency-injected core of the family-invite accept flow — extracted out of
 * AcceptInvite.page.tsx so it's testable without mocking next/navigation, Redux, or the
 * axios-backed api module directly. The page component just calls this and maps the
 * discriminated result to UI state.
 */
export async function performAcceptInvite(
  token: string | null,
  deps: AcceptInviteDeps
): Promise<AcceptInviteResult> {
  if (!token) {
    return { ok: false, message: 'This invite link is missing its token.' };
  }
  try {
    const session = await deps.apiPost<AcceptInviteResponse>('/family/invites/accept', { token });
    await deps.persistAuthSession(session);
    const user = await deps.apiGet<User>('/users/me');
    return { ok: true, user };
  } catch (err) {
    return { ok: false, message: deps.getErrorMessage(err, 'This invite link could not be used') };
  }
}
