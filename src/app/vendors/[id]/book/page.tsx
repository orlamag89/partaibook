'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function BookVendor() {
  const router = useRouter()
  const params = useParams()
  const vendorId = params?.id as string

  console.log("BOOKING PAGE RENDERED", params)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    event_type: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('bookings').insert([
      {
        vendor_id: vendorId,
        ...formData,
      },
    ])

    setLoading(false)

    if (!error) {
      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        event_type: '',
        message: '',
      })
      setTimeout(() => router.push('/dashboard'), 2000)
    } else {
      alert('Something went wrong. Please try again.')
      console.error(error)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-4">Book this Vendor</h1>

      {success ? (
        <p className="text-green-600 font-medium">✅ Booking submitted! Redirecting...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="event_type"
            placeholder="Type of Event (e.g. Birthday)"
            value={formData.event_type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <textarea
            name="message"
            placeholder="Extra details or requests"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border rounded"
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Booking...' : 'Submit Booking'}
          </button>
        </form>
      )}
    </div>
  )
}