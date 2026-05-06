import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Toaster } from 'sonner'
import { DEFAULT_THEME, THEME_STORAGE_KEY } from '@/lib/utils/constants'
import { AppShell } from '@/components/layout/AppShell'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Daychain',
  description: 'Construa seu protocolo diário',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Daychain',
  },
  formatDetection: { telephone: false },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages()

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#09090b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme={DEFAULT_THEME}
          enableSystem={false}
          storageKey={THEME_STORAGE_KEY}
        >
          <NextIntlClientProvider messages={messages}>
            <AppShell>{children}</AppShell>
            <Toaster richColors position="bottom-center" />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
