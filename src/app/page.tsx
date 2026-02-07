'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/auth-context'
import type { Category } from '@/lib/types'

export default function HomePage() {
  const { user, isAdmin, signInWithGoogle, signOut } = useAuth()
  const [categories, setCategories] = useState<(Category & { product_count: number })[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    // 카테고리 + 제품 수
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (cats) {
      const withCounts = await Promise.all(
        cats.map(async (cat) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id)
          return { ...cat, product_count: count || 0 }
        })
      )
      setCategories(withCounts)
      setTotalProducts(withCounts.reduce((sum, c) => sum + c.product_count, 0))
    }
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gradient">
              LEGO ARCHIVE
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/products" className="text-muted hover:text-white transition-colors text-sm">
                전체 제품
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
                  관리자
                </Link>
              )}
              {user ? (
                <Link href="/my" className="text-muted hover:text-white transition-colors text-sm">
                  내 정보
                </Link>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: '#1a1a1a', border: '1px solid #333' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  로그인
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 히어로 */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="text-4xl font-bold">
            레고 제품
            <br />
            <span className="text-gradient">데이터베이스</span>
          </h2>
          <p className="text-muted max-w-md mx-auto">
            카테고리별로 정리된 레고 제품 정보
          </p>
        </div>
      </section>

      {/* 통계 */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 gap-4">
          <div className="card-threads text-center p-6">
            <div className="text-3xl font-bold text-gradient">{categories.length}</div>
            <div className="text-muted text-sm mt-1">카테고리</div>
          </div>
          <div className="card-threads text-center p-6">
            <div className="text-3xl font-bold text-gradient">{totalProducts.toLocaleString()}</div>
            <div className="text-muted text-sm mt-1">제품</div>
          </div>
        </div>
      </section>

      {/* 카테고리 그리드 */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h3 className="text-lg font-semibold mb-4">카테고리</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`}>
              <div className="card-threads p-5 space-y-2 cursor-pointer">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{cat.name}</h4>
                  <span className="text-xs text-muted">{cat.product_count}개</span>
                </div>
                {cat.description && (
                  <p className="text-sm text-muted line-clamp-2">{cat.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-center text-muted text-sm">
            LEGO ARCHIVE — 레고 제품 데이터베이스
          </p>
        </div>
      </footer>
    </div>
  )
}
