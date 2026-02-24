-- =============================================
-- Cart System Migration
-- Agriculture Pesticide Shop
-- =============================================
-- Run this ONCE against your database:
--   mysql -u root -p e-commerces < migrate_cart.sql
-- =============================================

USE `e-commerces`;

-- Step 1: Drop old foreign key (product_id on orders)
-- MySQL requires dropping FK by constraint name first
SET FOREIGN_KEY_CHECKS=0;

-- Remove product_id and quantity columns from orders
ALTER TABLE orders
  DROP COLUMN IF EXISTS product_id,
  DROP COLUMN IF EXISTS quantity;

SET FOREIGN_KEY_CHECKS=1;

-- Step 2: Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  price       DECIMAL(10,2) DEFAULT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
