import withPWAInit from '@ducanh2912/next-pwa'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // Static assets: CacheFirst (30 days)
        urlPattern: /^https:\/\/.*\.(js|css|woff2?)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: { maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        // Supabase API: NetworkFirst with 5-second timeout fallback
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          networkTimeoutSeconds: 5,
          expiration: { maxAgeSeconds: 60 * 60 },
        },
      },
    ],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' }
    return config
  },
}

export default withPWA(withNextIntl(nextConfig))
