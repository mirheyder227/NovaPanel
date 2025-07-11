// server/routes/productRout.js
import express from 'express';
import {
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getSearchResults ,
    getSingleProduct
} from '../controllers/productController.js';
import upload from '../middleware/upload.js'; 

const router = express.Router();
router.get("/products/:id", getSingleProduct);
router.get('/products', getAllProducts);
router.post('/products', upload.single('image'), addProduct);  
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products/search', getSearchResults); 

export default router;
