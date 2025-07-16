// server/routes/productRout.js
import express from 'express';
import { getDb } from '../database/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getSingleProduct,
    getSearchResults // Məhsul axtarışı controllerini import edirik
} from '../controllers/productController.js'; // Bütün controller funksiyalarını import edirik

const router = express.Router();

// Məhsul axtarışı marşrutu - DİQQƏT: Bu marşrut digər '/:id' marşrutlarından əvvəl gəlməlidir!
router.get('/search', getSearchResults); 

// Bütün məhsulları gətir
router.get('/', getAllProducts);

// Yeni məhsul əlavə et (yalnız admin)
router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin'),
    addProduct
);

// Məhsulu ID-yə görə gətir
router.get('/:id', getSingleProduct);

// Məhsulu yenilə (yalnız admin)
router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    updateProduct
);

// Məhsulu sil (yalnız admin)
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles('admin'),
    deleteProduct
);

export default router;
