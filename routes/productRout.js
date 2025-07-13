import express from 'express';
import {
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getSearchResults,
    getSingleProduct
} from '../controllers/productController.js';
import { uploadProduct } from '../middleware/uploadCloudinary.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/products/:id", getSingleProduct);
router.get('/products', getAllProducts);
router.get('/products/search', getSearchResults);

router.post(
    '/products',
    authenticateToken,
    authorizeRoles('admin'),
    uploadProduct.single('productImage'),
    addProduct
);

router.put(
    '/products/:id',
    authenticateToken,
    authorizeRoles('admin'),
    uploadProduct.single('productImage'),
    updateProduct
);

router.delete(
    '/products/:id',
    authenticateToken,
    authorizeRoles('admin'),
    deleteProduct
);

export default router;