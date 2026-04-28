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
    return {
      id: data.cartId,
      userId: data.userId,
      items: data.items,
      subtotal: data.totalPrice,
      shipping: 0,
      tax: 0,
      total: data.totalPrice,
    };
  },

  addItem: async (productId: number, quantity: number): Promise<void> => {
    await api.post('/cart/items', { productId, quantity });
  },

  updateItem: async (itemId: number, quantity: number): Promise<void> => {
    await api.put(`/cart/items/${itemId}`, { quantity });
  },

  removeItem: async (itemId: number): Promise<void> => {
    await api.delete(`/cart/items/${itemId}`);
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },
};