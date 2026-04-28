import api from './api';
import { Product } from './products';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cod';
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  shippingAddress: ShippingAddress;
  paymentMethod: 'cod';
}

export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    const { data } = await api.get('/orders/my');
    return data.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    const { data } = await api.get(`/orders/${id}`);
    return data.data;
  },

  createOrder: async (orderData: CreateOrderData): Promise<any> => {
    const { data } = await api.post('/orders', {
      ...orderData,
      useCart: true, // Assuming mobile always orders from cart for now
    });
    return data;
  },
};