# E-commerce Website

This repository contains two Next.js applications plus a shared backend:

- `Admin` - Admin dashboard/application (Next.js)
- `User` - Customer-facing storefront (Next.js)
- `backend` - Role-based REST API (Express + MySQL)

## Project Structure

```text
E-commerce/
  Admin/
  User/
  backend/
```

## Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm
- MySQL 8+ (for the backend)

## Run Admin App

```bash
cd Admin
npm install
npm run dev
```

The app will start on the default Next.js development port.

## Run User App

```bash
cd User
npm install
npm run dev
```

The app will start on the default Next.js development port.

## Run Backend API

```bash
cd backend
npm install
cp .env.example .env   # adjust MYSQL_* if needed
npm run db:init        # creates the `e-commerce` database + tables
npm run db:seed        # seeds admin/user accounts + sample products
npm run dev
```

The API runs on `http://localhost:5000`.

Seeded accounts:

- **Admin:** `admin@antigravity.io` / `admin12345`
- **User:** `user@demo.io` / `user12345`

See `backend/README.md` for the full API reference.

## Build for Production

Run in each app directory (`Admin` and `User`):

```bash
npm run build
npm start
```

## Lint

Run in each app directory:

```bash
npm run lint
```

## Notes

- Each app manages its own dependencies and lockfile.
- Do not commit `node_modules` or build outputs (`.next`, `out`).
