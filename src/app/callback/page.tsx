'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js';
// Or import your existing supabase client if you have a shared one:
// import supabase from '@/lib/supabaseClient';

// If you have a shared client, use that import and remove the below line.
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

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