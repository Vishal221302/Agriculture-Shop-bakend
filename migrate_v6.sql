-- =============================================
-- MIGRATION v6: Add missing columns
-- Safely adds: company_name, show_bg, bg_color,
--              banner_type, show_banner, video_url to banner
-- Safe to run multiple times (uses IF NOT EXISTS)
-- =============================================

USE `e-commerces`;

-- 1. Products: add company_name (from v4, may not have run)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) DEFAULT NULL AFTER medicine_name_en;

-- 2. Products: add price, show_price, show_quantity (from v4, may not have run)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT NULL AFTER dosage_per_bigha;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_price TINYINT(1) NOT NULL DEFAULT 0 AFTER price;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_quantity TINYINT(1) NOT NULL DEFAULT 0 AFTER show_price;

-- 3. Products: add video_type (from v4, may not have run)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS video_type VARCHAR(20) DEFAULT 'youtube' AFTER video_url;

-- 4. Banner: add show_banner (from v5, may not have run)
ALTER TABLE banner
  ADD COLUMN IF NOT EXISTS show_banner TINYINT(1) NOT NULL DEFAULT 1 AFTER description_en;

-- 5. Banner: add show_bg (from v5, may not have run)
ALTER TABLE banner
  ADD COLUMN IF NOT EXISTS show_bg TINYINT(1) NOT NULL DEFAULT 1 AFTER show_banner;

-- 6. Banner: add bg_color (NEW — was missing from all migrations)
ALTER TABLE banner
  ADD COLUMN IF NOT EXISTS bg_color VARCHAR(30) DEFAULT '#14532d' AFTER show_bg;

-- 7. Banner: add banner_type (may be missing)
ALTER TABLE banner
  ADD COLUMN IF NOT EXISTS banner_type VARCHAR(20) DEFAULT 'image' AFTER id;

-- 8. Banner: add video_url (may be missing)
ALTER TABLE banner
  ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) DEFAULT NULL AFTER banner_image;

SELECT 'Migration v6 complete ✅ — company_name, show_bg, bg_color added' AS status;
