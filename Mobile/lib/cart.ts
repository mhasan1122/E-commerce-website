import api from './api';
import { Product } from './products';

export interface CartItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const { data } = await api.get('/cart');
    return data;
  },

  addItem: async (productId: number, quantity: number): Promise<Cart> => {
    const { data } = await api.post('/cart/items', { productId, quantity });
    return data;
  },

  updateItem: async (itemId: number, quantity: number): Promise<Cart> => {
    const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
    return data;
  },

  removeItem: async (itemId: number): Promise<Cart> => {
    const { data } = await api.delete(`/cart/items/${itemId}`);
    return data;
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },
};