'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/auth-context'
import type { Product, Category } from '@/lib/types'

export default function ProductsListPage() {
  const { user, isAdmin, signInWithGoogle, signOut } = useAuth()
  const supabaseRef = useRef(createClient())
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name_ko')
  const supabase = supabaseRef.current

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order').then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => { fetchProducts() }, [filterCat, sortBy])

  async function fetchProducts() {
    let query = supabase.from('products').select('*, category:categories(name, slug)')
    if (filterCat) query = query.eq('category_id', filterCat)
    query = query.order(sortBy, { ascending: sortBy === 'name_ko' })
    const { data } = await query
    setProducts(data || [])
  }

  const filtered = products.filter(p =>
    !search ||
    p.name_ko?.toLowerCase().includes(search.toLowerCase()) ||
    p.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    p.product_number?.includes(search)
  )

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-muted hover:text-white transition-colors">←</Link>
              <h1 className="text-lg font-bold">전체 제품</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">{filtered.length}개</span>
              {user ? (
                <>
                  <Link href="/my" className="text-muted hover:text-white transition-colors text-xs">내 정보</Link>
                  <button onClick={signOut} className="text-red-400 hover:text-red-300 text-xs">로그아웃</button>
                </>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={{ background: '#1a1a1a', border: '1px solid #333' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  로그인
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-threads flex-1 text-sm"
          />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input-threads text-sm">
            <option value="">전체</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-threads text-sm">
            <option value="name_ko">이름순</option>
            <option value="price_krw">가격순</option>
            <option value="piece_count">피스순</option>
          </select>
        </div>

        <div className="space-y-3">
          {filtered.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <div className="card-threads p-4 flex items-center gap-4">
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 bg-[hsl(var(--secondary))] rounded-lg flex items-center justify-center text-muted text-xs">No IMG</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {product.product_number && <span className="text-xs text-muted">#{product.product_number}</span>}
                    {(product as any).category && (
                      <span className="text-xs bg-[hsl(var(--secondary))] px-1.5 py-0.5 rounded">{(product as any).category.name}</span>
                    )}
                  </div>
                  <h3 className="font-medium truncate">{product.name_ko}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {product.price_krw && <span className="text-sm text-muted">{product.price_krw.toLocaleString()}원</span>}
                    {product.piece_count && <span className="text-xs text-muted">{product.piece_count.toLocaleString()}pcs</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-muted">제품이 없습니다</div>}
        </div>
      </section>
    </div>
  )
}
