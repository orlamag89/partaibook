'use client'

import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
// Removed useLoginModal import; props will be passed in
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'


type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {

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
        onClose()
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
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center bg-black/20 p-4">
        <Dialog.Panel className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-transparent p-0 border-none"
            style={{ background: 'transparent', boxShadow: 'none' }}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Headings */}
          <Dialog.Title className="text-3xl font-bold text-center mb-1">
            Welcome to <span style={{ color: '#2c3e50' }}>PartaiBook</span>
          </Dialog.Title>
          <p className="text-center text-sm text-gray-500 mb-6">
            {isSigningUp ? 'Create an account to get started' : 'Log in to continue'}
          </p>

          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Error/Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg border border-primary hover:bg-primary/90 transition font-semibold"
            >
              {isSigningUp ? 'Sign Up' : 'Continue'}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-sm mt-4">
            {isSigningUp ? 'Already have an account?' : 'Don’t have an account?'}{' '}
            <button onClick={toggleMode} className="bg-transparent p-0 border-none transition-colors font-semibold" style={{ background: 'transparent', boxShadow: 'none', color: '#a78bfa' }}>
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
            className="w-full border border-gray-300 rounded-lg py-2 hover:bg-primary/10 flex justify-center items-center gap-2 transition bg-white text-foreground font-medium"
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