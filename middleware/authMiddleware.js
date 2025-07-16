
// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
    console.error('Kritik Xəta: ACCESS_TOKEN_SECRET mühit dəyişənlərində təyin edilməyib. Kimlik doğrulama middleware işləməyəcək.');
}

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN formatını ayır

    if (token == null) {
        return res.status(401).json({ message: 'Giriş tokeni təmin edilməyib.' });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            // Tokenin vaxtı bitib, etibarsızdır və s.
            return res.status(403).json({ message: 'Token etibarsızdır və ya vaxtı bitib.' });
        }
        req.user = user; // İstifadəçi məlumatlarını sorğu obyektinə əlavə et
        next();
    });
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Rola icazə yoxdur.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Bu əməliyyat üçün icazəniz yoxdur.' });
        }
        next();
    };
};