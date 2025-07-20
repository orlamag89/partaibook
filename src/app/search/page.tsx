'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import CategoryVendors from '@/components/CategoryVendors'
import { supabase } from '@/lib/supabaseClient'

interface Vendor {
  id: string
  name: string
  category: string
  image: string
  price: number
  location: string
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [vendors, setVendors] = useState<Vendor[]>([])
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

  useEffect(() => {
  const fetchVendors = async () => {
    let query = supabase.from('vendors').select('*')

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (budget) {
      query = query.lte('price', parseFloat(budget))
    }

    if (vibe) {
      query = query.or(`service_type.ilike.%${vibe}%,about_your_business.ilike.%${vibe}%`)
    }

    // Add this if you're planning to filter by vendor availability date
    if (date) {
      // For now, just log it — actual filtering depends on how you store vendor availability
      console.log("Date filtering placeholder:", date.toISOString())
      // If you add availability logic, use this:
      // query = query.gte('available_from', date.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching vendors:', error)
    } else {
      setVendors(data)
    }
  }

  fetchVendors()
}, [location, budget, vibe, date]) // date filtering would be done separately if vendors had availability

  const totalResults = vendors.length
  const categoryCounts = vendors.reduce((acc: Record<string, number>, vendor) => {
    acc[vendor.category] = (acc[vendor.category] || 0) + 1
    return acc
  }, {})

  return (
    <main className="min-h-screen w-full bg-white">
      <section className="px-2 sm:px-4 md:px-6 lg:px-8 max-w-[95rem] mx-auto mt-4">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          🎉 {totalResults} local vendors found for your party!
        </h1>

        {Object.entries(categoryCounts).map(([category, count]) => (
          <div key={category} className="mb-10">
            <h2 className="text-lg font-bold text-gray-700 mb-2">
              {count} {category}
              {typeof count === 'number' && count > 1 ? 's' : ''}
            </h2>
            <CategoryVendors
              vendors={vendors.filter((v) => v.category === category)}
              withLeftPadding={true}
            />
          </div>
        ))}
      </section>
    </main>
  )
}