// src/app/page.tsx
'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Home() {
  const supabase = createClientComponentClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
        // Add this scopes line to request GBP permissions
        scopes: 'https://www.googleapis.com/auth/business.manage',
      },
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <button onClick={signInWithGoogle} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg">
        Connect to Google
      </button>
    </main>
  )
}