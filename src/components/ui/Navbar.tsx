'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Navbar() {
  console.log('Navbar rendered')

  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/' // redirect after logout
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-indigo-600">
        PartaiBook
      </Link>

      <div className="flex gap-4 items-center">
       
        {userEmail ? (
          <>
            <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 transition">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="ml-2 text-sm text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="text-sm text-white bg-indigo-600 px-3 py-1 rounded hover:bg-indigo-700">
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}