import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { getTranslations } from 'next-intl/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { LanguageToggle } from '@/components/shared/LanguageToggle'

export default async function LandingPage() {
  const t = await getTranslations()

  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const features = [
    { num: '01', icon: '👆', title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
    { num: '02', icon: '🔗', title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
    { num: '03', icon: '🏆', title: t('landing.feature3Title'), desc: t('landing.feature3Desc') },
    { num: '04', icon: '📊', title: t('landing.feature4Title'), desc: t('landing.feature4Desc') },
  ]

  const screenshots = [
    { src: '/screenshots/home.webp', alt: 'Daychain – tela inicial' },
    { src: '/screenshots/progress.webp', alt: 'Daychain – progresso' },
    { src: '/screenshots/settings.webp', alt: 'Daychain – configurações' },
  ]

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {/* ── Header ── */}
        <header className="fu d0 fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo/daychain-logo-full-light.svg"
              alt="Daychain"
              width={105}
              height={28}
              className="hidden dark:block"
            />
            <Image
              src="/logo/daychain-logo-full-dark.svg"
              alt="Daychain"
              width={105}
              height={28}
              className="block dark:hidden"
            />
          </Link>
          <nav className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <span className="w-px h-5 bg-border" aria-hidden="true" />
            {user ? (
              <Link
                href="/home"
                className="btn-cta text-sm font-semibold bg-lime-yellow hover:bg-lime-yellow-2 text-ink-black px-4 py-1.5 rounded-lg"
              >
                {t('landing.goToApp')} →
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="btn-cta text-sm text-foreground/60 hover:text-foreground px-3 py-1.5"
                >
                  {t('landing.ctaSecondary')}
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-cta text-sm font-semibold bg-lime-yellow hover:bg-lime-yellow-2 text-ink-black px-4 py-1.5 rounded-lg"
                >
                  {t('auth.register')}
                </Link>
              </>
            )}
          </nav>
        </header>

        <main className="flex-1 pt-16">
          {/* ── Hero ── */}
          <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
            <div className="hero-gradient absolute inset-0" />
            <div
              className="absolute inset-0 opacity-[0.045]"
              style={{
                backgroundImage:
                  'linear-gradient(#d6ff0a 1px,transparent 1px),linear-gradient(90deg,#d6ff0a 1px,transparent 1px)',
                backgroundSize: '56px 56px',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
              <span
                className="wm-drift font-[family-name:var(--font-bebas)] leading-none text-lime-yellow"
                style={{
                  fontSize: 'clamp(100px,26vw,300px)',
                  opacity: 0.04,
                  letterSpacing: '-0.01em',
                }}
              >
                DAYCHAIN
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent" />

            <div
              id="hero-sentinel"
              className="absolute bottom-32 inset-x-0 h-px pointer-events-none"
            />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="fu d0 mb-8 inline-flex items-center gap-2.5 bg-muted border border-border rounded-full px-4 py-1.5">
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-lime-yellow shrink-0" />
                <span className="text-xs font-medium text-foreground/60 tracking-widest uppercase">
                  Habit tracker
                </span>
              </div>

              <h1
                className="fu d1 font-[family-name:var(--font-bebas)] text-foreground mb-6"
                style={{
                  fontSize: 'clamp(3.2rem,11vw,8.5rem)',
                  lineHeight: '0.92',
                  letterSpacing: '-0.01em',
                }}
              >
                {t('landing.heroTitle')}
              </h1>

              <p className="fu d2 text-base sm:text-lg text-foreground/50 mb-10 max-w-lg mx-auto leading-relaxed">
                {t('landing.heroSubtitle')}
              </p>

              <div className="fu d3 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/register"
                  className="btn-cta inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold bg-lime-yellow hover:bg-lime-yellow-2 text-ink-black rounded-xl"
                >
                  {t('landing.ctaPrimary')}
                </Link>
                <Link
                  href="/auth/login"
                  className="btn-cta inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium border border-border hover:border-ring text-foreground/60 hover:text-foreground rounded-xl"
                >
                  {t('landing.ctaSecondary')}
                </Link>
              </div>
            </div>
          </section>

          {/* ── Features ── */}
          <section className="px-6 py-24 bg-muted dark:bg-dark-teal">
            <div className="max-w-4xl mx-auto">
              <h2
                className="reveal font-[family-name:var(--font-bebas)] text-foreground text-center mb-16 tracking-tight"
                style={{ fontSize: 'clamp(2rem,6vw,4rem)' }}
              >
                {t('landing.featuresTitle')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/50 border border-border/50">
                {features.map(({ num, icon, title, desc }, i) => (
                  <div
                    key={title}
                    className={`reveal p-8 flex flex-col gap-5 group hover:bg-accent/20 dark:hover:bg-dark-teal-2/60 transition-colors ${
                      i >= 2 ? 'border-t border-border/50' : ''
                    }`}
                    style={{ '--rd': `${i * 80}ms` } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className="feature-num font-[family-name:var(--font-bebas)] text-lime-yellow leading-none"
                        style={{ fontSize: '3.5rem' }}
                      >
                        {num}
                      </span>
                      <span className="text-xl opacity-50 group-hover:opacity-80 transition-opacity">
                        {icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                      <p className="text-sm text-foreground/45 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Screenshots ── */}
          <section className="px-6 py-24 bg-background">
            <div className="max-w-4xl mx-auto">
              <h2
                className="reveal font-[family-name:var(--font-bebas)] text-foreground text-center mb-16 tracking-tight"
                style={{ fontSize: 'clamp(2rem,6vw,4rem)' }}
              >
                {t('landing.screenshotsTitle')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {screenshots.map(({ src, alt }, i) => (
                  <div
                    key={src}
                    className="reveal rounded-xl border border-border/50 overflow-hidden aspect-[390/844]"
                    style={{ '--rd': `${i * 100}ms` } as React.CSSProperties}
                  >
                    <Image
                      src={src}
                      alt={alt}
                      width={780}
                      height={1688}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-border bg-background">
          <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start justify-between gap-8">
            <div className="flex flex-col gap-3">
              <Image
                src="/logo/daychain-logo-full-light.svg"
                alt="Daychain"
                width={88}
                height={23}
                className="hidden dark:block"
              />
              <Image
                src="/logo/daychain-logo-full-dark.svg"
                alt="Daychain"
                width={88}
                height={23}
                className="block dark:hidden"
              />
              <p className="text-sm text-foreground/35 max-w-[22ch] leading-relaxed">
                {t('landing.footerTagline')}
              </p>
            </div>
            <nav className="flex flex-col gap-2 text-sm">
              <span className="text-[11px] font-medium text-foreground/25 uppercase tracking-widest mb-1">
                {t('landing.ctaSecondary').split(' ')[0]}
              </span>
              <Link
                href="/auth/login"
                className="text-foreground/45 hover:text-foreground transition-colors"
              >
                {t('landing.ctaSecondary')}
              </Link>
              <Link
                href="/auth/register"
                className="text-foreground/45 hover:text-foreground transition-colors"
              >
                {t('auth.register')}
              </Link>
            </nav>
          </div>
          <div className="border-t border-border/40 px-6 py-4">
            <p className="max-w-4xl mx-auto text-[11px] text-foreground/20 tabular-nums">
              © {new Date().getFullYear()} Daychain
            </p>
          </div>
        </footer>
      </div>

      <Script id="landing-motion" strategy="afterInteractive">{`
        (function () {
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
            });
          }, { threshold: 0.08 });
          document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

          var hdr = document.querySelector('header');
          var sentinel = document.getElementById('hero-sentinel');
          if (hdr && sentinel) {
            new IntersectionObserver(function (entries) {
              hdr.classList.toggle('scrolled', !entries[0].isIntersecting);
            }, { threshold: 0 }).observe(sentinel);
          }
        })();
      `}</Script>
    </>
  )
}
