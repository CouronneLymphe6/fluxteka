import type { Metadata } from 'next';
import { Inter, Sora, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/layout/CookieBanner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Fluxteka — Bibliothèque de workflows d\'automatisation IA',
    template: '%s — Fluxteka',
  },
  description:
    'Découvrez, appliquez et partagez les meilleurs workflows IA. N8N, Make, Zapier, LangChain — 24 000+ automatisations prêtes à l\'emploi.',
  keywords: [
    'workflows', 'automatisation', 'IA', 'n8n', 'make', 'zapier',
    'langchain', 'automation', 'no-code', 'low-code', 'agents ia',
    'marketplace workflows', 'europe', 'france', 'fluxteka',
  ],
  authors: [{ name: 'Fluxteka' }],
  creator: 'Fluxteka',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    siteName: 'Fluxteka',
    title: 'Fluxteka — Bibliothèque de workflows d\'automatisation IA',
    description:
      'Découvrez, appliquez et partagez les meilleurs workflows IA. N8N, Make, Zapier, LangChain — 24 000+ automatisations.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fluxteka — Bibliothèque de workflows d\'automatisation IA',
    description:
      'Découvrez, appliquez et partagez les meilleurs workflows IA. N8N, Make, Zapier, LangChain — 24 000+ automatisations.',
    site: '@fluxteka',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get locale and messages for the NextIntlClientProvider
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={cn(inter.variable, sora.variable, jetbrainsMono.variable)}
    >
      <body className="flex min-h-screen flex-col bg-bg font-body text-text-primary antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
