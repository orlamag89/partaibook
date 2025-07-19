'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

interface Vendor {
  id: number
  name: string
  category: string
  image: string
  price: number
  location: string
  selected: boolean
}

interface Props {
  vendors: Vendor[]
}

export default function CategoryVendors({ vendors }: Props) {
  const grouped = vendors.reduce((acc: Record<string, Vendor[]>, vendor) => {
    if (!acc[vendor.category]) acc[vendor.category] = []
    acc[vendor.category].push(vendor)
    return acc
  }, {})

  const [selectedVendors, setSelectedVendors] = useState<Set<number>>(new Set())
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const toggleVendorSelection = (id: number) => {
    setSelectedVendors(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const scrollLeft = (category: string) => {
    const el = scrollRefs.current[category]
    if (el) el.scrollBy({ left: -250, behavior: 'smooth' })
  }

  const scrollRight = (category: string) => {
    const el = scrollRefs.current[category]
    if (el) el.scrollBy({ left: 250, behavior: 'smooth' })
  }

  return (
    <div className="space-y-16">
      {Object.entries(grouped).map(([category, categoryVendors]) => {
        const showArrows = categoryVendors.length > 7;

        return (
          <div key={category} className="relative w-full">
            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {categoryVendors.length} {category}s available
            </h2>

            <div className="relative overflow-hidden w-[calc(7*200px)] mx-auto">
              {/* Arrows */}
              {showArrows && (
                <>
                  <button
                    onClick={() => scrollLeft(category)}
                    className="absolute -left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow p-2 rounded-full hidden md:block"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => scrollRight(category)}
                    className="absolute -right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow p-2 rounded-full hidden md:block"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}

              {/* Scrollable vendor row */}
              <div
                ref={el => { scrollRefs.current[category] = el }}
                className={`flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory`}
              >
                {categoryVendors.map(v => (
                  <div
                    key={v.id}
                    className="snap-start relative min-w-[185px] max-w-[185px] rounded-2xl border border-gray-100 bg-white shadow hover:shadow-md transition overflow-hidden"
                  >
                    {/* Checkbox */}
                    <div className="absolute top-2 right-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedVendors.has(v.id)}
                        onChange={() => toggleVendorSelection(v.id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </div>

                    <Image
                      src={v.image}
                      alt={v.name}
                      width={400}
                      height={160}
                      className="w-full h-40 object-cover rounded-t-2xl"
                    />
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{v.name}</h3>
                      <p className="text-xs text-gray-500 mb-1">{v.location}</p>
                      <p className="text-sm text-gray-700 font-medium">${v.price}+</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      {/* Sticky Vendor Cart */}
      {selectedVendors.size > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-indigo-600 text-white py-3 px-6 flex justify-between items-center z-50">
          <span>{selectedVendors.size} vendor{selectedVendors.size > 1 ? 's' : ''} selected</span>
          <button className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-full shadow hover:bg-gray-100">
            Review Selections
          </button>
        </div>
      )}
    </div>
  )
}