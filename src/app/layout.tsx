import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { MsalProvider } from '@/providers/MsalProvider';
import { TokenHandler } from '@/components/TokenHandler';

import { getAuthSession } from '@/lib/auth';
import { SessionProvider } from '@/providers/SessionProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ToastHandler } from './ToastHandler';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Fuel Requisition System',
  description: 'Fuel requisition system version 1',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession(); // Fetch session server-side
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MsalProvider>
          <SessionProvider session={session}>
            <TokenHandler />
            {/* <Header /> */}
            <ToastProvider />
            <ToastHandler />
            {children}
          </SessionProvider>
        </MsalProvider>
      </body>
    </html>
  );
}
