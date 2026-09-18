const APPLE_SDK_SRC =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

type AppleName = {
  firstName?: string;
  lastName?: string;
};

type AppleSignInResponse = {
  authorization: { id_token: string; code?: string };
  user?: { email?: string; name?: AppleName };
};

type AppleIDAuth = {
  init: (config: {
    clientId: string;
    scope: string;
    redirectURI: string;
    usePopup: boolean;
    state?: string;
  }) => void;
  signIn: () => Promise<AppleSignInResponse>;
};

declare global {
  interface Window {
    AppleID?: { auth: AppleIDAuth };
  }
}

let sdkPromise: Promise<AppleIDAuth> | null = null;
let initializedFor: string | null = null;

function getAppleClientId(): string {
  const val = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? process.env.VITE_APPLE_CLIENT_ID;
  return val?.trim() ?? '';
}

function getAppleRedirectUri(): string {
  const configured = (process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ?? process.env.VITE_APPLE_REDIRECT_URI)?.trim();
  return configured || (typeof window !== 'undefined' ? window.location.origin : '');
}

async function loadAppleSdk(): Promise<AppleIDAuth> {
  if (window.AppleID?.auth) return window.AppleID.auth;
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<AppleIDAuth>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${APPLE_SDK_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.AppleID?.auth) resolve(window.AppleID.auth);
        else reject(new Error('Apple SDK failed to initialize'));
      });
      existing.addEventListener('error', () => reject(new Error('Apple SDK failed to load')));
      if (window.AppleID?.auth) resolve(window.AppleID.auth);
      return;
    }

    const script = document.createElement('script');
    script.src = APPLE_SDK_SRC;
    script.async = true;
    script.onload = () => {
      if (window.AppleID?.auth) resolve(window.AppleID.auth);
      else reject(new Error('Apple SDK failed to initialize'));
    };
    script.onerror = () => reject(new Error('Apple SDK failed to load'));
    document.head.appendChild(script);
  }).catch((err) => {
    sdkPromise = null;
    throw err;
  });

  return sdkPromise;
}

async function ensureAppleAuth(): Promise<AppleIDAuth> {
  const clientId = getAppleClientId();
  if (!clientId) {
    throw new Error('VITE_APPLE_CLIENT_ID is not configured');
  }

  const auth = await loadAppleSdk();
  const redirectURI = getAppleRedirectUri();
  const initKey = `${clientId}|${redirectURI}`;
  if (initializedFor !== initKey) {
    auth.init({
      clientId,
      scope: 'name email',
      redirectURI,
      usePopup: true,
    });
    initializedFor = initKey;
  }
  return auth;
}

export function isAppleSignInConfigured(): boolean {
  return Boolean(getAppleClientId());
}

export async function requestAppleIdToken(): Promise<{ idToken: string; name?: string }> {
  const auth = await ensureAppleAuth();
  try {
    const response = await auth.signIn();
    const idToken = response.authorization?.id_token;
    if (!idToken) {
      throw new Error('Apple sign-in did not return an identity token');
    }
    const name = [response.user?.name?.firstName, response.user?.name?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || undefined;
    return { idToken, name };
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
    if (
      message.includes('popup')
      || message.includes('cancel')
      || message.includes('closed')
      || message.includes('user_cancelled')
    ) {
      throw new Error('popup_closed');
    }
    throw err;
  }
}
