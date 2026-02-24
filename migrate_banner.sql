-- =============================================
-- MIGRATION: Add banner table
-- Run this in MySQL to add banner support
-- =============================================
USE `e-commerces`;

CREATE TABLE IF NOT EXISTS banner (
  id INT AUTO_INCREMENT PRIMARY KEY,
  banner_image VARCHAR(500) DEFAULT NULL,
  title_hi VARCHAR(300) DEFAULT 'किसान कृषि केंद्र में आपका स्वागत है',
  title_en VARCHAR(300) DEFAULT 'Welcome to Kisan Krishi Kendra',
  description_hi TEXT DEFAULT 'सही कीटनाशक चुनें, बेहतर फसल पाएं। हम हर किसान की मदद के लिए तैयार हैं।',
  description_en TEXT DEFAULT 'Choose the right pesticide, get a better harvest. We are here to help every farmer.',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default banner row (only if empty)
INSERT INTO banner (title_hi, title_en, description_hi, description_en)
SELECT * FROM (SELECT
  'किसान कृषि केंद्र में आपका स्वागत है' as title_hi,
  'Welcome to Kisan Krishi Kendra' as title_en,
  'सही कीटनाशक चुनें, बेहतर फसल पाएं। हम हर किसान की मदद के लिए तैयार हैं।' as description_hi,
  'Choose the right pesticide, get a better harvest. We are here to help every farmer.' as description_en
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM banner LIMIT 1);
