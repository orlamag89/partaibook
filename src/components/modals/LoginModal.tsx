'use client'

import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { XMarkIcon as XIcon, CheckIcon } from '@heroicons/react/24/solid'
import { XMarkIcon } from '@heroicons/react/24/outline'
// Removed useLoginModal import; props will be passed in
import Image from 'next/image'



type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)

  // Password requirements logic (must be after state)
  const passwordRequirements = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: "Contains a number or symbol",
      met: /[0-9!@#$%^&*()_+\-\=\[\]{};':"\\|,.<>/?]/.test(password),
    },
    {
      label: "Can't contain your name or email address",
      met: email.length === 0 || (
        password &&
        !password.toLowerCase().includes(email.toLowerCase().split('@')[0]) &&
        !password.toLowerCase().includes(email.toLowerCase())
      ),
    },
  ];

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
          <Dialog.Title className="text-3xl font-medium text-center mb-1" style={{ color: '#222222' }}>
            Welcome to <span style={{ color: '#222222' }}>PartaiBook</span>
          </Dialog.Title>
          <p className="text-center text-sm mb-6" style={{ color: '#222222' }}>
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

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary pr-16"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-black px-2 py-1 rounded focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Password requirements */}
            {isSigningUp && passwordFocused && (
              <div className="mt-1 mb-0">
                <div className="text-[12px] font-medium mb-0 text-gray-700 flex items-center gap-2">
                  Password strength:
                  {passwordRequirements.every(req => req.met) ? (
                    <span className="font-medium" style={{ color: '#10B981' }}>good</span>
                  ) : (
                    <span className="font-medium" style={{ color: '#D93900' }}>weak</span>
                  )}
                </div>
                <ul className="space-y-0">
                  {passwordRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                      {req.met ? (
                        <CheckIcon className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                      ) : (
                        <XIcon className="w-3.5 h-3.5" style={{ color: '#D93900' }} />
                      )}
                      <span className={req.met ? "text-[12px] font-medium" : "text-[12px] font-medium"} style={{ color: req.met ? '#10B981' : '#D93900' }}>{req.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
          <p className="text-center text-sm mt-4" style={{ color: '#222222' }}>
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