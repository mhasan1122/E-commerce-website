import api from './api';
import { Product } from './products';

export interface WishlistItem {
  id: number;
  productId: number;
  product: Product;
  addedAt: string;
}

export const wishlistApi = {
  getWishlist: async (): Promise<WishlistItem[]> => {
    const { data } = await api.get('/wishlist');
    return data;
  },

  addItem: async (productId: number): Promise<WishlistItem> => {
    const { data } = await api.post('/wishlist', { productId });
    return data;
  },

  removeItem: async (productId: number): Promise<void> => {
    await api.delete(`/wishlist/${productId}`);
  },
};