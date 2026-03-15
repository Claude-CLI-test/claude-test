import type { ReactNode } from 'react'
import { useI18n } from '../contexts/I18nContext'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  variant: 'login' | 'signup'
}

export default function AuthLayout({ children, title, subtitle, variant }: AuthLayoutProps) {
  const { t, locale, setLocale } = useI18n()
  const isLogin = variant === 'login'
  const promoTitle = isLogin ? t('loginPromoTitle') : t('signupPromoTitle')
  const promoText = isLogin ? t('loginPromoText') : t('signupPromoText')

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf6_0%,#fff3e6_46%,#fffdfb_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/70 px-5 py-5 shadow-[0_24px_60px_rgba(148,79,20,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-600">
              Student Planner
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t('appTitle')}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{t('appSubtitle')}</p>
          </div>
          <div className="inline-flex w-fit rounded-full border border-brand-100 bg-brand-50 p-1 text-sm">
            {(['ko', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                className={`rounded-full px-3 py-1.5 font-medium transition ${
                  locale === lang
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-brand-700'
                }`}
                onClick={() => setLocale(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#8d3117_0%,#f4511e_58%,#ff9a63_100%)] p-6 text-white shadow-card sm:p-8">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_44%)]" />
            <div className="relative">
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-[0.22em] text-white/85">
                CAMPUS OPERATIONS
              </p>
              <h2 className="mt-6 max-w-lg text-3xl font-semibold leading-tight sm:text-4xl">
                {promoTitle}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/88 sm:text-base">
                {promoText}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/18 bg-white/12 p-4">
                  <p className="text-2xl font-semibold">24h</p>
                  <p className="mt-1 text-sm text-white/80">{t('feature1')}</p>
                </div>
                <div className="rounded-2xl border border-white/18 bg-white/12 p-4">
                  <p className="text-2xl font-semibold">3 View</p>
                  <p className="mt-1 text-sm text-white/80">{t('feature2')}</p>
                </div>
                <div className="rounded-2xl border border-white/18 bg-white/12 p-4">
                  <p className="text-2xl font-semibold">Mobile</p>
                  <p className="mt-1 text-sm text-white/80">{t('feature3')}</p>
                </div>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-white/18 bg-slate-950/15 p-5 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{t('testAccountInfoTitle')}</p>
                    <p className="mt-1 text-xs text-white/75">
                      {isLogin ? subtitle : t('loginSubtitle')}
                    </p>
                  </div>
                  <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
                    Demo Ready
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white/12 px-4 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/70">
                      {t('testAccountEmail')}
                    </p>
                    <p className="mt-1 text-sm font-semibold">alice@example.com</p>
                    <p className="mt-1 text-xs text-white/75">
                      {t('testAccountPassword')}: Password1!
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/8 px-4 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/70">
                      {t('testAccountEmail')}
                    </p>
                    <p className="mt-1 text-sm font-semibold">bob@example.com</p>
                    <p className="mt-1 text-xs text-white/75">
                      {t('testAccountPassword')}: Password1!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/90 bg-white px-5 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:px-8 sm:py-8">
            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-sm text-brand-700">
              {subtitle}
            </div>
            <div className="mt-6">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isLogin
                  ? '오늘 일정과 마감 흐름을 바로 이어서 확인할 수 있도록 안전하게 로그인하세요.'
                  : '지금 계정을 만들고 과제, 팀 일정, 개인 루틴을 한 화면에서 정리해보세요.'}
              </p>
            </div>
            <div className="mt-8">{children}</div>
          </section>
        </div>
      </div>
    </div>
  )
}
