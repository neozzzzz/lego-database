export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  product_count?: number
}

export interface Product {
  id: string
  category_id: string | null
  product_number: string | null
  name_ko: string
  name_en: string | null
  price_krw: number | null
  price_usd: number | null
  piece_count: number | null
  minifig_count: number | null
  age_range: string | null
  release_date: string | null
  is_retired: boolean
  description: string | null
  image_url: string | null
  status: 'active' | 'retired' | 'upcoming'
  created_at: string
  updated_at: string
  category?: Category
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  sort_order: number
  is_primary: boolean
  created_at: string
}
