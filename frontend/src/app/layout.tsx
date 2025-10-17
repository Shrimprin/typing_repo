import { Metadata } from 'next';
import { Play } from 'next/font/google';

import Footer from '@/components/common/Footer';
import ToastListener from '@/components/common/ToastListener';
import { Toaster } from '@/components/ui/sonner';
import AuthProvider from '@/providers/Auth';
import './globals.css';

const TITLE = 'Typing Repo';
const DESCRIPTION =
  'Free typing game for programmers. You can import any GitHub repository and practice typing through real code.';
const URL = 'https://typing-repo.com';

export const metadata: Metadata = {
  title: {
    default: `${TITLE} | Practice Typing through Real Code`,
    template: '%s | Typing Repo',
  },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    images: [
      {
        url: '/ogp.png',
        alt: 'Typing Repo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/ogp.png',
        alt: 'Typing Repo',
      },
    ],
  },
};

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
