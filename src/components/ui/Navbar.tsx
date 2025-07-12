'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useLoginModal } from '@/context/LoginModalContext'
import HamburgerDrawer from '@/components/ui/HamburgerDrawer'

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const { open } = useLoginModal()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
      <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">
        PartaiBook
      </Link>
      <div className="flex gap-4 items-center">
        <button
          onClick={() => {
            const section = document.getElementById('how-it-works')
            if (section) {
              section.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          className="text-sm font-medium text-gray-700 hover:text-blue-500 transition bg-transparent px-2 py-1 rounded focus:outline-none"
          style={{ background: 'transparent' }}
        >
          How it Works
        </button>
        <HamburgerDrawer />
      </div>
    </nav>
  )
}