'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import DatePicker from 'react-datepicker'
import HamburgerDrawer from '@/components/ui/HamburgerDrawer'
import 'react-datepicker/dist/react-datepicker.css'
import '@/app/datepicker.css'
import { useSearchContext } from '@/context/SearchContext'

export default function Navbar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const {
    location,
    setLocation,
    budget,
    setBudget,
    vibe,
    setVibe,
    date,
    setDate,
    handleSearch,
  } = useSearchContext()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}

  useEffect(() => {
    setLocation(searchParams.get('location') || '')
    setBudget(searchParams.get('budget') || '')
    setVibe(searchParams.get('vibe') || '')
    const d = searchParams.get('date')
    setDate(d ? new Date(d) : null)
  }, [searchParams, setLocation, setBudget, setVibe, setDate])

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
              onKeyDown={handleKeyDown}
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
              onKeyDown={handleKeyDown}

          />
          <input
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            placeholder="What do you need?"
              onKeyDown={handleKeyDown}
            className="border rounded-full px-4 py-2 w-full text-sm text-black bg-gray-50"
          />
          <input
  value={budget}
  onChange={(e) => setBudget(e.target.value)}
  placeholder="Budget"
    onKeyDown={handleKeyDown}
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