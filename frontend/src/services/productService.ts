import api from './api';

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  size: string[];
  color: string[];
  stock: number;
  image: string;
  images?: string[];
  rating?: number;
}

export const getProducts = async (filters?: any): Promise<Product[]> => {
  const params = filters || {};
  try {
    const response = await api.get('/products', { params });
    return response.data.data || [];
  } catch (error) {
    console.warn('Primary API failed, attempting port 5001 fallback...', error);
    try {
      // Build query string manually for fallback
      const qs = Object.keys(params).length
        ? '?' + Object.entries(params).map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
        : '';
      const res = await fetch(`http://localhost:5001/api/products${qs}`);
      if (!res.ok) throw new Error('Fallback fetch failed: ' + res.status);
      const json = await res.json();
      const data = json.data || [];
      return Array.isArray(data) ? data : [];
    } catch (fallbackErr) {
      console.error('Fallback API failed:', fallbackErr);
      return [];
    }
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const createProduct = async (productData: Product) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
