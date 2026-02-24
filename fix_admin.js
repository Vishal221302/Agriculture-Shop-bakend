const bcrypt = require('bcryptjs');
const db = require('./config/db');
require('dotenv').config();

async function fixAdminPassword() {
    const hash = await bcrypt.hash('admin123', 10);
    console.log('Generated hash:', hash);

    // Verify it works
    const ok = await bcrypt.compare('admin123', hash);
    console.log('Verification:', ok);

    const [existing] = await db.query("SELECT * FROM admin_users WHERE username = 'admin'");

    if (existing.length === 0) {
        await db.query(
            "INSERT INTO admin_users (username, password_hash) VALUES ('admin', ?)",
            [hash]
        );
        console.log('Admin user created');
    } else {
        await db.query(
            "UPDATE admin_users SET password_hash = ? WHERE username = 'admin'",
            [hash]
        );
        console.log('Admin password updated');
    }

    const [rows] = await db.query("SELECT id, username FROM admin_users");
    console.log('Admin users:', rows);
    process.exit(0);
}

fixAdminPassword().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
