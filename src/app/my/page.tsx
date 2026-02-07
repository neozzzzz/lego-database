'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/auth-context'
import type { Product } from '@/lib/types'

export default function MyPage() {
  const { user, profile, loading, updateNickname, signOut } = useAuth()
  const [nickname, setNickname] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likes, setLikes] = useState<(Product & { liked_at: string })[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading])

  useEffect(() => {
    if (profile?.nickname) setNickname(profile.nickname)
  }, [profile])

  useEffect(() => {
    if (user) fetchLikes()
  }, [user])

  async function fetchLikes() {
    const { data } = await supabase
      .from('likes')
      .select('product_id, created_at, products(*)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })

    if (data) {
      setLikes(data.map((l: any) => ({ ...l.products, liked_at: l.created_at })))
    }
  }

  async function handleSaveNickname() {
    setSaving(true)
    const { error } = await updateNickname(nickname.trim())
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  async function handleUnlike(productId: string) {
    await supabase.from('likes').delete().eq('user_id', user!.id).eq('product_id', productId)
    setLikes(prev => prev.filter(l => l.id !== productId))
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="text-muted hover:text-white transition-colors">←</button>
              <h1 className="text-lg font-bold">내 정보</h1>
            </div>
            <button onClick={signOut} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* 프로필 */}
        <div className="card-threads p-5">
          <h3 className="font-semibold mb-1 text-sm">계정</h3>
          <p className="text-muted text-sm">{user.email}</p>
        </div>

        {/* 닉네임 */}
        <div className="card-threads p-5">
          <h3 className="font-semibold mb-3 text-sm">닉네임</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              maxLength={20}
              className="input-threads flex-1 text-sm"
            />
            <button
              onClick={handleSaveNickname}
              disabled={saving || !nickname.trim()}
              style={{
                padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 500,
                background: saved ? '#16a34a' : '#fff', color: saved ? '#fff' : '#000',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                opacity: saving || !nickname.trim() ? 0.5 : 1,
              }}
            >
              {saved ? '✓ 저장됨' : '저장'}
            </button>
          </div>
        </div>

        {/* 좋아요 목록 */}
        <div>
          <h3 className="font-semibold mb-3 text-sm">좋아요 ({likes.length})</h3>
          {likes.length === 0 ? (
            <div className="card-threads p-8 text-center">
              <p className="text-muted text-sm">아직 좋아요한 제품이 없습니다</p>
              <Link href="/products" className="text-sm text-white mt-2 inline-block hover:underline">
                제품 둘러보기 →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {likes.map((product) => (
                <div key={product.id} className="card-threads p-4 flex items-center gap-4">
                  <Link href={`/products/${product.id}`} className="flex-1 flex items-center gap-3 min-w-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="w-12 h-12 object-cover rounded-lg" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-muted text-xs" style={{ background: 'var(--secondary)' }}>IMG</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{product.name_ko}</p>
                      {product.product_number && <p className="text-xs text-muted">#{product.product_number}</p>}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleUnlike(product.id)}
                    className="text-red-400 hover:text-red-300 text-lg shrink-0"
                    title="좋아요 취소"
                  >
                    ❤️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
