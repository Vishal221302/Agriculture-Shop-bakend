-- =============================================
-- Agriculture Pesticide Shop - Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS `e-commerces` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `e-commerces`;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_hi VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT '🌾',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  medicine_name_hi VARCHAR(200) NOT NULL,
  medicine_name_en VARCHAR(200) NOT NULL,
  disease_name_hi VARCHAR(200) NOT NULL,
  disease_name_en VARCHAR(200) NOT NULL,
  dosage_per_bigha VARCHAR(100) NOT NULL,
  usage_hi TEXT,
  usage_en TEXT,
  product_image VARCHAR(500) DEFAULT NULL,
  video_url VARCHAR(500) DEFAULT NULL,
  certification_images TEXT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  address TEXT NOT NULL,
  order_status ENUM('pending','confirmed','delivered','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SEED DATA
-- =============================================

-- Categories
INSERT INTO categories (name_hi, name_en, icon) VALUES
('गेहूं', 'Wheat', '🌾'),
('चावल', 'Rice', '🍚'),
('सब्जियां', 'Vegetables', '🥦');

-- Products for Wheat (category_id = 1)
INSERT INTO products (category_id, medicine_name_hi, medicine_name_en, disease_name_hi, disease_name_en, dosage_per_bigha, usage_hi, usage_en, video_url) VALUES
(1, 'मैन्कोजेब 75% WP', 'Mancozeb 75% WP', 'गेरुआ रोग (रस्ट)', 'Wheat Rust Disease', '30 ग्राम प्रति बीघा',
'1. 30 ग्राम दवा को 15 लीटर पानी में घोलें\n2. सुबह या शाम के समय छिड़काव करें\n3. 15 दिन बाद दोबारा छिड़काव करें\n4. आंख और मुंह को ढककर रखें',
'1. Mix 30g in 15 liters of water\n2. Spray in morning or evening\n3. Repeat spray after 15 days\n4. Cover eyes and mouth while spraying',
'https://www.youtube.com/embed/dQw4w9WgXcQ'),

(1, 'क्लोरोपाइरीफॉस 20% EC', 'Chloropyrifos 20% EC', 'दीमक और माहू', 'Termite and Aphid', '50 ml प्रति बीघा',
'1. 50 ml दवा को 15 लीटर पानी में मिलाएं\n2. खेत में समान रूप से छिड़काव करें\n3. छिड़काव के बाद हाथ धोएं\n4. बच्चों से दूर रखें',
'1. Mix 50ml in 15 liters of water\n2. Spray evenly across the field\n3. Wash hands after spraying\n4. Keep away from children',
'https://www.youtube.com/embed/dQw4w9WgXcQ'),

(1, 'यूरिया खाद स्प्रे', 'Urea Spray Solution', 'पीलापन (नाइट्रोजन कमी)', 'Yellowing (Nitrogen Deficiency)', '2% घोल प्रति बीघा',
'1. 2 किलो यूरिया 100 लीटर पानी में घोलें\n2. पत्तियों पर छिड़काव करें\n3. फूल आने से पहले करें\n4. हर 10 दिन पर दोहराएं',
'1. Mix 2kg Urea in 100 liters water\n2. Spray on leaves\n3. Apply before flowering\n4. Repeat every 10 days',
NULL);

-- Products for Rice (category_id = 2)
INSERT INTO products (category_id, medicine_name_hi, medicine_name_en, disease_name_hi, disease_name_en, dosage_per_bigha, usage_hi, usage_en, video_url) VALUES
(2, 'ट्राइसाइक्लाजोल 75% WP', 'Tricyclazole 75% WP', 'ब्लास्ट रोग', 'Rice Blast Disease', '6 ग्राम प्रति बीघा',
'1. 6 ग्राम दवा को 15 लीटर पानी में घोलें\n2. बाली आने पर छिड़काव करें\n3. 10 दिन बाद दोबारा करें\n4. खाने से पहले फसल न काटें',
'1. Mix 6g in 15 liters water\n2. Spray at panicle emergence\n3. Repeat after 10 days\n4. Follow pre-harvest interval',
'https://www.youtube.com/embed/dQw4w9WgXcQ'),

(2, 'कार्बेन्डाजिम 50% WP', 'Carbendazim 50% WP', 'शीथ ब्लाइट', 'Sheath Blight', '20 ग्राम प्रति बीघा',
'1. 20 ग्राम को 15 लीटर पानी में मिलाएं\n2. पौधों के नीचे हिस्से पर छिड़काव करें\n3. खड़े पानी में न करें\n4. दस्ताने पहनकर करें',
'1. Mix 20g in 15 liters water\n2. Spray on lower plant parts\n3. Do not spray in standing water\n4. Wear gloves while spraying',
NULL);

-- Products for Vegetables (category_id = 3)
INSERT INTO products (category_id, medicine_name_hi, medicine_name_en, disease_name_hi, disease_name_en, dosage_per_bigha, usage_hi, usage_en, video_url) VALUES
(3, 'इमिडाक्लोप्रिड 17.8% SL', 'Imidacloprid 17.8% SL', 'सफेद मक्खी और थ्रिप्स', 'Whitefly and Thrips', '15 ml प्रति बीघा',
'1. 15 ml दवा को 15 लीटर पानी में घोलें\n2. पत्तियों के नीचे की तरफ छिड़काव करें\n3. 7 दिन के अंतराल पर करें\n4. फसल काटने से 7 दिन पहले बंद करें',
'1. Mix 15ml in 15 liters water\n2. Spray under leaf surfaces\n3. Apply at 7-day intervals\n4. Stop 7 days before harvest',
'https://www.youtube.com/embed/dQw4w9WgXcQ'),

(3, 'डाइमेथोएट 30% EC', 'Dimethoate 30% EC', 'माहू और जैसिड', 'Aphid and Jassid', '20 ml प्रति बीघा',
'1. 20 ml को 15 लीटर पानी में मिलाएं\n2. पूरे पौधे पर अच्छी तरह छिड़काव करें\n3. हवा में न करें\n4. बाल्टी से स्प्रे पंप भरें',
'1. Mix 20ml in 15 liters water\n2. Spray thoroughly on entire plant\n3. Do not spray in windy conditions\n4. Fill spray pump from bucket',
NULL);

-- Default Admin User (password: admin123)
INSERT INTO admin_users (username, password_hash) VALUES
('admin', '$2a$10$rOzJqXWuOhA.E/VaXzVlIeA8kGQ8WaINIWQS1F/Pjm.sKsJrGbIui');
