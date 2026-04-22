# E-commerce Backend

A role-based REST API built with **Express.js + TypeScript + MySQL** that serves both the `Admin` dashboard and `User` storefront Next.js apps.

## Features

- JWT authentication with `bcryptjs` password hashing
- Role-based access control: `admin` and `user`
- MySQL connection pool via `mysql2/promise`
- Zod validation for every request body
- Products, Categories, Cart, Wishlist, Orders, Users
- Admin-only endpoints for CRUD, order management and stats
- Transactional order creation (stock decrement + cart clear)
- Helmet, CORS, Morgan baked in
- Idempotent `db:init` and `db:seed` scripts

## Prerequisites

- Node.js 18+
- MySQL 8+ running locally
- A MySQL user that can create the `e-commerce` database

## Quickstart

```bash
cd backend

# 1. Install
npm install

# 2. Copy env (edit if needed)
cp .env.example .env

# 3. Create database + tables
npm run db:init

# 4. Seed admin + sample products
npm run db:seed

# 5. Run in dev mode
npm run dev
```

Server runs on `http://localhost:5000`. Health check: `GET /api/health`.

### Seeded accounts

| Role  | Email                   | Password     |
| ----- | ----------------------- | ------------ |
| admin | `admin@antigravity.io`  | `admin12345` |
| user  | `user@demo.io`          | `user12345`  |

## Environment

```dotenv
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=12345678
MYSQL_DATABASE=e-commerce

JWT_SECRET=super-secret-change-me-in-production
JWT_EXPIRES_IN=7d

SEED_ADMIN_EMAIL=admin@antigravity.io
SEED_ADMIN_PASSWORD=admin12345
SEED_ADMIN_NAME=Super Admin
```

## Project layout

```
backend/
├── src/
│   ├── app.ts                # Express app wiring
│   ├── server.ts             # Bootstraps MySQL + HTTP server
│   ├── config/
│   │   ├── db.ts             # MySQL connection pool
│   │   └── env.ts
│   ├── middleware/
│   │   ├── auth.ts           # requireAuth, requireRole, requireAdmin
│   │   └── errorHandler.ts
│   ├── modules/
│   │   ├── auth/             # register, login, me
│   │   ├── users/            # profile + admin user management
│   │   ├── categories/
│   │   ├── products/
│   │   ├── cart/             # persisted per-user cart
│   │   ├── wishlist/
│   │   └── orders/           # checkout + admin management
│   ├── scripts/
│   │   ├── initDb.ts         # Applies schema.sql
│   │   └── seed.ts           # Seeds admin + sample products
│   ├── sql/
│   │   └── schema.sql
│   ├── types/
│   └── utils/                # ApiError, asyncHandler, jwt
└── package.json
```

## Roles

| Role    | Can do                                                                 |
| ------- | ---------------------------------------------------------------------- |
| `user`  | Browse catalogue, manage own cart/wishlist, place & view own orders   |
| `admin` | Everything users can do + CRUD products/categories, manage users, manage all orders, view stats |

Public registration always creates a `user`. Admins are created by another admin (`POST /api/auth/admin/create-user`) or by the seed script.

## API reference

All endpoints are prefixed with `/api`. Authenticated endpoints expect `Authorization: Bearer <token>`.

### Auth

| Method | Path                       | Access | Description                              |
| ------ | -------------------------- | ------ | ---------------------------------------- |
| POST   | `/auth/register`           | public | Register a new `user` (storefront)       |
| POST   | `/auth/login`              | public | Log in. Pass `?role=admin` to force admin check (for Admin app) |
| GET    | `/auth/me`                 | auth   | Get current authenticated user           |
| POST   | `/auth/admin/create-user`  | admin  | Create another admin/user                |

`login` / `register` response:

```json
{ "success": true, "token": "<jwt>", "user": { "id": 1, "name": "…", "email": "…", "role": "admin" } }
```

### Categories

| Method | Path                    | Access | Description         |
| ------ | ----------------------- | ------ | ------------------- |
| GET    | `/categories`           | public | List categories     |
| GET    | `/categories/:idOrSlug` | public | Get one             |
| POST   | `/categories`           | admin  | Create              |
| PUT    | `/categories/:id`       | admin  | Update              |
| DELETE | `/categories/:id`       | admin  | Delete              |

