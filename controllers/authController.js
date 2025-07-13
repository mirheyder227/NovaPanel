
 
// server/controllers/authController.js
import { getDb } from '../database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'mySecretKey';

export const signup = async (req, res) => {
  const { email, password } = req.body;

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
    res.status(500).json({ message: 'Server xətası' });
  }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

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
            { userId: user.id, email: user.email, role: userRole },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '500h' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, role: userRole },
        });

    } catch (error) {
        res.status(500).json({ message: 'Server xətası' });
    }
};

export const logout = (req, res) => {
    res.json({ message: 'Çıxış edildi. Token frontend-dən silinməlidir.' });
};