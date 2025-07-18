// server/controllers/adminController.js
import { getDb } from '../database/db.js';

export const getDashboardStats = async (req, res) => {
    try {
        const db = getDb();
        
        const usersCountResult = await db.get('SELECT COUNT(*) as count FROM users');
        const usersCount = usersCountResult ? usersCountResult.count : 0;

        const productsCountResult = await db.get('SELECT COUNT(*) as count FROM products');
        const productsCount = productsCountResult ? productsCountResult.count : 0;

        // Bu hissəni sifarişlər cədvəlindən məlumat çəkərək doldurmalısınız
        // Gözləyən (pending) sifarişlərin sayını çəkin
        const pendingOrdersCountResult = await db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
        const pendingOrdersCount = pendingOrdersCountResult ? pendingOrdersCountResult.count : 0;

        res.json({ usersCount, productsCount, pendingOrdersCount });
    } catch (error) {
        console.error('Dashboard statistikasını gətirərkən server xətası:', error);
        res.status(500).json({ message: 'Statistika gətirilərkən server xətası baş verdi.' });
    }
};

export const getRecentActivities = async (req, res) => {
    // Real tətbiqdə bu fəaliyyətlər verilənlər bazasından gətirilməlidir.
    const mockActivities = [
        { id: 1, type: 'user_registered', description: 'Yeni istifadəçi qeydiyyatdan keçdi: user1@example.com', date: '2025-06-27' },
        { id: 2, type: 'product_added', description: 'Yeni məhsul əlavə edildi: Gaming Monitor', date: '2025-06-26' },
        { id: 3, type: 'order_placed', description: 'Yeni sifariş verildi: #2025001', date: '2025-06-25' },
        { id: 4, type: 'login_success', description: 'Admin daxil oldu', date: '2025-06-27' },
        { id: 5, type: 'product_added', description: 'Yeni məhsul əlavə edildi: Wireless Earbuds', date: '2025-06-24' },
    ];
    res.json(mockActivities);
};