'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import CategoryVendors from '@/components/CategoryVendors'

const mockVendors = [
  { id: 1, name: 'DJ Max', category: 'DJ', image: '/vendors/djmax.jpg', price: 300, location: 'Brooklyn, NY' },
  { id: 2, name: 'Cake Queen', category: 'Baker', image: '/vendors/cakequeen.jpg', price: 120, location: 'Queens, NY' },
  { id: 3, name: 'Balloon Bliss', category: 'Decor', image: '/vendors/balloonbliss.jpg', price: 150, location: 'Bronx, NY' },
  { id: 4, name: 'MC Vibe', category: 'DJ', image: '/vendors/mcvibe.jpg', price: 400, location: 'Manhattan, NY' },
  { id: 5, name: 'The Sweet Spot', category: 'Baker', image: '/vendors/sweetspot.jpg', price: 100, location: 'Harlem, NY' },
  { id: 6, name: 'Twinkle Lights Co.', category: 'Decor', image: '/vendors/twinklelights.jpg', price: 180, location: 'Brooklyn, NY' },
  { id: 7, name: 'DJ Echo', category: 'DJ', image: '/vendors/djecho.jpg', price: 350, location: 'Queens, NY' },
  { id: 8, name: 'Flour & Frosting', category: 'Baker', image: '/vendors/flourfrosting.jpg', price: 140, location: 'Bronx, NY' },
  { id: 9, name: 'Bloom & Bash', category: 'Decor', image: '/vendors/bloombash.jpg', price: 200, location: 'Manhattan, NY' },
  { id: 10, name: 'DJ Max', category: 'DJ', image: '/vendors/djmax.jpg', price: 300, location: 'Brooklyn, NY' },
  { id: 11, name: 'Cake Queen', category: 'Baker', image: '/vendors/cakequeen.jpg', price: 120, location: 'Queens, NY' },
  { id: 12, name: 'Balloon Bliss', category: 'Decor', image: '/vendors/balloonbliss.jpg', price: 150, location: 'Bronx, NY' },
  { id: 13, name: 'MC Vibe', category: 'DJ', image: '/vendors/mcvibe.jpg', price: 400, location: 'Manhattan, NY' },
  { id: 14, name: 'The Sweet Spot', category: 'Baker', image: '/vendors/sweetspot.jpg', price: 100, location: 'Harlem, NY' },
  { id: 15, name: 'Twinkle Lights Co.', category: 'Decor', image: '/vendors/twinklelights.jpg', price: 180, location: 'Brooklyn, NY' },
  { id: 16, name: 'DJ Echo', category: 'DJ', image: '/vendors/djecho.jpg', price: 350, location: 'Queens, NY' },
  { id: 17, name: 'Flour & Frosting', category: 'Baker', image: '/vendors/flourfrosting.jpg', price: 140, location: 'Bronx, NY' },
  { id: 18, name: 'Bloom & Bash', category: 'Decor', image: '/vendors/bloombash.jpg', price: 200, location: 'Manhattan, NY' },
  { id: 19, name: 'DJ Max', category: 'DJ', image: '/vendors/djmax.jpg', price: 300, location: 'Brooklyn, NY' },
  { id: 20, name: 'DJ Max', category: 'DJ', image: '/vendors/djmax.jpg', price: 300, location: 'Brooklyn, NY' },
  { id: 21, name: 'The Sweet Spot', category: 'Baker', image: '/vendors/sweetspot.jpg', price: 100, location: 'Harlem, NY' },


]

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [vibe, setVibe] = useState('')
  const [date, setDate] = useState<Date | null>(null)

  useEffect(() => {
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

  // Count vendors
  const totalResults = mockVendors.length
  const categoryCounts = mockVendors.reduce((acc: Record<string, number>, vendor) => {
    acc[vendor.category] = (acc[vendor.category] || 0) + 1
    return acc
  }, {})

  return (
    <main className="min-h-screen w-full bg-white">
  {/* Results count */}
  <section className="px-2 sm:px-4 md:px-6 lg:px-8 max-w-[95rem] mx-auto mt-4">
    <h1 className="text-xl font-semibold text-gray-800 mb-4">
      🎉 {totalResults} local vendors found for your party!
    </h1>

        {/* Category display with count per category */}
        {Object.entries(categoryCounts).map(([category, count]) => (
          <div key={category} className="mb-10">
            <h2 className="text-lg font-bold text-gray-700 mb-2">
              {count} {category}{count > 1 ? 's' : ''} available
            </h2>
            <CategoryVendors
              vendors={mockVendors.filter((v, index) => v.category === category)}
              withLeftPadding={true} // used to help arrow spacing inside component
            />
          </div>
        ))}
      </section>
    </main>
  )
}
