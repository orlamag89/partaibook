'use client'

import { useState, useEffect, useRef } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const VENDOR_TYPES = ['Cake', 'DJ', 'Venue', 'Caterer', 'Decor', 'Photographer', 'Balloons']

function HeroSearch() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [locationOpen, setLocationOpen] = useState(false)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)
  const budgetRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (locationOpen && locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationOpen(false)
      }
      if (budgetOpen && budgetRef.current && !budgetRef.current.contains(event.target as Node)) {
        setBudgetOpen(false)
      }
      if (dateOpen && dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setDateOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen, locationOpen, budgetOpen, dateOpen])

  const toggleVendor = (type: string) => {
    setSelectedVendors(prev =>
      prev.includes(type) ? prev.filter(v => v !== type) : [...prev, type]
    )
  }

  const handleSearch = () => {
    console.log({ selectedVendors, location, budget, date })
  }

  return (
    <div className="relative bg-white border rounded-2xl shadow-lg px-8 py-8 max-w-4xl mx-auto w-full flex flex-wrap md:flex-nowrap items-center gap-4" style={{ minHeight: '120px' }}>
      {/* Vendor Dropdown */}
      <div className="relative w-full md:w-auto" style={{ minWidth: '12rem', maxWidth: '12rem' }} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="border rounded-full px-4 py-2 w-full text-sm bg-gray-50 hover:bg-gray-100 transition text-left text-gray-900 placeholder-gray-500"
          style={{ minWidth: '12rem', maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {selectedVendors.length > 0 ? `${selectedVendors.join(', ')}` : 'What do you need? (e.g. Cake, DJ…)'}
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-2 z-20 bg-white border rounded-xl shadow-lg p-3 w-48" style={{ minWidth: '12rem' }}>
            {VENDOR_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleVendor(type)}
                className={`block w-full text-left px-3 py-1.5 text-sm rounded-md mb-1 text-gray-900 hover:bg-gray-100 ${
                  selectedVendors.includes(type)
                    ? 'font-semibold underline'
                    : ''
                }`}
                style={{ background: 'transparent' }}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Location Input */}
      <div className="w-full md:w-auto" style={{ minWidth: '10rem', maxWidth: '10rem' }}>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Where’s the party?"
          className="border rounded-full px-4 py-2 w-full text-sm bg-gray-50 hover:bg-gray-100 transition text-left text-gray-900 placeholder-gray-900"
          style={{ minWidth: '10rem', maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        />
      </div>

      {/* Budget Input */}
      <div className="w-full md:w-auto" style={{ minWidth: '8rem', maxWidth: '8rem' }}>
        <input
          type="number"
          value={budget}
          onChange={e => setBudget(e.target.value)}
          placeholder="Budget ($)"
          className="border rounded-full px-4 py-2 w-full text-sm bg-gray-50 hover:bg-gray-100 transition text-left text-gray-900 placeholder-gray-900"
          style={{ minWidth: '8rem', maxWidth: '8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        />
      </div>

      {/* Date Dropdown */}
      <div className="relative w-full md:w-auto" style={{ minWidth: '10rem', maxWidth: '10rem' }} ref={dateRef}>
        <button
          onClick={() => setDateOpen(!dateOpen)}
          className="border rounded-full px-4 py-2 w-full text-sm bg-gray-50 hover:bg-gray-100 transition text-left text-gray-900 placeholder-gray-500"
          style={{ minWidth: '10rem', maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {date ? date.toLocaleDateString() : "Date"}
        </button>
        {dateOpen && (
          <div className="absolute top-full left-0 mt-2 z-20 bg-white border rounded-xl shadow-lg p-3 w-56">
            <DatePicker
              selected={date}
              onChange={(d: Date | null) => { setDate(d); setDateOpen(false) }}
              inline
            />
          </div>
        )}
      </div>

      {/* Button */}
      <button
        onClick={handleSearch}
        className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-full shadow hover:bg-indigo-700 transition text-sm"
      >
        Find Vendors
      </button>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-white">
      <section className="text-center py-16 md:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-blue-600 text-4xl font-bold">
            Welcome to PartaiBook 🎉
          </h1>
          <p className="text-gray-600 mb-10 text-lg md:text-xl">
            Plan and book life’s celebrations in minutes with AI.
          </p>

          {/* Smart Search UI */}
          <HeroSearch />

          {/* Dummy Vendor Cards */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border p-6 shadow-lg hover:shadow-xl transition bg-white">
                <div className="h-32 bg-gray-100 mb-4 rounded-xl" />
                <h4 className="font-semibold text-lg">Vendor Name {i}</h4>
                <p className="text-sm text-gray-500">DJ · $250 starting</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="w-full py-20 px-6 bg-gray-50">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-indigo-600 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-3">🎈 1. Tell us your vibe</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Throwing a birthday? Baby shower? Graduation bash? Just drop your vibe, date, location – and your budget. That’s it. Let the magic begin.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-3">⚡ 2. Get instant matches</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Our AI searches live availability to instantly build you a dream team of vendors – decorators, venues, bakers & more. No waiting. No ghosting.
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-3">🪄 3. Book, chat and track</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Book with one tap. Chat directly with vendors. And if someone cancels? The AI auto-finds a replacement or sorts your refund. Zero last-minute stress.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
/* --- END ORIGINAL page.tsx --- */
