'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type Vendor = {
  id: number
  name: string
  service_type: string
  location: string
  price_range: string
  about_your_business: string
  email: string
  image_url?: string
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])

  useEffect(() => {
    const fetchVendors = async () => {
      const { data, error } = await supabase.from('vendors').select('*')
      if (error) console.error('Error fetching vendors:', error)
      else setVendors(data)
    }

    fetchVendors()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🎉 Browse Local Vendors</h1>
      {vendors.length === 0 ? (
        <p>No vendors found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
  <Link key={vendor.id} href={`/vendors/${vendor.id}`}>
    <div className="border p-4 rounded shadow hover:shadow-lg transition cursor-pointer">
      <h2 className="text-xl font-semibold">{vendor.name}</h2>
      <p className="text-sm text-gray-600">
        {vendor.service_type} in {vendor.location}
      </p>
      <p className="mt-2 text-sm">{vendor.about_your_business}</p>
      <p className="mt-1 font-medium">{vendor.price_range}</p>
    </div>
  </Link>
))}
        </div>
      )}
    </div>
  )
}