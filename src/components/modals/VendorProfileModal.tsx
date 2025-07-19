'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Image from 'next/image'
interface VendorProfileModalProps {
  isOpen: boolean
  onClose: () => void
  vendor: {
    id: number
    name: string
    image: string
    rating: number
    location: string
    category: string
    price: string
    description?: string
  }
}

export default function VendorProfileModal({ isOpen, onClose, vendor }: VendorProfileModalProps) {
  if (!vendor) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                {/* X Button */}
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl focus:outline-none"
                >
                  ×
                </button>

                {/* Vendor Image */}
                <div className="h-52 w-full bg-gray-100 rounded-xl mb-4 overflow-hidden">
                  <Image
  src={vendor.image}
  alt={vendor.name}
  width={600}
  height={300}
  className="w-full h-full object-cover"
/>
                </div>

                {/* Vendor Info */}
                <div className="space-y-1 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{vendor.name}</h3>
                  <p className="text-sm text-gray-600">{vendor.category} · {vendor.location}</p>
                  <p className="text-sm text-yellow-600">⭐ {vendor.rating} / 5</p>
                </div>

                {/* Vendor Description */}
                <p className="text-gray-700 text-sm mb-6">
                  {vendor.description || 'This vendor hasn’t added a description yet. Check availability or contact them to learn more!'}
                </p>

                {/* CTA Button */}
                <button
                  onClick={() => alert('Booking flow coming soon!')}
                  className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-xl shadow hover:bg-indigo-700 transition text-sm"
                >
                  Check Availability
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
