'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !isAdmin && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [isAdmin, loading, pathname])

  if (pathname === '/admin/login') return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">로딩 중...</div>
      </div>
    )
  }

  if (!isAdmin) return null

  const navItems = [
    { href: '/admin', label: '대시보드' },
    { href: '/admin/categories', label: '카테고리' },
    { href: '/admin/products', label: '제품' },
  ]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-lg font-bold text-gradient">
                ADMIN
              </Link>
              <nav className="flex items-center gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm transition-colors ${
                      pathname === item.href
                        ? 'text-white font-medium'
                        : 'text-muted hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs text-muted hover:text-white transition-colors">
                사이트 보기
              </Link>
              <button onClick={signOut} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
