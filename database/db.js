
// server/database/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

let db;

export const initializeDb = async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dbPath = path.join(__dirname, 'ecommerce.db');

    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        console.log('✅ SQLite database bağlantısı uğurlu.');

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user'
            );

            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                description TEXT,
                category TEXT,
                imageUrl TEXT,  
                stock INTEGER DEFAULT 0  
            );

            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT,
                genre TEXT
            );
        `);
        console.log('✅ Bütün cədvəllər yoxlandı və ya yaradıldı.');

        const adminEmail = 'admin@site.com';
        const adminUsername = 'admin';
        const adminExists = await db.get('SELECT id FROM users WHERE email = ?', adminEmail);
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.run(
                'INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)',
                [adminEmail, adminUsername, hashedPassword, 'admin']
            );
            console.log('💡 Admin istifadəçisi yaradıldı: admin@site.com / admin123 / username: admin');
        }

    } catch (error) {
        console.error('❌ SQLite database bağlantısı və ya cədvəl yaratma xətası:', error);
        process.exit(1);
    }
};

export const getDb = () => {
    if (!db) {
        throw new Error('Verilənlər bazası başladılmayıb. Əvvəlcə initializeDb funksiyasını çağırın.');
    }
    return db;
};
