'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignUp = async () => {
    console.log('Sign Up button clicked')
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      console.error('Supabase Error:', error.message)
      setMessage(error.message)
    } else {
      setMessage('Check your email for the confirmation link')
    }
  }

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('Login Error:', error.message)
      setMessage(error.message)
    } else {
      setMessage('Login successful.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-6 p-6 border rounded shadow-sm">
        <h1 className="text-2xl font-semibold text-center">Login or Sign Up</h1>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleLogin}
            className="flex-1 bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
          >
            Login
          </button>
          <button
            onClick={handleSignUp}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-500"
          >
            Sign Up
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 p-3 rounded text-sm ${
              message.includes('Check your email')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}