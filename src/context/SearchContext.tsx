'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type SearchContextType = {
  location: string
  budget: string
  vibe: string
  date: Date | null
  setLocation: (value: string) => void
  setBudget: (value: string) => void
  setVibe: (value: string) => void
  setDate: (value: Date | null) => void
  handleSearch: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [vibe, setVibe] = useState('')
  const [date, setDate] = useState<Date | null>(null)

  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.append('location', location)
    if (budget) params.append('budget', budget)
    if (vibe) params.append('vibe', vibe)
    if (date) params.append('date', date.toISOString())
    router.push(`/search?${params.toString()}`)
  }

  return (
    <SearchContext.Provider
      value={{
        location,
        budget,
        vibe,
        date,
        setLocation,
        setBudget,
        setVibe,
        setDate,
        handleSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export const useSearchContext = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
}