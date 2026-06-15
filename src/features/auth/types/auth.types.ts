export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string | null; role: string; onboardingCompleted: boolean };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface OtpVerifyInput {
  email: string;
  code: string;
}
