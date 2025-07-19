'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import { supabase } from '@/lib/supabaseClient'
import { useLoginModal } from '@/context/LoginModalContext'
import HamburgerDrawer from '@/components/ui/HamburgerDrawer'
import 'react-datepicker/dist/react-datepicker.css'
import '@/app/datepicker.css'

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const { open } = useLoginModal()

  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [vibe, setVibe] = useState('')
  const [date, setDate] = useState<Date | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    })

    setLocation(searchParams.get('location') || '')
    setBudget(searchParams.get('budget') || '')
    setVibe(searchParams.get('vibe') || '')
    const d = searchParams.get('date')
    setDate(d ? new Date(d) : null)
  }, [searchParams])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.append('location', location)
    if (budget) params.append('budget', budget)
    if (vibe) params.append('vibe', vibe)
    if (date) params.append('date', date.toISOString())
    router.push(`/search?${params.toString()}`)
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">
        PartaiBook
      </Link>

      {pathname === '/search' && (
        <div className="w-full max-w-2xl mx-4 flex items-center gap-2">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where"
            className="border rounded-full px-4 py-2 w-full text-sm text-black bg-gray-50"
          />
          <DatePicker
            selected={date}
            onChange={(d: Date | null) => setDate(d)}
            placeholderText="When"
            dateFormat="MMMM d, yyyy"
            calendarStartDay={1}
            minDate={new Date()}
            monthsShown={1}
            className="border rounded-full px-4 py-2 w-full text-sm text-black bg-gray-50"
            calendarClassName="airbnb-calendar"
          />
          <input
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            placeholder="What do you need?"
            className="border rounded-full px-4 py-2 w-full text-sm text-black bg-gray-50"
          />
          <button
            onClick={handleSearch}
            className="text-2xl px-3 py-2 text-black hover:text-indigo-600"
            aria-label="Search"
          >
            🔍
          </button>
        </div>
      )}

      <div className="flex gap-4 items-center">
        {pathname !== '/search' && (
          <button
            onClick={() => {
              const section = document.getElementById('how-it-works')
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="text-sm font-medium text-gray-700 hover:text-blue-500 transition bg-transparent px-2 py-1 rounded focus:outline-none"
          >
            How it Works
          </button>
        )}
        <HamburgerDrawer />
      </div>
    </nav>
  )
}