import { Response } from "express";
import { z } from "zod";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../types";

interface CartItemRow extends RowDataPacket {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  selected_color: string | null;
  selected_size: string | null;
  p_name: string;
  p_slug: string;
  p_price: number;
  p_old_price: number | null;
  p_images: unknown;
  p_stock: number;
}

async function getOrCreateCartId(userId: number): Promise<number> {
  const [rows] = await pool.query<(RowDataPacket & { id: number })[]>(
    `SELECT id FROM carts WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  if (rows[0]) return rows[0].id;

  const [res] = await pool.query<ResultSetHeader>(
    `INSERT INTO carts (user_id) VALUES (?)`,
    [userId]
  );
  return res.insertId;
}

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

function serializeItem(r: CartItemRow) {
  const images = parseJson<string[]>(r.p_images, []);
  return {
    id: r.id,
    quantity: r.quantity,
    selectedColor: r.selected_color,
    selectedSize: r.selected_size,
    product: {
      id: String(r.product_id),
      name: r.p_name,
      slug: r.p_slug,
      price: r.p_price,
      oldPrice: r.p_old_price ?? undefined,
      image: images[0] ?? null,
      images,
      stock: r.p_stock,
    },
  };
}

export async function getCart(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const cartId = await getOrCreateCartId(req.user.id);
  const [rows] = await pool.query<CartItemRow[]>(
    `SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, ci.selected_color, ci.selected_size,
            p.name AS p_name, p.slug AS p_slug, p.price AS p_price, p.old_price AS p_old_price,
            p.images AS p_images, p.stock AS p_stock
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = ?
     ORDER BY ci.id ASC`,
    [cartId]
  );
  const items = rows.map(serializeItem);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.quantity * i.product.price, 0);
  res.json({ success: true, cartId, items, totalItems, totalPrice });
}

const addSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().default(1),
  selectedColor: z.string().max(60).optional().nullable(),
  selectedSize: z.string().max(60).optional().nullable(),
});

export async function addToCart(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const body = addSchema.parse(req.body);
  const cartId = await getOrCreateCartId(req.user.id);

  const [prodRows] = await pool.query<(RowDataPacket & { id: number })[]>(
    `SELECT id FROM products WHERE id = ? AND is_active = 1 LIMIT 1`,
    [body.productId]
  );
  if (!prodRows[0]) throw ApiError.notFound("Product not found");

  // Try insert; on duplicate (same variant), increment quantity.
  try {
    await pool.query<ResultSetHeader>(
      `INSERT INTO cart_items (cart_id, product_id, quantity, selected_color, selected_size)
       VALUES (?, ?, ?, ?, ?)`,
      [
        cartId,
        body.productId,
        body.quantity,
        body.selectedColor ?? null,
        body.selectedSize ?? null,
      ]
    );
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "ER_DUP_ENTRY") {
      await pool.query(
        `UPDATE cart_items
         SET quantity = quantity + ?
         WHERE cart_id = ? AND product_id = ?
           AND ${body.selectedColor ? "selected_color = ?" : "selected_color IS NULL"}
           AND ${body.selectedSize  ? "selected_size = ?"  : "selected_size IS NULL"}`,
        [
          body.quantity,
          cartId,
          body.productId,
          ...(body.selectedColor ? [body.selectedColor] : []),
          ...(body.selectedSize ? [body.selectedSize] : []),
        ]
      );
    } else {
      throw e;
    }
  }
  res.status(201).json({ success: true });
}

const updateSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

export async function updateCartItem(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const itemId = Number(req.params.itemId);
  const { quantity } = updateSchema.parse(req.body);
  const cartId = await getOrCreateCartId(req.user.id);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?`,
    [quantity, itemId, cartId]
  );
  if (!result.affectedRows) throw ApiError.notFound("Cart item not found");
  res.json({ success: true });
}

export async function removeCartItem(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const itemId = Number(req.params.itemId);
  const cartId = await getOrCreateCartId(req.user.id);
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM cart_items WHERE id = ? AND cart_id = ?`,
    [itemId, cartId]
  );
  if (!result.affectedRows) throw ApiError.notFound("Cart item not found");
  res.json({ success: true });
}

export async function clearCart(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const cartId = await getOrCreateCartId(req.user.id);
  await pool.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
  res.json({ success: true });
}
