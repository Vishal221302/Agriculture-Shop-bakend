-- =============================================
-- MIGRATION V3: Banner Background Color
-- Run this in MySQL to add bg_color to banner table
-- =============================================
USE `e-commerces`;

-- Add bg_color column (hex color, e.g. #14532d)
ALTER TABLE banner
  ADD COLUMN IF NOT EXISTS bg_color VARCHAR(20) NOT NULL DEFAULT '#14532d' AFTER show_bg;
