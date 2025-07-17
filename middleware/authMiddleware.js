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

    // Tokenin gəlib-gəlmədiyini yoxlayırıq
    console.log('Backend - authenticateToken: Gələn Token:', token ? 'Bəli' : 'Xeyr');

    if (token == null) {
        console.log('Backend - authenticateToken: Token boşdur (401 səhv).');
        return res.status(401).json({ message: 'Giriş tokeni təmin edilməyib.' });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            // Tokenin vaxtı bitib, etibarsızdır və s.
            console.error('Backend - authenticateToken: Token yoxlanışı xətası (403 səhv):', err.message);
            return res.status(403).json({ message: 'Token etibarsızdır və ya vaxtı bitib.' });
        }
        req.user = user; // İstifadəçi məlumatlarını sorğu obyektinə əlavə et
        console.log('Backend - authenticateToken: Token uğurla yoxlandı. İstifadəçi məlumatı:', user); // Tam istifadəçi obyektini göstər
        next();
    });
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Tələb olunan rolları və cari istifadəçi rolunu yoxlayırıq
        console.log('Backend - authorizeRoles: Tələb olunan rollar:', roles);
        console.log('Backend - authorizeRoles: Cari istifadəçi rolu:', req.user ? req.user.role : 'req.user obyektində rol yoxdur');

        if (!req.user || !req.user.role) {
            console.log('Backend - authorizeRoles: req.user və ya req.user.role boşdur (403 səhv).');
            return res.status(403).json({ message: 'Rola icazə yoxdur.' });
        }
        if (!roles.includes(req.user.role)) {
            console.log('Backend - authorizeRoles: Rol uyğun deyil (403 səhv). Tələb olunan:', roles, 'Cari:', req.user.role);
            return res.status(403).json({ message: 'Bu əməliyyat üçün icazəniz yoxdur.' });
        }
        console.log('Backend - authorizeRoles: Rol doğrulandı. Davam edilir.');
        next();
    };
};