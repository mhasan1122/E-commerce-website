-- Initial schema migration.
-- Note: database selection is handled by src/scripts/migrate.ts

-- ---------------------------------------------------------
--  Users (admin + user roles)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','user') NOT NULL DEFAULT 'user',
  phone         VARCHAR(40) DEFAULT NULL,
  avatar_url    VARCHAR(500) DEFAULT NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
--  Categories
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  slug          VARCHAR(140) NOT NULL UNIQUE,
  icon          VARCHAR(60) DEFAULT NULL,
  gradient      VARCHAR(120) DEFAULT NULL,
  image         VARCHAR(500) DEFAULT NULL,
  product_count INT NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
--  Products
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  slug          VARCHAR(220) NOT NULL UNIQUE,
  description   TEXT,
  price         INT NOT NULL DEFAULT 0,
  old_price     INT DEFAULT NULL,
  stock         INT NOT NULL DEFAULT 0,
  rating        DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  review_count  INT NOT NULL DEFAULT 0,
  sold_count    INT NOT NULL DEFAULT 0,
  badge         ENUM('hot','new','sale') DEFAULT NULL,
  category_id   INT DEFAULT NULL,
  images        JSON,
  colors        JSON,
  sizes         JSON,
  features      JSON,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_products_slug (slug),
  INDEX idx_products_category (category_id),
  INDEX idx_products_active (is_active),
  INDEX idx_products_badge (badge)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
--  Cart + Cart Items (persisted per user)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cart_items (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  cart_id         INT NOT NULL,
  product_id      INT NOT NULL,
  quantity        INT NOT NULL DEFAULT 1,
  selected_color  VARCHAR(60) DEFAULT NULL,
  selected_size   VARCHAR(60) DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_cart_product_variant (cart_id, product_id, selected_color, selected_size)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
--  Wishlist
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
--  Addresses
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  full_name    VARCHAR(160) NOT NULL,
  phone        VARCHAR(40) DEFAULT NULL,
  line1        VARCHAR(200) NOT NULL,
  line2        VARCHAR(200) DEFAULT NULL,
  city         VARCHAR(120) NOT NULL,
  state        VARCHAR(120) DEFAULT NULL,
  postal_code  VARCHAR(40) DEFAULT NULL,
  country      VARCHAR(120) NOT NULL DEFAULT 'Bangladesh',
  is_default   TINYINT(1) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
--  Orders
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_number    VARCHAR(40) NOT NULL UNIQUE,
  user_id         INT NOT NULL,
  status          ENUM('pending','paid','processing','shipped','delivered','cancelled','refunded')
                  NOT NULL DEFAULT 'pending',
  payment_status  ENUM('unpaid','paid','refunded','failed') NOT NULL DEFAULT 'unpaid',
  payment_method  VARCHAR(60) DEFAULT 'cod',
  subtotal        INT NOT NULL DEFAULT 0,
  shipping_fee    INT NOT NULL DEFAULT 0,
  tax             INT NOT NULL DEFAULT 0,
  discount        INT NOT NULL DEFAULT 0,
  total           INT NOT NULL DEFAULT 0,
  shipping_address JSON,
  notes           TEXT,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_id        INT NOT NULL,
  product_id      INT DEFAULT NULL,
  product_name    VARCHAR(220) NOT NULL,
  product_image   VARCHAR(500) DEFAULT NULL,
  unit_price      INT NOT NULL,
  quantity        INT NOT NULL,
  selected_color  VARCHAR(60) DEFAULT NULL,
  selected_size   VARCHAR(60) DEFAULT NULL,
  line_total      INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
--  Reviews
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id    INT NOT NULL,
  rating     TINYINT NOT NULL,
  title      VARCHAR(200) DEFAULT NULL,
  body       TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_review_user_product (product_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
