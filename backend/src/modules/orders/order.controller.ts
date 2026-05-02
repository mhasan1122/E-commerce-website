import { Response } from "express";
import { z } from "zod";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../types";
import { env } from "../../config/env";
import { initiatePaystationPayment } from "../payment/payment.service";

/* ---------- types ---------- */

interface OrderRow extends RowDataPacket {
  id: number;
  order_number: string;
  user_id: number;
  user_name?: string;
  user_email?: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  discount: number;
  total: number;
  shipping_address: unknown;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

interface OrderItemRow extends RowDataPacket {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  selected_color: string | null;
  selected_size: string | null;
  line_total: number;
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return value as T;
}

function serializeOrder(o: OrderRow, items: OrderItemRow[] = []) {
  return {
    id: o.id,
    orderNumber: o.order_number,
    userId: o.user_id,
    userName: o.user_name ?? null,
    userEmail: o.user_email ?? null,
    status: o.status,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    subtotal: o.subtotal,
    shippingFee: o.shipping_fee,
    tax: o.tax,
    discount: o.discount,
    total: o.total,
    shippingAddress: parseJson<Record<string, unknown> | null>(o.shipping_address, null),
    notes: o.notes,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    items: items.map((i) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name,
      productImage: i.product_image,
      unitPrice: i.unit_price,
      quantity: i.quantity,
      selectedColor: i.selected_color,
      selectedSize: i.selected_size,
      lineTotal: i.line_total,
    })),
  };
}

/* ---------- create order ---------- */

const addressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().optional(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Bangladesh"),
});

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
        selectedColor: z.string().optional().nullable(),
        selectedSize: z.string().optional().nullable(),
      })
    )
    .optional(),
  useCart: z.boolean().optional(),
  shippingAddress: addressSchema,
  paymentMethod: z.string().default("cod"),
  notes: z.string().optional(),
  shippingFee: z.number().int().nonnegative().default(0),
  tax: z.number().int().nonnegative().default(0),
  discount: z.number().int().nonnegative().default(0),
});

function genOrderNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 1e6).toString().padStart(6, "0");
  return `ORD-${y}${m}${day}-${rand}`;
}

export async function createOrder(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const body = createOrderSchema.parse(req.body);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    type LineItem = {
      productId: number;
      quantity: number;
      selectedColor?: string | null;
      selectedSize?: string | null;
    };

    let lineItems: LineItem[] = [];

    if (body.useCart) {
      const [cartRows] = await conn.query<(RowDataPacket & { id: number })[]>(
        `SELECT id FROM carts WHERE user_id = ? LIMIT 1`,
        [req.user.id]
      );
      const cartId = cartRows[0]?.id;
      if (!cartId) throw ApiError.badRequest("Cart is empty");

      const [cartItems] = await conn.query<
        (RowDataPacket & {
          product_id: number;
          quantity: number;
          selected_color: string | null;
          selected_size: string | null;
        })[]
      >(
        `SELECT product_id, quantity, selected_color, selected_size
         FROM cart_items WHERE cart_id = ?`,
        [cartId]
      );
      if (!cartItems.length) throw ApiError.badRequest("Cart is empty");

      lineItems = cartItems.map((ci) => ({
        productId: ci.product_id,
        quantity: ci.quantity,
        selectedColor: ci.selected_color,
        selectedSize: ci.selected_size,
      }));
    } else {
      if (!body.items || !body.items.length) {
        throw ApiError.badRequest("items[] or useCart=true required");
      }
      lineItems = body.items;
    }

    const ids = lineItems.map((i) => i.productId);
    const placeholders = ids.map(() => "?").join(",");
    const [products] = await conn.query<
      (RowDataPacket & {
        id: number;
        name: string;
        price: number;
        stock: number;
        images: unknown;
      })[]
    >(
      `SELECT id, name, price, stock, images
       FROM products
       WHERE id IN (${placeholders}) AND is_active = 1`,
      ids
    );
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const resolvedItems = lineItems.map((li) => {
      const p = productMap.get(li.productId);
      if (!p) throw ApiError.badRequest(`Product ${li.productId} is unavailable`);
      if (p.stock < li.quantity) {
        throw ApiError.badRequest(`Not enough stock for "${p.name}"`);
      }
      const lineTotal = p.price * li.quantity;
      subtotal += lineTotal;
      const images = parseJson<string[]>(p.images, []);
      return {
        productId: p.id,
        productName: p.name,
        productImage: images[0] ?? null,
        unitPrice: p.price,
        quantity: li.quantity,
        selectedColor: li.selectedColor ?? null,
        selectedSize: li.selectedSize ?? null,
        lineTotal,
      };
    });

    const total = subtotal + body.shippingFee + body.tax - body.discount;
    const orderNumber = genOrderNumber();

    const [orderResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO orders
         (order_number, user_id, status, payment_status, payment_method,
          subtotal, shipping_fee, tax, discount, total, shipping_address, notes)
       VALUES (?, ?, 'pending', 'unpaid', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        req.user.id,
        body.paymentMethod,
        subtotal,
        body.shippingFee,
        body.tax,
        body.discount,
        total,
        JSON.stringify(body.shippingAddress),
        body.notes ?? null,
      ]
    );
    const orderId = orderResult.insertId;

    for (const it of resolvedItems) {
      await conn.query<ResultSetHeader>(
        `INSERT INTO order_items
          (order_id, product_id, product_name, product_image, unit_price, quantity,
           selected_color, selected_size, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          it.productId,
          it.productName,
          it.productImage,
          it.unitPrice,
          it.quantity,
          it.selectedColor,
          it.selectedSize,
          it.lineTotal,
        ]
      );

      await conn.query(
        `UPDATE products
         SET stock = GREATEST(stock - ?, 0),
             sold_count = sold_count + ?
         WHERE id = ?`,
        [it.quantity, it.quantity, it.productId]
      );
    }

    if (body.useCart) {
      await conn.query(
        `DELETE ci FROM cart_items ci
         JOIN carts c ON c.id = ci.cart_id
         WHERE c.user_id = ?`,
        [req.user.id]
      );
    }

    await conn.commit();

    // Initiate Paystation payment outside the transaction
    let paymentUrl: string | null = null;
    if (body.paymentMethod === "paystation") {
      try {
        paymentUrl = await initiatePaystationPayment({
          invoiceNumber: orderNumber,
          amount: total,
          customerName: req.user!.name,
          customerEmail: req.user!.email,
          customerPhone: body.shippingAddress.phone || "01700000000",
          callbackUrl: `${env.serverUrl}/api/payment/callback`,
        });
      } catch (err) {
        console.error("[Paystation] initiation failed:", err);
        // Order is created; caller can retry or use another method
      }
    }

    res.status(201).json({
      success: true,
      orderId,
      orderNumber,
      total,
      paymentUrl,
    });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

/* ---------- list / get ---------- */

const listSchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().optional(),
});

export async function listMyOrders(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const q = listSchema.parse(req.query);
  const where: string[] = ["o.user_id = ?"];
  const params: unknown[] = [req.user.id];
  if (q.status) {
    where.push("o.status = ?");
    params.push(q.status);
  }
  const offset = (q.page - 1) * q.limit;
  const [rows] = await pool.query<OrderRow[]>(
    `SELECT o.* FROM orders o
     WHERE ${where.join(" AND ")}
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, q.limit, offset]
  );
  res.json({ success: true, page: q.page, limit: q.limit, data: rows.map((o) => serializeOrder(o)) });
}

