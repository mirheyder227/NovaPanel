// server/controllers/productController.js
import { getDb } from '../database/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_BASE_DIR = path.join(__dirname, '../../public/uploads');

export const getAllProducts = async (req, res) => {
    try {
        const db = getDb();
        const products = await db.all('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

export const addProduct = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

        if (!name || !price || !category) {
            return res.status(400).json({ message: 'Product name, price, and category are required.' });
        }

        const db = getDb();
        const result = await db.run(
            'INSERT INTO products (name, description, price, category, imageUrl) VALUES (?, ?, ?, ?, ?)',
            [name, description, parseFloat(price), category, imageUrl]
        );

        res.status(201).json({
            message: 'Product added successfully',
            productId: result.lastID,
            product: { id: result.lastID, name, description, price, category, imageUrl }
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Server error adding product' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category } = req.body;
        const db = getDb();

        const existingProduct = await db.get('SELECT imageUrl FROM products WHERE id = ?', [id]);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        let updateFields = [];
        let updateValues = [];
        let newImageUrl = existingProduct.imageUrl; // Default to existing image

        // Handle image upload
        if (req.file) {
            newImageUrl = `/uploads/products/${req.file.filename}`;
            // Delete old image if a new one is uploaded
            if (existingProduct.imageUrl) {
                const oldImagePath = path.join(UPLOADS_BASE_DIR, existingProduct.imageUrl.replace('/uploads/', ''));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log(`Old image deleted: ${oldImagePath}`);
                }
            }
        } else if (req.body.clearImage === 'true') { // Add a flag from frontend to explicitly clear image
            if (existingProduct.imageUrl) {
                const oldImagePath = path.join(UPLOADS_BASE_DIR, existingProduct.imageUrl.replace('/uploads/', ''));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log(`Image cleared: ${oldImagePath}`);
                }
            }
            newImageUrl = null;
        }

        if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
        if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
        // Ensure price is parsed as float before comparison/update
        if (price !== undefined) { updateFields.push('price = ?'); updateValues.push(parseFloat(price)); }
        if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
        
        // Always include imageUrl in update fields, as it might have changed or been cleared
        updateFields.push('imageUrl = ?');
        updateValues.push(newImageUrl);

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(id); // Add product ID as the last value for the WHERE clause

        const result = await db.run(query, updateValues);

        if (result.changes === 0) {
            return res.status(200).json({ message: 'Product found, but no changes were applied (data was identical or specific fields were not provided for change).' });
        }

        res.status(200).json({ message: 'Product updated successfully', product: { id, name, description, price, category, imageUrl: newImageUrl } });

    } catch (error) {
        console.error('Error updating product:', error);
        // If there's an error after a file was uploaded, you might want to clean up the newly uploaded file
        if (req.file) {
            const uploadedFilePath = path.join(UPLOADS_BASE_DIR, req.file.filename);
            if (fs.existsSync(uploadedFilePath)) {
                fs.unlinkSync(uploadedFilePath);
                console.warn(`Cleaned up newly uploaded file due to update error: ${uploadedFilePath}`);
            }
        }
        res.status(500).json({ message: 'Server error updating product.' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDb();

        // Get product to delete its image
        const product = await db.get('SELECT imageUrl FROM products WHERE id = ?', [id]);

        const result = await db.run('DELETE FROM products WHERE id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Delete associated image file
        if (product && product.imageUrl) {
            const imagePath = path.join(UPLOADS_BASE_DIR, product.imageUrl.replace('/uploads/', ''));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`Deleted product image: ${imagePath}`);
            }
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error deleting product.' });
    }
};
export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error fetching product.' });
  }
};



export const getSearchResults = async (req, res) => {
    try {
        const { q } = req.query;
        const db = getDb();
        const products = await db.all(
            `SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR category LIKE ?`,
            [`%${q}%`, `%${q}%`, `%${q}%`]
        );
        res.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Server error searching products.' });
    }
};