'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category } from '@/lib/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  useEffect(() => { fetchProducts() }, [filterCat])

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data || [])
  }

  async function fetchProducts() {
    let query = supabase.from('products').select('*, category:categories(name, slug)').order('created_at', { ascending: false })
    if (filterCat) query = query.eq('category_id', filterCat)
    const { data } = await query
    setProducts(data || [])
  }

  async function deleteProduct(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  const filtered = products.filter(p =>
    !search ||
    p.name_ko?.toLowerCase().includes(search.toLowerCase()) ||
    p.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    p.product_number?.includes(search)
  )

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">제품 관리</h1>
        <Link href="/admin/products/new" className="btn-primary text-sm">
          추가
        </Link>
      </div>

      {/* 필터 */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-threads flex-1 text-sm"
        />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="input-threads text-sm"
        >
          <option value="">전체 카테고리</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="text-xs text-muted mb-3">{filtered.length}개 제품</div>

      <div className="space-y-3">
        {filtered.map((product) => (
          <div key={product.id} className="card-threads p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {product.image_url ? (
                <img src={product.image_url} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-[hsl(var(--secondary))] rounded-lg flex items-center justify-center text-muted text-xs flex-shrink-0">
                  N/A
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {product.product_number && <span className="text-xs text-muted">#{product.product_number}</span>}
                  {(product as any).category && (
                    <span className="text-xs bg-[hsl(var(--secondary))] px-1.5 py-0.5 rounded">
                      {(product as any).category.name}
                    </span>
                  )}
                </div>
                <h3 className="font-medium truncate">{product.name_ko}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <Link href={`/admin/products/${product.id}/edit`} className="btn-secondary text-xs py-1 px-3">
                수정
              </Link>
              <button onClick={() => deleteProduct(product.id)} className="btn-danger text-xs py-1 px-3">
                삭제
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted">제품이 없습니다</div>
        )}
      </div>
    </div>
  )
}
