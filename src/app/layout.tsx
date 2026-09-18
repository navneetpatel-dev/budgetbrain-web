import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/shared/containers/AppProviders';

export const metadata: Metadata = {
  title: 'BudgetBrain',
  description: 'AI-powered personal finance and expense tracking',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366F1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased h-full w-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
