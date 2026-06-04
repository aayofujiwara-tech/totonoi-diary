'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PenLine, Building2, BarChart2, User, Flame } from 'lucide-react'

const navItems = [
  { href: '/home', icon: Home, label: 'ホーム' },
  { href: '/record', icon: PenLine, label: '記録' },
  { href: '/facilities', icon: Building2, label: '施設' },
  { href: '/dashboard', icon: BarChart2, label: '分析' },
  { href: '/mypage', icon: User, label: 'マイページ' },
]

export default function SideNav() {
  const pathname = usePathname()

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
    </aside>
  )
}
