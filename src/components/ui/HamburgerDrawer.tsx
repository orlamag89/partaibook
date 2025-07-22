'use client'

import { Dialog } from '@headlessui/react'
import { useLoginModal } from '@/context/LoginModalContext'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export default function HamburgerDrawer({ className = "" }: { className?: string }) {
  const { open } = useLoginModal()
  const [isOpen, setIsOpen] = useState(false)

  const openDrawer = () => setIsOpen(true)
  const closeDrawer = () => setIsOpen(false)

  return (
    <>
      {/* Hamburger + Account Icon */}
      <button
        onClick={openDrawer}
        className={`flex items-center gap-2 text-foreground hover:text-primary focus:outline-none bg-transparent ${className}`}
        style={{ background: 'transparent' }}
        aria-label="Open menu"
      >
        {/* User Silhouette Icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="8.5" r="4" />
          <path d="M4 19c0-2.5 3.5-4.5 8-4.5s8 2 8 4.5" />
        </svg>
        {/* Hamburger Icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Drawer */}
      <Dialog open={isOpen} onClose={closeDrawer} className="fixed inset-0 z-50">
        {/* Overlay that closes the drawer on click */}
        <div
          className="fixed inset-0 bg-black/20 cursor-pointer z-40"
          onClick={closeDrawer}
          aria-hidden="true"
        />
        <div
          className="fixed top-4 right-4 w-64 bg-white rounded-xl shadow-xl p-6 z-50"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={closeDrawer}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 bg-transparent p-0 border-none"
            style={{ background: 'transparent', boxShadow: 'none' }}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="space-y-4 pt-4">
            <button
              onClick={() => {
                closeDrawer()
                open()
              }}
              className="block text-gray-800 hover:text-indigo-600 hover:underline hover:shadow-[0_2px_8px_0_rgba(99,102,241,0.15)] text-base font-medium bg-transparent p-0 border-none transition-all"
              style={{ background: 'transparent', boxShadow: 'none' }}
            >
              Log in or Sign up
            </button>

            <a href="/vendor-signup" className="block text-gray-800 hover:text-indigo-600 text-base font-medium">
              Become a Vendor
            </a>

            <a href="/help" className="block text-gray-800 hover:text-indigo-600 text-base font-medium">
              Help Centre
            </a>
          </div>
        </div>
      </Dialog>
    </>
  )
}