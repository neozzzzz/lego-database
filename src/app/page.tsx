'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/auth-context'
import type { Category } from '@/lib/types'

export default function HomePage() {
  const { isAdmin } = useAuth()
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
