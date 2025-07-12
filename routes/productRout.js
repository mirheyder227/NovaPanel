import express from 'express';
import {
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getSearchResults,
    getSingleProduct
} from '../controllers/productController.js';
import { uploadProduct } from '../controllers/uploadController.js'; // uploadProduct Cloudinary konfiqurasiyası ilə

const router = express.Router();

router.get("/products/:id", getSingleProduct);
router.get('/products', getAllProducts);
router.post('/products', uploadProduct.single('productImage'), addProduct);
router.put('/products/:id', uploadProduct.single('productImage'), updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products/search', getSearchResults);

export default router;
