import { Response } from "express";
import { z } from "zod";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../types";

interface CategoryRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  gradient: string | null;
  image: string | null;
  product_count: number;
}

const categoryInputSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(140),
  icon: z.string().max(60).optional().nullable(),
  gradient: z.string().max(120).optional().nullable(),
  image: z.string().url().max(500).optional().nullable(),
});

function serialize(c: CategoryRow) {
  return {
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    icon: c.icon ?? "",
    gradient: c.gradient ?? "",
    image: c.image ?? "",
    productCount: c.product_count,
  };
}

export async function listCategories(_req: AuthRequest, res: Response) {
  const [rows] = await pool.query<CategoryRow[]>(
    `SELECT c.*, 
            (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS product_count
     FROM categories c
     ORDER BY c.name ASC`
  );
  res.json({ success: true, data: rows.map(serialize) });
}

export async function getCategory(req: AuthRequest, res: Response) {
  const { idOrSlug } = req.params;
  const isNumeric = /^\d+$/.test(idOrSlug);
  const [rows] = await pool.query<CategoryRow[]>(
    `SELECT c.*, 
            (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS product_count
     FROM categories c
     WHERE ${isNumeric ? "c.id = ?" : "c.slug = ?"}
     LIMIT 1`,
    [idOrSlug]
  );
  const row = rows[0];
  if (!row) throw ApiError.notFound("Category not found");
  res.json({ success: true, data: serialize(row) });
}

export async function createCategory(req: AuthRequest, res: Response) {
  const body = categoryInputSchema.parse(req.body);
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO categories (name, slug, icon, gradient, image)
     VALUES (?, ?, ?, ?, ?)`,
    [body.name, body.slug, body.icon ?? null, body.gradient ?? null, body.image ?? null]
  );
  res.status(201).json({ success: true, id: result.insertId });
}

export async function updateCategory(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const body = categoryInputSchema.partial().parse(req.body);

  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [k, v] of Object.entries(body)) {
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (!fields.length) throw ApiError.badRequest("Nothing to update");
  values.push(id);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  if (!result.affectedRows) throw ApiError.notFound("Category not found");
  res.json({ success: true });
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM categories WHERE id = ?`,
    [id]
  );
  if (!result.affectedRows) throw ApiError.notFound("Category not found");
  res.json({ success: true });
}
