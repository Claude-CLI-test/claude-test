import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../contexts/I18nContext'
import { ApiRequestError } from '../api/client'
import AuthLayout from '../components/AuthLayout'

export default function SignupPage() {
  const { signup, login } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordConfirmError, setPasswordConfirmError] = useState('')
  const [apiError, setApiError] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  function validateEmail(value: string): string {
    if (!value) return t('emailRequired')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('emailInvalid')
    return ''
  }

  function validatePassword(value: string): string {
    if (!value) return t('passwordRequired')
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value)) return t('passwordInvalid')
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const nameErr = name.trim() ? '' : t('nameRequired')
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    const confirmErr = password !== passwordConfirm ? t('passwordMismatch') : ''

    setNameError(nameErr)
    setEmailError(emailErr)
    setPasswordError(passwordErr)
    setPasswordConfirmError(confirmErr)
    setApiError('')

    if (nameErr || emailErr || passwordErr || confirmErr) return

    setIsSubmitting(true)
    try {
      await signup(email, password, name.trim())
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setApiError(err.message)
      } else {
        setApiError(t('signupFailed'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout variant="signup" title={t('signupTitle')} subtitle={t('signupSubtitle')}>
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
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            {t('nameLabel')}
          </label>
          <div className="mt-1">
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className={`block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 ${
                nameError ? 'border-red-400 bg-red-50/70' : 'border-slate-200'
              }`}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError && e.target.value.trim()) setNameError('')
              }}
              placeholder={t('namePlaceholder')}
              disabled={isSubmitting}
            />
            {nameError && <p className="mt-2 text-sm text-red-600">{nameError}</p>}
          </div>
        </div>

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
                if (apiError) setApiError('')
              }}
              onBlur={() => setEmailError(validateEmail(email))}
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
              autoComplete="new-password"
              required
              className={`block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 ${
                passwordError ? 'border-red-400 bg-red-50/70' : 'border-slate-200'
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (passwordError) setPasswordError(validatePassword(e.target.value))
              }}
              onBlur={() => setPasswordError(validatePassword(password))}
              disabled={isSubmitting}
            />
            <p className="mt-2 text-sm text-gray-500">{t('passwordHint')}</p>
            {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-slate-700">
            {t('passwordConfirmLabel')}
          </label>
          <div className="mt-1">
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              required
              className={`block w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 ${
                passwordConfirmError ? 'border-red-400 bg-red-50/70' : 'border-slate-200'
              }`}
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value)
                if (passwordConfirmError && e.target.value === password)
                  setPasswordConfirmError('')
              }}
              onBlur={() => {
                if (passwordConfirm && passwordConfirm !== password)
                  setPasswordConfirmError(t('passwordMismatch'))
              }}
              disabled={isSubmitting}
            />
            {passwordConfirmError && <p className="mt-2 text-sm text-red-600">{passwordConfirmError}</p>}
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            className="flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(244,81,30,0.24)] transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('signupLoading') : t('signupButton')}
          </button>

          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
            대소문자와 숫자를 섞어 두면 더 안전하게 사용할 수 있습니다.
          </p>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t('hasAccount')}{' '}
        <Link to="/login" className="font-semibold text-brand-600 transition hover:text-brand-700">
          {t('loginLink')}
        </Link>
      </p>
    </AuthLayout>
  )
}
