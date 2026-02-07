'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ categories: 0, products: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true })
      const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
      setStats({ categories: catCount || 0, products: prodCount || 0 })
    }
    fetchStats()
  }, [])

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card-threads p-6 text-center">
          <div className="text-3xl font-bold text-gradient">{stats.categories}</div>
          <div className="text-muted text-sm mt-1">카테고리</div>
        </div>
        <div className="card-threads p-6 text-center">
          <div className="text-3xl font-bold text-gradient">{stats.products}</div>
          <div className="text-muted text-sm mt-1">제품</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/categories">
          <div className="card-threads p-5 cursor-pointer">
            <h3 className="font-semibold mb-1">카테고리 관리</h3>
            <p className="text-sm text-muted">카테고리 추가, 수정, 삭제</p>
          </div>
        </Link>
        <Link href="/admin/products">
          <div className="card-threads p-5 cursor-pointer">
            <h3 className="font-semibold mb-1">제품 관리</h3>
            <p className="text-sm text-muted">제품 추가, 수정, 삭제</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
