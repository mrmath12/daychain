import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function LandingPage() {
  const t = await getTranslations()

  const features = [
    { icon: '👆', title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
    { icon: '🔗', title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
    { icon: '🏆', title: t('landing.feature3Title'), desc: t('landing.feature3Desc') },
    { icon: '📊', title: t('landing.feature4Title'), desc: t('landing.feature4Desc') },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/daychain-logo-full-dark.svg"
            alt="Daychain"
            width={105}
            height={28}
            className="block dark:hidden"
          />
          <Image
            src="/logo/daychain-logo-full-light.svg"
            alt="Daychain"
            width={105}
            height={28}
            className="hidden dark:block"
          />
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            {t('landing.ctaSecondary')}
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors px-4 py-1.5 rounded-lg"
          >
            {t('auth.register')}
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center text-center px-6 pt-20 pb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl">{t('landing.heroSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold bg-lime-yellow hover:bg-lime-yellow-2 text-ink-black rounded-xl transition-colors"
            >
              {t('landing.ctaPrimary')}
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium border border-border hover:bg-muted rounded-xl transition-colors text-foreground"
            >
              {t('landing.ctaSecondary')}
            </Link>
          </div>

          {/* Mockup placeholder */}
          <div className="mt-14 w-full max-w-sm mx-auto">
            <div className="rounded-2xl border border-border/60 bg-muted/30 aspect-[9/16] max-h-[480px] flex items-center justify-center">
              <p className="text-xs text-muted-foreground font-mono">
                {/* TODO: substituir por screenshot real */}
                screenshot
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-foreground">
            {t('landing.featuresTitle')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-border/60 bg-muted/20 p-6 flex gap-4"
              >
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Screenshots */}
        <section className="px-6 py-16 max-w-4xl mx-auto">
          {/* TODO: aplicar /frontend-design e /impeccable para o visual final desta seção */}
          {/* Substituir pelos screenshots reais após o design estar aprovado */}
          <h2 className="text-2xl font-bold text-center mb-10 text-foreground">
            {t('landing.screenshotsTitle')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-muted/20 aspect-[9/16] flex items-center justify-center"
              >
                <p className="text-xs text-muted-foreground font-mono">screenshot {i}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <Image
              src="/logo/daychain-logo-full-dark.svg"
              alt="Daychain"
              width={80}
              height={21}
              className="block dark:hidden mb-1"
            />
            <Image
              src="/logo/daychain-logo-full-light.svg"
              alt="Daychain"
              width={80}
              height={21}
              className="hidden dark:block mb-1"
            />
            <p className="text-sm text-muted-foreground">{t('landing.footerTagline')}</p>
          </div>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-foreground transition-colors">
              {t('landing.ctaSecondary')}
            </Link>
            <Link href="/auth/register" className="hover:text-foreground transition-colors">
              {t('auth.register')}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
