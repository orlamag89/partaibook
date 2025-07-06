'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard') // change this to your post-login destination
      } else {
        router.push('/login')
      }
    })
  }, [router])

  return <p style={{ padding: '2rem' }}>Processing login…</p>
}