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
        className={`group flex items-center gap-2 focus:outline-none bg-primary hover:bg-primary/90 transition-colors rounded-full px-4 py-2 ${className}`}
        aria-label="Open menu"
      >
        {/* User Silhouette Icon */}
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="8.5" r="4" />
          <path d="M4 19c0-2.5 3.5-4.5 8-4.5s8 2 8 4.5" />
        </svg>
        {/* Hamburger Icon */}
        <svg className="w-[22px] h-[22px] text-white group-hover:stroke-white transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Drawer */}
      <Dialog open={isOpen} onClose={closeDrawer} className="fixed inset-0 z-50">
        {/* No overlay, modal only */}
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
              className="block text-base font-normal text-foreground hover:text-primary transition bg-transparent p-0 border-none focus:outline-none font-sans"
              style={{ background: 'transparent', boxShadow: 'none' }}
            >
              Log in or Sign up
            </button>

            <a
              href="/vendor-signup"
              className="block text-base font-normal text-foreground hover:text-primary transition bg-transparent p-0 border-none focus:outline-none font-sans"
              style={{ background: 'transparent', boxShadow: 'none' }}
            >
              Become a Vendor
            </a>

            <a
              href="/help"
              className="block text-base font-normal text-foreground hover:text-primary transition bg-transparent p-0 border-none focus:outline-none font-sans"
              style={{ background: 'transparent', boxShadow: 'none' }}
            >
              Help Centre
            </a>
          </div>
        </div>
      </Dialog>
    </>
  )
}