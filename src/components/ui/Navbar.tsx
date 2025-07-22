'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react';
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
    <nav className="w-full bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
      {/* Brand: Sparkles icon is 1.5rem (24px), text is 1.5rem (24px) bold */}
      <Link href="/" className="flex items-center space-x-2 font-bold text-foreground font-sans tracking-tight -ml-8">
        <Sparkles className="h-8 w-8 text-primary" />
        <span style={{ fontSize: '26px' }}>PartaiBook</span>
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

      <div className="flex gap-1 items-center mr-[-32px]">
        {pathname !== '/search' && (
          <button
            onClick={() => {
              const section = document.getElementById('how-it-works')
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="text-base font-normal text-foreground hover:text-primary transition bg-transparent px-4 py-2 rounded focus:outline-none font-sans mr-2"
          >
            How it works
          </button>
        )}
        <div className="ml-1">
          <button className="bg-primary hover:bg-primary/90 transition-colors rounded-sm p-2 flex items-center justify-center" aria-label="Open menu">
            <HamburgerDrawer className="text-white" />
          </button>
        </div>
      </div>
      </div>
      {/* border line removed, now handled in page.tsx */}
    </nav>
  )
}