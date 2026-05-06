'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppTranslations } from '@/hooks/useAppTranslations'

// ── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  login: z.string().min(1, 'required'),
  password: z.string().min(1, 'required'),
})

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'usernameInvalid')
      .max(20, 'usernameInvalid')
      .regex(/^[a-zA-Z0-9_]+$/, 'usernameInvalid'),
    email: z.string().email('emailInvalid'),
    password: z.string().min(8, 'passwordTooShort'),
    confirmPassword: z.string().min(1, 'required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  })

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

// ── Shared helpers ────────────────────────────────────────────────────────────

interface AuthFormProps {
  mode: 'login' | 'register'
  onSuccess: () => void
}

const inputBase =
  'w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-1 focus:ring-ring transition-colors'

const inputError = 'border-destructive focus:border-destructive focus:ring-destructive'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

// ── Login Form ────────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useAppTranslations()
  const supabase = getSupabaseBrowserClient()
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginValues) {
    setAuthError(null)
    try {
      let email = values.login

      // Username lookup: input without "@" is treated as a username
      if (!values.login.includes('@')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', values.login.toLowerCase())
          .maybeSingle()

        if (!profile) {
          // Use same message whether username doesn't exist or password is wrong
          setAuthError(t('auth.invalidCredentials'))
          return
        }
        email = profile.email
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: values.password,
      })

      if (error) {
        setAuthError(t('auth.invalidCredentials'))
        return
      }

      onSuccess()
    } catch {
      setAuthError(t('auth.invalidCredentials'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">{t('auth.loginField')}</label>
        <input
          {...register('login')}
          type="text"
          placeholder={t('auth.loginField')}
          autoComplete="email"
          className={cn(inputBase, errors.login && inputError)}
        />
        <FieldError message={errors.login && t('common.error')} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t('auth.passwordField')}</label>
        <input
          {...register('password')}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className={cn(inputBase, errors.password && inputError)}
        />
        <FieldError message={errors.password && t('common.error')} />
      </div>

      {authError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {authError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : t('auth.loginButton')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/register" className="text-foreground underline-offset-4 hover:underline">
          {t('auth.switchToRegister')}
        </Link>
      </p>
    </form>
  )
}

// ── Register Form ─────────────────────────────────────────────────────────────

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useAppTranslations()
  const supabase = getSupabaseBrowserClient()
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  function resolveError(code: string | undefined): string | undefined {
    if (!code) return undefined
    switch (code) {
      case 'usernameInvalid':
        return t('auth.usernameInvalid')
      case 'usernameTaken':
        return t('auth.usernameTaken')
      case 'emailInvalid':
        return t('common.error')
      case 'passwordTooShort':
        return t('auth.passwordTooShort')
      case 'passwordMismatch':
        return t('auth.passwordMismatch')
      case 'required':
        return t('common.error')
      default:
        return code
    }
  }

  async function onSubmit(values: RegisterValues) {
    setAuthError(null)

    // Check username availability before submitting
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', values.username.toLowerCase())
      .maybeSingle()

    if (existing) {
      setError('username', { message: 'usernameTaken' })
      return
    }

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { username: values.username.toLowerCase() },
      },
    })

    if (error) {
      setAuthError(error.message)
      return
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">{t('auth.usernameField')}</label>
        <input
          {...register('username')}
          type="text"
          placeholder="seu_username"
          autoComplete="username"
          className={cn(inputBase, errors.username && inputError)}
        />
        <FieldError message={resolveError(errors.username?.message)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t('auth.emailField')}</label>
        <input
          {...register('email')}
          type="email"
          placeholder="email@exemplo.com"
          autoComplete="email"
          className={cn(inputBase, errors.email && inputError)}
        />
        <FieldError message={resolveError(errors.email?.message)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t('auth.passwordField')}</label>
        <input
          {...register('password')}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          className={cn(inputBase, errors.password && inputError)}
        />
        <FieldError message={resolveError(errors.password?.message)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">{t('auth.confirmPasswordField')}</label>
        <input
          {...register('confirmPassword')}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          className={cn(inputBase, errors.confirmPassword && inputError)}
        />
        <FieldError message={resolveError(errors.confirmPassword?.message)} />
      </div>

      {authError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {authError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : t('auth.registerButton')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-foreground underline-offset-4 hover:underline">
          {t('auth.switchToLogin')}
        </Link>
      </p>
    </form>
  )
}

// ── AuthForm (exported) ───────────────────────────────────────────────────────

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const { t } = useAppTranslations()

  return (
    <div className="w-full max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
      </h1>

      {mode === 'login' ? (
        <LoginForm onSuccess={onSuccess} />
      ) : (
        <RegisterForm onSuccess={onSuccess} />
      )}
    </div>
  )
}
