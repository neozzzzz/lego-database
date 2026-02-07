'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Category, Product } from '@/lib/types'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name_ko')
  const supabase = createClient()

  useEffect(() => {
    fetchCategory()
  }, [slug])

  useEffect(() => {
    if (category) fetchProducts()
  }, [category, sortBy])

  async function fetchCategory() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
    setCategory(data)
  }

  async function fetchProducts() {
    if (!category) return
    let query = supabase
      .from('products')
      .select('*')
      .eq('category_id', category.id)
      .order(sortBy, { ascending: sortBy === 'name_ko' })

    const { data } = await query
    setProducts(data || [])
  }

  const filtered = products.filter(p =>
    !search ||
    p.name_ko.toLowerCase().includes(search.toLowerCase()) ||
    p.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    p.product_number?.includes(search)
  )

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-[hsl(var(--border))]">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-muted hover:text-white transition-colors">
                ←
              </Link>
              <h1 className="text-lg font-bold">{category.name}</h1>
            </div>
            <span className="text-xs text-muted">{filtered.length}개 제품</span>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-6">
        {/* 검색 + 정렬 */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="검색 (이름, 번호)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-threads flex-1 text-sm"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-threads text-sm"
          >
            <option value="name_ko">이름순</option>
            <option value="price_krw">가격순</option>
            <option value="piece_count">피스순</option>
            <option value="release_date">출시일순</option>
          </select>
        </div>

        {/* 제품 목록 */}
        <div className="space-y-3">
          {filtered.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <div className="card-threads p-4 flex items-center gap-4">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name_ko}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-[hsl(var(--secondary))] rounded-lg flex items-center justify-center text-muted text-xs">
                    No IMG
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {product.product_number && (
                      <span className="text-xs text-muted">{product.product_number}</span>
                    )}
                    {product.is_retired && (
                      <span className="text-xs bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded">단종</span>
                    )}
                    {product.status === 'upcoming' && (
                      <span className="text-xs bg-blue-900/50 text-blue-400 px-1.5 py-0.5 rounded">출시예정</span>
                    )}
                  </div>
                  <h3 className="font-medium truncate">{product.name_ko}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {product.price_krw && (
                      <span className="text-sm text-muted">{product.price_krw.toLocaleString()}원</span>
                    )}
                    {product.piece_count && (
                      <span className="text-xs text-muted">{product.piece_count.toLocaleString()}pcs</span>
                    )}
                    {product.age_range && (
                      <span className="text-xs text-muted">{product.age_range}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted">
              제품이 없습니다
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
