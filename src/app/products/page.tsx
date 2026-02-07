'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category } from '@/lib/types'

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name_ko')
  const supabase = createClient()

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
            <span className="text-xs text-muted">{filtered.length}개</span>
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
