/**
 * run_migration.js
 * Run this ONCE to migrate the orders table for cart support.
 * Usage: node run_migration.js
 */
const db = require('./config/db');

async function migrate() {
    const conn = await db.getConnection();
    try {
        console.log('🔄 Starting database migration...\n');

        // Step 1: Drop product_id and quantity from orders (if they exist)
        console.log('Step 1: Removing product_id and quantity from orders...');
        try {
            await conn.query('ALTER TABLE orders DROP FOREIGN KEY IF EXISTS orders_ibfk_1');
        } catch (e) { /* ignore if no FK */ }

        // Try dropping product_id
        try {
            await conn.query('ALTER TABLE orders DROP COLUMN product_id');
            console.log('  ✅ Dropped product_id from orders');
        } catch (e) {
            if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log('  ⏭  product_id already removed');
            } else { console.log('  ℹ  product_id:', e.message); }
        }

        // Try dropping quantity
        try {
            await conn.query('ALTER TABLE orders DROP COLUMN quantity');
            console.log('  ✅ Dropped quantity from orders');
        } catch (e) {
            if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log('  ⏭  quantity already removed');
            } else { console.log('  ℹ  quantity:', e.message); }
        }

        // Step 2: Create order_items table
        console.log('\nStep 2: Creating order_items table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                order_id    INT NOT NULL,
                product_id  INT NOT NULL,
                quantity    INT NOT NULL DEFAULT 1,
                price       DECIMAL(10,2) DEFAULT NULL,
                FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('  ✅ order_items table ready');

        // Step 3: Show final schema
        console.log('\nStep 3: Verifying tables...');
        const [orderCols] = await conn.query('SHOW COLUMNS FROM orders');
        console.log('\nOrders table columns:');
        orderCols.forEach(c => console.log(`  - ${c.Field} (${c.Type}) ${c.Null === 'NO' ? 'NOT NULL' : 'NULL'}`));

        const [itemCols] = await conn.query('SHOW COLUMNS FROM order_items');
        console.log('\norder_items table columns:');
        itemCols.forEach(c => console.log(`  - ${c.Field} (${c.Type}) ${c.Null === 'NO' ? 'NOT NULL' : 'NULL'}`));

        console.log('\n✅ Migration complete! Cart ordering should now work.\n');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        conn.release();
        process.exit(0);
    }
}

migrate();
