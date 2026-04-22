import { Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest, UserRole } from "../../types";

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_active: number;
  created_at: Date;
}

function serialize(u: UserRow) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    avatarUrl: u.avatar_url,
    isActive: !!u.is_active,
    createdAt: u.created_at,
  };
}

/* ---- admin: list / get / update / delete ---- */

const listSchema = z.object({
  q: z.string().optional(),
  role: z.enum(["admin", "user"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export async function listUsers(req: AuthRequest, res: Response) {
  const q = listSchema.parse(req.query);
  const where: string[] = [];
  const params: unknown[] = [];
  if (q.q) {
    where.push("(name LIKE ? OR email LIKE ?)");
    params.push(`%${q.q}%`, `%${q.q}%`);
  }
  if (q.role) {
    where.push("role = ?");
    params.push(q.role);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (q.page - 1) * q.limit;

  const [rows] = await pool.query<UserRow[]>(
    `SELECT id, name, email, role, phone, avatar_url, is_active, created_at
     FROM users ${whereSql}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, q.limit, offset]
  );
  const [[countRow]] = await pool.query<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) AS total FROM users ${whereSql}`,
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

export async function getUser(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const [rows] = await pool.query<UserRow[]>(
    `SELECT id, name, email, role, phone, avatar_url, is_active, created_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) throw ApiError.notFound("User not found");
  res.json({ success: true, data: serialize(row) });
}

const adminUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().max(190).optional(),
  role: z.enum(["admin", "user"]).optional(),
  phone: z.string().max(40).nullable().optional(),
  avatarUrl: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).max(128).optional(),
});

export async function adminUpdateUser(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const body = adminUpdateSchema.parse(req.body);

  const map: Record<string, string> = {
    name: "name",
    email: "email",
    role: "role",
    phone: "phone",
    avatarUrl: "avatar_url",
    isActive: "is_active",
  };

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [k, v] of Object.entries(body)) {
    if (k === "password") continue;
    if (map[k]) {
      fields.push(`${map[k]} = ?`);
      values.push(k === "isActive" ? (v ? 1 : 0) : v);
    }
  }
  if (body.password) {
    fields.push("password_hash = ?");
    values.push(await bcrypt.hash(body.password, 10));
  }

  if (!fields.length) throw ApiError.badRequest("Nothing to update");
  values.push(id);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  if (!result.affectedRows) throw ApiError.notFound("User not found");
  res.json({ success: true });
}

export async function deleteUser(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  if (req.user?.id === id) throw ApiError.badRequest("You cannot delete yourself");
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM users WHERE id = ?`,
    [id]
  );
  if (!result.affectedRows) throw ApiError.notFound("User not found");
  res.json({ success: true });
}

/* ---- self profile: /me/profile ---- */

const selfUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().max(40).nullable().optional(),
  avatarUrl: z.string().max(500).nullable().optional(),
  password: z.string().min(6).max(128).optional(),
  currentPassword: z.string().optional(),
});

export async function updateProfile(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const body = selfUpdateSchema.parse(req.body);

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) {
    fields.push("name = ?");
    values.push(body.name);
  }
  if (body.phone !== undefined) {
    fields.push("phone = ?");
    values.push(body.phone);
  }
  if (body.avatarUrl !== undefined) {
    fields.push("avatar_url = ?");
    values.push(body.avatarUrl);
  }
  if (body.password) {
    if (!body.currentPassword) throw ApiError.badRequest("currentPassword required");
    const [rows] = await pool.query<(RowDataPacket & { password_hash: string })[]>(
      `SELECT password_hash FROM users WHERE id = ?`,
      [req.user.id]
    );
    const ok = rows[0] && (await bcrypt.compare(body.currentPassword, rows[0].password_hash));
    if (!ok) throw ApiError.unauthorized("Current password is wrong");
    fields.push("password_hash = ?");
    values.push(await bcrypt.hash(body.password, 10));
  }

  if (!fields.length) throw ApiError.badRequest("Nothing to update");
  values.push(req.user.id);

  await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
  res.json({ success: true });
}
