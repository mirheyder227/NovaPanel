import { getDb } from '../database/db.js';

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
        const imageUrl = req.file ? req.file.path : null;

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
        let newImageUrl = existingProduct.imageUrl;

        if (req.file) {
            newImageUrl = req.file.path;
            // Cloudinary-dən köhnə şəkli silmək üçün API çağırışı burada olmalıdır.
        } else if (req.body.clearImage === 'true') {
            // Şəkli təmizləmək üçün Cloudinary-dən silmək üçün API çağırışı burada olmalıdır.
            newImageUrl = null;
        }

        if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
        if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
        if (price !== undefined) { updateFields.push('price = ?'); updateValues.push(parseFloat(price)); }
        if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
        
        updateFields.push('imageUrl = ?');
        updateValues.push(newImageUrl);

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(id);

        const result = await db.run(query, updateValues);

        if (result.changes === 0) {
            return res.status(200).json({ message: 'Product found, but no changes were applied.' });
        }

        res.status(200).json({ message: 'Product updated successfully', product: { id, name, description, price, category, imageUrl: newImageUrl } });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error updating product.' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDb();

        const product = await db.get('SELECT imageUrl FROM products WHERE id = ?', [id]);

        const result = await db.run('DELETE FROM products WHERE id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Şəkli Cloudinary-dən silmək üçün API çağırışı burada olmalıdır.
        // if (product && product.imageUrl) {
        //     const publicId = extractPublicIdFromUrl(product.imageUrl);
        //     await cloudinary.uploader.destroy(publicId);
        // }

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
