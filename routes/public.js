const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/banner
router.get('/banner', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM banners WHERE is_active = 1 LIMIT 1');
        if (!rows.length) return res.json({ success: true, data: null });
        res.json({ success: true, data: rows[0] });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/categories
router.get('/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY id ASC');
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/products?category_id=
router.get('/products', async (req, res) => {
    try {
        const { category_id } = req.query;
        let query = `SELECT p.id, p.category_id, p.medicine_name_hi, p.medicine_name_en,
                     p.company_name, p.package_qty, p.package_unit,
                     p.disease_name_hi, p.disease_name_en, p.dosage_per_bigha,
                     p.price, p.show_price, p.show_quantity,
                     p.product_image, p.video_type, p.video_url,
                     p.certification_images,
                     c.name_hi as category_name_hi, c.name_en as category_name_en
                     FROM products p
                     JOIN categories c ON p.category_id = c.id
                     WHERE p.is_active = 1`;
        let params = [];
        if (category_id) { query += ' AND p.category_id = ?'; params.push(category_id); }
        query += ' ORDER BY p.id ASC';
        const [rows] = await db.query(query, params);
        rows.forEach(p => {
            if (p.certification_images) {
                try { p.certification_images = JSON.parse(p.certification_images); }
                catch { p.certification_images = []; }
            } else { p.certification_images = []; }
        });
        res.json({ success: true, data: rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/products/:id
router.get('/products/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.*, c.name_hi as category_name_hi, c.name_en as category_name_en
             FROM products p
             JOIN categories c ON p.category_id = c.id
             WHERE p.id = ? AND p.is_active = 1`,
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found' });
        const product = rows[0];
        if (product.certification_images) {
            try { product.certification_images = JSON.parse(product.certification_images); }
            catch { product.certification_images = []; }
        } else { product.certification_images = []; }
        res.json({ success: true, data: product });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ============================================================
// POST /api/orders — Multi-product cart order
// Body: { mobile_number, address, cart_items: [{ product_id, quantity, price }] }
// cart_items is REQUIRED. product_id is NOT required for cart orders.
// ============================================================
router.post('/orders', async (req, res) => {
    const conn = await db.getConnection();
    try {
        // Accept cart_items (primary) or items (backward compat)
        let { mobile_number, address, cart_items, items } = req.body;
        const orderItems = cart_items || items;

        // --- Validate mobile_number ---
        if (!mobile_number || !String(mobile_number).trim()) {
            return res.status(400).json({ success: false, message: 'mobile_number is required. | मोबाइल नंबर जरूरी है।' });
        }
        if (!/^[6-9]\d{9}$/.test(String(mobile_number).trim())) {
            return res.status(400).json({ success: false, message: 'Invalid mobile number. | सही 10 अंक का नंबर डालें।' });
        }

        // --- Validate address ---
        if (!address || !String(address).trim()) {
            return res.status(400).json({ success: false, message: 'address is required. | पता जरूरी है।' });
        }

        // --- Validate cart_items ---
        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'cart_items is required and must be a non-empty array. | cart_items जरूरी है और खाली नहीं होनी चाहिए।' });
        }

        await conn.beginTransaction();

        // 1. Create ONE order record
        const [orderResult] = await conn.query(
            'INSERT INTO orders (mobile_number, address) VALUES (?, ?)',
            [String(mobile_number).trim(), String(address).trim()]
        );
        const orderId = orderResult.insertId;

        // 2. Insert ALL cart items into order_items table
        for (const item of orderItems) {
            const pid = parseInt(item.product_id);
            if (!pid) continue; // skip malformed items
            const qty = Math.max(1, parseInt(item.quantity) || 1);
            const price = (item.price !== undefined && item.price !== null) ? parseFloat(item.price) : null;
            await conn.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, pid, qty, price]
            );
        }

        // 3. Commit the transaction
        await conn.commit();

        res.status(201).json({
            success: true,
            message: 'ऑर्डर सफलतापूर्वक हो गया! | Order placed successfully!',
            order_id: orderId
        });
    } catch (err) {
        await conn.rollback();
        console.error('Order error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
