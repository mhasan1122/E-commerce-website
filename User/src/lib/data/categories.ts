export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
  gradient: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    icon: "Cpu",
    productCount: 234,
    gradient: "from-blue-600 to-cyan-400",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
  },
  {
    id: "2",
    name: "Fashion",
    slug: "fashion",
    icon: "Shirt",
    productCount: 189,
    gradient: "from-purple-600 to-pink-400",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
  },
  {
    id: "3",
    name: "Home & Living",
    slug: "home-living",
    icon: "Lamp",
    productCount: 156,
    gradient: "from-amber-500 to-yellow-600",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
  },
  {
    id: "4",
    name: "Beauty",
    slug: "beauty",
    icon: "Sparkles",
    productCount: 210,
    gradient: "from-rose-500 to-pink-400",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
  },
  {
    id: "5",
    name: "Sports",
    slug: "sports",
    icon: "Dumbbell",
    productCount: 178,
    gradient: "from-amber-600 to-amber-400",
    image: "https://images.unsplash.com/photo-1461896836934-bd45ba8c9e3a?w=600&q=80",
  },
  {
    id: "6",
    name: "Accessories",
    slug: "accessories",
    icon: "Watch",
    productCount: 145,
    gradient: "from-indigo-500 to-violet-400",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80",
  },
];
