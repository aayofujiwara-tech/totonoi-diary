'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PenLine, Building2, BarChart2, User } from 'lucide-react'

const navItems = [
  { href: '/home', icon: Home, label: 'ホーム' },
  { href: '/record', icon: PenLine, label: '記録' },
  { href: '/facilities', icon: Building2, label: '施設' },
  { href: '/dashboard', icon: BarChart2, label: '分析' },
  { href: '/mypage', icon: User, label: 'マイページ' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#1A1A1A] border-t border-[#2E2E2E] z-50">
      <ul className="flex items-stretch h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center h-full gap-0.5 transition-colors duration-150 ${
                  active ? 'text-[#D4853A]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
