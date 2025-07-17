import express from 'express';
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  getSearchResults
} from '../controllers/productController.js';

import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { uploadProduct } from '../middleware/uploadCloudinary.js';

const router = express.Router();

// Məhsul axtarışı
router.get('/search', getSearchResults);

// Bütün məhsulları gətir
router.get('/', getAllProducts);

// Yeni məhsul əlavə et - Multer şəkil yükləmə middleware ilə
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  uploadProduct.single('image'), // <== Buradakı 'image' sahəsi frontend ilə uyğun olmalıdır
  addProduct
);

// ID-yə görə məhsul gətir
router.get('/:id', getSingleProduct);

// Məhsulu yenilə
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  uploadProduct.single('image'),
  updateProduct
);

// Məhsulu sil
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  deleteProduct
);

export default router;
