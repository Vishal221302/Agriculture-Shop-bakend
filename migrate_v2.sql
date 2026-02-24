-- =============================================
-- MIGRATION V2: Advanced Banner + Video System
-- Run this in MySQL to upgrade existing tables
-- =============================================
USE `e-commerces`;

-- 1. Upgrade banner table
ALTER TABLE banner
  ADD COLUMN IF NOT EXISTS banner_type ENUM('image','video') NOT NULL DEFAULT 'image' AFTER id,
  ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) DEFAULT NULL AFTER banner_image,
  ADD COLUMN IF NOT EXISTS show_banner TINYINT(1) NOT NULL DEFAULT 1 AFTER description_en;

-- 2. Add category_image to categories
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS category_image VARCHAR(500) DEFAULT NULL AFTER icon;

-- 3. Add video_type to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS video_type ENUM('youtube','upload') NOT NULL DEFAULT 'youtube' AFTER video_url;
