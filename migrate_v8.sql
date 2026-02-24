-- =============================================
-- MIGRATION v8: Multiple Banners table
-- Replaces single-row `banner` with multi-row `banners`
-- Safe to run multiple times
-- =============================================

USE `e-commerces`;

CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  banner_type VARCHAR(20) DEFAULT 'image',
  banner_image VARCHAR(500) DEFAULT NULL,
  video_url VARCHAR(500) DEFAULT NULL,
  title_hi VARCHAR(300) DEFAULT '',
  title_en VARCHAR(300) DEFAULT '',
  description_hi TEXT DEFAULT NULL,
  description_en TEXT DEFAULT NULL,
  show_bg TINYINT(1) NOT NULL DEFAULT 1,
  bg_color VARCHAR(30) DEFAULT '#14532d',
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copy existing banner into new table (only if banners is empty)
INSERT INTO banners (banner_type, banner_image, video_url, title_hi, title_en, description_hi, description_en, show_bg, bg_color, is_active)
SELECT
  COALESCE(banner_type, 'image'),
  banner_image,
  video_url,
  COALESCE(title_hi, ''),
  COALESCE(title_en, ''),
  description_hi,
  description_en,
  COALESCE(show_bg, 1),
  COALESCE(bg_color, '#14532d'),
  COALESCE(show_banner, 1)
FROM banner
WHERE NOT EXISTS (SELECT 1 FROM banners LIMIT 1)
LIMIT 1;

SELECT 'Migration v8 complete ✅ — banners table created' AS status;
