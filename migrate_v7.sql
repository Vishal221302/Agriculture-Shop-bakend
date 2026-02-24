-- =============================================
-- MIGRATION v7: Add package size to products
-- Adds: package_qty (number) and package_unit (ml/L/KG/g)
-- Safe to run multiple times (uses IF NOT EXISTS)
-- =============================================

USE `e-commerces`;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS package_qty DECIMAL(10,2) DEFAULT NULL AFTER show_quantity;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS package_unit VARCHAR(10) DEFAULT 'ml' AFTER package_qty;

SELECT 'Migration v7 complete ✅ — package_qty, package_unit added to products' AS status;
