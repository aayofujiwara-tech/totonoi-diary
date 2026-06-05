'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { initGuestMode, clearGuestMode } from '@/lib/guest/storage'

type GuestContextType = {
  isGuest: boolean
  activateGuest: () => void
  deactivateGuest: () => void
}

const GuestContext = createContext<GuestContextType>({
  isGuest: false,
  activateGuest: () => {},
  deactivateGuest: () => {},
})

export function GuestProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('totonoi_guest') === 'true'
    }
    return false
  })

  function activateGuest() {
    initGuestMode()
    setIsGuest(true)
  }

  function deactivateGuest() {
    clearGuestMode()
    setIsGuest(false)
  }

  return (
    <GuestContext.Provider value={{ isGuest, activateGuest, deactivateGuest }}>
      {children}
    </GuestContext.Provider>
  )
}

export function useGuest() {
  return useContext(GuestContext)
}
