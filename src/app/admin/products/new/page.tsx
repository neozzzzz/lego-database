'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    category_id: '',
    product_number: '',
    name_ko: '',
    name_en: '',
    price_krw: '',
    price_usd: '',
    piece_count: '',
    minifig_count: '',
    age_range: '',
    release_date: '',
    is_retired: false,
    description: '',
    image_url: '',
    status: 'active',
  })

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data || [])
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      category_id: form.category_id || null,
      product_number: form.product_number || null,
      name_ko: form.name_ko,
      name_en: form.name_en || null,
      price_krw: form.price_krw ? Number(form.price_krw) : null,
      price_usd: form.price_usd ? Number(form.price_usd) : null,
      piece_count: form.piece_count ? Number(form.piece_count) : null,
      minifig_count: form.minifig_count ? Number(form.minifig_count) : null,
      age_range: form.age_range || null,
      release_date: form.release_date || null,
      is_retired: form.is_retired,
      description: form.description || null,
      image_url: form.image_url || null,
      status: form.status,
    }

    const { error } = await supabase.from('products').insert(payload)

    if (error) {
      alert('오류: ' + error.message)
      setLoading(false)
    } else {
      router.push('/admin/products')
    }
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <h1 className="text-2xl font-bold mb-6">제품 추가</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-muted block mb-1">카테고리</label>
          <select name="category_id" value={form.category_id} onChange={handleChange} className="input-threads w-full">
            <option value="">선택</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">제품 번호</label>
          <input name="product_number" value={form.product_number} onChange={handleChange} placeholder="42151" className="input-threads w-full" />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">이름 (한국어) *</label>
          <input name="name_ko" value={form.name_ko} onChange={handleChange} className="input-threads w-full" required />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">이름 (영어)</label>
          <input name="name_en" value={form.name_en} onChange={handleChange} className="input-threads w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-muted block mb-1">가격 (원)</label>
            <input name="price_krw" type="number" value={form.price_krw} onChange={handleChange} className="input-threads w-full" />
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">가격 (USD)</label>
            <input name="price_usd" type="number" step="0.01" value={form.price_usd} onChange={handleChange} className="input-threads w-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-muted block mb-1">피스 수</label>
            <input name="piece_count" type="number" value={form.piece_count} onChange={handleChange} className="input-threads w-full" />
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">미니피규어</label>
            <input name="minifig_count" type="number" value={form.minifig_count} onChange={handleChange} className="input-threads w-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-muted block mb-1">연령</label>
            <input name="age_range" value={form.age_range} onChange={handleChange} placeholder="18+" className="input-threads w-full" />
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">출시일</label>
            <input name="release_date" type="date" value={form.release_date} onChange={handleChange} className="input-threads w-full" />
          </div>
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">상태</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-threads w-full">
            <option value="active">판매중</option>
            <option value="retired">단종</option>
            <option value="upcoming">출시예정</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">이미지 URL</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} className="input-threads w-full" />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">설명</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-threads w-full resize-none" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_retired" checked={form.is_retired} onChange={(e) => setForm(prev => ({ ...prev, is_retired: e.target.checked }))} />
          <label htmlFor="is_retired" className="text-sm">단종</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? '저장 중...' : '저장'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">취소</button>
        </div>
      </form>
    </div>
  )
}
