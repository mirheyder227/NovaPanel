import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'mySecretKey';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.warn('DEBUG: authenticateToken: Token tələb olunur (401).');
        return res.status(401).json({ message: 'Token tələb olunur.' });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error('DEBUG: authenticateToken: Token doğrulanarkən xəta (403):', err.message);
            return res.status(403).json({ message: 'Token etibarsızdır və ya müddəti bitmişdir.' });
        }
        req.user = user;
        next();
    });
};

export const authorizeRoles = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            console.warn('DEBUG: authorizeRoles: İstifadəçi rolu tapılmadı (403).');
            return res.status(403).json({ message: 'Yetərli icazəniz yoxdur. İstifadəçi rolu tapılmadı.' });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            console.warn(`DEBUG: authorizeRoles: "${req.user.role}" roluna sahib istifadəçi icazəsizdir (403).`);
            return res.status(403).json({ message: 'Yetərli icazəniz yoxdur. Bu resursa giriş üçün admin hüquqları tələb olunur.' });
        }
        next();
    };
};
