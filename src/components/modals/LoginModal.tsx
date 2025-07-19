'use client'

import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLoginModal } from '@/context/LoginModalContext'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function LoginModal() {
const { isOpen, close } = useLoginModal()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const toggleMode = () => {
    setIsSigningUp(!isSigningUp)
    setMessage('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      const endpoint = isSigningUp ? '/api/signup' : '/api/login'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Auth failed.')
      }

      if (isSigningUp) {
        setMessage('Check your inbox to confirm your email.')
      } else {
        close()
      } 
      
    } catch (err) {
  if (err instanceof Error) {
    setError(err.message || 'Something went wrong')
  } else {
    setError('Something went wrong')
  }
}
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) setError(error.message)
  }

  return (
    <Dialog open={isOpen} onClose={close} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center bg-black/50 p-4">
        <Dialog.Panel className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          {/* Close Button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-transparent p-0 border-none"
            style={{ background: 'transparent', boxShadow: 'none' }}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Headings */}
          <Dialog.Title className="text-3xl font-bold text-center mb-1">
            Welcome to <span className="text-indigo-600">PartaiBook</span>
          </Dialog.Title>
          <p className="text-center text-sm text-gray-500 mb-6">
            {isSigningUp ? 'Create an account to get started' : 'Log in to continue'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Error/Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}

            <button
              type="submit"
              className="w-full bg-white text-indigo-600 py-2 rounded-lg border border-indigo-600 hover:bg-gray-100 transition font-semibold"
            >
              {isSigningUp ? 'Sign Up' : 'Continue'}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-sm mt-4">
            {isSigningUp ? 'Already have an account?' : 'Don’t have an account?'}{' '}
            <button onClick={toggleMode} className="text-indigo-600 hover:underline bg-transparent p-0 border-none" style={{ background: 'transparent', boxShadow: 'none', color: '#2563eb' }}>
              {isSigningUp ? 'Log in' : 'Sign up'}
            </button>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t" />
            <span className="text-xs text-gray-400 uppercase">or</span>
            <div className="flex-1 border-t" />
          </div>

          {/* Google Auth Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 rounded-lg py-2 hover:bg-blue-50 flex justify-center items-center gap-2 transition bg-white text-gray-700 font-medium"
          >
            <Image
  src="https://www.svgrepo.com/show/475656/google-color.svg"
  alt="Google"
  width={20}
  height={20}
  className="h-5 w-5"
/>
            Continue with Google
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}