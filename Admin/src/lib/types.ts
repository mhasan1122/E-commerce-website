export type UserRole = "admin" | "user";

/* ---------- Auth / User ---------- */
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: true;
  token: string;
  user: AdminUser;
}

export interface MeResponse {
  success: true;
  user: AdminUser;
}

/* ---------- Users list (admin) ---------- */
export interface UserListItem extends AdminUser {}

export interface Paginated<T> {
  success: true;
  page: number;
  limit: number;
  total: number;
  data: T[];
}

/* ---------- Categories ---------- */
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  gradient?: string | null;
  image?: string | null;
  productCount: number;
}

/* ---------- Products ---------- */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  badge?: "hot" | "new" | "sale";
  categoryId?: number | null;
  category?: string | null; // category name
  images: string[];
  colors: string[];
  sizes: string[];
  features: string[];
  isActive: boolean;
  createdAt?: string;
}

/* ---------- Orders ---------- */
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

export interface OrderItem {
  id: number;
  productId: number | null;
  productName: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  selectedColor: string | null;
  selectedSize: string | null;
  lineTotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName?: string | null;
  userEmail?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: Record<string, unknown> | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

/* ---------- Admin stats ---------- */
export interface AdminStats {
  orders: { total: number; revenue: number; pending: number };
  users: { total: number; customers: number };
  products: { total: number; lowStock: number };
}

export interface AdminStatsResponse {
  success: true;
  data: AdminStats;
}
