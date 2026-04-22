import type { Product as UiProduct } from "./store";

/* --- Raw backend shapes (camelCase as the API returns) --- */
export interface ApiProduct {
  id: string; // backend serializes numeric id to string
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  oldPrice?: number | null;
  stock: number;
  rating: number | string;
  reviewCount: number;
  soldCount: number;
  badge?: "hot" | "new" | "sale" | null;
  categoryId?: number | null;
  category?: string | null; // category name
  images?: string[] | null;
  colors?: string[] | null;
  sizes?: string[] | null;
  features?: string[] | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  gradient?: string | null;
  image?: string | null;
  productCount: number;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  phone?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: true;
  user: ApiUser;
  token: string;
}

export interface Paginated<T> {
  success: true;
  page: number;
  limit: number;
  total: number;
  data: T[];
}

export interface Envelope<T> {
  success: true;
  data: T;
}

export type PaginatedProducts = Paginated<ApiProduct>;

/* --- Orders --- */
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface ApiOrderItem {
  id: number;
  productId: number | null;
  productName: string;
  productImage?: string | null;
  unitPrice: number;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  lineTotal: number;
}

export interface ApiOrder {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  paymentStatus: "unpaid" | "paid" | "refunded" | "failed";
  paymentMethod?: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress?: Record<string, unknown> | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  items?: ApiOrderItem[];
}

/* --- Mapper: backend product → UI product --- */
export function mapApiProduct(p: ApiProduct): UiProduct {
  return {
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    oldPrice: p.oldPrice != null ? Number(p.oldPrice) : undefined,
    images:
      Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : ["https://placehold.co/600x600?text=No+Image"],
    category: p.category || "",
    rating: Number(p.rating ?? 0),
    reviewCount: p.reviewCount ?? 0,
    soldCount: p.soldCount ?? 0,
    stock: p.stock ?? 0,
    badge: p.badge ?? undefined,
    colors: Array.isArray(p.colors) ? p.colors : undefined,
    sizes: Array.isArray(p.sizes) ? p.sizes : undefined,
    description: p.description ?? "",
    features: Array.isArray(p.features) ? p.features : undefined,
  };
}
