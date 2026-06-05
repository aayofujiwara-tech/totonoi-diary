'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PenLine, Building2, BarChart2, User, Flame } from 'lucide-react'
import { useGuest } from '@/contexts/GuestContext'

const navItems = [
  { href: '/home', icon: Home, label: 'ホーム' },
  { href: '/record', icon: PenLine, label: '記録' },
  { href: '/facilities', icon: Building2, label: '施設' },
  { href: '/dashboard', icon: BarChart2, label: '分析' },
  { href: '/mypage', icon: User, label: 'マイページ' },
]

export default function SideNav() {
  const pathname = usePathname()
  const { isGuest } = useGuest()

  return (
    <aside className="hidden md:flex flex-col w-[220px] min-w-[220px] h-screen sticky top-0 bg-[#1A1A1A] border-r border-[#2E2E2E] z-40">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-[#2E2E2E]">
        <div className="w-8 h-8 bg-[#D4853A]/20 rounded-lg flex items-center justify-center">
          <Flame className="w-5 h-5 text-[#D4853A]" />
        </div>
        <span className="font-bold text-white text-lg">ととログ</span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-150 ${
                active
                  ? 'bg-[#D4853A]/15 text-[#D4853A]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {isGuest && (
        <div className="px-3 pb-4">
          <div className="flex items-center gap-2 bg-[#D4853A]/10 border border-[#D4853A]/30 rounded-xl px-3 py-2.5">
            <Flame className="w-3.5 h-3.5 text-[#D4853A] flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#D4853A]">ゲストモード</p>
              <p className="text-[10px] text-gray-500 leading-tight">データはこの端末のみ</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
