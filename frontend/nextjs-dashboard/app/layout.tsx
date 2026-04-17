import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CookieConsent — GDPR Cookie Compliance Made Simple',
  description:
    'Automatically manage cookie consent, block trackers, and stay GDPR compliant. ' +
    'Add one script and let CookieConsent handle the rest.',
  keywords: ['GDPR', 'cookie consent', 'cookie banner', 'compliance', 'privacy'],
  authors: [{ name: 'CookieConsent' }],
  openGraph: {
    title: 'CookieConsent — GDPR Cookie Compliance Made Simple',
    description: 'Automatically manage cookie consent, block trackers, and stay GDPR compliant.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full antialiased bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
