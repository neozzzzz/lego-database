'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/auth-context'
import LoginModal from '@/components/login-modal'
import type { Product, Category } from '@/lib/types'

const EXTERNAL_LINKS = [
  { name: 'LEGO', url: (num: string) => `https://www.lego.com/search?q=${num}` },
  { name: 'BrickLink', url: (num: string) => `https://www.bricklink.com/v2/search.page?q=${num}` },
  { name: 'Brickset', url: (num: string) => `https://brickset.com/sets?query=${num}` },
  { name: 'Rebrickable', url: (num: string) => `https://rebrickable.com/search/?q=${num}` },
  { name: '브릭인사이드', url: (num: string) => `https://www.brickinside.com/search?q=${num}` },
]

const SEARCH_LINKS = [
  { name: 'Google', label: 'G', url: (q: string) => `https://www.google.com/search?q=LEGO+${q}` },
  { name: 'YouTube', label: '▶', url: (q: string) => `https://www.youtube.com/results?search_query=LEGO+${q}` },
  { name: 'Naver', label: 'N', url: (q: string) => `https://search.naver.com/search.naver?query=레고+${q}` },
]

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [liked, setLiked] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user, isAdmin, signInWithGoogle, signOut } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    fetchProduct()
  }, [id])

  useEffect(() => {
    if (user && id) checkLiked()
  }, [user, id])

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

  async function checkLiked() {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user!.id)
      .eq('product_id', id)
      .maybeSingle()
    setLiked(!!data)
  }

  async function toggleLike() {
    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (liked) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('product_id', id)
      setLiked(false)
    } else {
      await supabase.from('likes').insert({ user_id: user.id, product_id: id })
      setLiked(true)
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">로딩 중...</div>
      </div>
    )
  }

  const year = product.release_date ? new Date(product.release_date).getFullYear() : null
  const searchQuery = product.product_number || product.name_en || product.name_ko

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => history.back()} className="text-muted hover:text-white transition-colors text-lg">
              ←
            </button>
            <h1 className="text-lg font-bold truncate flex-1">{product.name_ko}</h1>
            <nav className="flex items-center gap-3 shrink-0">
              {isAdmin && (
                <Link href="/admin" className="text-blue-400 hover:text-blue-300 text-xs">관리자</Link>
              )}
              {user ? (
                <Link href="/my" className="text-muted hover:text-white text-xs">내 정보</Link>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
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
            </nav>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
        {/* 이미지 */}
        {product.image_url && (
          <div className="card-threads p-2 mb-5">
            <img
              src={product.image_url}
              alt={product.name_ko}
              className="w-full max-h-96 object-contain rounded-xl bg-white"
            />
          </div>
        )}

        {/* 이름 + 카테고리 */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold">{product.name_ko}</h2>
          {product.name_en && (
            <p className="text-muted text-sm mt-0.5">{product.name_en}</p>
          )}
          {category && (
            <Link href={`/category/${category.slug}`}>
              <span className="text-muted text-xs hover:text-white transition-colors">{category.name}</span>
            </Link>
          )}
        </div>

        {/* 스탯 박스 */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="card-threads text-center py-3">
            <div className="text-xl font-bold">{year || '-'}</div>
            <div className="text-[11px] text-muted mt-0.5">년도</div>
          </div>
          <div className="card-threads text-center py-3">
            <div className="text-xl font-bold">{product.piece_count?.toLocaleString() || '-'}</div>
            <div className="text-[11px] text-muted mt-0.5">부품</div>
          </div>
          <div className="card-threads text-center py-3">
            <div className="text-xl font-bold">{product.product_number || '-'}</div>
            <div className="text-[11px] text-muted mt-0.5">ID</div>
          </div>
        </div>

        {/* 외부 링크 */}
        {product.product_number && (
          <div className="flex flex-wrap gap-2 mb-4">
            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.url(product.product_number!)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--secondary)', border: '1px solid var(--border)',
                  color: 'var(--foreground)', padding: '6px 14px', borderRadius: '9999px',
                  fontSize: '13px', fontWeight: 500, transition: 'background 0.2s',
                  textDecoration: 'none', display: 'inline-block',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--secondary)')}
              >
                {link.name}
              </a>
            ))}
          </div>
        )}

        {/* 검색 + 좋아요 */}
        <div className="flex items-center gap-2 mb-6">
          {SEARCH_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url(searchQuery)}
              target="_blank"
              rel="noopener noreferrer"
              title={link.name}
              style={{
                background: 'var(--secondary)', border: '1px solid var(--border)',
                width: '40px', height: '40px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px', fontWeight: 700, color: 'var(--muted)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--foreground)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--secondary)'; e.currentTarget.style.color = 'var(--muted)' }}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={toggleLike}
            style={{
              background: liked ? '#2a1a1a' : 'var(--secondary)',
              border: `1px solid ${liked ? '#4a2020' : 'var(--border)'}`,
              width: '40px', height: '40px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {liked ? '❤️' : '🤍'}
          </button>
        </div>

        {/* 상세 정보 */}
        <div className="card-threads p-5 mb-5">
          <h3 className="font-semibold mb-3 text-sm">제품 정보</h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            {product.price_krw && (
              <div>
                <div className="text-[11px] text-muted">가격 (KRW)</div>
                <div className="text-sm font-medium">{product.price_krw.toLocaleString()}원</div>
              </div>
            )}
            {product.price_usd && (
              <div>
                <div className="text-[11px] text-muted">가격 (USD)</div>
                <div className="text-sm font-medium">${product.price_usd}</div>
              </div>
            )}
            {product.minifig_count !== null && product.minifig_count !== undefined && product.minifig_count > 0 && (
              <div>
                <div className="text-[11px] text-muted">미니피규어</div>
                <div className="text-sm font-medium">{product.minifig_count}개</div>
              </div>
            )}
            {product.age_range && (
              <div>
                <div className="text-[11px] text-muted">연령</div>
                <div className="text-sm font-medium">{product.age_range}</div>
              </div>
            )}
            {product.release_date && (
              <div>
                <div className="text-[11px] text-muted">출시일</div>
                <div className="text-sm font-medium">{product.release_date}</div>
              </div>
            )}
            {product.status && (
              <div>
                <div className="text-[11px] text-muted">상태</div>
                <div className="text-sm font-medium">
                  {product.status === 'active' ? '판매중' : product.status === 'retired' ? '단종' : '출시예정'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 설명 */}
        {product.description && (
          <div className="card-threads p-5">
            <h3 className="font-semibold mb-2 text-sm">설명</h3>
            <p className="text-sm text-muted leading-relaxed">{product.description}</p>
          </div>
        )}
      </section>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="좋아요를 누르려면 로그인이 필요합니다."
      />
    </div>
  )
}
