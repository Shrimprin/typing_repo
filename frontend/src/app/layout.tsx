import { Play } from 'next/font/google';

import Footer from '@/components/common/Footer';
import ToastListener from '@/components/common/ToastListener';
import { Toaster } from '@/components/ui/sonner';
import AuthProvider from '@/providers/Auth';

import './globals.css';

const play = Play({
  variable: '--font-play',
  subsets: ['latin'],
  weight: ['400'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          antialiased
          ${play.variable}
          flex min-h-screen flex-col font-sans
        `}
      >
        <AuthProvider>
          <main className="flex-1">{children}</main>
        </AuthProvider>
        <Footer />
        <ToastListener />
        <Toaster />
      </body>
    </html>
  );
}