### Products

| Method | Path                  | Access | Description                               |
| ------ | --------------------- | ------ | ----------------------------------------- |
| GET    | `/products`           | public | List with filters/pagination              |
| GET    | `/products/:idOrSlug` | public | Get one                                   |
| POST   | `/products`           | admin  | Create                                    |
| PUT    | `/products/:id`       | admin  | Update                                    |
| DELETE | `/products/:id`       | admin  | Delete                                    |

Query params on `GET /products`:
`q`, `category` (slug or id), `badge` (`hot|new|sale`), `minPrice`, `maxPrice`,
`sort` (`newest|price_asc|price_desc|rating|best_sellers`), `page`, `limit`, `onlyActive`.

### Cart (per user, persisted)

| Method | Path                  | Access | Description                    |
| ------ | --------------------- | ------ | ------------------------------ |
| GET    | `/cart`               | user   | Get cart with product details  |
| POST   | `/cart/items`         | user   | Add item (merges duplicates)   |
| PUT    | `/cart/items/:itemId` | user   | Update quantity                |
| DELETE | `/cart/items/:itemId` | user   | Remove item                    |
| DELETE | `/cart`               | user   | Clear cart                     |

### Wishlist

| Method | Path                    | Access | Description     |
| ------ | ----------------------- | ------ | --------------- |
| GET    | `/wishlist`             | user   | Get wishlist    |
| POST   | `/wishlist`             | user   | Add product     |
| DELETE | `/wishlist/:productId`  | user   | Remove product  |

### Orders

| Method | Path                       | Access | Description                                         |
| ------ | -------------------------- | ------ | --------------------------------------------------- |
| POST   | `/orders`                  | user   | Place order (from `items[]` or `useCart=true`)      |
| GET    | `/orders/my`               | user   | List current user's orders                          |
| GET    | `/orders/:id`              | user†  | Get order (admin can access any; user only own)     |
| GET    | `/orders/admin/all`        | admin  | List all orders                                     |
| PATCH  | `/orders/:id/status`       | admin  | Update status / payment status                      |
| GET    | `/orders/admin/stats`      | admin  | Aggregate stats for admin dashboard                 |

`POST /orders` body:

```json
{
  "useCart": true,
  "shippingAddress": {
    "fullName": "Jane Doe",
    "phone": "017...",
    "line1": "House 10, Road 5",
    "city": "Dhaka",
    "country": "Bangladesh"
  },
  "paymentMethod": "cod",
  "shippingFee": 6000,
  "tax": 0,
  "discount": 0
}
```

Or pass explicit `items`:

```json
{
  "items": [{ "productId": 1, "quantity": 2, "selectedColor": "#000" }],
  "shippingAddress": { ... }
}
```

The order is created in a transaction: stock is decremented, `sold_count` incremented, and the user's cart is cleared (when `useCart=true`).

### Users

| Method | Path                | Access | Description                              |
| ------ | ------------------- | ------ | ---------------------------------------- |
| PUT    | `/users/me/profile` | auth   | Update own profile / change password     |
| GET    | `/users`            | admin  | List users (filter `q`, `role`)          |
| GET    | `/users/:id`        | admin  | Get one                                  |
| PUT    | `/users/:id`        | admin  | Update (including role and password)     |
| DELETE | `/users/:id`        | admin  | Delete (cannot delete yourself)          |

### Health

```
GET /api/health → { "success": true, "status": "ok" }
```

## Integrating with the Next.js apps

Create `NEXT_PUBLIC_API_URL=http://localhost:5000/api` in each Next.js app and store the JWT in `localStorage` (or cookies). Example:

```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login?role=admin`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { token, user } = await res.json();
localStorage.setItem("adminToken", token);
```

Subsequent requests:

```ts
fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});
```

Prices are stored in **cents/paisa** (integers). Format on the frontend, e.g. `29900` → `$299.00`.

## Scripts

| Script         | Purpose                                        |
| -------------- | ---------------------------------------------- |
| `npm run dev`  | Start with nodemon + ts-node                   |
| `npm run build`| Compile TypeScript → `dist/`                   |
| `npm start`    | Run compiled `dist/server.js`                  |
| `npm run db:init` | Create database `e-commerce` + tables       |
| `npm run db:seed` | Seed admin + demo user + categories + products |
