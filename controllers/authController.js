
// server/controllers/authController.js
import { getDb } from '../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
    console.error('Kritik Xəta: ACCESS_TOKEN_SECRET mühit dəyişənlərində təyin edilməyib.');
    // process.exit(1); // İstehsal mühitində prosesi dayandırmağı düşünün
}

export const signup = async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ message: 'Email, istifadəçi adı və şifrə sahələri tələb olunur.' });
    }

    try {
        const db = getDb();
        
        const existingUserByEmail = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUserByEmail) {
            return res.status(409).json({ message: 'Bu email artıq qeydiyyatdan keçib.' });
        }

        const existingUserByUsername = await db.get('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUserByUsername) {
            return res.status(409).json({ message: 'Bu istifadəçi adı artıq mövcuddur.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run(
            'INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)',
            [email, username, hashedPassword, 'user']
        );

        const token = jwt.sign(
            { userId: result.lastID, email, username, role: 'user' },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '12h' } // Təhlükəsizlik üçün daha qısa müddət
        );

        res.status(201).json({
            message: 'Qeydiyyat uğurla tamamlandı!',
            token,
            user: { id: result.lastID, email, username, role: 'user' }
        });

    } catch (error) {
        console.error('Qeydiyyat xətası:', error);
        res.status(500).json({ message: 'Qeydiyyat zamanı server xətası baş verdi.' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email və şifrə sahələri tələb olunur.' });
    }

    try {
        const db = getDb();
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(401).json({ message: 'Yanlış email və ya şifrə.' });
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(401).json({ message: 'Yanlış email və ya şifrə.' });
        }

        const userRole = user.role || 'user';

        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username, role: userRole },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            message: 'Daxil olundu!',
            token,
            user: { id: user.id, email: user.email, username: user.username, role: userRole },
        });

    } catch (error) {
        console.error('Daxil olma xətası:', error);
        res.status(500).json({ message: 'Daxil olarkən server xətası baş verdi.' });
    }
};

export const logout = (req, res) => {
    res.json({ message: 'Uğurla çıxış edildi. Token client tərəfindən silinməlidir.' });
};
