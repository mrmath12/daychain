'use client'

import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <AuthForm mode="register" onSuccess={() => router.push('/home')} />
    </div>
  )
}
