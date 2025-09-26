// src/app/dashboard/SignOutButton.tsx
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/') // Redirect to homepage after signing out
    router.refresh() // Ensure the page reloads to reflect the signed-out state
  }

  return (
    <button
      onClick={handleSignOut}
      className="mt-6 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
    >
      Sign Out
    </button>
  )
}