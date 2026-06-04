'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Flame } from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'
import SideNav from '@/components/ui/SideNav'
import { useAuth } from '@/hooks/useAuth'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 bg-[#D4853A]/20 rounded-2xl flex items-center justify-center animate-pulse">
          <Flame className="w-6 h-6 text-[#D4853A]" />
        </div>
        <p className="text-xs text-gray-500">読み込み中...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="md:flex md:max-w-[1280px] md:mx-auto md:min-h-dvh">
      <SideNav />
      <main className="flex-1 min-w-0 page-content md:pb-0">
        <div className="md:max-w-[800px] md:mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
