import { Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../config/db";
import { signToken } from "../../utils/jwt";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest, UserRole } from "../../types";

/* -------- schemas -------- */

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(190),
  password: z.string().min(6).max(128),
  role: z.enum(["admin", "user"]).optional(),
  phone: z.string().max(40).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/* -------- helpers -------- */

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_active: number;
  created_at: Date;
}

async function findUserByEmail(email: string): Promise<UserRow | null> {
  const [rows] = await pool.query<UserRow[]>(
    `SELECT * FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
}

/* -------- handlers -------- */

/**
 * POST /api/auth/register
 * Public registration — creates a 'user' account.
 * Admin-created users can specify role if request is made by an admin (handled via admin routes).
 */
export async function register(req: AuthRequest, res: Response) {
  const body = registerSchema.parse(req.body);

  // Public registration always forces role='user'.
  const role: UserRole = "user";

  const existing = await findUserByEmail(body.email);
  if (existing) throw ApiError.conflict("Email already registered");

  const hash = await bcrypt.hash(body.password, 10);
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES (?, ?, ?, ?, ?)`,
    [body.name, body.email, hash, role, body.phone ?? null]
  );

  const user = {
    id: result.insertId,
    name: body.name,
    email: body.email,
    role,
  };

  const token = signToken(user);
  res.status(201).json({ success: true, token, user });
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Optional query: ?role=admin  → ensures the user trying to log in is an admin (for admin app).
 */
export async function login(req: AuthRequest, res: Response) {
  const body = loginSchema.parse(req.body);
  const requiredRole = (req.query.role as UserRole | undefined) ?? undefined;

  const row = await findUserByEmail(body.email);
  if (!row) throw ApiError.unauthorized("Invalid email or password");
  if (!row.is_active) throw ApiError.forbidden("Account disabled");

  const ok = await bcrypt.compare(body.password, row.password_hash);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");

  if (requiredRole && row.role !== requiredRole) {
    throw ApiError.forbidden(
      `This account is not a '${requiredRole}'. Use the correct login.`
    );
  }

  const user = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  };

  const token = signToken(user);
  res.json({ success: true, token, user });
}

/**
 * GET /api/auth/me
 * Returns the current authenticated user.
 */
export async function me(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const [rows] = await pool.query<UserRow[]>(
    `SELECT id, name, email, role, phone, avatar_url, is_active, created_at
     FROM users WHERE id = ? LIMIT 1`,
    [req.user.id]
  );
  const row = rows[0];
  if (!row) throw ApiError.notFound("User not found");

  res.json({
    success: true,
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      isActive: !!row.is_active,
      createdAt: row.created_at,
    },
  });
}

/**
 * POST /api/auth/admin/register
 * Admin-only: create another admin or user.
 */
export async function adminCreateUser(req: AuthRequest, res: Response) {
  const body = registerSchema.parse(req.body);
  const role: UserRole = body.role ?? "user";

  const existing = await findUserByEmail(body.email);
  if (existing) throw ApiError.conflict("Email already registered");

  const hash = await bcrypt.hash(body.password, 10);
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO users (name, email, password_hash, role, phone)
     VALUES (?, ?, ?, ?, ?)`,
    [body.name, body.email, hash, role, body.phone ?? null]
  );

  res.status(201).json({
    success: true,
    user: {
      id: result.insertId,
      name: body.name,
      email: body.email,
      role,
    },
  });
}
