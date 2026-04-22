# E-commerce Website

This repository contains two Next.js applications for an e-commerce project:

- `Admin` - Admin dashboard/application
- `User` - Customer-facing storefront

## Project Structure

```text
E-commerce/
  Admin/
  User/
```

## Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm

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
