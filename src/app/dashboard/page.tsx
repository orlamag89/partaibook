'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    })
  }, [])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">🎉 Welcome to your PartaiBook Dashboard</h1>
      <p className="text-gray-700 mb-2">
        This is where your event planning begins.
      </p>
      {userEmail && (
        <p className="text-sm text-gray-500">Logged in as <strong>{userEmail}</strong></p>
      )}
    </div>
  )
}