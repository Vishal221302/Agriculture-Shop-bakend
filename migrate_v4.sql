-- =============================================
-- Agriculture Pesticide Shop — Migration v4
-- Adds: price, show_price, show_quantity to products
--       category_image to categories (if missing)
--       video_type to products (if missing)
-- Safe to run multiple times
-- =============================================

USE `e-commerces`;

-- 1. Add video_type to products if not exists
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS video_type VARCHAR(20) DEFAULT 'youtube' AFTER video_url;

-- 2. Add price to products if not exists
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT NULL AFTER dosage_per_bigha;

-- 3. Add show_price to products if not exists
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_price TINYINT(1) NOT NULL DEFAULT 0 AFTER price;

-- 4. Add show_quantity to products if not exists
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_quantity TINYINT(1) NOT NULL DEFAULT 0 AFTER show_price;

-- 5. Add quantity to orders if not exists
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS quantity INT NOT NULL DEFAULT 1 AFTER address;

-- 6. Add category_image to categories if not exists
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS category_image VARCHAR(500) DEFAULT NULL AFTER icon;

-- 7. Rename order_status → status alias (keep order_status, just confirm column)
-- orders already has order_status — no change needed

-- 8. Add company_name to products if not exists
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) DEFAULT NULL AFTER medicine_name_en;

SELECT 'Migration v4 complete ✅' AS status;
