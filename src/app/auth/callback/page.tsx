// src/app/auth/callback/page.tsx

'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next') || '/dashboard'

    if (code) {
      const exchangeCode = async () => {
        // We call our own API route to securely handle the code exchange
        const res = await fetch(`/api/auth/callback?code=${code}`, {
          method: 'GET',
        })

        if (res.ok) {
          // If the exchange was successful, redirect to the dashboard
          router.push(next)
        } else {
          // Handle error, maybe redirect to an error page or homepage
          console.error("Failed to exchange code for session");
          router.push('/')
        }
      }
      exchangeCode()
    } else {
        // If no code is present, just redirect home
        router.push('/')
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Please wait while we sign you in...</p>
    </div>
  )
}