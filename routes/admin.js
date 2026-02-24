const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/auth');
require('dotenv').config();

// ==========================
// Multer Config
// ==========================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB (for videos)
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|pdf|mp4|webm|mov/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        if (ext) cb(null, true);
        else cb(new Error('Only images, PDFs and video files are allowed'));
    }
});

// ==========================
// ADMIN AUTH
// ==========================
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ success: false, message: 'Username and password required' });

        const [rows] = await db.query('SELECT * FROM admin_users WHERE username = ?', [username]);
        if (!rows.length)
            return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, rows[0].password_hash);
        if (!isMatch)
            return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: rows[0].id, username: rows[0].username },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ success: true, token, username: rows[0].username });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==========================
// BANNERS (Protected) — multiple banners
// ==========================

// List all banners
router.get('/banners', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM banners ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Create new banner
router.post('/banners', authenticateAdmin, upload.fields([
    { name: 'banner_image', maxCount: 1 },
    { name: 'banner_video', maxCount: 1 }
]), async (req, res) => {
    try {
        const { banner_type, title_hi, title_en, description_hi, description_en, show_bg, bg_color, video_url } = req.body;
        const bannerImage = req.files?.banner_image?.[0]?.filename || null;
        const bannerVideo = req.files?.banner_video?.[0]?.filename || null;
        const finalVideo = bannerVideo || video_url || null;
        const showBgVal = show_bg === 'true' || show_bg === '1' ? 1 : 0;
        await db.query(
            `INSERT INTO banners (banner_type, banner_image, video_url, title_hi, title_en, description_hi, description_en, show_bg, bg_color, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [banner_type || 'image', bannerImage, finalVideo,
            title_hi || '', title_en || '', description_hi || '', description_en || '',
                showBgVal, bg_color || '#14532d']
        );
        res.json({ success: true, message: 'Banner created' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Edit banner
router.put('/banners/:id', authenticateAdmin, upload.fields([
    { name: 'banner_image', maxCount: 1 },
    { name: 'banner_video', maxCount: 1 }
]), async (req, res) => {
    try {
        const { banner_type, title_hi, title_en, description_hi, description_en, show_bg, bg_color, video_url } = req.body;
        const bannerImage = req.files?.banner_image?.[0]?.filename || null;
        const bannerVideo = req.files?.banner_video?.[0]?.filename || null;
        const fields = [];
        const values = [];
        if (banner_type) { fields.push('banner_type = ?'); values.push(banner_type); }
        if (title_hi !== undefined) { fields.push('title_hi = ?'); values.push(title_hi); }
        if (title_en !== undefined) { fields.push('title_en = ?'); values.push(title_en); }
        if (description_hi !== undefined) { fields.push('description_hi = ?'); values.push(description_hi); }
        if (description_en !== undefined) { fields.push('description_en = ?'); values.push(description_en); }
        if (show_bg !== undefined) { fields.push('show_bg = ?'); values.push(show_bg === 'true' || show_bg === '1' ? 1 : 0); }
        if (bg_color) { fields.push('bg_color = ?'); values.push(bg_color); }
        if (bannerImage) { fields.push('banner_image = ?'); values.push(bannerImage); }
        if (bannerVideo) { fields.push('video_url = ?'); values.push(bannerVideo); }
        else if (video_url !== undefined) { fields.push('video_url = ?'); values.push(video_url); }
        if (fields.length) {
            values.push(req.params.id);
            await db.query(`UPDATE banners SET ${fields.join(', ')} WHERE id = ?`, values);
        }
        res.json({ success: true, message: 'Banner updated' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Activate a banner (deactivates all others)
router.put('/banners/:id/activate', authenticateAdmin, async (req, res) => {
    try {
        const { is_active } = req.body;
        if (is_active == 1) {
            await db.query('UPDATE banners SET is_active = 0');
            await db.query('UPDATE banners SET is_active = 1 WHERE id = ?', [req.params.id]);
        } else {
            await db.query('UPDATE banners SET is_active = 0 WHERE id = ?', [req.params.id]);
        }
        res.json({ success: true, message: 'Banner activation updated' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Delete banner
router.delete('/banners/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Banner deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Legacy single-banner endpoint (kept for backward compat)
router.get('/banner', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM banners WHERE is_active = 1 LIMIT 1');
        res.json({ success: true, data: rows[0] || null });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==========================
// CATEGORIES (Protected)
// ==========================
router.get('/categories', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY id ASC');
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/categories', authenticateAdmin, upload.single('category_image'), async (req, res) => {
    try {
        const { name_hi, name_en, icon } = req.body;
        if (!name_hi || !name_en)
            return res.status(400).json({ success: false, message: 'Hindi and English names are required' });
        const categoryImage = req.file ? req.file.filename : null;
        const [result] = await db.query(
            'INSERT INTO categories (name_hi, name_en, icon, category_image) VALUES (?, ?, ?, ?)',
            [name_hi, name_en, icon || '🌾', categoryImage]
        );
        res.status(201).json({ success: true, message: 'Category created', id: result.insertId });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/categories/:id', authenticateAdmin, upload.single('category_image'), async (req, res) => {
    try {
        const { name_hi, name_en, icon } = req.body;
        if (!name_hi || !name_en)
            return res.status(400).json({ success: false, message: 'Hindi and English names are required' });
        const categoryImage = req.file ? req.file.filename : null;
        const fields = ['name_hi = ?', 'name_en = ?', 'icon = ?'];
        const values = [name_hi, name_en, icon || '🌾'];
        if (categoryImage) { fields.push('category_image = ?'); values.push(categoryImage); }
        values.push(req.params.id);
        await db.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);
        res.json({ success: true, message: 'Category updated' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/categories/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Category deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==========================
// PRODUCTS (Protected)
// ==========================
router.get('/products', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.*, c.name_hi as category_name_hi, c.name_en as category_name_en
             FROM products p JOIN categories c ON p.category_id = c.id
             ORDER BY p.id DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/products', authenticateAdmin, upload.fields([
    { name: 'product_image', maxCount: 1 },
    { name: 'certification_images', maxCount: 5 },
    { name: 'video_file', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            category_id, medicine_name_hi, medicine_name_en, company_name,
            disease_name_hi, disease_name_en, dosage_per_bigha,
            price, show_price, show_quantity, package_qty, package_unit,
            usage_hi, usage_en, video_url, video_type
        } = req.body;

        if (!category_id || !medicine_name_hi || !medicine_name_en)
            return res.status(400).json({ success: false, message: 'Required fields missing' });

        const productImage = req.files?.product_image?.[0]?.filename || null;
        const certImages = req.files?.certification_images?.map(f => f.filename) || [];
        const videoFile = req.files?.video_file?.[0]?.filename || null;
        const finalVideoUrl = video_type === 'upload' ? (videoFile || null) : (video_url || null);
        const priceVal = price !== undefined && price !== '' ? parseFloat(price) : null;
        const showPriceVal = show_price === '1' || show_price === 1 ? 1 : 0;
        const showQtyVal = show_quantity === '1' || show_quantity === 1 ? 1 : 0;
        const pkgQtyVal = package_qty !== undefined && package_qty !== '' ? parseFloat(package_qty) : null;
        const pkgUnitVal = package_unit || 'ml';

        const [result] = await db.query(
            `INSERT INTO products
             (category_id, medicine_name_hi, medicine_name_en, company_name, disease_name_hi, disease_name_en,
              dosage_per_bigha, price, show_price, show_quantity, package_qty, package_unit,
              usage_hi, usage_en, product_image, video_type, video_url, certification_images)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [category_id, medicine_name_hi, medicine_name_en, company_name || null, disease_name_hi || '', disease_name_en || '',
                dosage_per_bigha || '', priceVal, showPriceVal, showQtyVal, pkgQtyVal, pkgUnitVal,
                usage_hi || '', usage_en || '', productImage,
                video_type || 'youtube', finalVideoUrl,
                certImages.length ? JSON.stringify(certImages) : null]
        );
        res.status(201).json({ success: true, message: 'Product created', id: result.insertId });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/products/:id', authenticateAdmin, upload.fields([
    { name: 'product_image', maxCount: 1 },
    { name: 'certification_images', maxCount: 5 },
    { name: 'video_file', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            category_id, medicine_name_hi, medicine_name_en, company_name,
            disease_name_hi, disease_name_en, dosage_per_bigha,
            price, show_price, show_quantity, package_qty, package_unit,
            usage_hi, usage_en, video_url, video_type, is_active
        } = req.body;

        const fields = [];
        const values = [];

        if (category_id) { fields.push('category_id = ?'); values.push(category_id); }
        if (medicine_name_hi) { fields.push('medicine_name_hi = ?'); values.push(medicine_name_hi); }
        if (medicine_name_en) { fields.push('medicine_name_en = ?'); values.push(medicine_name_en); }
        if (company_name !== undefined) { fields.push('company_name = ?'); values.push(company_name || null); }
        if (disease_name_hi !== undefined) { fields.push('disease_name_hi = ?'); values.push(disease_name_hi); }
        if (disease_name_en !== undefined) { fields.push('disease_name_en = ?'); values.push(disease_name_en); }
        if (dosage_per_bigha !== undefined) { fields.push('dosage_per_bigha = ?'); values.push(dosage_per_bigha); }
        if (price !== undefined) {
            fields.push('price = ?');
            values.push(price !== '' ? parseFloat(price) : null);
        }
        if (show_price !== undefined) {
            fields.push('show_price = ?');
            values.push(show_price === '1' || show_price === 1 ? 1 : 0);
        }
        if (show_quantity !== undefined) {
            fields.push('show_quantity = ?');
            values.push(show_quantity === '1' || show_quantity === 1 ? 1 : 0);
        }
        if (package_qty !== undefined) {
            fields.push('package_qty = ?');
            values.push(package_qty !== '' ? parseFloat(package_qty) : null);
        }
        if (package_unit !== undefined) { fields.push('package_unit = ?'); values.push(package_unit || 'ml'); }
        if (usage_hi !== undefined) { fields.push('usage_hi = ?'); values.push(usage_hi); }
        if (usage_en !== undefined) { fields.push('usage_en = ?'); values.push(usage_en); }
        if (is_active !== undefined) { fields.push('is_active = ?'); values.push(is_active); }
        if (video_type) { fields.push('video_type = ?'); values.push(video_type); }

        const videoFile = req.files?.video_file?.[0]?.filename || null;
        if (video_type === 'upload' && videoFile) {
            fields.push('video_url = ?'); values.push(videoFile);
        } else if (video_type === 'youtube' && video_url !== undefined) {
            fields.push('video_url = ?'); values.push(video_url);
        }

        if (req.files?.product_image?.[0]) { fields.push('product_image = ?'); values.push(req.files.product_image[0].filename); }
        if (req.files?.certification_images?.length) {
            fields.push('certification_images = ?');
            values.push(JSON.stringify(req.files.certification_images.map(f => f.filename)));
        }

        if (!fields.length) return res.status(400).json({ success: false, message: 'Nothing to update' });

        values.push(req.params.id);
        await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
        res.json({ success: true, message: 'Product updated' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/products/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==========================
// DASHBOARD STATS (Protected)
// ==========================
router.get('/stats', authenticateAdmin, async (req, res) => {
    try {
        const [[{ categories }]] = await db.query('SELECT COUNT(*) as categories FROM categories');
        const [[{ products }]] = await db.query('SELECT COUNT(*) as products FROM products');
        const [[{ orders }]] = await db.query('SELECT COUNT(*) as orders FROM orders');

        // Order status breakdown
        const [statusRows] = await db.query(
            `SELECT order_status, COUNT(*) as cnt FROM orders GROUP BY order_status`
        );
        const statusMap = { pending: 0, confirmed: 0, delivered: 0, cancelled: 0 };
        statusRows.forEach(r => { statusMap[r.order_status] = Number(r.cnt); });

        // Orders per day — last 7 days
        const [dailyRows] = await db.query(
            `SELECT DATE(created_at) as day, COUNT(*) as cnt
             FROM orders
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
             GROUP BY DATE(created_at)
             ORDER BY day ASC`
        );
        // Fill gaps for all 7 days
        const daily = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const found = dailyRows.find(r => (r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day)) === key);
            daily.push({ day: key, cnt: found ? Number(found.cnt) : 0 });
        }

        // Top 5 most-ordered products
        const [topProducts] = await db.query(
            `SELECT p.medicine_name_hi, p.medicine_name_en, SUM(oi.quantity) as total_qty
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             GROUP BY oi.product_id
             ORDER BY total_qty DESC
             LIMIT 5`
        );

        // Revenue (from order_items that have price)
        const [[{ revenue }]] = await db.query(
            `SELECT COALESCE(SUM(price * quantity), 0) as revenue FROM order_items WHERE price IS NOT NULL`
        );

        // Orders last 30 vs prev 30
        const [[{ recent }]] = await db.query(
            `SELECT COUNT(*) as recent FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
        );

        res.json({
            success: true,
            data: {
                categories, products, orders, revenue: Number(revenue), recent: Number(recent),
                statusBreakdown: statusMap, daily, topProducts
            }
        });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==========================
// ORDERS (Protected)
// ==========================
router.get('/orders', authenticateAdmin, async (req, res) => {
    try {
        // Fetch all orders
        const [orders] = await db.query(
            `SELECT id, mobile_number, address, order_status, created_at
             FROM orders ORDER BY created_at DESC`
        );

        if (!orders.length) return res.json({ success: true, data: [] });

        // Fetch all order_items with product details
        const orderIds = orders.map(o => o.id);
        const [items] = await db.query(
            `SELECT oi.order_id, oi.id as item_id, oi.product_id,
                    oi.quantity, oi.price as item_price,
                    p.medicine_name_hi, p.medicine_name_en,
                    p.price as product_price, p.show_price,
                    p.product_image
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})
             ORDER BY oi.order_id, oi.id ASC`,
            orderIds
        );

        // Group items by order
        const itemsByOrder = {};
        items.forEach(item => {
            if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
            itemsByOrder[item.order_id].push(item);
        });

        const data = orders.map(o => ({
            ...o,
            items: itemsByOrder[o.id] || []
        }));

        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/orders/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { order_status } = req.body;
        const valid = ['pending', 'confirmed', 'delivered', 'cancelled'];
        if (!valid.includes(order_status))
            return res.status(400).json({ success: false, message: 'Invalid status' });
        await db.query('UPDATE orders SET order_status = ? WHERE id = ?', [order_status, req.params.id]);
        res.json({ success: true, message: 'Order status updated' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Delete order
router.delete('/orders/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
        await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Order deleted' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
