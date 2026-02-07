'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    is_active: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('categories').select('*').eq('id', id).single()
      if (data) setForm({
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        sort_order: data.sort_order,
        is_active: data.is_active,
      })
    }
    fetch()
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('categories').update(form).eq('id', id)

    if (error) {
      alert('오류: ' + error.message)
      setLoading(false)
    } else {
      router.push('/admin/categories')
    }
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <h1 className="text-2xl font-bold mb-6">카테고리 수정</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-muted block mb-1">이름</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-threads w-full" required />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">슬러그</label>
          <input name="slug" value={form.slug} onChange={handleChange} className="input-threads w-full" required />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">설명</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-threads w-full resize-none" />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">정렬 순서</label>
          <input name="sort_order" type="number" value={form.sort_order} onChange={handleChange} className="input-threads w-full" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))} />
          <label htmlFor="is_active" className="text-sm">활성화</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? '저장 중...' : '저장'}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">취소</button>
        </div>
      </form>
    </div>
  )
}
