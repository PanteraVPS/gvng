import { Product } from '../types'

const LS_KEY = 'adminProducts'

interface AdminProduct extends Product {
  createdAt?: Date
}

export function getAdminProducts(): AdminProduct[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.map(p => ({ 
        ...p, 
        createdAt: p.createdAt || new Date().toISOString() 
      }))
    }
    return []
  } catch {
    return []
  }
}

export function saveAdminProducts(list: AdminProduct[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)) } catch {}
}

export function upsertAdminProduct(p: AdminProduct) {
  const list = getAdminProducts()
  const idx = list.findIndex(x => x._id === p._id)
  if (!p.createdAt) p.createdAt = new Date()
  if (idx >= 0) list[idx] = p
  else list.unshift(p)

  list.sort((a,b) => 
    new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
  )

  saveAdminProducts(list)
}

export function removeAdminProduct(id: string) {
  const list = getAdminProducts().filter(p => p._id !== id)
  saveAdminProducts(list)
}

export function exportAdminProducts(): string {
  return JSON.stringify(getAdminProducts(), null, 2)
}

export function importAdminProducts(json: string) {
  try {
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) return { success: false, error: 'JSON must be an array' }

    const cleaned: AdminProduct[] = parsed.map((p: any) => ({
      _id: p._id || 'admin-' + Date.now() + Math.random().toString(16).slice(2),
      name: p.name || 'Unnamed',
      description: p.description || '',
      price: Number(p.price) || 0,
      category: p.category || 'men',
      size: Array.isArray(p.size) ? p.size : [],
      color: Array.isArray(p.color) ? p.color : [],
      stock: Number(p.stock) || 0,
      image: p.image || '',
      images: Array.isArray(p.images) ? p.images : [],
      rating: Number(p.rating) || 0,
      createdAt: p.createdAt || new Date().toISOString()
    }))

    saveAdminProducts(cleaned)
    return { success: true }

  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
