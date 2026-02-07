'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category } from '@/lib/types'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchProduct()
  }, [id])

  async function fetchProduct() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setProduct(data)
      if (data.category_id) {
        const { data: cat } = await supabase
          .from('categories')
          .select('*')
          .eq('id', data.category_id)
          .single()
        setCategory(cat)
      }
    }
  }

  if (!product) {
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
          <div className="flex items-center gap-3">
            <button onClick={() => history.back()} className="text-muted hover:text-white transition-colors">
              ←
            </button>
            <h1 className="text-lg font-bold truncate">{product.name_ko}</h1>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
        {/* 이미지 */}
        {product.image_url && (
          <div className="card-threads p-2 mb-6">
            <img
              src={product.image_url}
              alt={product.name_ko}
              className="w-full max-h-96 object-contain rounded-xl"
            />
          </div>
        )}

        {/* 기본 정보 */}
        <div className="card-threads p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            {product.product_number && (
              <span className="text-sm text-muted">#{product.product_number}</span>
            )}
            {category && (
              <Link href={`/category/${category.slug}`}>
                <span className="text-xs bg-[hsl(var(--secondary))] px-2 py-0.5 rounded-full">
                  {category.name}
                </span>
              </Link>
            )}
            {product.is_retired && (
              <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">단종</span>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-1">{product.name_ko}</h2>
          {product.name_en && (
            <p className="text-muted text-sm">{product.name_en}</p>
          )}
        </div>

        {/* 스펙 */}
        <div className="card-threads p-5 mb-4">
          <h3 className="font-semibold mb-3">제품 정보</h3>
          <div className="grid grid-cols-2 gap-3">
            {product.price_krw && (
              <div>
                <div className="text-xs text-muted">가격 (KRW)</div>
                <div className="font-medium">{product.price_krw.toLocaleString()}원</div>
              </div>
            )}
            {product.price_usd && (
              <div>
                <div className="text-xs text-muted">가격 (USD)</div>
                <div className="font-medium">${product.price_usd}</div>
              </div>
            )}
            {product.piece_count && (
              <div>
                <div className="text-xs text-muted">피스 수</div>
                <div className="font-medium">{product.piece_count.toLocaleString()}</div>
              </div>
            )}
            {product.minifig_count !== null && product.minifig_count > 0 && (
              <div>
                <div className="text-xs text-muted">미니피규어</div>
                <div className="font-medium">{product.minifig_count}개</div>
              </div>
            )}
            {product.age_range && (
              <div>
                <div className="text-xs text-muted">연령</div>
                <div className="font-medium">{product.age_range}</div>
              </div>
            )}
            {product.release_date && (
              <div>
                <div className="text-xs text-muted">출시일</div>
                <div className="font-medium">{product.release_date}</div>
              </div>
            )}
          </div>
        </div>

        {/* 설명 */}
        {product.description && (
          <div className="card-threads p-5">
            <h3 className="font-semibold mb-2">설명</h3>
            <p className="text-sm text-muted leading-relaxed">{product.description}</p>
          </div>
        )}
      </section>
    </div>
  )
}
