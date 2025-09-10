import type { Metadata } from 'next';
import { Play } from 'next/font/google';

import Footer from '@/components/common/Footer';
import AuthProvider from '@/providers/Auth';

import './globals.css';

const play = Play({
  variable: '--font-play',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'TypingRepo - Practice Typing with Real Code',
  description:
    'Improve your coding typing accuracy and speed by practicing with real GitHub repositories. A typing game for programming beginners.',
};

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
      </body>
    </html>
  );
}
