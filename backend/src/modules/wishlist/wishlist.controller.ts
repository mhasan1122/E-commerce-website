import { Response } from "express";
import { z } from "zod";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../types";

interface WishRow extends RowDataPacket {
  id: number;
  product_id: number;
  p_name: string;
  p_slug: string;
  p_price: number;
  p_old_price: number | null;
  p_images: unknown;
  p_rating: number;
  p_review_count: number;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return value as T;
}

export async function getWishlist(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const [rows] = await pool.query<WishRow[]>(
    `SELECT w.id, w.product_id,
            p.name AS p_name, p.slug AS p_slug, p.price AS p_price,
            p.old_price AS p_old_price, p.images AS p_images,
            p.rating AS p_rating, p.review_count AS p_review_count
     FROM wishlist_items w
     JOIN products p ON p.id = w.product_id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    [req.user.id]
  );
  res.json({
    success: true,
    data: rows.map((r) => ({
      id: r.id,
      product: {
        id: String(r.product_id),
        name: r.p_name,
        slug: r.p_slug,
        price: r.p_price,
        oldPrice: r.p_old_price ?? undefined,
        images: parseJson<string[]>(r.p_images, []),
        rating: Number(r.p_rating),
        reviewCount: r.p_review_count,
      },
    })),
  });
}

const addSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export async function addToWishlist(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { productId } = addSchema.parse(req.body);
  try {
    await pool.query<ResultSetHeader>(
      `INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)`,
      [req.user.id, productId]
    );
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code !== "ER_DUP_ENTRY") throw e;
  }
  res.status(201).json({ success: true });
}

export async function removeFromWishlist(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const productId = Number(req.params.productId);
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?`,
    [req.user.id, productId]
  );
  if (!result.affectedRows) throw ApiError.notFound("Wishlist item not found");
  res.json({ success: true });
}
