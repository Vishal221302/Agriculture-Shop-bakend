const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ========================
// Middleware
// ========================
app.use(cors({
    origin: ['https://kisan-krisi-kendra.vercel.app', 'https://kisan-krishi-kendra-admin.vercel.app', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================
// Routes
// ========================
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Agriculture Shop API is running 🌾', time: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`\n🌾 Agriculture Shop API running at http://localhost:${PORT}`);
    console.log(`📋 API Docs:\n`);
    console.log(`  Public APIs:`);
    console.log(`    GET  /api/categories`);
    console.log(`    GET  /api/products?category_id=1`);
    console.log(`    GET  /api/products/:id`);
    console.log(`    POST /api/orders`);
    console.log(`\n  Admin APIs (require JWT):`);
    console.log(`    POST /api/admin/login`);
    console.log(`    GET/POST/PUT/DELETE /api/admin/categories`);
    console.log(`    GET/POST/PUT/DELETE /api/admin/products`);
    console.log(`    GET /api/admin/orders`);
    console.log(`    PUT /api/admin/orders/:id/status`);
});
