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
  reviews?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface User {
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  role: string;
  profileImageUrl?: string;
  banned?: boolean;
  ip?: string;
}
