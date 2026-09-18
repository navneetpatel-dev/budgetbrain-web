'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/shared/components/ui/index';
import { ColdStartSkeleton } from '@/shared/components/ui/skeleton';
import { AuthShell, AuthSuccessBanner, AuthInfoBanner, AuthErrorBanner } from '../components';
import { useVerifyEmail } from '../hooks/useVerifyEmail';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { verify, loading, verified, error, clearError, goToLogin } = useVerifyEmail(token);

  const handleVerify = () => {
    clearError();
    void verify();
  };

  return (
    <AuthShell
      tagline={verified ? 'Your account is ready to use.' : 'Confirm your email to unlock all features.'}
      panelTitle="Verify email"
      backHref="/login"
    >
      {verified ? (
        <div className="flex flex-col gap-md">
          <AuthSuccessBanner message="Your email has been verified successfully." />
          <Button title="Continue to Sign In" onPress={goToLogin} size="lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          <AuthInfoBanner message="Tap the button below to verify your budgetbrain account." />
          {error ? <AuthErrorBanner message={error} /> : null}
          <Button title="Verify Email" onPress={handleVerify} loading={loading} size="lg" />
        </div>
      )}
    </AuthShell>
  );
}

export function VerifyEmailPage() {
  return (
    <Suspense fallback={<ColdStartSkeleton />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

export default VerifyEmailPage;