export async function listAllOrders(req: AuthRequest, res: Response) {
  const q = listSchema.parse(req.query);
  const where: string[] = [];
  const params: unknown[] = [];
  if (q.status) {
    where.push("o.status = ?");
    params.push(q.status);
  }
  if (q.q) {
    where.push("(o.order_number LIKE ? OR u.email LIKE ? OR u.name LIKE ?)");
    params.push(`%${q.q}%`, `%${q.q}%`, `%${q.q}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (q.page - 1) * q.limit;

  const [rows] = await pool.query<OrderRow[]>(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ${whereSql}
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, q.limit, offset]
  );
  const [[countRow]] = await pool.query<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) AS total FROM orders o
     JOIN users u ON u.id = o.user_id
     ${whereSql}`,
    params
  );

  res.json({
    success: true,
    page: q.page,
    limit: q.limit,
    total: countRow.total,
    data: rows.map((o) => serializeOrder(o)),
  });
}

export async function getOrder(req: AuthRequest, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const id = Number(req.params.id);

  const [rows] = await pool.query<OrderRow[]>(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE o.id = ?
     LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) throw ApiError.notFound("Order not found");

  // Users can only see their own orders; admins can see any.
  if (req.user.role !== "admin" && row.user_id !== req.user.id) {
    throw ApiError.forbidden();
  }

  const [items] = await pool.query<OrderItemRow[]>(
    `SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC`,
    [id]
  );

  res.json({ success: true, data: serializeOrder(row, items) });
}

const updateStatusSchema = z.object({
  status: z
    .enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"])
    .optional(),
  paymentStatus: z.enum(["unpaid", "paid", "refunded", "failed"]).optional(),
});

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const body = updateStatusSchema.parse(req.body);
  const fields: string[] = [];
  const values: unknown[] = [];
  if (body.status) {
    fields.push("status = ?");
    values.push(body.status);
  }
  if (body.paymentStatus) {
    fields.push("payment_status = ?");
    values.push(body.paymentStatus);
  }
  if (!fields.length) throw ApiError.badRequest("Nothing to update");
  values.push(id);

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE orders SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  if (!result.affectedRows) throw ApiError.notFound("Order not found");
  res.json({ success: true });
}

/* ---------- admin stats (for dashboard) ---------- */

export async function adminStats(_req: AuthRequest, res: Response) {
  const [[orders]] = await pool.query<
    (RowDataPacket & { total_orders: number; revenue: number; pending: number })[]
  >(
    `SELECT
       COUNT(*) AS total_orders,
       COALESCE(SUM(total), 0) AS revenue,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
     FROM orders`
  );
  const [[users]] = await pool.query<(RowDataPacket & { total_users: number; customers: number })[]>(
    `SELECT
       COUNT(*) AS total_users,
       SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) AS customers
     FROM users`
  );
  const [[products]] = await pool.query<
    (RowDataPacket & { total_products: number; low_stock: number })[]
  >(
    `SELECT
       COUNT(*) AS total_products,
       SUM(CASE WHEN stock < 10 THEN 1 ELSE 0 END) AS low_stock
     FROM products`
  );

  res.json({
    success: true,
    data: {
      orders: {
        total: Number(orders.total_orders) || 0,
        revenue: Number(orders.revenue) || 0,
        pending: Number(orders.pending) || 0,
      },
      users: {
        total: Number(users.total_users) || 0,
        customers: Number(users.customers) || 0,
      },
      products: {
        total: Number(products.total_products) || 0,
        lowStock: Number(products.low_stock) || 0,
      },
    },
  });
}
