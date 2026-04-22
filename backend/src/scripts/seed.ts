/**
 * Seeds the DB with:
 *   - one admin user (from SEED_ADMIN_*)
 *   - one demo customer
 *   - categories matching the User app
 *   - products matching the User app's lib/data/products.ts
 *
 * Idempotent: safe to run multiple times.
 * Usage: npm run db:seed
 */
import bcrypt from "bcryptjs";
import { pool } from "../config/db";
import { env } from "../config/env";

type SeedProduct = {
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
};

const categories = [
  { name: "Electronics",   slug: "electronics",   icon: "Cpu",      gradient: "from-blue-600 to-cyan-400",  image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80" },
  { name: "Fashion",       slug: "fashion",       icon: "Shirt",    gradient: "from-purple-600 to-pink-400", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80" },
  { name: "Home & Living", slug: "home-living",   icon: "Lamp",     gradient: "from-amber-500 to-yellow-600", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80" },
  { name: "Beauty",        slug: "beauty",        icon: "Sparkles", gradient: "from-rose-500 to-pink-400",    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80" },
  { name: "Sports",        slug: "sports",        icon: "Dumbbell", gradient: "from-amber-600 to-amber-400",  image: "https://images.unsplash.com/photo-1461896836934-bd45ba8c9e3a?w=600&q=80" },
  { name: "Accessories",   slug: "accessories",   icon: "Watch",    gradient: "from-indigo-500 to-violet-400", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80" },
];

const products: SeedProduct[] = [
  { name: "Quantum Pro Wireless Headphones", slug: "quantum-pro-wireless-headphones", price: 29900, oldPrice: 39900, category: "Electronics", rating: 4.8, reviewCount: 2341, soldCount: 15420, stock: 23, badge: "hot", colors: ["#1a1a2e","#f8f6f3","#63fab4"], images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80","https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80","https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&q=80"], description: "Experience crystal-clear audio with adaptive noise cancellation and 40-hour battery life.", features: ["Active Noise Cancellation","40hr Battery","Bluetooth 5.3","Hi-Res Audio"] },
  { name: "Aether Smartwatch Ultra", slug: "aether-smartwatch-ultra", price: 44900, oldPrice: 54900, category: "Electronics", rating: 4.9, reviewCount: 1892, soldCount: 8900, stock: 15, badge: "new", colors: ["#1a1a2e","#c0c0c0","#e8c547"], images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80","https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600&q=80"], description: "The ultimate smartwatch with sapphire crystal display and 14-day battery life.", features: ["Sapphire Display","14-day Battery","100m Water Resistant","ECG Monitor"] },
  { name: "Nebula Running Shoes X9", slug: "nebula-running-shoes-x9", price: 18900, oldPrice: 24900, category: "Sports", rating: 4.7, reviewCount: 3456, soldCount: 22300, stock: 45, badge: "hot", colors: ["#ff4757","#1a1a2e","#f8f6f3","#63fab4"], sizes: ["7","8","9","10","11","12"], images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80","https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80","https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80"], description: "Ultralight carbon-plate running shoes with responsive ZoomX foam.", features: ["Carbon Plate","ZoomX Foam","Flyknit Upper","180g Weight"] },
  { name: "Luxe Leather Crossbody Bag", slug: "luxe-leather-crossbody-bag", price: 15900, oldPrice: 21900, category: "Fashion", rating: 4.6, reviewCount: 876, soldCount: 5430, stock: 32, badge: "sale", colors: ["#8B4513","#1a1a2e","#D2691E"], images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"], description: "Handcrafted Italian leather crossbody with adjustable strap.", features: ["Italian Leather","Gold Hardware","Adjustable Strap","RFID Protection"] },
  { name: "Minimal Desk Lamp Pro", slug: "minimal-desk-lamp-pro", price: 8900, oldPrice: 12900, category: "Home & Living", rating: 4.5, reviewCount: 1234, soldCount: 7800, stock: 67, colors: ["#f8f6f3","#1a1a2e","#e8c547"], images: ["https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80"], description: "Scandinavian-inspired desk lamp with wireless charging base.", features: ["Wireless Charging","Touch Dimming","3 Color Temps","USB-C"] },
  { name: "Aurora Skincare Set", slug: "aurora-skincare-set", price: 12900, oldPrice: 17900, category: "Beauty", rating: 4.8, reviewCount: 2100, soldCount: 12500, stock: 38, badge: "hot", images: ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80","https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600&q=80"], description: "Complete 5-step Korean skincare routine.", features: ["5-Step Routine","Natural Ingredients","Dermatologist Tested","Vegan"] },
  { name: "Carbon Fiber Sunglasses", slug: "carbon-fiber-sunglasses", price: 22900, oldPrice: 29900, category: "Fashion", rating: 4.4, reviewCount: 654, soldCount: 3200, stock: 19, badge: "new", colors: ["#1a1a2e","#8B4513"], images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80","https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80"], description: "Featherweight carbon fiber frames with polarized lenses.", features: ["Carbon Fiber","Polarized","UV400","15g Weight"] },
  { name: "Smart Home Speaker Max", slug: "smart-home-speaker-max", price: 19900, category: "Electronics", rating: 4.6, reviewCount: 1567, soldCount: 9100, stock: 54, colors: ["#1a1a2e","#f8f6f3"], images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80","https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600&q=80"], description: "360° spatial audio with Dolby Atmos.", features: ["Dolby Atmos","360° Audio","Smart Assistant","Multi-Room"] },
  { name: "Titanium Water Bottle", slug: "titanium-water-bottle", price: 5900, category: "Sports", rating: 4.7, reviewCount: 3890, soldCount: 28000, stock: 120, badge: "hot", colors: ["#c0c0c0","#1a1a2e","#63fab4","#ff4757"], images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80"], description: "Double-wall vacuum insulated titanium bottle.", features: ["24hr Cold","12hr Hot","Titanium","Leak-Proof"] },
  { name: "Ergonomic Office Chair Pro", slug: "ergonomic-office-chair-pro", price: 59900, oldPrice: 79900, category: "Home & Living", rating: 4.9, reviewCount: 987, soldCount: 4300, stock: 8, badge: "sale", colors: ["#1a1a2e","#363636","#f8f6f3"], images: ["https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80"], description: "Award-winning ergonomic mesh chair.", features: ["Mesh Back","4D Armrests","135° Recline","12yr Warranty"] },
  { name: "Ceramic Pour-Over Coffee Set", slug: "ceramic-pour-over-coffee-set", price: 7900, category: "Home & Living", rating: 4.5, reviewCount: 2345, soldCount: 11200, stock: 76, badge: "new", images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"], description: "Handmade ceramic pour-over dripper with thermal carafe.", features: ["Handmade Ceramic","Thermal Carafe","Gooseneck Kettle","100 Filters"] },
  { name: "Wireless Charging Pad Duo", slug: "wireless-charging-pad-duo", price: 4900, oldPrice: 6900, category: "Electronics", rating: 4.3, reviewCount: 4567, soldCount: 34000, stock: 200, badge: "sale", images: ["https://images.unsplash.com/photo-1586953208270-767889fa9b0e?w=600&q=80"], description: "Dual wireless charging pad for phone + earbuds.", features: ["15W Fast Charge","Dual Device","LED Indicator","Anti-Slip"] },
  { name: "Premium Yoga Mat Elite", slug: "premium-yoga-mat-elite", price: 11900, oldPrice: 14900, category: "Sports", rating: 4.8, reviewCount: 1678, soldCount: 9500, stock: 42, colors: ["#63fab4","#1a1a2e","#8B4513","#6c5ce7"], images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80"], description: "6mm natural rubber yoga mat with alignment markings.", features: ["Natural Rubber","Alignment Marks","Wet-Grip","6mm Thick"] },
  { name: "Retinol Night Cream", slug: "retinol-night-cream", price: 6900, oldPrice: 8900, category: "Beauty", rating: 4.6, reviewCount: 3210, soldCount: 18000, stock: 55, images: ["https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&q=80"], description: "Clinical-grade 0.5% retinol with hyaluronic acid.", features: ["0.5% Retinol","Hyaluronic Acid","Vitamin E","Fragrance-Free"] },
  { name: "Canvas Weekender Bag", slug: "canvas-weekender-bag", price: 13900, category: "Fashion", rating: 4.5, reviewCount: 567, soldCount: 3800, stock: 29, badge: "new", colors: ["#8B4513","#556B2F","#1a1a2e"], images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"], description: "Waxed canvas weekender with leather accents.", features: ["Waxed Canvas","Shoe Compartment","Laptop Sleeve","Leather Accents"] },
  { name: "Mechanical Keyboard RGB", slug: "mechanical-keyboard-rgb", price: 16900, oldPrice: 21900, category: "Electronics", rating: 4.7, reviewCount: 2890, soldCount: 14200, stock: 33, badge: "hot", colors: ["#1a1a2e","#f8f6f3"], images: ["https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80"], description: "Hot-swappable mechanical keyboard with per-key RGB.", features: ["Hot-Swappable","Per-Key RGB","Gasket-Mount","PBT Keycaps"] },
];

async function seedUsers() {
  const adminHash = await bcrypt.hash(env.seed.adminPassword, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [env.seed.adminName, env.seed.adminEmail, adminHash]
  );
  console.log(`[seed] admin: ${env.seed.adminEmail} / ${env.seed.adminPassword}`);

  const userHash = await bcrypt.hash("user12345", 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, ?, ?, 'user')
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    ["Demo Customer", "user@demo.io", userHash]
  );
  console.log(`[seed] user:  user@demo.io / user12345`);
}

async function seedCategories(): Promise<Map<string, number>> {
  for (const c of categories) {
    await pool.query(
      `INSERT INTO categories (name, slug, icon, gradient, image)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), icon=VALUES(icon),
         gradient=VALUES(gradient), image=VALUES(image)`,
      [c.name, c.slug, c.icon, c.gradient, c.image]
    );
  }
  const [rows] = await pool.query<(import("mysql2").RowDataPacket & { id: number; name: string })[]>(
    `SELECT id, name FROM categories`
  );
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(r.name, r.id));
  console.log(`[seed] categories: ${rows.length}`);
  return map;
}

async function seedProducts(catMap: Map<string, number>) {
  for (const p of products) {
    const categoryId = catMap.get(p.category) ?? null;
    await pool.query(
      `INSERT INTO products
         (name, slug, description, price, old_price, stock, rating, review_count,
          sold_count, badge, category_id, images, colors, sizes, features, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), description=VALUES(description), price=VALUES(price),
         old_price=VALUES(old_price), stock=VALUES(stock), rating=VALUES(rating),
         review_count=VALUES(review_count), sold_count=VALUES(sold_count),
         badge=VALUES(badge), category_id=VALUES(category_id),
         images=VALUES(images), colors=VALUES(colors), sizes=VALUES(sizes),
         features=VALUES(features)`,
      [
        p.name,
        p.slug,
        p.description,
        p.price,
        p.oldPrice ?? null,
        p.stock,
        p.rating,
        p.reviewCount,
        p.soldCount,
        p.badge ?? null,
        categoryId,
        JSON.stringify(p.images),
        JSON.stringify(p.colors ?? []),
        JSON.stringify(p.sizes ?? []),
        JSON.stringify(p.features ?? []),
      ]
    );
  }
  console.log(`[seed] products: ${products.length}`);
}

async function main() {
  await seedUsers();
  const catMap = await seedCategories();
  await seedProducts(catMap);
  console.log("[seed] done ✓");
  await pool.end();
}

main().catch((e) => {
  console.error("[seed] failed:", e);
  process.exit(1);
});
