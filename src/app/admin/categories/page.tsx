'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const supabase = createClient()

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')
    setCategories(data || [])
  }

  async function deleteCategory(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await supabase.from('categories').delete().eq('id', id)
    fetchCategories()
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">카테고리 관리</h1>
        <Link href="/admin/categories/new" className="btn-primary text-sm">
          추가
        </Link>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="card-threads p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{cat.name}</h3>
                <span className="text-xs text-muted">/{cat.slug}</span>
                {!cat.is_active && (
                  <span className="text-xs bg-yellow-900/50 text-yellow-400 px-1.5 py-0.5 rounded">비활성</span>
                )}
              </div>
              {cat.description && (
                <p className="text-sm text-muted mt-1">{cat.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/categories/${cat.id}/edit`}
                className="btn-secondary text-xs py-1 px-3"
              >
                수정
              </Link>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="btn-danger text-xs py-1 px-3"
              >
                삭제
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12 text-muted">
            카테고리가 없습니다
          </div>
        )}
      </div>
    </div>
  )
}
