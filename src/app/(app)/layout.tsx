'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Flame } from 'lucide-react'
import BottomNav from '@/components/ui/BottomNav'
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
    <>
      <main className="page-content">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
