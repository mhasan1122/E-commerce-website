import api from './api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  categoryId: number;
  categoryName: string;
  stock: number;
  badge?: 'hot' | 'new' | 'sale';
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface ProductsParams {
  q?: string;
  category?: string;
  badge?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  getProducts: async (params?: ProductsParams): Promise<{ products: Product[]; total: number }> => {
    const { data } = await api.get('/products', { params });
    return data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  getCategories: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories');
    return data;
  },
};