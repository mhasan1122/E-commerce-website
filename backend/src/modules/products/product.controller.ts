import { Response } from "express";
import { z } from "zod";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../types";

interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  rating: number;
  review_count: number;
  sold_count: number;
  badge: "hot" | "new" | "sale" | null;
  category_id: number | null;
  category_name?: string | null;
  images: unknown;
  colors: unknown;
  sizes: unknown;
  features: unknown;
  is_active: number;
  created_at: Date;
}

const productInputSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(220),
  description: z.string().optional().nullable(),
  price: z.number().int().nonnegative(),
  oldPrice: z.number().int().nonnegative().optional().nullable(),
  stock: z.number().int().nonnegative().default(0),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  soldCount: z.number().int().nonnegative().optional(),
  badge: z.enum(["hot", "new", "sale"]).optional().nullable(),
  categoryId: z.number().int().positive().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  colors: z.array(z.string()).optional().nullable(),
  sizes: z.array(z.string()).optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().optional(),
});

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function serialize(p: ProductRow) {
  return {
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    price: p.price,
    oldPrice: p.old_price ?? undefined,
    stock: p.stock,
    rating: Number(p.rating),
    reviewCount: p.review_count,
    soldCount: p.sold_count,
    badge: p.badge ?? undefined,
    categoryId: p.category_id,
    category: p.category_name ?? null,
    images: parseJson<string[]>(p.images, []),
    colors: parseJson<string[]>(p.colors, []),
    sizes: parseJson<string[]>(p.sizes, []),
    features: parseJson<string[]>(p.features, []),
    isActive: !!p.is_active,
    createdAt: p.created_at,
  };
}

/* ---------- list with filters + pagination ---------- */

const listSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),        // category slug or id
  badge: z.enum(["hot", "new", "sale"]).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating", "best_sellers"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  onlyActive: z.coerce.boolean().optional(),
});

export async function listProducts(req: AuthRequest, res: Response) {
  const q = listSchema.parse(req.query);
  const where: string[] = [];
  const params: unknown[] = [];

  // default: public callers only see active products; admins can pass ?onlyActive=false
  const onlyActive = q.onlyActive ?? (req.user?.role !== "admin");
  if (onlyActive) where.push("p.is_active = 1");

  if (q.q) {
    where.push("(p.name LIKE ? OR p.description LIKE ?)");
    params.push(`%${q.q}%`, `%${q.q}%`);
  }
  if (q.badge) {
    where.push("p.badge = ?");
    params.push(q.badge);
  }
  if (q.category) {
    if (/^\d+$/.test(q.category)) {
      where.push("p.category_id = ?");
      params.push(Number(q.category));
    } else {
      where.push("c.slug = ?");
      params.push(q.category);
    }
  }
  if (q.minPrice != null) {
    where.push("p.price >= ?");
    params.push(q.minPrice);
  }
  if (q.maxPrice != null) {
    where.push("p.price <= ?");
    params.push(q.maxPrice);
  }

  const orderBy =
    q.sort === "price_asc" ? "p.price ASC"
    : q.sort === "price_desc" ? "p.price DESC"
    : q.sort === "rating" ? "p.rating DESC"
    : q.sort === "best_sellers" ? "p.sold_count DESC"
    : "p.created_at DESC";

  const offset = (q.page - 1) * q.limit;
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await pool.query<ProductRow[]>(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereSql}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, q.limit, offset]
  );

  const [[countRow]] = await pool.query<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) AS total
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereSql}`,
    params
  );

  res.json({
    success: true,
    page: q.page,
    limit: q.limit,
    total: countRow.total,
    data: rows.map(serialize),
  });
}

export async function getProduct(req: AuthRequest, res: Response) {
  const { idOrSlug } = req.params;
  const isNumeric = /^\d+$/.test(idOrSlug);
  const [rows] = await pool.query<ProductRow[]>(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${isNumeric ? "p.id = ?" : "p.slug = ?"}
     LIMIT 1`,
    [idOrSlug]
  );
  const row = rows[0];
  if (!row) throw ApiError.notFound("Product not found");
  res.json({ success: true, data: serialize(row) });
}

export async function createProduct(req: AuthRequest, res: Response) {
  const body = productInputSchema.parse(req.body);

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO products
      (name, slug, description, price, old_price, stock, rating, review_count,
       sold_count, badge, category_id, images, colors, sizes, features, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      body.name,
      body.slug,
      body.description ?? null,
      body.price,
      body.oldPrice ?? null,
      body.stock,
      body.rating ?? 0,
      body.reviewCount ?? 0,
      body.soldCount ?? 0,
      body.badge ?? null,
      body.categoryId ?? null,
      JSON.stringify(body.images ?? []),
      JSON.stringify(body.colors ?? []),
      JSON.stringify(body.sizes ?? []),
      JSON.stringify(body.features ?? []),
      body.isActive === false ? 0 : 1,
    ]
  );

  res.status(201).json({ success: true, id: result.insertId });
}

export async function updateProduct(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const body = productInputSchema.partial().parse(req.body);

  const map: Record<string, string> = {
    name: "name",
    slug: "slug",
    description: "description",
    price: "price",
    oldPrice: "old_price",
    stock: "stock",
    rating: "rating",
    reviewCount: "review_count",
    soldCount: "sold_count",
    badge: "badge",
    categoryId: "category_id",
    isActive: "is_active",
  };
  const jsonKeys = new Set(["images", "colors", "sizes", "features"]);

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [k, v] of Object.entries(body)) {
    if (map[k]) {
      fields.push(`${map[k]} = ?`);
      values.push(k === "isActive" ? (v ? 1 : 0) : v);
    } else if (jsonKeys.has(k)) {
      fields.push(`${k} = ?`);
      values.push(JSON.stringify(v ?? []));
    }
  }

  if (!fields.length) throw ApiError.badRequest("Nothing to update");
  values.push(id);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  if (!result.affectedRows) throw ApiError.notFound("Product not found");
  res.json({ success: true });
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM products WHERE id = ?`,
    [id]
  );
  if (!result.affectedRows) throw ApiError.notFound("Product not found");
  res.json({ success: true });
}
