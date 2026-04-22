export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  product: string;
  verified: boolean;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    rating: 5,
    text: "Absolutely blown away by the quality! The headphones deliver studio-quality sound. Best purchase I've made this year.",
    product: "Quantum Pro Wireless Headphones",
    verified: true,
  },
  {
    id: "2",
    name: "James Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    rating: 5,
    text: "The smartwatch exceeded all my expectations. The battery life is incredible and the health tracking is spot-on accurate.",
    product: "Aether Smartwatch Ultra",
    verified: true,
  },
  {
    id: "3",
    name: "Emily Park",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    rating: 4,
    text: "These running shoes feel like clouds! My marathon time improved by 8 minutes. The carbon plate really makes a difference.",
    product: "Nebula Running Shoes X9",
    verified: true,
  },
  {
    id: "4",
    name: "Michael Torres",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    rating: 5,
    text: "Finally found the perfect desk setup. The lamp's wireless charging feature is genius — one less cable on my desk!",
    product: "Minimal Desk Lamp Pro",
    verified: true,
  },
  {
    id: "5",
    name: "Aisha Rahman",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
    rating: 5,
    text: "This skincare set transformed my routine. My skin has never looked better — the serum is liquid gold. Will repurchase forever!",
    product: "Aurora Skincare Set",
    verified: true,
  },
  {
    id: "6",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    rating: 5,
    text: "The keyboard's gasket mount typing experience is unreal. So satisfying to type on. My colleagues keep asking about it!",
    product: "Mechanical Keyboard RGB",
    verified: true,
  },
  {
    id: "7",
    name: "Lisa Anderson",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
    rating: 4,
    text: "Beautiful bag with amazing craftsmanship. The leather smell is divine and it fits everything I need for daily use.",
    product: "Luxe Leather Crossbody Bag",
    verified: true,
  },
  {
    id: "8",
    name: "Omar Hassan",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
    rating: 5,
    text: "Best office chair investment ever. No more back pain after 10-hour coding sessions. Worth every single penny!",
    product: "Ergonomic Office Chair Pro",
    verified: true,
  },
];
