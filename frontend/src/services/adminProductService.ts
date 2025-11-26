import { Product } from '../types'
import api from './api'
import { getAdminProducts, saveAdminProducts } from '../utils/adminProducts'

// Fetch backend custom products with offline fallback
export async function fetchAdminProducts(): Promise<Product[]> {
  try {
    const res = await api.get('/admin-products')
    const data: Product[] = res.data.data || []
    // update cache
    saveAdminProducts(data.map(p => ({ ...p, createdAt: p.createdAt ? new Date(p.createdAt) : new Date() })))
    return data
  } catch (e) {
    console.warn('Admin products backend fetch failed, using cache', e)
    return getAdminProducts() as unknown as Product[]
  }
}

export async function createAdminProduct(p: Product): Promise<any> {
  try {
    const res = await api.post('/admin-products', p)
    await fetchAdminProducts()
    return res.data.data
  } catch (e: any) {
    console.error('Create admin product failed:', e.response ? e.response.data : e.message)
    return e.response?.data ?? { error: 'Unknown network error' }
  }
}

export async function updateAdminProduct(id: string, p: Partial<Product>): Promise<any> {
  try {
    const res = await api.put(`/admin-products/${id}`, p)
    await fetchAdminProducts()
    return res.data.data
  } catch (e: any) {
    console.error('Update admin product failed:', e.response ? e.response.data : e.message)
    return e.response?.data ?? { error: 'Unknown network error' }
  }
}

export async function deleteAdminProduct(id: string): Promise<boolean> {
  try {
    await api.delete(`/admin-products/${id}`)
    await fetchAdminProducts()
    return true
  } catch (e) {
    console.error('Delete admin product failed', e)
    return false
  }
}