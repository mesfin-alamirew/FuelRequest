import type { Metadata } from 'next';
import { Geist, Geist_Mono, Outfit } from 'next/font/google';
import './globals.css';
import { MsalProvider } from '@/providers/MsalProvider';
import { TokenHandler } from '@/components/TokenHandler';

import { getAuthSession } from '@/lib/auth';
import { SessionProvider } from '@/providers/SessionProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ToastHandler } from './ToastHandler';
import { SidebarProvider } from '@/providers/SidebarContext';
import { ThemeProvider } from '@/providers/ThemeContext';

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
const outfit = Outfit({
  subsets: ['latin'],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession(); // Fetch session server-side
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <MsalProvider>
            <SessionProvider session={session}>
              <TokenHandler />

              <ToastProvider />
              <ToastHandler />
              <SidebarProvider>{children}</SidebarProvider>
            </SessionProvider>
          </MsalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
