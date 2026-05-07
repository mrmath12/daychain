import type { Metadata } from 'next'
import { Gemunu_Libre, Bebas_Neue, DM_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Toaster } from 'sonner'
import { DEFAULT_THEME, THEME_STORAGE_KEY } from '@/lib/utils/constants'
import './globals.css'

const gemunuLibre = Gemunu_Libre({ subsets: ['latin'], variable: '--font-sans' })
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })

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
    icon: [
      { url: '/icon/daychain.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
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
      <body
        className={`${gemunuLibre.variable} ${bebasNeue.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={DEFAULT_THEME}
          enableSystem={false}
          storageKey={THEME_STORAGE_KEY}
        >
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster richColors position="bottom-center" />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
