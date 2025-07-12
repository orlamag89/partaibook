 import React from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

const mockData = [
  {
    category: 'Bakers',
    vendors: [
      {
        id: 1,
        name: 'Sweet Bites Bakery',
        location: 'Jakarta',
        rating: 4,
        image: '/next.svg',
      },
      {
        id: 2,
        name: 'Cake Heaven',
        location: 'Bandung',
        rating: 5,
        image: '/vercel.svg',
      },
    ],
  },
  {
    category: 'Venues',
    vendors: [
      {
        id: 3,
        name: 'Grand Hall',
        location: 'Surabaya',
        rating: 5,
        image: '/file.svg',
      },
      {
        id: 4,
        name: 'Garden Space',
        location: 'Yogyakarta',
        rating: 4,
        image: '/globe.svg',
      },
    ],
  },
  {
    category: 'Decorators',
    vendors: [
      {
        id: 5,
        name: 'Bloom Studio',
        location: 'Bali',
        rating: 5,
        image: '/window.svg',
      },
      {
        id: 6,
        name: 'Party Perfect',
        location: 'Medan',
        rating: 3,
        image: '/next.svg',
      },
    ],
  },
]

function Rating({ value }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= value ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

export default function SearchResults() {
  return (
    <div className="space-y-10 p-4">
      {mockData.map((group) => (
        <div key={group.category}>
          <h2 className="text-xl font-semibold mb-4">{group.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {group.vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col"
              >
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-medium text-lg">{vendor.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{vendor.location}</p>
                  <Rating value={vendor.rating} />
                  <div className="mt-auto pt-4">
                    <Link href={`/vendors/${vendor.id}`}
                      className="inline-block w-full">
                      <Button className="w-full">View Profile</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}