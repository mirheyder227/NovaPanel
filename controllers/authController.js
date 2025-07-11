import { getDb } from '../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'mySecretKey';

/**
 * Yeni istifadəçinin qeydiyyatdan keçməsi üçün funksiya.
 * @param {Object} req - Express request obyekti
 * @param {Object} res - Express response obyekti
 */
export const signup = async (req, res) => {
  const { email, password } = req.body;

  console.log(`DEBUG: Signup cəhdi - Email: ${email}`);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email və şifrə tələb olunur.' });
  }

  try {
    const db = getDb();
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ message: 'Bu email artıq mövcuddur.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'user']
    );

    // Yeni istifadəçi üçün token yaradılır
    const token = jwt.sign(
      { userId: result.lastID, email, role: 'user' },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '500h' }
    );

    res.status(201).json({
      message: 'İstifadəçi qeydiyyatdan keçdi!',
      token,
      user: { id: result.lastID, email, role: 'user' }
    });

  } catch (error) {
    console.error('DEBUG: Signup xətası:', error.message);
    res.status(500).json({ message: 'Server xətası' });
  }
};


/**
 * Mövcud istifadəçinin daxil olması üçün funksiya.
 * @param {Object} req - Express request obyekti
 * @param {Object} res - Express response obyekti
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    console.log(`DEBUG: Login cəhdi - Email: ${email}`);

    try {
        const db = getDb();
        console.log(`DEBUG: Database-dən istifadəçi axtarılır: ${email}`);

        // db.get metodunu Promise olaraq await edirik
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        console.log('DEBUG: db.get sorğusu tamamlandı.');

        if (!user) {
            console.log('DEBUG: İstifadəçi tapılmadı:', email);
            return res.status(401).json({ message: 'Yanlış email və ya şifrə.' });
        }

        console.log('DEBUG: İstifadəçi tapıldı, şifrə yoxlanılır.');
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            console.log('DEBUG: Şifrə yanlışdır:', email);
            return res.status(401).json({ message: 'Yanlış email və ya şifrə.' });
        }

        console.log('DEBUG: Şifrə düzgündür, JWT token yaradılır.');
        const userRole = user.role || 'user'; // Rol yoxdursa 'user' təyin edirik

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: userRole },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '500h' } // Token 1 saat sonra etibarsız olacaq
        );

        console.log('DEBUG: Uğurlu login! Cavab göndərilir.');
        res.json({
            token,
            user: { id: user.id, email: user.email, role: userRole },
        });

    } catch (error) {
        console.error('DEBUG: Login xətası (ümumi try/catch):', error.message);
        res.status(500).json({ message: 'Server xətası' });
    }
};

/**
 * İstifadəçinin çıxışı üçün funksiya.
 * @param {Object} req - Express request obyekti
 * @param {Object} res - Express response obyekti
 */
export const logout = (req, res) => {
    console.log('DEBUG: Logout cəhdi.');
    res.json({ message: 'Çıxış edildi. Token frontend-dən silinməlidir.' });
};