import { create } from "zustand";

/* ─── Product Type ─── */
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  stock: number;
  badge?: "hot" | "new" | "sale";
  colors?: string[];
  sizes?: string[];
  description: string;
  features?: string[];
}

/* ─── Cart Item ─── */
export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

/* ─── Cart Store ─── */
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, color?: string, size?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  lastRemovedItem: CartItem | null;
  setLastRemovedItem: (item: CartItem | null) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  lastRemovedItem: null,
  setLastRemovedItem: (item) => set({ lastRemovedItem: item }),
  addItem: (product, quantity = 1, color, size) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );
      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity += quantity;
        return { items: newItems };
      }
      return {
        items: [
          ...state.items,
          { product, quantity, selectedColor: color, selectedSize: size },
        ],
      };
    });
  },
  removeItem: (productId) => {
    const item = get().items.find((i) => i.product.id === productId);
    if (item) set({ lastRemovedItem: item });
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },
  updateQuantity: (productId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: () =>
    get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
}));

/* ─── Wishlist Store ─── */
interface WishlistStore {
  items: Product[];
  toggleItem: (product: Product) => void;
  hasItem: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  toggleItem: (product) => {
    set((state) => {
      const exists = state.items.find((i) => i.id === product.id);
      if (exists) {
        return { items: state.items.filter((i) => i.id !== product.id) };
      }
      return { items: [...state.items, product] };
    });
  },
  hasItem: (productId) => get().items.some((i) => i.id === productId),
}));

/* ─── UI Store ─── */
interface UIStore {
  cartDrawerOpen: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  theme: "dark" | "light";
  setCartDrawerOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  cartDrawerOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
  theme: "light",
  setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
}));
