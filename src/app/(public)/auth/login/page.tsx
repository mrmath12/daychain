'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <AuthForm mode="login" onSuccess={() => router.push(searchParams.get('next') ?? '/home')} />
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense>
        <LoginContent />
      </Suspense>
    </div>
  )
}
