// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'mySecretKey';

/**
 * JWT token-i doğrulayan middleware.
 * @param {Object} req - Express request obyekti
 * @param {Object} res - Express response obyekti
 * @param {Function} next - Növbəti middleware-ə keçmək üçün funksiya
 */
export const authenticateToken = (req, res, next) => {
    // Header-dən Authorization alanını götürürük (Bearer TOKEN formatında)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Tokeni ayırırıq

    // Əgər token yoxdursa, 401 Unauthorized cavabı qaytarırıq
    if (token == null) {
        console.warn('DEBUG: authenticateToken: Token tələb olunur (401).');
        return res.status(401).json({ message: 'Token tələb olunur.' });
    }

     jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            // Token etibarsızdırsa və ya müddəti bitibsə, 403 Forbidden cavabı qaytarırıq
            console.error('DEBUG: authenticateToken: Token doğrulanarkən xəta (403):', err.message);
            return res.status(403).json({ message: 'Token etibarsızdır və ya müddəti bitmişdir.' });
        }
         req.user = user;
        next(); // Növbəti middleware-ə keçirik
    });
};

/**
 * İstifadəçinin rolunu yoxlayan middleware.
 * @param {string|Array<string>} roles - Girişə icazə verilən rollar (məsələn, 'admin' və ya ['admin', 'editor'])
 * @returns {Function} Express middleware funksiyası
 */
export const authorizeRoles = (roles = []) => {
    // Tək rol string kimi gələrsə onu massivə çeviririk
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // req.user obyekti yoxdursa və ya istifadəçi rolu təyin edilməyibsə
        if (!req.user || !req.user.role) {
            console.warn('DEBUG: authorizeRoles: İstifadəçi rolu tapılmadı (403).');
            return res.status(403).json({ message: 'Yetərli icazəniz yoxdur. İstifadəçi rolu tapılmadı.' });
        }

        // Əgər icazə verilən rollar siyahısı boş deyilsə və istifadəçinin rolu o siyahıda yoxdursa
        if (roles.length && !roles.includes(req.user.role)) {
            console.warn(`DEBUG: authorizeRoles: "${req.user.role}" roluna sahib istifadəçi icazəsizdir (403).`);
            return res.status(403).json({ message: 'Yetərli icazəniz yoxdur. Bu resursa giriş üçün admin hüquqları tələb olunur.' });
        }
        next(); // Növbəti middleware-ə keçirik
    };
};