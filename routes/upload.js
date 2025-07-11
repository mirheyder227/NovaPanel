// routes/productRoutes.js
import express from 'express';
import { addProduct, getProducts } from '../controllers/productController.js';
import { uploadProduct } from '../controllers/uploadController.js'; // uploadProduct import edin
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Məhsul əlavə etmək üçün marşrut (Adminlər üçün, şəkil yükləmə ilə)
router.post(
    '/products',
    authenticateToken,
    authorizeRoles('admin'),
    uploadProduct.single('productImage'), // 'productImage' frontend-dən gələn form sahəsinin adıdır
    addProduct // Multer faylı yüklədikdən sonra addProduct çağırılacaq
);

// Bütün məhsulları çəkmək üçün marşrut
router.get('/products', getProducts);

export default router;