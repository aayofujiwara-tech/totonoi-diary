import BottomNav from '@/components/ui/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="page-content">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
