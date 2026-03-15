import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../contexts/I18nContext'
import { ApiRequestError } from '../api/client'
import AuthLayout from '../components/AuthLayout'

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validateEmail(value: string): string {
    if (!value) return t('emailRequired')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('emailInvalid')
    return ''
  }

  function handleEmailBlur() {
    setEmailError(validateEmail(email))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const emailErr = validateEmail(email)
    if (emailErr) {
      setEmailError(emailErr)
      return
    }

    setApiError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setApiError(err.message)
      } else {
        setApiError(t('loginFailed'))
      }
      setPassword('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout variant="login" title={t('loginTitle')} subtitle={t('loginSubtitle')}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {apiError && (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            role="alert"
          >
            {apiError}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            {t('emailLabel')}
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 ${
                emailError ? 'border-red-400 bg-red-50/70' : 'border-slate-200'
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError(validateEmail(e.target.value))
              }}
              onBlur={handleEmailBlur}
              placeholder="alice@example.com"
              disabled={isSubmitting}
            />
            {emailError && <p className="mt-2 text-sm text-red-600">{emailError}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            {t('passwordLabel')}
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            className="flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(244,81,30,0.24)] transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('loginLoading') : t('loginButton')}
          </button>

          <p className="rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-xs leading-5 text-slate-600">
            {t('testAccountInfoTitle')}: <strong className="text-slate-900">alice@example.com</strong> /
            {' '}
            <strong className="text-slate-900">Password1!</strong>
          </p>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t('noAccount')}{' '}
        <Link to="/signup" className="font-semibold text-brand-600 transition hover:text-brand-700">
          {t('signupLink')}
        </Link>
      </p>
    </AuthLayout>
  )
}
