'use client'

import { GuestProvider } from '@/contexts/GuestContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <GuestProvider>{children}</GuestProvider>
}
