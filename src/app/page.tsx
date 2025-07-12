'use client'

import { useState, useEffect, useRef } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const VENDOR_TYPES = ['Cake', 'DJ', 'Venue', 'Caterer', 'Decor', 'Photographer', 'Balloons']

export default function Home() {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [vibe, setVibe] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
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
    console.log({ selectedVendors, location, budget, date, vibe })
  }

  return (
    <main className="min-h-screen w-full bg-white">
      <section className="text-center py-20 md:py-32 px-0 bg-gradient-to-b from-indigo-100 via-pink-100 to-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-indigo-700 text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-sm mb-4 font-sans">
            Welcome to PartaiBook 🎉
          </h1>
          <p className="text-gray-700 mb-12 text-xl md:text-2xl font-medium max-w-2xl mx-auto">
            Plan and book life’s celebrations in minutes with AI.
          </p>

          {/* Smart Search UI */}
          <div id="search-pill" className="relative bg-white border rounded-2xl shadow-lg px-4 md:px-8 py-8 max-w-4xl mx-auto w-full flex flex-col gap-4" style={{ minHeight: '120px' }}>
            {/* Vibe Textarea */}
            <textarea
              value={vibe}
              onChange={e => setVibe(e.target.value)}
              placeholder={'Tell us your vibe (e.g. "7th bday party, dinosaur theme, cake for 20 people, balloons, entertainment, maybe food")'}
              className="w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 hover:bg-gray-100 transition text-gray-900 placeholder-gray-500 resize-none mb-2"
              rows={2}
              style={{ minWidth: '100%', maxWidth: '100%' }}
            />
            {/* Search pill row: all boxes in a row */}
            <div className="w-full flex flex-wrap md:flex-nowrap items-center gap-4 justify-center">
              {/* Location Input */}
              <div className="w-full md:w-auto">
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Location"
                  className="border rounded-full px-4 py-2 w-full text-sm bg-gray-50 hover:bg-gray-100 transition text-left text-gray-900 placeholder-gray-900"
                  style={{ minWidth: 0, maxWidth: '100%' }}
                />
              </div>

              {/* Date Dropdown */}
              <div className="relative w-full md:w-auto" ref={dateRef}>
                <button
                  onClick={() => setDateOpen(!dateOpen)}
                  className="border rounded-full px-4 py-2 w-full text-sm bg-gray-50 hover:bg-gray-100 transition text-left text-gray-900 placeholder-gray-500"
                  style={{ minWidth: 0, maxWidth: '100%' }}
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

              {/* Budget Input */}
              <div className="w-full md:w-auto">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="Budget (optional)"
                  className="border rounded-full px-4 py-2 w-full text-sm bg-gray-50 hover:bg-gray-100 transition text-left text-gray-900 placeholder-gray-900 appearance-none"
                  style={{ minWidth: 0, maxWidth: '100%' }}
                  autoComplete="off"
                />
              </div>

              {/* Button */}
              <button
                onClick={handleSearch}
                className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-full shadow hover:bg-indigo-700 transition text-sm flex items-center justify-center w-full md:w-auto"
                aria-label="Search"
              >
                {/* Search Icon (Magnifying Glass) */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="16.65" y1="16.65" x2="21" y2="21" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Add more space below the search pill */}
          <div className="h-10 md:h-14" />

          {/* Vendor Section Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-6 text-center">Spotlight Vendors</h2>

          {/* Dummy Vendor Cards */}
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-2xl transition bg-white group relative overflow-hidden">
                <div className="h-32 bg-gradient-to-tr from-indigo-100 via-pink-100 to-white mb-4 rounded-xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-indigo-300 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8M12 8v8" />
                  </svg>
                </div>
                <h4 className="font-semibold text-lg text-gray-900 mb-1">Vendor Name {i}</h4>
                <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full mb-2">DJ</span>
                <p className="text-sm text-gray-500 mb-3">$250 starting</p>
                <button className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-full shadow hover:bg-indigo-700 transition text-sm mt-2">View Profile</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="w-full pt-4 pb-12 px-0 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-indigo-700 mb-8 font-sans drop-shadow-sm mt-0 pt-0">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 text-3xl">🎈</span>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">1. Tell us your vibe</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Throwing a birthday? Baby shower? Graduation bash? Just drop your vibe, date, location – even your budget. That’s it. Let the magic begin.
            </p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 text-3xl">⚡</span>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">2. Get instant matches</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Our AI finds venues, bakers, decorators & more - instantly showing who's available so you can browse and book your party in minutes. No waiting. No chasing replies.
            </p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 text-3xl">🪄</span>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">3. Book, chat and track</h3>
            <p className="text-base text-gray-600 leading-relaxed">
               Instant bookings, seamless chats, automatic reminders, and ghosting prevention AI - all beautifully organised in one intuitive event hub. Finally. </p>
          </div>
        </div>
        {/* CTA Button to scroll to search pill */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => {
              const el = document.getElementById('search-pill');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-full shadow-lg text-base transition-all duration-200"
          >
            Let’s get this party started
          </button>
        </div>
      </section>
    </main>
  )
}