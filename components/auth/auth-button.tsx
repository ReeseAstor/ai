'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function AuthButton({ user }: { user: any }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      toast.success('Signed out successfully')
      router.push('/')
      router.refresh()
    }
  }

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700">
        {user.email}
      </span>
      <button
        onClick={handleSignOut}
        className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
      >
        Sign Out
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <a
        href="/auth/login"
        className="px-4 py-2 text-sm bg-primary-600 text-white hover:bg-primary-700 rounded-md transition-colors"
      >
        Log In
      </a>
      <a
        href="/auth/signup"
        className="px-4 py-2 text-sm border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
      >
        Sign Up
      </a>
    </div>
  )
}